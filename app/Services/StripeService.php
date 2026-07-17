<?php

namespace App\Services;

use App\Models\User;
use Stripe\Customer;
use Stripe\PaymentIntent;
use Stripe\PaymentMethod;
use Stripe\SetupIntent;
use Stripe\Stripe;

class StripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('stripe.secret'));
    }

    public function createPaymentIntent(int $amount, string $currency = 'bob'): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount,
            'currency' => $currency,
            'payment_method_types' => ['card'],
        ]);
    }

    public function createPaymentIntentForCustomer(int $amount, string $currency, string $customerId, string $paymentMethodId): PaymentIntent
    {
        return PaymentIntent::create([
            'amount' => $amount,
            'currency' => $currency,
            'customer' => $customerId,
            'payment_method' => $paymentMethodId,
            'off_session' => true,
            'confirm' => true,
            'payment_method_types' => ['card'],
        ]);
    }

    public function retrievePaymentIntent(string $id): PaymentIntent
    {
        return PaymentIntent::retrieve($id);
    }

    public function createCustomer(User $user): Customer
    {
        if ($user->stripe_customer_id) {
            return Customer::retrieve($user->stripe_customer_id);
        }

        $customer = Customer::create([
            'email' => $user->email,
            'name' => $user->full_name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }

    public function createSetupIntent(string $customerId): SetupIntent
    {
        return SetupIntent::create([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
        ]);
    }

    public function listPaymentMethods(string $customerId): array
    {
        $methods = PaymentMethod::all([
            'customer' => $customerId,
            'type' => 'card',
        ]);

        return array_map(function (PaymentMethod $pm) {
            return [
                'id' => $pm->id,
                'brand' => $pm->card->brand,
                'last4' => $pm->card->last4,
                'exp_month' => $pm->card->exp_month,
                'exp_year' => $pm->card->exp_year,
                'created' => $pm->created,
            ];
        }, $methods->data);
    }

    public function detachPaymentMethod(string $paymentMethodId): void
    {
        $method = PaymentMethod::retrieve($paymentMethodId);
        $method->detach();
    }

    public function attachPaymentMethod(string $paymentMethodId, string $customerId): void
    {
        $method = PaymentMethod::retrieve($paymentMethodId);
        $method->attach(['customer' => $customerId]);
    }
}
