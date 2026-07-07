import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FiFile, FiUpload } from 'react-icons/fi';

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

export default function EvaluarTesis({ thesis: t, evaluation, jwt_token }) {
  const isEditing = !!evaluation;

  const [score, setScore] = useState(evaluation?.score ?? '');
  const [recommendation, setRecommendation] = useState(evaluation?.recommendation ?? '');
  const [comments, setComments] = useState(evaluation?.comments ?? '');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [coherenceError, setCoherenceError] = useState(null);

  useEffect(() => {
    if (score === '' || recommendation === '') {
      setCoherenceError(null);
      return;
    }
    const s = parseInt(score, 10);
    if (isNaN(s)) {
      setCoherenceError(null);
      return;
    }
    if (s >= 60 && recommendation !== 'aprobar') {
      setCoherenceError('La nota es 60 o superior. La recomendación debe ser "Aprobar".');
    } else if (s < 60 && recommendation === 'aprobar') {
      setCoherenceError('La nota es menor a 60. No se puede aprobar la tesis.');
    } else {
      setCoherenceError(null);
    }
  }, [score, recommendation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const s = parseInt(score, 10);
    if (isNaN(s) || s < 0 || s > 100) {
      setError('La nota debe ser un número entre 0 y 100.');
      return;
    }
    if (!recommendation) {
      setError('Debe seleccionar una recomendación.');
      return;
    }
    if ((s >= 60 && recommendation !== 'aprobar') || (s < 60 && recommendation === 'aprobar')) {
      setError('La nota y la recomendación no son coherentes.');
      return;
    }

    setSubmitting(true);

    try {
      const url = isEditing
        ? '/api/thesis/' + t.id + '/evaluations/' + evaluation.id
        : '/api/thesis/' + t.id + '/evaluations';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + jwt_token,
        },
        body: JSON.stringify({
          score: s,
          recommendation,
          comments: comments || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors).flat()[0];
          throw new Error(firstError || 'Error de validación');
        }
        throw new Error(data.message || 'Error al guardar evaluación');
      }

      const evalId = data.evaluation?.id || evaluation?.id;

      if (file && evalId) {
        const formData = new FormData();
        formData.append('file', file);

        const fileRes = await fetch('/api/evaluations/' + evalId + '/file', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + jwt_token,
          },
          body: formData,
        });

        if (!fileRes.ok) {
          const fileData = await fileRes.json();
          alert('Evaluación guardada, pero hubo un error al subir el archivo: ' + (fileData.message || 'Error'));
          router.visit('/mis-evaluaciones');
          return;
        }
      }

      router.visit('/mis-evaluaciones');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[800px] mx-auto w-full px-4 sm:px-6 py-8">
        <button
          onClick={() => router.visit('/mis-evaluaciones')}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver a Mis Evaluaciones
        </button>

        <div className="bg-card-bg rounded-[20px] p-6 sm:p-8">
          <h1 className="text-card-heading text-[22px] sm:text-[26px] font-bold mb-6">
            {isEditing ? 'Editar Evaluación' : 'Evaluar Tesis'}
          </h1>

          {/* Resumen de la tesis */}
          <div className="bg-input-bg rounded-[14px] p-4 mb-6 space-y-2">
            <h2 className="text-card-heading text-lg font-bold">{t.title}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <div>
                <span className="text-card-label">Autor: </span>
                <span className="text-card-value font-semibold">{t.user?.full_name || '—'}</span>
              </div>
              <div>
                <span className="text-card-label">Carrera: </span>
                <span className="text-card-value">{t.category?.name || '—'}</span>
              </div>
            </div>
            <div>
              <span className={`${statusColors[t.status] || 'bg-gray-400'} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                {statusLabels[t.status] || t.status}
              </span>
            </div>
            {t.abstract && (
              <div>
                <p className="text-sm text-card-value line-clamp-3">{t.abstract}</p>
              </div>
            )}
            {t.files?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {t.files.map((f) => (
                  <a key={f.id} href={f.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <FiFile className="size-3" />
                    {f.file_path?.split('/').pop()}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Puntaje <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="0"
                  className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder"
                  required
                />
                <span className="text-card-label text-sm font-semibold">/ 100</span>
              </div>
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Recomendación <span className="text-red-500">*</span>
              </label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full h-[48px] rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 text-base bg-white dark:bg-[#333] text-card-value"
                required
              >
                <option value="">Seleccionar recomendación</option>
                <option value="aprobar">Aprobar</option>
                <option value="observar">Observar</option>
                <option value="rechazar">Rechazar</option>
              </select>
            </div>

            {coherenceError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-[12px] text-sm">
                {coherenceError}
              </div>
            )}

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Comentarios <span className="text-card-label text-xs">(opcional)</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows="5"
                placeholder="Observaciones, sugerencias, fundamentación de la nota..."
                className="w-full rounded-[12px] border border-gray-300 dark:border-[#555] outline-none px-4 py-3 text-base bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder resize-y"
              />
            </div>

            <div>
              <label className="block text-card-label text-sm mb-1.5">
                Archivo PDF <span className="text-card-label text-xs">(opcional)</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-2 h-[48px] rounded-[12px] border border-dashed border-gray-300 dark:border-[#555] px-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                  <FiUpload className="size-4 text-card-label" />
                  <span className="text-sm text-card-label">
                    {file ? file.name : (evaluation?.file_path ? 'Reemplazar archivo' : 'Seleccionar PDF')}
                  </span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {evaluation?.file_url && !file && (
                  <a href={evaluation.file_url} target="_blank" rel="noopener noreferrer"
                    className="text-primary text-sm hover:underline whitespace-nowrap">
                    Ver actual
                  </a>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !!coherenceError}
              className="w-full bg-primary text-white border-none py-4 rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : (isEditing ? 'ACTUALIZAR EVALUACIÓN' : 'ENVIAR EVALUACIÓN')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}