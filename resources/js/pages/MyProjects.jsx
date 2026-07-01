import { router } from '@inertiajs/react';
import Table from '../components/Table';

export default function MyProjects({ proyectos }) {
    const columns = [
        { key: 'title', label: 'Título' },
        { key: 'type', label: 'Tipo' },
        {
            key: 'category',
            label: 'Categoría',
            render: (_, row) => row.category?.name ?? '—',
        },
        { key: 'tutor', label: 'Tutor' },
        {
            key: 'created_at',
            label: 'Fecha',
            render: (val) => val ? new Date(val).toLocaleDateString('es-BO') : '—',
        },
    ];

    return (
        <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
            <div className="flex-1 max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta">
                        Mis Proyectos
                    </h1>
                    <button
                        onClick={() => router.visit('/crear-proyecto')}
                        className="bg-primary text-text-on-primary border-none px-6 h-[48px] rounded-[12px] text-[15px] font-[600] cursor-pointer hover:bg-primary-light transition-colors whitespace-nowrap font-card-meta"
                    >
                        + CREAR PROYECTO
                    </button>
                </div>

                <div className="bg-card-bg rounded-[16px] p-4 sm:p-6 overflow-hidden">
                    <Table columns={columns} data={proyectos} />
                </div>
            </div>
        </div>
    );
}
