<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicineBatchRequest;
use App\Http\Resources\MedicineBatchResource;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;

class MedicineBatchController extends Controller
{
    public function index(Request $request)
    {
        $batches = MedicineBatch::with('medicine')
            ->when($request->medicine_id, fn ($q, $id) => $q->where('medicine_id', $id))
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('batch_number', 'like', '%' . $search . '%')
                      ->orWhereHas('medicine', fn ($m) => $m->where('name', 'like', '%' . $search . '%'));
                });
            })
            ->ofExpiryStatus($request->expiry_status)
            ->orderBy('expiration_date')
            ->paginate(10);

        return MedicineBatchResource::collection($batches);
    }

    public function store(MedicineBatchRequest $request)
    {
        $batch = MedicineBatch::create($request->validated());

        // Record the stock-in automatically
        $batch->stockTransactions()->create([
            'user_id' => $request->user()->id,
            'transaction_type' => 'stock_in',
            'quantity' => $batch->quantity,
            'transaction_date' => today(),
            'remarks' => 'Batch received',
        ]);

        return new MedicineBatchResource($batch->load('medicine'));
    }

    public function show(MedicineBatch $batch)
    {
        return new MedicineBatchResource($batch->load('medicine'));
    }

    public function update(MedicineBatchRequest $request, MedicineBatch $batch)
    {
        $batch->update($request->validated());

        return new MedicineBatchResource($batch->load('medicine'));
    }

    public function destroy(MedicineBatch $batch)
    {
        $batch->delete();

        return response()->noContent();
    }
}