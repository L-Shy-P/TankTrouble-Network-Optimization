# Tutorial de instalación

> 🇪🇸 **TankTrouble — optimización de red** — Más rico, más en tiempo real y más preciso: el estado de la red y una optimización real.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · <b>🇪🇸 Español</b> · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ Es un userscript, no una extensión del navegador

Primero instala **Tampermonkey** (gestor de userscripts). No uses «Cargar extensión descomprimida»/la página de extensiones de Chrome: Tampermonkey gestiona el archivo `.user.js`, no se instala como extensión.

## Método A — instalación en un clic (recomendado)

[![Install](https://img.shields.io/badge/install-es-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Pulsa el badge (o abre la URL de abajo). Si funciona, Tampermonkey abre su propia página de instalación — una página oscura con el nombre del script, la versión y un botón **Install**; solo después de pulsar **Install** queda instalado. (Si ves una página llena de código que empieza por `// ==UserScript==`, o el archivo solo se descarga, el clic no llegó a Tampermonkey — consulta la FAQ de abajo.)

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

## FAQ para principiantes (si te pierdes, empieza aquí)

- **¿Es una extensión de Chrome? ¿Se añade en chrome://extensions?** — No, es un userscript. Instala primero Tampermonkey y luego instala el script dentro de él. No uses «Cargar extensión descomprimida».
- **Tampermonkey parece sospechoso.** — Es el gestor de userscripts más usado en Chrome/Edge/Firefox y se instala desde las tiendas oficiales (tampermonkey.net). El proyecto es open source en GitHub; no necesita servidor, VPN ni configuración de red.
- **Descargué el ZIP, ¿arrastro la carpeta entera?** — No. Arrastra solo el archivo `tanktrouble-netlab.install.user.js` al panel de Tampermonkey. Una carpeta no es un script y no se instalará.
- **¿Cómo abro el panel de Tampermonkey?** — Pulsa el icono de Tampermonkey en la barra de herramientas → Panel de control. Si no lo ves, pulsa el botón de rompecabezas/extensiones y fija Tampermonkey.
- **El enlace raw muestra código / Chrome dice que no se puede instalar desde este sitio.** — Con Tampermonkey instalado, abre el enlace raw y Tampermonkey mostrará su página de instalación. Si no, copia la URL y usa Panel → Utilidades → Instalar desde URL.
- **Arrastro el archivo y no pasa nada.** — Suéltalo en la página del panel de Tampermonkey (no en chrome://extensions ni en una web normal). Si se bloquea, usa el enlace de un clic o «Instalar desde URL».
- **Lo instalé pero no veo nada en el juego.** — Recarga la página del juego con Ctrl+F5, comprueba que el script está activado en Tampermonkey y pulsa Ctrl+Shift+L para mostrar el HUD. La página abierta antes de instalar debe recargarse.
- **¿Tengo que guardar el ZIP/carpeta?** — No. El script ya está dentro de Tampermonkey; puedes borrar el ZIP. Actualiza desde Tampermonkey o reinstalando el enlace raw.
- **En Tampermonkey hay «Importar desde archivo»/«Add file», ¿ahí lo subo?** — No, ese botón es para copias de seguridad `.zip` de Tampermonkey. Para instalar este script usa Panel → Utilidades → Instalar desde URL, o arrastra el único archivo `.user.js` al panel.
- **¿Tengo que renombrar, editar o descomprimir el `.user.js`?** — No, úsalo tal cual. El archivo es el propio script; no lo pongas en `chrome://extensions` ni subas la carpeta entera.
- **Pulsé la instalación en un clic (método A): ¿de verdad se instaló?** — Si funcionó, **Tampermonkey abre su propia página de instalación**: una página oscura con el nombre del script "TankTrouble Network Optimization", el número de versión y un botón **Install**; solo al pulsar **Install** queda instalado. Si ves una página llena de código (que empieza por `// ==UserScript==`) o el archivo solo se ha descargado, el clic no llegó a Tampermonkey. Usa en su lugar **Dashboard → Utilities → Install from URL** (pega `https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js`), o arrastra el archivo `tanktrouble-netlab.install.user.js` descargado a la página **Dashboard**. Además: los enlaces raw de GitHub pueden quedar en caché unos minutos; si la página de instalación muestra una versión antigua, espera un poco o pulsa `Ctrl+F5` y vuelve a hacer clic.
- **¿Cómo confirmo que está realmente instalado y en ejecución?** — Tres comprobaciones: ① en la lista de scripts del **Dashboard** de Tampermonkey se ve "TankTrouble Network Optimization" y el interruptor está en **ON**; ② en una página de `tanktrouble.com`, aparece una insignia numérica (**1**) en el icono de Tampermonkey; ③ pulsa **F12 → Console** y deberías ver una línea `[TT NetLab vX.Y.Z] loaded...`. Si falta ③: recarga primero la página con **Ctrl+F5**; si sigue faltando, el script está desactivado o solo se instaló en parte (**reinstálalo**; el archivo debe empezar en la línea 1 por `// ==UserScript==`, copiar desde el medio como `(function () {` no sirve).

## Solución de problemas

- **No aparece nada** — Comprueba que la URL coincide con `*://*.tanktrouble.com/*` y que el script está activado, luego `Ctrl+F5`.
- **El panel desapareció** — Pulsa `Ctrl+Shift+L`. La posición y el estado contraído se recuerdan.
- **Sigue a tirones** — Es tu línea. Exporta un informe (`Ctrl+Shift+E`) y compara regiones.

## Enlaces

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Español](../README.es.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
