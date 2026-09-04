<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Razorpay\Api\Api;

class PaymentController extends Controller
{
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
        ]);

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

        $amountInPaise = $request->amount * 100;

        $order = $api->order->create([
            'receipt'         => 'order_rcpt_' . uniqid(),
            'amount'          => $amountInPaise,
            'currency'        => 'INR',
            'payment_capture' => 1,
        ]);

        Payment::create([
            'user_id'           => $request->user()->id,
            'razorpay_order_id' => $order['id'],
            'amount'            => $amountInPaise,
            'currency'          => 'INR',
            'status'            => 'created',
            'purpose'           => 'onboarding',
        ]);

        return response()->json([
            'order_id' => $order['id'],
            'amount'   => $order['amount'],
            'currency' => $order['currency'],
            'key'      => config('services.razorpay.key'),
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'razorpay_payment_id' => 'required',
            'razorpay_order_id'   => 'required',
            'razorpay_signature'  => 'required',
        ]);

        $payment = Payment::where('razorpay_order_id', $request->razorpay_order_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

        try {
            $api->utility->verifyPaymentSignature([
                'razorpay_order_id'   => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature,
            ]);

            $payment->update([
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature,
                'status'              => 'paid',
            ]);

            return response()->json(['status' => 'success', 'message' => 'Payment verified']);
        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);

            return response()->json(['status' => 'failed', 'message' => 'Signature verification failed'], 400);
        }
    }
}