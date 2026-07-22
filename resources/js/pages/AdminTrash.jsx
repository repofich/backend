import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FiSearch, FiX, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import BackButton from '../components/BackButton';
import Table from '../components/Table';

export default function AdminTrash({ jwt_token }) {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('per_page', '100');
      const res = await fetch('/api/trash/theses?' + params.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) throw new Error('Error al cargar papelera');
      const data = await res.json();
      setTheses(data.data || []);
    } catch {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrash();
  };

  const handleClear = () => {
    setSearch('');
    router.reload();
  };

  const handleRestore = async (id) => {
    if (!confirm('¿Restaurar esta tesis?')) return;
    try {
      const res = await fetch('/api/trash/theses/' + id + '/restore', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al restaurar');
      } else {
        fetchTrash();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleForceDelete = async (id) => {
    if (!confirm('¿Eliminar permanentemente esta tesis? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch('/api/trash/theses/' + id + '/force', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al eliminar');
      } else {
        fetchTrash();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('¿Vaciar la papelera? Se eliminarán permanentemente todas las tesis con más de 30 días en la papelera.')) return;
    try {
      const res = await fetch('/api/trash/theses/empty', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al vaciar');
      } else {
        fetchTrash();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const daysRemaining = (deletedAt) => {
    const deleted = new Date(deletedAt);
    const now = new Date();
    const diff = 30 - Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const columns = [
    {
      key: 'title',
      label: 'Título',
      render: (val) => (
        <span className="text-card-value">{val || '—'}</span>
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
      key: 'deleted_at',
      label: 'Eliminado',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'dias',
      label: 'Días restantes',
      render: (_, row) => {
        const remaining = daysRemaining(row.deleted_at);
        return (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${remaining <= 5 ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'}`}>
            {remaining > 0 ? remaining + ' días' : 'Por eliminar'}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleRestore(row.id); }}
            className="bg-green-600 text-white border-none px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-green-700 transition-colors font-card-meta inline-flex items-center gap-1"
          >
            <FiRefreshCw className="size-3" />
            Restaurar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleForceDelete(row.id); }}
            className="bg-red-600 text-white border-none px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-red-700 transition-colors font-card-meta inline-flex items-center gap-1"
          >
            <FiTrash2 className="size-3" />
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <BackButton />
        <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-2">
          Papelera
        </h1>
        <p className="text-card-label text-sm mb-6">
          Tesis eliminadas. Se eliminarán permanentemente después de 30 días.
        </p>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-card-label mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Título o autor"
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center gap-2"
            >
              <FiSearch className="size-4" />
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-2"
            >
              <FiX className="size-4" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="bg-red-600 text-white border-none px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-red-700 transition-colors font-card-meta inline-flex items-center gap-2"
            >
              <FiTrash2 className="size-4" />
              Vaciar papelera
            </button>
          </div>
        </form>

        {/* Tabla */}
        <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-x-auto">
          {loading ? (
            <p className="text-text-muted text-center text-[15px] font-card-meta py-10">Cargando...</p>
          ) : (
            <Table columns={columns} data={theses} />
          )}
        </div>
      </div>
    </div>
  );
}
