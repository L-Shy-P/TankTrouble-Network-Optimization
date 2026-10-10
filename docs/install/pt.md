# Tutorial de instalação

> 🇧🇷 **TankTrouble — otimização de rede** — Exibição de rede mais rica, mais em tempo real e mais precisa — e otimização de verdade.

<p align="right"><sub>[🇬🇧 English](en.md) · [🇨🇳 中文](zh.md) · [🇯🇵 日本語](ja.md) · [🇰🇷 한국어](ko.md) · [🇷🇺 Русский](ru.md) · [🇸🇦 العربية](ar.md) · [🇫🇷 Français](fr.md) · [🇪🇸 Español](es.md) · [🇩🇪 Deutsch](de.md) · <b>🇧🇷 Português</b> · [🇻🇳 Tiếng Việt](vi.md)</sub></p>

## ⚠️ É um userscript, não uma extensão do navegador

Instale primeiro o **Tampermonkey** (gerenciador de userscripts). Não use `chrome://extensions` / “Carregar extensão descompactada”: o arquivo `.user.js` é gerenciado pelo Tampermonkey, não instalado como extensão. Se aparecer uma página cheia de código, você está na entrada errada — volte a este tutorial.

## Método A — arraste o arquivo baixado para o Dashboard do Tampermonkey (recomendado, o mais simples)

### Passo 1 (só uma vez) — instale o Tampermonkey

Chrome/Edge: abra a [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) → **Adicionar ao Chrome**. Firefox: abra [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/tampermonkey/) → **Adicionar ao Firefox**.

Se depois de instalar você não vir o ícone do Tampermonkey na barra de ferramentas: clique no botão **quebra-cabeça / extensões** no canto superior direito e **fixe (Pin)** o Tampermonkey.

### Passo 2 — baixe o arquivo do script

Clique em **[⬇ Download](https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js)** (ou abra o link abaixo): o navegador salva o arquivo na pasta **“Downloads”** com o nome `tanktrouble-netlab.install.user.js`.

**Não renomeie, não descompacte e não edite** — é apenas um script de texto.

```
https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js
```

### Passo 3 — abra o **Dashboard** do Tampermonkey (é aqui que a maioria trava)

Clique no **ícone do Tampermonkey** na barra de ferramentas → no menu que abrir clique em **Dashboard** (em português: **Painel**).

- Não encontrou o ícone: clique no botão **quebra-cabeça / extensões** e depois no Tampermonkey.
- ⚠️ O item “**Adicionar novo script**” desse menu abre o **editor**, não a entrada de instalação. Use o **Dashboard** (na interface chinesa: “管理面板”).
- Se você já estiver em outra página do Tampermonkey, clique em **Installed scripts / Scripts instalados** na barra lateral esquerda para voltar à lista.

### Passo 4 — arraste o arquivo para dentro

Mantenha a **página de lista do Dashboard** aberta e arraste `tanktrouble-netlab.install.user.js` da pasta **“Downloads” para a página do Dashboard** → aparece a página de instalação do Tampermonkey (página escura com o nome "TankTrouble Network Optimization", a versão e um botão **Install**) → clique em **Install**.

- Se arrastar não funcionar: **Dashboard → Utilities / Utilitários → Install from URL**, cole o mesmo link de download e clique em **Install**.
- Você também pode clicar direto no link de instalação em um clique (mantido abaixo como **Método B**): com o Tampermonkey instalado, a página de instalação abre na hora. Se em vez disso aparecer uma página cheia de código começando com `// ==UserScript==`, o clique não chegou ao Tampermonkey → volte ao método de arrastar acima.

### Passo 5 — entre no jogo

Abra <https://tanktrouble.com/game> → force a atualização com **Ctrl + F5** → o painel ou a bola flutuante aparece no canto superior esquerdo. Se não aparecer, pressione **Ctrl + Shift + L** — pode estar oculto.

### Autoverificação (três itens)

① A lista do **Dashboard** mostra "TankTrouble Network Optimization" e o botão está em **ON**; ② numa página `tanktrouble.com` o ícone do Tampermonkey mostra um selo numérico (**1**); ③ pressione **F12 → Console**: deve aparecer `[TT NetLab vX.Y.Z] loaded...`.

## Método B — instalação com um clique (com o Tampermonkey já instalado)

