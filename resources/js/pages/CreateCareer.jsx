import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FiX } from 'react-icons/fi';

const roleLabels = {
  admin: 'Administrador',
  vicedecano: 'Vicedecano',
  director: 'Director',
  tutor: 'Tutor',
  tribunal: 'Tribunal',
  docente: 'Docente',
};

export default function CreateCareer({ directors, jwt_token }) {
  const [form, setForm] = useState({
    name: '',
    director_id: '',
    knowledgeAreas: [],
  });
  const [newArea, setNewArea] = useState('');
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const addKnowledgeArea = () => {
    const area = newArea.trim();
    if (!area) return;
    if (form.knowledgeAreas.includes(area)) return;
    setForm((prev) => ({ ...prev, knowledgeAreas: [...prev.knowledgeAreas, area] }));
    setNewArea('');
  };

  const removeKnowledgeArea = (index) => {
    setForm((prev) => ({
      ...prev,
      knowledgeAreas: prev.knowledgeAreas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({
          name: form.name,
          director_id: form.director_id ? parseInt(form.director_id) : null,
          knowledge_areas: form.knowledgeAreas.length > 0 ? form.knowledgeAreas : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapped = {};
          Object.entries(data.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
          setErrors(mapped);
        }
        throw new Error(data.message || 'Error al crear carrera');
      }

      router.visit('/admin/carreras');
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
          onClick={() => router.visit('/admin/carreras')}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver
        </button>

        <div className="bg-card-bg rounded-[20px] p-6 sm:p-8">
          <h1 className="text-card-heading text-[22px] sm:text-[26px] font-bold mb-6">
            Crear Carrera
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Nombre de la carrera <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                required />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Director de carrera
              </label>
              <select value={form.director_id}
                onChange={(e) => handleChange('director_id', e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value">
                <option value="">Sin director</option>
                {directors?.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.full_name} ({roleLabels[d.user_type] || d.user_type})
                  </option>
                ))}
              </select>
              {errors.director_id && <p className="text-red-500 text-xs mt-1">{errors.director_id}</p>}
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Áreas de Conocimiento
              </label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKnowledgeArea(); } }}
                  placeholder="Agregar área"
                  className="flex-1 h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder" />
                <button type="button" onClick={addKnowledgeArea}
                  className="bg-primary text-text-on-primary border-none px-4 h-[40px] rounded-[10px] text-sm font-[600] cursor-pointer hover:bg-primary-light transition-colors">
                  Agregar
                </button>
              </div>
              {form.knowledgeAreas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.knowledgeAreas.map((area, i) => (
                    <span key={i}
                      className="inline-flex items-center gap-1 bg-gray-100 dark:bg-[#333] text-card-value text-[13px] px-3 py-1.5 rounded-full">
                      {area}
                      <button type="button" onClick={() => removeKnowledgeArea(i)}
                        className="text-card-label hover:text-red-500 transition-colors">
                        <FiX className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.knowledge_areas && <p className="text-red-500 text-xs mt-1">{errors.knowledge_areas}</p>}
            </div>

            <button type="submit" disabled={submitting}
              className="w-full bg-primary text-white border-none py-4 rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta disabled:opacity-60 disabled:cursor-not-allowed mt-6">
              {submitting ? 'Creando...' : 'CREAR CARRERA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
