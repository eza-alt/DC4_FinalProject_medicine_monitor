<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'medicine' => $this->whenLoaded('medicine', fn () => [
            'id' => $this->medicine->id,
            'name' => $this->medicine->name,
            'unit' => $this->medicine->unit,
        ]),
        'requested_by' => $this->whenLoaded('user', fn () => [
            'id' => $this->user->id,
            'name' => $this->user->name,
        ]),
        'quantity' => $this->quantity,
        'reason' => $this->reason,
        'status' => $this->status,
        'reviewed_by' => $this->whenLoaded('reviewer', fn () => $this->reviewer?->name),
        'reviewed_at' => $this->reviewed_at,
        'created_at' => $this->created_at,
    ];
}
}
