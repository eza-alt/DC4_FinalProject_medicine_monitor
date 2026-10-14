<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockTransaction extends Model
{
    //
    protected $fillable = ['medicine_batch_id', 'user_id', 'stock_request_id', 'transaction_type', 'quantity', 'transaction_date', 'remarks'];

public function batch() { return $this->belongsTo(MedicineBatch::class, 'medicine_batch_id'); }
public function user() { return $this->belongsTo(User::class); }
public function stockRequest() { return $this->belongsTo(StockRequest::class); }
}
