/*
 * 在真实浏览器里验证 HUD 交互（拖拽 / 折叠 / 隐藏 / 恢复 / 不溢出）。
 * 用法：  bash ui-check.sh
 * 需要机器上装了 Edge 或 Chrome。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const us = fs.readFileSync(path.join(dir, 'tanktrouble-netlab.user.js'), 'utf8');
const harness = fs.readFileSync(path.join(dir, '_ui_harness.js'), 'utf8');

const html = [
	'<!DOCTYPE html><html><head><meta charset="utf-8"><title>PENDING</title>',
	'<script>window.__err=[];addEventListener("error",function(e){window.__err.push(e.message+"@"+e.lineno);});</script>',
	'</head><body><div id="canvas"></div>',
	'<script>',
	us,
	'</script>',
	'<script>',
	harness,
	'</script></body></html>'
].join('\n');

const out = path.join(dir, '_ui_check.html');
fs.writeFileSync(out, html, 'utf8');
console.log('生成:', out);
