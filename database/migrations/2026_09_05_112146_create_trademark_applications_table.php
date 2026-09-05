<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trademark_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('trademark_type')->nullable();
            $table->text('business_activity')->nullable();
            $table->json('selected_classes')->nullable(); 
            $table->string('plan')->nullable(); 
            $table->unsignedInteger('amount')->nullable(); 
            $table->string('payment_status')->default('pending'); 
            $table->string('razorpay_order_id')->nullable();
            $table->string('razorpay_payment_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trademark_applications');
    }
};