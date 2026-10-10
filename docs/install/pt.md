# Tutorial de instalação

> 🇧🇷 **TankTrouble — otimização de rede** — Exibição de rede mais rica, mais em tempo real e mais precisa — e otimização de verdade.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · <b>🇧🇷 Português</b> · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ É um userscript, não uma extensão do navegador

Instale primeiro o **Tampermonkey** (gerenciador de userscripts). Não use “Carregar extensão descompactada”/a página de extensões do Chrome — o arquivo `.user.js` é gerenciado pelo Tampermonkey, não instalado como extensão.

## Método A — instalação com um clique (recomendado)

[![Install](https://img.shields.io/badge/install-pt-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Depois de instalar o Tampermonkey, clique no badge ou abra a URL abaixo: o Tampermonkey abre a página de instalação; clique em **Instalar**.

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Método B — instalar a partir do ZIP baixado

1. **Baixe o ZIP**

   Na [página do GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) clique em **Code → Download ZIP**.
2. **Descompacte**

   Extraia o ZIP para uma pasta normal.
3. **Instale o Tampermonkey**

   Chrome/Edge: [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → Adicionar ao Chrome; depois abra `chrome://extensions` e ative o **Modo do desenvolvedor**. Firefox: [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → Adicionar ao Firefox.
4. **Carregue o userscript**

   Clique no ícone do Tampermonkey na barra → **Painel**. Arraste `tanktrouble-netlab.install.user.js` da pasta para a página e clique em **Instalar**.
5. **Atualize a página do jogo**

   Abra <https://tanktrouble.com/game> (atualize se já estiver aberta). A bola aparece no canto superior esquerdo; clique nela para expandir e comece a usar.

Se arrastar não funcionar: use o link de um clique acima ou importe o arquivo em Utilitários no painel do Tampermonkey. `tanktrouble-netlab.user.js` é idêntico; `install.user.js` é a cópia com BOM para arrastar.

## Atalhos

| Key | |
|---|---|
| `Ctrl+Shift+S` | ligar/desligar a otimização (A/B ao vivo) |
| `Ctrl+Shift+L` | ocultar / mostrar o HUD |
| `Ctrl+Shift+E` | exportar o relatório de diagnóstico (também copiado) |
| `Ctrl+Shift+P` | testar as 7 regiões e classificá-las |

O botão **⚡** do painel equivale a `Ctrl+Shift+S`. O painel permite escolher entre **11 idiomas**; idioma, chave e posição da bola ficam no `localStorage`.

## Solução de problemas

- **Nada aparece** — Confirme que a URL corresponde a `*://*.tanktrouble.com/*` e que o script está ativo, depois `Ctrl+F5`.
- **O painel sumiu** — Pressione `Ctrl+Shift+L`. A posição e o estado recolhido são lembrados.
- **Ainda travando** — É a sua linha. Exporte um relatório (`Ctrl+Shift+E`) e compare regiões.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Português](../README.pt.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
