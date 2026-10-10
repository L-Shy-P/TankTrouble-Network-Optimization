# Tutoriel d'installation

> 🇫🇷 **TankTrouble — optimisation réseau** — Plus riche, plus temps réel et plus précis : l'état du réseau, et une vraie optimisation.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · <b>🇫🇷 Français</b> · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ C'est un userscript, pas une extension de navigateur

Installez d'abord **Tampermonkey** (gestionnaire de userscripts). N'utilisez pas « Charger l'extension non empaquetée » / la page des extensions de Chrome : le fichier `.user.js` est géré par Tampermonkey, pas installé comme extension.

## Méthode A — installation en un clic (recommandée)

[![Install](https://img.shields.io/badge/install-fr-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Après avoir installé Tampermonkey, cliquez le badge ou ouvrez l'URL ci-dessous : Tampermonkey ouvre sa page d'installation, puis cliquez **Installer**.

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

## Dépannage

- **Rien n'apparaît** — Vérifiez que l'URL correspond à `*://*.tanktrouble.com/*` et que le script est activé, puis `Ctrl+F5`.
- **Le panneau a disparu** — Appuyez sur `Ctrl+Shift+L`. La position et l'état réduit sont mémorisés.
- **Toujours saccadé** — C'est votre ligne. Exportez un rapport (`Ctrl+Shift+E`) et comparez les régions.

## Liens

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Français](../README.fr.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
