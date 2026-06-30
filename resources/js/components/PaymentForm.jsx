import { useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Georgia, serif',
      color: '#1a1a1a',
      '::placeholder': { color: '#999' },
    },
    invalid: { color: '#e60000' },
  },
};

function PaymentFormContent({ jwtToken, amount, paymentType, concept, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [step, setStep] = useState('form');
  const [message, setMessage] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/payments/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ amount, payment_type: paymentType, concept }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al generar pago');
      }

      setClientSecret(data.client_secret);
      setPaymentId(data.payment.id);
      setStep('card');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setMessage(null);

    try {
      const cardElement = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        throw new Error(error.message);
      }

      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ stripe_payment_intent_id: paymentIntent.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al confirmar pago');
      }

      setStep('success');
      setMessage({ type: 'success', text: 'Pago exitoso!' });
      onSuccess?.(data.payment);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('form');
    setClientSecret(null);
    setPaymentId(null);
    setMessage(null);
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pago Exitoso</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {(amount / 100).toFixed(2)} Bs. - {paymentType === 'credito' ? 'Crédito' : 'Contado'}
        </p>
        {concept && <p className="text-sm text-gray-500 mb-6">{concept}</p>}
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-primary-light transition-colors"
        >
          Nuevo Pago
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-xl text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {step === 'form' ? (
        <button
          onClick={handleGenerate}
          disabled={loading || !amount}
          className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Generando...' : `Pagar ${(amount / 100).toFixed(2)} Bs.`}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-[#333] rounded-xl border border-gray-200 dark:border-[#555]">
            <CardElement options={CARD_OPTIONS} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('form')}
              disabled={loading}
              className="flex-1 bg-gray-200 dark:bg-[#444] text-gray-700 dark:text-gray-200 py-4 rounded-xl text-base cursor-pointer hover:bg-gray-300 dark:hover:bg-[#555] transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handlePay}
              disabled={loading || !stripe}
              className="flex-1 bg-primary text-white py-4 rounded-xl text-base font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentForm({ stripeKey, jwtToken, amount, paymentType, concept, onSuccess, onError }) {
  const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey]);

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent
        jwtToken={jwtToken}
        amount={amount}
        paymentType={paymentType}
        concept={concept}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
