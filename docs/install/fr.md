# Tutoriel d'installation

> 🇫🇷 **TankTrouble — optimisation réseau** — Plus riche, plus temps réel et plus précis : l'état du réseau, et une vraie optimisation.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · <b>🇫🇷 Français</b> · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## Installation en un clic

[![Install](https://img.shields.io/badge/install-fr-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Cliquez le badge (ou ouvrez l’URL ci-dessous) → Tampermonkey ouvre la page d’installation → **Installer** :

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Étapes

1. **Installer Tampermonkey**

   Chrome/Edge : [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox : [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). « Ajouter au navigateur » → « Ajouter l'extension ».

2. **Activer le mode développeur (Chrome/Edge)**

   Ouvrez `chrome://extensions` (ou `edge://extensions`) et activez **Mode développeur** en haut à droite.

3. **Installer le script**

   Cliquez sur **Installer le script** ci-dessous puis **Installer**.

4. **Ouvrir le jeu**

   Allez sur <https://tanktrouble.com/game> et entrez en partie : le panneau apparaît en haut à gauche.

5. **Utilisation**

   Glissez la barre de titre pour déplacer. Cliquez le point pour réduire en ballon (moyenne / ping actuel / stabilité), cliquez le ballon pour déplier. `Ctrl+Shift+S` optimisation, `Ctrl+Shift+L` masquer, `Ctrl+Shift+E` exporter un rapport.

## Raccourcis

| Key | |
|---|---|
| `Ctrl+Shift+S` | activer/désactiver l’optimisation (A/B en direct) |
| `Ctrl+Shift+L` | masquer / afficher le HUD |
| `Ctrl+Shift+E` | exporter le rapport de diagnostic (aussi copié) |
| `Ctrl+Shift+P` | tester les 7 régions et les classer |

Le bouton **⚡** du panneau équivaut à `Ctrl+Shift+S`. Le panneau propose **10 langues** ; langue, interrupteur et position du ballon sont mémorisés dans `localStorage`.

## Dépannage

- **Rien n'apparaît** — Vérifiez que l'URL correspond à `*://*.tanktrouble.com/*` et que le script est activé, puis `Ctrl+F5`.
- **Le panneau a disparu** — Appuyez sur `Ctrl+Shift+L`. La position et l'état réduit sont mémorisés.
- **Toujours saccadé** — C'est votre ligne. Exportez un rapport (`Ctrl+Shift+E`) et comparez les régions.

## Liens

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Français](../README.fr.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
