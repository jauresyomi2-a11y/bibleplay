# ✝️ BiblePlay — Guide de déploiement complet

Plateforme de jeux bibliques multijoueur · Supabase + Netlify

---

## 📁 Fichiers du projet (16 fichiers)

| Fichier | Description |
|---------|-------------|
| `index.html` | Accueil + connexion |
| `lobby.html` | Salle d'attente — 9 jeux + mode multi |
| `chat.html` | Salon de discussion en temps réel |
| `scores.html` | Classements généraux |
| `game.html` | 📖 Quiz Battle (110 questions) |
| `game-predicateur.html` | 🎤 Défi du Prédicateur |
| `game-verset.html` | ✍️ Verset Manquant (30 versets) |
| `game-localise.html` | 🗺️ Où est-il écrit ? (20 versets) |
| `game-memoire.html` | 🃏 Mémoire Sacré (118 paires) |
| `game-anagramme.html` | 🔤 Anagramme Biblique (120 mots) |
| `game-duel.html` | ⚔️ Duel de Versets (120 versets) |
| `game-roue.html` | 🎲 Roue Biblique (160 défis) |
| `game-mots-croises.html` | 🧩 Mots Croisés Bibliques |
| `config.js` | (optionnel en prod — credentials déjà inline) |
| `migration.sql` | SQL à exécuter dans Supabase |
| `netlify.toml` | Config déploiement Netlify |

---

## 🗄️ ÉTAPE 1 — Supabase

1. Va sur https://supabase.com → ton projet `bibleplay`
2. Clique sur **SQL Editor** dans le menu gauche
3. Clique **New query**
4. Copie-colle **tout le contenu** du fichier `migration.sql`
5. Clique **Run** (▶)
6. Tu dois voir : "Success. No rows returned"

C'est tout pour Supabase. Les clés sont déjà dans les fichiers HTML.

---

## 🚀 ÉTAPE 2 — Déploiement Netlify

### Option A — Drag & Drop (le plus simple)
1. Va sur https://netlify.com → connecte-toi
2. Clique **Add new site** → **Deploy manually**
3. Glisse-dépose **le dossier entier** contenant les 16 fichiers
4. Netlify génère une URL (ex: `bibleplay-abc123.netlify.app`)
5. C'est en ligne ! ✅

### Option B — Via GitHub (recommandé pour les mises à jour)
1. Crée un repo GitHub → pousse tous les fichiers
2. Sur Netlify → **Add new site** → **Import from Git**
3. Sélectionne ton repo → branche `main`
4. Build command : laisser vide
5. Publish directory : `.`
6. Clique **Deploy site**

---

## ✅ Vérification après déploiement

Teste dans l'ordre :
1. `index.html` → Crée une salle → vérifie que le code s'affiche
2. Ouvre un 2e onglet → Rejoins avec le code → les 2 joueurs doivent s'afficher
3. Lance une partie → Quiz Battle → les questions arrivent
4. `chat.html` → Envoie un message → il apparaît dans l'autre onglet

---

## 🎮 Récapitulatif des jeux

| Jeu | Contenu | Mode |
|-----|---------|------|
| 📖 Quiz Battle | 110 questions · 5 catégories | Temps réel |
| ✍️ Verset Manquant | 30 versets à compléter | Temps réel |
| 🎤 Défi du Prédicateur | Questions libres par joueur | Tour par tour |
| 🗺️ Où est-il écrit ? | 20 versets · Livre + chapitre | Temps réel |
| 🃏 Mémoire Sacré | 118 paires · 3 modes | Tour par tour |
| 🔤 Anagramme Biblique | 120 mots · 5 catégories | Temps réel |
| ⚔️ Duel de Versets | 120 versets · 2 joueurs | Face à face |
| 🎲 Roue Biblique | 160 défis · 8 catégories | Vote communauté |
| 🧩 Mots Croisés | 55 mots · 3 grilles | Coopératif |

Développé par Jaurès Yomi · contact: jauresulriche@gmail.com
