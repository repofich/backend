import { router, usePage } from '@inertiajs/react';
import { FaMoon, FaSun } from 'react-icons/fa';
import Header from './Header';
import GlobalMenu from './GlobalMenu';
import Footer from './Footer';
import { useTheme } from '../hooks/useTheme';

export default function AppLayout({ children }) {
	const { auth } = usePage().props;
	const { isDark, toggleTheme } = useTheme();

	return (
		<div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
			<Header>
				{auth?.user ? (
					<GlobalMenu isDark={isDark} onToggleTheme={toggleTheme} />
				) : (
					<div className="flex items-center gap-2 sm:gap-3">
						<button
							onClick={toggleTheme}
							className="bg-bg-card border border-gray-200 dark:border-[#3a3a3a] w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow text-text-primary text-sm sm:text-base"
							aria-label="Toggle theme"
						>
							{isDark ? <FaSun /> : <FaMoon />}
						</button>
						<button
							onClick={() => router.visit('/login')}
							className="bg-primary text-text-on-primary border-none px-4 sm:px-8 h-[36px] sm:h-[56px] md:h-[70px] rounded-[10px] sm:rounded-[16px] md:rounded-[20px] text-[11px] sm:text-[14px] md:text-[18px] cursor-pointer font-[500] hover:bg-primary-light transition-colors whitespace-nowrap"
						>
							INICIAR SESION
						</button>
					</div>
				)}
			</Header>
			{children}
			<Footer />
		</div>
	);
}
