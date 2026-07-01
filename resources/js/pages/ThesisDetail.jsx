import { router } from '@inertiajs/react';
import { FiFile, FiPaperclip, FiExternalLink } from 'react-icons/fi';
import { FaGithub } from 'react-icons/fa';
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

export default function ThesisDetail({ thesis }) {
  const t = thesis;

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="max-w-[1100px] mx-auto w-full px-4 py-8">
        <button
          onClick={() => router.visit('/')}
          className="mb-4 bg-primary text-text-on-primary border-none px-5 h-[40px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors"
        >
          Volver
        </button>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
          <div className="md:grid md:grid-cols-[280px_1fr]">
            <Portada
              titulo={t.title}
              autores={t.user?.full_name || 'Sin autor'}
              carrera={t.category?.name || 'Sin carrera'}
              tutor={t.tutor_user?.full_name || t.tutor || ''}
              año={new Date(t.created_at).getFullYear()}
            />

            {/* Info — columna derecha */}
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
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-card-label mb-6">
            <span>{t.category?.name || 'Sin carrera'}</span>
            <span>{t.type || 'Tesis'}</span>
            <span>{new Date(t.created_at).getFullYear()}</span>
          </div>

          {t.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {t.tags.map((tag) => (
                <span key={tag.id} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                  {tag.name}
                </span>
              ))}
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
                  <a
                    href={t.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors inline-flex items-center gap-2"
                  >
                    <FaGithub className="size-4" />
                    GitHub
                  </a>
                )}
                {t.demo_url && (
                  <a
                    href={t.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors inline-flex items-center gap-2"
                  >
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
                  <a
                    key={file.id}
                    href={file.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-input-bg text-card-value text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors"
                  >
                    {file.is_primary ? <FiFile className="inline mr-1.5 size-4 shrink-0" /> : <FiPaperclip className="inline mr-1.5 size-4 shrink-0" />}
                    {file.file_path?.split('/').pop() || 'Archivo'}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-card-label space-y-0.5">
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
