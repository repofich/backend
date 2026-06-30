import { usePage } from '@inertiajs/react';

export default function Footer() {
    const { page_visits } = usePage().props;
    const year = new Date().getFullYear();

    return (
        <footer className="bg-[#1a1a2e] dark:bg-[#0f0f1a] text-gray-300 mt-auto">
            <div className="max-w-[1200px] mx-auto px-5 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-3">Facultad Integral del Chaco</h3>
                        <p className="text-sm leading-relaxed">
                            Universidad Autónoma Gabriel René Moreno
                        </p>
                        <p className="text-sm mt-4">
                            Av. Humberto Suarez Roca, Camiri - Bolivia
                        </p>
                        <p className="text-sm">
                            Tel: (591) 78128007
                        </p>
                        <p className="text-sm">
                            Email: fich@uagrm.edu.bo
                        </p>
                    </div>

                    <div className="sm:text-right">
                        <h3 className="text-white text-lg font-bold mb-3">Repositorio Institucional</h3>
                        <p className="text-sm leading-relaxed">
                            Repositorio digital de tesis y trabajos de investigación
                        </p>
                        <p className="text-sm mt-4">
                            {page_visits ? `${page_visits.toLocaleString('es-BO')} visitas a esta página` : ''}
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
                    &copy; {year} Repositorio Institucional FICH - UAGRM. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
