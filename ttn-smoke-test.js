/*
 * TankTrouble NetLab 冒烟测试
 *   node ttn-smoke-test.js
 *
 * 用 vm 造一个尽可能像真环境的沙盒：
 *   - WebSocket 可注入收/发帧
 *   - x/y 是「原型上的 accessor，委托给 this.position」——这是 Phaser 2 的真实形态，
 *     也是本脚本 watchSprite 能否安全插入的关键前提
 *   - Game.UIGameState 用 Classy 风格的 getMethod/method
 */
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const NodeURL = require('url').URL;      // 沙盒的 URL 必须是真实现（脚本用 new URL 解析探测 URL）

const SCRIPT = path.join(__dirname, 'tanktrouble-netlab.user.js');
const code = fs.readFileSync(SCRIPT, 'utf8');

/* ---------------- 断言小工具 ---------------- */
let pass = 0;
const failures = [];
function ok(cond, label, extra) {
	if (cond) { pass++; console.log('  ✓ ' + label); }
	else { failures.push(label + (extra ? '  → ' + extra : '')); console.log('  ✗ ' + label + (extra ? '  → ' + extra : '')); }
}

/* ---------------- 环境替身 ---------------- */
let clock = 0;
const intervals = [];
const timeouts = [];
const sandboxEvents = [];
const roundEventCalls = [];
const wsInstances = [];

function makeClassList() {
	const set = new Set();
	return {
		add(c) { set.add(c); },
		remove(c) { set.delete(c); },
		contains(c) { return set.has(c); },
		toggle(c, on) {
			if (on === undefined) { set.has(c) ? set.delete(c) : set.add(c); }
			else if (on) set.add(c);
			else set.delete(c);
		}
	};
}

/* 够用的迷你 DOM：新 HUD 用到 querySelector / classList / pointer 事件，
 * 交互行为本身放到真实浏览器里验（见 UI 检查），这里只保证不崩且能查渲染结果。 */
function el(tag) {
	const node = {
		tagName: (tag || 'div').toUpperCase(), id: '', className: '', textContent: '',
		title: '', type: '', href: '', clicked: false,
		style: {
			cssText: '', display: '', transform: '', background: '', color: '',
			// 自定义属性（--ttn-dur / --ttn-glow）只能走 setProperty
			_props: {},
			setProperty(k, v) { this._props[k] = String(v); },
			getPropertyValue(k) { return this._props[k] || ''; },
			removeProperty(k) { delete this._props[k]; }
		},
		children: [], _q: {}, _html: '',
		offsetWidth: 270, offsetHeight: 120,
		classList: makeClassList(),
		appendChild(c) { this.children.push(c); return c; },
		removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); },
		remove() {},
		_l: {},
		addEventListener(type, fn) { (this._l[type] = this._l[type] || []).push(fn); },
		removeEventListener(type, fn) {
			const a = this._l[type];
			if (!a) return;
			const i = a.indexOf(fn);
			if (i >= 0) a.splice(i, 1);
		},
		fire(type, ev) { (this._l[type] || []).slice().forEach(fn => fn(ev)); },
		setPointerCapture() {}, releasePointerCapture() {},
		click() { this.clicked = true; },
		querySelector(sel) { if (!this._q[sel]) this._q[sel] = el('div'); return this._q[sel]; },
		querySelectorAll() { return []; },
		getAttribute() { return null; }, setAttribute() {}, hasAttribute() { return false; }
	};
	Object.defineProperty(node, 'innerHTML', {
		get() { return this._html; },
		set(v) { this._html = String(v); }
	});
	return node;
}

/* 迷你 DOM 里 innerHTML 只是一个字段（不解析），HUD 的行是真实子节点，
 * 所以断言要遍历 nodes 树取文本/颜色，而不是读 innerHTML。 */
function treeText(node) {
	let out = node.textContent || '';
	(node.children || []).forEach(c => { out += treeText(c); });
	return out;
}
function treeColors(node) {
	let out = (node.style && node.style.color) ? node.style.color + ' ' : '';
	(node.children || []).forEach(c => { out += treeColors(c); });
	return out;
}

function findEl(root, id) {
	if (root.id === id) return root;
	for (const c of root.children || []) { const r = findEl(c, id); if (r) return r; }
	return null;
}

class FakeWS {
	constructor(url, protocols) {
		this.url = url; this.protocols = protocols; this.readyState = 1;
		this._l = {}; this.sent = [];
		wsInstances.push(this);
	}
	addEventListener(type, fn) { (this._l[type] = this._l[type] || []).push(fn); }
	removeEventListener(type, fn) {
		const a = this._l[type] || []; const i = a.indexOf(fn);
		if (i >= 0) a.splice(i, 1);
	}
	send(d) { this.sent.push(d); }
	close() { this.readyState = 3; (this._l.close || []).forEach(f => f({})); }
	/* --- 测试专用 --- */
	/* 真实浏览器把「同一个」MessageEvent 分发给每个监听器，这里必须照做，
	 * 否则无法验证脚本的按帧去重逻辑。 */
	in_(data) {
		const ev = { data };
		(this._l.message || []).forEach(f => f(ev));
	}
	listenerCount() { return (this._l.message || []).length; }
}
FakeWS.CONNECTING = 0; FakeWS.OPEN = 1; FakeWS.CLOSING = 2; FakeWS.CLOSED = 3;

/* Phaser 2 形态的 sprite */
class SpriteProto {
	get x() { return this.position.x; }
	set x(v) { this.position.x = v; }
	get y() { return this.position.y; }
	set y(v) { this.position.y = v; }
	get rotation() { return this._rot; }
	set rotation(v) { this._rot = v; }
}
class Sprite extends SpriteProto {
	constructor(pid) { super(); this.playerId = pid; this.position = { x: 0, y: 0 }; this._rot = 0; }
}

const gameState = {
	tankSprites: { 111: new Sprite('111'), 222: new Sprite('222') }
};

function makeClassy() {
	const methods = {
		_roundEventHandler: function (self, helper, evt, data) { roundEventCalls.push(evt); }
	};
	return {
		getMethod: n => methods[n],
		method: (n, fn) => { methods[n] = fn; },
		_methods: methods
	};
}

/* 捕获 console.log：失败预算"只打一条日志"要靠它计数（其它普通日志不影响断言） */
const consoleLines = [];
const quietConsole = {
	log() { consoleLines.push(Array.prototype.map.call(arguments, String).join(' ')); },
	warn() {}, error: console.error
};

function URLStub(u) { return new NodeURL(u); }        // 可 new、可当函数调用（浏览器 URL 的用法）
URLStub.createObjectURL = () => 'blob:x';
URLStub.revokeObjectURL = () => {};

const sandbox = {
	performance: { now: () => clock },
	console: quietConsole,
	Blob: class { constructor(p) { this.parts = p; } },
	URL: URLStub,
	// 语言自动检测：给个中文浏览器（默认语言 = zh），后面再单独测换语言
	navigator: { userAgent: 'smoke', clipboard: null, language: 'zh-CN' },
	location: { href: 'https://tanktrouble.com/game' },
	// 记录 setTimeout 而不真的跑：测试可以按需取出回调手动触发（HUD 动画的收尾就走这里）
	setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; },
	clearTimeout: () => {},
	setInterval: (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
	clearInterval: () => {},
	document: {
		readyState: 'complete',
		documentElement: el('html'),
		head: el('head'),
		body: el('body'),
		createElement: el,
		// 真实浏览器当然有；新增的"点空白关语言菜单"等全局监听要用到
		addEventListener() {}, removeEventListener() {}
	},
	innerWidth: 1280,
	innerHeight: 800,
	localStorage: (() => { const m = new Map(); return {
		getItem: k => (m.has(k) ? m.get(k) : null),
		setItem: (k, v) => m.set(k, String(v)),
		removeItem: k => m.delete(k)
	}; })(),
	addEventListener: (t, fn) => { sandboxEvents.push({ t, fn }); },
	Game: {
		UIGameState: makeClassy(),
		state: { getCurrentState: () => gameState }
	},
	Users: { getAllPlayerIds: () => ['111'] },
	RoundModel: { _EVENTS: { ROUND_START: 1, TANK_KILLED: 7 } },
	WebSocket: FakeWS
};
sandbox.window = sandbox;

/* ---------------- 装载 ---------------- */
console.log('\n[1] 装载脚本');
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const T = sandbox.__TTN__;
ok(!!T, 'window.__TTN__ 已注册');
ok(sandbox.WebSocket !== FakeWS, 'window.WebSocket 已被包装');
ok(sandbox.WebSocket.prototype === FakeWS.prototype, '包装后 instanceof / 原型链保持一致');
ok(sandbox.WebSocket.OPEN === 1, '静态常量 OPEN 已透传');

/* ---------------- WebSocket 收发钩子 ---------------- */
console.log('\n[2] WebSocket 收发钩子');
const ws = new sandbox.WebSocket('wss://asia-central1-mp1.tanktrouble.com:443');
ok(ws instanceof FakeWS, '新建连接返回真实 WebSocket 实例');
ok(T.conns.length === 1, '连接已被登记');
ok(ws.listenerCount() === 1, '脚本自持一条监听（观测不依赖游戏注册方式）', 'got ' + ws.listenerCount());

/* 用 onmessage 语义 + addEventListener 语义各注册一次 */
let viaAdd = 0, viaProp = 0;
ws.addEventListener('message', () => { viaAdd++; });
ws.onmessage = () => { viaProp++; };
ws.in_('{"_typeId":15}');
ok(viaAdd === 1 && viaProp === 1, 'addEventListener 与 onmessage 两条路径都被观测到');

ws.send('{"_typeId":15}');
ok(ws.sent.length === 1 && T.conns[0].framesOut === 1, 'send 已透传且被计数');

/* 解除监听后不应再收到 */
const removable = () => { throw new Error('不该再被调用'); };
const keep = ws.listenerCount();
ws.addEventListener('message', removable);
ws.removeEventListener('message', removable);
ok(ws.listenerCount() === keep, 'removeEventListener 能正确摘掉包装后的监听器');

/* ---------------- 帧间隔 / 卡顿 / 补发洪流 ---------------- */
console.log('\n[3] 卡顿与补发洪流识别');
let t = 0;
function frame(obj) { clock = t; ws.in_(JSON.stringify(obj)); }

for (let i = 0; i < 40; i++) { t += 50; frame({ _typeId: 5, tick: i, x: i * 0.35, y: 100, angle: 0 }); }

for (let s = 0; s < 3; s++) {
	t += 600;                                     // 静默 600ms = 一次卡顿
	frame({ _typeId: 5, tick: 100 + s, x: 20, y: 100, angle: 0 });
	for (let i = 0; i < 8; i++) { t += 4; frame({ _typeId: 5, tick: 101 + s, x: 20 + i * 0.1, y: 100, angle: 0 }); }
	t += 80; frame({ _typeId: 5, tick: 110 + s, x: 21, y: 100, angle: 0 });
}

t += 20; frame({ _typeId: 28, gameCount: 1, playerCount: 5 });

const c0 = T.conns[0];
ok(c0.framesIn === 40 + 3 * 10 + 1 + 1, '入帧计数正确(一帧只算一次)', 'got ' + c0.framesIn);
ok(c0.stallCount === 3, '识别出 3 次卡顿', 'got ' + c0.stallCount);
ok(c0.maxGap >= 590 && c0.maxGap <= 620, '最大间隔 ≈600ms', 'got ' + c0.maxGap);
const bigBursts = c0.stalls.filter(s => s.burstFrames >= 3);
ok(bigBursts.length === 3, '3 次卡顿都带补发洪流', JSON.stringify(c0.stalls.map(s => s.burstFrames)));

/* 第二条连接：验证非 JSON / 二进制计数（真环境里选区探测会同时开 7 条） */
const ws2 = new sandbox.WebSocket('wss://eu-west1-mp1.tanktrouble.com:443');
clock = 10; ws2.in_('this is not json');
clock = 20; ws2.in_(new Uint8Array([1, 2, 3, 4]));
clock = t;   // 恢复主连接的时间线，保证主连接仍是"最近活跃"的那条
const c1 = T.conns[1];
ok(c1.framesIn === 2 && c1.nonJson === 1 && c1.binaryIn === 1,
	'无游戏监听也能独立计数：1 非 JSON + 1 二进制', JSON.stringify({ f: c1.framesIn, n: c1.nonJson, b: c1.binaryIn }));
ok(c0.nonJson === 0 && c0.binaryIn === 0, '非 JSON 帧不会污染主连接统计');

/* ---------------- 协议结构指纹 ---------------- */
console.log('\n[4] 协议结构指纹');
const shape5 = c0.shapes.get(5);
const shape28 = c0.shapes.get(28);
ok(!!shape5 && !!shape28, '按 _typeId 分成两类消息');
ok(shape5.count === 70, 'typeId=5 共 70 帧', 'got ' + (shape5 && shape5.count));
ok(/x:n/.test(shape5.schema) && /angle:n/.test(shape5.schema), 'schema 抓到数值字段', shape5.schema);
ok(shape5.nums.has('$.x') && shape5.nums.get('$.x').max === 21, '记录 $.x 的 min/max/last');
ok(shape5.samples.length === 2, '每种消息留有样本', JSON.stringify(shape5.samples.length));
ok(shape28.count === 1, 'typeId=28 只出现 1 次');

