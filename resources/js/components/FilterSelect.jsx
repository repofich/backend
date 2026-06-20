export default function FilterSelect({ value, onChange, options, placeholder }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="bg-filter-bg text-filter-text border-none rounded-[8px] sm:rounded-[10px] px-[10px] sm:px-[14px] py-[5px] sm:py-[6px] text-[12px] sm:text-[14px] md:text-[15px] cursor-pointer"
		>
			<option value="">{placeholder}</option>
			{options?.map((opt) => (
				<option key={opt} value={opt}>
					{opt}
				</option>
			))}
		</select>
	);
}
