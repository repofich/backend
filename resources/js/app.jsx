import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AppLayout from './components/AppLayout';

const originalVisit = router.visit.bind(router);
const originalGet = router.get.bind(router);
const originalPost = router.post.bind(router);
const originalPut = router.put.bind(router);
const originalPatch = router.patch.bind(router);
const originalDelete = router.delete.bind(router);

function withBaseUrl(url) {
    if (url.startsWith('/')) {
        const base = window._inertiaBaseUrl || '';
        return base + url;
    }
    return url;
}

router.visit = (url, options) => originalVisit(withBaseUrl(url), options);
router.get = (url, options) => originalGet(withBaseUrl(url), options);
router.post = (url, data, options) => originalPost(withBaseUrl(url), data, options);
router.put = (url, data, options) => originalPut(withBaseUrl(url), data, options);
router.patch = (url, data, options) => originalPatch(withBaseUrl(url), data, options);
router.delete = (url, options) => originalDelete(withBaseUrl(url), options);

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