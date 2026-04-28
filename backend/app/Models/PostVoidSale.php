<?php


namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class PostVoidSale extends Model
{
    use HasFactory;


    protected $fillable = [
        'sale_id',
        'supervisor_id',
        'reason',
    ];


    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }


    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
}
