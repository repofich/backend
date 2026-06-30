import { useForm } from '@inertiajs/react';
import Header from '../components/Header';

CreateProject.layout = null;

export default function CreateProject({ categories, tutors, types }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        abstract: '',
        tutor: '',
        tutor_id: '',
        category_id: '',
        type: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/crear-proyecto');
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
                    <option key={opt.id || opt} value={opt.id || opt}>
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
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[800px] bg-card-bg rounded-[20px] p-8 sm:p-10 flex flex-col items-center">
                    <h1 className="m-0 text-center text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-8">
                        Crear un nuevo proyecto
                    </h1>

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {input('title', 'Nombre del Proyecto', 'Nombre del Proyecto')}
                            {select('type', 'Tipo de Proyecto', types, 'Seleccionar tipo')}
                            {select('category_id', 'Categoría / Carrera', categories, 'Seleccionar categoría')}
                            {input('tutor', 'Sugerencia de Revisor o Tutor', 'Nombre del tutor')}
                            {select('tutor_id', 'Seleccionar Tutor (opcional)', tutors, 'Seleccionar tutor')}

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

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-[50px] sm:h-[58px] rounded-[14px] border-none bg-primary text-text-on-primary text-[16px] sm:text-[18px] font-[600] cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-card-meta"
                        >
                            {processing ? 'CREANDO PROYECTO...' : 'CREAR PROYECTO'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
