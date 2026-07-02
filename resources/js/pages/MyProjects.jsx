import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FiEdit2, FiSend } from 'react-icons/fi';
import Table from '../components/Table';

const statusLabels = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  observado: 'Observado',
  aprobado: 'Aprobado',
  publicado: 'Publicado',
  rechazado: 'Rechazado',
};

const statusColors = {
  borrador: 'bg-gray-400',
  en_revision: 'bg-yellow-500',
  observado: 'bg-orange-500',
  aprobado: 'bg-green-500',
  publicado: 'bg-blue-600',
  rechazado: 'bg-red-500',
};

export default function MyProjects({ proyectos, jwt_token }) {
  const [submitting, setSubmitting] = useState(null);

  const handleSubmitReview = async (thesisId, e) => {
    e.stopPropagation();
    setSubmitting(thesisId);
    try {
      const res = await fetch('/api/thesis/' + thesisId + '/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al enviar a revisión');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSubmitting(null);
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Título',
      render: (val, row) => (
        <span
          onClick={() => router.visit('/tesis/' + row.id)}
          className="cursor-pointer hover:text-primary transition-colors"
        >
          {val}
        </span>
      ),
    },
    { key: 'type', label: 'Tipo' },
    {
      key: 'category',
      label: 'Categoría',
      render: (_, row) => row.category?.name ?? '—',
    },
    { key: 'tutor', label: 'Tutor' },
    {
      key: 'status',
      label: 'Estado',
      render: (val) => (
        <span className={`${statusColors[val] || 'bg-gray-400'} text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
          {statusLabels[val] || val}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha',
      render: (val) => val ? new Date(val).toLocaleDateString('es-BO') : '—',
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          {(row.status === 'borrador' || row.status === 'observado') && (
            <button
              onClick={(e) => handleSubmitReview(row.id, e)}
              disabled={submitting === row.id}
              className="bg-green-600 text-white border-none px-3 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer hover:bg-green-700 transition-colors whitespace-nowrap font-card-meta inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FiSend className="size-3.5" />
              {submitting === row.id ? 'Enviando...' : 'Enviar a Revisión'}
            </button>
          )}
          {(row.status === 'borrador' || row.status === 'observado') && (
            <button
              onClick={(e) => { e.stopPropagation(); router.visit('/editar-proyecto/' + row.id) }}
              className="bg-primary text-text-on-primary border-none px-4 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer hover:bg-primary-light transition-colors whitespace-nowrap font-card-meta inline-flex items-center gap-1.5"
            >
              <FiEdit2 className="size-3.5" />
              Editar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta">
            Mis Proyectos
          </h1>
          <button
            onClick={() => router.visit('/crear-proyecto')}
            className="bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors whitespace-nowrap font-card-meta"
          >
            + CREAR PROYECTO
          </button>
        </div>

        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-hidden">
          <Table columns={columns} data={proyectos} />
        </div>
      </div>
    </div>
  );
}