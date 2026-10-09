/*
 * 生成文档：读取 docs/langs.json，写出
 *   README.md（仓库主页：只放多语言介绍 + 语言/教程跳转）
 *   docs/README.<lang>.md      各语言介绍
 *   docs/install/<lang>.md     各语言的安装教程（从安装油猴开始）
 *
 * 用法：  node tools/build-docs.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RAW = 'https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js';
const REPO = 'https://github.com/L-Shy-P/TankTrouble-Network-Optimization';
const ORDER = ['en', 'zh', 'ja', 'ko', 'ru', 'ar', 'fr', 'es', 'de', 'pt'];

/* 各语言的小节标题 / 说明句 / 快捷键说明 */
const S = {
	en: {
		tut: 'Install tutorial', one: 'One-click install', steps: 'Steps', keys: 'Hotkeys', trouble: 'Troubleshooting', links: 'Links',
		click: 'Click the badge (or open the URL below) → Tampermonkey opens the install page → press **Install**:',
		k: ['toggle the network optimization (live A/B)', 'hide / show the HUD', 'export the diagnostic report (also copied to clipboard)', 'probe all 7 server regions and rank them'],
		note: 'The **⚡** button in the panel does the same as `Ctrl+Shift+S`. The panel also lets you pick one of **10 languages**; language, optimization switch and floating-ball position are cached in `localStorage`.'
	},
	zh: {
		tut: '安装教程', one: '一键安装', steps: '步骤', keys: '快捷键', trouble: '常见问题', links: '相关',
		click: '点上面的按钮（或直接打开下面的地址）→ 油猴会弹出安装页 → 点 **安装**：',
		k: ['开关网络优化（实时 A/B 对比）', '隐藏 / 显示 HUD', '导出诊断报告（同时复制到剪贴板）', '探测 7 个服务器区域并排名'],
		note: '面板里的 **⚡** 按钮和 `Ctrl+Shift+S` 等价。面板里还能选 **10 国语言**，语言 / 优化开关 / 悬浮球位置都会缓存在 `localStorage`。'
	},
	ja: {
		tut: 'インストール手順', one: 'ワンクリックインストール', steps: '手順', keys: 'ショートカット', trouble: 'よくある質問', links: 'リンク',
		click: '上のボタン（または下の URL）を開く → Tampermonkey のインストール画面が開く → **インストール**：',
		k: ['ネットワーク最適化のオン/オフ（A/B 比較）', 'HUD の表示 / 非表示', '診断レポートを出力（クリップボードにもコピー）', '7 つの地域サーバーを測定して順位付け'],
		note: 'パネルの **⚡** は `Ctrl+Shift+S` と同じです。パネルでは **10 言語**から選べ、言語・最適化スイッチ・ボール位置は `localStorage` に保存されます。'
	},
	ko: {
		tut: '설치 안내', one: '원클릭 설치', steps: '단계', keys: '단축키', trouble: '문제 해결', links: '링크',
		click: '위 버튼(또는 아래 URL)을 열면 → Tampermonkey 설치 화면이 뜹니다 → **설치**를 누르세요:',
		k: ['네트워크 최적화 켜기/끄기 (실시간 A/B)', 'HUD 숨기기 / 표시', '진단 보고서 내보내기(클립보드에도 복사)', '7개 지역 서버를 측정해 순위 표시'],
		note: '패널의 **⚡** 버튼은 `Ctrl+Shift+S`와 같습니다. 패널에서 **10개 언어**를 고를 수 있고, 언어·최적화 스위치·공 위치는 `localStorage`에 저장됩니다.'
	},
	ru: {
		tut: 'Руководство по установке', one: 'Установка в один клик', steps: 'Шаги', keys: 'Горячие клавиши', trouble: 'Если что-то не работает', links: 'Ссылки',
		click: 'Нажмите кнопку (или откройте ссылку ниже) → Tampermonkey откроет страницу установки → нажмите **Установить**:',
		k: ['включить/выключить оптимизацию (живое A/B)', 'скрыть / показать HUD', 'экспорт диагностического отчёта (и в буфер обмена)', 'протестировать 7 регионов и построить рейтинг'],
		note: 'Кнопка **⚡** в панели делает то же, что `Ctrl+Shift+S`. В панели можно выбрать один из **10 языков**; язык, переключатель и позиция шара хранятся в `localStorage`.'
	},
	ar: {
		tut: 'دليل التثبيت', one: 'التثبيت بنقرة واحدة', steps: 'الخطوات', keys: 'اختصارات لوحة المفاتيح', trouble: 'حل المشكلات', links: 'روابط',
		click: 'اضغط الشارة (أو افتح الرابط بالأسفل) → سيفتح Tampermonkey صفحة التثبيت → اضغط **تثبيت**:',
		k: ['تشغيل/إيقاف تحسين الشبكة (مقارنة فورية)', 'إخفاء / إظهار الواجهة', 'تصدير تقرير التشخيص (ويُنسخ أيضًا)', 'فحص 7 مناطق وترتيبها'],
		note: 'زر **⚡** في اللوحة يعمل مثل `Ctrl+Shift+S`. ويمكنك اختيار واحدة من **10 لغات**؛ تُحفظ اللغة والمفتاح وموضع الكرة في `localStorage`.'
	},
	fr: {
		tut: "Tutoriel d'installation", one: 'Installation en un clic', steps: 'Étapes', keys: 'Raccourcis', trouble: 'Dépannage', links: 'Liens',
		click: 'Cliquez le badge (ou ouvrez l’URL ci-dessous) → Tampermonkey ouvre la page d’installation → **Installer** :',
		k: ['activer/désactiver l’optimisation (A/B en direct)', 'masquer / afficher le HUD', 'exporter le rapport de diagnostic (aussi copié)', 'tester les 7 régions et les classer'],
		note: 'Le bouton **⚡** du panneau équivaut à `Ctrl+Shift+S`. Le panneau propose **10 langues** ; langue, interrupteur et position du ballon sont mémorisés dans `localStorage`.'
	},
	es: {
		tut: 'Tutorial de instalación', one: 'Instalación en un clic', steps: 'Pasos', keys: 'Atajos', trouble: 'Solución de problemas', links: 'Enlaces',
		click: 'Pulsa el badge (o abre la URL de abajo) → Tampermonkey abre la página de instalación → **Instalar**:',
		k: ['activar/desactivar la optimización (A/B en vivo)', 'ocultar / mostrar el HUD', 'exportar el informe de diagnóstico (también se copia)', 'probar las 7 regiones y clasificarlas'],
		note: 'El botón **⚡** del panel equivale a `Ctrl+Shift+S`. El panel permite elegir entre **10 idiomas**; idioma, interruptor y posición de la bola se guardan en `localStorage`.'
	},
	de: {
		tut: 'Installationsanleitung', one: 'Installation mit einem Klick', steps: 'Schritte', keys: 'Tastenkürzel', trouble: 'Fehlerbehebung', links: 'Links',
		click: 'Klicke den Badge (oder öffne die URL unten) → Tampermonkey öffnet die Installationsseite → **Installieren**:',
		k: ['Optimierung ein-/ausschalten (Live-A/B)', 'HUD aus-/einblenden', 'Diagnosebericht exportieren (auch in die Zwischenablage)', 'alle 7 Regionen testen und ranken'],
		note: 'Der **⚡**-Button im Panel entspricht `Ctrl+Shift+S`. Im Panel gibt es **10 Sprachen**; Sprache, Schalter und Kugelposition werden in `localStorage` gespeichert.'
	},
	pt: {
		tut: 'Tutorial de instalação', one: 'Instalação em um clique', steps: 'Passos', keys: 'Atalhos', trouble: 'Solução de problemas', links: 'Links',
		click: 'Clique no badge (ou abra a URL abaixo) → o Tampermonkey abre a página de instalação → **Instalar**:',
		k: ['ligar/desligar a otimização (A/B ao vivo)', 'ocultar / mostrar o HUD', 'exportar o relatório de diagnóstico (também copiado)', 'testar as 7 regiões e classificá-las'],
		note: 'O botão **⚡** do painel equivale a `Ctrl+Shift+S`. O painel permite escolher entre **10 idiomas**; idioma, chave e posição da bola ficam no `localStorage`.'
	}
};

