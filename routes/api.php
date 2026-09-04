<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NewsletterController;
use App\Http\Controllers\DisclaimerController;
use App\Http\Controllers\CreditsController;
use App\Http\Controllers\SignupOtpController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PaymentController;

 Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password',[AuthController::class,'forgotpassword']);

Route::post('/signup-otp',[SignupOtpController::class,'store']);
Route::post('/contact', [ContactController::class, 'sendMessage']);
Route::post(
    '/newsletter/subscribe',
    [NewsletterController::class, 'subscribe']
);
Route::post(
    '/disclaimer/contact-click',
    [DisclaimerController::class, 'contactClick']
);

Route::get('/credits', [CreditsController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
});

Route::get('/test-env', function() {
    return response()->json([
        'phone_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'token_exists' => !empty(env('WHATSAPP_ACCESS_TOKEN')),
    ]);
});

