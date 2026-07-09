import { router, useForm } from '@inertiajs/react';
import BackButton from '../components/BackButton';

export default function Login() {
	const { data, setData, post, processing, errors, setError } = useForm({
		ci: '',
		password: '',
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		if (!data.ci.trim() || !data.password.trim()) {
			setError('Completa todos los campos');
			return;
		}
		post('/login');
	};

	return (
		<div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
			<div className="flex-1 flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
					<BackButton href="/" />
				</div>
				<div className="w-full max-w-[481px] bg-card-bg rounded-[20px] p-8 sm:p-10 flex flex-col items-center">
					<h1 className="fade-in-up fade-in-up-d1 m-0 text-center text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-4">
						Iniciar Sesión
					</h1>

					<form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
						<div className="fade-in-up fade-in-up-d2 flex flex-col gap-1.5">
							<label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
								Usuario
							</label>
							<input
								type="text"
								value={data.ci}
								onInput={(e) => setData('ci', e.target.value)}
								placeholder="ci / email"
								className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder transition-shadow duration-200 focus:shadow-[0_0_0_2px_var(--color-primary)]"
							/>
							{errors.ci && (
								<span className="text-error text-[11px] font-card-meta">{errors.ci}</span>
							)}
						</div>

						<div className="fade-in-up fade-in-up-d3 flex flex-col gap-1.5">
							<label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
								Contraseña
							</label>
							<input
								type="password"
								value={data.password}
								onInput={(e) => setData('password', e.target.value)}
								placeholder="••••••••"
								className="w-full h-[48px] sm:h-[54px] rounded-[12px] border-none outline-none px-4 text-[15px] sm:text-[16px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder transition-shadow duration-200 focus:shadow-[0_0_0_2px_var(--color-primary)]"
							/>
							{errors.password && (
								<span className="text-error text-[11px] font-card-meta">{errors.password}</span>
							)}
						</div>

						{errors.ci && (
							<p className="m-0 text-error text-[13px] text-center font-card-meta">
								{errors.ci}
							</p>
						)}

						<button
							type="submit"
							disabled={processing}
							className="fade-in-up fade-in-up-d4 w-full h-[50px] sm:h-[58px] rounded-[14px] border-none bg-primary text-text-on-primary text-[16px] sm:text-[18px] font-[600] cursor-pointer hover:bg-primary-light transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-card-meta hover:-translate-y-0.5 active:translate-y-0"
						>
							{processing ? 'INGRESANDO...' : 'INGRESAR'}
						</button>
					</form>

					<p className="fade-in-up fade-in-up-d5 mt-6 m-0 text-card-label text-[13px] font-card-meta">
						¿No tienes cuenta?{' '}
						<span
							onClick={() => router.visit('/register')}
							className="text-primary cursor-pointer hover:underline transition-colors"
						>
							Regístrate
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
