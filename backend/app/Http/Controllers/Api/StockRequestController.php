<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStockRequest;
use App\Http\Requests\UpdateRequestStatusRequest;
use App\Http\Resources\StockRequestResource;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockRequestController extends Controller
{
    // Allowed status changes: current status => statuses it can move to
    private const TRANSITIONS = [
        'pending' => ['approved', 'rejected'],
        'approved' => ['completed', 'rejected'],
    ];

    public function index(Request $request)
    {
        $user = $request->user();

        $requests = StockRequest::with(['medicine', 'user', 'reviewer'])
            // staff only see their own requests; admins see all
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->search, function ($q, $search) {
                $q->whereHas('medicine', fn ($m) => $m->where('name', 'like', '%' . $search . '%'));
            })
            ->latest()
            ->paginate(10);

        return StockRequestResource::collection($requests);
    }

    public function store(StoreStockRequest $request)
    {
        $medicine = Medicine::withStock()->findOrFail($request->medicine_id);
        $available = (int) $medicine->total_stock;

        if ($request->quantity > $available) {
            throw ValidationException::withMessages([
                'quantity' => ['Only ' . $available . ' ' . $medicine->unit . '(s) available.'],
            ]);
        }

        $stockRequest = StockRequest::create([
            'user_id' => $request->user()->id,
            'medicine_id' => $medicine->id,
            'quantity' => $request->quantity,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        return new StockRequestResource($stockRequest->load(['medicine', 'user', 'reviewer']));
    }

    public function show(Request $request, StockRequest $stockRequest)
    {
        $this->ensureOwnerOrAdmin($request, $stockRequest);

        return new StockRequestResource($stockRequest->load(['medicine', 'user', 'reviewer']));
    }

    // Cancel a request (only while it is still pending)
    public function destroy(Request $request, StockRequest $stockRequest)
    {
        $this->ensureOwnerOrAdmin($request, $stockRequest);

        if ($stockRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be cancelled.'], 422);
        }

        $stockRequest->delete();

        return response()->noContent();
    }

    // Admin only (route middleware): approve, reject or complete
    public function updateStatus(UpdateRequestStatusRequest $request, StockRequest $stockRequest)
    {
        $new = $request->status;
        $allowed = self::TRANSITIONS[$stockRequest->status] ?? [];

        if (! in_array($new, $allowed)) {
            return response()->json([
                'message' => 'Cannot change a ' . $stockRequest->status . ' request to ' . $new . '.',
            ], 422);
        }

        // If anything fails inside, every change is rolled back
        DB::transaction(function () use ($stockRequest, $new, $request) {
            if ($new === 'completed') {
                $this->releaseStock($stockRequest, $request->user());
            }

            $stockRequest->update([
                'status' => $new,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);
        });

        return new StockRequestResource($stockRequest->fresh()->load(['medicine', 'user', 'reviewer']));
    }

    private function ensureOwnerOrAdmin(Request $request, StockRequest $stockRequest): void
    {
        $user = $request->user();

        abort_if($user->role !== 'admin' && $stockRequest->user_id !== $user->id, 403, 'Forbidden.');
    }

    // Takes stock from the earliest-expiring unexpired batches first
    private function releaseStock(StockRequest $stockRequest, $admin): void
    {
        $needed = $stockRequest->quantity;

        $batches = MedicineBatch::where('medicine_id', $stockRequest->medicine_id)
            ->where('quantity', '>', 0)
            ->whereDate('expiration_date', '>=', today())
            ->orderBy('expiration_date')
            ->lockForUpdate()
            ->get();

        if ($batches->sum('quantity') < $needed) {
            throw ValidationException::withMessages([
                'status' => ['Not enough unexpired stock to complete this request.'],
            ]);
        }

        foreach ($batches as $batch) {
            if ($needed <= 0) {
                break;
            }

            $take = min($needed, $batch->quantity);
            $batch->decrement('quantity', $take);

            $batch->stockTransactions()->create([
                'user_id' => $admin->id,
                'stock_request_id' => $stockRequest->id,
                'transaction_type' => 'stock_out',
                'quantity' => $take,
                'transaction_date' => today(),
                'remarks' => 'Released for request #' . $stockRequest->id,
            ]);

            $needed -= $take;
        }
    }
}