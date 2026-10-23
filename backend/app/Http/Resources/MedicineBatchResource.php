<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MedicineBatchResource extends JsonResource
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
        'medicine_id' => $this->medicine_id,
        'medicine' => $this->whenLoaded('medicine', fn () => [
            'id' => $this->medicine->id,
            'name' => $this->medicine->name,
            'unit' => $this->medicine->unit,
        ]),
        'batch_number' => $this->batch_number,
        'quantity' => $this->quantity,
        'received_date' => $this->received_date->toDateString(),
        'expiration_date' => $this->expiration_date->toDateString(),
        'expiry_status' => $this->expiry_status,
        'created_at' => $this->created_at,
    ];
}
}
