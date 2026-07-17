<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfirmPaymentRequest;
use App\Http\Requests\CreatePaymentIntentRequest;
use App\Http\Requests\InitiateDefensePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\PaymentConcept;
use App\Models\Thesis;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $this->checkDefensePaymentComplete($payment);

        return response()->json([
            'message' => 'Pago confirmado.',
            'payment' => new PaymentResource($payment->fresh()),
        ]);
    }

    public function setupIntent(): JsonResponse
    {
        $user = auth()->user();
        $customer = $this->stripe->createCustomer($user);
        $setupIntent = $this->stripe->createSetupIntent($customer->id);

        return response()->json([
            'client_secret' => $setupIntent->client_secret,
        ]);
    }

    public function listMethods(): JsonResponse
    {
        $user = auth()->user();

        if (!$user->stripe_customer_id) {
            return response()->json(['data' => []]);
        }

        $methods = $this->stripe->listPaymentMethods($user->stripe_customer_id);

        return response()->json(['data' => $methods]);
    }

    public function deleteMethod(string $paymentMethodId): JsonResponse
    {
        $user = auth()->user();

        if (!$user->stripe_customer_id) {
            abort(404);
        }

        $this->stripe->detachPaymentMethod($paymentMethodId);

        return response()->json(['message' => 'Método de pago eliminado.']);
    }

    public function initiateDefensePayment(InitiateDefensePaymentRequest $request): JsonResponse
    {
        $user = auth()->user();
        $thesis = Thesis::findOrFail($request->thesis_id);

        $concept = PaymentConcept::active()
            ->byCode('defensa_tesis')
            ->forCareer($thesis->career_id)
            ->first();

        if (!$concept) {
            return response()->json([
                'message' => 'No se encontró un concepto de pago activo para defensa de tesis.',
            ], 422);
        }

        $totalAmount = $concept->amount;
        $installments = $request->payment_type === 'credito'
            ? min(max($request->installments, 2), 12)
            : 1;

        $customer = $this->stripe->createCustomer($user);

        if ($request->filled('payment_method_id')) {
            $this->stripe->attachPaymentMethod(
                $request->payment_method_id,
                $customer->id
            );

            $intent = $this->stripe->createPaymentIntentForCustomer(
                intdiv($totalAmount, $installments),
                'bob',
                $customer->id,
                $request->payment_method_id
            );
        } else {
            $intent = $this->stripe->createPaymentIntent(
                intdiv($totalAmount, $installments),
                'bob'
            );
        }

        $firstPayment = Payment::create([
            'user_id' => $user->id,
            'thesis_id' => $thesis->id,
            'stripe_payment_intent_id' => $intent->id,
            'stripe_payment_method_id' => $request->payment_method_id,
            'amount' => intdiv($totalAmount, $installments),
            'currency' => 'bob',
            'concept' => $concept->name,
            'payment_type' => $request->payment_type,
            'installment_number' => 1,
            'total_installments' => $installments,
            'status' => 'pending',
        ]);

        if ($request->payment_type === 'credito') {
            $remaining = $totalAmount - intdiv($totalAmount, $installments);
            $baseInstallment = intdiv($totalAmount, $installments);

            for ($i = 2; $i <= $installments; $i++) {
                $isLast = $i === $installments;
                $installmentAmount = $isLast ? $remaining : $baseInstallment;
                $remaining -= $installmentAmount;

                Payment::create([
                    'user_id' => $user->id,
                    'thesis_id' => $thesis->id,
                    'amount' => $installmentAmount,
                    'currency' => 'bob',
                    'concept' => $concept->name . ' (cuota ' . $i . ' de ' . $installments . ')',
                    'payment_type' => 'credito',
                    'installment_number' => $i,
                    'total_installments' => $installments,
                    'status' => 'pending',
                    'parent_payment_id' => $firstPayment->id,
                    'due_date' => now()->addMonths($i - 1),
                ]);
            }
        }

        return response()->json([
            'client_secret' => $intent->client_secret,
            'payment' => new PaymentResource($firstPayment->fresh()),
        ]);
    }

    private function checkDefensePaymentComplete(Payment $payment): void
    {
        if (!$payment->thesis_id) {
            return;
        }

        $thesis = $payment->thesis;

        if ($thesis->isDefensePaid()) {
            return;
        }

        if ($payment->payment_type === 'contado') {
            $thesis->update(['defense_paid_at' => now()]);
            return;
        }

        if ($payment->payment_type === 'credito' && $payment->installment_number === $payment->total_installments) {
            $allPaid = Payment::where('parent_payment_id', $payment->parent_payment_id)
                ->orWhere('id', $payment->parent_payment_id)
                ->where('status', 'succeeded')
                ->count() === $payment->total_installments;

            if ($allPaid) {
                $thesis->update(['defense_paid_at' => now()]);
            }
            return;
        }

        if ($payment->payment_type === 'credito' && $payment->parent_payment_id === null) {
            $allPaid = Payment::where('parent_payment_id', $payment->id)
                ->where('status', 'succeeded')
                ->count() === ($payment->total_installments - 1);

            if ($allPaid && $payment->status === 'succeeded') {
                $thesis->update(['defense_paid_at' => now()]);
            }
        }
    }
}