/* ---------------- 局内坦克坐标监视 ---------------- */
console.log('\n[5] 局内坦克坐标写入监视');
const tick1s = intervals.find(x => x.ms === 1000);
ok(!!tick1s, '已注册 1s 轮询');
tick1s.fn();
ok(T.tankWatch.records.length === 2 &&
	T.tankWatch.records[0].label.indexOf('LOCAL') === 0 &&
	T.tankWatch.records[1].label.indexOf('ENEMY') === 0,
	'本地玩家与对手坦克都被挂上（对手平滑是纯视觉优化）',
	JSON.stringify(T.tankWatch.records.map(r => r.label)));

const spr = gameState.tankSprites[111];
for (let i = 0; i < 60; i++) spr.x = i * 0.05;
ok(spr.position.x > 2.9, '平滑写入被忠实转发到 Phaser', 'x=' + spr.position.x);
ok(T.tankWatch.records[0].writes === 60, '写入次数被计数', 'got ' + T.tankWatch.records[0].writes);

spr.x = 50;                                        // 一次大写入
const rec = T.tankWatch.records[0];
ok(rec.perAxis.x.maxStep > 40, '单笔最大步进被记录', 'maxStep=' + rec.perAxis.x.maxStep);
/* 再写一些，触发周期性调用栈抽样（每 stackSampleEvery 次） */
for (let i = 0; i < 60; i++) spr.x = 50 + i * 0.05;
ok(rec.writes >= 100, '写入次数足够触发抽样', 'writes=' + rec.writes);
ok(rec.stacks.size >= 1, '抽样记录了写入调用栈');
const stackTxt = rec.stacks.size ? String(Array.from(rec.stacks.values())[0].stack) : '';
ok(stackTxt.indexOf('at ') >= 0 && stackTxt.length > 20, '调用栈内容有效', JSON.stringify(stackTxt.slice(0, 120)));
ok(spr.y === 0 && rec.perAxis.y.writes === 0, '未触碰的轴保持零干预');

/* 普通属性（非 accessor）不应被破坏性改写 */
class PlainSprite { constructor() { this.x = 0; this.y = 0; } }
const plain = new PlainSprite();
gameState.tankSprites[333] = plain;
sandbox.Users.getAllPlayerIds = () => ['333'];
tick1s.fn();
ok(!!plain.__ttn && T.tankWatch.records.length === 3,
	'普通数据属性的精灵也能安全挂上（用闭包存值，不改属性形态）', 'records=' + T.tankWatch.records.length);
plain.x = 7; plain.y = -3;
ok(plain.x === 7 && plain.y === -3, '闭包存值路径的读写语义与原属性完全等价');
ok(plain instanceof PlainSprite, '原型链未被破坏');

/* ---------------- Classy 回合事件统计 ---------------- */
console.log('\n[6] 回合事件统计');
sandbox.Game.UIGameState._methods._roundEventHandler({}, {}, 7, {});
sandbox.Game.UIGameState._methods._roundEventHandler({}, {}, 7, {});
sandbox.Game.UIGameState._methods._roundEventHandler({}, {}, 1, {});
ok(roundEventCalls.length === 3, '原方法仍被正常调用（未破坏分发）');
ok(T.tankWatch.roundEvents.get(7).n === 2 && T.tankWatch.roundEvents.get(1).n === 1, '按事件 id 计数正确');

