import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AppLayout from './components/AppLayout';

const originalVisit = router.visit.bind(router);

function withBaseUrl(url) {
    if (url.startsWith('/')) {
        const base = window._inertiaBaseUrl || '';
        return base + url;
    }
    return url;
}

router.visit = (url, options) => originalVisit(withBaseUrl(url), options);

createInertiaApp({
    resolve: name => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
        const page = pages[`./pages/${name}.jsx`];
        page.default.layout = page.default.layout || AppLayout;
        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});