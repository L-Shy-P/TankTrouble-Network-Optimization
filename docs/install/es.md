# Tutorial de instalación

> 🇪🇸 **TankTrouble — optimización de red** — Más rico, más en tiempo real y más preciso: el estado de la red y una optimización real.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · <b>🇪🇸 Español</b> · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ Es un userscript, no una extensión del navegador

Primero instala **Tampermonkey** (gestor de userscripts). No uses «Cargar extensión descomprimida»/la página de extensiones de Chrome: Tampermonkey gestiona el archivo `.user.js`, no se instala como extensión.

## Método A — instalación en un clic (recomendado)

[![Install](https://img.shields.io/badge/install-es-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Tras instalar Tampermonkey, pulsa el badge o abre la URL de abajo: Tampermonkey abre su página de instalación; pulsa **Instalar**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Método B — instalar desde el ZIP descargado

1. **Descarga el ZIP**

   En la [página de GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) pulsa **Code → Download ZIP**.
2. **Descomprime**

   Extrae el ZIP en una carpeta normal.
3. **Instala Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Añadir a Chrome; luego abre `chrome://extensions` y activa **Modo de desarrollador**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Añadir a Firefox.
4. **Carga el userscript**

   Pulsa el icono de Tampermonkey en la barra → **Panel de control**. Arrastra `tanktrouble-netlab.install.user.js` desde la carpeta a la página y pulsa **Instalar**.
5. **Recarga la página del juego**

   Abre <https://tanktrouble.com/game> (recarga si ya estaba abierta). La bola aparece arriba a la izquierda; púlsala para expandir y empieza a usarla.

Si arrastrar no funciona: usa el enlace de un clic de arriba o importa el archivo desde Utilidades del panel de Tampermonkey. `tanktrouble-netlab.user.js` es idéntico; `install.user.js` es la copia con BOM para arrastrar.

## Atajos

| Key | |
|---|---|
| `Ctrl+Shift+S` | activar/desactivar la optimización (A/B en vivo) |
| `Ctrl+Shift+L` | ocultar / mostrar el HUD |
| `Ctrl+Shift+E` | exportar el informe de diagnóstico (también se copia) |
| `Ctrl+Shift+P` | probar las 7 regiones y clasificarlas |

El botón **⚡** del panel equivale a `Ctrl+Shift+S`. El panel permite elegir entre **11 idiomas**; idioma, interruptor y posición de la bola se guardan en `localStorage`.

## Solución de problemas

- **No aparece nada** — Comprueba que la URL coincide con `*://*.tanktrouble.com/*` y que el script está activado, luego `Ctrl+F5`.
- **El panel desapareció** — Pulsa `Ctrl+Shift+L`. La posición y el estado contraído se recuerdan.
- **Sigue a tirones** — Es tu línea. Exporta un informe (`Ctrl+Shift+E`) y compara regiones.

## Enlaces

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Español](../README.es.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
