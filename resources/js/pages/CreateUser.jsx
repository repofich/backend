import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function CreateUser({ careers, user_types, jwt_token }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    ci: '',
    registration_number: '',
    user_type: '',
    career_id: '',
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

    if (form.password !== form.password_confirmation) {
      setErrors((prev) => ({ ...prev, password_confirmation: 'Las contraseñas no coinciden.' }));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          ci: form.ci || null,
          registration_number: form.registration_number || null,
          user_type: form.user_type,
          career_id: form.career_id ? parseInt(form.career_id) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped = {};
          Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
          setErrors(mapped);
        }
        throw new Error(data.message || 'Error al crear usuario');
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
          <h1 className="text-card-heading text-[22px] sm:text-[26px] font-bold mb-6">
            Crear Usuario
          </h1>

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
                <label className="block text-card-label text-sm mb-1.5">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input type="password" value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                  required minLength={8} />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-card-label text-sm mb-1.5">
                  Confirmar <span className="text-red-500">*</span>
                </label>
                <input type="password" value={form.password_confirmation}
                  onChange={(e) => handleChange('password_confirmation', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                  required minLength={8} />
                {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
              </div>
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
                  <option value="">Seleccionar rol</option>
                  {Object.entries(user_types || {}).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {errors.user_type && <p className="text-red-500 text-xs mt-1">{errors.user_type}</p>}
              </div>
              <div>
                <label className="block text-card-label text-sm mb-1.5">
                  Carrera
                </label>
                <select value={form.career_id}
                  onChange={(e) => handleChange('career_id', e.target.value)}
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value">
                  <option value="">Seleccionar carrera</option>
                  {careers?.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                {errors.career_id && <p className="text-red-500 text-xs mt-1">{errors.career_id}</p>}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-primary text-white border-none py-4 rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta disabled:opacity-60 disabled:cursor-not-allowed mt-6">
              {submitting ? 'Creando...' : 'CREAR USUARIO'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}