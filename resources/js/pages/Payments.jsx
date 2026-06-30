import { useState } from 'react';
import { router } from '@inertiajs/react';
import PaymentForm from '../components/PaymentForm';
import Header from '../components/Header';

export default function Payments({ stripe_key, jwt_token }) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('contado');
  const [concept, setConcept] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleStart = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setShowForm(true);
  };

  if (showForm) {
    const centavos = Math.round(parseFloat(amount) * 100);

    return (
      <div className="min-h-screen bg-bg-page font-[Georgia,serif]">
        <Header>
          <button
            onClick={() => router.visit('/')}
            className="bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
          >
            Inicio
          </button>
        </Header>

        <div className="max-w-md mx-auto px-4 py-10">
          <div className="bg-card-bg rounded-[20px] p-8">
            <h2 className="text-card-heading text-2xl font-bold text-center mb-2">Confirmar Pago</h2>
            <p className="text-card-label text-sm text-center mb-8">
              {centavos / 100} Bs. - {paymentType === 'credito' ? 'Crédito (2 cuotas)' : 'Contado'}
              {concept && <> — {concept}</>}
            </p>

            <PaymentForm
              stripeKey={stripe_key}
              jwtToken={jwt_token}
              amount={centavos}
              paymentType={paymentType}
              concept={concept}
              onSuccess={() => {}}
              onError={() => {}}
            />

            <button
              onClick={() => setShowForm(false)}
              className="w-full mt-4 text-center text-sm text-card-label hover:text-card-heading transition-colors cursor-pointer bg-transparent border-none"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif]">
      <Header>
        <button
          onClick={() => router.visit('/')}
          className="bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Inicio
        </button>
      </Header>

      <div className="max-w-md mx-auto px-4 py-10">
        <div className="bg-card-bg rounded-[20px] p-8">
          <h1 className="text-card-heading text-2xl font-bold text-center mb-8">Pagos</h1>

          <form onSubmit={handleStart} className="space-y-5">
            <div>
              <label className="block text-card-label text-sm mb-1.5">Monto (Bs.)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
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
                className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors"
            >
              Ir a Pagar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
