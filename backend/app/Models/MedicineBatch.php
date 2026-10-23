<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicineBatch extends Model
{
    //
    protected $fillable = ['medicine_id', 'batch_number', 'quantity', 'received_date', 'expiration_date'];

public function medicine() { return $this->belongsTo(Medicine::class); }
public function stockTransactions() { return $this->hasMany(StockTransaction::class); }
protected $casts = [
    'received_date' => 'date',
    'expiration_date' => 'date',
];

// Computed status: expired / expiring_soon / active
public function getExpiryStatusAttribute(): string
{
    if ($this->expiration_date->lt(today())) {
        return 'expired';
    }

    if ($this->expiration_date->lte(today()->addDays(90))) {
        return 'expiring_soon';
    }

    return 'active';
}

// Used for the expiry filter and the dashboard counts
public function scopeOfExpiryStatus($query, ?string $status)
{
    return match ($status) {
        'expired' => $query->whereDate('expiration_date', '<', today()),
        'expiring_soon' => $query->whereDate('expiration_date', '>=', today())
                                 ->whereDate('expiration_date', '<=', today()->addDays(90)),
        'active' => $query->whereDate('expiration_date', '>', today()->addDays(90)),
        default => $query,
    };
}
}
