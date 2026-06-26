const https = require('https');
const crypto = require('crypto');

const urls = [
    "https://unpkg.com/lenis@1.1.13/dist/lenis.min.js",
    "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0",
    "https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js",
    "https://unpkg.com/lucide@0.378.0"
];

urls.forEach(url => {
    https.get(url, (res) => {
        const hash = crypto.createHash('sha384');
        res.on('data', chunk => hash.update(chunk));
        res.on('end', () => {
            const digest = hash.digest('base64');
            console.log(`URL: ${url}`);
            console.log(`Integrity: sha384-${digest}\n`);
        });
    });
});
