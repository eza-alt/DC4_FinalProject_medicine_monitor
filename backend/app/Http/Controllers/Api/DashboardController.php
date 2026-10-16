<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\MedicineBatch;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Same low-stock rule as MedicineResource: unexpired stock < reorder level
        $lowStock = Medicine::withStock()->get()
            ->filter(fn ($m) => (int) $m->total_stock < $m->reorder_level)
            ->count();

        // Admin sees all pending requests, staff only see their own
        $pending = StockRequest::where('status', 'pending')
            ->when($user->role !== 'admin', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        $recent = StockTransaction::with(['batch.medicine', 'user'])
            ->latest('id')
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'medicine' => $t->batch->medicine->name,
                'batch_number' => $t->batch->batch_number,
                'type' => $t->transaction_type,
                'quantity' => $t->quantity,
                'date' => $t->transaction_date->toDateString(),
                'by' => $t->user->name,
            ]);

        return response()->json([
            'total_medicines' => Medicine::count(),
            'low_stock_medicines' => $lowStock,
            'expiring_soon_batches' => MedicineBatch::where('quantity', '>', 0)->ofExpiryStatus('expiring_soon')->count(),
            'expired_batches' => MedicineBatch::where('quantity', '>', 0)->ofExpiryStatus('expired')->count(),
            'pending_requests' => $pending,
            'recent_transactions' => $recent,
        ]);
    }
}