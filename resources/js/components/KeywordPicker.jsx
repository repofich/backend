import { useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';

const normalize = (value) => value.trim().replace(/\s+/g, ' ');
const sameKeyword = (a, b) => a.toLocaleLowerCase() === b.toLocaleLowerCase();

export default function KeywordPicker({ options = [], value = [], onChange, error }) {
    const [query, setQuery] = useState('');

    const selected = value.map(normalize).filter(Boolean);
    const optionNames = options.map((option) => normalize(option.name || option)).filter(Boolean);
    const normalizedQuery = normalize(query);

    const filteredOptions = useMemo(() => {
        const q = normalizedQuery.toLocaleLowerCase();

        return optionNames
            .filter((name) => !selected.some((item) => sameKeyword(item, name)))
            .filter((name) => !q || name.toLocaleLowerCase().includes(q))
            .slice(0, 8);
    }, [normalizedQuery, optionNames, selected]);

    const canAddQuery = normalizedQuery
        && !selected.some((item) => sameKeyword(item, normalizedQuery))
        && !optionNames.some((item) => sameKeyword(item, normalizedQuery));

    const addKeyword = (keyword) => {
        const name = normalize(keyword);
        if (!name || selected.some((item) => sameKeyword(item, name))) return;
        onChange([...selected, name]);
        setQuery('');
    };

    const removeKeyword = (keyword) => {
        onChange(selected.filter((item) => !sameKeyword(item, keyword)));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword(filteredOptions[0] || normalizedQuery);
        }

        if (e.key === 'Backspace' && !query && selected.length > 0) {
            removeKeyword(selected[selected.length - 1]);
        }
    };

    return (
        <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-card-label text-[13px] sm:text-[14px] font-card-meta">
                Palabras clave
            </label>

            <div className="rounded-[12px] bg-input-bg px-3 py-2 min-h-[54px] flex flex-wrap items-center gap-2">
                {selected.map((keyword) => (
                    <span
                        key={keyword}
                        className="bg-primary/10 text-primary text-[12px] font-card-meta px-3 h-[30px] rounded-full inline-flex items-center gap-2"
                    >
                        {keyword}
                        <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="border-none bg-transparent text-primary cursor-pointer p-0 inline-flex"
                            aria-label={'Quitar ' + keyword}
                        >
                            <FiX className="size-3.5" />
                        </button>
                    </span>
                ))}

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length ? '' : 'Buscar o agregar palabra clave'}
                    className="flex-1 min-w-[180px] h-[34px] border-none outline-none bg-transparent text-[15px] sm:text-[16px] text-input-text font-card-meta placeholder:text-input-placeholder"
                />
            </div>

            {(filteredOptions.length > 0 || canAddQuery) && (
                <div className="rounded-[12px] bg-input-bg p-2 flex flex-wrap gap-2">
                    {filteredOptions.map((keyword) => (
                        <button
                            type="button"
                            key={keyword}
                            onClick={() => addKeyword(keyword)}
                            className="border-none bg-card-bg text-card-value text-[12px] font-card-meta px-3 h-[30px] rounded-full cursor-pointer hover:text-primary transition-colors"
                        >
                            {keyword}
                        </button>
                    ))}
                    {canAddQuery && (
                        <button
                            type="button"
                            onClick={() => addKeyword(normalizedQuery)}
                            className="border-none bg-primary text-text-on-primary text-[12px] font-card-meta px-3 h-[30px] rounded-full cursor-pointer hover:bg-primary-light transition-colors"
                        >
                            Agregar "{normalizedQuery}"
                        </button>
                    )}
                </div>
            )}

            {error && (
                <span className="text-error text-[11px] font-card-meta">{error}</span>
            )}
        </div>
    );
}
