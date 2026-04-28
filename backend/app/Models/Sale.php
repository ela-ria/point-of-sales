<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_id',
        'status',
        'discount_type',
        'discount_amount',
        'subtotal',
        'total',
    ];

    const DISCOUNT_RATES = [
        'none'           => 0.00,
        'senior_citizen' => 0.20,
        'pwd'            => 0.20,
        'athlete'        => 0.10,
        'solo_parent'    => 0.10,
    ];

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function activeItems()
    {
        return $this->hasMany(SaleItem::class)->where('is_voided', false);
    }

    public function cancelRecord()
    {
        return $this->hasOne(CancelSale::class);
    }

    public function postVoidRecord()
    {
        return $this->hasOne(PostVoidSale::class);
    }

    public function recalculate(): void
    {
        $subtotal       = $this->activeItems()->sum('subtotal');
        $discountRate   = self::DISCOUNT_RATES[$this->discount_type] ?? 0;
        $discountAmount = round($subtotal * $discountRate, 2);
        $total          = round($subtotal - $discountAmount, 2);

        $this->update([
            'subtotal'        => $subtotal,
            'discount_amount' => $discountAmount,
            'total'           => $total,
        ]);
    }
}
