import { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { FaBars, FaMoon, FaSun } from 'react-icons/fa';

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
				<div className="absolute right-0 top-full mt-2 w-[220px] bg-white dark:bg-[#2a2a2a] rounded-[12px] shadow-lg border border-gray-200 dark:border-[#3a3a3a] overflow-hidden z-50">
					{user && (
						<div className="px-4 py-3 text-card-heading text-[14px] font-card-title truncate border-b border-gray-100 dark:border-[#3a3a3a]">
							{user.full_name || user.email || 'Usuario'}
						</div>
					)}

					<div className="py-1">
						<div
							onClick={() => { router.visit('/'); setOpen(false) }}
							className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer"
						>
							Publicaciones
						</div>
						<div
							onClick={() => { router.visit('/mis-proyectos'); setOpen(false) }}
							className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer"
						>
							Mis Proyectos
						</div>
						<div className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Perfil
						</div>
						<div onClick={() => { router.visit('/pagos'); setOpen(false) }} className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer">
							Pagos
						</div>
					</div>

					<div className="border-t border-gray-100 dark:border-[#3a3a3a]" />

					<div className="py-1">
						<div
							onClick={() => { onToggleTheme(); setOpen(false) }}
							className="px-4 py-2 text-card-label text-[13px] font-card-meta hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer flex items-center gap-2"
						>
							{isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
							{isDark ? 'Modo Claro' : 'Modo Oscuro'}
						</div>

						<div
							onClick={handleLogout}
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
