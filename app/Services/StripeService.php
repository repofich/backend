<?php

namespace App\Services;

use Stripe\PaymentIntent;
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

    public function retrievePaymentIntent(string $id): PaymentIntent
    {
        return PaymentIntent::retrieve($id);
    }
}
