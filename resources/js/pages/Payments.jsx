import { useState } from 'react';
import { router } from '@inertiajs/react';
import BackButton from '../components/BackButton';
import PaymentForm from '../components/PaymentForm';
import DefensePaymentView from '../components/DefensePaymentView';

const statusLabels = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  observado: 'Observado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  publicado: 'Publicado',
};

export default function Payments({ stripe_key, jwt_token, pending_theses, defense_fee, payment_methods }) {
  const [showGenericForm, setShowGenericForm] = useState(false);
  const [genericAmount, setGenericAmount] = useState('');
  const [genericType, setGenericType] = useState('contado');
  const [genericConcept, setGenericConcept] = useState('');
  const [genericStep, setGenericStep] = useState('form');
  const [selectedThesis, setSelectedThesis] = useState(null);

  if (selectedThesis) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => router.visit('/pagos')}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver
        </button>
        <div className="bg-card-bg rounded-[20px] p-8">
          <h2 className="text-card-heading text-2xl font-bold text-center mb-8">Pago de Defensa de Tesis</h2>
          <DefensePaymentView
            thesis={selectedThesis}
            defenseFee={defense_fee}
            stripeKey={stripe_key}
            jwtToken={jwt_token}
            paymentMethods={payment_methods}
          />
        </div>
      </div>
    );
  }

  const handleGenericSubmit = (e) => {
    e.preventDefault();
    if (!genericAmount || genericAmount <= 0) return;
    setGenericStep('checkout');
  };

  if (genericStep === 'checkout') {
    const centavos = Math.round(parseFloat(genericAmount) * 100);

    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <button
          onClick={() => { setGenericStep('form'); setShowGenericForm(true); }}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver
        </button>
        <div className="bg-card-bg rounded-[20px] p-8">
          <h2 className="text-card-heading text-2xl font-bold text-center mb-2">Confirmar Pago</h2>
          <p className="text-card-label text-sm text-center mb-8">
            {(centavos / 100).toFixed(2)} Bs. — {genericType === 'credito' ? 'Crédito (2 cuotas)' : 'Contado'}
            {genericConcept && <> — {genericConcept}</>}
          </p>
          <PaymentForm
            stripeKey={stripe_key}
            jwtToken={jwt_token}
            amount={centavos}
            paymentType={genericType}
            concept={genericConcept}
            onSuccess={() => setGenericStep('form')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-[900px] mx-auto w-full px-4 sm:px-6 py-8">
      <BackButton />

      <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-6">
        Pagos
      </h1>

      {pending_theses && pending_theses.length > 0 && (
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
                  <tr
                    key={thesis.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-[13px] text-card-value font-medium max-w-[250px] truncate">
                      {thesis.title}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-value">
                      {thesis.type || '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-value">
                      {thesis.category?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-value font-bold">
                      {(defense_fee / 100).toFixed(2)} Bs.
                    </td>
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

      {pending_theses && pending_theses.length === 0 && (
        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <p className="text-card-label text-sm text-center py-4">
            No tienes tesis aprobadas pendientes de pago de defensa.
          </p>
        </div>
      )}

      <div className="bg-card-bg rounded-[16px] p-4 sm:p-6">
        <button
          onClick={() => setShowGenericForm(!showGenericForm)}
          className="w-full flex items-center justify-between bg-transparent border-none cursor-pointer text-card-heading text-lg font-bold"
        >
          <span>Otros Pagos</span>
          <span className={`transition-transform ${showGenericForm ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {showGenericForm && (
          <form onSubmit={handleGenericSubmit} className="space-y-5 mt-4">
            <div>
              <label className="block text-card-label text-sm mb-1.5">Monto (Bs.)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={genericAmount}
                onChange={(e) => setGenericAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text placeholder:text-input-placeholder"
                required
              />
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">Tipo de Pago</label>
              <select
                value={genericType}
                onChange={(e) => setGenericType(e.target.value)}
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
                value={genericConcept}
                onChange={(e) => setGenericConcept(e.target.value)}
                placeholder="Ej: Inscripción tesis"
                className="w-full h-[48px] rounded-[12px] border-none outline-none px-4 text-base bg-input-bg text-input-text placeholder:text-input-placeholder"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl text-lg font-bold cursor-pointer hover:bg-primary-light transition-colors"
            >
              Ir a Pagar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
