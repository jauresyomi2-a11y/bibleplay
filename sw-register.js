// ── BiblePlay PWA — Enregistrement Service Worker & Install Banner ──

(function () {
  'use strict';

  // ── 1. Enregistrer le Service Worker ──
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });

        // Écouter les mises à jour
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nouvelle version disponible → proposer la mise à jour
              showUpdateBanner();
            }
          });
        });

      } catch (err) {
        console.warn('[BiblePlay SW] Erreur enregistrement:', err);
      }
    });
  }

  // ── 2. Capturer l'événement d'installation (beforeinstallprompt) ──
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Empêcher la bannière automatique du navigateur
    e.preventDefault();
    deferredInstallPrompt = e;

    // Afficher notre propre bannière d'installation après 3 secondes
    setTimeout(() => showInstallBanner(), 3000);
  });

  // Détecter si l'app est déjà installée
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
    console.log('[BiblePlay PWA] App installée avec succès !');
  });

  // ── 3. Bannière d'installation ──
  function showInstallBanner() {
    // Ne pas afficher si déjà en mode standalone (déjà installé)
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (!deferredInstallPrompt) return;
    if (sessionStorage.getItem('bp_install_dismissed')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
        background:white; border:1px solid #e8e0d0; border-radius:16px;
        padding:14px 18px; display:flex; align-items:center; gap:14px;
        box-shadow:0 8px 32px rgba(0,0,0,0.15); z-index:9999;
        max-width:360px; width:calc(100% - 32px);
        animation: slideUpBanner 0.4s ease both;
      ">
        <style>
          @keyframes slideUpBanner {
            from { opacity:0; transform:translateX(-50%) translateY(20px); }
            to   { opacity:1; transform:translateX(-50%) translateY(0); }
          }
        </style>
        <div style="font-size:2.2rem; flex-shrink:0;">✝️</div>
        <div style="flex:1; min-width:0;">
          <div style="font-family:'DM Sans',sans-serif; font-size:0.88rem; font-weight:600; color:#1a1a2e; margin-bottom:2px;">
            Installer L'amour de Jésus
          </div>
          <div style="font-size:0.78rem; color:#6b7280; line-height:1.4;">
            Accès rapide depuis ton écran d'accueil 📱
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
          <button id="pwa-install-btn" style="
            padding:8px 14px; background:linear-gradient(135deg,#c9a84c,#a0782a);
            color:white; border:none; border-radius:9px; font-size:0.8rem;
            font-weight:600; cursor:pointer; white-space:nowrap;
          ">Installer</button>
          <button id="pwa-dismiss-btn" style="
            padding:4px; background:none; border:none; color:#9ca3af;
            font-size:0.75rem; cursor:pointer; text-align:center;
          ">Plus tard</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      hideInstallBanner();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      sessionStorage.setItem('bp_install_dismissed', '1');
      hideInstallBanner();
    });
  }

  function hideInstallBanner() {
    const b = document.getElementById('pwa-install-banner');
    if (b) b.remove();
  }

  // ── 4. Bannière de mise à jour ──
  function showUpdateBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.innerHTML = `
      <div style="
        position:fixed; top:16px; left:50%; transform:translateX(-50%);
        background:#1a1a2e; color:white; border-radius:12px;
        padding:12px 18px; display:flex; align-items:center; gap:12px;
        box-shadow:0 8px 24px rgba(0,0,0,0.3); z-index:9999;
        max-width:340px; width:calc(100% - 32px);
        animation: slideDownBanner 0.4s ease both;
      ">
        <style>
          @keyframes slideDownBanner {
            from { opacity:0; transform:translateX(-50%) translateY(-16px); }
            to   { opacity:1; transform:translateX(-50%) translateY(0); }
          }
        </style>
        <div style="font-size:1.2rem;">🔄</div>
        <div style="flex:1; font-size:0.82rem; line-height:1.4;">
          Nouvelle version disponible !
        </div>
        <button onclick="document.getElementById('pwa-update-banner').remove(); window.location.reload();" style="
          padding:7px 14px; background:#c9a84c; color:white; border:none;
          border-radius:8px; font-size:0.8rem; font-weight:600; cursor:pointer;
        ">Mettre à jour</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  // ── 5. Styles PWA standalone ──
  // Quand l'app est lancée installée, ajouter une classe sur body
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    document.documentElement.classList.add('pwa-standalone');
    // Ajouter padding-top pour éviter la barre de statut iOS
    const style = document.createElement('style');
    style.textContent = `
      .pwa-standalone header {
        padding-top: max(env(safe-area-inset-top), 16px) !important;
      }
      .pwa-standalone body {
        padding-bottom: env(safe-area-inset-bottom);
      }
    `;
    document.head.appendChild(style);
  }

})();
