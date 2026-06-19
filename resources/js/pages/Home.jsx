import { useState, useEffect, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import Header from '../components/Header';
import GlobalMenu from '../components/GlobalMenu';
import SearchBar from '../components/SearchBar';
import PublicationCard from '../components/PublicationCard';

export default function Home({ publicaciones, filterOptions, filters }) {
	const { auth } = usePage().props;
	const [isDark, setIsDark] = useState(false);
	const [query, setQuery] = useState(filters?.query || '');
	const [activeFilters, setActiveFilters] = useState({
		año: filters?.year || '',
		carrera: filters?.career || '',
		tipo: filters?.type || '',
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const theme = localStorage.getItem('theme');
		if (theme === 'dark') {
			setIsDark(true);
			document.documentElement.classList.add('dark');
		}
	}, []);

	const toggleTheme = useCallback(() => {
		setIsDark((prev) => {
			const next = !prev;
			document.documentElement.classList.toggle('dark', next);
			localStorage.setItem('theme', next ? 'dark' : 'light');
			return next;
		});
	}, []);

	const loadPublicaciones = useCallback((filtros) => {
		setLoading(true);
		const params = {};
		if (filtros.query) params.query = filtros.query;
		if (filtros.año) params.year = filtros.año;
		if (filtros.carrera) params.career = filtros.carrera;
		if (filtros.tipo) params.type = filtros.tipo;

		router.get('/', params, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			onFinish: () => setLoading(false),
		});
	}, []);

	const handleSearch = useCallback(() => {
		loadPublicaciones({ query, ...activeFilters });
	}, [query, activeFilters, loadPublicaciones]);

	const handleQueryChange = useCallback((q) => {
		setQuery(q);
	}, []);

	const handleFilterChange = useCallback((key, value) => {
		const next = { ...activeFilters, [key]: value };
		setActiveFilters(next);
		loadPublicaciones({ query, ...next });
	}, [query, activeFilters, loadPublicaciones]);

	const handleCardClick = useCallback((pub) => {
		// TODO: navigate to detail
	}, []);

	return (
		<div className="min-h-screen bg-bg-page font-[Georgia,serif]">
			<Header>
				{auth.user ? (
					<GlobalMenu isDark={isDark} onToggleTheme={toggleTheme} />
				) : (
					<button
						onClick={() => router.visit('/login')}
						className="bg-primary text-text-on-primary border-none px-4 sm:px-8 h-[36px] sm:h-[56px] md:h-[70px] rounded-[10px] sm:rounded-[16px] md:rounded-[20px] text-[11px] sm:text-[14px] md:text-[18px] cursor-pointer font-[500] hover:bg-primary-light transition-colors whitespace-nowrap"
					>
						INICIAR SESION
					</button>
				)}
			</Header>

			<SearchBar
				query={query}
				onQueryChange={handleQueryChange}
				onSearch={handleSearch}
				filters={activeFilters}
				onFilterChange={handleFilterChange}
				filterOptions={filterOptions}
			/>

			<section className="max-w-[1200px] mx-auto px-5 py-10">
				{loading ? (
					<p className="text-center text-text-muted text-lg">Cargando publicaciones...</p>
				) : publicaciones.length === 0 ? (
					<p className="text-center text-text-muted text-lg">
						No se encontraron publicaciones con los filtros seleccionados.
					</p>
				) : (
					<>
						<p className="text-text-secondary text-sm mb-5">
							{publicaciones.length} resultado{publicaciones.length !== 1 ? 's' : ''} encontrado
							{publicaciones.length !== 1 ? 's' : ''}
						</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							{publicaciones.map((pub) => (
								<PublicationCard key={pub.id} pub={pub} onClick={handleCardClick} />
							))}
						</div>
					</>
				)}
			</section>
		</div>
	);
}
