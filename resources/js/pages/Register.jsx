import { router, useForm } from '@inertiajs/react';

export default function Register({ careers }) {
	const { data, setData, post, processing, errors, setError } = useForm({
		ci: '',
		registration_number: '',
		full_name: '',
		email: '',
		career_id: '',
		password: '',
		password_confirmation: '',
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');
		const missing = Object.entries(data).filter(
			([k, v]) => k !== 'career_id' ? !String(v).trim() : !v
		);
		if (missing.length > 0) {
			setError('ci', 'Completa todos los campos');
			return;
		}
		if (data.password !== data.password_confirmation) {
			setError('Las contraseñas no coinciden');
			return;
		}
		post('/register');
	};

	const inp = (key, placeholder, type = 'text') => (
		<div className="flex flex-col gap-1">
			<input
				type={type}
				value={data[key]}
				onInput={(e) => setData(key, e.target.value)}
				placeholder={placeholder}
				className="w-full h-[48px] sm:h-[50px] rounded-[12px] border-none outline-none px-4 text-[14px] sm:text-[15px] bg-input-bg text-input-text font-card-meta placeholder:text-input-placeholder"
			/>
			{errors[key] && (
				<span className="text-error text-[11px] font-card-meta">{errors[key]}</span>
			)}
		</div>
	);

	return (
		<div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
			<div className="flex-1 flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-[560px] bg-card-bg rounded-[20px] p-8 sm:p-10 flex flex-col items-center">
					<h1 className="m-0 text-center text-card-heading text-[22px] sm:text-[26px] font-card-meta mb-8">
						Crear Cuenta
					</h1>

					<form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
						{inp('ci', 'CI')}
						{inp('registration_number', 'N° Registro')}
						{inp('full_name', 'Nombre Completo')}
						{inp('email', 'Correo Electrónico', 'email')}

						<div className="flex flex-col gap-1">
							<select
								value={data.career_id}
								onChange={(e) => setData('career_id', e.target.value)}
								className="w-full h-[48px] sm:h-[50px] rounded-[12px] border-none outline-none px-4 text-[14px] sm:text-[15px] bg-input-bg text-input-text font-card-meta cursor-pointer appearance-none"
							>
								<option value="">Seleccionar Carrera</option>
								{careers.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
							{errors.career_id && (
								<span className="text-error text-[11px] font-card-meta">{errors.career_id}</span>
							)}
						</div>

						{inp('password', 'Contraseña', 'password')}
						{inp('password_confirmation', 'Confirmar Contraseña', 'password')}

						{errors.ci && (
							<p className="m-0 text-error text-[13px] text-center font-card-meta">
								{errors.ci}
							</p>
						)}
						{errors.email && (
							<p className="m-0 text-error text-[13px] text-center font-card-meta">
								{errors.email}
							</p>
						)}
						{errors.password && (
							<p className="m-0 text-error text-[13px] text-center font-card-meta">
								{errors.password}
							</p>
						)}

						<button
							type="submit"
							disabled={processing}
							className="w-full h-[50px] sm:h-[58px] rounded-[14px] border-none bg-primary text-text-on-primary text-[16px] sm:text-[18px] font-[600] cursor-pointer hover:bg-primary-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-card-meta"
						>
							{processing ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
						</button>
					</form>

					<p className="mt-6 m-0 text-card-label text-[13px] font-card-meta">
						¿Ya tienes cuenta?{' '}
						<span
							onClick={() => router.visit('/login')}
							className="text-primary cursor-pointer hover:underline"
						>
							Inicia Sesión
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