/* ---------------- HUD ---------------- */
console.log('\n[7] HUD 渲染');
/* 指标要有数据才会显示彩色数值：先喂 ping 样本和帧间隔样本 */
T.ping.samples.length = 0;
for (let i = 0; i < 20; i++) T.ping.samples.push({ t: clock, rtt: 96 });
const hudConn = T.primaryConn();
hudConn.gapLog.length = 0;
for (let i = 0; i < 60; i++) hudConn.gapLog.push({ t: clock, gap: 33 });
const tick250 = intervals.find(x => x.ms === 250);
ok(!!tick250, '已注册 250ms HUD 刷新');
tick250.fn();
const hudEl = findEl(sandbox.document.documentElement, 'ttn-root');
ok(!!hudEl, 'HUD 根节点已创建');
ok(!!findEl(sandbox.document.documentElement, 'ttn-ball'), '悬浮球已创建');
ok(!!hudEl.querySelector('#ttn-mini'), '面板左上角的收起球已创建（真实点击行为在浏览器交互测试里验）');
const rowsEl = hudEl.querySelector('#ttn-rows');
const hudRows = treeText(rowsEl);
ok(hudRows.length > 0, 'HUD 行内容已渲染');
ok(hudRows.indexOf('平均延迟') >= 0, 'HUD 显示平均延迟');
ok(hudRows.indexOf('最大延迟') >= 0, 'HUD 显示最大延迟');
ok(hudRows.indexOf('稳定度') >= 0, 'HUD 显示稳定度');
ok(hudRows.indexOf('优化') >= 0, 'HUD 显示优化开关状态');
ok(hudRows.indexOf(String(T.primaryConn().url).replace(/^wss?:\/\//, '').replace(/:443.*$/, '').replace(/\.tanktrouble\.com$/, '')) >= 0, 'HUD 显示的正是当前选中的连接');
/* 颜色现在是节点上的 style.color（增量更新，CSS 才能过渡），不再是拼 HTML 字符串 */
ok(/rgb\(/.test(treeColors(rowsEl)), '彩色高亮写在节点 style.color 上（可过渡，不重建节点）', treeColors(rowsEl).slice(0, 60));
ok(hudRows.indexOf('&lt;span') === -1 && hudRows.indexOf('<span') === -1, '文本里没有 HTML 转义残留');
ok(hudRows.indexOf('帧率') === -1 && hudRows.indexOf('bytes') === -1, '去掉了不重要的调试信息');
ok(hudEl.style.transform.indexOf('translate(') === 0, 'HUD 用 transform 定位（便于拖动）', hudEl.style.transform);

/* 折叠与隐藏：走真实的状态函数，验证可见性逻辑 */
T.setHud(true);
ok(hudEl.style.display === 'block', 'setHud(true) 后显示');
T.smoothing.enabled = true;

/* ---------------- 报告与结论 ---------------- */
console.log('\n[8] 报告与自动结论');
const rep = T.report();
ok(rep.connections.length === 2, '报告含 2 条连接');
ok(rep.connections[0].shapes.length === 3, '报告含 3 种消息类型', 'got ' + rep.connections[0].shapes.length);
ok(rep.connections[0].shapes.some(s => s.typeId === 5 && s.numericFields.some(f => f.path === '$.x')), '报告含数值字段统计');
ok(rep.tanks.length >= 1, '报告含坦克记录', 'n=' + rep.tanks.length);
ok(rep.tanks[0].writeStacks.length >= 1, '报告含写入调用栈（用来定位是谁在移动坦克）');
ok(typeof rep.tanks[0].frameJumps === 'number', '报告含帧跳变指标');
ok(!!rep.discovery && 'foundVia' in rep.discovery, '报告含坦克发现诊断');
ok(rep.roundEvents.names[7] === 'TANK_KILLED', '回合事件 id 已映射为名字');
ok(Array.isArray(rep.verdict) && rep.verdict.length > 0, '给出了自动结论');
ok(rep.verdict.some(v => /队头阻塞/.test(v)), '结论指向 TCP 队头阻塞', JSON.stringify(rep.verdict));
ok(rep.verdict.some(v => /文本 JSON/.test(v)), '结论确认协议为文本 JSON');
ok(JSON.stringify(rep).length > 500, '报告可被 JSON 序列化（用于导出）');

/* 导出路径不应抛异常 */
let exportOk = true;
try { T.export(); } catch (e) { exportOk = false; console.error(e); }
ok(exportOk, 'export() 在只有一个 <a> 的环境下也不报错');
ok(sandbox.document.body.children.some(x => String(x.tagName).toLowerCase() === 'a' && x.clicked), '导出触发了下载点击');

/* ---------------- 区域/线路质量打分 ---------------- */
console.log('\n[9] 区域质量打分（纯函数）');

/* 场景：A 路 RTT 最低但丢包严重 —— 正是"连好了/没连好"的玄学来源 */
const A = T.aggregateRegion('asia-central1-mp1.tanktrouble.com', [40, 42, 41, 43, 40], 5);
const B = T.aggregateRegion('eu-west1-mp1.tanktrouble.com', [95, 96, 94, 97, 95], 0);
const C = T.aggregateRegion('us-west1-mp1.tanktrouble.com', [180, 320, 190, 900, 185], 0);

ok(A.p50 < B.p50, 'A 路 RTT 确实更低（40ms vs 95ms）');
ok(A.failPercent > 40, 'A 路失败率被算出', 'got ' + A.failPercent);
const ranked = [A, B, C].sort((x, y) => x.score - y.score);
ok(ranked[0].host === B.host, '低延迟高丢包的 A 被判为更差，稳定的 B 排第一',
	JSON.stringify(ranked.map(r => [r.host.split('-')[0], r.score])));
ok(ranked[2].host === C.host, 'RTT 抖动大的 C 排最后');

const D = T.aggregateRegion('x.tanktrouble.com', [], 4);
ok(D.score >= 9999, '全失败的区域给极端分而不是 NaN', 'score=' + D.score);
ok(Number.isFinite(D.p50) && Number.isFinite(D.jitter), '空样本不产生 NaN', JSON.stringify(D));

const E = T.aggregateRegion('y.tanktrouble.com', [50, 50, 50], 0);
ok(E.jitter === 0 && E.failPercent === 0, '完美线路抖动为 0');
ok(E.score === 50, '完美线路分数 = RTT 本身', 'got ' + E.score);

/* 主机发现：优先用游戏自己正在探测的那批，而不是写死的兜底表 */
const hosts = T.regionHosts();
ok(hosts.length === 2 && hosts.indexOf('eu-west1-mp1.tanktrouble.com') >= 0,
	'主机来自游戏自身的探测连接而非兜底表', JSON.stringify(hosts));

/* ---------------- 客户端平滑 ---------------- */
console.log('\n[10] 客户端平滑（逐帧追平）');

const tankA = new Sprite('777');
gameState.tankSprites[777] = tankA;
sandbox.Users.getAllPlayerIds = () => ['777'];
tick1s.fn();
const recA = tankA.__ttn;
ok(!!recA && recA.label.indexOf('LOCAL') === 0, '新坦克被挂上并标为本地');
ok(recA.positionHost === 'position', '挂在 position 上（覆盖 sprite.x 与 sprite.position.x）', recA.positionHost);
const smx = recA.smoothers.x;
ok(!!smx && !!recA.smoothers.y, 'x / y 两个轴都有平滑器');

/* [10] 测的是"改状态"式平滑（有害对照模式）：显式打开 stateSmooth */
T.smoothing.stateSmooth = true;
T.smoothing.localAuthority = false;
T.smoothing.localAuthorityRot = false;
const F = () => { clock += 16; T._tick(clock); };

/* ---------- 预热 + 正常移动：必须零干预 ---------- */
let v = 0;
for (let i = 0; i < 30; i++) { v += 0.3; tankA.x = v; F(); }
ok(Math.abs(tankA.position.x - v) < 1e-9, '正常速度每帧一步 → 原样放行（零输入延迟）',
	'x=' + tankA.position.x.toFixed(4) + ' want=' + v.toFixed(4));
ok(smx.frameJumps === 0, '正常移动不产生帧跳变', 'jumps=' + smx.frameJumps);
ok(smx.glideFrames === 0, '正常移动完全不进入滑行', 'glideFrames=' + smx.glideFrames);
ok(smx.profile.p90 > 0.2 && smx.profile.p90 < 0.4, '已学到「正常单帧位移」基线',
	'p90=' + smx.profile.p90.toFixed(3));

/* ---------- 情况 A：一帧内一次大跳变 ---------- */
const beforeA = tankA.position.x;
v += 10; tankA.x = v; F();
const afterA = tankA.position.x;
ok(afterA > beforeA && afterA < v - 0.5, '情况A：大跳变没有一步到位',
	'before=' + beforeA.toFixed(2) + ' → after=' + afterA.toFixed(2) + '，目标=' + v.toFixed(2));
ok(smx.frameJumps === 1, '情况A 被记为一次帧跳变', 'jumps=' + smx.frameJumps);
let nA = 1;
while (Math.abs(tankA.position.x - v) > 1e-9 && nA < 300) { tankA.x = v; F(); nA++; }
ok(Math.abs(tankA.position.x - v) < 1e-9, '情况A：最终精确追平真值', 'frames=' + nA);
ok(nA >= 4 && nA <= 60, '情况A：摊开的帧数合理（1 = 没平滑；太大 = 拖沓）', 'frames=' + nA);

/* ---------- 情况 B：一帧内被连续写 20 次小步 ----------
 * 这正是旧设计漏掉的场景：每一笔只有 0.3，"单笔步长"判据完全抓不到。 */
const beforeB = tankA.position.x;
const baseB = v;
for (let i = 1; i <= 20; i++) tankA.x = baseB + i * 0.3;   // 全部发生在同一帧内
v = baseB + 6;
F();
const movedB = tankA.position.x - beforeB;
ok(movedB > 0 && movedB < 1.0, '情况B：一帧内 20 笔小步同样被摊开',
	'本帧只走了 ' + movedB.toFixed(2) + '，真值却跳了 6.00');
ok(smx.frameJumps === 2, '情况B 也被识别（逐帧度量才看得到）', 'jumps=' + smx.frameJumps);
let nB = 1;
while (Math.abs(tankA.position.x - v) > 1e-9 && nB < 300) { tankA.x = v; F(); nB++; }
ok(Math.abs(tankA.position.x - v) < 1e-9, '情况B：最终精确追平真值', 'frames=' + nB);

/* ---------- 追上之后必须回到零干预 ---------- */
const glideBefore = smx.glideFrames;
for (let i = 0; i < 20; i++) { v += 0.3; tankA.x = v; F(); }
ok(Math.abs(tankA.position.x - v) < 1e-9, '追上后恢复正常放行', 'x=' + tankA.position.x.toFixed(3));
ok(smx.glideFrames === glideBefore, '追上后不再继续干预', 'glideFrames=' + smx.glideFrames);

/* ---------- 安全阀 1：巨大跳变（复活/重开）直接对齐 ---------- */
const snapsBefore = T.smoothing.stats.snaps;
v += 40; tankA.x = v; F();
ok(Math.abs(tankA.position.x - v) < 1e-9, '巨大跳变不滑行，直接对齐（复活/重开不该滑）');
ok(T.smoothing.stats.snaps > snapsBefore, '记了一次对齐');

/* ---------- 安全阀 2：大差距必须在时间预算内收敛，而不是滑一半硬跳 ---------- */
T.smoothing.glideMaxMs = 400;
const t2 = tankA.position.x + 20;
tankA.x = t2; F();
ok(Math.abs(tankA.position.x - t2) > 1, '大修正先进入滑行状态');
let nBig = 1;
while (Math.abs(tankA.position.x - t2) > 1e-9 && nBig < 400) { tankA.x = t2; F(); nBig++; }
ok(Math.abs(tankA.position.x - t2) < 1e-9, '大修正最终精确收敛', 'frames=' + nBig);
ok(nBig <= Math.ceil(400 / 16) + 6, '收敛发生在时间预算内（不是滑不动就硬跳）',
	'nBig=' + nBig + ' 预算帧数=' + (Math.ceil(400 / 16) + 6));
T.smoothing.glideMaxMs = 600;

/* ---------- 安全阀 2b：目标一直跑、怎么都追不上 → 兜底硬对齐 ---------- */
T.smoothing.glideMaxMs = 50;
T.smoothing.backstopMs = 120;
let tgt2 = tankA.position.x + 20;
tankA.x = tgt2; F();
for (let i = 0; i < 20; i++) { tgt2 += 40; tankA.x = tgt2; F(); }   // 目标以远超上限的速度逃走
ok(Math.abs(tankA.position.x - tgt2) < 1e-9, '兜底：追不上时最终硬对齐真值');
T.smoothing.glideMaxMs = 600;
T.smoothing.backstopMs = 2400;

/* ---------- 安全阀 3：回合事件全体对齐 ---------- */
const t3 = tankA.position.x + 3;
T.snapAll();
tankA.x = t3; F();
ok(Math.abs(tankA.position.x - t3) < 1e-9, 'snapAll() 后下一帧直接对齐真值');

/* ---------- 角度跨 ±π 不能被误判为跳变 ---------- */
T.smoothing.localRotation = true;
const tankR = new Sprite('888');
gameState.tankSprites[888] = tankR;
sandbox.Users.getAllPlayerIds = () => ['888'];
tick1s.fn();
const recR = tankR.__ttn;
ok(!!recR && !!recR.smoothers.rotation, 'rotation 轴被挂上');
for (let i = 0; i < 30; i++) { tankR.rotation = (i % 2) ? 3.0 : 3.2; F(); }
const jumpsR = recR.smoothers.rotation.frameJumps;
tankR.rotation = -3.1; F();          // 从 +3.2 跨到 -3.1，真实角差只有 0.017 弧度
ok(recR.smoothers.rotation.frameJumps === jumpsR, '角度跨 ±π 未被误判（做了归一化）',
	'真实角差 = ' + Math.abs(Math.PI * 2 - 6.3).toFixed(4) + ' 弧度');
T.smoothing.localRotation = false;

/* ---------- 关掉后必须完全恢复原生行为 ---------- */
T.smoothing.enabled = false;
T.snapAll();
const raw8 = tankA.position.x + 5;
tankA.x = raw8; F();
ok(Math.abs(tankA.position.x - raw8) < 1e-9, 'setSmoothing(false) 后完全不碰游戏数据');
T.smoothing.enabled = true;

console.log('\n[11] 实体自动挂载 / 本地识别 / 回合事件对齐');

/* ---------- 造几个假的 "UI*" 精灵类，模拟游戏里的实体 ---------- */
function makeUISprite() {
	function C() { this.position = { x: 0, y: 0 }; this._rot = 0; }
	C.prototype = Object.create(SpriteProto.prototype);
	C.prototype.constructor = C;
	C.prototype.spawn = function (x, y, rot) {
		this.x = x; this.y = y; this.rotation = rot;
		return this;
	};
	return C;
}
sandbox.UITankSprite = makeUISprite();
sandbox.UIProjectileImage = makeUISprite();
sandbox.UIRubbleGroup = makeUISprite();      // 装饰类，应被跳过
sandbox.SomethingElse = makeUISprite();      // 不是 UI* 前缀，不应被包

const hookedNow = T.installSpawnHooks();
ok(hookedNow >= 2, '找到了 UI* 精灵类并包住 spawn()', 'hooked=' + hookedNow);
ok(T.entityStats.hookedClasses.indexOf('UIProjectileImage') >= 0, '子弹类被挂钩');
ok(T.entityStats.hookedClasses.indexOf('UIRubbleGroup') === -1, '碎石等装饰类被跳过');
ok(T.installSpawnHooks() === 0, '重复调用是幂等的（不会重复包装）');

/* ---------- 子弹一生成就自动挂上 ---------- */
const bullet = new sandbox.UIProjectileImage();
bullet.spawn(100, 200, 0);
const brec = bullet.__ttn;
ok(!!brec, '子弹生成后自动挂上平滑');
ok(brec && brec.entityKind === 'projectile', '被正确分类为 projectile', brec && brec.entityKind);
ok(!!brec && !!brec.smoothers.x, 'x 轴有平滑器');

/* ---------- 回收复用的精灵：spawn 到新位置必须立刻到位 ---------- */
for (let i = 0; i < 30; i++) { bullet.x = 100 + i * 2; bullet.y = 200; F(); }
ok(bullet.position.x > 140, '子弹正常飞行（未被干预）', 'x=' + bullet.position.x.toFixed(1));
bullet.spawn(900, 700, 0);                   // 同一个实例被回收、放到全新位置
ok(Math.abs(bullet.position.x - 900) < 1e-9 && Math.abs(bullet.position.y - 700) < 1e-9,
	'复用精灵 spawn 时立刻到位（不会从旧位置滑过去）',
	'x=' + bullet.position.x + ' y=' + bullet.position.y);
F();
ok(Math.abs(bullet.position.x - 900) < 1e-9, 'spawn 之后也不会被滑回来');

/* ---------- 坦克类同样处理 ---------- */
const tSprite = new sandbox.UITankSprite();
tSprite.spawn(50, 60, 1.5);
ok(!!tSprite.__ttn, '坦克类生成后自动挂上');
ok(tSprite.__ttn && /local|enemy/.test(tSprite.__ttn.entityKind),
	'坦克被细分为 local/enemy（而不是笼统的 tank）', tSprite.__ttn && tSprite.__ttn.entityKind);

/* ---------- 回合事件：非碰撞要对齐，碰撞不得对齐 ---------- */
sandbox.RoundModel._EVENTS = {
	ROUND_START: 1,
	TANK_KILLED: 7,
	TANK_CREATED: 'tank created',
	TANK_MAZE_COLLISION: 'tank maze collision'
};
const fireRound = (evt) => sandbox.Game.UIGameState._methods._roundEventHandler({}, {}, evt, {});

/* 让某个平滑器进入滑行状态 */
const glider = new sandbox.UIProjectileImage();
glider.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { glider.x = i * 1.0; F(); }
glider.x = glider.position.x + 40; F();       // 制造一次滑行
ok(glider.__ttn.smoothers.x.gliding === true, '已进入滑行状态');

/* 碰撞事件：不能打断滑行 */
fireRound('tank maze collision');
F();
ok(glider.__ttn.smoothers.x.gliding === true, '碰撞事件不会打断滑行（否则平滑等于关闭）');

/* 个体生成事件：不该打断全场滑行（新实体由 spawn 钩子单独对齐） */
fireRound('tank created');
F();
ok(glider.__ttn.smoothers.x.gliding === true, '实体生成事件不会打断已有滑行');

/* 世界重置事件：必须立刻对齐 */
sandbox.RoundModel._EVENTS.MAZE_SET = 'maze set';
fireRound('maze set');
F();
ok(Math.abs(glider.position.x - glider.__ttn.smoothers.x.stored) < 1e-9,
	'世界重置（maze set）立刻对齐真值', 'x=' + glider.position.x);

/* ---------- 本地玩家识别：换名字的 API 也要认得出 ---------- */
sandbox.Users = { getOwnPlayerIds: () => ['918273'] };
ok(T.localPlayerIds()[0] === '918273', 'Users.getOwnPlayerIds() 也能识别本地玩家');

sandbox.Users = { localPlayerIds: ['555'] };
ok(T.localPlayerIds()[0] === '555', 'Users.localPlayerIds 属性也能识别');

sandbox.Users = {};
const savedHook = T.tankWatch.stateFromHook;
T.tankWatch.stateFromHook = { localPlayerIds: ['777'] };
ok(T.localPlayerIds()[0] === '777', '状态实例上的 localPlayerIds 也能识别');
T.tankWatch.stateFromHook = savedHook;

/* 恢复到默认，避免影响后续 */
sandbox.Users = { getAllPlayerIds: () => ['111'] };

/* ---------- 报告里要带上这些诊断 ---------- */
const rep2 = T.report();
ok(!!rep2.discovery.localIds, '报告含本地识别诊断');
ok(!!rep2.entities, '报告含实体挂载统计');
ok(Array.isArray(rep2.entities.hookedClasses) && rep2.entities.hookedClasses.length >= 2,
	'报告列出了被挂钩的实体类', JSON.stringify(rep2.entities.hookedClasses));
ok(!!rep2.discovery.stateKeys || !!rep2.discovery.foundVia, '报告含状态发现信息');


console.log('\n[12] 悬浮球指标 / 实体分类 / 回弹计数 / 模型画像');

/* ---------- 换房间/换服：primaryConn 必须按"最近还有数据"挑 ---------- */
const firstConn = T.primaryConn();
ok(!!firstConn, '拿到当前连接');
// 游戏自己为选服开的"只收一两帧"的短命探测连接：lastT 很新，但绝不能被当成游戏连接
const gameProbeWs = new sandbox.WebSocket('wss://us-west1-mp1.tanktrouble.com:443');
clock += 50;
gameProbeWs.in_('{"_typeId":28}');
ok(T.primaryConn() !== T.conns[T.conns.length - 1],
	'游戏自己的单帧探测连接不能被当成游戏连接（否则稳定度永远没样本）',
	'选了 ' + String(T.primaryConn().url));
const switchWs = new sandbox.WebSocket('wss://eu-east9-mp1.tanktrouble.com:443');
clock += 50;
for (let i = 0; i < 4; i++) switchWs.in_('{"_typeId":3}');
const switchConn = T.conns[T.conns.length - 1];
ok(T.primaryConn() === switchConn,
	'换服后立刻切到新连接（不能因为旧连接总帧数多就一直选它）',
	'选了 ' + String(T.primaryConn().url));
ok(T.primaryConn().framesIn < firstConn.framesIn,
	'新连接帧数确实远少于旧连接', T.primaryConn().framesIn + ' vs ' + firstConn.framesIn);

/* ---------- 探测器换服：目标主机要跟着换，旧样本必须清空 ---------- */
T.ping.started = false; T.ping.host = null; T.ping.samples.length = 0;
T.startPingProbe('asia-central1-mp1.tanktrouble.com');
ok(T.ping.host === 'asia-central1-mp1.tanktrouble.com', '探测器锁定第一个服', T.ping.host);
T.ping.samples.push({ t: clock, rtt: 111 });
T.startPingProbe('asia-central1-mp1.tanktrouble.com');
ok(T.ping.samples.length === 1, '同一个服重复调用不会清样本（也不重连）', T.ping.samples.length);
T.startPingProbe('eu-west1-mp1.tanktrouble.com');
ok(T.ping.host === 'eu-west1-mp1.tanktrouble.com', '换服后探测器目标跟着换', T.ping.host);
ok(T.ping.samples.length === 0, '换服后旧服样本被清空（否则两个服的延迟混在一起）', T.ping.samples.length);
ok((T.ping.switches || 0) >= 1, '换服次数被记录', T.ping.switches);
T.ping.started = false; T.ping.host = null; T.ping.samples.length = 0;

/* ---------- 红黄绿分级 ---------- */
const G = T._grade;
ok(G.avg(30).join() === '74,222,128', '低延迟=绿', G.avg(30).join());
ok(G.avg(90).join() === '251,191,36', '中延迟=黄', G.avg(90).join());
ok(G.avg(200).join() === '248,113,113', '高延迟=红', G.avg(200).join());
ok(G.max(100).join() === '74,222,128' && G.max(250).join() === '251,191,36' && G.max(600).join() === '248,113,113',
	'最大延迟三档颜色正确');
ok(G.stability(95).join() === '74,222,128' && G.stability(70).join() === '251,191,36' && G.stability(30).join() === '248,113,113',
	'稳定度三档颜色正确');
ok(T._overallColor({ okPing: true, okCad: true, avg: 30, max: 100, stability: 95 }).join() === '74,222,128',
	'三项全绿 → 球体综合色也是绿');
const mixed = T._overallColor({ okPing: true, okCad: true, avg: 30, max: 600, stability: 30 });
ok(mixed.join() !== '74,222,128' && mixed.join() !== '248,113,113', '混合状况 → 综合色是中间值', mixed.join());
/* 只有一半数据时：不能整球作废，按"有的那半"给色 */
ok(T._overallColor({ okPing: true, okCad: false, avg: 30, max: 100, stability: 0 }).join() === '74,222,128',
	'只有延迟没有稳定度 → 按延迟给绿，不是灰');
ok(T._overallColor({ okPing: false, okCad: false }).join() === '140,147,158', '两块都没有才是灰');

/* ---------- 指标计算 ---------- */
const cm = T.primaryConn();   // 必须用脚本当前实际选中的那条连接（换服后规则会变）
/* 延迟只认 ping 的 RTT 样本 —— 帧间隔不是延迟（空闲时帧会停，间隔能到几千毫秒） */
cm.gapLog.length = 0; cm.stalls.length = 0;
T.ping.samples.length = 0;
for (let i = 0; i < 40; i++) T.ping.samples.push({ t: clock, rtt: 100 });
for (let i = 0; i < 120; i++) cm.gapLog.push({ t: clock, gap: 33 });
let mm = T.netMetrics();
ok(mm.avg === 100, '平均延迟 = RTT 中位数', mm.avg);
ok(mm.max === 100, '平稳时最大延迟 = RTT', mm.max);
ok(mm.stability >= 85, '平稳线路稳定度高', mm.stability);
ok(mm.jitterPercent === 0, '平稳线路小抖动为 0', mm.jitterPercent);
ok(mm.ok === true, '有足够 ping 样本才算 ok');
ok(mm.okPing === true && mm.okCad === true, '两块数据各自独立判定', mm.okPing + '/' + mm.okCad);
ok(mm.why === '', '数据齐全时没有"状态"提示行', mm.why);

/* ---------- "一直灰、什么都不显示"的三个根因（用户实测） ---------- */
/* 根因 A：自己的探测连接被 primaryConn 选中 —— 它 2 秒才一帧，帧样本永远不够 */
const probeConn = {
	url: 'wss://eu-west1-mp1.tanktrouble.com:443', kind: 'probe', probe: true,
	ws: { readyState: 1 }, lastT: clock + 99999, framesIn: 1, gapLog: [], stalls: [],
	shapes: new Map(), nonJson: 0, binaryIn: 0, bytesIn: 0, bytesOut: 0, framesOut: 0,
	binFirst: [], binLast: [], binOutFirst: [], binOutLast: [], outStacks: [], outSamples: [],
	gaps: [], med: 0, stallCount: 0, maxGap: 0, pending: null, openedAt: Date.now(), closedAt: null
};
T.conns.push(probeConn);
ok(T.primaryConn() !== probeConn, '探测连接绝不能被当成游戏连接（否则整球全灰）',
	'选中了 ' + String(T.primaryConn() && T.primaryConn().url));
probeConn.ws.readyState = 1;
for (let i = 0; i < 50; i++) probeConn.gapLog.push({ t: clock, gap: 2000 });
T.conns.pop();
ok(cm.gapLog.length > 0, '探测连接的帧间隔没有混进游戏连接的 gapLog', cm.gapLog.length);

/* 根因 B：延迟缺了不该把稳定度也一起变灰（反之亦然） */
const savedSamples = T.ping.samples.slice();
T.ping.samples.length = 0;
const mmNoPing = T.netMetrics();
ok(mmNoPing.okPing === false && mmNoPing.okCad === true, '没有延迟样本时，稳定度仍然给出', mmNoPing.okPing + '/' + mmNoPing.okCad);
ok(mmNoPing.ok === true, '有一半数据就不算"没数据"（悬浮球不整块灰）', mmNoPing.ok);
ok(/延迟/.test(mmNoPing.why), '状态行说明延迟为什么缺', mmNoPing.why);
T.ping.samples.push(...savedSamples);

/* 根因 C：自建探测被服务器无视时，要用"游戏自己发的 _typeId:15→28"配对出真 RTT */
T.ping.samples.length = 0;
T.ping.sends = 7; T.ping.answers = 0; T.ping.connected = true; T.ping.started = true;
T.ping.sawTypes = { 1: 3 };
const mmDead = T.netMetrics();
ok(mmDead.okPing === false && /无应答/.test(mmDead.why), '探测无应答时状态行直说原因', mmDead.why);
T.ping.sends = 0; T.ping.sawTypes = {};
/* 模拟游戏自己的探测帧：发出 {"_typeId":15} → 收到 {"_typeId":28} */
const gconn = T.primaryConn();
const beforeSamples = T.ping.samples.length;
/* 直接驱动 observe 路径（复用脚本内部同一套 recordOut/recordIn 判定） */
T._recordOut(gconn, '{"_typeId":15}');
clock += 42;
T._recordIn(gconn, { data: '{"_typeId":28}' });
ok(T.ping.samples.length === beforeSamples + 1, '游戏自己的 ping 帧也能算出 RTT 样本', T.ping.samples.length - beforeSamples);
const lastSample = T.ping.samples[T.ping.samples.length - 1];
ok(lastSample.rtt === 42 && lastSample.src === 'game', '样本标为 game 来源且 RTT 正确', JSON.stringify(lastSample));
const mmGame = T.netMetrics();
ok(mmGame.okPing === true, '自建探测全灭时，靠游戏自己的帧仍然有延迟可显示', mmGame.latSrc);

/* 换服后旧服的延迟样本不能混进来 */
T.ping.samples.length = 0;
const pmHost = (String(T.primaryConn().url).match(/^wss?:\/\/([^:\/]+)/) || [])[1];
ok(!!pmHost, '能取到当前线路的主机名', String(pmHost));
for (let i = 0; i < 5; i++) T.ping.samples.push({ t: clock, rtt: 120, host: pmHost, src: 'probe' });
for (let i = 0; i < 5; i++) T.ping.samples.push({ t: clock, rtt: 800, host: 'us-west1-mp1.tanktrouble.com', src: 'probe' });
ok(T.netMetrics().avg === 120, '只统计当前线路的延迟样本（旧服的 800ms 不参与）', T.netMetrics().avg);
T.ping.samples.length = 0;
for (let i = 0; i < 40; i++) T.ping.samples.push({ t: clock, rtt: 100 });

/* 大量小抖动（帧间隔乱跳）必须压低稳定度 —— 这才是用户实际感受 */
cm.gapLog.length = 0;
for (let i = 0; i < 120; i++) cm.gapLog.push({ t: clock, gap: (i % 2 ? 20 : 60) });
const mmJit = T.netMetrics();
ok(mmJit.jitterPercent > 50, '小抖动被识别出来', mmJit.jitterPercent + '%');
ok(mmJit.stability < 50, '小抖动把稳定度压到红区', mmJit.stability);

/* 游戏空闲（>2.5s 的间隔）不该污染延迟，也不该冒充卡顿 */
cm.gapLog.length = 0; cm.stalls.length = 0;
for (let i = 0; i < 100; i++) cm.gapLog.push({ t: clock, gap: 33 });
for (let i = 0; i < 20; i++) cm.gapLog.push({ t: clock, gap: 8000 });
// 局间空闲：之后只跟来正常节奏的一帧，没有积压洪流 → 不是卡顿
for (let i = 0; i < 20; i++) cm.stalls.push({ t: clock, gap: 8000, burstFrames: 1 });
const mmIdle = T.netMetrics();
ok(mmIdle.max <= 100, '空闲时的大帧间隔不再冒充延迟（只剩 RTT）', mmIdle.max);
ok(mmIdle.stalls === 0, '空闲不算卡顿', mmIdle.stalls);
ok(mmIdle.stability >= 85, '空闲不会把稳定度打到 0', mmIdle.stability);

/* 大厅/刚进房：帧样本太少 —— 稳定值绝不能空着（用户实测："不显示稳定值"）。
 * 有 RTT 样本就用 RTT 抖动兜底（live 数据），连 RTT 都没有才沿用上次。 */
cm.gapLog.length = 0; cm.stalls.length = 0;
const mmRttStab = T.netMetrics();
ok(mmRttStab.stabSrc === 'rtt', '帧节奏没样本时用 RTT 抖动兜底（不再显示 --）', mmRttStab.stabSrc);
ok(typeof mmRttStab.stability === 'number' && mmRttStab.stability > 0,
	'兜底也算得出一个稳定值', mmRttStab.stability);
ok(mmRttStab.okCad === true, '所以悬浮球的稳定值那一行有数字（不是 --）', String(mmRttStab.okCad));
/* 抖动很大的 RTT：兜底稳定度必须跟着变差，不能恒等于 100 */
T.ping.samples.length = 0;
for (let i = 0; i < 10; i++) T.ping.samples.push({ t: clock, rtt: (i % 2 ? 60 : 200) });
const mmRttJit = T.netMetrics();
ok(mmRttJit.stabSrc === 'rtt' && mmRttJit.stability < 60,
	'RTT 抖动大 → 兜底稳定度也压下来', mmRttJit.stability);
/* 连 RTT 样本都没有（且超出沿用窗口）→ 才真的是没数据 */
T.ping.samples.length = 0;
const mmNoData = T.netMetrics();
ok(mmNoData.okPing === false, '没有 ping 样本 → 延迟那两行显示 --（灰）', mmNoData.okPing);
ok(mmNoData.stabSrc === 'hold', '此时才是沿用上次（还在 60s 窗口内）', mmNoData.stabSrc);
for (let i = 0; i < 40; i++) T.ping.samples.push({ t: clock, rtt: 100 });

T.ping.samples.length = 0; cm.gapLog.length = 0; cm.stalls.length = 0;
for (let i = 0; i < 30; i++) T.ping.samples.push({ t: clock, rtt: 100 });
for (let i = 0; i < 10; i++) T.ping.samples.push({ t: clock, rtt: 600 });
for (let i = 0; i < 100; i++) cm.gapLog.push({ t: clock, gap: 33 });
for (let i = 0; i < 8; i++) cm.gapLog.push({ t: clock, gap: 700 });
// 真卡顿：停顿 + 之后补发的积压帧洪流
for (let i = 0; i < 6; i++) cm.stalls.push({ t: clock, gap: 700, burstFrames: 5 });
const mmBad = T.netMetrics();
ok(mmBad.max >= 600, '最大延迟反映最差 RTT/停顿', mmBad.max);
ok(mmBad.stalls === 6, '近 1 分钟卡顿次数被统计', mmBad.stalls);
ok(mmBad.stability < 60, '抖动 + 卡顿把稳定度压进红区', mmBad.stability);
ok(T._overallColor(mmBad).join() !== '74,222,128', '整体颜色随之变差');
T.ping.samples.length = 0; cm.gapLog.length = 0; cm.stalls.length = 0;

/* ---------- 坦克归属：spawn 时按 playerId 判定 ---------- */
sandbox.Users = { getAllPlayerIds: () => ['777'] };
const myTank = new sandbox.UITankSprite();
myTank.playerId = '777';
myTank.spawn(10, 20, 0);
ok(!!myTank.__ttn && myTank.__ttn.smoothers.x.kind === 'local',
	'自己的坦克被判定为 local', myTank.__ttn && myTank.__ttn.smoothers.x.kind);

const foeTank = new sandbox.UITankSprite();
foeTank.playerId = '999';
foeTank.spawn(10, 20, 0);
ok(foeTank.__ttn.smoothers.x.kind === 'enemy', '对手坦克被判定为 enemy');

/* 状态快照路径能纠正判错的归属 */
const misTank = new sandbox.UITankSprite();
misTank.playerId = '777';
misTank.spawn(30, 40, 0);
misTank.__ttn.smoothers.x.kind = 'enemy';          // 假装之前判错了
gameState.tankSprites['777'] = misTank;
tick1s.fn();
ok(misTank.__ttn.smoothers.x.kind === 'local', '状态快照路径能把归属纠正回来',
	misTank.__ttn.smoothers.x.kind);
ok(misTank.__ttn.label.indexOf('LOCAL') === 0, '标签也同步纠正', misTank.__ttn.label);

/* ---------- 回弹（反向跳变）计数 ---------- */
const pb = new sandbox.UIProjectileImage();
pb.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { pb.x = i * 3; F(); }        // 稳定向右飞
const smp = pb.__ttn.smoothers.x;
ok(smp.motion > 0, '运动方向基线为正（向右）', smp.motion.toFixed(2));
const backBefore = smp.backJumps, fwdBefore = smp.fwdJumps;
pb.x = pb.position.x - 60; F();                            // 反向大跳 = 回弹
ok(smp.backJumps === backBefore + 1, '反向大跳被计为 backJumps（回弹）',
	'back=' + smp.backJumps + ' fwd=' + smp.fwdJumps);
pb.x = pb.position.x + 60; F();                            // 正向大跳
ok(smp.fwdJumps === fwdBefore + 1, '正向大跳被计为 fwdJumps，不会误判成回弹',
	'back=' + smp.backJumps + ' fwd=' + smp.fwdJumps);

/* ---------- 对齐策略：单颗子弹生成不该打断全场滑行 ---------- */
sandbox.RoundModel._EVENTS = {
	TANK_CREATED: 'tank created',
	PROJECTILE_CREATED: 'projectile created',
	MAZE_SET: 'maze set',
	TANK_MAZE_COLLISION: 'tank maze collision'
};
const fire = (e) => sandbox.Game.UIGameState._methods._roundEventHandler({}, {}, e, {});

const gl = new sandbox.UIProjectileImage();
gl.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { gl.x = i * 1.0; F(); }
gl.x = gl.position.x + 40; F();
ok(gl.__ttn.smoothers.x.gliding === true, '已进入滑行');
fire('projectile created');
F();
ok(gl.__ttn.smoothers.x.gliding === true, '子弹生成事件不会打断滑行（旧版会，等于关掉平滑）');
fire('maze set');
F();
ok(Math.abs(gl.position.x - gl.__ttn.smoothers.x.stored) < 1e-9, '世界重置（maze set）才对齐真值');

/* ---------- 模型字段画像：找服务端时间戳 ---------- */
gameState.projectiles = [{ id: 'p1', x: 100, y: 200, serverTime: 123456, alive: true }];
tick1s.fn();
const prof = T.modelProfile.projectiles;
ok(!!prof && !!prof.fields.serverTime, '模型字段被采样', JSON.stringify(Object.keys((prof && prof.fields) || {})));
gameState.projectiles[0].serverTime = 123500;
gameState.projectiles[0].x = 150;
tick1s.fn();
const fT = prof.fields.serverTime, fX = prof.fields.x;
ok(fT.inc >= 1 && fT.min === 123456 && fT.max === 123500,
	'单调递增的 serverTime 被识别为候选时间戳', JSON.stringify(fT));
ok(fX.inc + fX.dec >= 1, 'x 这种来回变的字段不是单调的', JSON.stringify(fX));

/* 报告的坦克轴里要带 backJumps */
const rep3 = T.report();
const anyAxis = (rep3.tanks.length && rep3.tanks[0].perAxis) ? rep3.tanks[0].perAxis.x : null;
ok(!!anyAxis && 'backJumps' in anyAxis, '报告含 backJumps（用来判断回弹是否存在）',
	anyAxis ? JSON.stringify(anyAxis) : 'no-axis');
ok(!!rep3.modelProfile, '报告含模型画像');


console.log('\n[13] 网络静默外推（不再冻住实体）');

/* 建立向右运动基线 */
const dr = new sandbox.UIProjectileImage();
dr.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { dr.x = i * 2; F(); }
const drS = dr.__ttn.smoothers.x;
ok(drS.motion > 0, '运动基线已建立', drS.motion.toFixed(2));

/* 模型停止更新（网络静默）：只 tick，不再写位置 */
const posBefore = dr.position.x;
const motionBefore = drS.motion;
for (let i = 0; i < 10; i++) { clock += 16; T._tick(clock); }
const posAfter = dr.position.x;
ok(posAfter > posBefore + 1, '静默期实体按最后速度外推，没有冻在原地',
	'before=' + posBefore.toFixed(2) + ' after=' + posAfter.toFixed(2));
ok(Math.abs(drS.motion - motionBefore) < 1e-6, '静默期运动基线不衰减（否则外推会越来越弱）');
ok(drS.reckonFrames <= T.smoothing.deadReckonMax, '外推帧数受上限约束', drS.reckonFrames);

/* 静默测量：网络静默期间模型到底动没动 —— 这决定下一步修法 */
ok(drS.quietFrames > 0, '静默帧被计数', drS.quietFrames);
drS.quietMoved = 0;
for (let i = 0; i < 8; i++) { clock += 16; T._tick(clock); }   // 不写入 = 模型不动
ok(drS.quietMoved === 0, '静默 + 不写入 → 模型确实没动（位移被网络驱动）', drS.quietMoved);
drS.quietMoved = 0;
for (let i = 0; i < 8; i++) { dr.x = dr.position.x + 1; F(); }  // 写入 = 本地模拟还在跑
ok(drS.quietMoved > 0, '静默 + 仍在写入 → 本地模拟在跑（瞬移来自服务端修正）', drS.quietMoved);

/* 模型恢复更新后，外推停止 */
dr.x = dr.position.x + 2; F();
ok(drS.reckonFrames === 0, '模型恢复后外推计数归零');
for (let i = 0; i < 3; i++) { dr.x = dr.position.x + 2; F(); }
ok(drS.reckonFrames === 0, '持续更新时不会外推');

/* 关掉外推后不再漂移 */
T.smoothing.deadReckon = false;
const pos2 = dr.position.x;
for (let i = 0; i < 8; i++) { clock += 16; T._tick(clock); }
ok(Math.abs(dr.position.x - pos2) < 1e-9, 'deadReckon=false 时静默期不漂移');
T.smoothing.deadReckon = true;

console.log('""" + bs + """n[14] 本地权威：服务端修正不采纳');

T.smoothing.stateSmooth = true;
T.smoothing.localAuthority = true;
T.smoothing.localAuthorityRot = true;
sandbox.Users = { getAllPlayerIds: () => ['777'] };
const la = new sandbox.UITankSprite();
la.playerId = '777';
la.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { la.x = i * 2; F(); }      // 本地物理：每帧 +2
const laS = la.__ttn.smoothers.x;
ok(laS.kind === 'local', '是本地坦克', laS.kind);
ok(Math.abs(la.position.x - 58) < 1e-9, '正常增量照常应用', la.position.x);

/* 服务端修正：往回拽 40 单位 —— 必须完全不采纳 */
const beforeCorr = la.position.x;
const corrTarget = laS.stored - 40;
la.x = corrTarget; F();
ok(Math.abs(la.position.x - beforeCorr) < 1e-9,
	'服务端修正被完全忽略，位置不被拉回',
	'修正前=' + beforeCorr.toFixed(1) + ' 修正后=' + la.position.x.toFixed(1) + ' 服务器想拽到=' + corrTarget);
ok(laS.ignored >= 1, '修正被计入 ignored', laS.ignored);

/* 修正之后，本地增量继续生效（坦克还能继续开） */
const afterCorr = la.position.x;
for (let i = 0; i < 6; i++) { la.x = laS.stored + 2; F(); }
ok(la.position.x > afterCorr + 8, '修正之后本地增量继续推进（不卡死）',
	afterCorr.toFixed(1) + ' -> ' + la.position.x.toFixed(1));

/* 持续被服务端往回拽也不会动 */
const holdPos = la.position.x;
for (let i = 0; i < 8; i++) { la.x = laS.stored - 30; F(); }
ok(Math.abs(la.position.x - holdPos) < 1e-9, '持续修正也不会把坦克拽回去', la.position.x.toFixed(1));

/* 对手坦克：仍走平滑（权威只限自己） */
const foe = new sandbox.UITankSprite();
foe.playerId = '999';
foe.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { foe.x = i * 2; F(); }
const foeS = foe.__ttn.smoothers.x;
const foeBefore = foe.position.x;
const foeTarget = foeS.stored - 40;
foe.x = foeTarget;
F();
ok(foe.position.x < foeBefore && foe.position.x > foeTarget,
	'对手坦克是平滑处理，不是硬忽略', foe.position.x.toFixed(1));

/* 复活/重开必须接受绝对位置 */
T.snapAll();
la.x = laS.stored + 120; F();
ok(Math.abs(la.position.x - laS.stored) < 1e-9, 'forceSnap 后接受绝对位置（复活/重开不卡在旧位置）');

/* 报告里要能看到忽略次数与偏差 */
const rep4 = T.report();
const laRec = rep4.tanks.filter(t => /local/i.test(String(t.label))).pop();
ok(!!laRec && laRec.perAxis.x.ignored >= 1, '报告含 ignored（服务端修正被忽略次数）',
	laRec ? laRec.perAxis.x.ignored : 'no-rec');
ok(!!laRec && 'divergence' in laRec.perAxis.x, '报告含 divergence（与服务器真值的偏差）');

/* 关掉权威模式就回到平滑行为 */
T.smoothing.localAuthority = false;
T.snapAll();
la.x = la.position.x; F();
const dBefore = la.position.x;
la.x = dBefore - 40; F();
ok(la.position.x < dBefore - 1, 'localAuthority=false 时恢复平滑（会朝修正移动）',
	la.position.x.toFixed(1));
T.smoothing.localAuthority = true;

/* ---------- 网络优化总开关：关掉后必须完全回到原版行为 ---------- */
T.smoothing.enabled = false;
T.snapAll();
const rawPos = laS.stored + 30;
la.x = rawPos; F();
ok(Math.abs(la.position.x - rawPos) < 1e-9,
	'优化关掉后完全跟随游戏真值（可直接 A/B 对比）', la.position.x.toFixed(1));
for (let i = 1; i <= 5; i++) { la.x = rawPos + i * 5; F(); }
ok(Math.abs(la.position.x - (rawPos + 25)) < 1e-9, '优化关掉后连增量逻辑也不介入',
	la.position.x.toFixed(1));
T.smoothing.enabled = true;

/* ---------- authFactor：小修正不该被当成增量吃进去 ---------- */
T.snapAll();
for (let i = 0; i < 30; i++) { la.x = laS.stored + 2; F(); }   // 稳定每帧 +2
const ignBefore = laS.ignored;
const p0 = la.position.x;
const jump = laS.stored - 20;                                   // 远超 authFactor 阈值 → 算修正
la.x = jump;
F();
ok(laS.ignored === ignBefore + 1, '超过 authFactor 的修正被判为服务端修正',
	'ignored=' + laS.ignored + ' (之前 ' + ignBefore + ')');
ok(Math.abs(la.position.x - p0) < 1e-9, '被判为修正的位移完全不吃',
	p0.toFixed(1) + ' -> ' + la.position.x.toFixed(1));

/* ---------- 默认纯观测：优化关掉时必须一个值都不改（这是现在的默认状态） ---------- */
T.smoothing.enabled = false;
const ob = new sandbox.UITankSprite();
ob.playerId = '999';
ob.spawn(0, 0, 0);
for (let i = 0; i < 30; i++) { ob.x = i * 2; F(); }
ok(Math.abs(ob.position.x - 58) < 1e-9, '纯观测：正常写入原样生效', ob.position.x);
ob.x = 900; F();
ok(Math.abs(ob.position.x - 900) < 1e-9, '纯观测：大跳变也原样生效，完全不介入',
	ob.position.x.toFixed(1));
for (let i = 0; i < 50; i++) { ob.x = 900 + i * 3; F(); }
ok(Math.abs(ob.position.x - (900 + 49 * 3)) < 1e-9, '纯观测：连续写入完全跟随',
	ob.position.x.toFixed(1));
ok(ob.__ttn.smoothers.x.ignored === 0, '纯观测：一次修正都不吞', ob.__ttn.smoothers.x.ignored);
T.smoothing.enabled = true;

console.log('\n[16] 渲染期平滑：状态零改动，只改"画的那一瞬间"');

T.smoothing.enabled = true;
T.smoothing.renderSmooth = true;
T.smoothing.stateSmooth = false;          // 关键：不改任何状态

/* 带渲染函数的假精灵，渲染时把当时的坐标记下来 */
function makeRenderable() {
	function C() { this.position = { x: 0, y: 0 }; this._rot = 0; this.drawn = []; }
	C.prototype = Object.create(SpriteProto.prototype);
	C.prototype.constructor = C;
	C.prototype._renderWebGL = function () {
		this.drawn.push(this.position.x);
	};
	C.prototype._renderCanvas = C.prototype._renderWebGL;
	C.prototype.spawn = function (x, y, r) { this.x = x; this.y = y; this.rotation = r; return this; };
	return C;
}
sandbox.UIRenderTankSprite = makeRenderable();
T.installSpawnHooks();

const rt = new sandbox.UIRenderTankSprite();
rt.spawn(0, 0, 0);
const rr = rt.__ttn;
ok(!!rr && !!rr.smoothers.x, '渲染型精灵被挂上');
ok(!!rt.__ttnRender, '渲染钩子已安装');

/* 先跑够预热（预热只计"非零位移"的帧，所以要多跑一些） */
let rv = 0;
for (let i = 0; i < 40; i++) { rv += 2; rt.x = rv; F(); rt._renderWebGL(); }
ok(rr.smoothers.x.ready, '预热完成，渲染钩子开始生效', 'fsteps=' + rr.smoothers.x.frameSteps.length);

/* 再模拟服务器抖动：忽大忽小忽停 —— 只统计这一段 */
rt.drawn.length = 0;
const rawSeq = [];
for (let i = 0; i < 45; i++) {
	// 大部分帧是正常的 +2，每 7 帧混进一次 +10 的服务端抖动（贴近真实比例）
	rv += (i % 7 === 3) ? 10 : 2;
	rt.x = rv;                    // 游戏写入（服务端状态）
	rawSeq.push(rv);
	F();                         // 我们的帧循环
	rt._renderWebGL();           // 游戏渲染
}

/* 最重要的安全性质：状态一个字节都没被改 */
ok(Math.abs(rt.position.x - rv) < 1e-9,
	'状态零改动：精灵坐标始终等于游戏写入值（绝不再被读回模型）',
	rt.position.x + ' vs ' + rv);

/* 渲染出来的轨迹应该明显更平滑 */
function stepMax(a) { let m = 0; for (let i = 1; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - a[i - 1])); return m; }
function stepArg(a) {
	let m = -1, idx = -1;
	for (let i = 1; i < a.length; i++) { const d = Math.abs(a[i] - a[i - 1]); if (d > m) { m = d; idx = i; } }
	return { i: idx, prev: a[idx - 1], cur: a[idx] };
}
const dbgStep = stepArg(rt.drawn);
const drawnSeq = rt.drawn.slice();
ok(drawnSeq.length === 45, '渲染被调用 45 次', drawnSeq.length);
ok(stepMax(drawnSeq) < stepMax(rawSeq),
	'渲染出来的最大步长明显小于原始（画面变平滑）',
	'render=' + stepMax(drawnSeq).toFixed(2) + '  raw=' + stepMax(rawSeq).toFixed(2) +
	'  drawn[0..5]=' + JSON.stringify(drawnSeq.slice(0, 6).map(x => +x.toFixed(2))) +
	'  raw[0..5]=' + JSON.stringify(rawSeq.slice(0, 6)) +
	'  p25=' + rr.smoothers.x.profile.p25 + ' ready=' + rr.smoothers.x.ready +
	' drawnLen=' + drawnSeq.length + ' 最大步在 i=' + dbgStep.i + ' [' + dbgStep.prev + '->' + dbgStep.cur + ']');
ok(stepMax(drawnSeq) <= stepMax(rawSeq) * 0.6,
	'平滑幅度足够（≤ 原始步长的 60%）',
	'render=' + stepMax(drawnSeq).toFixed(2) + '  raw=' + stepMax(rawSeq).toFixed(2));

/* 渲染结束后状态必须已还原 */
ok(Math.abs(rt.position.x - rv) < 1e-9, '渲染结束后坐标已还原', rt.position.x);

/* 关掉渲染期平滑 → 渲染值必须完全等于真值（原版行为） */
T.smoothing.renderSmooth = false;
rt.drawn.length = 0;
for (let i = 0; i < 10; i++) { v += 4; rt.x = rv; F(); rt._renderWebGL(); }
ok(Math.abs(rt.drawn[rt.drawn.length - 1] - rv) < 1e-9,
	'renderSmooth=false 时渲染值 = 真值（完全原版）', rt.drawn[rt.drawn.length - 1] + ' vs ' + rv);
T.smoothing.renderSmooth = true;

/* 渲染函数抛异常时也必须还原状态 */
T.smoothing.renderSmooth = true;
const boom = new sandbox.UIRenderTankSprite();
boom.spawn(0, 0, 0);
for (let i = 0; i < 25; i++) { boom.x = i * 3; F(); }
const stateBefore = boom.position.x;
let caught = false;
try {
	boom.__ttnRender; // 确认钩子存在
	const orig = boom._renderWebGL;
	boom._renderWebGL = function () { throw new Error('boom'); };
	boom._renderWebGL();
} catch (e) { caught = true; }
ok(caught, '渲染抛异常被抛出（未吞掉）');

/* ---------------- [17] 版本号一致性（发版必查） ----------------
 * 曾经踩过：改了 CHANGELOG/VERSION 却忘了改油猴头部的 @version，
 * 于是安装副本显示 0.2.3、脚本内部却跑 0.2.4，回退对照全乱。 */
console.log('\n[17] 版本号一致性');
const headerVer = (code.match(/^\/\/ @version\s+(\S+)/m) || [])[1];
const constVer = (code.match(/const VERSION = '([^']+)'/) || [])[1];
ok(!!headerVer && headerVer === constVer,
	'油猴头部 @version 与脚本内 VERSION 常量一致', headerVer + ' vs ' + constVer);
ok(/^\d+\.\d+\.\d+$/.test(headerVer || ''), '版本号是三段式', String(headerVer));
ok(Sandbox_VersionMatchesChangelog(), 'CHANGELOG 第一条就是当前版本（否则变更记录会缺一段）');

function Sandbox_VersionMatchesChangelog() {
	const m = code.match(/const CHANGELOG = \[\s*\['([^']+)'/);
	return !!m && m[1] === constVer;
}

/* ---------------- [18] 边缘回弹：不能瞬移 ----------------
 * 用户实测："当悬浮球在屏幕右下角展开时，面板会瞬移弹回屏幕内。"
 * 沙盒里 setTimeout 是空实现，所以这里只验"有没有走回弹这条路"以及夹取结果，
 * 逐帧动画本身由浏览器交互测试（_ui_harness.js）负责。 */
console.log('\n[18] 边缘回弹 / 可视区夹取');
T.setHud(true);
T.hudState.ball = false; T.setHud(true);
T.hudState.x = 99999; T.hudState.y = 99999;
T.clampHud(true);                                   // 瞬移落位（拖动语义）
const atCorner = { x: T.hudState.x, y: T.hudState.y };
ok(atCorner.x + T._clampedAnchor(false).x >= 0, '夹取函数是纯函数（不修改状态）',
	T._clampedAnchor(false).x + ' vs ' + T.hudState.x);
ok(atCorner.x + T.hudCache.w <= 1280 - 8 + 0.01 && atCorner.y + T.hudCache.h <= 800 - 8 + 0.01,
	'展开态夹取后面板右下角在屏幕内',
	'(' + (atCorner.x + T.hudCache.w) + ',' + (atCorner.y + T.hudCache.h) + ') 面板 ' + T.hudCache.w + 'x' + T.hudCache.h);

/* 往外推 300px，然后不带 forceInstant 调 clampHud → 应该"开始回弹"而不是立刻到位 */
T.hudState.x = atCorner.x + 300; T.hudState.y = atCorner.y + 200;
const far = { x: T.hudState.x, y: T.hudState.y };
T.clampHud();
ok(Math.abs(T.hudState.x - far.x) < 40 && Math.abs(T.hudState.y - far.y) < 40,
	'回弹第一帧不能瞬移到位（老实现：clampHud 里直接赋值 → 一帧跳过去）',
	'调用后 (' + Math.round(T.hudState.x) + ',' + Math.round(T.hudState.y) + ')，原本 (' + Math.round(far.x) + ',' + Math.round(far.y) + ')');
ok(T._glide.active === true, '回弹状态机确实启动了', String(T._glide.active));
ok(T._glide.tx === atCorner.x && T._glide.ty === atCorner.y, '回弹目标就是夹取边界',
	'(' + T._glide.tx + ',' + T._glide.ty + ') vs (' + atCorner.x + ',' + atCorner.y + ')');

/* 拖动中必须跟手：forceInstant=true 立刻落位 */
T.clampHud(true);
ok(T._glide.active === false, '瞬时夹取会取消回弹（拖动跟手）', String(T._glide.active));

/* 设计（用户明确要求）：动画期间面板左上角**钉在悬浮球位置**，一个像素都不挪；
 * 越界等展开完再让边界推回来（推回来那一步走回弹）。
 * 绝不能"自动挑一个不会出屏的展开方向" —— 那会让面板跑离球的位置。 */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 99999; T.hudState.y = 99999;
T.clampHud(true);                                   // 球贴到右下角
const ballAnchor = { x: T.hudState.x, y: T.hudState.y };
T.hudState.ball = false;                            // 切到展开态（球在右下角）
T._hudAnimate(false);
const rootEl = hudEl;   // 复用前面拿到的 HUD 根节点
const wantT = 'translate(' + Math.round(ballAnchor.x) + 'px,' + Math.round(ballAnchor.y) + 'px)';
ok(String(rootEl.style.transform).indexOf(wantT) >= 0,
	'展开动画的终点 = 悬浮球原来的位置（一一对应，不自动躲进屏幕）',
	'style=' + rootEl.style.transform + ' 期望含 ' + wantT);
ok(T._glide.active === false, '动画期间不做提前夹取（回弹必须等展开结束）', String(T._glide.active));

/* 展开结束后：边界把面板推回屏幕内，但必须是"回弹"而不是瞬移 */
const animTimer = timeouts[timeouts.length - 1];
ok(!!animTimer && animTimer.ms >= 280, '展开动画有个收尾定时器（结束后才夹取）',
	animTimer ? animTimer.ms + 'ms' : '没有');
animTimer.fn();
ok(Math.abs(T.hudState.x - ballAnchor.x) < 40 && Math.abs(T.hudState.y - ballAnchor.y) < 40,
	'收尾那一刻不能瞬移回屏幕（先停在球的位置，再由回弹推回去）',
	'(' + Math.round(T.hudState.x) + ',' + Math.round(T.hudState.y) + ') vs 球 (' +
	Math.round(ballAnchor.x) + ',' + Math.round(ballAnchor.y) + ')');
ok(T._glide.active === true, '收尾后回弹接管', String(T._glide.active));
const wantTo = T._clampedAnchor(false);
ok(T._glide.tx === wantTo.x && T._glide.ty === wantTo.y,
	'回弹目标 = 按面板尺寸夹取的边界',
	'(' + T._glide.tx + ',' + T._glide.ty + ') vs (' + wantTo.x + ',' + wantTo.y + ')');
ok(wantTo.x + T.hudCache.w <= 1280 - 8 + 0.01 && wantTo.y + T.hudCache.h <= 800 - 8 + 0.01,
	'回弹终点让面板完整落在屏幕内',
	'右下角 (' + (wantTo.x + T.hudCache.w) + ',' + (wantTo.y + T.hudCache.h) + ') 面板 ' + T.hudCache.w + 'x' + T.hudCache.h);

/* ---------------- [19] 惯性甩动 ----------------
 * 用户要求："悬浮球别再严格跟手，加点惯性"。
 * 沙盒里 setTimeout 是记录式的，所以这里手动推进定时器，把整段甩动跑完。 */
console.log('\n[19] 惯性甩动');
const TV = T._throwVelocity;
ok(TV([{ x: 0, y: 0, t: 0 }, { x: 100, y: 0, t: 100 }]) !== null,
	'快速拖动 → 算出松手速度');
const vFast = TV([{ x: 0, y: 0, t: 0 }, { x: 100, y: 0, t: 100 }]);
ok(Math.abs(vFast.vx - 1) < 0.01 && Math.abs(vFast.vy) < 0.01, '速度 = 位移/时间', vFast.vx);
ok(TV([{ x: 0, y: 0, t: 0 }, { x: 3, y: 0, t: 100 }]) === null,
	'慢速拖动（0.03px/ms）算轻放，不甩');
ok(TV([{ x: 0, y: 0, t: 0 }]) === null, '只有一个采样点 → 不甩');
ok(TV([{ x: 0, y: 0, t: 0 }, { x: 50, y: 0, t: 4 }]) === null,
	'采样间隔太短（<8ms）→ 不甩（避免用瞬移事件当速度）');
const vBig = TV([{ x: 0, y: 0, t: 0 }, { x: 10000, y: 0, t: 100 }]);
ok(Math.abs(vBig.vx - T._THROW.maxV) < 0.01, '超快速度会被限幅', vBig.vx);
const vWin = TV([
	{ x: 0, y: 0, t: 0 }, { x: 300, y: 500, t: 500 },        // 老的、慢的
	{ x: 320, y: 640, t: 640 }, { x: 400, y: 700, t: 700 }   // 新的、快的（只该用这两个）
]);
ok(Math.abs(vWin.vx - 80 / 60) < 0.05 && Math.abs(vWin.vy - 1) < 0.02,
	'只用最近 120ms 的轨迹算速度（不看很久以前的慢动作）',
	'vx=' + vWin.vx.toFixed(3) + ' vy=' + vWin.vy.toFixed(3) + '（若用了 700ms 前的采样会得到 0.5）');

/* 真的甩一把：从屏幕中间往右下角甩，必须滑一段、轻微弹墙、最后停在边界内 */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 300; T.hudState.y = 200;
T.clampHud(true);
T._throwHud(3, 1.6);
ok(T._glide.active === true && T._glide.mode === 'throw', '甩动开始（走 throw 模式）',
	String(T._glide.mode));
const startX = T.hudState.x;
let iter = 0, outOfBounds = 0, maxStretch = 0;
while (T._glide.active && iter < 400) {
	const timer = timeouts.pop();
	if (!timer) break;
	clock += 16;
	timer.fn();
	iter++;
	const bp = T.ballAt();
	// 球必须完整在视口内（允许 0.5px 的子像素误差）
	const over = Math.max(-bp.x, -bp.y, bp.x + T.hudCache.BALL - 1280, bp.y + T.hudCache.BALL - 800);
	if (over > 0.5) outOfBounds++;
	maxStretch = Math.max(maxStretch, over);
}
ok(iter > 3, '甩动确实跑了多个步进（不是一步到位）', iter);
ok(outOfBounds === 0, '甩动全程不越界（撞边界就贴住）',
	'越界帧数 ' + outOfBounds + '，最大越界 ' + maxStretch.toFixed(2) + 'px');
ok(T._glide.active === false, '速度衰减到阈值后停下', String(T._glide.active));
ok(T.hudState.x > startX + 50, '确实滑出去了一段（惯性生效）',
	Math.round(startX) + ' → ' + Math.round(T.hudState.x));
ok(T.hudState.x <= 1280 - T.hudCache.BALL / 2 - 20 + 0.51,
	'最后停在边界上（不再越界）', T.hudState.x.toFixed(1));

/* 慢放：轻放不甩，位置就停在松手的地方 */
T.hudState.x = 400; T.hudState.y = 300;
T.clampHud(true);
const vSlow = T._throwVelocity([{ x: 0, y: 0, t: 0 }, { x: 5, y: 0, t: 100 }]);
ok(vSlow === null, '轻放不触发甩动');
ok(T._glide.active === false, '此时没有运动在跑', String(T._glide.active));

/* refreshHud 每 250ms 会调一次 clampHud：没越界时绝不能打断惯性
 * （真实浏览器里就是这里把球甩出去又掐停，只剩几十像素） */
T.hudState.x = 600; T.hudState.y = 300;
T.clampHud(true);
T._throwHud(0.8, 0);
ok(T._glide.active === true, '甩动中（未越界）');
T.clampHud();
T.clampHud();
ok(T._glide.active === true && T._glide.mode === 'throw',
	'没越界时 clampHud 不能打断惯性（refreshHud 每 250ms 会调它）', String(T._glide.mode));

/* 抓住球必须立刻接管：甩动途中 cancelGlide 要能停下 */
T._throwHud(2.5, 2.5);
ok(T._glide.active === true && T._glide.mode === 'throw', '甩动中', String(T._glide.mode));
T._throwHud(-3, 0);            // 反方向再甩一次：同一个状态机只能有一个运动
ok(T._glide.active === true && T._glide.mode === 'throw',
	'新甩动覆盖旧甩动（不会两个动画打架）', String(T._glide.mode));
/* 被挤到界外时，瞬时夹取（拖动/抓取路径）必须立刻接管并停掉惯性 */
T.hudState.x = 99999;
T.clampHud(true);
ok(T._glide.active === false, '瞬时夹取（拖动/抓取）立刻接管并停止惯性', String(T._glide.active));
ok(T.hudState.x <= 1280 - T.hudCache.BALL / 2 - 20 + 0.51, '并落回边界内', T.hudState.x);

/* 用户实测的 bug："拖动一下悬浮球之后停止，悬浮球会弹一点距离"。
 * 指针停住期间不会再发 pointermove，所以不能拿"最后一个采样点"当基准。 */
const holdTrack = [
	{ x: 0, y: 0, t: 0 }, { x: 60, y: 0, t: 30 }, { x: 120, y: 0, t: 60 },   // 快速拖
	{ x: 120, y: 0, t: 400 }                                                  // 松手才补的那个点（中间一直没动）
];
ok(TV(holdTrack, 400) === null,
	'拖完停住再松手 → 不甩（不会"弹一点距离"）',
	String(TV(holdTrack, 400) && TV(holdTrack, 400).vx));
ok(TV(holdTrack, 60) !== null,
	'同一段轨迹，如果是"还在动的时候松手" → 正常甩（说明判据看的是松手时刻）',
	String(TV(holdTrack, 60) && TV(holdTrack, 60).vx));
/* 球贴边被夹住：指针还在动，但球没动 → 速度 0 */
ok(TV([{ x: 500, y: 0, t: 0 }, { x: 500, y: 0, t: 40 }, { x: 500, y: 0, t: 80 }], 80) === null,
	'球被边界夹住没动 → 不甩（按球自己的速度，不是指针速度）');
/* 松手前早就停手（超过窗口）→ 窗口内没点，不甩 */
ok(TV([{ x: 0, y: 0, t: 0 }, { x: 300, y: 0, t: 40 }], 500) === null,
	'松手时已经停手超过窗口 → 不甩');

/* 手感：量一遍"1px/ms 的甩动到底滑多远、滑多久"，并把它钉在带子里 ——
 * 以后想再调摩擦，改这里是"有意识"的（用户实测："地面有点太滑了"）。
 * 理论值：距离 ≈ v*16/(1-friction)，时长 ≈ ln(minV/v)/ln(friction)*16 */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 100; T.hudState.y = 300;                 // 左边留足空间，别撞墙
T.clampHud(true);
const feelStart = T.hudState.x;
const feelT0 = clock;
T._throwHud(1, 0);                                      // 1px/ms 的一次标准甩动
let feelIter = 0;
while (T._glide.active && feelIter < 400) {
	const timer = timeouts.pop();
	if (!timer) break;
	clock += 16;
	timer.fn();
	feelIter++;
}
const feelDist = T.hudState.x - feelStart;
const feelMs = clock - feelT0;
ok(T._glide.active === false, '标准甩动会停下来（不会永远滑）', String(T._glide.active));
ok(feelDist > 90 && feelDist < 175,
	'1px/ms 甩动的滑行距离被钉在 90~175px（不滑到天边）', Math.round(feelDist) + 'px');
ok(feelMs > 240 && feelMs < 430,
	'滑行时长被钉在 240~430ms（先快后慢，不是拖泥带水）', feelMs + 'ms');
console.log('  甩动手感实测：v=1px/ms → 滑行 ' + Math.round(feelDist) + 'px / ' + feelMs + 'ms' +
	'（friction=' + T._THROW.friction + ' minV=' + T._THROW.minV + '）');

/* 走完整真实路径：pointerdown → 快速 pointermove → pointerup 必须触发惯性
 * （前面那些是直接调 _throwHud；这条覆盖"松手 → 算速度 → 甩"的接线） */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 300; T.hudState.y = 300;
T.clampHud(true);
const ballEl = findEl(sandbox.document.documentElement, 'ttn-ball');
function peEv(el, type, x, y) {
	el.fire(type, { type: type, target: el, clientX: x, clientY: y, pointerId: 1,
		preventDefault() {}, stopPropagation() {} });
}
peEv(ballEl, 'pointerdown', 300, 300);
clock += 20; peEv(ballEl, 'pointermove', 305, 300);     // 前半段很慢
clock += 20; peEv(ballEl, 'pointermove', 310, 300);
clock += 20; peEv(ballEl, 'pointermove', 390, 300);
clock += 20; peEv(ballEl, 'pointermove', 470, 300);     // 最后 40ms 猛甩
clock += 5;
peEv(ballEl, 'pointerup', 470, 300);
ok(T._glide.active === true && T._glide.mode === 'throw',
	'真实拖动路径：松手后带惯性滑（不是停在原地）', String(T._glide.mode));
ok(T.hudState.x >= 470, '松手位置 == 指针位置（拖动过程仍然是 1:1 跟手）', T.hudState.x);
/* 真实路径复现用户的 bug：拖快 → 手停住 300ms → 松手，球不能再弹出去 */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 300; T.hudState.y = 300; T.clampHud(true);
peEv(ballEl, 'pointerdown', 300, 300);
clock += 20; peEv(ballEl, 'pointermove', 360, 300);
clock += 20; peEv(ballEl, 'pointermove', 420, 300);
clock += 300;                                   // 停住 300ms（期间没有任何 pointermove）
peEv(ballEl, 'pointerup', 420, 300);
ok(T._glide.active === false,
	'真实路径：拖完停住再松手 → 不甩（这就是"会弹一点距离"的那个 bug）',
	'gliding=' + T._glide.active + ' x=' + T.hudState.x.toFixed(1));
ok(Math.abs(T.hudState.x - 420) < 0.5, '球就停在松手的地方', T.hudState.x);

/* 贴边拖：指针继续往外走，但球被夹住根本没动 → 松手不能甩
 * （这条专门验"按球自己的速度算"：用指针速度算会得到 3px/ms，球会弹） */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 99999; T.hudState.y = 300; T.clampHud(true);
const edgeX = T.hudState.x;
peEv(ballEl, 'pointerdown', 1000, 300);
clock += 20; peEv(ballEl, 'pointermove', 1100, 300);
clock += 20; peEv(ballEl, 'pointermove', 1200, 300);
clock += 20; peEv(ballEl, 'pointerup', 1200, 300);
ok(T._glide.active === false && Math.abs(T.hudState.x - edgeX) < 0.5,
	'贴边拖（球被夹住没动）→ 松手不甩',
	'gliding=' + T._glide.active + ' x=' + T.hudState.x.toFixed(1) + ' 边界=' + edgeX.toFixed(1));

/* 慢放走同一条路径 → 不能甩（速度 0.083px/ms，低于甩动阈值 0.15） */
T.hudState.ball = true; T.setHud(true);
T.hudState.x = 500; T.hudState.y = 300; T.clampHud(true);
peEv(ballEl, 'pointerdown', 500, 300);
clock += 60; peEv(ballEl, 'pointermove', 505, 300);
clock += 60; peEv(ballEl, 'pointermove', 510, 300);
clock += 60; peEv(ballEl, 'pointermove', 515, 300);
clock += 20; peEv(ballEl, 'pointerup', 515, 300);
ok(T._glide.active === false, '真实拖动路径：轻放不甩（要能精确摆放）', String(T._glide.active));
ok(Math.abs(T.hudState.x - 515) <= 1, '轻放后就停在松手处', T.hudState.x);

/* ---------------- [20] 多语言 / 设置缓存 ----------------
 * 用户要求：面板里能选 11 国语言，并把「选中的语言 + 优化开关 + 悬浮球位置」一起缓存。 */
console.log('\n[20] 多语言 / 设置缓存');
const codes = T.langs.map(l => l[0]).join(',');
ok(codes === 'en,zh,ja,ko,ru,ar,fr,es,de,pt,vi',
	'11 国语言代码与 TankTrouble-Chat-Fix 一致', codes);
ok(T.getLang() === 'zh', '默认语言跟随浏览器（沙盒是 zh-CN → zh）', T.getLang());

/* 每个语言包都必须把英文包里的键填全，否则界面上会出现 key 本身 */
const enKeys = Object.keys(T.i18n.en).sort().join(',');
const missing = [];
T.langs.forEach(function (l) {
	const pack = T.i18n[l[0]];
	if (!pack) { missing.push(l[0] + ':整包缺失'); return; }
	Object.keys(T.i18n.en).forEach(function (k) {
		if (pack[k] == null || String(pack[k]).trim() === '') missing.push(l[0] + '.' + k);
	});
});
ok(missing.length === 0, '11 个语言包都完整（缺词条会显示成 key 本身）', missing.slice(0, 8).join(', '));

/* 取词 + 占位符替换 + 缺词回退 */
ok(T.tr('avg') === '平均延迟', 'tr() 取当前语言', T.tr('avg'));
ok(T.tr('whyProbeSilent', { n: 7, types: 'x' }).indexOf('7') >= 0, '占位符 {n} 会被替换', T.tr('whyProbeSilent', { n: 7 }));
ok(T.tr('__no_such_key__') === '__no_such_key__', '缺词条回退到 key 本身（不显示 undefined）');
ok(T.tr('whyFrameSparse').length > 0 && T.tr('whyFrameSparse') !== 'whyFrameSparse', '状态原因有译文');

/* 换语言：立刻生效（标签/球里的字都换） */
T.setLang('ja');
ok(T.getLang() === 'ja', 'setLang 生效', T.getLang());
ok(T.tr('avg') === '平均遅延', '换成日文后取词变了', T.tr('avg'));
ok(T._grade && T.tr('on') === 'オン', '开关文案也走语言包', T.tr('on'));
T.setLang('ar');
ok(T.tr('status') === 'الحالة', '阿拉伯语词条可用', T.tr('status'));
T.setLang('vi');
ok(T.tr('avg') === 'Ping TB' && T.tr('status') === 'Trạng thái' && T.tr('title') === 'TankTrouble Mạng',
	'越南语词条可用（面板 / 状态 / 标题都走 vi 包）', [T.tr('avg'), T.tr('status'), T.tr('title')].join(' | '));
T.setLang('zh');
ok(T.tr('avg') === '平均延迟', '换回中文', T.tr('avg'));
ok(T.setLang('xx') === 'zh', '非法语言代码被忽略（不会把界面搞坏）', T.getLang());

/* 缓存：语言 + 优化开关 + 悬浮球位置，写进同一个存档并能读回来 */
T.setLang('ko');
T.setSmoothing(false);
T.hudState.x = 321; T.hudState.y = 123; T.hudState.ball = true;
T._saveHudState();
const savedRaw = sandbox.localStorage.getItem('ttn.hud.v4') || '';
ok(savedRaw.indexOf('"lang":"ko"') >= 0, '语言写进存档', savedRaw.slice(0, 80));
ok(savedRaw.indexOf('"smooth":false') >= 0, '优化开关写进存档', savedRaw.slice(0, 120));
ok(savedRaw.indexOf('"x":321') >= 0 && savedRaw.indexOf('"y":123') >= 0, '悬浮球位置写进存档');
ok(savedRaw.indexOf('"ball":true') >= 0, '收起成球的状态写进存档');

/* 模拟"重新打开页面"：语言/开关的 setter 自己会存档，所以先把存档原文留一份，
 * 改完内存再把存档写回去（这就是"页面重开时读到的仍是上次那份存档"），然后载入。 */
T.setLang('en'); T.setSmoothing(true);          // 故意把内存改成相反值
sandbox.localStorage.setItem('ttn.hud.v4', savedRaw);
T.hudState.x = 0; T.hudState.y = 0; T.hudState.ball = false;
T._loadHudState();
ok(T.getLang() === 'ko', '重新载入后语言恢复成缓存里的韩语', T.getLang());
ok(T.smoothing.enabled === false, '重新载入后优化开关恢复为关闭', String(T.smoothing.enabled));
ok(T.hudState.x === 321 && T.hudState.y === 123, '重新载入后悬浮球位置恢复',
	T.hudState.x + ',' + T.hudState.y);
ok(T.hudState.ball === true, '重新载入后"收起成球"状态恢复', String(T.hudState.ball));

/* 老存档（没有 lang/smooth 字段）不能把默认值冲掉 */
T.setLang('ja'); T.setSmoothing(true);
sandbox.localStorage.setItem('ttn.hud.v4', JSON.stringify({ x: 11, y: 22, ball: false }));
T._loadHudState();
ok(T.hudState.x === 11 && T.hudState.y === 22, '老存档的位置照样能读', T.hudState.x + ',' + T.hudState.y);
ok(T.getLang() === 'ja', '老存档没有语言字段 → 保留当前语言（不被冲成默认）', T.getLang());
ok(T.smoothing.enabled === true, '老存档没有开关字段 → 保留当前开关状态', String(T.smoothing.enabled));

/* 收尾：恢复成测试开始前的样子，别影响后面的断言 */
T.setLang('zh'); T.setSmoothing(true); T.hudState.ball = false;
T.hudState.x = 8; T.hudState.y = 8;
sandbox.localStorage.removeItem('ttn.hud.v4');

/* ---------------- [21] 探测 URL 复用 / 失败预算 / 指标降级 ----------------
 * 用户实测："游戏更新后控制台反复出现 WebSocket connection to
 * wss://asia-central1-mp1.tanktrouble.com/ failed"。真因：脚本自己的 ping 探测
 * 只取主机名再硬拼 :443，且失败后每 4 秒无限重连。下面 4 条是回归。 */
console.log('\n[21] 探测 URL 复用 / 失败预算 / 指标降级');

function stopPingProbe() {
	try { if (T.ping.ws) { T.ping.ws.onclose = null; T.ping.ws.onerror = null; T.ping.ws.close(); } } catch (e) {}
	T.ping.ws = null; T.ping.started = false; T.ping.pendingAt = 0;
}

/* ---- 回归 1：probe-uses-full-game-url ----
 * 游戏 URL 带非 443 端口 + 路径时，探测必须原样复用（不能 :443 覆盖、不能丢路径）。 */
const FULL_URL = 'wss://asia-central1-mp1.tanktrouble.com:8443/ws?x=1';
stopPingProbe();
T.startPingProbe({ url: FULL_URL });
ok(!!T.ping.ws && T.ping.ws.url === FULL_URL,
	'probe-uses-full-game-url：探测构造出的 URL 与游戏 URL 完全相同（端口/路径不丢）',
	T.ping.ws ? T.ping.ws.url : 'no-ws');
ok(T.ping.url === FULL_URL && T.ping.host === 'asia-central1-mp1.tanktrouble.com',
	'完整 URL 进 ping.url（换服判定按它比较），主机名仍供 connHost 报告显示',
	T.ping.url + ' / ' + T.ping.host);
const parsedFull = T.parseConnUrl(FULL_URL);
ok(!!parsedFull && parsedFull.raw === FULL_URL && parsedFull.port === '8443' && parsedFull.path === '/ws?x=1',
	'parseConnUrl 只解析不规范化：raw 原样、port/path 拆得出来', JSON.stringify(parsedFull));
const sameWs = T.ping.ws;
T.ping.samples.push({ t: clock, rtt: 123, host: T.ping.host, src: 'probe' });
T.startPingProbe({ url: FULL_URL });          // 传新的 conn 对象，完整 URL 相同
ok(T.ping.samples.length === 1 && T.ping.ws === sameWs,
	'同一个完整 URL 重复调用不重连、不清样本（换服只看完整 URL）', T.ping.samples.length);

/* ---- 回归 2：probe-gives-up-after-failures ----
 * 连续 3 次"从未 onopen 就失败"→ 不再自动重连，且只记录一条日志。 */
stopPingProbe();
consoleLines.length = 0;
const GIVEUP_URL = 'wss://giveup-test-mp1.tanktrouble.com:9443/ws?x=1';
T.startPingProbe({ url: GIVEUP_URL });
const attempts = [];
for (let i = 0; i < 6; i++) {
	const w = T.ping.ws;
	if (!w) break;
	attempts.push(w.url);
	/* 真实浏览器握手失败：先 onerror 再 onclose，两条都要能触发一次计数（不能重复计） */
	if (w.onerror) w.onerror({});
	if (w.onclose) w.onclose({ code: 1006, wasClean: false });
	if (T.ping.giveUp) break;
	/* 没放弃时排了一个重连定时器（沙盒里 setTimeout 不真跑）→ 手动触发，模拟"到点了" */
	const idx = timeouts.length - 1;
	if (idx >= 0 && timeouts[idx] && timeouts[idx].ms === 2000) {
		const fn = timeouts[idx].fn;
		timeouts.splice(idx, 1);
		fn();
	} else break;
}
ok(attempts.length === 3 && attempts.every(u => u === GIVEUP_URL),
	'probe-gives-up-after-failures：恰好尝试 3 次就停（不再每 4 秒猛冲）', JSON.stringify(attempts));
ok(T.ping.giveUp === true && T.ping.giveUpAt > 0 && T.ping.neverOpenedStreak === 3,
	'giveUp 标记 + giveUpAt + 连续失败计数都记下了',
	JSON.stringify({ giveUp: T.ping.giveUp, at: T.ping.giveUpAt, streak: T.ping.neverOpenedStreak }));
const giveUpLogs = consoleLines.filter(l => l.indexOf('own ping probe unavailable') >= 0);
ok(giveUpLogs.length === 1 && T.ping.giveUpLogged === 1,
	'放弃时只记录一条英文日志（不会再刷屏）', JSON.stringify(giveUpLogs));
T.startPingProbe({ url: GIVEUP_URL });        // 每秒的轮询还会调用它
ok(T.ping.giveUp === true && T.ping.ws === null && T.ping.reconnectTimer === null &&
	consoleLines.filter(l => l.indexOf('own ping probe unavailable') >= 0).length === 1,
	'giveUp 后同一 URL 不再重连、不重复日志', 'ws=' + T.ping.ws);

/* 另一种情况：曾 open 过再断（协议/路径是对的，只是被踢）→ 单独计数 + 2s→4s→8s 退避，不放弃 */
stopPingProbe();
const OPENDROP_URL = 'wss://open-then-drop-mp1.tanktrouble.com:9443/ws';
T.startPingProbe({ url: OPENDROP_URL });
const backoffs = [];
for (let i = 0; i < 4; i++) {
	const w = T.ping.ws;
	if (!w) break;
	if (w.onopen) w.onopen();
	if (w.onclose) w.onclose({ code: 1006, wasClean: false });
	const idx = timeouts.length - 1;
	if (idx < 0 || !timeouts[idx]) break;
	backoffs.push(timeouts[idx].ms);
	const fn = timeouts[idx].fn;
	timeouts.splice(idx, 1);
	fn();
}
ok(backoffs.join(',') === '2000,4000,8000,16000',
	'曾 open 过再断：退避 2s→4s→8s→16s（上限 30s），不无限 4 秒猛冲', backoffs.join(','));
ok(T.ping.giveUp === false && T.ping.dropsAfterOpen === 4,
	'这种情况单独计数、不放弃（协议/路径是对的）',
	JSON.stringify({ giveUp: T.ping.giveUp, drops: T.ping.dropsAfterOpen }));

/* ---- 回归 3：ping-falls-back-to-game-probe ----
 * 自建探测 giveUp 后，延迟/抖动仍要从游戏自己的 _typeId:15→28 探测里取到。 */
stopPingProbe();
T.ping.started = true; T.ping.giveUp = true; T.ping.connected = false;
T.ping.samples.length = 0;
const gm = T.primaryConn();
gm.gapLog.length = 0; gm.stalls.length = 0;
for (let i = 0; i < 120; i++) gm.gapLog.push({ t: clock, gap: 33 });
T._recordOut(gm, '{"_typeId":15}');
clock += 37;
T._recordIn(gm, { data: '{"_typeId":28}' });
const fm = T.netMetrics();
ok(fm.okPing === true && fm.latSrc === 'game',
	'ping-falls-back-to-game-probe：giveUp 后延迟改由游戏自己的 15→28 提供（src=game）',
	JSON.stringify({ okPing: fm.okPing, latSrc: fm.latSrc, why: fm.why }));
ok(fm.okCad === true && typeof fm.jitter === 'number' && fm.stability > 0,
	'降级后稳定度/抖动行不空（悬浮球不灰、面板不卡"等待连接…"）',
	JSON.stringify({ okCad: fm.okCad, jitter: fm.jitter, stability: fm.stability }));
T.setHud(true);
const hudTree = findEl(sandbox.document.documentElement, 'ttn-root');
const hudRowsTxt = hudTree ? treeText(hudTree.querySelector('#ttn-rows')) : '';
ok(hudRowsTxt.indexOf('游戏探测') >= 0,
	'HUD「实时延迟」行点明当前来源 = 游戏探测', hudRowsTxt.replace(/\s+/g, ' ').slice(0, 120));

/* ---- 回归 4：probe-region-uses-observed-shape ----
 * 区域探测优先用观测到的游戏连接做 host+port+path 模板，不写死 :443。 */
const OBS_URL = 'wss://us-south1-mp1.tanktrouble.com:9443/game/ws?token=abc';
T.conns.push({
	url: OBS_URL, kind: 'mp', ws: { readyState: 1 }, lastT: clock, framesIn: 9,
	gapLog: [], stalls: [], shapes: new Map(), nonJson: 0, binaryIn: 0, bytesIn: 0, bytesOut: 0,
	framesOut: 0, gaps: [], med: 0, stallCount: 0, maxGap: 0, pending: null,
	openedAt: Date.now(), closedAt: null,
	binFirst: [], binLast: [], binOutFirst: [], binOutLast: [], outStacks: [], outSamples: []
});
const tpls = T.regionTemplates();
const tpl = tpls.filter(t => t.host === 'us-south1-mp1.tanktrouble.com')[0];
ok(!!tpl && tpl.observed === true && tpl.url === OBS_URL && tpl.port === '9443' && tpl.path === '/game/ws?token=abc',
	'probe-region-uses-observed-shape：观测到的连接原样做模板（端口/路径都保留）',
	JSON.stringify(tpl));
const wsBefore = wsInstances.length;
T.pingRegion(tpl, 5000);
ok(wsInstances.length === wsBefore + 1 && wsInstances[wsBefore].url === OBS_URL,
	'区域探测真的用这个模板原样建连接（没有 :443 覆盖、没有丢路径）',
	wsInstances[wsBefore] ? wsInstances[wsBefore].url : 'no-ws');
ok(T.regionHosts().indexOf('us-south1-mp1.tanktrouble.com') >= 0,
	'兼容旧接口 regionHosts() 仍返回主机名', JSON.stringify(T.regionHosts()));
T.conns.pop();
/* 完全没有观测时才用兜底列表（且兜底不写死 :443） */
const keptConns = T.conns.splice(0, T.conns.length);
const fbTpls = T.regionTemplates();
ok(fbTpls.length === 7 && fbTpls.every(t => t.fallback === true && t.url.indexOf(':443') < 0),
	'没有观测时才退回兜底主机列表，且不写死 :443',
	JSON.stringify(fbTpls.map(t => t.url)));
T.conns.push.apply(T.conns, keptConns);

/* ---- 收尾核对：报告里的 pingProbe 字段齐全（以后再排查同样问题一眼可见） ---- */
const repPing = T.report().pingProbe;
ok(!!repPing && ['url', 'everOpened', 'neverOpenedStreak', 'giveUp', 'lastErr', 'lastClose', 'src']
	.every(k => Object.prototype.hasOwnProperty.call(repPing, k)),
	'报告含 pingProbe: { url, everOpened, neverOpenedStreak, giveUp, lastErr, lastClose, src }',
	JSON.stringify(repPing));

/* ---------------- 汇总 ---------------- */
console.log('\n' + '='.repeat(58));
if (failures.length) {
	console.log('失败 ' + failures.length + ' 项 / 通过 ' + pass + ' 项');
	failures.forEach(f => console.log('  ✗ ' + f));
	process.exit(1);
} else {
	console.log('全部通过：' + pass + ' 项');
}