[![Install](https://img.shields.io/badge/install-pt-brightgreen)](https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js)

Com o Tampermonkey instalado, clique no badge (ou no link abaixo): o Tampermonkey abre a própria página de instalação na hora — página escura com o nome "TankTrouble Network Optimization", a versão e um botão **Install**; só depois de clicar em **Install** ele fica instalado. Se aparecer uma página cheia de código começando com `// ==UserScript==`, o clique não chegou ao Tampermonkey → volte ao **Método A** (arrastar).

```
https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
```

## Método C — instalar a partir do ZIP baixado (offline)

Se você já sabe instalar arrastando, **o Método A basta — não precisa do ZIP**. Use o ZIP apenas se quiser guardar o repositório inteiro offline.

1. **Baixe o ZIP**

   Na [página do GitHub](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) clique em **Code → Download ZIP**.
2. **Descompacte**

   Extraia o ZIP para uma pasta normal.
3. **Confirme que o Tampermonkey está instalado**

   Se não estiver, volte ao passo 1 do Método A. Não use `chrome://extensions`.
4. **Carregue o userscript**

   Clique no ícone do Tampermonkey → **Dashboard**, mantenha a página de lista aberta, arraste `tanktrouble-netlab.install.user.js` da pasta para a página do Dashboard e clique em **Install**. Se arrastar não funcionar, use **Dashboard → Utilities → Install from URL**.
5. **Atualize a página do jogo**

   Abra <https://tanktrouble.com/game> (atualize se já estiver aberta). A bola aparece no canto superior esquerdo; clique nela para expandir e comece a usar.

`tanktrouble-netlab.user.js` é idêntico; `install.user.js` é a cópia com BOM para arrastar.

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
- **Baixei o ZIP — arrasto a pasta inteira?** — Não. No Método A o ZIP não é necessário: baixe o único arquivo `tanktrouble-netlab.install.user.js` (passo 2) e arraste apenas esse arquivo da pasta “Downloads” para o painel do Tampermonkey. Uma pasta não é um script e não será instalada.
- **Onde fica o Dashboard do Tampermonkey e como o abro?** — Clique no **ícone do Tampermonkey** na barra de ferramentas → **Dashboard** (Painel). Não achou o ícone? Clique no botão quebra-cabeça/extensões e fixe o Tampermonkey. Se já estiver em outra página do Tampermonkey, clique em **Installed scripts / Scripts instalados** à esquerda para voltar à lista. ⚠️ Não use o item “**Adicionar novo script**” — ele abre o editor, não a entrada de instalação.
- **Cliquei em “Adicionar novo script” e abriu um editor — é a entrada de instalação?** — Não. “Adicionar novo script” abre o **editor** do Tampermonkey para escrever um script; não é ali que este é instalado. A entrada de instalação é a página de lista do **Dashboard** (“Scripts instalados”): arraste para lá o `tanktrouble-netlab.install.user.js` baixado, ou use **Dashboard → Utilities / Utilitários → Install from URL** e cole `https://github.com/L-Shy-P/TankTrouble-Network-Optimization/raw/main/tanktrouble-netlab.install.user.js`.
- **O link de download mostra uma página de código / o Chrome diz que não pode instalar deste site.** — No Método A isso é normal — o link serve apenas para salvar o arquivo (procure `tanktrouble-netlab.install.user.js` na pasta “Downloads”). Depois arraste o arquivo para a página de lista do **Dashboard** do Tampermonkey. Se não baixou, clique com o botão direito no link → “Salvar link como…”, ou use **Dashboard → Utilities → Install from URL** com o mesmo link.
- **Arrasto o arquivo e nada acontece.** — Solte diretamente na página de lista do **Dashboard** do Tampermonkey (não em chrome://extensions nem numa página normal), mantendo essa página aberta e em primeiro plano. Se o arrastar for bloqueado, use **Dashboard → Utilities → Install from URL**.
- **Instalei, mas não vejo nada no jogo.** — Atualize a página do jogo com Ctrl+F5, confirme que o script está ativado no Tampermonkey e pressione Ctrl+Shift+L para mostrar o HUD. A página aberta antes de instalar precisa ser atualizada.
- **Preciso guardar o ZIP/pasta?** — Não. O script já está dentro do Tampermonkey; pode apagar o ZIP. Atualize pelo Tampermonkey ou reinstalando o link raw.
- **No Tampermonkey existe «Importar de arquivo»/«Add file» — é aí que envio o arquivo?** — Não, esse botão é para backups `.zip` do Tampermonkey. Para instalar este script use Painel → Utilitários → Instalar de URL, ou arraste o único arquivo `.user.js` para o painel.
- **Preciso renomear, editar ou descompactar o `.user.js`?** — Não, use o arquivo como está. O arquivo é o próprio script; não coloque em `chrome://extensions` nem envie a pasta inteira.
- **Cliquei no link de instalação em um clique (Método B) — será que instalou mesmo?** — Se deu certo, **o Tampermonkey abre a própria página de instalação**: uma página escura com o nome do script "TankTrouble Network Optimization", o número da versão e um botão **Install** — é o clique em **Install** que instala. Se você vir uma página cheia de código (começando com `// ==UserScript==`) ou o arquivo apenas tiver sido baixado, o clique não chegou ao Tampermonkey: volte ao **Método A** e arraste o `tanktrouble-netlab.install.user.js` baixado para a página do **Dashboard**, ou use **Dashboard → Utilities → Install from URL**.
- **Como confirmo que ele está mesmo instalado e em execução?** — Três verificações: ① na lista de scripts do **Dashboard** do Tampermonkey aparece “TankTrouble Network Optimization” e o botão está em **ON**; ② numa página `tanktrouble.com`, surge um selo numérico (**1**) no ícone do Tampermonkey; ③ pressione **F12 → Console** e deve aparecer a linha `[TT NetLab vX.Y.Z] loaded...`. Se ③ não aparecer: recarregue a página primeiro com **Ctrl+F5**; se continuar sem aparecer, o script está desativado ou foi instalado só em parte (**reinstale**; o arquivo precisa começar na linha 1 com `// ==UserScript==`, copiar a partir do meio, como `(function () {`, não funciona).

## Solução de problemas

- **Nada aparece** — Confirme que a URL corresponde a `*://*.tanktrouble.com/*` e que o script está ativo, depois `Ctrl+F5`.
- **O painel sumiu** — Pressione `Ctrl+Shift+L`. A posição e o estado recolhido são lembrados.
- **Ainda travando** — É a sua linha. Exporte um relatório (`Ctrl+Shift+E`) e compare regiões.

## Links

* [Repository](https://github.com/L-Shy-P/TankTrouble-Network-Optimization) · [Português](../README.pt.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
