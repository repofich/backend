import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FiSearch, FiPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiKey, FiTrash2, FiX } from 'react-icons/fi';
import BackButton from '../components/BackButton';

const userTypeLabels = {
  estudiante: 'Estudiante',
  docente: 'Docente',
  tribunal: 'Tribunal',
  director: 'Director',
  vicedecano: 'Vicedecano',
  admin: 'Administrador',
};

const userTypeBadgeColors = {
  estudiante: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  docente: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  tribunal: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  director: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  vicedecano: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  admin: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
};

export default function AdminUsers({ users, filters: initialFilters, filterOptions, jwt_token }) {
  const [filters, setFilters] = useState(initialFilters || {});
  const [actionLoading, setActionLoading] = useState(null);
  const [resetPasswords, setResetPasswords] = useState({});

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.visit('/admin/usuarios?' + params.toString());
  };

  const handleClearFilters = () => {
    router.visit('/admin/usuarios');
  };

  const apiCall = async (url, method, body = null) => {
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token } : { 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
        body: body ? JSON.stringify(body) : null,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error');
      }
      return await res.json();
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm('¿Eliminar usuario "' + userName + '" permanentemente?')) return;
    setActionLoading('delete-' + userId);
    const result = await apiCall('/api/users/' + userId, 'DELETE');
    if (result) router.reload();
    setActionLoading(null);
  };

  const handleToggleActive = async (userId) => {
    setActionLoading('toggle-' + userId);
    const result = await apiCall('/api/users/' + userId + '/toggle-active', 'POST');
    if (result) router.reload();
    setActionLoading(null);
  };

  const handleResetPassword = async (userId) => {
    const pwd = resetPasswords[userId];
    if (!pwd || pwd.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setActionLoading('reset-' + userId);
    const result = await apiCall('/api/users/' + userId + '/reset-password', 'POST', { password: pwd });
    if (result) {
      setResetPasswords((prev) => ({ ...prev, [userId]: '' }));
      alert('Contraseña restablecida.');
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <BackButton />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta">
              Administración de Usuarios
            </h1>
            <p className="text-card-label text-sm mt-1">
              {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => router.visit('/admin/usuarios/crear')}
            className="bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors whitespace-nowrap font-card-meta inline-flex items-center gap-2"
          >
            <FiPlus className="size-4" />
            CREAR USUARIO
          </button>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-card-bg rounded-[16px] p-4 sm:p-6 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-card-label mb-1">Buscar</label>
              <input
                type="text"
                value={filters.query || ''}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Nombre, correo o CI"
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
              />
            </div>
            <div className="w-[200px]">
              <label className="block text-xs text-card-label mb-1">Rol</label>
              <select
                value={filters.user_type || ''}
                onChange={(e) => handleFilterChange('user_type', e.target.value)}
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value"
              >
                <option value="">Todos los roles</option>
                {Object.entries(filterOptions?.user_types || {}).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className="w-[160px]">
              <label className="block text-xs text-card-label mb-1">Estado</label>
              <select
                value={filters.is_active ?? ''}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                className="w-full h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value"
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit"
                className="bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center gap-2">
                <FiSearch className="size-4" />
                Buscar
              </button>
              <button type="button" onClick={handleClearFilters}
                className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-5 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-2">
                <FiX className="size-4" />
                Limpiar
              </button>
            </div>
          </div>
        </form>

        {/* Tabla */}
        <div className="bg-card-bg rounded-[16px] overflow-x-auto">
          <table className="w-full border-collapse font-card-meta">
            <thead>
              <tr className="bg-primary text-text-on-primary">
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Nombre</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Email</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">CI</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Rol</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Estado</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Creado</th>
                <th className="text-left px-4 py-3 text-[13px] font-[600]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-card-label text-sm">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id}
                    className="border-b border-gray-200 dark:border-[#3a3a3a] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                    <td className="px-4 py-3 text-[13px] text-card-value font-semibold">{u.full_name}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value">{u.email}</td>
                    <td className="px-4 py-3 text-[13px] text-card-value">{u.ci || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${userTypeBadgeColors[u.user_type] || ''}`}>
                        {userTypeLabels[u.user_type] || u.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-card-label">
                      {new Date(u.created_at).toLocaleDateString('es-BO')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {/* Editar */}
                        <button onClick={() => router.visit('/admin/usuarios/' + u.id + '/editar')}
                          className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-1.5">
                          <FiEdit2 className="size-3" />
                          Editar
                        </button>

                        {/* Activar / Desactivar */}
                        <button onClick={() => handleToggleActive(u.id)}
                          disabled={actionLoading === 'toggle-' + u.id}
                          className={`border px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer transition-colors font-card-meta inline-flex items-center gap-1.5 disabled:opacity-60 ${u.is_active ? 'border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'border-green-300 dark:border-green-700 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                          <FiToggleLeft className="size-3" />
                          {actionLoading === 'toggle-' + u.id ? '...' : (u.is_active ? 'Desactivar' : 'Activar')}
                        </button>

                        {/* Eliminar */}
                        <button onClick={() => handleDeleteUser(u.id, u.full_name)}
                          disabled={actionLoading === 'delete-' + u.id}
                          className="border border-red-300 dark:border-red-700 text-red-600 px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-card-meta inline-flex items-center gap-1.5 disabled:opacity-60">
                          <FiTrash2 className="size-3" />
                          {actionLoading === 'delete-' + u.id ? '...' : 'Eliminar'}
                        </button>

                        {/* Restablecer contraseña */}
                        <div className="flex gap-1 items-center">
                          <input type="text" value={resetPasswords[u.id] || ''}
                            onChange={(e) => setResetPasswords((prev) => ({ ...prev, [u.id]: e.target.value }))}
                            placeholder="Nueva contraseña"
                            className="flex-1 h-[32px] rounded-[8px] border border-gray-300 dark:border-[#555] outline-none px-2 text-[11px] bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder" />
                          <button onClick={() => handleResetPassword(u.id)}
                            disabled={actionLoading === 'reset-' + u.id || !resetPasswords[u.id] || resetPasswords[u.id].length < 8}
                            className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-2.5 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors disabled:opacity-50 inline-flex items-center gap-1">
                            <FiKey className="size-3" />
                          </button>
                        </div>
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