<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineBatch extends Model
{
    //
    protected $fillable = ['medicine_id', 'batch_number', 'quantity', 'received_date', 'expiration_date'];

public function medicine() { return $this->belongsTo(Medicine::class); }
public function stockTransactions() { return $this->hasMany(StockTransaction::class); }
}
