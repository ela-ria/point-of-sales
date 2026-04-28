<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Product extends Model
{
    use HasFactory;


    protected $fillable = [
    'name',
    'category',   // ← add this
    'barcode',
    'price',
    'stock_quantity',
    'is_active',
];


    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'decimal:2',
    ];


    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }


    // Scope: only active products
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}


