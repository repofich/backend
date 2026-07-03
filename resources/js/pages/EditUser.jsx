import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function EditUser({ user: u, careers, user_types, jwt_token }) {
  const currentCareerId = u.career_id ?? u.career?.id ?? '';

  const [form, setForm] = useState({
    full_name: u.full_name || '',
    email: u.email || '',
    ci: u.ci || '',
    registration_number: u.registration_number || '',
    user_type: u.user_type || '',
    career_id: currentCareerId ? String(currentCareerId) : '',
  });
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const body = {};
      if (form.full_name !== u.full_name) body.full_name = form.full_name;
      if (form.email !== u.email) body.email = form.email;
      if (form.ci !== (u.ci || '')) body.ci = form.ci || null;
      if (form.registration_number !== (u.registration_number || '')) body.registration_number = form.registration_number || null;
      if (form.user_type !== u.user_type) body.user_type = form.user_type;
      if (parseInt(form.career_id) !== Number(currentCareerId)) body.career_id = parseInt(form.career_id);

      if (Object.keys(body).length === 0) {
        router.visit('/admin/usuarios');
        return;
      }

      const res = await fetch('/api/users/' + u.id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped = {};
          Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
          setErrors(mapped);
        }
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      router.visit('/admin/usuarios');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[600px] mx-auto w-full px-4 sm:px-6 py-8">
        <button
          onClick={() => router.visit('/admin/usuarios')}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver
        </button>

        <div className="bg-card-bg rounded-[20px] p-6 sm:p-8">
          <h1 className="text-card-heading text-[22px] sm:text-[26px] font-bold mb-2">
            Editar Usuario
          </h1>
          <p className="text-card-label text-sm mb-6">{u.full_name}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                required />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                required />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-card-label text-sm mb-1.5">CI</label>
                <input type="text" value={form.ci}
                  onChange={(e) => handleChange('ci', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder" />
                {errors.ci && <p className="text-red-500 text-xs mt-1">{errors.ci}</p>}
              </div>
              <div>
                <label className="block text-card-label text-sm mb-1.5">Registro</label>
                <input type="text" value={form.registration_number}
                  onChange={(e) => handleChange('registration_number', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder" />
                {errors.registration_number && <p className="text-red-500 text-xs mt-1">{errors.registration_number}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-card-label text-sm mb-1.5">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select value={form.user_type}
                  onChange={(e) => handleChange('user_type', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value"
                  required>
                  {Object.entries(user_types || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.user_type && <p className="text-red-500 text-xs mt-1">{errors.user_type}</p>}
              </div>
              <div>
                <label className="block text-card-label text-sm mb-1.5">
                  Carrera <span className="text-red-500">*</span>
                </label>
                <select value={form.career_id}
                  onChange={(e) => handleChange('career_id', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value"
                  required>
                  {careers?.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                {errors.career_id && <p className="text-red-500 text-xs mt-1">{errors.career_id}</p>}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-primary text-white border-none py-4 rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta disabled:opacity-60 disabled:cursor-not-allowed mt-6">
              {submitting ? 'Guardando...' : 'GUARDAR CAMBIOS'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
