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

## FAQ para iniciantes (se estiver perdido, comece aqui)

- **Isso é uma extensão do Chrome? Adiciono em chrome://extensions?** — Não, é um userscript. Instale primeiro o Tampermonkey e depois instale o script dentro dele. Não use “Carregar extensão descompactada”.
- **O Tampermonkey parece suspeito.** — É o gerenciador de userscripts mais usado no Chrome/Edge/Firefox e vem das lojas oficiais (tampermonkey.net). O projeto é open source no GitHub; não precisa de servidor, VPN ou configuração de rede.
- **Baixei o ZIP — arrasto a pasta inteira?** — Não. Arraste apenas o arquivo `tanktrouble-netlab.install.user.js` para o painel do Tampermonkey. Uma pasta não é um script e não será instalada.
- **Como abro o painel do Tampermonkey?** — Clique no ícone do Tampermonkey na barra de ferramentas → Painel. Se não aparecer, clique no botão de quebra-cabeça/extensões e fixe o Tampermonkey.
- **O link raw mostra código / o Chrome diz que não pode instalar deste site.** — Com o Tampermonkey instalado, abra o link raw: ele mostra a própria página de instalação. Se não, copie a URL e use Painel → Utilitários → Instalar de URL.
- **Arrasto o arquivo e nada acontece.** — Solte na página do painel do Tampermonkey (não em chrome://extensions nem numa página normal). Se o arrastar for bloqueado, use o link de um clique ou “Instalar de URL”.
- **Instalei, mas não vejo nada no jogo.** — Atualize a página do jogo com Ctrl+F5, confirme que o script está ativado no Tampermonkey e pressione Ctrl+Shift+L para mostrar o HUD. A página aberta antes de instalar precisa ser atualizada.
- **Preciso guardar o ZIP/pasta?** — Não. O script já está dentro do Tampermonkey; pode apagar o ZIP. Atualize pelo Tampermonkey ou reinstalando o link raw.
- **No Tampermonkey existe «Importar de arquivo»/«Add file» — é aí que envio o arquivo?** — Não, esse botão é para backups `.zip` do Tampermonkey. Para instalar este script use Painel → Utilitários → Instalar de URL, ou arraste o único arquivo `.user.js` para o painel.
- **Preciso renomear, editar ou descompactar o `.user.js`?** — Não, use o arquivo como está. O arquivo é o próprio script; não coloque em `chrome://extensions` nem envie a pasta inteira.
## Solução de problemas

- **Nada aparece** — Confirme que a URL corresponde a `*://*.tanktrouble.com/*` e que o script está ativo, depois `Ctrl+F5`.
- **O painel sumiu** — Pressione `Ctrl+Shift+L`. A posição e o estado recolhido são lembrados.
- **Ainda travando** — É a sua linha. Exporte um relatório (`Ctrl+Shift+E`) e compare regiões.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Português](../README.pt.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
