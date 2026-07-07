import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FiFile, FiPaperclip, FiExternalLink, FiSend, FiStar, FiEdit2 } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
import BackButton from '../components/BackButton';
import Portada from '../components/Portada';

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

const recommendationLabels = {
  aprobar: 'Aprobado',
  observar: 'Observado',
  rechazar: 'Rechazado',
};

const recommendationColors = {
  aprobar: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  observar: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  rechazar: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const tutorStatusLabels = {
  pending: 'Pendiente de aceptación',
  accepted: 'Tutor aceptado',
  rejected: 'Tutor rechazado',
};

const tutorStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export default function ThesisDetail({ thesis, jwt_token, auth_user, tribunal_users, tutor_users }) {
  const t = thesis;
  const [submittingReview, setSubmittingReview] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [assigningTutor, setAssigningTutor] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [observations, setObservations] = useState(t.observations || '');

  const user = auth_user;
  const isOwner = user?.id === t.user?.id;
  const isAssignedEvaluator = user?.id === t.assigned_evaluator?.id;
  const isAdmin = user && ['vicedecano', 'director', 'admin'].includes(user.user_type);
  const canSubmitReview = isOwner && ['borrador', 'observado'].includes(t.status);
  const canEvaluate = isAssignedEvaluator && t.status === 'en_revision';
  const myEvaluation = t.evaluations?.find(e => e.evaluator?.id === user?.id);

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/thesis/' + t.id + '/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al enviar');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAssignEvaluator = async () => {
    if (!selectedEvaluator) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/thesis/' + t.id + '/evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
        body: JSON.stringify({ user_id: parseInt(selectedEvaluator) }),
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
      setAssigning(false);
    }
  };

  const handleAssignTutor = async () => {
    if (!selectedTutor) return;
    setAssigningTutor(true);
    try {
      const res = await fetch('/api/thesis/' + t.id + '/tutor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
        body: JSON.stringify({ user_id: parseInt(selectedTutor) }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al asignar tutor');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    } finally {
      setAssigningTutor(false);
    }
  };

  const handleRemoveEvaluator = async () => {
    if (!confirm('¿Remover evaluador?')) return;
    try {
      const res = await fetch('/api/thesis/' + t.id + '/evaluator', {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al remover');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleRemoveTutor = async () => {
    if (!confirm('¿Remover tutor?')) return;
    try {
      const res = await fetch('/api/thesis/' + t.id + '/tutor', {
        method: 'DELETE',
        headers: { 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al remover');
      } else {
        router.reload();
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleChangeStatus = async () => {
    if (!newStatus) return;
    setChangingStatus(true);
    try {
      const body = { status: newStatus };
      if (observations) body.observations = observations;
      const res = await fetch('/api/thesis/' + t.id + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer ' + jwt_token },
        body: JSON.stringify(body),
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
      setChangingStatus(false);
    }
  };

  const validTransitions = {
    borrador: ['en_revision'],
    en_revision: ['observado', 'aprobado', 'rechazado'],
    observado: ['en_revision'],
    aprobado: ['publicado'],
    publicado: [],
    rechazado: ['borrador'],
  };

  const transitions = validTransitions[t.status] || [];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="max-w-[1100px] mx-auto w-full px-4 py-8">
        <BackButton />
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          <div className="md:grid md:grid-cols-[280px_1fr]">
            <Portada
              titulo={t.title}
              autores={t.user?.full_name || 'Sin autor'}
              carrera={t.category?.name || 'Sin carrera'}
              tutor={t.tutor_user?.full_name || t.tutor || ''}
              año={new Date(t.created_at).getFullYear()}
            />

            <div className="p-6 sm:p-8 border-t md:border-t-0 md:border-l border-gray-300 dark:border-gray-600">
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-card-heading text-xl sm:text-2xl font-bold flex-1">{t.title}</h1>
            <span className={`${statusColors[t.status] || 'bg-gray-400'} text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap`}>
              {statusLabels[t.status] || t.status}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm mb-6">
            <div>
              <span className="text-card-label">Autor: </span>
              <span className="text-card-value font-semibold">{t.user?.full_name || 'Sin autor'}</span>
            </div>
            {(t.tutor_user || t.tutor) && (
              <div>
                <span className="text-card-label">Tutor: </span>
                <span className="text-card-value font-semibold">{t.tutor_user?.full_name || t.tutor}</span>
                {t.tutor_status && (
                  <span className={`${tutorStatusColors[t.tutor_status] || 'bg-gray-100 text-gray-800'} ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
                    {tutorStatusLabels[t.tutor_status] || t.tutor_status}
                  </span>
                )}
              </div>
            )}
            {t.assigned_evaluator && (
              <div>
                <span className="text-card-label">Evaluador: </span>
                <span className="text-card-value font-semibold">{t.assigned_evaluator.full_name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-card-label mb-6">
            <span>{t.category?.name || 'Sin carrera'}</span>
            <span>{t.type || 'Tesis'}</span>
            <span>{new Date(t.created_at).getFullYear()}</span>
          </div>

          {t.tags?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-card-heading text-base font-bold mb-3">Palabras clave</h3>
              <div className="flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span key={tag.id} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  {tag.name}
                </span>
              ))}
              </div>
            </div>
          )}

          {t.abstract && (
            <div className="mb-6">
              <h3 className="text-card-heading text-base font-bold mb-2">Resumen</h3>
              <p className="text-card-value text-sm leading-relaxed whitespace-pre-line">{t.abstract}</p>
            </div>
          )}

          {(t.repo_url || t.demo_url) && (
            <div className="mb-6">
              <h3 className="text-card-heading text-base font-bold mb-3">Enlaces</h3>
              <div className="flex flex-wrap gap-3">
                {t.repo_url && (
                  <a href={t.repo_url} target="_blank" rel="noopener noreferrer"
                    className="bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors inline-flex items-center gap-2">
                    <FaGithub className="size-4" />
                    GitHub
                  </a>
                )}
                {t.demo_url && (
                  <a href={t.demo_url} target="_blank" rel="noopener noreferrer"
                    className="bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors inline-flex items-center gap-2">
                    <FiExternalLink className="size-4" />
                    Demo
                  </a>
                )}
              </div>
            </div>
          )}

          {t.files?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-card-heading text-base font-bold mb-3">Archivos</h3>
              <div className="space-y-2">
                {t.files.map((file) => (
                  <a key={file.id} href={file.file_url} target="_blank" rel="noopener noreferrer"
                    className="block bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors">
                    {file.is_primary ? <FiFile className="inline mr-1.5 size-4 shrink-0" /> : <FiPaperclip className="inline mr-1.5 size-4 shrink-0" />}
                    {file.file_path?.split('/').pop() || 'Archivo'}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Evaluación */}
          {t.assigned_evaluator && (
            <div className="mb-6">
              <h3 className="text-card-heading text-base font-bold mb-3 flex items-center gap-2">
                <FiStar className="size-4" />
                Evaluación
              </h3>
              <div className="bg-input-bg rounded-xl p-4 space-y-3">
                {t.evaluations?.length > 0 ? (
                  t.evaluations.map((ev) => (
                    <div key={ev.id} className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${recommendationColors[ev.recommendation] || 'bg-gray-100 text-gray-800'}`}>
                          {recommendationLabels[ev.recommendation] || ev.recommendation}
                        </span>
                        {ev.score !== null && ev.score !== undefined && (
                          <span className="text-sm font-bold text-card-heading">
                            {ev.score}/100
                          </span>
                        )}
                        <span className="text-xs text-card-label">
                          por {ev.evaluator?.full_name || 'Evaluador'}
                        </span>
                      </div>
                      {ev.comments && (
                        <p className="text-sm text-card-value whitespace-pre-line">{ev.comments}</p>
                      )}
                      {ev.file_url && (
                        <a href={ev.file_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                          <FiFile className="size-3.5" />
                          {ev.file_path.split('/').pop()}
                        </a>
                      )}
                      {ev.submitted_at && (
                        <p className="text-xs text-card-label">
                          Evaluado el {new Date(ev.submitted_at).toLocaleDateString('es-BO')}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-card-label">Pendiente de evaluación</p>
                )}
              </div>
            </div>
          )}

          {/* Botones contextuales */}
          <div className="space-y-3">
            {canSubmitReview && (
              <button onClick={handleSubmitReview} disabled={submittingReview}
                className="w-full bg-green-600 text-white border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-green-700 transition-colors font-card-meta inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <FiSend className="size-4" />
                {submittingReview ? 'Enviando...' : 'Enviar a Revisión'}
              </button>
            )}

            {canEvaluate && !myEvaluation && (
              <button onClick={() => router.visit('/evaluar/' + t.id)}
                className="w-full bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center justify-center gap-2">
                <FiStar className="size-4" />
                Evaluar esta Tesis
              </button>
            )}

            {isAssignedEvaluator && myEvaluation && (
              <button onClick={() => router.visit('/evaluar/' + t.id)}
                className="w-full bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center justify-center gap-2">
                <FiEdit2 className="size-4" />
                Editar Evaluación
              </button>
            )}

            {isAdmin && (
              <div className="border-t pt-4 mt-4 space-y-3">
                <h4 className="text-sm font-bold text-card-heading">Administración</h4>

                <div>
                  <label className="block text-xs text-card-label mb-1">Tutor</label>
                  {t.tutor_user ? (
                    <div className="flex items-center gap-2">
                      <span className="text-card-value font-semibold">{t.tutor_user.full_name}</span>
                      <button onClick={handleRemoveTutor}
                        className="bg-red-500 text-white border-none px-3 h-[32px] rounded-[8px] text-[11px] cursor-pointer hover:bg-red-600 transition-colors">
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select value={selectedTutor} onChange={(e) => setSelectedTutor(e.target.value)}
                        className="flex-1 h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value">
                        <option value="">Seleccionar tutor</option>
                        {tutor_users?.map((u) => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                      <button onClick={handleAssignTutor} disabled={!selectedTutor || assigningTutor}
                        className="bg-primary text-text-on-primary border-none px-4 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-50 whitespace-nowrap">
                        {assigningTutor ? '...' : 'Asignar'}
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-card-label mb-1">Asignar Evaluador</label>
                  <div className="flex gap-2">
                    <select value={selectedEvaluator} onChange={(e) => setSelectedEvaluator(e.target.value)}
                      className="flex-1 h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value">
                      <option value="">Seleccionar tribunal</option>
                      {tribunal_users?.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                    {t.assigned_evaluator ? (
                      <button onClick={handleRemoveEvaluator}
                        className="bg-red-500 text-white border-none px-4 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-red-600 transition-colors whitespace-nowrap">
                        Remover
                      </button>
                    ) : (
                      <button onClick={handleAssignEvaluator} disabled={!selectedEvaluator || assigning}
                        className="bg-primary text-text-on-primary border-none px-4 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-50 whitespace-nowrap">
                        {assigning ? '...' : 'Asignar'}
                      </button>
                    )}
                  </div>
                </div>

                {transitions.length > 0 && (
                  <div>
                    <label className="block text-xs text-card-label mb-1">Cambiar Estado</label>
                    <div className="flex gap-2">
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                        className="flex-1 h-[40px] rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 text-sm bg-white dark:bg-[#333] text-card-value">
                        <option value="">Seleccionar estado</option>
                        {transitions.map((st) => (
                          <option key={st} value={st}>{statusLabels[st] || st}</option>
                        ))}
                      </select>
                      <button onClick={handleChangeStatus} disabled={!newStatus || changingStatus}
                        className="bg-primary text-text-on-primary border-none px-4 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-50 whitespace-nowrap">
                        {changingStatus ? '...' : 'Cambiar'}
                      </button>
                    </div>
                  </div>
                )}

                {(transitions.length > 0) && (
                  <div>
                    <label className="block text-xs text-card-label mb-1">Observaciones</label>
                    <textarea value={observations} onChange={(e) => setObservations(e.target.value)}
                      placeholder="Notas para el autor..."
                      rows="3"
                      className="w-full rounded-[10px] border border-gray-300 dark:border-[#555] outline-none px-3 py-2 text-sm bg-white dark:bg-[#333] text-card-value placeholder:text-input-placeholder resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-xs text-card-label space-y-0.5 mt-6">
            {t.observations && <p>Observaciones: {t.observations}</p>}
            {t.published_at && <p>Publicado: {new Date(t.published_at).toLocaleDateString('es-BO')}</p>}
            <p>Creado: {new Date(t.created_at).toLocaleDateString('es-BO')}</p>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
