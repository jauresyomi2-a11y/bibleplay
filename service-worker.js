// ── BiblePlay Service Worker ──
// Version : mettre à jour ce numéro à chaque nouveau déploiement
const CACHE_VERSION = 'bibleplay-v1';

// Fichiers à mettre en cache immédiatement à l'installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/lobby.html',
  '/chat.html',
  '/scores.html',
  '/config.js',
  '/manifest.json',
  // Pages de jeux
  '/game.html',
  '/game-verset.html',
  '/game-localise.html',
  '/game-memoire.html',
  '/game-predicateur.html',
  '/game-roue.html',
  '/game-temple.html',
  '/game-anagramme.html',
  '/game-duel.html',
  '/game-mots-croises.html',
];

// ── INSTALLATION ──
// Mise en cache de tous les fichiers statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      // Activer immédiatement sans attendre la fermeture des onglets
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATION ──
// Supprimer les anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Prendre le contrôle de tous les onglets ouverts immédiatement
      return self.clients.claim();
    })
  );
});

// ── STRATÉGIE DE CACHE ──
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Requêtes Supabase (API, Realtime, WebSocket) → TOUJOURS réseau
  //    Ne jamais intercepter les connexions temps réel
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.com') ||
    event.request.url.includes('/rest/v1/') ||
    event.request.url.includes('/realtime/') ||
    event.request.url.includes('/auth/v1/') ||
    event.request.headers.get('upgrade') === 'websocket'
  ) {
    return; // Laisser passer sans interception
  }

  // 2. Requêtes Google Fonts → réseau d'abord, cache en fallback
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch {
          return cache.match(event.request);
        }
      })
    );
    return;
  }

  // 3. CDN jsDelivr (Supabase SDK) → réseau d'abord, cache en fallback
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        try {
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch {
          return cache.match(event.request) || fetch(event.request);
        }
      })
    );
    return;
  }

  // 4. Fichiers locaux (HTML, JS, CSS, images) → Cache d'abord, réseau en fallback
  //    Stratégie "Cache First" pour chargement ultra-rapide
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Mise à jour en arrière-plan (stale-while-revalidate)
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_VERSION).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        // Pas en cache → réseau
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Hors-ligne et pas en cache → page d'erreur minimale
          return new Response(
            `<!DOCTYPE html>
            <html lang="fr">
            <head><meta charset="UTF-8"/><title>BiblePlay — Hors-ligne</title>
            <style>
              body { font-family: sans-serif; background:#fafaf5; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; gap:16px; text-align:center; padding:24px; }
              .icon { font-size:4rem; }
              h1 { font-size:1.5rem; color:#1a1a2e; }
              p { color:#6b7280; max-width:320px; line-height:1.6; }
              button { padding:12px 28px; background:#c9a84c; color:white; border:none; border-radius:12px; font-size:1rem; cursor:pointer; }
            </style></head>
            <body>
              <div class="icon">✝️</div>
              <h1>Connexion requise</h1>
              <p>BiblePlay est un jeu multijoueur en temps réel. Une connexion internet est nécessaire pour jouer.</p>
              <button onclick="location.reload()">🔄 Réessayer</button>
            </body></html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
    );
  }
});

// ── MESSAGE : forcer la mise à jour ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
