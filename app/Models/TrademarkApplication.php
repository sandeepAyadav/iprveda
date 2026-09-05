<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class TrademarkApplication extends Model{
protected $fillable=[
        'user_id',
        'trademark_type',
        'business_activity',
        'selected_classes',
        'plan',
        'amount',
        'payment_status',
        'razorpay_order_id',
        'razorpay_payment_id',
];
protected $casts = [
        'selected_classes' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

