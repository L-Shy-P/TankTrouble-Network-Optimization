# Tutoriel d'installation

> 🇫🇷 **TankTrouble — optimisation réseau** — Plus riche, plus temps réel et plus précis : l'état du réseau, et une vraie optimisation.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · <b>🇫🇷 Français</b> · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ C'est un userscript, pas une extension de navigateur

Installez d'abord **Tampermonkey** (gestionnaire de userscripts). N'utilisez pas `chrome://extensions` / « Charger l'extension non empaquetée » : le fichier `.user.js` est géré par Tampermonkey, pas installé comme extension. Si une page pleine de code apparaît, vous êtes au mauvais endroit — revenez à ce tutoriel.

## Méthode A — glissez le fichier téléchargé dans le Dashboard Tampermonkey (recommandée, la plus simple)

### Étape 1 (une seule fois) — installez Tampermonkey

Chrome/Edge : ouvrez le [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Ajouter à Chrome**. Firefox : ouvrez [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Ajouter à Firefox**.

Si après l'installation l'icône Tampermonkey n'apparaît pas dans la barre d'outils : cliquez sur le bouton **puzzle / extensions** en haut à droite du navigateur et **épinglez** Tampermonkey.

### Étape 2 — téléchargez le fichier du script

Cliquez sur **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (ou ouvrez le lien ci-dessous) : le navigateur enregistre le fichier dans votre dossier **« Téléchargements »** sous le nom `tanktrouble-netlab.install.user.js`.

**Ne le renommez pas, ne le décompressez pas, ne le modifiez pas** — c'est un simple script texte.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Étape 3 — ouvrez le **Dashboard** Tampermonkey (c'est ici que la plupart bloquent)

Cliquez sur l'**icône Tampermonkey** dans la barre d'outils du navigateur → dans le menu, cliquez sur **Dashboard** (en français : **Tableau de bord**).

- Icône introuvable : cliquez sur le bouton **puzzle / extensions**, puis sur Tampermonkey.
- ⚠️ L'élément « **Ajouter un nouveau script** » de ce menu ouvre l'**éditeur**, pas l'entrée d'installation. Utilisez le **Dashboard** (dans l'interface chinoise : « 管理面板 »).
- Si vous êtes déjà sur une autre page Tampermonkey, cliquez sur **Installed scripts / Scripts installés** dans la barre latérale gauche pour revenir à la liste.

### Étape 4 — glissez le fichier dedans

Gardez la **page de liste du Dashboard** ouverte, puis glissez `tanktrouble-netlab.install.user.js` depuis votre dossier **« Téléchargements » sur la page du Dashboard** → la page d'installation de Tampermonkey apparaît (page sombre avec le nom du script "TankTrouble Network Optimization", la version et un bouton **Install**) → cliquez sur **Install**.

- Si le glisser-déposer ne marche pas : **Dashboard → Utilities / Utilitaires → Install from URL**, collez le même lien de téléchargement et cliquez sur **Install**.
- Vous pouvez aussi cliquer directement sur le lien d'installation en un clic (conservé ci-dessous comme **Méthode B**) : avec Tampermonkey installé, la page d'installation s'ouvre immédiatement. Si vous voyez plutôt une page pleine de code commençant par `// ==UserScript==`, le clic n'est pas arrivé à Tampermonkey → revenez au glisser-déposer ci-dessus.

### Étape 5 — entrez dans le jeu

Ouvrez <https://tanktrouble.com/game> → forcez le rechargement avec **Ctrl + F5** → le panneau ou le ballon flottant apparaît en haut à gauche. Si vous ne le voyez pas, appuyez sur **Ctrl + Shift + L** — il est peut-être masqué.

### Auto-vérification (trois points)

① La liste du **Dashboard** affiche "TankTrouble Network Optimization" et l'interrupteur est sur **ON** ; ② sur une page `tanktrouble.com`, l'icône Tampermonkey affiche un badge numérique (**1**) ; ③ appuyez sur **F12 → Console** : vous devez voir `[TT NetLab vX.Y.Z] loaded...`.

## Méthode B — installation en un clic (Tampermonkey déjà installé)

[![Install](https://img.shields.io/badge/install-fr-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Si Tampermonkey est installé, cliquez sur le badge (ou le lien ci-dessous) : Tampermonkey ouvre directement sa propre page d'installation — une page sombre avec le nom du script "TankTrouble Network Optimization", la version et un bouton **Install** ; c'est seulement après avoir cliqué sur **Install** que le script est installé. Si vous voyez une page pleine de code commençant par `// ==UserScript==`, le clic n'est pas arrivé à Tampermonkey → revenez à la **Méthode A** (glisser-déposer).

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Méthode C — installation depuis le ZIP téléchargé (hors ligne)

Si vous savez déjà installer par glisser-déposer, **la Méthode A suffit — pas besoin du ZIP**. N'utilisez le ZIP que si vous voulez garder tout le dépôt hors ligne.

1. **Téléchargez le ZIP**

   Sur la [page GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization), cliquez **Code → Download ZIP**.
2. **Décompressez**

   Extrayez le ZIP dans un dossier normal.
3. **Vérifiez que Tampermonkey est installé**

   Sinon, revenez à l'étape 1 de la Méthode A. N'utilisez pas `chrome://extensions`.
4. **Chargez le userscript**

   Cliquez sur l'icône Tampermonkey → **Dashboard**, gardez la page de liste ouverte, glissez `tanktrouble-netlab.install.user.js` du dossier vers la page du Dashboard et cliquez sur **Install**. Si le glisser-déposer ne marche pas, utilisez **Dashboard → Utilities → Install from URL**.
5. **Rafraîchissez la page du jeu**

   Ouvrez <https://tanktrouble.com/game> (rafraîchissez si déjà ouvert). Le ballon apparaît en haut à gauche ; cliquez dessus pour l'ouvrir et commencez.

`tanktrouble-netlab.user.js` est identique ; `install.user.js` est la copie avec BOM pour le glisser-déposer.

## Raccourcis

| Key | |
|---|---|
| `Ctrl+Shift+S` | activer/désactiver l’optimisation (A/B en direct) |
| `Ctrl+Shift+L` | masquer / afficher le HUD |
| `Ctrl+Shift+E` | exporter le rapport de diagnostic (aussi copié) |
| `Ctrl+Shift+P` | tester les 7 régions et les classer |

Le bouton **⚡** du panneau équivaut à `Ctrl+Shift+S`. Le panneau propose **11 langues** ; langue, interrupteur et position du ballon sont mémorisés dans `localStorage`.

## FAQ débutants (si vous êtes perdu, lisez ceci)

- **Est-ce une extension Chrome ? Faut-il l'ajouter dans chrome://extensions ?** — Non, c'est un userscript. Installez d'abord Tampermonkey, puis installez le script dedans. N'utilisez pas « Charger l'extension non empaquetée ».
- **Tampermonkey a l'air louche.** — C'est le gestionnaire de userscripts le plus courant pour Chrome/Edge/Firefox, disponible dans les stores officiels (tampermonkey.net). Ce projet est open source sur GitHub ; aucun serveur, VPN ou réglage réseau n'est nécessaire.
- **J'ai téléchargé le ZIP : je glisse tout le dossier ?** — Non. Avec la méthode A, le ZIP est inutile : téléchargez le fichier unique `tanktrouble-netlab.install.user.js` (étape 2) et glissez uniquement ce fichier depuis « Téléchargements » dans le tableau de bord Tampermonkey. Un dossier n'est pas un script et ne s'installera pas.
- **Où se trouve le Dashboard Tampermonkey et comment l'ouvrir ?** — Cliquez sur l'**icône Tampermonkey** dans la barre d'outils → **Dashboard** (Tableau de bord). Icône introuvable ? Cliquez sur le bouton puzzle/extensions et épinglez Tampermonkey. Si vous êtes déjà sur une autre page Tampermonkey, cliquez sur **Installed scripts / Scripts installés** à gauche pour revenir à la liste. ⚠️ N'utilisez pas l'élément « **Ajouter un nouveau script** » — il ouvre l'éditeur, pas l'entrée d'installation.
- **J'ai cliqué sur « Ajouter un nouveau script » et un éditeur s'est ouvert — est-ce l'entrée d'installation ?** — Non. « Ajouter un nouveau script » ouvre l'**éditeur** Tampermonkey pour écrire un script ; ce n'est pas là qu'on installe celui-ci. L'entrée d'installation est la page de liste du **Dashboard** (« Scripts installés ») : glissez-y le fichier `tanktrouble-netlab.install.user.js` téléchargé, ou utilisez **Dashboard → Utilities / Utilitaires → Install from URL** et collez `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`.
- **Le lien de téléchargement affiche une page de code / Chrome dit qu'on ne peut pas installer depuis ce site.** — C'est normal pour la méthode A — ce lien sert uniquement à enregistrer le fichier (vérifiez « Téléchargements » : `tanktrouble-netlab.install.user.js`). Glissez ensuite ce fichier sur la page de liste du **Dashboard** Tampermonkey. Si le fichier ne s'est pas téléchargé, faites un clic droit sur le lien → « Enregistrer la cible du lien sous… », ou utilisez **Dashboard → Utilities → Install from URL** avec le même lien.
- **Je glisse le fichier, rien ne se passe.** — Déposez-le directement sur la page de liste du **Dashboard** Tampermonkey (pas chrome://extensions ni une page web normale), en laissant cette page ouverte et au premier plan. Si le glisser-déposer est bloqué, utilisez **Dashboard → Utilities → Install from URL**.
- **Installé, mais rien dans le jeu.** — Rechargez la page du jeu avec Ctrl+F5, vérifiez que le script est activé dans Tampermonkey et appuyez sur Ctrl+Shift+L pour afficher le HUD. Une page ouverte avant l'installation doit être rechargée.
- **Faut-il garder le ZIP/dossier ?** — Non. Le script est dans Tampermonkey ; vous pouvez supprimer le ZIP. Mettez à jour via Tampermonkey ou en réinstallant le lien raw.
- **Dans Tampermonkey, « Importer depuis un fichier »/« Add file » : c'est là qu'on envoie le fichier ?** — Non, ce bouton sert aux sauvegardes `.zip` de Tampermonkey. Pour installer ce script : Tableau de bord → Utilitaires → Installer depuis une URL, ou glissez l'unique fichier `.user.js` sur le tableau de bord.
- **Faut-il renommer, modifier ou décompresser le `.user.js` ?** — Non, utilisez-le tel quel. Ce fichier est le script lui-même ; ne le mettez pas dans `chrome://extensions` et n'envoyez pas le dossier entier.
- **J'ai cliqué sur le lien d'installation en un clic (méthode B) — est-ce vraiment installé ?** — Si ça a marché, **Tampermonkey ouvre sa propre page d'installation** : une page sombre affichant le nom du script "TankTrouble Network Optimization", le numéro de version et un bouton **Install** — c'est le clic sur **Install** qui installe le script. Si vous voyez une page pleine de code (commençant par `// ==UserScript==`), ou si le fichier a simplement été téléchargé, le clic n'est pas arrivé à Tampermonkey : revenez à la **méthode A** et glissez le `tanktrouble-netlab.install.user.js` téléchargé sur la page **Dashboard**, ou utilisez **Dashboard → Utilities → Install from URL**.
- **Comment vérifier qu'il est bien installé et qu'il tourne ?** — Trois vérifications : ① dans la liste des scripts du **Dashboard** Tampermonkey, on voit « TankTrouble Network Optimization » et l’interrupteur est sur **ON** ; ② sur une page `tanktrouble.com`, une pastille numérotée (**1**) apparaît sur l’icône Tampermonkey ; ③ appuyez sur **F12 → Console**, vous devez voir une ligne `[TT NetLab vX.Y.Z] loaded...`. Si le point ③ est absent : rechargez d’abord la page avec **Ctrl+F5** ; si c’est toujours absent, le script est désactivé ou seulement partiellement installé (**réinstallez-le** ; le fichier doit commencer à la ligne 1 par `// ==UserScript==`, copier à partir du milieu comme `(function () {` ne marche pas).

## Dépannage

- **Rien n'apparaît** — Vérifiez que l'URL correspond à `*://*.tanktrouble.com/*` et que le script est activé, puis `Ctrl+F5`.
- **Le panneau a disparu** — Appuyez sur `Ctrl+Shift+L`. La position et l'état réduit sont mémorisés.
- **Toujours saccadé** — C'est votre ligne. Exportez un rapport (`Ctrl+Shift+E`) et comparez les régions.

## Liens

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Français](../README.fr.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
