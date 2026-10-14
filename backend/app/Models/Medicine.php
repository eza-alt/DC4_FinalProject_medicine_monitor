<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    //
    protected $fillable = [
        'name',
        'generic_name',
        'category',
        'unit',
        'reorder_level',
        'description',
    ];

    public function batches() { return $this->hasMany(MedicineBatch::class); }
    public function stockRequests() { return $this->hasMany(StockRequest::class); }
}