const L = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'langs.json'), 'utf8'));
const KEYS = ['Ctrl+Shift+S', 'Ctrl+Shift+L', 'Ctrl+Shift+E', 'Ctrl+Shift+P'];
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s, 'utf8');

/** 页脚语言切换器：prefix 为空表示当前目录里就是 README.<lang>.md */
function switcher(prefix, self) {
	return ORDER.map(c => {
		const label = L[c].flag + ' ' + L[c].name;
		return c === self ? '<b>' + label + '</b>' : '[' + label + '](' + prefix + c + '.md)';
	}).join(' · ');
}

/* ---------- 各语言介绍页 ---------- */
for (const c of ORDER) {
	const d = L[c], s = S[c];
	const feat = d.features.map(f => '| ' + f[0] + ' | ' + f[1] + ' |').join('\n');
	write('docs/README.' + c + '.md', `# ${d.flag} ${d.title}

> ${d.tag}

${d.intro.join('\n\n')}

## ${s.one} · Features

| | |
|---|---|
${feat}

## ${s.one}

👉 **[${s.tut}](install/${c}.md)** · [⬇ raw script](${RAW})

## ${s.links}

* [Repository](${REPO}) · [${s.tut}](install/${c}.md) · [Technical notes (中文)](TECHNICAL.zh.md)

<p align="right"><sub>${switcher('', c)}</sub></p>
`);
}

