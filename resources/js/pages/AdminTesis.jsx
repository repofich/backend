import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FiSearch, FiEye, FiX } from 'react-icons/fi';
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

const validTransitions = {
  borrador: ['en_revision'],
  en_revision: ['observado', 'aprobado', 'rechazado'],
  observado: ['en_revision'],
  aprobado: ['publicado'],
  publicado: [],
  rechazado: ['borrador'],
};

export default function AdminTesis({
  theses,
  tribunal_users,
  filters: initialFilters,
  filterOptions,
  jwt_token,
}) {
  const [filters, setFilters] = useState(initialFilters || {});
  const [assigning, setAssigning] = useState({});
  const [statusChanging, setStatusChanging] = useState({});

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.visit('/admin/tesis?' + params.toString());
  };

  const handleClearFilters = () => {
    router.visit('/admin/tesis');
  };

  const handleAssignEvaluator = async (thesisId, userId) => {
    if (!userId) return;
    setAssigning((prev) => ({ ...prev, [thesisId]: true }));
    try {
      const res = await fetch('/api/thesis/' + thesisId + '/evaluator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({ user_id: parseInt(userId) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al asignar');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setAssigning((prev) => ({ ...prev, [thesisId]: false }));
    }
  };

  const handleRemoveEvaluator = async (thesisId) => {
    if (!confirm('¿Remover evaluador asignado?')) return;
    setAssigning((prev) => ({ ...prev, [thesisId]: true }));
    try {
      const res = await fetch('/api/thesis/' + thesisId + '/evaluator', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al remover');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setAssigning((prev) => ({ ...prev, [thesisId]: false }));
    }
  };

  const handleChangeStatus = async (thesisId, status) => {
    if (!status) return;
    setStatusChanging((prev) => ({ ...prev, [thesisId]: true }));
    try {
      const res = await fetch('/api/thesis/' + thesisId + '/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al cambiar estado');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setStatusChanging((prev) => ({ ...prev, [thesisId]: false }));
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
      key: 'tutor_user',
      label: 'Tutor',
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
      key: 'assigned_evaluator',
      label: 'Evaluador',
      render: (val) => val?.full_name || '—',
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => {
        const transitions = validTransitions[row.status] || [];
        const isAssigning = assigning[row.id];
        const isChanging = statusChanging[row.id];

        return (
          <div className="flex flex-col gap-2 min-w-[200px]">
            {/* Asignar evaluador */}
            <div className="flex gap-1 items-center">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'remove') {
                    handleRemoveEvaluator(row.id);
                  } else if (val) {
                    handleAssignEvaluator(row.id, val);
                  }
                }}
                disabled={isAssigning}
                className="flex-1 h-[32px] rounded-[8px] border border-gray-300 dark:border-[#555] outline-none px-2 text-[11px] bg-white dark:bg-[#333] text-card-value disabled:opacity-60"
                defaultValue=""
              >
                <option value="" disabled>
                  {row.assigned_evaluator ? 'Cambiar evaluador' : 'Asignar evaluador'}
                </option>
                {row.assigned_evaluator && (
                  <option value="remove">— Remover {row.assigned_evaluator.full_name}</option>
                )}
                {tribunal_users
                  .filter((u) => u.id !== row.assigned_evaluator?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Cambiar estado */}
            {transitions.length > 0 && (
              <div className="flex gap-1 items-center">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) handleChangeStatus(row.id, val);
                  }}
                  disabled={isChanging}
                  className="flex-1 h-[32px] rounded-[8px] border border-gray-300 dark:border-[#555] outline-none px-2 text-[11px] bg-white dark:bg-[#333] text-card-value disabled:opacity-60"
                  defaultValue=""
                >
                  <option value="" disabled>Cambiar estado</option>
                  {transitions.map((st) => (
                    <option key={st} value={st}>
                      {statusLabels[st] || st}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ver */}
            <button
              onClick={() => router.visit('/tesis/' + row.id)}
              className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center justify-center gap-1"
            >
              <FiEye className="size-3" />
              Ver
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-2">
          Gestión de Tesis
        </h1>
        <p className="text-card-label text-sm mb-6">
          Administrar evaluadores, estados y filtros de búsqueda
        </p>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-card-label mb-1">Título</label>
              <input
                type="text"
                value={filters.title || ''}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                placeholder="Buscar por título"
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
              />
            </div>
            <div>
              <label className="block text-xs text-card-label mb-1">Autor</label>
              <input
                type="text"
                value={filters.author || ''}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                placeholder="Nombre del autor"
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
              />
            </div>
            <div>
              <label className="block text-xs text-card-label mb-1">Carrera</label>
              <select
                value={filters.career || ''}
                onChange={(e) => handleFilterChange('career', e.target.value)}
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value"
              >
                <option value="">Todas</option>
                {filterOptions?.careers?.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-card-label mb-1">Tutor</label>
              <input
                type="text"
                value={filters.tutor || ''}
                onChange={(e) => handleFilterChange('tutor', e.target.value)}
                placeholder="Nombre del tutor"
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
              />
            </div>
            <div>
              <label className="block text-xs text-card-label mb-1">Estado</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value"
              >
                <option value="">Todos</option>
                {filterOptions?.statuses?.map((s) => (
                  <option key={s} value={s}>{statusLabels[s] || s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              className="bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center gap-2"
            >
              <FiSearch className="size-4" />
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-2"
            >
              <FiX className="size-4" />
              Limpiar
            </button>
          </div>
        </form>

        {/* Tabla */}
        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-x-auto">
          <Table columns={columns} data={theses} />
        </div>
      </div>
    </div>
  );
}