import { FaSearch } from 'react-icons/fa';
import FilterSelect from './FilterSelect';


export default function SearchBar({
	query,
	onQueryChange,
	onSearch,
	filters,
	onFilterChange,
	filterOptions,
}) {
	const handleKeyDown = (e) => {
		if (e.key === 'Enter') onSearch();
	};

	return (
		<section className="bg-bg-search px-4 sm:px-5 py-4 sm:py-[30px] flex flex-col items-center">
			<h2 className="text-[14px] sm:text-[18px] md:text-[24px] font-[400] text-text-primary mb-3 sm:mb-[22px] text-center">
				Busca Tesis, Investigaciones y Proyectos Indexados
			</h2>

			<div className="flex items-center gap-2 sm:gap-[30px] mb-3 sm:mb-[22px] w-full sm:w-auto max-w-[600px]">
				<input
					type="text"
					value={query}
					onInput={(e) => onQueryChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Busqueda"
					className="flex-1 sm:w-[470px] sm:flex-none h-[40px] sm:h-[56px] md:h-[68px] rounded-[12px] sm:rounded-[18px] md:rounded-[22px] border-none outline-none px-3 sm:px-5 md:px-[30px] text-[14px] sm:text-[18px] md:text-[22px] bg-bg-input text-text-muted"
				/>

				<button
					onClick={onSearch}
					className="w-[40px] sm:w-[56px] md:w-[72px] h-[40px] sm:h-[56px] md:h-[72px] rounded-[10px] sm:rounded-[14px] md:rounded-[18px] border-none bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-light transition-colors flex-shrink-0"
				>
					<FaSearch color="white" className="text-[16px] sm:text-[22px] md:text-[30px]" />
				</button>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2 sm:gap-[14px]">
				<span className="text-[13px] sm:text-[16px] md:text-[18px] text-text-secondary">Filtros:</span>

				<FilterSelect
					value={filters.año}
					onChange={(v) => onFilterChange('año', v)}
					options={filterOptions.años}
					placeholder="año"
				/>

				<FilterSelect
					value={filters.carrera}
					onChange={(v) => onFilterChange('carrera', v)}
					options={filterOptions.carreras}
					placeholder="carrera"
				/>

				<FilterSelect
					value={filters.tipo}
					onChange={(v) => onFilterChange('tipo', v)}
					options={filterOptions.tipos}
					placeholder="tipo"
				/>
			</div>
		</section>
	);
}