/* ---------- 各语言安装教程 ---------- */
for (const c of ORDER) {
	const d = L[c], s = S[c];
	const steps = d.steps.map((x, i) => `${i + 1}. **${x[0]}**\n\n   ${x[1]}\n`).join('\n');
	const keys = KEYS.map((k, i) => `| \`${k}\` | ${s.k[i]} |`).join('\n');
	const trouble = d.trouble.map(t => `- **${t[0]}** — ${t[1]}`).join('\n');
	write('docs/install/' + c + '.md', `# ${s.tut}

> ${d.flag} **${d.title}** — ${d.tag}

<p align="right"><sub>${switcher('', c)}</sub></p>

## ${s.one}

[![Install](https://img.shields.io/badge/install-${c}-brightgreen)](${RAW})

${s.click}

\`\`\`
${RAW}
\`\`\`

## ${s.steps}

${steps}
## ${s.keys}

| Key | |
|---|---|
${keys}

${s.note}

## ${s.trouble}

${trouble}

## ${s.links}

* [Repository](${REPO}) · [${d.name}](../README.${c}.md) · [Technical notes (中文)](../TECHNICAL.zh.md)
`);
}

/* ---------- 仓库主页：只放多语言介绍 ---------- */
const rows = ORDER.map(c => `| ${L[c].flag} | [${L[c].name}](docs/README.${c}.md) | [${S[c].tut}](docs/install/${c}.md) |`).join('\n');
const blocks = ORDER.map(c => `<details>
<summary><b>${L[c].flag} ${L[c].name}</b> — ${L[c].title}</summary>

${L[c].intro.join('\n\n')}

👉 **[${S[c].tut}](docs/install/${c}.md)** · [${L[c].name}](docs/README.${c}.md)

</details>`).join('\n\n');
const version = (fs.readFileSync(path.join(ROOT, 'tanktrouble-netlab.user.js'), 'utf8').match(/\/\/ @version\s+(\S+)/) || [])[1] || '0.0.0';

write('README.md', `<div align="center">

# TankTrouble Network Optimization

**Richer, more real-time and more accurate network display — plus real optimization.**

[![version](https://img.shields.io/badge/version-${version}-blue)](${RAW})
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![platform](https://img.shields.io/badge/Tampermonkey-userscript-orange)](${RAW})

[**⬇ Install**](${RAW}) · [**📖 Install tutorial**](docs/install/en.md) · [简体中文](docs/README.zh.md)

</div>

---

## 🌐 Languages · 多语言

| | Read | Install |
|---|---|---|
${rows}

---

## ✨ Main features

| | |
|---|---|
| **Richer** · 更丰富 | line / avg / **live** / max / jitter / stalls / stability — one panel, updating live |
| **More real-time** · 更实时 | a dedicated **2-second ping probe** measures the real RTT (frame intervals are *not* latency) |
| **More accurate** · 更准确 | real stalls (TCP head-of-line blocking) are told apart from lobby / between-rounds idle gaps |
| **Real optimization** · 真优化 | render-time smoothing + local authority + dead reckoning, with a **live A/B switch** (⚡) |

**No server, no network configuration, not a VPN.** A pure client-side Tampermonkey userscript —
the game server sees exactly the same bytes as before.

---

## 📦 What it does (10 languages)

${blocks}

---

## 🔗 Links

* [Install tutorial (10 languages)](docs/install/en.md)
* [Technical notes — how it works & the dead ends (中文)](docs/TECHNICAL.zh.md)
* [Changelog](tanktrouble-netlab.user.js) — see the \`CHANGELOG\` constant in the script
* [License (MIT)](LICENSE)

> ⚠️ Not affiliated with TankTrouble. A fan-made diagnostics / optimization tool.
`);

console.log('生成完成：README.md + docs/README.*.md (' + ORDER.length + ') + docs/install/*.md (' + ORDER.length + ')  version=' + version);
