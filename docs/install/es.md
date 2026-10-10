# Tutorial de instalación

> 🇪🇸 **TankTrouble — optimización de red** — Más rico, más en tiempo real y más preciso: el estado de la red y una optimización real.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · <b>🇪🇸 Español</b> · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## Instalación en un clic

[![Install](https://img.shields.io/badge/install-es-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Pulsa el badge (o abre la URL de abajo) → Tampermonkey abre la página de instalación → **Instalar**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Pasos

1. **Instala Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). «Añadir al navegador» → «Añadir extensión».

2. **Activa el modo desarrollador (Chrome/Edge)**

   Abre `chrome://extensions` (o `edge://extensions`) y activa **Modo de desarrollador** arriba a la derecha.

3. **Instala el script**

   Pulsa **Instalar el script** abajo y luego **Instalar**.

4. **Abre el juego**

   Ve a <https://tanktrouble.com/game> y entra en partida: la bola aparece arriba a la izquierda y puedes empezar a usarla al instante.

## Atajos

| Key | |
|---|---|
| `Ctrl+Shift+S` | activar/desactivar la optimización (A/B en vivo) |
| `Ctrl+Shift+L` | ocultar / mostrar el HUD |
| `Ctrl+Shift+E` | exportar el informe de diagnóstico (también se copia) |
| `Ctrl+Shift+P` | probar las 7 regiones y clasificarlas |

El botón **⚡** del panel equivale a `Ctrl+Shift+S`. El panel permite elegir entre **10 idiomas**; idioma, interruptor y posición de la bola se guardan en `localStorage`.

## Solución de problemas

- **No aparece nada** — Comprueba que la URL coincide con `*://*.tanktrouble.com/*` y que el script está activado, luego `Ctrl+F5`.
- **El panel desapareció** — Pulsa `Ctrl+Shift+L`. La posición y el estado contraído se recuerdan.
- **Sigue a tirones** — Es tu línea. Exporta un informe (`Ctrl+Shift+E`) y compara regiones.

## Enlaces

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Español](../README.es.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
