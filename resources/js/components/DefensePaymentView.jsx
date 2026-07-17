import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
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

function DefensePaymentContent({ thesis, defenseFee, jwtToken, paymentMethods, onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentType, setPaymentType] = useState('contado');
  const [installments, setInstallments] = useState(2);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('select');
  const [message, setMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [resultPayment, setResultPayment] = useState(null);

  const firstAmount = paymentType === 'credito'
    ? Math.floor(defenseFee / installments)
    : defenseFee;

  const handlePay = async () => {
    setLoading(true);
    setMessage(null);

    try {
      let paymentMethodId = null;

      if (useNewCard) {
        const resSetup = await fetch('/api/payments/setup-intent', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
        });

        const setupData = await resSetup.json();
        if (!resSetup.ok) throw new Error(setupData.message || 'Error al preparar registro de tarjeta');

        const stripeLib = await loadStripe(stripe._stripeKey);
        const { error: setupError, setupIntent } = await stripeLib.confirmCardSetup(setupData.client_secret, {
          payment_method: { card: elements.getElement(CardElement) },
        });

        if (setupError) throw new Error(setupError.message);

        paymentMethodId = setupIntent.payment_method;
      }

      const resDefense = await fetch('/api/payments/defense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          thesis_id: thesis.id,
          payment_type: paymentType,
          installments: paymentType === 'credito' ? installments : undefined,
          payment_method_id: paymentMethodId || selectedMethodId,
        }),
      });

      const defenseData = await resDefense.json();
      if (!resDefense.ok) throw new Error(defenseData.message || 'Error al crear pago');

      if (useNewCard) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(defenseData.client_secret);

        if (confirmError) throw new Error(confirmError.message);

        const resConfirm = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ stripe_payment_intent_id: paymentIntent.id }),
        });

        const confirmData = await resConfirm.json();
        if (!resConfirm.ok) throw new Error(confirmData.message || 'Error al confirmar pago');

        setResultPayment(confirmData.payment);
      } else if (selectedMethodId && defenseData.client_secret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(defenseData.client_secret);

        if (confirmError) throw new Error(confirmError.message);

        const resConfirm = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ stripe_payment_intent_id: paymentIntent.id }),
        });

        const confirmData = await resConfirm.json();
        if (!resConfirm.ok) throw new Error(confirmData.message || 'Error al confirmar pago');

        setResultPayment(confirmData.payment);
      } else {
        const resConfirm = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ stripe_payment_intent_id: defenseData.payment.stripe_payment_intent_id }),
        });

        const confirmData = await resConfirm.json();
        if (!resConfirm.ok) throw new Error(confirmData.message || 'Error al confirmar pago');

        setResultPayment(confirmData.payment);
      }

      setStep('success');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-card-heading mb-2">Defensa de Tesis Pagada</h3>
        <p className="text-card-value mb-2">
          <strong>{thesis.title}</strong>
        </p>
        <p className="text-card-label text-sm mb-6">
          {(defenseFee / 100).toFixed(2)} Bs. - {paymentType === 'credito' ? `Crédito (${installments} cuotas)` : 'Contado'}
        </p>
        <button
          onClick={() => router.reload()}
          className="bg-primary text-text-on-primary px-6 py-3 rounded-xl cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver a Pagos
        </button>
      </div>
    );
  }

  if (useNewCard && step === 'card') {
    return (
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
        <p className="text-card-label text-sm text-center">
          Ingresa los datos de tu tarjeta para pagar la defensa de tesis
        </p>
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <CardElement options={CARD_OPTIONS} />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setUseNewCard(false); setStep('select'); setMessage(null); }}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl text-base cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={loading || !stripe}
            className="flex-1 bg-primary text-white py-4 rounded-xl text-base font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60"
          >
            {loading ? 'Procesando...' : `Pagar ${(firstAmount / 100).toFixed(2)} Bs.`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${
          message.type === 'error'
            ? 'bg-red-50 text-red-700'
            : 'bg-green-50 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-card-heading font-bold text-lg">{thesis.title}</p>
        <p className="text-card-label text-sm">
          {thesis.type || 'Tesis'} — {thesis.category?.name || 'Sin categoría'}
        </p>
        <p className="text-card-value text-2xl font-bold">
          {(defenseFee / 100).toFixed(2)} Bs.
        </p>
      </div>

      <div>
        <label className="block text-card-label text-sm mb-1.5">Tipo de Pago</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text"
        >
          <option value="contado">Contado</option>
          <option value="credito">Crédito</option>
        </select>
      </div>

      {paymentType === 'credito' && (
        <div>
          <label className="block text-card-label text-sm mb-1.5">Número de Cuotas</label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text"
          >
            {[2, 3, 4, 6, 12].map((n) => (
              <option key={n} value={n}>
                {n} cuotas de {(defenseFee / n / 100).toFixed(2)} Bs. c/u
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-card-label text-sm mb-1.5">Método de Pago</label>
        {paymentMethods && paymentMethods.length > 0 && (
          <div className="space-y-2 mb-3">
            {paymentMethods.map((pm) => (
              <label
                key={pm.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  selectedMethodId === pm.id && !useNewCard
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={selectedMethodId === pm.id && !useNewCard}
                  onChange={() => { setSelectedMethodId(pm.id); setUseNewCard(false); }}
                  className="accent-primary"
                />
                <span className="text-card-value text-sm">
                  {pm.brand === 'visa' ? 'Visa' : pm.brand === 'mastercard' ? 'Mastercard' : pm.brand}
                  {' '}**** {pm.last4}
                  {' '}— Exp. {String(pm.exp_month).padStart(2, '0')}/{pm.exp_year}
                </span>
              </label>
            ))}
          </div>
        )}

        <label
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            useNewCard
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="payment_method"
            checked={useNewCard}
            onChange={() => { setUseNewCard(true); setSelectedMethodId(null); }}
            className="accent-primary"
          />
          <span className="text-card-value text-sm">
            {paymentMethods && paymentMethods.length > 0
              ? 'Usar otra tarjeta'
              : 'Nueva tarjeta de crédito/débito'}
          </span>
        </label>
      </div>

      {useNewCard && (
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <CardElement options={CARD_OPTIONS} />
        </div>
      )}

      <button
        onClick={() => {
          if (useNewCard) {
            setStep('card');
          } else {
            handlePay();
          }
        }}
        disabled={loading || (!selectedMethodId && !useNewCard)}
        className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Procesando...'
          : `Pagar ${(firstAmount / 100).toFixed(2)} Bs.`}
      </button>
    </div>
  );
}

export default function DefensePaymentView({ thesis, defenseFee, stripeKey, jwtToken, paymentMethods, onComplete }) {
  const stripePromise = useMemo(() => loadStripe(stripeKey), [stripeKey]);

  return (
    <Elements stripe={stripePromise}>
      <DefensePaymentContent
        thesis={thesis}
        defenseFee={defenseFee}
        jwtToken={jwtToken}
        paymentMethods={paymentMethods}
        onComplete={onComplete}
      />
    </Elements>
  );
}
