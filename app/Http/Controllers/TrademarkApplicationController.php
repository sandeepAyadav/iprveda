<?php

namespace App\Http\Controllers;

use App\Models\TrademarkApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TrademarkApplicationController extends Controller
{
    public function show(Request $request)
    {
        
        $application = TrademarkApplication::firstOrCreate(
            ['user_id' => $request->user()->id, 'payment_status' => 'pending'],
            []
        );

        return Inertia::render('Onboarding', [
            'application' => $application,
        ]);
    }

    public function saveStep(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:trademark_applications,id',
            'trademark_type' => 'sometimes|string',
            'business_activity' => 'sometimes|string',
            'selected_classes' => 'sometimes|array',
            'plan' => 'sometimes|string',
        ]);

        $application = TrademarkApplication::where('id', $validated['application_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $application->update(collect($validated)->except('application_id')->toArray());

        return response()->json(['application' => $application]);
    }
public function searchClasses(Request $request)
{
    $request->validate(['description' => 'required|string|max:1000']);

    $prompt = $this->buildPrompt($request->input('description'));

    $maxRetries = 3;
    $attempt = 0;

    while ($attempt < $maxRetries) {
        $attempt++;

        try {
            $response = Http::timeout(20)
                ->withHeaders([
                    'x-goog-api-key' => config('services.gemini.key'),
                    'Content-Type' => 'application/json',
                ])
                ->post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
                    [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.2,
                            'responseMimeType' => 'application/json',
                        ],
                    ]
                );

            if ($response->status() === 503 && $attempt < $maxRetries) {
                sleep(2); 
                continue;
            }

            if (!$response->successful()) {
                Log::error('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
                return response()->json([
                    'classes' => [],
                    'debug_status' => $response->status(),
                    'debug_error' => $response->body(),
                ]);
            }

            $rawText = $response->json('candidates.0.content.parts.0.text');
            $classes = json_decode($rawText, true);

            return response()->json([
                'classes' => is_array($classes) ? $classes : [],
            ]);

        } catch (\Exception $e) {
            if ($attempt >= $maxRetries) {
                Log::error('Gemini classification failed', ['error' => $e->getMessage()]);
                return response()->json([
                    'classes' => [],
                    'debug_exception' => $e->getMessage(),
                ]);
            }
            sleep(2);
        }
    }

    return response()->json(['classes' => [], 'debug_error' => 'Max retries exceeded']);
}

    private function buildPrompt(string $description): string
    {
        return <<<PROMPT
You are a trademark classification expert following the NICE Classification system (Classes 1-45).

Business activity: "{$description}"

Identify the 2 to 4 most relevant NICE trademark classes for this business.

Respond ONLY with a valid JSON array, no markdown, no extra text, in exactly this format:

[
  {
    "id": 25,
    "name": "Clothing, Footwear, Headgear",
    "description": "Covers apparel, shoes, and related accessories",
    "recommended": true
  }
]

Rules:
- "id" must be a real NICE class number between 1 and 45.
- Mark exactly ONE class as "recommended": true.
- Keep "description" under 15 words.
- Return 2 to 4 classes, ordered by relevance.
PROMPT;
    }

    public function createOrder(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:trademark_applications,id',
        ]);

        $application = TrademarkApplication::where('id', $validated['application_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $classCount = max(count($application->selected_classes ?? []), 1);
        $pricePerClass = $application->plan === 'standard' ? 1499 : 1999;
        $subtotal = $pricePerClass * $classCount;
        $gst = round($subtotal * 0.18);
        $finalAmount = $subtotal + $gst;

        $application->update(['amount' => $finalAmount]);

        try {
            $response = Http::withBasicAuth(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            )->post('https://api.razorpay.com/v1/orders', [
                'amount' => $finalAmount * 100, // paise
                'currency' => 'INR',
                'receipt' => 'trademark_' . $application->id,
            ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Order creation failed'], 500);
            }

            $order = $response->json();

            $application->update(['razorpay_order_id' => $order['id']]);

            return response()->json([
                'key' => config('services.razorpay.key'),
                'amount' => $order['amount'],
                'currency' => $order['currency'],
                'order_id' => $order['id'],
                'final_amount' => $finalAmount,
                'subtotal' => $subtotal,
                'gst' => $gst,
            ]);

        } catch (\Exception $e) {
            Log::error('Razorpay order error', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Order creation failed'], 500);
        }
    }

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'application_id' => 'required|exists:trademark_applications,id',
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $application = TrademarkApplication::where('id', $validated['application_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $generatedSignature = hash_hmac(
            'sha256',
            $validated['razorpay_order_id'] . '|' . $validated['razorpay_payment_id'],
            config('services.razorpay.secret')
        );

        if ($generatedSignature !== $validated['razorpay_signature']) {
            return response()->json(['status' => 'failed', 'message' => 'Signature mismatch'], 400);
        }

        $application->update([
            'payment_status' => 'paid',
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
        ]);

        return response()->json(['status' => 'success']);
    }
}