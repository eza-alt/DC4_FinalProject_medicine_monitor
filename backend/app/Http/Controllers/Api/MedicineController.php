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
        $medicines = Medicine::withStock()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('generic_name', 'like', "%{$search}%");
                });
            })
            ->when($request->category, fn ($query, $category) => $query->where('category', $category))
            ->orderBy('name')
            ->paginate(10);

        return MedicineResource::collection($medicines);
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
        $medicine->delete();

        return response()->noContent(); // 204
    }
}