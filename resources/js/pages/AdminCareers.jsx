import { router } from '@inertiajs/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const rolesLabels = {
  admin: 'Administrador',
  vicedecano: 'Vicedecano',
  director: 'Director',
  tutor: 'Tutor',
  tribunal: 'Tribunal',
  docente: 'Docente',
  estudiante: 'Estudiante',
};

export default function AdminCareers({ careers, jwt_token }) {
  const handleDelete = async (careerId) => {
    if (!confirm('¿Eliminar esta carrera? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch('/api/careers/' + careerId, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al eliminar');
      router.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta">
              Gestión de Carreras
            </h1>
            <p className="text-card-label text-sm mt-1">
              {careers.length} carrera{careers.length !== 1 ? 's' : ''} registrada{careers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.visit('/admin/carreras/crear')}
            className="bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors whitespace-nowrap font-card-meta inline-flex items-center gap-2"
          >
            <FiPlus className="size-4" />
            CREAR CARRERA
          </button>
        </div>

        <div className="bg-card-bg rounded-[16px] overflow-x-auto">
          <table className="w-full border-collapse font-card-meta">
            <thead>
              <tr className="bg-primary text-text-on-primary">
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Nombre</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Director</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Áreas de Conocimiento</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Usuarios</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Creado</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {careers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-card-label text-sm">
                    No se encontraron carreras.
                  </td>
                </tr>
              ) : (
                careers.map((c) => (
                  <tr key={c.id}
                    className="border-b border-gray-200 dark:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                    <td className="px-4 py-3 text-[13px] text-card-value font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value">
                      {c.director ? (
                        <span>
                          {c.director.full_name}
                          <span className="text-card-label ml-1">({rolesLabels[c.director.user_type] || c.director.user_type})</span>
                        </span>
                      ) : (
                        <span className="text-card-label">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-value">
                      {c.knowledge_areas?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.knowledge_areas.map((area, i) => (
                            <span key={i}
                              className="inline-block bg-gray-100 dark:bg-[#333] text-card-label text-[11px] px-2 py-0.5 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-card-label">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-value">{c.users_count || 0}</td>
                    <td className="px-4 py-3 text-[13px] text-card-label">
                      {new Date(c.created_at).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => router.visit('/admin/carreras/' + c.id + '/editar')}
                          className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-1.5">
                          <FiEdit2 className="size-3" />
                          Editar
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="border border-red-300 dark:border-red-700 bg-transparent text-red-600 px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-card-meta inline-flex items-center gap-1.5">
                          <FiTrash2 className="size-3" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
