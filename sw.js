/* ===========================
   APP SOLIDÁRIO — SERVICE WORKER
   Cache-first com fallback de rede
   =========================== */

const CACHE_NOME    = 'app-solidario-v2';
const ARQUIVOS_CACHE = [
  '/app-solidario/',
  '/app-solidario/index.html',
  '/app-solidario/css/style.css',
  '/app-solidario/js/dados.js',
  '/app-solidario/js/app.js',
  '/app-solidario/manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
];

// Instala e faz cache dos arquivos essenciais
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then(cache => cache.addAll(ARQUIVOS_CACHE))
  );
  self.skipWaiting();
});

// Remove caches antigos ao ativar
self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(chaves.filter(c => c !== CACHE_NOME).map(c => caches.delete(c)))
    )
  );
  self.clients.claim();
});

// Cache-first: serve do cache, busca na rede se não encontrar
self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request).then(respostaCache => {
      if (respostaCache) return respostaCache;
      return fetch(evento.request).then(respostaRede => {
        if (!respostaRede || respostaRede.status !== 200 || respostaRede.type !== 'basic') {
          return respostaRede;
        }
        const respostaClonada = respostaRede.clone();
        caches.open(CACHE_NOME).then(cache => cache.put(evento.request, respostaClonada));
        return respostaRede;
      }).catch(() => respostaCache);
    })
  );
});
