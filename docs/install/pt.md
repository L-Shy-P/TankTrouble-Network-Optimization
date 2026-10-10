# Tutorial de instalação

> 🇧🇷 **TankTrouble — otimização de rede** — Exibição de rede mais rica, mais em tempo real e mais precisa — e otimização de verdade.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · <b>🇧🇷 Português</b> · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## Instalação em um clique

[![Install](https://img.shields.io/badge/install-pt-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Clique no badge (ou abra a URL abaixo) → o Tampermonkey abre a página de instalação → **Instalar**:

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Passos

1. **Instale o Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo). Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/). “Adicionar ao navegador” → “Adicionar extensão”.

2. **Ative o modo desenvolvedor (Chrome/Edge)**

   Abra `chrome://extensions` (ou `edge://extensions`) e ative **Modo do desenvolvedor** no canto superior direito.

3. **Instale o script**

   Clique em **Instalar o script** abaixo e depois **Instalar**.

4. **Abra o jogo**

   Vá para <https://tanktrouble.com/game> e entre em uma partida: o painel aparece no canto superior esquerdo.

5. **Como usar**

   Arraste a barra de título para mover. Clique no ponto para recolher em bola (média / ping atual / estabilidade); clique na bola para expandir. `Ctrl+Shift+S` otimização, `Ctrl+Shift+L` ocultar, `Ctrl+Shift+E` exportar relatório.

## Atalhos

| Key | |
|---|---|
| `Ctrl+Shift+S` | ligar/desligar a otimização (A/B ao vivo) |
| `Ctrl+Shift+L` | ocultar / mostrar o HUD |
| `Ctrl+Shift+E` | exportar o relatório de diagnóstico (também copiado) |
| `Ctrl+Shift+P` | testar as 7 regiões e classificá-las |

O botão **⚡** do painel equivale a `Ctrl+Shift+S`. O painel permite escolher entre **10 idiomas**; idioma, chave e posição da bola ficam no `localStorage`.

## Solução de problemas

- **Nada aparece** — Confirme que a URL corresponde a `*://*.tanktrouble.com/*` e que o script está ativo, depois `Ctrl+F5`.
- **O painel sumiu** — Pressione `Ctrl+Shift+L`. A posição e o estado recolhido são lembrados.
- **Ainda travando** — É a sua linha. Exporte um relatório (`Ctrl+Shift+E`) e compare regiões.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Português](../README.pt.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
