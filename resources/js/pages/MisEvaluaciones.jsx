import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FiStar, FiCheckCircle } from 'react-icons/fi';
import BackButton from '../components/BackButton';
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

const tutorStatusLabels = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
};

const tutorStatusColors = {
  pending: 'bg-yellow-500',
  accepted: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function MisEvaluaciones({ theses, jwt_token, mode = 'evaluaciones' }) {
  const [tab, setTab] = useState('pendientes');
  const [responding, setResponding] = useState({});

  const handleTutorResponse = async (thesisId, response) => {
    setResponding((prev) => ({ ...prev, [thesisId]: true }));
    try {
      const res = await fetch('/api/thesis/' + thesisId + '/tutor/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al responder solicitud');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setResponding((prev) => ({ ...prev, [thesisId]: false }));
    }
  };

  if (mode === 'tutorias') {
    const pendientes = theses.filter((t) => t.tutor_status === 'pending');
    const respondidas = theses.filter((t) => t.tutor_status !== 'pending');
    const data = tab === 'pendientes' ? pendientes : respondidas;

    const tutorColumns = [
      {
        key: 'title',
        label: 'Título',
        render: (val, row) => (
          <span onClick={() => router.visit('/tesis/' + row.id)} className="cursor-pointer hover:text-primary transition-colors">
            {val}
          </span>
        ),
      },
      {
        key: 'user',
        label: 'Autor',
        render: (val) => val?.full_name || '—',
      },
      {
        key: 'category',
        label: 'Carrera',
        render: (val) => val?.name || '—',
      },
      {
        key: 'tutor_status',
        label: 'Tutoría',
        render: (val) => (
          <span className={`${tutorStatusColors[val] || 'bg-gray-400'} text-white text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
            {tutorStatusLabels[val] || val || '—'}
          </span>
        ),
      },
      {
        key: 'acciones',
        label: '',
        render: (_, row) => (
          row.tutor_status === 'pending' ? (
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleTutorResponse(row.id, 'accepted'); }}
                disabled={responding[row.id]}
                className="bg-green-600 text-white border-none px-4 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer hover:bg-green-700 transition-colors whitespace-nowrap font-card-meta disabled:opacity-60"
              >
                Aceptar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleTutorResponse(row.id, 'rejected'); }}
                disabled={responding[row.id]}
                className="bg-red-600 text-white border-none px-4 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer hover:bg-red-700 transition-colors whitespace-nowrap font-card-meta disabled:opacity-60"
              >
                Rechazar
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); router.visit('/tesis/' + row.id); }}
              className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-4 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors whitespace-nowrap font-card-meta"
            >
              Ver
            </button>
          )
        ),
      },
    ];

    return (
      <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
        <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
          <BackButton />
          <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-2">
            Mis Tutorías
          </h1>
          <p className="text-card-label text-sm mb-6">
            Solicitudes de tutoría asignadas a tu cuenta
          </p>

          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-[#2a2a2a] rounded-[12px] p-1 w-fit">
            <button
              onClick={() => setTab('pendientes')}
              className={`px-5 py-2 rounded-[10px] text-sm font-card-meta font-[600] cursor-pointer border-none transition-colors ${
                tab === 'pendientes'
                  ? 'bg-white dark:bg-[#444] text-card-heading shadow-sm'
                  : 'text-card-label hover:text-card-heading bg-transparent'
              }`}
            >
              Pendientes ({pendientes.length})
            </button>
            <button
              onClick={() => setTab('respondidas')}
              className={`px-5 py-2 rounded-[10px] text-sm font-card-meta font-[600] cursor-pointer border-none transition-colors ${
                tab === 'respondidas'
                  ? 'bg-white dark:bg-[#444] text-card-heading shadow-sm'
                  : 'text-card-label hover:text-card-heading bg-transparent'
              }`}
            >
              Respondidas ({respondidas.length})
            </button>
          </div>

          <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-hidden">
            <Table columns={tutorColumns} data={data} />
          </div>
        </div>
      </div>
    );
  }

  const evaluatedIds = new Set();
  theses.forEach((t) => {
    if (t.evaluations?.length > 0) {
      evaluatedIds.add(t.id);
    }
  });

  const pendientes = theses.filter((t) => !evaluatedIds.has(t.id));
  const evaluadas = theses.filter((t) => evaluatedIds.has(t.id));
  const data = tab === 'pendientes' ? pendientes : evaluadas;

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
    {
      key: 'user',
      label: 'Autor',
      render: (val) => val?.full_name || '—',
    },
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
      label: 'Asignado',
      render: (val) => val ? new Date(val).toLocaleDateString('es-BO') : '—',
    },
    {
      key: 'acciones',
      label: '',
      render: (_, row) => {
        const hasEvaluation = evaluatedIds.has(row.id);
        return (
          <button
            onClick={(e) => { e.stopPropagation(); router.visit('/evaluar/' + row.id) }}
            className={`border-none px-4 h-[34px] rounded-[8px] text-[12px] font-[600] cursor-pointer transition-colors whitespace-nowrap font-card-meta inline-flex items-center gap-1.5 ${
              hasEvaluation
                ? 'bg-gray-200 dark:bg-[#444] text-card-value hover:bg-gray-300 dark:hover:bg-[#555]'
                : 'bg-primary text-text-on-primary hover:bg-primary-light'
            }`}
          >
            {hasEvaluation ? (
              <><FiCheckCircle className="size-3.5" /> Ver Evaluación</>
            ) : (
              <><FiStar className="size-3.5" /> Evaluar</>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
        <BackButton />
        <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-2">
          Mis Evaluaciones
        </h1>
        <p className="text-card-label text-sm mb-6">
          Tesis y proyectos asignados para evaluación
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-[#2a2a2a] rounded-[12px] p-1 w-fit">
          <button
            onClick={() => setTab('pendientes')}
            className={`px-5 py-2 rounded-[10px] text-sm font-card-meta font-[600] cursor-pointer border-none transition-colors ${
              tab === 'pendientes'
                ? 'bg-white dark:bg-[#444] text-card-heading shadow-sm'
                : 'text-card-label hover:text-card-heading bg-transparent'
            }`}
          >
            Pendientes ({pendientes.length})
          </button>
          <button
            onClick={() => setTab('evaluadas')}
            className={`px-5 py-2 rounded-[10px] text-sm font-card-meta font-[600] cursor-pointer border-none transition-colors ${
              tab === 'evaluadas'
                ? 'bg-white dark:bg-[#444] text-card-heading shadow-sm'
                : 'text-card-label hover:text-card-heading bg-transparent'
            }`}
          >
            Evaluadas ({evaluadas.length})
          </button>
        </div>

        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-hidden">
          <Table columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
