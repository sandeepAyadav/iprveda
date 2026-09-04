<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; 

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; 

    protected $fillable = [
        'name',
        'email',
        'number',
        'password',
        'is_onboarded',     
         'company_name',      
          'business_type',     
          'preference', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
    public function payments()
{
    return $this->hasMany(Payment::class);
}
}
