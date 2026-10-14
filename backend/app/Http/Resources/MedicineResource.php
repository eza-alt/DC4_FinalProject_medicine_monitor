<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicineResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
{
    $total = (int) ($this->total_stock ?? 0);

    return [
        'id' => $this->id,
        'name' => $this->name,
        'generic_name' => $this->generic_name,
        'category' => $this->category,
        'unit' => $this->unit,
        'reorder_level' => $this->reorder_level,
        'description' => $this->description,
        'total_stock' => $total,
        'is_low_stock' => $total < $this->reorder_level,
        'batches' => $this->whenLoaded('batches'),
        'created_at' => $this->created_at,
    ];
}
}
