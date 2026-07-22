import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import BackButton from '../components/BackButton';

const statusLabels = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  observado: 'Observado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  publicado: 'Publicado',
};

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

function CardForm({ loading, onPay, onCancel }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white dark:bg-[#333] rounded-xl border border-gray-200 dark:border-[#555]">
        <CardElement options={CARD_OPTIONS} />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 dark:bg-[#444] text-gray-700 dark:text-gray-200 py-4 rounded-xl text-base cursor-pointer hover:bg-gray-300 transition-colors disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          onClick={onPay}
          disabled={loading}
          className="flex-1 bg-primary text-white py-4 rounded-xl text-base font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {loading ? 'Procesando...' : 'Confirmar Pago'}
        </button>
      </div>
    </div>
  );
}

function ThesisPaymentForm({ thesis, defenseFee, stripe, jwtToken, paymentMethods, onSuccess }) {
  const elements = useElements();
  const [paymentType, setPaymentType] = useState('contado');
  const [installments, setInstallments] = useState(2);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

      if (defenseData.client_secret) {
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
      }

      setSuccess(true);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-card-heading mb-2">Defensa de Tesis Pagada</h3>
        <p className="text-card-value mb-2"><strong>{thesis.title}</strong></p>
        <p className="text-card-label text-sm mb-6">
          {(defenseFee / 100).toFixed(2)} Bs. - {paymentType === 'credito' ? `Crédito (${installments} cuotas)` : 'Contado'}
        </p>
        <button
          onClick={() => onSuccess()}
          className="bg-primary text-text-on-primary px-6 py-3 rounded-xl cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver a Pagos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-card-heading font-bold text-lg">{thesis.title}</p>
        <p className="text-card-label text-sm">{thesis.type || 'Tesis'} — {thesis.category?.name || 'Sin categoría'}</p>
        <p className="text-card-value text-2xl font-bold">{(defenseFee / 100).toFixed(2)} Bs.</p>
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
              <option key={n} value={n}>{n} cuotas de {(defenseFee / n / 100).toFixed(2)} Bs. c/u</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-card-label text-sm mb-1.5">Método de Pago</label>
        {paymentMethods?.length > 0 && (
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
                  {pm.brand} **** {pm.last4} — Exp. {String(pm.exp_month).padStart(2, '0')}/{pm.exp_year}
                </span>
              </label>
            ))}
          </div>
        )}

        <label
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            useNewCard ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
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
            {paymentMethods?.length > 0 ? 'Usar otra tarjeta' : 'Nueva tarjeta'}
          </span>
        </label>
      </div>

      {useNewCard && (
        <div className="p-4 bg-white rounded-xl border border-gray-200">
          <CardElement options={CARD_OPTIONS} />
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading || (!selectedMethodId && !useNewCard)}
        className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : `Pagar ${(firstAmount / 100).toFixed(2)} Bs.`}
      </button>
    </div>
  );
}

function GenericPaymentForm({ stripeKey, jwtToken, onBack }) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('contado');
  const [concept, setConcept] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  const stripe = useStripe();
  const elements = useElements();

  const handleGenerate = async () => {
    const centavos = Math.round(parseFloat(amount) * 100);
    if (!centavos || centavos <= 0) return;

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
        body: JSON.stringify({ amount: centavos, payment_type: paymentType, concept }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al generar pago');

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

      if (error) throw new Error(error.message);

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
      if (!res.ok) throw new Error(data.message || 'Error al confirmar pago');

      setStep('success');
      setMessage({ type: 'success', text: 'Pago exitoso!' });
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
        <h3 className="text-xl font-bold text-card-heading mb-2">Pago Exitoso</h3>
        <p className="text-card-value mb-6">
          {amount ? (Math.round(parseFloat(amount) * 100) / 100).toFixed(2) : '0.00'} Bs.
          {concept && <> — {concept}</>}
        </p>
        <button onClick={onBack} className="bg-primary text-white px-6 py-3 rounded-xl cursor-pointer hover:bg-primary-light transition-colors">
          Volver a Pagos
        </button>
      </div>
    );
  }

  if (step === 'card') {
    return (
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}
        <p className="text-center text-card-label text-sm">
          Total a pagar: {amount ? (Math.round(parseFloat(amount) * 100) / 100).toFixed(2) : '0.00'} Bs.
        </p>
        <CardForm
          loading={loading}
          onPay={handlePay}
          onCancel={() => setStep('form')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-card-label text-sm mb-1.5">Monto (Bs.)</label>
        <input
          type="number" step="0.01" min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text placeholder:text-input-placeholder"
          required
        />
      </div>

      <div>
        <label className="block text-card-label text-sm mb-1.5">Tipo de Pago</label>
        <select
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text"
        >
          <option value="contado">Contado</option>
          <option value="credito">Crédito (2 cuotas)</option>
        </select>
      </div>

      <div>
        <label className="block text-card-label text-sm mb-1.5">Concepto (opcional)</label>
        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="Ej: Inscripción tesis"
          className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text placeholder:text-input-placeholder"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando...' : 'Ir a Pagar'}
      </button>
    </div>
  );
}

