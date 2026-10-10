# Tutoriel d'installation

> 🇫🇷 **TankTrouble — optimisation réseau** — Plus riche, plus temps réel et plus précis : l'état du réseau, et une vraie optimisation.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · <b>🇫🇷 Français</b> · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ C'est un userscript, pas une extension de navigateur

Installez d'abord **Tampermonkey** (gestionnaire de userscripts). N'utilisez pas « Charger l'extension non empaquetée » / la page des extensions de Chrome : le fichier `.user.js` est géré par Tampermonkey, pas installé comme extension.

## Méthode A — installation en un clic (recommandée)

[![Install](https://img.shields.io/badge/install-fr-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Cliquez le badge (ou ouvrez l’URL ci-dessous). Si ça a marché, Tampermonkey ouvre sa propre page d’installation — une page sombre avec le nom du script, la version et un bouton **Install** ; c’est seulement après avoir cliqué **Install** que le script est installé. (Si vous voyez une page entière de code commençant par `// ==UserScript==`, ou si le fichier est simplement téléchargé, le clic n’est pas arrivé à Tampermonkey — voir la FAQ ci-dessous.)

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Méthode B — installation depuis le ZIP téléchargé

1. **Téléchargez le ZIP**

   Sur la [page GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization), cliquez **Code → Download ZIP**.
2. **Décompressez**

   Extrayez le ZIP dans un dossier normal.
3. **Installez Tampermonkey**

   Chrome/Edge : [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Ajouter à Chrome ; puis ouvrez `chrome://extensions` et activez **Mode développeur**. Firefox : [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Ajouter à Firefox.
4. **Chargez le userscript**

   Cliquez l'icône Tampermonkey dans la barre d'outils → **Tableau de bord**. Glissez `tanktrouble-netlab.install.user.js` du dossier vers la page, puis cliquez **Installer**.
5. **Rafraîchissez la page du jeu**

   Ouvrez <https://tanktrouble.com/game> (rafraîchissez si déjà ouvert). Le ballon apparaît en haut à gauche ; cliquez dessus pour l'ouvrir et commencez.

Si le glisser-déposer ne marche pas : utilisez le lien en un clic ci-dessus, ou importez le fichier via l'onglet Utilitaires du tableau de bord Tampermonkey. `tanktrouble-netlab.user.js` est identique ; `install.user.js` est la copie avec BOM pour le glisser-déposer.

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
- **J'ai téléchargé le ZIP : je glisse tout le dossier ?** — Non. Glissez uniquement le fichier `tanktrouble-netlab.install.user.js` dans le tableau de bord Tampermonkey. Un dossier n'est pas un script et ne s'installera pas.
- **Comment ouvrir le tableau de bord Tampermonkey ?** — Cliquez l'icône Tampermonkey dans la barre d'outils → Tableau de bord. Si elle est cachée, cliquez sur le bouton puzzle/extensions et épinglez Tampermonkey.
- **Le lien raw affiche du code / Chrome dit qu'on ne peut pas installer depuis ce site.** — Avec Tampermonkey installé, ouvrez le lien raw : Tampermonkey affiche sa page d'installation. Sinon, copiez l'URL et utilisez Tableau de bord → Utilitaires → Installer depuis une URL.
- **Je glisse le fichier, rien ne se passe.** — Déposez-le sur la page du tableau de bord Tampermonkey (pas chrome://extensions ni une page web normale). Si le glisser-déposer est bloqué, utilisez le lien en un clic ou « Installer depuis une URL ».
- **Installé, mais rien dans le jeu.** — Rechargez la page du jeu avec Ctrl+F5, vérifiez que le script est activé dans Tampermonkey et appuyez sur Ctrl+Shift+L pour afficher le HUD. Une page ouverte avant l'installation doit être rechargée.
- **Faut-il garder le ZIP/dossier ?** — Non. Le script est dans Tampermonkey ; vous pouvez supprimer le ZIP. Mettez à jour via Tampermonkey ou en réinstallant le lien raw.
- **Dans Tampermonkey, « Importer depuis un fichier »/« Add file » : c'est là qu'on envoie le fichier ?** — Non, ce bouton sert aux sauvegardes `.zip` de Tampermonkey. Pour installer ce script : Tableau de bord → Utilitaires → Installer depuis une URL, ou glissez l'unique fichier `.user.js` sur le tableau de bord.
- **Faut-il renommer, modifier ou décompresser le `.user.js` ?** — Non, utilisez-le tel quel. Ce fichier est le script lui-même ; ne le mettez pas dans `chrome://extensions` et n'envoyez pas le dossier entier.
- **J'ai cliqué sur l'installation en un clic (méthode A) — est-ce que c'est vraiment installé ?** — Si ça a marché, **Tampermonkey ouvre sa propre page d’installation** : une page sombre affichant le nom du script « TankTrouble Network Optimization », le numéro de version et un bouton **Install** — c’est en cliquant **Install** que l’installation se termine. Si vous voyez à la place une page entière de code (commençant par `// ==UserScript==`) ou si le fichier a simplement été téléchargé, le clic n’est pas arrivé jusqu’à Tampermonkey. Utilisez plutôt **Dashboard → Utilities → Install from URL** (collez `https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js`), ou glissez le fichier `tanktrouble-netlab.install.user.js` téléchargé sur la page **Dashboard**. À noter : les liens raw de GitHub peuvent être mis en cache quelques minutes ; si la page d’installation affiche une version plus ancienne, attendez un peu ou appuyez sur `Ctrl+F5` puis recliquez.
- **Comment vérifier qu'il est bien installé et qu'il tourne ?** — Trois vérifications : ① dans la liste des scripts du **Dashboard** Tampermonkey, on voit « TankTrouble Network Optimization » et l’interrupteur est sur **ON** ; ② sur une page `tanktrouble.com`, une pastille numérotée (**1**) apparaît sur l’icône Tampermonkey ; ③ appuyez sur **F12 → Console**, vous devez voir une ligne `[TT NetLab vX.Y.Z] loaded...`. Si le point ③ est absent : rechargez d’abord la page avec **Ctrl+F5** ; si c’est toujours absent, le script est désactivé ou seulement partiellement installé (**réinstallez-le** ; le fichier doit commencer à la ligne 1 par `// ==UserScript==`, copier à partir du milieu comme `(function () {` ne marche pas).

## Dépannage

- **Rien n'apparaît** — Vérifiez que l'URL correspond à `*://*.tanktrouble.com/*` et que le script est activé, puis `Ctrl+F5`.
- **Le panneau a disparu** — Appuyez sur `Ctrl+Shift+L`. La position et l'état réduit sont mémorisés.
- **Toujours saccadé** — C'est votre ligne. Exportez un rapport (`Ctrl+Shift+E`) et comparez les régions.

## Liens

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Français](../README.fr.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
