import { useForm } from '@inertiajs/react';
import { useState } from 'react';

const userTypeLabels = {
    estudiante: 'Estudiante',
    tutor: 'Tutor',
    tribunal: 'Tribunal',
    director: 'Director',
    vicedecano: 'Vicedecano',
    admin: 'Administrador',
};

const userTypeColors = {
    estudiante: 'bg-blue-500',
    tutor: 'bg-green-500',
    tribunal: 'bg-purple-500',
    director: 'bg-orange-500',
    vicedecano: 'bg-red-500',
    admin: 'bg-gray-500',
};

export default function Profile({ user, careers }) {
    const { data, setData, post, processing, errors } = useForm({
        full_name: user.full_name || '',
        email: user.email || '',
        career_id: user.career?.id || '',
        photo: null,
        curriculum: null,
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleCurriculumChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('curriculum', file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/perfil');
    };

    return (
        <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[600px] bg-card-bg rounded-[20px] p-8 sm:p-10 flex flex-col items-center">
                    <h1 className="m-0 text-center text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-8">
                        Mi Perfil
                    </h1>

                    {/* Photo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-card-img mb-4 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : user.photo_url ? (
                                <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-text-muted text-[40px] font-card-meta">
                                    {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <label className="text-primary text-[13px] font-card-meta cursor-pointer hover:underline">
                            Cambiar foto
                            <input type="file" accept="image/jpg,image/jpeg,image/png" onChange={handlePhotoChange} hidden />
                        </label>
                        {errors.photo && (
                            <span className="text-error text-[11px] font-card-meta mt-1">{errors.photo}</span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        {/* Basic info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="Nombre completo"
                                    className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
                                />
                                {errors.full_name && (
                                    <span className="text-error text-[11px] font-card-meta">{errors.full_name}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
                                />
                                {errors.email && (
                                    <span className="text-error text-[11px] font-card-meta">{errors.email}</span>
                                )}
                            </div>
                        </div>

                        {/* Career */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                Carrera
                            </label>
                            <select
                                value={data.career_id}
                                onChange={(e) => setData('career_id', e.target.value)}
                                className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta cursor-pointer appearance-none"
                            >
                                <option value="">Seleccionar carrera</option>
                                {careers?.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {errors.career_id && (
                                <span className="text-error text-[11px] font-card-meta">{errors.career_id}</span>
                            )}
                        </div>

                        {/* Read-only data */}
                        <div className="bg-input-bg rounded-[12px] p-4 sm:p-5 flex flex-col gap-3">
                            <h3 className="text-card-label text-[13px] font-card-meta font-semibold uppercase tracking-wide">
                                Datos de registro
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-card-label text-[11px] font-card-meta block">CI</span>
                                    <span className="text-card-value text-[14px] font-card-meta">
                                        {user.ci || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-card-label text-[11px] font-card-meta block">
                                        Nro. de Registro
                                    </span>
                                    <span className="text-card-value text-[14px] font-card-meta">
                                        {user.registration_number || '—'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-card-label text-[11px] font-card-meta block mb-1">Tipo</span>
                                <span className={`${userTypeColors[user.user_type] || 'bg-gray-400'} text-white text-[11px] font-bold px-3 py-1 rounded-full`}>
                                    {userTypeLabels[user.user_type] || user.user_type}
                                </span>
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="flex flex-col gap-2">
                            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                                Curriculum Vitae (PDF)
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                                {user.curriculum_url && (
                                    <a
                                        href={user.curriculum_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-input-bg text-card-value text-[13px] px-4 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#444] transition-colors inline-flex items-center gap-2 font-card-meta"
                                    >
                                        Ver PDF actual
                                    </a>
                                )}
                                <label className="bg-primary text-text-on-primary text-[13px] px-4 py-2.5 rounded-xl cursor-pointer hover:bg-primary-light transition-colors font-card-meta inline-flex items-center gap-2">
                                    {data.curriculum ? 'Cambiar CV' : 'Subir CV'}
                                    <input type="file" accept=".pdf" onChange={handleCurriculumChange} hidden />
                                </label>
                            </div>
                            {data.curriculum && (
                                <span className="text-card-label text-[11px] font-card-meta">
                                    Nuevo archivo: {data.curriculum.name}
                                </span>
                            )}
                            {errors.curriculum && (
                                <span className="text-error text-[11px] font-card-meta">{errors.curriculum}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-[50px] sm:h-[58px] rounded-[14px] border-none bg-primary text-text-on-primary text-[16px] sm:text-[18px] font-[600] cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-card-meta"
                        >
                            {processing ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