export default function Payments({ stripe_key, jwt_token, pending_theses, defense_fee, payment_methods }) {
  console.log('Payments props:', { stripe_key, jwt_token, pending_theses, defense_fee, payment_methods });
  console.log('window.__INERTIA_STRIPE_KEY:', window.__INERTIA_STRIPE_KEY);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [showGenericForm, setShowGenericForm] = useState(false);
  const resolvedKey = stripe_key || window.__INERTIA_STRIPE_KEY;

  if (!resolvedKey) {
    return (
      <div className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-6 py-8">
        <BackButton />
        <div className="bg-card-bg rounded-[16px] p-8 text-center mt-6">
          <p className="text-error text-sm">Error de configuración: Stripe no está configurado.</p>
        </div>
      </div>
    );
  }

  const stripePromise = useMemo(() => loadStripe(resolvedKey), [resolvedKey]);

  if (selectedThesis) {
    return (
      <Elements stripe={stripePromise}>
        <div className="max-w-lg mx-auto px-4 py-10">
          <button
            onClick={() => setSelectedThesis(null)}
            className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
          >
            Volver
          </button>
          <div className="bg-card-bg rounded-[20px] p-8">
            <h2 className="text-card-heading text-2xl font-bold text-center mb-8">Pago de Defensa de Tesis</h2>
            <ThesisPaymentForm
              thesis={selectedThesis}
              defenseFee={defense_fee}
              stripe={stripePromise}
              jwtToken={jwt_token}
              paymentMethods={payment_methods}
              onSuccess={() => setSelectedThesis(null)}
            />
          </div>
        </div>
      </Elements>
    );
  }

  if (showGenericForm) {
    return (
      <Elements stripe={stripePromise}>
        <div className="max-w-lg mx-auto px-4 py-10">
          <button
            onClick={() => setShowGenericForm(false)}
            className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
          >
            Volver
          </button>
          <div className="bg-card-bg rounded-[20px] p-8">
            <h2 className="text-card-heading text-2xl font-bold text-center mb-8">Otro Pago</h2>
            <GenericPaymentForm
              stripeKey={stripe_key}
              jwtToken={jwt_token}
              onBack={() => setShowGenericForm(false)}
            />
          </div>
        </div>
      </Elements>
    );
  }

  return (
    <div className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-6 py-8">
      <BackButton />

      <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-6">Pagos</h1>

      {pending_theses?.length > 0 && (
        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <h2 className="text-card-heading text-lg font-bold mb-4">Pago de Defensa de Tesis</h2>
          <p className="text-card-label text-sm mb-4">
            Las siguientes tesis están aprobadas y pendientes de pago de defensa:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-card-meta">
              <thead>
                <tr className="bg-primary text-text-on-primary">
                  <th className="text-left px-4 py-3 text-[13px] font-[600]">Título</th>
                  <th className="text-left px-4 py-3 text-[13px] font-[600]">Tipo</th>
                  <th className="text-left px-4 py-3 text-[13px] font-[600]">Carrera</th>
                  <th className="text-left px-4 py-3 text-[13px] font-[600]">Monto</th>
                  <th className="text-center px-4 py-3 text-[13px] font-[600]">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pending_theses.map((thesis) => (
                  <tr key={thesis.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-card-value font-medium max-w-[250px] truncate">{thesis.title}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value">{thesis.type || '—'}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value">{thesis.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value font-bold">{(defense_fee / 100).toFixed(2)} Bs.</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedThesis(thesis)}
                        className="bg-primary text-text-on-primary border-none px-4 py-2 rounded-[10px] text-xs cursor-pointer hover:bg-primary-light transition-colors"
                      >
                        Pagar Defensa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pending_theses?.length === 0 && (
        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <p className="text-card-label text-sm text-center py-4">
            No tienes tesis aprobadas pendientes de pago de defensa.
          </p>
        </div>
      )}

      <div className="bg-card-bg rounded-[16px] p-4 sm:p-6">
        <button
          onClick={() => setShowGenericForm(true)}
          className="w-full bg-transparent border-none cursor-pointer text-card-heading text-lg font-bold text-left"
        >
          Otros Pagos →
        </button>
      </div>
    </div>
  );
}
