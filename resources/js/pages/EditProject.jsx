import { useMemo } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { FiFile, FiTrash2 } from 'react-icons/fi';
import KeywordPicker from '../components/KeywordPicker';

const adminRoles = ['vicedecano', 'director', 'admin'];

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

export default function EditProject({ thesis, categories, careers, tutors, types, tags, format_config }) {
    const { auth } = usePage().props;
    const isAdmin = adminRoles.includes(auth?.user?.user_type);

    const { data, setData, post, processing, errors } = useForm({
        title: thesis.title || '',
        abstract: thesis.abstract || '',
        tutor: thesis.tutor || '',
        tutor_id: String(thesis.tutor_id || ''),
        category_id: String(thesis.category_id || ''),
        career_id: String(thesis.career_id || ''),
        type: thesis.type || '',
        repo_url: thesis.repo_url || '',
        demo_url: thesis.demo_url || '',
        keywords: thesis.tags?.map((t) => t.name) || [],
        featured: thesis.featured || false,
    });

    const selectedCareer = useMemo(
        () => careers?.find((c) => String(c.id) === data.career_id),
        [careers, data.career_id]
    );
    const careerFormatConfig = selectedCareer?.format_config ?? null;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/editar-proyecto/' + thesis.id);
    };

    const handleDelete = () => {
        if (confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
            router.delete('/eliminar-proyecto/' + thesis.id);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((f) => formData.append('files[]', f));
        router.post('/tesis/' + thesis.id + '/archivos', formData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteFile = (fileId) => {
        if (confirm('¿Eliminar este archivo?')) {
            router.delete('/tesis/' + thesis.id + '/archivos/' + fileId, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const input = (key, label, placeholder, type = 'text') => (
        <div className="flex flex-col gap-1.5">
            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                {label}
            </label>
            <input
                type={type}
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                placeholder={placeholder}
                className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
            />
            {errors[key] && (
                <span className="text-error text-[11px] font-card-meta">{errors[key]}</span>
            )}
        </div>
    );

    const select = (key, label, options, placeholder) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                {label}
            </label>
            <select
                value={data[key]}
                onChange={(e) => setData(key, e.target.value)}
                className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta cursor-pointer appearance-none"
            >
                <option value="">{placeholder}</option>
                {options?.map((opt) => (
                    <option key={opt.id || opt} value={String(opt.id || opt)}>
                        {opt.name || opt.full_name || opt}
                    </option>
                ))}
            </select>
            {errors[key] && (
                <span className="text-error text-[11px] font-card-meta">{errors[key]}</span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[800px] bg-card-bg rounded-[20px] p-8 sm:p-10 flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-8 w-full">
                        <h1 className="m-0 text-center text-card-heading text-[22px] sm:text-[26px] font-card-meta flex-1">
                            Editar proyecto
                        </h1>
                        <span className={`${statusColors[thesis.status] || 'bg-gray-400'} text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap`}>
                            {statusLabels[thesis.status] || thesis.status}
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {input('title', 'Nombre del Proyecto', 'Nombre del Proyecto')}
                            {select('type', 'Tipo de Proyecto', types, 'Seleccionar tipo')}
                            {select('category_id', 'Categoría', categories, 'Seleccionar categoría')}
                            {select('career_id', 'Carrera', careers, 'Seleccionar carrera')}
                            {select('tutor_id', 'Tutor sugerido', tutors, 'Seleccionar tutor')}
                            {(careerFormatConfig === null || careerFormatConfig?.repo_url === true) && input('repo_url', 'URL del Repositorio', 'https://github.com/...', 'url')}
                            {(careerFormatConfig === null || careerFormatConfig?.demo_url === true) && input('demo_url', 'URL de Demo', 'https://...', 'url')}

                            {(careerFormatConfig === null || careerFormatConfig?.keywords === true) && (
                                <KeywordPicker
                                    options={tags}
                                    value={data.keywords}
                                    onChange={(keywords) => setData('keywords', keywords)}
                                    error={errors.keywords}
                                />
                            )}

                            {/* Featured */}
                            {isAdmin && (
                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={data.featured}
                                        onChange={(e) => setData('featured', e.target.checked)}
                                        className="w-[18px] h-[18px] cursor-pointer accent-primary"
                                    />
                                    <label htmlFor="featured" className="text-card-label text-[13px] sm:text-[14px] font-card-meta cursor-pointer">
                                        Proyecto destacado
                                    </label>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 md:col-span-2">
                                <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                    Descripción
                                </label>
                                <textarea
                                    value={data.abstract}
                                    onChange={(e) => setData('abstract', e.target.value)}
                                    placeholder="Descripción del proyecto"
                                    rows="4"
                                    className="w-full rounded-[12px] border-none outline-none px-4 py-3 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder resize-none"
                                />
                                {errors.abstract && (
                                    <span className="text-error text-[11px] font-card-meta">{errors.abstract}</span>
                                )}
                            </div>
                        </div>

                        {/* Files */}
                        {thesis.files?.length > 0 && (
                            <div className="bg-input-bg rounded-[12px] p-4 sm:p-5">
                                <h3 className="text-card-label text-[13px] font-card-meta font-semibold uppercase tracking-wide mb-3">
                                    Archivos
                                </h3>
                                <div className="space-y-2">
                                    {thesis.files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between gap-3">
                                            <a
                                                href={file.file_path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-card-value text-[13px] font-card-meta hover:text-primary transition-colors inline-flex items-center gap-2"
                                            >
                                                <FiFile className="size-4 shrink-0" />
                                                {file.file_path?.split('/').pop() || 'Archivo'}
                                                {file.is_primary && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Principal</span>
                                                )}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="text-error hover:text-red-700 transition-colors cursor-pointer bg-transparent border-none p-1"
                                                title="Eliminar archivo"
                                            >
                                                <FiTrash2 className="size-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload file */}
                        <div className="flex flex-col gap-2">
                            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                Subir archivo
                            </label>
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg,.zip"
                                onChange={handleFileUpload}
                                className="w-full text-[13px] text-card-value font-card-meta file:mr-4 file:py-2 file:px-4 file:rounded-[10px] file:border-none file:text-[13px] file:font-card-meta file:bg-primary file:text-text-on-primary file:cursor-pointer hover:file:bg-primary-light transition-colors"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 h-[50px] sm:h-[58px] rounded-[14px] border-none bg-primary text-text-on-primary text-[16px] sm:text-[18px] font-[600] cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-card-meta"
                            >
                                {processing ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="h-[50px] sm:h-[58px] px-6 rounded-[14px] border-none bg-error text-white text-[14px] font-[600] cursor-pointer hover:bg-red-700 transition-colors font-card-meta"
                            >
                                ELIMINAR
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
