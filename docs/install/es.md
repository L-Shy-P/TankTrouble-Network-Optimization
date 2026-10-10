# Tutorial de instalación

> 🇪🇸 **TankTrouble — optimización de red** — Más rico, más en tiempo real y más preciso: el estado de la red y una optimización real.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · <b>🇪🇸 Español</b> · [🇩🇪 Deutsch](de.md) · [🇧🇷 Português](pt.md) · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ Es un userscript, no una extensión del navegador

Instala primero **Tampermonkey** (gestor de userscripts). No uses `chrome://extensions` / «Cargar extensión descomprimida»: Tampermonkey gestiona el archivo `.user.js`, no se instala como extensión. Si aparece una página llena de código, estás en la entrada equivocada — vuelve a este tutorial.

## Método A — arrastra el archivo descargado al Dashboard de Tampermonkey (recomendado, el más simple)

### Paso 1 (solo una vez) — instala Tampermonkey

Chrome/Edge: abre [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Añadir a Chrome**. Firefox: abre [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Añadir a Firefox**.

Si después de instalarlo no ves el icono de Tampermonkey en la barra de herramientas: pulsa el botón **rompecabezas / extensiones** arriba a la derecha y **fija (Pin)** Tampermonkey.

### Paso 2 — descarga el archivo del script

Pulsa **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (o abre el enlace de abajo): el navegador guardará el archivo en tu carpeta **«Descargas»** con el nombre `tanktrouble-netlab.install.user.js`.

**No lo renombres, no lo descomprimas y no lo edites** — es un script de texto sin más.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Paso 3 — abre el **Dashboard** de Tampermonkey (aquí se atasca la mayoría)

Pulsa el **icono de Tampermonkey** en la barra de herramientas → en el menú emergente pulsa **Dashboard** (en español: **Panel de control**).

- ¿No encuentras el icono? Pulsa el botón **rompecabezas / extensiones** y luego Tampermonkey.
- ⚠️ El elemento «**Añadir nuevo script**» de ese menú abre el **editor**, no la entrada de instalación. Usa el **Dashboard** (en la interfaz china: «管理面板»).
- Si ya estás en otra página de Tampermonkey, pulsa **Installed scripts / Scripts instalados** en la barra lateral izquierda para volver a la lista.

### Paso 4 — arrastra el archivo dentro

Deja abierta la **página de lista del Dashboard** y arrastra `tanktrouble-netlab.install.user.js` desde tu carpeta **«Descargas» hasta la página del Dashboard** → aparece la página de instalación de Tampermonkey (página oscura con el nombre "TankTrouble Network Optimization", la versión y un botón **Install**) → pulsa **Install**.

- Si arrastrar no funciona: **Dashboard → Utilities / Utilidades → Install from URL**, pega el mismo enlace de descarga y pulsa **Install**.
- También puedes pulsar directamente el enlace de instalación en un clic (se conserva abajo como **Método B**): si Tampermonkey está instalado, abre la página de instalación al momento. Si en su lugar ves una página llena de código que empieza por `// ==UserScript==`, el clic no llegó a Tampermonkey → vuelve al método de arrastrar de arriba.

### Paso 5 — entra en el juego

Abre <https://tanktrouble.com/game> → fuerza la recarga con **Ctrl + F5** → el panel o la bola flotante aparecerá arriba a la izquierda. Si no lo ves, pulsa **Ctrl + Shift + L** — puede estar oculto.

### Autocomprobación (tres puntos)

① La lista del **Dashboard** muestra "TankTrouble Network Optimization" y el interruptor está en **ON**; ② en una página `tanktrouble.com` el icono de Tampermonkey muestra un globo numérico (**1**); ③ pulsa **F12 → Console**: debe aparecer `[TT NetLab vX.Y.Z] loaded...`.

## Método B — instalación en un clic (con Tampermonkey ya instalado)

[![Install](https://img.shields.io/badge/install-es-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Si ya tienes Tampermonkey, pulsa el badge (o el enlace de abajo): Tampermonkey abre directamente su propia página de instalación — una página oscura con el nombre "TankTrouble Network Optimization", la versión y un botón **Install**; solo después de pulsar **Install** queda instalado. Si ves una página llena de código que empieza por `// ==UserScript==`, el clic no llegó a Tampermonkey → vuelve al **Método A** (arrastrar).

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Método C — instalar desde el ZIP descargado (sin conexión)

Si ya sabes instalar arrastrando, **el Método A es suficiente — no necesitas el ZIP**. Usa el ZIP solo si quieres guardar todo el repositorio sin conexión.

1. **Descarga el ZIP**

   En la [página de GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) pulsa **Code → Download ZIP**.
2. **Descomprime**

   Extrae el ZIP en una carpeta normal.
3. **Comprueba que Tampermonkey está instalado**

   Si no lo está, vuelve al paso 1 del Método A. No uses `chrome://extensions`.
4. **Carga el userscript**

   Pulsa el icono de Tampermonkey → **Dashboard**, deja abierta la página de lista, arrastra `tanktrouble-netlab.install.user.js` desde la carpeta hasta la página del Dashboard y pulsa **Install**. Si arrastrar no funciona, usa **Dashboard → Utilities → Install from URL**.
5. **Recarga la página del juego**

   Abre <https://tanktrouble.com/game> (recarga si ya estaba abierta). La bola aparece arriba a la izquierda; púlsala para expandir y empieza a usarla.

`tanktrouble-netlab.user.js` es idéntico; `install.user.js` es la copia con BOM para arrastrar.

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
- **Descargué el ZIP, ¿arrastro la carpeta entera?** — No. Con el Método A el ZIP no hace falta en absoluto: descarga el único archivo `tanktrouble-netlab.install.user.js` (paso 2) y arrastra solo ese archivo desde «Descargas» al panel de Tampermonkey. Una carpeta no es un script y no se instalará.
- **¿Dónde está el Dashboard de Tampermonkey y cómo se abre?** — Pulsa el **icono de Tampermonkey** en la barra de herramientas → **Dashboard** (Panel de control). ¿No ves el icono? Pulsa el botón rompecabezas/extensiones y fija Tampermonkey. Si ya estás en otra página de Tampermonkey, pulsa **Installed scripts / Scripts instalados** a la izquierda para volver a la lista. ⚠️ No uses el elemento «**Añadir nuevo script**» — abre el editor, no la entrada de instalación.
- **Pulsé «Añadir nuevo script» y se abrió un editor: ¿es la entrada de instalación?** — No. «Añadir nuevo script» abre el **editor** de Tampermonkey para escribir un script; no es donde se instala este. La entrada de instalación es la página de lista del **Dashboard** («Scripts instalados»): arrastra ahí el `tanktrouble-netlab.install.user.js` descargado, o usa **Dashboard → Utilities / Utilidades → Install from URL** y pega `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`.
- **El enlace de descarga muestra una página de código / Chrome dice que no se puede instalar desde este sitio.** — Con el Método A eso es normal: ese enlace solo sirve para guardar el archivo (busca `tanktrouble-netlab.install.user.js` en «Descargas»). Después arrastra el archivo a la página de lista del **Dashboard** de Tampermonkey. Si no se descargó, haz clic derecho en el enlace → «Guardar enlace como…», o usa **Dashboard → Utilities → Install from URL** con el mismo enlace.
- **Arrastro el archivo y no pasa nada.** — Suéltalo directamente en la página de lista del **Dashboard** de Tampermonkey (no en chrome://extensions ni en una web normal), dejando esa página abierta y en primer plano. Si se bloquea el arrastre, usa **Dashboard → Utilities → Install from URL**.
- **Lo instalé pero no veo nada en el juego.** — Recarga la página del juego con Ctrl+F5, comprueba que el script está activado en Tampermonkey y pulsa Ctrl+Shift+L para mostrar el HUD. La página abierta antes de instalar debe recargarse.
- **¿Tengo que guardar el ZIP/carpeta?** — No. El script ya está dentro de Tampermonkey; puedes borrar el ZIP. Actualiza desde Tampermonkey o reinstalando el enlace raw.
- **En Tampermonkey hay «Importar desde archivo»/«Add file», ¿ahí lo subo?** — No, ese botón es para copias de seguridad `.zip` de Tampermonkey. Para instalar este script usa Panel → Utilidades → Instalar desde URL, o arrastra el único archivo `.user.js` al panel.
- **¿Tengo que renombrar, editar o descomprimir el `.user.js`?** — No, úsalo tal cual. El archivo es el propio script; no lo pongas en `chrome://extensions` ni subas la carpeta entera.
- **Pulsé el enlace de instalación en un clic (Método B): ¿de verdad se instaló?** — Si funcionó, **Tampermonkey abre su propia página de instalación**: una página oscura con el nombre del script "TankTrouble Network Optimization", el número de versión y un botón **Install**; solo se instala al pulsar **Install**. Si ves una página llena de código (que empieza por `// ==UserScript==`), o el archivo solo se descargó, el clic no llegó a Tampermonkey: vuelve al **Método A** y arrastra el `tanktrouble-netlab.install.user.js` descargado a la página del **Dashboard**, o usa **Dashboard → Utilities → Install from URL**.
- **¿Cómo confirmo que está realmente instalado y en ejecución?** — Tres comprobaciones: ① en la lista de scripts del **Dashboard** de Tampermonkey se ve "TankTrouble Network Optimization" y el interruptor está en **ON**; ② en una página de `tanktrouble.com`, aparece una insignia numérica (**1**) en el icono de Tampermonkey; ③ pulsa **F12 → Console** y deberías ver una línea `[TT NetLab vX.Y.Z] loaded...`. Si falta ③: recarga primero la página con **Ctrl+F5**; si sigue faltando, el script está desactivado o solo se instaló en parte (**reinstálalo**; el archivo debe empezar en la línea 1 por `// ==UserScript==`, copiar desde el medio como `(function () {` no sirve).

## Solución de problemas

- **No aparece nada** — Comprueba que la URL coincide con `*://*.tanktrouble.com/*` y que el script está activado, luego `Ctrl+F5`.
- **El panel desapareció** — Pulsa `Ctrl+Shift+L`. La posición y el estado contraído se recuerdan.
- **Sigue a tirones** — Es tu línea. Exporta un informe (`Ctrl+Shift+E`) y compara regiones.

## Enlaces

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Español](../README.es.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
