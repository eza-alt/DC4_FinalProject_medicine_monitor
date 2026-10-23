<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MedicineRequest;
use App\Http\Resources\MedicineResource;
use App\Models\Medicine;
use Illuminate\Http\Request;

class MedicineController extends Controller
{
   public function index(Request $request)
{
    $query = Medicine::withStock()
        ->when($request->search, function ($q, $search) {
            $q->where(function ($w) use ($search) {
                $w->where('name', 'like', '%' . $search . '%')
                  ->orWhere('generic_name', 'like', '%' . $search . '%');
            });
        })
        ->when($request->category, fn ($q, $category) => $q->where('category', $category))
        ->orderBy('name');

    // ?all=1 returns every medicine without pagination (used by dropdowns)
    if ($request->boolean('all')) {
        return MedicineResource::collection($query->get());
    }

    return MedicineResource::collection($query->paginate(10));
}

    public function store(MedicineRequest $request)
    {
        $medicine = Medicine::create($request->validated());

        return new MedicineResource($medicine); // returns 201 automatically
    }

    public function show(Medicine $medicine)
    {
        $medicine = Medicine::withStock()->with('batches')->findOrFail($medicine->id);

        return new MedicineResource($medicine);
    }

    public function update(MedicineRequest $request, Medicine $medicine)
    {
        $medicine->update($request->validated());

        return new MedicineResource($medicine);
    }

   public function destroy(Medicine $medicine)
{
    if ($medicine->stockRequests()->exists()) {
        return response()->json([
            'message' => 'This medicine has stock requests, so it cannot be deleted.',
        ], 422);
    }

    $medicine->delete();

    return response()->noContent();
}
}