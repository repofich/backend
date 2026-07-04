import { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';

const roleLabels = {
	estudiante: 'Estudiante',
	docente: 'Docente',
	tutor: 'Tutor',
	tribunal: 'Tribunal',
	director: 'Director',
	vicedecano: 'Vicedecano',
	admin: 'Administrador',
};

const roleBadgeColors = {
	estudiante: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
	docente: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
	tutor: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
	tribunal: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
	director: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
	vicedecano: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
	admin: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
};

export default function GlobalMenu({ isDark, onToggleTheme }) {
	const { auth } = usePage().props;
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	const user = auth?.user;

	useEffect(() => {
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const handleLogout = useCallback(async () => {
		router.post('/logout');
		setOpen(false);
	}, []);

	const nav = (path) => { router.visit(path); setOpen(false); };

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				className="bg-primary text-text-on-primary border-none w-[40px] sm:w-[50px] md:w-[56px] h-[40px] sm:h-[50px] md:h-[56px] rounded-[10px] sm:rounded-[14px] cursor-pointer hover:bg-primary-light transition-colors flex items-center justify-center"
				aria-label="Menu"
			>
				<FaBars className="text-[16px] sm:text-[20px] md:text-[24px]" />
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-2 w-[240px] bg-white dark:bg-[#2a2a2a] rounded-[12px] shadow-lg border border-gray-200 dark:border-[#3a3a3a] overflow-hidden z-50">
					{user && (
						<div className="px-4 py-3 border-b border-gray-100 dark:border-[#3a3a3a] space-y-1.5">
							<div className="text-card-heading text-[14px] font-card-title truncate leading-tight">
								{user.full_name || user.email }
							</div>
							<div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadgeColors[user.user_type] || 'bg-gray-100 text-gray-600'}`}>
								{roleLabels[user.user_type] || user.user_type || 'Usuario'}
							</div>
						</div>
					)}

					<div className="py-1">
						<div onClick={() => nav('/')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Publicaciones
						</div>

						<div onClick={() => nav('/mis-proyectos')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Mis Proyectos
						</div>

						{['tutor', 'tribunal', 'director'].includes(user?.user_type) && (
							<div onClick={() => nav('/mis-evaluaciones')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
								{user?.user_type === 'tutor' ? 'Mis Tutorías' : 'Mis Evaluaciones'}
							</div>
						)}

						{['vicedecano', 'director', 'admin'].includes(user?.user_type) && (
							<div onClick={() => nav('/admin/tesis')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
								Administrar Tesis
							</div>
						)}

						{user?.user_type === 'admin' && (
							<div onClick={() => nav('/admin/usuarios')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
								Administrar Usuarios
							</div>
						)}

						{user?.user_type === 'admin' && (
							<div onClick={() => nav('/admin/carreras')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
								Gestionar Carreras
							</div>
						)}

						<div onClick={() => nav('/perfil')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Perfil
						</div>

						<div onClick={() => nav('/pagos')} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Pagos
						</div>
					</div>

					<div className="border-t border-gray-100 dark:border-[#3a3a3a]" />

					<div className="py-1">
						<div onClick={() => { onToggleTheme(); setOpen(false) }}
							className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer flex items-center gap-2"
						>
							{isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
							{isDark ? 'Modo Claro' : 'Modo Oscuro'}
						</div>

						<div onClick={handleLogout}
							className="px-4 py-2 text-[#e60000] text-[13px] font-card-meta hover:bg-red-50 dark:hover:bg-[#3a1a1a] cursor-pointer"
						>
							Cerrar Sesión
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
