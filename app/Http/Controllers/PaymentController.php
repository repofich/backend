<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmPaymentRequest;
use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function __construct(
        protected StripeService $stripe
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $payments = Payment::where('user_id', auth()->id())
            ->latest()
            ->get();

        return PaymentResource::collection($payments);
    }

    public function show(Payment $payment): PaymentResource
    {
        abort_if($payment->user_id !== auth()->id(), 403);

        return new PaymentResource($payment);
    }

    public function store(CreatePaymentIntentRequest $request): JsonResponse
    {
        $totalAmount = $request->amount;

        if ($request->payment_type === 'credito') {
            $firstAmount = intdiv($totalAmount, 2);
        } else {
            $firstAmount = $totalAmount;
        }

        $intent = $this->stripe->createPaymentIntent(
            $firstAmount,
            $request->currency ?? 'bob'
        );

        $payment = Payment::create([
            'user_id' => auth()->id(),
            'stripe_payment_intent_id' => $intent->id,
            'amount' => $firstAmount,
            'currency' => $request->currency ?? 'bob',
            'concept' => $request->concept,
            'payment_type' => $request->payment_type,
            'installment_number' => 1,
            'total_installments' => $request->payment_type === 'credito' ? 2 : 1,
            'status' => 'pending',
        ]);

        if ($request->payment_type === 'credito') {
            $secondAmount = $totalAmount - $firstAmount;

            Payment::create([
                'user_id' => auth()->id(),
                'amount' => $secondAmount,
                'currency' => $request->currency ?? 'bob',
                'concept' => $request->concept ? $request->concept . ' (2da cuota)' : null,
                'payment_type' => 'credito',
                'installment_number' => 2,
                'total_installments' => 2,
                'status' => 'pending',
                'parent_payment_id' => $payment->id,
                'due_date' => now()->addMonth(),
            ]);
        }

        return response()->json([
            'client_secret' => $intent->client_secret,
            'payment' => new PaymentResource($payment->fresh()),
        ]);
    }

    public function confirm(ConfirmPaymentRequest $request): JsonResponse
    {
        $intent = $this->stripe->retrievePaymentIntent(
            $request->stripe_payment_intent_id
        );

        $payment = Payment::where(
            'stripe_payment_intent_id', $intent->id
        )->firstOrFail();

        if ($payment->user_id !== auth()->id()) {
            abort(403);
        }

        if ($intent->status !== 'succeeded') {
            return response()->json([
                'message' => 'El pago no fue completado en Stripe.',
                'status' => $intent->status,
            ], 422);
        }

        $payment->update([
            'stripe_payment_method_id' => $intent->payment_method,
            'status' => 'succeeded',
            'paid_at' => now(),
        ]);

        return response()->json([
            'message' => 'Pago confirmado.',
            'payment' => new PaymentResource($payment->fresh()),
        ]);
    }
}
