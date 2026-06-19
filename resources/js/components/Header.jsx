export default function Header({ children }) {
	return (
		<header className="bg-bg-header px-4 sm:px-[45px] py-4 sm:py-[32px] flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
			<div className="flex items-start gap-3 sm:gap-[18px]">
				<img
					src="/logo.png"
					alt="Logo FICH"
					className="w-[50px] sm:w-[85px] object-contain"
				/>
				<div>
					<h1 className="m-0 text-text-primary text-[16px] sm:text-[22px] md:text-[28px] font-[400] leading-[1.1]">
						Repositorio Institucional
					</h1>
					<h2 className="mt-[2px] m-0 text-text-primary text-[16px] sm:text-[22px] md:text-[28px] font-[400] leading-[1.1]">
						Facultad Integral del Chaco
					</h2>
					<p className="mt-[2px] sm:mt-[6px] text-text-secondary text-[11px] sm:text-[14px] md:text-[16px]">
						Universidad Autonoma Gabriel Rene Moreno
					</p>
				</div>
			</div>

			<div className="flex items-center gap-3 sm:gap-4 self-end sm:self-auto">
				{children}
			</div>
		</header>
	);
}
