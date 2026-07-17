const base = window._inertiaBaseUrl || '';

export function api(path, options = {}) {
    const url = path.startsWith('/') ? base + path : path;
    return fetch(url, {
        ...options,
        headers: {
            'Accept': 'application/json',
            ...options.headers,
        },
    });
}

export async function apiCall(path, method = 'GET', body = null) {
    const url = path.startsWith('/') ? base + path : path;
    const opts = {
        method,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    };
    if (body && method !== 'GET') {
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error en la petición');
    return data;
}