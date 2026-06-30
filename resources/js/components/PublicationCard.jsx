import Portada from './Portada';

export default function PublicationCard({ pub, onClick }) {
	return (
		<div
			onClick={() => onClick?.(pub)}
			className="bg-card-bg rounded-[8px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex p-3 sm:p-4 md:p-[24px] gap-2 sm:gap-4 md:gap-[22px]"
		>
			<div className="w-[100px] sm:w-[120px] md:w-[151px] h-[125px] sm:h-[150px] md:h-[189px] flex-shrink-0 rounded-[6px] sm:rounded-[8px] bg-card-img flex flex-col items-center justify-center text-center p-2 overflow-hidden">
				{pub.imagen ? (
					<img src={pub.imagen} alt={pub.titulo} className="w-full h-full object-cover" />
				) : (
					<Portada
						compact
						titulo={pub.titulo}
						autores={pub.autores}
						año={pub.año}
					/>
				)}
			</div>

			<div className="flex-1 flex flex-col">
				<h3 className="m-0 text-card-heading text-[12px] sm:text-[13px] md:text-[15px] lg:text-[17px] xl:text-[20px] leading-tight line-clamp-2 font-card-title">
					{pub.titulo}
				</h3>

				<div className="mt-auto space-y-[3px] sm:space-y-[4px] md:space-y-[6px] font-card-meta">
					<div className="flex items-baseline gap-1 flex-wrap">
						<span className="text-card-label text-[9px] sm:text-[10px] md:text-[11px]">Por:</span>
						<span className="text-card-value text-[9px] sm:text-[10px] md:text-[12px]">{pub.autores}</span>
					</div>
					<div className="flex items-baseline gap-1 flex-wrap">
						<span className="text-card-label text-[9px] sm:text-[10px] md:text-[11px]">Carrera:</span>
						<span className="text-card-value text-[9px] sm:text-[10px] md:text-[12px]">{pub.carrera}</span>
					</div>
					<div className="flex items-baseline gap-1 flex-wrap">
						<span className="text-card-label text-[9px] sm:text-[10px] md:text-[11px]">Año:</span>
						<span className="text-card-value text-[9px] sm:text-[10px] md:text-[12px]">{pub.año}</span>
					</div>
					<div className="flex items-baseline gap-1 flex-wrap">
						<span className="text-card-label text-[9px] sm:text-[10px] md:text-[11px]">Vistas:</span>
						<span className="text-card-value text-[9px] sm:text-[10px] md:text-[12px]">{pub.vistas}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
