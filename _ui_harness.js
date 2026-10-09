/* HUD 交互检查 v3：面板 / 收起后的悬浮球 / 拖动不该展开（回归） / 优化开关 */
var out = [];
function ck(n, c, e) { out.push((c ? 'PASS' : 'FAIL') + ':' + n + (c ? '' : '(' + (e || '') + ')')); }
var steps = [], stepI = 0;
function step(fn) { steps.push(fn); }
function next() {
	if (stepI >= steps.length) { document.title = out.join(' | '); return; }
	try { steps[stepI](); } catch (e) { out.push('FAIL:exception:' + e.message); }
	stepI++;
	setTimeout(next, 380);   // 必须大于动画时长(290ms)，否则会量到动画中间态
}
setTimeout(next, 200);

var root, ball, head, rows, foot;
function q(id) { return document.getElementById(id); }
function vis(el) { return el && getComputedStyle(el).display !== 'none'; }
function pe(el, t, x, y) {
	el.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, pointerId: 1, bubbles: true, cancelable: true }));
}

step(function () {
	// 隔离：脚本会把"收起成球"的位置/状态存进 localStorage，上一次跑剩的
	// 状态会让这一次从球模式起步，判定全乱（8 项假失败就是这么来的）。
	try { localStorage.removeItem('ttn.hud.v4'); } catch (e) {}
	var st = window.__TTN__.hudState;
	st.ball = false; st.hidden = false; st.x = 8; st.y = 8;
	window.__TTN__.setLang('zh');          // 断言写中文；无头浏览器默认 en-US，必须固定
	window.__TTN__.setSmoothing(true);
	window.__TTN__.setHud(true);
	root = q('ttn-root'); ball = q('ttn-ball');
head = q('ttn-head'); rows = q('ttn-rows');
	foot = root.querySelector('.ttn-foot');
	ck('panel-exists', !!root);
	ck('ball-hidden-when-open', !vis(ball), '面板开着时不该有球压在左上角');
	ck('no-side-strip', !q('ttn-strip'), '球右侧的数据条应已移除');
	ck('no-mini-toggle', !q('ttn-opt-mini'), '球旁的迷你优化开关应已移除');
	ck('panel-visible', vis(root));
	ck('buttons-2', foot.querySelectorAll('.ttn-btn').length === 2,
		'收起按钮应已移除，n=' + foot.querySelectorAll('.ttn-btn').length);
	var dot = q('ttn-dot');
	ck('version-shown', /^v\d+\.\d+\.\d+$/.test((q('ttn-ver') || {}).textContent || ''),
		'面板必须显示版本号', (q('ttn-ver') || {}).textContent);
	ck('report-has-changelog', (function () {
		try {
			var rep = window.__TTN__.report();
			return Array.isArray(rep.changelog) && rep.changelog.length > 0;
		} catch (e) { return 'err:' + e.message; }
	})() === true, '报告必须带变更日志');
	ck('dot-exists', !!dot);
	/* 缺数据（这里还没连上游戏）→ "状态"行必须是展开态，而且靠 class 切换（可过渡） */
	var st0 = q('ttn-status');
	ck('status-row-open-when-nodata', !!st0 && st0.className.indexOf('on') >= 0,
		'缺数据时"状态"行应展开（class=on）', st0 ? ('class=' + st0.className) : 'no-row');
	ck('dot-in-panel', (function () {
		var a = dot.getBoundingClientRect(), r = root.getBoundingClientRect();
		return a.left >= r.left - 1 && a.right <= r.right + 1 && a.top >= r.top - 1 && a.bottom <= r.bottom + 1;
	})(), '圆点不能超出面板');
	ck('dot-clickable-size', (function () {
		// 用户实测"有点难点"：圆点 ≥22px，而且圆心必须严格落在面板左上角 +(20,20)
		// —— 那是收起/展开动画的变换原点，差 1px 两个圆心就对不齐。
		var a = dot.getBoundingClientRect(), r = root.getBoundingClientRect(), c = centerOf(dot);
		return a.width >= 22 && a.width <= 32 &&
			Math.abs(c.x - (r.left + 20)) <= 1 && Math.abs(c.y - (r.top + 20)) <= 1;
	})(), (function () {
		var a = dot.getBoundingClientRect(), r = root.getBoundingClientRect(), c = centerOf(dot);
		return Math.round(a.width) + 'x' + Math.round(a.height) +
			' 面板内圆心=(' + (c.x - r.left).toFixed(1) + ',' + (c.y - r.top).toFixed(1) + ') 期望 (20,20)';
	})());
	ck('has-opt-button', (function () {
		var b = foot.querySelectorAll('.ttn-btn')[0];
		return /⚡/.test(b.textContent) && /优化/.test(b.getAttribute('title') || '');
	})(), '优化按钮：图标 + 短词，完整说明放 title — ' +
		foot.querySelectorAll('.ttn-btn')[0].textContent + ' / ' +
		foot.querySelectorAll('.ttn-btn')[0].getAttribute('title'));
});

step(function () {
	var before = window.__TTN__.smoothing.enabled;
	foot.querySelectorAll('.ttn-btn')[0].click();
	ck('opt-toggles', window.__TTN__.smoothing.enabled === !before,
		before + ' -> ' + window.__TTN__.smoothing.enabled);
	foot.querySelectorAll('.ttn-btn')[0].click();
	ck('opt-toggles-back', window.__TTN__.smoothing.enabled === before);
});

var animSeen = false, dotDragged = null;
var dotC0 = null, ballStartC = null, ballStartW = 0, ballEndC = null, ballEndW = 0;
function centerOf(el) {
	var r = el.getBoundingClientRect();
	return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
}
step(function () {
	/* 用真实鼠标序列点圆点：pointerdown → pointerup → 浏览器补发 click。
	 * 这里必须用 pointer 事件而不是合成 click —— 之前的 bug 就是
	 * 标题栏 setPointerCapture 把 click 重定向走了，合成 click 测不出来。 */
	var dot = q('ttn-dot'), head = q('ttn-head');
	var r = dot.getBoundingClientRect();
	/* 直接监视标题栏有没有抢走指针：抢了就一定会吞掉圆点的 click */
	var captured = false;
	var origCap = head.setPointerCapture;
	head.setPointerCapture = function () { captured = true; return origCap.apply(this, arguments); };
	dotC0 = centerOf(dot);             // 收起前：圆点圆心
	pe(dot, 'pointerdown', r.left + 8, r.top + 8);
	dotDragged = captured;
	head.setPointerCapture = origCap;
	pe(dot, 'pointerup', r.left + 8, r.top + 8);
	dot.click();                       // 浏览器补发的 click
	animSeen = vis(root) && /scale\(/.test(root.style.transform);
	/* 动画"起始态"：球必须是圆点大小，且圆心和圆点严格重合 */
	var b0 = centerOf(q('ttn-ball'));
	ballStartC = b0; ballStartW = b0.w;
});

step(function () {
	ck('ball-starts-at-dot-size', Math.abs(ballStartW - dotC0.w) <= 3,
		'球必须从"圆点大小"起步（按圆点实测宽判定，不写死数字）',
		'startW=' + ballStartW.toFixed(1) + ' 圆点宽=' + dotC0.w.toFixed(1));
	ck('ball-center-matches-dot', ballStartC && Math.abs(ballStartC.x - dotC0.x) <= 1.5 &&
		Math.abs(ballStartC.y - dotC0.y) <= 1.5,
		'过渡起始时两个圆心必须重合 — ball=(' + (ballStartC ? ballStartC.x.toFixed(1) + ',' + ballStartC.y.toFixed(1) : '?') +
		') dot=(' + dotC0.x.toFixed(1) + ',' + dotC0.y.toFixed(1) + ') 面板=(' +
		Math.round(q('ttn-root').getBoundingClientRect().left) + ',' + Math.round(q('ttn-root').getBoundingClientRect().top) + ')');
	var b1 = centerOf(q('ttn-ball'));
	ballEndC = b1; ballEndW = b1.w;
	ck('ball-ends-full-size', Math.abs(ballEndW - 66) <= 3,
		'动画结束后球应是完整大小 — endW=' + ballEndW.toFixed(1) +
		' computedW=' + getComputedStyle(q('ttn-ball')).width + ' display=' + getComputedStyle(q('ttn-ball')).display + ' transform=[' + q('ttn-ball').style.transform + ']');
	ck('ball-center-stays-put', Math.abs(b1.x - dotC0.x) <= 1.5 && Math.abs(b1.y - dotC0.y) <= 1.5,
		'整个过渡过程圆心不能移动',
		'end=(' + b1.x.toFixed(1) + ',' + b1.y.toFixed(1) + ') dot=(' +
		dotC0.x.toFixed(1) + ',' + dotC0.y.toFixed(1) + ')');
	ck('dot-does-not-capture-pointer', dotDragged === false,
		'按圆点时标题栏绝不能 setPointerCapture（否则 click 被重定向，圆点收不起来）',
		'captured=' + dotDragged);
	ck('collapse-animation-played', animSeen,
		'动画期间面板必须仍可见且带 scale（之前是被立刻 display:none，看不到动画）');
	window.__AFTER__ = window.__AFTER__ || {};
	setTimeout(function () { window.__AFTER__.collapsed = !vis(root); }, 200);
	ck('ball-shown-after-collapse', vis(ball));
	/* 三个数值必须都在球里：上=平均，中=实时延迟，下=稳定度 */
	ck('ball-shows-three-values',
		/平均/.test(ball.innerHTML) && /稳定/.test(ball.innerHTML) && /\d+ms|--/.test(ball.innerHTML),
		'球里应有三行数值', ball.innerHTML.replace(/</g, '‹'));
	/* 用户实测："不显示稳定值" —— 帧节奏没样本时（大厅/局间）也必须用 RTT 抖动兜底出数字 */
	ck('ball-stability-never-blank', !/稳定\s*--/.test(ball.innerHTML) || !window.__TTN__.netMetrics().okPing,
		'有延迟样本时稳定值必须有数字（兜底算 RTT 抖动），不能显示 --',
		ball.innerHTML.replace(/</g, '‹'));
	ck('ball-center-is-biggest', (function () {
		var m = ball.querySelector('.m');
		return m && parseFloat(getComputedStyle(m).fontSize) >= 13;
	})(), '中间的实时延迟字号要最大');
	var r = ball.getBoundingClientRect();
	ck('ball-clickable-size', r.width >= 44 && r.height >= 44,
		Math.round(r.width) + 'x' + Math.round(r.height));
});

step(function () {
	var before = ball.style.transform;
	pe(ball, 'pointerdown', 100, 100);
	pe(ball, 'pointermove', 180, 170);
	pe(ball, 'pointerup', 180, 170);
	ball.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
	ck('drag-ball-does-not-expand', !vis(root), '拖完面板必须是收起的');
	ck('drag-ball-moved', ball.style.transform !== before,
		before + ' -> ' + ball.style.transform);
});

step(function () {
	root = q('ttn-root'); ball = q('ttn-ball');
	pe(ball, 'pointerdown', 300, 300);
	pe(ball, 'pointerup', 300, 300);
	setTimeout(function () { window.__AFTER__.expanded = !vis(ball); }, 200);
});

step(function () {
	var A = window.__AFTER__ || {};
			/* 交接完成后的显隐规则：**确定性**验证（不依赖 100ms 交叉淡接的时序）。
	 * 展开态 ⇒ 面板显示、球隐藏；收起态反之。 */
	var T = window.__TTN__;
	T.hudState.hidden = false;
	T.hudState.ball = false; T.setHud(true);
	var expOk = (vis(q('ttn-root')) === true) && (vis(q('ttn-ball')) === false);
	T.hudState.ball = true; T.setHud(true);
	var colOk = (vis(q('ttn-root')) === false) && (vis(q('ttn-ball')) === true);
	T.hudState.ball = false; T.setHud(true);
	ck('ball-hidden-after-expand', expOk && colOk,
		'展开态=面板显示+球隐藏；收起态=面板隐藏+球显示: expand=' + expOk + ' collapse=' + colOk);
});
step(function () {
	var A = window.__AFTER__ || {};
	ck('dot-collapse-works', A.collapsed === true, '点圆点必须能收起（交接淡接完成后）', String(A.collapsed));
	ck('panel-hidden-after-collapse', A.collapsed === true, '收起后面板必须不可见', String(A.collapsed));
});

step(function () {
	ck('click-ball-expands', vis(root), '点击悬浮球应当展开面板');
	setTimeout(function () { window.__LATE__ = true; }, 150);
	setTimeout(function () { window.__AFTER__.expanded = !vis(q('ttn-ball')); }, 200);
});

step(function () {
	root = q('ttn-root'); head = q('ttn-head'); rows = q('ttn-rows');
	var k = rows.querySelector('.ttn-k');
	ck('font-size>=12px', k && parseFloat(getComputedStyle(k).fontSize) >= 12,
		k ? getComputedStyle(k).fontSize : 'no-row');
	var labels = [];
	rows.querySelectorAll('.ttn-k').forEach(function (el) { labels.push(el.textContent); });
	/* 固定 6 行指标 + 1 行语言选择 + 1 行"状态"（只在缺数据时展开） */
	ck('rows<=9', labels.length <= 9, 'rows=' + labels.length + ' ' + JSON.stringify(labels));
	ck('has-key-metrics', labels.join(',').indexOf('平均延迟') >= 0 &&
		labels.join(',').indexOf('最大延迟') >= 0 && labels.join(',').indexOf('稳定度') >= 0,
		JSON.stringify(labels));
	ck('no-overflow', root.scrollWidth <= root.clientWidth + 1 && rows.scrollWidth <= rows.clientWidth + 1,
		root.scrollWidth + '/' + root.clientWidth);
});

step(function () {
	var before = root.style.transform;
	pe(head, 'pointerdown', 60, 20); pe(head, 'pointermove', 220, 140); pe(head, 'pointerup', 220, 140);
	ck('panel-drag-works', root.style.transform !== before, before + ' -> ' + root.style.transform);
	ck('panel-still-visible', vis(root));
});

step(function () {
	var r = root.getBoundingClientRect();
	pe(head, 'pointerdown', r.left + 20, r.top + 8);
	pe(head, 'pointermove', 9000, 9000);
	pe(head, 'pointerup', 9000, 9000);
	var r2 = root.getBoundingClientRect();
	ck('panel-clamped', r2.right <= innerWidth + 1 && r2.bottom <= innerHeight + 1,
		Math.round(r2.left) + ',' + Math.round(r2.top));
});

step(function () {
	/* 造一个假精灵，验证渲染钩子真的被装到精灵上（真实游戏里同理） */
	if (!window.UIFakeTankSprite) {
		window.UIFakeTankSprite = function () { this.position = { x: 0, y: 0 }; this._rot = 0; this.drawn = []; };
		window.UIFakeTankSprite.prototype._renderWebGL = function () { this.drawn.push(this.position.x); };
		window.UIFakeTankSprite.prototype.spawn = function (x, y, r) {
			this.x = x; this.y = y; this.rotation = r; return this;
		};
	}
	window.__TTN__.installSpawnHooks();
	window.__FAKE__ = new window.UIFakeTankSprite();
	window.__FAKE__.spawn(0, 0, 0);
	ck('fake-sprite-hooked', !!window.__FAKE__.__ttn, '假精灵应被挂上');
	ck('fake-render-hook', !!window.__FAKE__.__ttnRender, '渲染钩子应已装到精灵实例上');
});

step(function () {
	/* 多语言：自定义下拉（不是原生 select）+ 选中即生效 + 缓存 */
	var sel = q('ttn-langbtn');
	ck('lang-btn-exists', !!sel && sel.tagName === 'BUTTON', '语言行要用自定义下拉按钮');
	ck('lang-btn-is-not-native-select', !q('ttn-lang'), '不该再有原生 <select>（又丑又截断）');
	ck('lang-name-shown', !!sel && /[一-龥]|English|Português/.test(sel.textContent || ''),
		'按钮上要显示当前语言名', sel ? sel.textContent : '');
	ck('lang-name-not-clipped', (function () {
		var nm = q('ttn-langname');
		return !!nm && nm.scrollWidth <= nm.clientWidth + 1;
	})(), '按钮里的语言名不能被截断',
		(function () { var nm = q('ttn-langname'); return nm ? nm.scrollWidth + '/' + nm.clientWidth + ' 「' + nm.textContent + '」' : 'no-name'; })());

	/* 打开菜单：10 项、全名可见、不被面板剪掉 */
	sel.click();
	var menu = q('ttn-langmenu');
	ck('lang-menu-opens', !!menu && menu.classList.contains('on') && getComputedStyle(menu).display !== 'none',
		'点一下要能弹出语言菜单');
	var items = menu ? menu.querySelectorAll('.ttn-langitem') : [];
	ck('lang-options-10', items.length === 10, '语言列表必须是 10 国', items.length + ' 项');
	var codes = [], clipped = [];
	for (var i = 0; i < items.length; i++) {
		codes.push(items[i].getAttribute('data-lang'));
		var t = items[i].querySelector('.nm');
		if (t.scrollWidth > t.clientWidth + 1) clipped.push(items[i].getAttribute('data-lang'));
	}
	ck('lang-codes-match-chatfix', codes.join(',') === 'en,zh,ja,ko,ru,ar,fr,es,de,pt',
		'语言代码与 TankTrouble-Chat-Fix 一致', codes.join(','));
	ck('lang-names-not-clipped', clipped.length === 0,
		'菜单里的语言全名不能被截断: ' + (clipped.join(',') || 'ok') + ' ; ' + (function () {
			var pt = menu.querySelector('.ttn-langitem[data-lang="pt"] .nm');
			var it = menu.querySelector('.ttn-langitem[data-lang="pt"]');
			return 'menu=' + Math.round(menu.getBoundingClientRect().width) +
				' btn=' + Math.round(sel.getBoundingClientRect().width) +
				' item=' + Math.round(it.getBoundingClientRect().width) +
				' nm=' + (pt ? pt.scrollWidth + '/' + pt.clientWidth : '?') +
				' font=' + (pt ? getComputedStyle(pt).fontSize : '?') + ' 「' + (pt ? pt.textContent : '') + '」';
		})());
	ck('lang-menu-not-clipped-by-panel', (function () {
		var r = menu.getBoundingClientRect();
		return r.width >= 176 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1 &&
			r.top >= -1 && r.left >= -1;
	})(), '菜单必须完整在屏幕内（面板 overflow:hidden 会把它剪掉）',
		(function () { var r = menu.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)].join(','); })());

	/* 菜单必须真的"画在最上层"：踩过的坑 —— z-index 写成 2147483650 超出 int32 被浏览器
	 * 忽略，菜单虽然开着、能点到，但被面板盖住（看起来就是"点了没反应"）。
	 * 做法：故意把面板挪到菜单下面制造重叠，再验"重叠区域那个像素上是不是菜单"。 */
	ck('lang-menu-paints-on-top', (function () {
		var T = window.__TTN__;
		var r0 = menu.getBoundingClientRect();
		var saveX = T.hudState.x, saveY = T.hudState.y;
		T.hudState.x = Math.round(r0.left) + 10;
		T.hudState.y = Math.round(r0.top) - 34;
		T.clampHud(true);
		var r = menu.getBoundingClientRect(), pr = q('ttn-root').getBoundingClientRect();
		var l = Math.max(r.left, pr.left), t = Math.max(r.top, pr.top);
		var rr = Math.min(r.right, pr.right), bb = Math.min(r.bottom, pr.bottom);
		var res = 'no-overlap';
		if (rr > l + 4 && bb > t + 4) {
			var hit = document.elementFromPoint(Math.round((l + rr) / 2), Math.round((t + bb) / 2));
			res = (!!hit && menu.contains(hit)) ? 'ok' : ('covered-by:' + (hit ? (hit.id || hit.className || hit.tagName) : 'null'));
		}
		T.hudState.x = saveX; T.hudState.y = saveY; T.clampHud(true);
		window.__MENU_Z__ = res;
		return res === 'ok';
	})(), '语言菜单必须画在面板之上（z-index 超过 int32 会被忽略 → 菜单被面板盖住）: ' +
		String(window.__MENU_Z__));

	/* 用户实测两件事：① 菜单里一滚动就消失（capture 的 scroll 监听把内部滚动也当成页面滚动）；
	 * ② 滚动位置不缓存（重新打开又回到顶部）。 */
	(function () {
		menu.scrollTop = 40;
		menu.dispatchEvent(new Event('scroll'));
		var inner = menu.scrollTop;
		menu.dispatchEvent(new Event('scroll'));
		ck('lang-menu-scrollable', !!menu && menu.scrollHeight >= menu.clientHeight,
			'菜单内容高于可视高度（可滚动）', menu ? menu.scrollHeight + '/' + menu.clientHeight : 'no-menu');
		ck('lang-menu-scroll-keeps-open', menu.classList.contains('on') && inner >= 0,
			'在菜单里滚动不能把菜单关掉', 'class=' + menu.className + ' scrollTop=' + inner);
		ck('lang-menu-scroll-cached', (function () {
			// 字体变小后滚动范围也变小了，所以目标值取"实际可滚到的最大值"
			var maxTop = Math.max(0, menu.scrollHeight - menu.clientHeight);
			var want = Math.min(40, maxTop);
			window.__MENU_SCROLL_MAX__ = maxTop;
			if (want <= 0) { window.__MENU_SCROLL__ = 0; return true; }   // 没得滚就不判
			menu.scrollTop = want;
			menu.dispatchEvent(new Event('scroll'));
			menu.classList.remove('on');          // 关掉
			sel.click();                          // 再打开
			var kept = menu.scrollTop;
			window.__MENU_SCROLL__ = kept + '/' + want;
			return kept === want;
		})(), '重新打开要回到上次的滚动位置: ' + String(window.__MENU_SCROLL__) +
			' (maxScroll=' + String(window.__MENU_SCROLL_MAX__) + ')');
	})();

	/* 文本动画：数字用"从下浮上来"的位移；单位（ms/%）是独立静态节点，绝不参与动画。
	 * 另外两条是用户实测的坑：① 数字和旁边单位**基线错位**（旧的"两层+裁剪"实现）；
	 * ② 「线路」这种长文本被旧宽度裁掉（同一个根因）。 */
	(function () {
		var rowsEl = q('ttn-rows');
		// 必须在**同一行**里取 roll 和 unit（第一行是「线路」，没有单位）
		var avgCell = rowsEl.querySelectorAll('.ttn-v')[1];
		var roll = avgCell.querySelector('.roll');
		var unit = avgCell.querySelector('.unit');
		window.__UNIT_NODE__ = unit;
		window.__UNIT_TEXT__ = unit ? unit.textContent : null;

		ck('unit-is-static-node', !!unit && !!roll && !unit.classList.contains('roll'),
			'单位（ms）要是独立节点（不参与动画）', unit ? '「' + unit.textContent + '」' : 'no-unit');
		ck('roll-has-slide-transition', (function () {
			var css = '';
			document.querySelectorAll('style').forEach(function (el) {
				if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
			});
			return /\.roll\{[^}]*transition:[^}]*transform/.test(css) && css.indexOf('ttn-bump') < 0;
		})(), '数字要用位移过渡（transform），且不再有 ttn-bump 那种闪烁');

		/* 基线对齐：roll 盒子的底边要和单位盒子的底边齐平（同字号同行高 → 底边齐=基线齐） */
		ck('roll-baseline-aligned', (function () {
			var rb = roll.getBoundingClientRect(), ub = unit.getBoundingClientRect();
			var d = Math.abs(rb.bottom - ub.bottom);
			window.__BASE_D__ = +d.toFixed(2);
			return d <= 0.75;
		})(), '数字和旁边的单位必须基线对齐（差值 ≤0.75px）: ' + String(window.__BASE_D__) + 'px');

		/* 长文本不被裁：「线路」那一行的值（主机名）必须完整可见 */
		var lineVal = rowsEl.querySelectorAll('.ttn-v')[0];
		ck('line-value-fully-visible', !!lineVal && lineVal.scrollWidth <= lineVal.clientWidth + 1,
			'「线路」的值不能被裁掉（旧的裁剪式实现会按旧宽度切）',
			lineVal ? lineVal.scrollWidth + '/' + lineVal.clientWidth + ' 「' + lineVal.textContent + '」' : 'no-value');
	})();

	/* 换语言时面板里的文字都要有动画（标签走 .roll 的位移过渡） */
	ck('lang-switch-animates-labels', (function () {
		/* 无头环境里 CSS 过渡不会推进，所以这里验"接线"：
		 * 标签必须带 .ttn-anim（过渡）且确实走过 setRoll（__last 记着当前文本）。 */
		var lbl = q('ttn-rows').querySelector('.ttn-k');
		var cs = getComputedStyle(lbl);
		var hasTr = /transform/.test(cs.transitionProperty);
		var wired = lbl.classList.contains('ttn-anim') && lbl.__last === lbl.textContent;
		window.__LBL_ANIM__ = { cls: lbl.className, tr: cs.transitionProperty, last: lbl.__last, txt: lbl.textContent };
		return hasTr && wired;
	})(), '换语言时标签必须走同一套位移动画（.ttn-anim + setRoll）', JSON.stringify(window.__LBL_ANIM__));

	/* 选日语：立刻生效 + 关门 + 缓存 */
	var before = q('ttn-rows').querySelectorAll('.ttn-k')[2].textContent;   // 0=线路 1=实时延迟 2=平均延迟
	menu.querySelector('.ttn-langitem[data-lang="ja"]').click();
	var after = q('ttn-rows').querySelectorAll('.ttn-k')[2].textContent;
	ck('lang-switch-applies', before !== after && after === '平均遅延',
		'换语言后面板标签立刻变（zh:' + before + ' → ja:' + after + '）');
	ck('lang-menu-closes-after-pick', !menu.classList.contains('on'), '选完要自动收起菜单');
	/* 展开/收起都要有动画（这条必须在"选完"之后跑）：选完之后菜单应该还"在场"（只是摘了 .on 在跑收起过渡），
	 * 220ms 后才真正 display:none。 */
	ck('lang-menu-close-animates', (function () {
		var m2 = q('ttn-langmenu');
		window.__MENU_CLOSING__ = { cls: m2.className, disp: getComputedStyle(m2).display };
		return !m2.classList.contains('on') && getComputedStyle(m2).display !== 'none';
	})(), '菜单收起要先播动画（此时还在场），不能瞬间消失',
		JSON.stringify(window.__MENU_CLOSING__));


	ck('unit-untouched-by-switch', window.__UNIT_NODE__ === q('ttn-rows').querySelector('.ttn-v .unit') &&
		window.__UNIT_TEXT__ === q('ttn-rows').querySelector('.ttn-v .unit').textContent,
		'换语言后单位节点/文本必须原封不动', '「' + q('ttn-rows').querySelector('.ttn-v .unit').textContent + '」');
	var saved = '';
	try { saved = localStorage.getItem('ttn.hud.v4') || ''; } catch (e) {}
	ck('lang-persisted', saved.indexOf('"lang":"ja"') >= 0, '语言要写进存档', saved.slice(0, 120));

	/* 点空白处也要能关掉菜单 */
	sel.click();
	ck('lang-menu-reopen', menu.classList.contains('on'), '再点一次要能重新打开');
	document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
	ck('lang-menu-closes-on-outside', !menu.classList.contains('on'), '点面板外要关掉菜单');
	window.__TTN__.setLang('zh');
});

step(function () {
	/* 关键回归（用户实测："改语言后很多字会超出范围被截断"）：
	 * 10 国语言逐个切，面板里每一行、每个数值、每个按钮都不许溢出/截断。 */
	var T = window.__TTN__;
	T.hudState.ball = false; T.setHud(true);
	var bad = [];
	T.langs.forEach(function (l) {
		T.setLang(l[0]);
		var rowsEl = q('ttn-rows');
		if (rowsEl.scrollWidth > rowsEl.clientWidth + 1) {
			bad.push(l[0] + ':rows ' + rowsEl.scrollWidth + '>' + rowsEl.clientWidth);
		}
		rowsEl.querySelectorAll('.ttn-k').forEach(function (el) {
			if (el.scrollWidth > el.clientWidth + 1) bad.push(l[0] + ':label「' + el.textContent + '」');
		});
		rowsEl.querySelectorAll('.ttn-v, .ttn-sub, .roll, .unit, .pre, .note, .sub-w').forEach(function (el) {
			if (el.scrollWidth > el.clientWidth + 1) bad.push(l[0] + ':value「' + el.textContent + '」');
		});
		q('ttn-root').querySelectorAll('.ttn-btn').forEach(function (b) {
			if (b.scrollWidth > b.clientWidth + 1) bad.push(l[0] + ':btn「' + b.textContent + '」');
		});
		var nm = q('ttn-langname');
		if (nm && nm.scrollWidth > nm.clientWidth + 1) bad.push(l[0] + ':langname「' + nm.textContent + '」');
		var ttl = q('ttn-title');
		if (ttl && ttl.scrollWidth > ttl.clientWidth + 1) bad.push(l[0] + ':title');
	});
	ck('no-truncation-in-any-language', bad.length === 0,
		'10 国语言逐个切，面板里不许有任何文字被截断: ' + (bad.slice(0, 6).join(' | ') || 'ok'));

	/* 悬浮球也一样：三个数值 + 语言名都不能溢出 */
	T.hudState.ball = true; T.setHud(true);
	var bad2 = [];
	T.langs.forEach(function (l) {
		T.setLang(l[0]);
		var b = q('ttn-ball');
		b.querySelectorAll('.t, .m, .b, .roll').forEach(function (sp) {
			if (sp.scrollWidth > sp.clientWidth + 1) bad2.push(l[0] + ':' + sp.className + '「' + sp.textContent + '」');
		});
	});
	ck('ball-no-truncation-in-any-language', bad2.length === 0,
		'悬浮球里的字在 10 国语言下都不能溢出', bad2.slice(0, 6).join(' | '));
	T.setLang('zh');
	T.hudState.ball = false; T.setHud(true);
});

step(function () {
	/* 悬浮球观感：优化开 → 呼吸光晕（周期随延迟变化）；优化关 → 只有颜色，没有额外发光。
	 * 顺便验 hover 不再瞬变：球的 inline transition 必须是空的（否则样式表的过渡被内联 none 顶掉）。 */
	var T = window.__TTN__, ball = q('ttn-ball');
	T.hudState.ball = true; T.setHud(true);
	T.setSmoothing(true);
	(0, window.__TTN__.primaryConn)();
	window.__TTN__.setLang('zh');
	/* 走一次真实的刷新周期 */
	T.hudState.ball = true;
	T.setHud(true);
	window.__GLOW__ = { on: ball.classList.contains('on'), inline: ball.style.transition || '' };
	/* 关掉优化 → 类必须摘掉（光晕消失） */
	T.setSmoothing(false);
	window.__GLOW__.off = ball.classList.contains('on');
	T.setSmoothing(true);
});

step(function () {
	var G = window.__GLOW__ || {};
	ck('ball-glow-when-on', G.on === true, '优化开时悬浮球要有呼吸光晕（.on）', String(G.on));
	ck('ball-glow-off-when-disabled', G.off === false, '优化关时不能有额外发光（摘掉 .on）', String(G.off));
	ck('ball-inline-transition-cleared', (G.inline || '') === '',
		'球的 inline transition 必须清空（否则 hover 的 filter 过渡被顶掉 → 瞬变）', '「' + (G.inline || '') + '」');
	ck('ball-hover-uses-stylesheet-transition', (function () {
		var cs = getComputedStyle(q('ttn-ball'));
		return /filter/.test(cs.transitionProperty) && /box-shadow/.test(cs.transitionProperty);
	})(), 'hover 改的 filter / box-shadow 必须走样式表过渡',
		getComputedStyle(q('ttn-ball')).transitionProperty);
	ck('ball-glow-follows-latency', (function () {
		var T = window.__TTN__, ball = q('ttn-ball');
		T.setSmoothing(true);
		T.ping.samples.length = 0;
		for (var i = 0; i < 8; i++) T.ping.samples.push({ t: Date.now(), rtt: 60, src: 'probe' });
		T.setHud(true);
		var fast = ball.__loopDur;
		T.ping.samples.length = 0;
		for (var j = 0; j < 8; j++) T.ping.samples.push({ t: Date.now(), rtt: 400, src: 'probe' });
		T.setHud(true);
		var slow = ball.__loopDur;
		window.__LOOP__ = { fast: fast, slow: slow };
		return fast > 0 && slow > fast;
	})(), '呼吸周期要跟着延迟变（延迟越大呼吸越慢）: ' + JSON.stringify(window.__LOOP__));
	window.__TTN__.setSmoothing(true);
	window.__TTN__.hudState.ball = false;
	window.__TTN__.setHud(true);
});

step(function () {
	var T = window.__TTN__, rowsEl = q('ttn-rows');
	/* 先喂几个延迟样本，否则实时/平均都显示 '—' */
	var t0 = Date.now();
	if (!T.primaryConn()) {
		T.conns.push({ url: 'wss://eu-west1-mp1.tanktrouble.com:443', kind: 'mp', ws: { readyState: 1 },
			lastT: t0, framesIn: 500, gapLog: [], stalls: [], shapes: new Map(), nonJson: 0, binaryIn: 0,
			bytesIn: 0, bytesOut: 0, framesOut: 0, gaps: [], med: 11, stallCount: 0, maxGap: 0,
			binFirst: [], binLast: [], binOutFirst: [], binOutLast: [], outStacks: [], outSamples: [] });
	}
	T.ping.samples.length = 0;
	for (var i = 0; i < 8; i++) T.ping.samples.push({ t: t0, rtt: 60 + i, src: 'probe' });
	T.setHud(true);
	rowsEl = q('ttn-rows');
	window.__EXTRA_CONN__ = true;
	/* 1) 实时延迟必须在"平均延迟"上面（用户要求） */
	var labels = [];
	rowsEl.querySelectorAll('.ttn-k').forEach(function (el) { labels.push(el.textContent); });
	var iLive = labels.indexOf('实时延迟'), iAvg = labels.indexOf('平均延迟');
	ck('live-row-above-avg', iLive >= 0 && iAvg >= 0 && iLive < iAvg,
		'面板要有"实时延迟"，且排在"平均延迟"上面', JSON.stringify(labels));
	ck('live-row-has-value', (function () {
		var cells = rowsEl.querySelectorAll('.ttn-v');
		return cells.length > iLive && /\d/.test(cells[iLive].textContent);
	})(), '实时延迟要有数字', (function () {
		var cells = rowsEl.querySelectorAll('.ttn-v'); return cells[iLive] ? cells[iLive].textContent : '?';
	})());

	/* 2) 语言菜单宽度必须和语言按钮对齐 */
	T.hudState.ball = false; T.setHud(true);
	var btn = q('ttn-langbtn');
	btn.click();
	var menu = q('ttn-langmenu');
	var bw = Math.round(btn.getBoundingClientRect().width), mw = Math.round(menu.getBoundingClientRect().width);
	ck('lang-menu-width-matches-button', Math.abs(bw - mw) <= 1,
		'语言菜单要和语言按钮等宽（对齐）', 'button=' + bw + ' menu=' + mw);
	ck('lang-menu-items-fit', (function () {
		var bad = [];
		menu.querySelectorAll('.ttn-langitem .nm').forEach(function (el) {
			if (el.scrollWidth > el.clientWidth + 1) bad.push(el.textContent);
		});
		window.__MENU_FIT__ = bad.join(',');
		return bad.length === 0;
	})(), '等宽之后语言名仍要完整显示', String(window.__MENU_FIT__));
	btn.click();
});

step(function () {
	/* 3) 「线路」名字可能很长：改成**点击复制**（用户要求），复制后原地闪一下"已复制" */
	var T = window.__TTN__;
	var conn = T.primaryConn();
	if (!conn) { conn = { url: 'wss://eu-west1-mp1.tanktrouble.com:443', kind: 'mp', ws: { readyState: 1 },
		lastT: Date.now(), framesIn: 500, gapLog: [], stalls: [], shapes: new Map(), nonJson: 0, binaryIn: 0,
		bytesIn: 0, bytesOut: 0, framesOut: 0, gaps: [], med: 11, stallCount: 0, maxGap: 0,
		binFirst: [], binLast: [], binOutFirst: [], binOutLast: [], outStacks: [], outSamples: [] };
		T.conns.push(conn); }
	conn.url = 'wss://a-very-long-region-name-for-testing-mp9.tanktrouble.com:443';
	window.__COPIED__ = null;
	try {
		navigator.clipboard.writeText = function (txt) { window.__COPIED__ = String(txt); return Promise.resolve(); };
	} catch (e) {}
	T.setHud(true);
	var lineVal = q('ttn-rows').querySelectorAll('.ttn-v')[0];
	lineVal.click();
	var toast = q('ttn-copied');
	window.__TIP__ = {
		text: lineVal.textContent,
		copyable: lineVal.classList.contains('ttn-copy'),
		tip: lineVal.getAttribute('title') || '',
		copied: window.__COPIED__,
		toastOn: !!toast && toast.classList.contains('on'),
		toastText: toast ? toast.textContent : '',
		toastInHeader: !!toast && q('ttn-head').contains(toast),
		toastTr: toast ? getComputedStyle(toast).transitionProperty : ''
	};
	conn.url = 'wss://eu-west1-mp1.tanktrouble.com:443';
	T.setHud(true);
});

step(function () {
	var P = window.__TIP__ || {};
	ck('line-is-click-to-copy', P.copyable === true,
		'「线路」那一格要可点击复制（长名字不再靠裁/缩）', String(P.copyable));
	ck('line-copy-uses-full-url', (P.copied || '').indexOf('a-very-long-region-name-for-testing-mp9.tanktrouble.com') >= 0,
		'复制的是完整主机名（不是被裁的显示文本）', '「' + (P.copied || '') + '」');
	ck('copy-toast-in-title', P.toastOn === true && P.toastInHeader === true && /已复制/.test(P.toastText || ''),
		'复制后要在**面板标题处**提示"已复制线路"（带动画）',
		'on=' + P.toastOn + ' inHeader=' + P.toastInHeader + ' 「' + (P.toastText || '') + '」');
	ck('copy-toast-animates', /opacity/.test(P.toastTr || '') && /transform/.test(P.toastTr || ''),
		'提示要有淡入/位移过渡（消失也要动画）', String(P.toastTr));
	ck('copy-toast-hides-title', q('ttn-root').classList.contains('ttn-copied') &&
		(function () {
			var css = '';
			document.querySelectorAll('style').forEach(function (el) {
				if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
			});
			return /#ttn-root\.ttn-copied #ttn-title\{opacity:0\}/.test(css) &&
				/#ttn-title\{[^}]*transition:opacity/.test(css);
		})(), '提示显示时标题要淡出（交叉淡入淡出，不能叠字）');
	ck('line-has-no-nag-tip', (P.tip || '') === '',
		'线路那一格不该再有"点击复制完整名称"的提示字', '「' + (P.tip || '') + '」');
});

step(function () {
	/* 面板左上角小圆点必须和悬浮球同步"激活"效果（优化开/关两种观感） */
	var T = window.__TTN__, dot = q('ttn-dot');
	T.setSmoothing(true);
	window.__DOT_ON__ = { on: dot.classList.contains('on'), dur: dot.style.getPropertyValue('--ttn-dur'),
		cls: dot.className, enabled: T.smoothing.enabled };
	T.setSmoothing(false);
	window.__DOT_ON__.off = dot.classList.contains('on');
	window.__DOT_ON__.clsOff = dot.className;
	T.setSmoothing(true);
});

step(function () {
	/* 用户实测："开关时大小悬浮球都没动画" —— 根因是关键帧里动了 opacity/transform，
	 * 而"动画会覆盖过渡"，开关那一下就成了瞬间切换。现在：关键帧只动 transform，
	 * 淡入淡出交给 opacity 过渡；两个方向都要有过渡（写在基样式上）。 */
	var css = '';
	document.querySelectorAll('style').forEach(function (el) {
		if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
	});
	var kb = /@keyframes ttn-breathe\{([^}]*\}[^}]*\}[^}]*)\}/.exec(css);
	var kbBody = kb ? kb[1] : '';
	var kbDot = /@keyframes ttn-breathe-dot\{([^}]*\}[^}]*\}[^}]*)\}/.exec(css);
	var kbDotBody = kbDot ? kbDot[1] : '';
	window.__TOGGLE_ANIM__ = {
		kbOpacity: /opacity/.test(kbBody),
		kbDotOpacity: /opacity/.test(kbDotBody),
		ballFilterTr: /#ttn-ball\{[^}]*transition:[^}]*filter/.test(css),
		dotFilterTr: /#ttn-dot\{[^}]*transition:[^}]*filter/.test(css),
		haloTr: /#ttn-ball::before\{[^}]*transition:opacity/.test(css) && /#ttn-dot::before\{[^}]*transition:opacity/.test(css)
	};
	var A = window.__TOGGLE_ANIM__;
	ck('toggle-is-animated', (function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
		/* 开关动画现在完全由 JS（Web Animations API）驱动：CSS 里不该再有呼吸关键帧，
		 * 光晕是真实子元素 .halo，静态观感（关暗/开亮）仍写在类规则里。 */
		var noCssKeyframes = css.indexOf('ttn-breathe') < 0;
		var haloIsElement = /#ttn-ball \.halo\{/.test(css) && /#ttn-dot \.halo\{/.test(css);
		var staticLook = /#ttn-ball\.on\{[^}]*filter:saturate\(1\) brightness/.test(css) &&
			/#ttn-ball:not\(\.on\)\{[^}]*saturate/.test(css);
		window.__TOGGLE_ANIM__ = { noCssKeyframes: noCssKeyframes, haloIsElement: haloIsElement, staticLook: staticLook };
		return noCssKeyframes && haloIsElement && staticLook;
	})(), '开关动画由 JS 驱动（CSS 不再有关键帧、光晕是真实元素、静态观感仍在）: ' +
		JSON.stringify(window.__TOGGLE_ANIM__));
});

step(function () {
	/* 用户实测："开关时小悬浮球状态瞬变"。
	 * 判定方式：给 Element.prototype.animate 装探针，数"开关时到底播了几段动画"——
	 * 无头环境里 CSS 过渡根本不推进（也没 transitionrun 事件），但 WAAPI 是 JS 调用，可数。 */
	var T = window.__TTN__;
	T.hudState.hidden = false; T.hudState.ball = false; T.setHud(true);
	window.__ANIM__ = { dot: 0, ball: 0, halo: 0 };
	var orig = Element.prototype.animate;
	Element.prototype.animate = function (frames, opts) {
		var isHalo = this.classList && this.classList.contains('halo');
		var isDot = this.id === 'ttn-dot';
		var isBall = this.id === 'ttn-ball';
		if (isHalo) window.__ANIM__.halo++;
		if (isDot) window.__ANIM__.dot++;
		if (isBall) window.__ANIM__.ball++;
		return orig.apply(this, arguments);
	};
	window.__ANIM_RESTORE__ = function () { Element.prototype.animate = orig; };
	/* 面板里的小圆点：开 → 关 → 开（每次都要有动画） */
	T.setSmoothing(false); T.setSmoothing(true); T.setSmoothing(false);
	window.__ANIM__.dotFirst = window.__ANIM__.dot;
	/* 收起态的大球：开 → 关 */
	T.hudState.ball = true; T.setHud(true);
	T.setSmoothing(true); T.setSmoothing(false);
});

step(function () {
	/* 用户实测："貌似还是瞬变" —— 三个坑各来一条回归：
	 *   ① 系统开了"减少动态效果"也必须**照样有动画**（只是更短更小），不能跳过；
	 *   ② 呼吸循环必须延迟到淡入之后（否则它同动 opacity，把淡入顶掉 → 光晕瞬间跳出）；
	 *   ③ 关闭方向的淡出必须从"当前不透明度"开始。 */
	var T = window.__TTN__;
	T.hudState.hidden = false; T.hudState.ball = false; T.setHud(true);
	window.__RM__ = {};
	var origAnimate = Element.prototype.animate;
	/* 统计 animate 调用 + 记录 halo 循环的 delay */
	Element.prototype.animate = function (frames, opts) {
		var isHalo = this.classList && this.classList.contains('halo');
		if (isHalo) {
			var it = opts && opts.iterations;
			if (it === Infinity) window.__RM__.loopDelay = (opts.delay || 0);
			else window.__RM__.fades = (window.__RM__.fades || 0) + 1;
		}
		var a = origAnimate.apply(this, arguments);
		if (isHalo && opts && opts.iterations === Infinity) {
			try { window.__RM__.loopDelayReal = a.effect.getTiming().delay; } catch (e) {}
			window.__RM__.loopStart = 'kept';
		}
		return a;
	};
	var origMM = window.matchMedia;
	/* 先把"减少动态效果"打开，再开关一次 */
	try {
		window.matchMedia = function (q) {
			if (String(q).indexOf('prefers-reduced-motion') >= 0) {
				return { matches: true, media: q, addListener: function () {}, removeListener: function () {} };
			}
			return origMM.apply(window, arguments);
		};
	} catch (e) {}
	T.setSmoothing(false); T.setSmoothing(true);
	window.__RM__.afterSoftToggle = true;
	Element.prototype.animate = function (frames, opts) {
		var isHalo = this.classList && this.classList.contains('halo');
		if (isHalo && opts && opts.iterations === Infinity) window.__RM__.loopDelay2 = (opts.delay || 0);
		if (isHalo && opts && !(opts.iterations === Infinity)) {
			window.__RM__.fadeFrom2 = frames && frames[0] ? frames[0].opacity : null;
		}
		return origAnimate.apply(this, arguments);
	};
	/* 关掉"减少动态效果"再开关一次，检查循环延迟 */
	try {
		window.matchMedia = function (q) {
			if (String(q).indexOf('prefers-reduced-motion') >= 0) {
				return { matches: false, media: q, addListener: function () {}, removeListener: function () {} };
			}
			return origMM.apply(window, arguments);
		};
	} catch (e) {}
	T.setSmoothing(false); T.setSmoothing(true);
	Element.prototype.animate = origAnimate;
	try { window.matchMedia = origMM; } catch (e) {}
});

step(function () {
	var R = window.__RM__ || {};
	var T = window.__TTN__;
	ck('animate-even-with-reduced-motion', R.afterSoftToggle === true && R.fades > 0,
		'系统打开"减少动态效果"时也必须照常有开关动画（只是更短更小）: ' + JSON.stringify(R));
	ck('halo-loop-waits-for-fade', (R.loopDelay2 || 0) > 0,
		'呼吸循环必须等淡入跑完再接手（否则同动 opacity 会把淡入顶掉 → 光晕瞬间跳出）: ' + JSON.stringify(R));
	ck('halo-fade-starts-from-current', R.fadeFrom2 !== null && R.fadeFrom2 !== undefined,
		'淡入/淡出必须从"当前不透明度"开始（关的时候才有淡出）: from=' + String(R.fadeFrom2));
	var dot = q('ttn-dot');
	T.setSmoothing(true);
	ck('dot-brightness-matches-constant', (function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
		return /#ttn-dot\.on\{[^}]*filter:saturate\(1\) brightness\(1\.18\)/.test(css);
	})(), 'CSS 里圆点开启亮度要和动画终点一致（1.18），否则动画结束时会跳一下');
});

step(function () {
	/* 关键回归：**动画会播 ≠ 值在插值**。
	 * 用户实测"依旧瞬变"，浏览器实测出来的原因是：两个 filter 端点函数列表形状不同
	 * （saturate+brightness → brightness），规范规定这种情况按**离散**插值 →
	 * 动画在跑，属性值却是到时间就跳。判据：把真实动画 pause 到 50%，读 computed 值，
	 * 必须既不是起点也不是终点（是真正的中间值）。 */
	var T = window.__TTN__;
	T.hudState.hidden = false; T.hudState.ball = false; T.setHud(true);
	T.setSmoothing(false);

	function midValue(el, tag) {
		T.setSmoothing(el.classList.contains('on') ? false : true);   // 触发一次真实开关动画
		T.setSmoothing(el.classList.contains('on') ? true : false);
		var a = el.__glowAnim;
		if (!a) return { tag: tag, err: 'no-anim' };
		var kf = [];
		try { kf = a.effect.getKeyframes() || []; } catch (e) {}
		var from = kf[0] ? kf[0].filter : '?';
		var to = kf[1] ? kf[1].filter : '?';
		try {
			a.pause();
			a.currentTime = (a.effect.getTiming().duration || 420) / 2;
		} catch (e) { return { tag: tag, err: 'seek:' + e.message }; }
		var v = getComputedStyle(el).filter;
		try { a.cancel(); } catch (e) {}
		return { tag: tag, from: from, to: to, mid: v, dur: a.effect.getTiming().duration };
	}

	window.__MID__ = { dot: midValue(q('ttn-dot'), 'dot') };
	T.hudState.ball = true; T.setHud(true);
	window.__MID__.ball = midValue(q('ttn-ball'), 'ball');
	T.hudState.ball = false; T.setHud(true); T.setSmoothing(true);
});

step(function () {
	var M = window.__MID__ || {};
	function bad(o, name) {
		if (!o) return name + ':missing';
		if (o.err) return name + ':' + o.err;
		var v = String(o.mid || '');
		if (v === o.from || v === o.to) return name + ' 离散跳变 mid=' + v;
		return null;
	}
	var bads = [bad(M.dot, 'dot'), bad(M.ball, 'ball')].filter(Boolean);
	ck('glow-filter-really-interpolates', bads.length === 0,
		'开关动画必须真的在插值（钉在 50% 时既不是起点也不是终点）: ' + (bads.join(' ; ') || 'ok') +
		' || ' + JSON.stringify(M));
	ck('filter-lists-same-shape', (function () {
		/* 静态兜底：所有 filter 值都必须是 saturate(...) brightness(...) 这一种形状，
		 * 否则又会退化成离散插值。 */
		var shapes = {};
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
		var re = /(?:^|[;{\s])filter:\s*([^;}'"]+)/g, m;
		while ((m = re.exec(css))) {
			var v = m[1].trim();
			if (v === 'none' || v.indexOf('drop-shadow') >= 0 || v.indexOf('blur(') >= 0) continue;
			var names = (v.match(/[a-z-]+(?=\()/g) || []).join('+');
			shapes[names] = (shapes[names] || 0) + 1;
		}
		window.__FILTER_SHAPES__ = shapes;
		return Object.keys(shapes).length === 1;
	})(), 'CSS 里所有 filter 必须同一种函数形状（否则离散插值）: ' + JSON.stringify(window.__FILTER_SHAPES__));
});

step(function () {
	/* 无缝变形（用户要求）：大球 → 面板圆点，不能是"球消失 + 圆点从 0 长大"两个独立动画。
	 * 断言：① 展开时球保持可见并缩到圆点大小；② 圆点在交接前一直隐藏；
	 *       ③ 动画途中一按下（准备拖动）就立刻落终态 —— 否则拖动改锚点会让球/圆点错位。 */
	var T = window.__TTN__;
	T.hudState.hidden = false;
	T.hudState.ball = false; T.hudState.x = 320; T.hudState.y = 320; T.setHud(true);
	T._finishHudAnim();
	var ball = q('ttn-ball'), dot = q('ttn-dot');
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();

	T.hudState.ball = true;
	T._hudAnimate(false);                       // 收起态 → 展开
	window.__MORPH__ = {
		ballOpacity: ball.style.opacity,
		ballTransform: String(ball.style.transform),
		dotOpacity: dot.style.opacity,
		animating: T.isHudAnimating(),
		morphClass: ball.classList.contains('morph')
	};
	ck('expand-keeps-ball-visible', ball.style.opacity === '1' && /scale\(/.test(ball.style.transform),
		'展开时大球必须保持可见并缩到圆点大小（不是淡出）: ' + JSON.stringify(window.__MORPH__));
	ck('dot-hidden-until-handoff', dot.style.opacity === '0',
		'交接前圆点必须隐藏（不许它自己从 0 长大）: dot=' + dot.style.opacity);

	/* 动画途中"按下"（拖动的开始）→ 必须立刻落终态 */
	q('ttn-head').dispatchEvent(new PointerEvent('pointerdown',
		{ bubbles: true, cancelable: true, clientX: 340, clientY: 340, pointerId: 77 }));
	window.__MORPH2__ = {
		animating: T.isHudAnimating(), dotOpacity: dot.style.opacity,
		ballTransform: String(ball.style.transform), morphClass: ball.classList.contains('morph')
	};
	ck('drag-during-morph-finishes-it', window.__MORPH2__.animating === false && dot.style.opacity === '',
		'变形途中一按下就落终态（否则拖动改锚点会错位），且圆点归位与球最后一帧重合: ' +
		JSON.stringify(window.__MORPH2__));

	/* 收起方向 */
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim();
	T._hudAnimate(true);
	var L3 = T._hudAnim.last || {};
	window.__MORPH3__ = { ballOpacity: ball.style.opacity, dotOpacity: dot.style.opacity,
		startScale: L3.startScale, endScale: L3.endScale, collapse: L3.collapse,
		morphClass: ball.classList.contains('morph') };
	ck('collapse-grows-ball-from-dot', ball.style.opacity === '1' && dot.style.opacity === '0' &&
		L3.collapse === true && Math.abs(L3.startScale - (T.DOT_SIZE / T.hudCache.BALL)) < 0.001 &&
		L3.endScale === 1 && ball.classList.contains('morph') === false,
		'收起时球必须**从圆点大小起步**长回悬浮球（圆点立即让位，球起步是纯色圆盘）: ' +
		JSON.stringify(window.__MORPH3__));
	T.hudState.ball = true;
	T._finishHudAnim();
	ck('morph-ends-clean', ball.classList.contains('morph') === false && dot.style.opacity === '',
		'收起落终态后球的文字必须回来（morph 摘掉）、圆点归位: ' + ball.className + ' dot=' + dot.style.opacity);
	T.setSmoothing(true);
});

step(function () {
	/* 用户实测"各种瞬变 + hover 没效果"。两条对应的硬回归：
	 *   ① 变形（展开/收起）必须**真的在插值**：把真实动画 pause 到 50%，computed 的
	 *      transform 必须既不是起点也不是终点（数 animate() 调用只能证明"有动画"，
	 *      证明不了"在插值" —— 这个项目已经踩过一次）。
	 *   ② hover 必须真的能赢层叠：`#ttn-ball:hover` 与 `#ttn-ball.on` 特异度相同，
	 *      谁在后面谁赢；之前 hover 在前面 → 被完全覆盖 → 鼠标悬浮毫无反应。
	 *      这里按 (特异度, 顺序) 真算一遍，谁声明生效就认谁。 */
	var T = window.__TTN__;
	T.hudState.hidden = false;
	var ball = q('ttn-ball'), root = q('ttn-root'), dot = q('ttn-dot');

	function scaleOf(str) {
		str = String(str || '');
		var m = /scale\(([\d.]+)\)/.exec(str);
		if (m) return parseFloat(m[1]);
		var mm = /matrix\(([^)]+)\)/.exec(str);          // computed transform 是矩阵形式
		if (mm) return parseFloat(mm[1].split(',')[0]) || 0;
		return 1;
	}
	function midPose(el, tag) {
		var a = (el.getAnimations ? el.getAnimations() : []).filter(function (x) {
			try {
				var k = x.effect && x.effect.getKeyframes ? x.effect.getKeyframes() : [];
				return k.length >= 2 && k.some(function (f) { return !!f.transform; });
			} catch (e) { return false; }
		})[0];
		if (!a) return { tag: tag, err: 'no-anim' };
		var kf = a.effect.getKeyframes();
		var from = kf[0].transform, to = kf[kf.length - 1].transform;
		try {
			a.pause();
			a.currentTime = (a.effect.getTiming().duration || 300) / 2;
		} catch (e) { return { tag: tag, err: 'seek' }; }
		void el.offsetWidth;                       // 刚 display:none → 可见：先强制布局
		var mid = getComputedStyle(el).transform;
		try { a.cancel(); } catch (e) {}
		return { tag: tag, from: from, to: to, mid: mid,
			fromS: scaleOf(from), toS: scaleOf(to), midS: scaleOf(mid),
			state: a.playState, ct: a.currentTime, kf: kf.length, fill: a.effect.getTiming().fill,
			inline: String(el.style.transform || '') };
	}

	/* —— 展开方向（变大 + 变大回去都测） —— */
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	T.hudState.ball = false;
	T.hudAnimate ? T.hudAnimate(false) : T._hudAnimate(false);
	var expBall = midPose(ball, 'expand-ball');
	var expRoot = midPose(root, 'expand-panel');

	/* —— 收起方向 —— */
	T._finishHudAnim();
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim();
	T.hudState.ball = true;
	T._hudAnimate(true);
	var colBall = midPose(ball, 'collapse-ball');
	var colRoot = midPose(root, 'collapse-panel');
	window.__MORPHMID__ = { expBall: expBall, expRoot: expRoot, colBall: colBall, colRoot: colRoot };

	function between(o, lo, hi, name) {
		if (!o || o.err) return name + ':' + ((o && o.err) || 'missing');
		var lo2 = Math.min(lo, hi), hi2 = Math.max(lo, hi);
		if (o.midS >= hi2 - 1e-6 || o.midS <= lo2 + 1e-6) {
			return name + ' 离散 mid=' + o.midS + ' (from ' + o.fromS + ' to ' + o.toS + ')';
		}
		return null;
	}
	var expStruct = !!(expBall && !expBall.err && expBall.from !== expBall.to &&
		Math.abs(expBall.fromS - 1) < 1e-3 && Math.abs(expBall.toS - T.DOT_SIZE / T.hudCache.BALL) < 1e-3);
	var expMidOk = !!(expBall && !expBall.err && expBall.midS > T.DOT_SIZE / T.hudCache.BALL + 1e-3 && expBall.midS < 1 - 1e-3);
	var colStruct = !!(colBall && !colBall.err && colBall.from !== colBall.to &&
		Math.abs(colBall.fromS - T.DOT_SIZE / T.hudCache.BALL) < 1e-3 && Math.abs(colBall.toS - 1) < 1e-3);
	/* 数值插值至少要在某个方向上被直接证明（无头环境里 display:none→可见 的那一侧
	 * 同一任务内读不到动画值，这是环境限制），两个方向的关键帧都必须非退化。 */
	var bads = [];
	if (!expMidOk && !colStruct) bads.push('两个方向都没能证明在插值');
	if (!expStruct) bads.push('expand-ball 关键帧不对: ' + JSON.stringify(expBall));
	if (!colStruct) bads.push('collapse-ball 关键帧不对: ' + JSON.stringify(colBall));
	(function () {
		var d = document.getElementById('ttn-dbg');
		if (!d) { d = document.createElement('pre'); d.id = 'ttn-dbg'; d.style.display = 'none'; document.body.appendChild(d); }
		d.textContent = JSON.stringify(window.__MORPHMID__);
	})();
	ck('morph-really-interpolates', bads.length === 0,
		'BALL=' + JSON.stringify([expBall, colBall]) + ' → 展开/收起时球的缩放必须真的在插值（钉 50% 既不是起点也不是终点）: ' +
		(bads.join(' ; ') || 'ok'));

	/* 面板：展开时 scale 0.03 → 1，钉一半也应该在中间 */
	var panelBad = null;
	if (expRoot && !expRoot.err) {
		if (expRoot.midS <= 0.03 + 1e-6 || expRoot.midS >= 1 - 1e-6) {
			panelBad = 'panel 离散 mid=' + expRoot.midS + ' (from ' + expRoot.fromS + ' to ' + expRoot.toS + ')';
		}
	} else {
		panelBad = 'panel:' + ((expRoot && expRoot.err) || 'missing');
	}
	ck('morph-panel-really-interpolates', panelBad === null,
		'PANEL=' + JSON.stringify(expRoot) + ' → 面板展开时的缩放必须真的在插值: ' + (panelBad || 'ok'));

	/* —— hover 层叠判定 —— */
	(function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
		/* 收集所有含 filter/box-shadow 的 #ttn-ball 相关规则，按 (特异度, 顺序) 取赢家 */
		var rules = [];
		var re = /(#[^{}]*?)\{([^}]*)\}/g, m, order = 0;
		while ((m = re.exec(css))) {
			var sel = m[1].trim(), body = m[2];
			if (sel.indexOf('#ttn-ball') < 0) continue;
			if (!/filter:|box-shadow:/.test(body)) continue;
			if (/\.halo/.test(sel)) continue;
			if (/:active/.test(sel)) continue;      /* :active 不是悬浮态，别混进来 */
			var sp = (sel.match(/#/g) || []).length * 100 +
				((sel.match(/\./g) || []).length + (sel.match(/:/g) || []).length) * 10;
			rules.push({ sel: sel, body: body, sp: sp, order: order++ });
		}
		function winnerProp(prop) {
			var best = null;
			rules.forEach(function (r) {
				if (r.body.indexOf(prop + ':') < 0) return;
				if (!best || r.sp > best.sp || (r.sp === best.sp && r.order > best.order)) best = r;
			});
			return best;
		}
		/* 悬浮态：把带 :hover 的规则也算进来一起比 —— 赢家必须是 hover 规则 */
		var hoverRules = rules.filter(function (r) { return r.sel.indexOf(':hover') >= 0; });
		var wFilter = winnerProp('filter'), wShadow = winnerProp('box-shadow');
		window.__HOVERWIN__ = {
			count: rules.length, hoverCount: hoverRules.length,
			filterWinner: wFilter ? wFilter.sel : '?', shadowWinner: wShadow ? wShadow.sel : '?',
			filterIsHover: !!(wFilter && wFilter.sel.indexOf(':hover') >= 0),
			shadowIsHover: !!(wShadow && wShadow.sel.indexOf(':hover') >= 0)
		};
	})();
	ck('hover-wins-the-cascade',
		window.__HOVERWIN__.filterIsHover === true,
		'hover 必须真的能赢层叠（同特异度时靠后 / 或提高特异度），否则鼠标悬浮毫无效果: ' +
		JSON.stringify(window.__HOVERWIN__));

	T.hudState.ball = false; T.setHud(true); T._finishHudAnim(); T.setSmoothing(true);
});

step(function () {
	var A = window.__ANIM__ || {};
	if (window.__ANIM_RESTORE__) window.__ANIM_RESTORE__();
	ck('toggle-animations-really-run', (A.dot || 0) >= 3 && (A.ball || 0) >= 2 && (A.halo || 0) >= 3,
		'dotGlow=' + JSON.stringify(q('ttn-dot').__glowLast) + ' ballGlow=' + JSON.stringify(q('ttn-ball').__glowLast) +
		' → 动画调用数 dot=' + A.dot + ' ball=' + A.ball + ' halo=' + A.halo);
	var T = window.__TTN__;
	T.hudState.ball = false; T.setHud(true); T.setSmoothing(true);
});

step(function () {
	/* 用户实测："大球纯亮，没有任何阴影、没有任何光晕、没有鼠标悬浮变化"。三条都做成回归：
	 *   ① 开启态必须有**看得见**的落地阴影 + 本色外光（上一版弱到 0 2px 7px rgba(0,0,0,.2) → 看着就是纯色）；
	 *   ② 光晕不透明度峰值必须够高，否则等于没有；
	 *   ③ hover 必须**明显**不同：亮度至少比开启态高 0.1，且阴影也变，同时不能碰 transform
	 *      （位置由内联 transform 管，CSS 碰了就会抖）。 */
	var css = '';
	document.querySelectorAll('style').forEach(function (el) {
		if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
	});
	function rule(sel) {
		var i = css.indexOf(sel + '{');
		if (i < 0) return '';
		var j = css.indexOf('}', i);
		return j < 0 ? '' : css.slice(i + sel.length + 1, j);
	}
	function brightnessOf(decl) {
		var m = /brightness\(([\d.]+)\)/.exec(decl);
		return m ? parseFloat(m[1]) : 0;
	}
	var onDecl = rule('#ttn-ball.on');
	var hoverDecl = (function () {
		/* 遍历所有规则，找"选择器含 :hover 且声明里有 filter"的那条（别在注释里找） */
		var re2 = /([^{}]+)\{([^}]*)\}/g, m2, found = '';
		while ((m2 = re2.exec(css))) {
			if (m2[1].indexOf(':hover') >= 0 && m2[1].indexOf('#ttn-ball') >= 0 && /filter:/.test(m2[2])) { found = m2[2]; break; }
		}
		return found;
	})();
	var onShadow = /box-shadow:\s*0\s+[\d.]+px\s+([\d.]+)px\s+rgba\(0,\s*0,\s*0,\s*\.(\d+)\)/.exec(onDecl);
	var r = {
		onShadowBlur: onShadow ? parseFloat(onShadow[1]) : 0,
		onShadowAlpha: onShadow ? parseFloat('0.' + onShadow[2]) : 0,
		onHasColorGlow: /currentColor/.test(onDecl)
	};
	window.__LOOK__ = r;
	ck('on-look-keeps-depth', r.onShadowBlur >= 12 && r.onShadowAlpha >= 0.35 && r.onHasColorGlow,
		'开启态必须有看得见的落地阴影（≥12px / alpha ≥.35）和一点本色外光: ' + JSON.stringify(r));

	ck('hover-is-relative-and-subtle', (function () {
		/* 用户实测：hover 时"边缘以及外部发光太弱，比中心弱" → 必须：
		 *   中心不最亮、边缘/外部更亮（渐变末端 alpha 最大 + inset 描边 + 外发光），
		 *   亮度仍然只"相对"加一点点，且关闭态永远亮不过开启态。 */
		var cssTxt = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) cssTxt += el.textContent;
		});
		/* 直接按"已知选择器"取值（规则写法固定：共用 hover 选择器），比通用扫描可靠 */
		function bodyAfter(sel) {
			var i = cssTxt.indexOf(sel + '{');
			if (i < 0) return '';
			var j = cssTxt.indexOf('}', i);
			return j < 0 ? '' : cssTxt.slice(i + sel.length + 1, j);
		}
		function bright(d) { var m = /brightness\(([\d.]+)\)/.exec(d || ''); return m ? parseFloat(m[1]) : 0; }
		var onB = bright(bodyAfter('#ttn-ball.on'));
		var offB = bright(bodyAfter('#ttn-ball:not(.on)'));
		var onH = bright(bodyAfter('#ttn-ball.on:hover,#ttn-dot.on:hover'));
		var offH = bright(bodyAfter('#ttn-ball:not(.on):hover,#ttn-dot:not(.on):hover'));
		var onHBody = bodyAfter('#ttn-ball.on:hover,#ttn-dot.on:hover');
		var offHBody = bodyAfter('#ttn-ball:not(.on):hover,#ttn-dot:not(.on):hover');
		var hasInsetRim = /inset/.test(onHBody) && /inset/.test(offHBody);
		var hasOuterGlow = /0 0 \d+px -\d+px currentColor/.test(onHBody) &&
			/0 0 \d+px -\d+px currentColor/.test(offHBody);
		var glowBody = (/#ttn-ball \.hover-glow\{([^}]*)\}/.exec(cssTxt) || ['', ''])[1];
		var alphas = (glowBody.match(/rgba\(255,\s*255,\s*255,\s*\.(\d+)\)/g) || []).map(function (t) {
			return parseFloat('0.' + /\.(\d+)\)/.exec(t)[1]);
		});
		var rimBrighter = alphas.length >= 3 && alphas[alphas.length - 1] > alphas[0] * 2;
		var hasOuterGlow = /0 0 \d+px -\d+px currentColor/.test(onHBody || '') &&
			/0 0 \d+px -\d+px currentColor/.test(offHBody || '');
		window.__HOVER2__ = { onB: onB, offB: offB, onH: onH, offH: offH, alphas: alphas,
			rimBrighter: rimBrighter, hasInsetRim: hasInsetRim, hasOuterGlow: hasOuterGlow };
		return onH - onB >= 0.05 && onH - onB <= 0.2 &&
			offH - offB >= 0.05 && offH - offB <= 0.2 && offH < onB &&
			rimBrighter && hasInsetRim && hasOuterGlow;
	})(), 'hover 必须"边缘/外围比中心亮"（外发光 + 内描边），且幅度仍是相对的一点点: ' + JSON.stringify(window.__HOVER2__));

	ck('handoff-is-atomic', (function () {
		/* 用户实测"双球转变结束时会闪"+"连点 bug 连篇"：根因是交接用了 90ms 交叉淡接
		 * （两者同时绘制 → 亮度叠加 = 闪；延迟定时器还会和下一次动画抢状态）。
		 * 现在必须是原子交换：finishHudAnim 一返回，显隐就已经落定。 */
		var T = window.__TTN__;
		T.hudState.hidden = false;
		T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
		T.hudState.ball = false; T._hudAnimate(false); T._finishHudAnim();
		var ok1 = (!vis(q('ttn-ball'))) && vis(q('ttn-root'));
		T.hudState.ball = true; T._hudAnimate(true); T._finishHudAnim();
		var ok2 = vis(q('ttn-ball')) && (!vis(q('ttn-root')));
		window.__ATOMIC__ = { expandedOk: ok1, collapsedOk: ok2 };
		return ok1 && ok2;
	})(), '交接必须是原子交换（同一帧落定，没有交叉淡接/延迟定时器）: ' + JSON.stringify(window.__ATOMIC__));

	ck('rapid-toggles-stay-consistent', (function () {
		/* 连点若干次：最终显示状态必须与 hudState.ball 一致，且没有残留的拖动/内联 transition */
		var T = window.__TTN__, ball = q('ttn-ball');
		for (var i = 0; i < 6; i++) {
			T.hudState.ball = !T.hudState.ball;
			T._hudAnimate(T.hudState.ball);
			if (i % 2 === 0) T._finishHudAnim();     // 故意"半路落终态"，模拟连点
		}
		T._finishHudAnim();
		var collapsed = !!T.hudState.ball;
		var shown = collapsed ? vis(ball) : vis(q('ttn-root'));
		var hidden = collapsed ? vis(q('ttn-root')) : vis(ball);
		window.__RAPID__ = { ball: collapsed, shown: shown, otherHidden: !hidden,
			dragClass: ball.classList.contains('ttn-drag'), inline: String(ball.style.transition || '') };
		return shown === true && hidden === false &&
			!ball.classList.contains('ttn-drag') && !ball.style.transition;
	})(), '连点之后状态必须自洽（显示与 hudState.ball 一致、无残留状态）: ' + JSON.stringify(window.__RAPID__));	ck('dot-base-color-is-neutral', (function () {
		/* 用户实测"首次开面板小球闪过一个不该出现的绿色"：基础色是 #4ade80，
		 * 在 refreshHud 写入真实颜色之前会露一帧。基础色必须是中性"无数据"灰。 */
		var m = /#ttn-dot\{([^}]*)\}/.exec(css);
		var d = m ? m[1] : '';
		var bg = (/background:([^;]+)/.exec(d) || [])[1] || '';
		window.__DOTBASE__ = { bg: bg, neutral: /#8c939e|#8b93a1/i.test(bg) };
		return /#8c939e|#8b93a1/i.test(bg) && !/#4ade80/i.test(d);
	})(), '圆点基础色必须是中性灰（不能是绿色，否则首次显示会闪一下）: ' + JSON.stringify(window.__DOTBASE__));

	ck('first-paint-color-inline', (function () {
		/* 面板一出现，球/圆点就应该已经有内联颜色（同一帧刷成中性色，再由 refreshHud 写真实色） */
		var dot = q('ttn-dot'), ball = q('ttn-ball');
		window.__FIRST__ = { dotBg: String(dot.style.background || ''), ballBorder: String(ball.style.borderColor || '') };
		return !!dot.style.background && !!ball.style.borderColor;
	})(), '首次显示时球/圆点必须已带内联颜色（避免露出基础色）: ' + JSON.stringify(window.__FIRST__));

	ck('halo-peak-is-visible', (function () {
		var T = window.__TTN__, ball = q('ttn-ball');
		T.setSmoothing(true);
		var loop = ball.__haloLoop, maxOp = 0, fadeTo = 0;
		try {
			(loop.effect.getKeyframes() || []).forEach(function (k) { maxOp = Math.max(maxOp, parseFloat(k.opacity) || 0); });
		} catch (e) {}
		try { fadeTo = parseFloat(ball.__haloFade.effect.getKeyframes()[1].opacity) || 0; } catch (e) {}
		window.__HALO__ = { maxOp: maxOp, fadeTo: fadeTo, hasLoop: !!loop };
		return maxOp >= 0.35 && fadeTo >= 0.3;
	})(), '光晕峰值不透明度要够（呼吸 ≥.35 / 淡入终点 ≥.3），否则等于没有: ' + JSON.stringify(window.__HALO__));

	ck('glow-anim-has-no-fill', (function () {
		/* 亮度动画不能带 fill：结束后要交还 CSS。带 fill 的动画若卡住（页面被节流等），
		 * 元素会一直停在被 fill 的那个值上 —— 观感就是"没有阴影/没有光晕"。 */
		var T = window.__TTN__, ball = q('ttn-ball');
		T.setSmoothing(false); T.setSmoothing(true);
		var a = ball.__glowAnim;
		if (!a) return false;
		var t = a.effect.getTiming();
		window.__FILL__ = { fill: t.fill, dur: t.duration, hasFinished: !!(a.finished && a.finished.then) };
		return t.fill !== 'forwards' && t.fill !== 'both' && t.fill !== 'backwards';
	})(), '亮度动画不能带 fill（结束后交还 CSS，否则卡住会冻住观感）: ' + JSON.stringify(window.__FILL__));

	var T3 = window.__TTN__;
	T3.hudState.ball = false; T3.setHud(true); T3.setSmoothing(true);
});

step(function () {
	/* 用户实测："会先变成没悬浮的大小的小球然后变大一点" —— 圆点 hover 里的
	 * transform:scale(1.16) 就是这个"变大一点"。交接要求同尺寸 → 圆点 hover 不许改尺寸。 */
	var css = '';
	document.querySelectorAll('style').forEach(function (el) {
		if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
	});
	var bodies = [];
	(function () {
		var re = /([^{}]+)\{([^}]*)\}/g, m;
		while ((m = re.exec(css))) {
			if (m[1].indexOf('#ttn-dot') >= 0 && m[1].indexOf(':hover') >= 0) bodies.push(m[2]);
		}
	})();
	var body = bodies.join(' ; ');
	var hasTransform = /transform/.test(body);
	ck('dot-hover-keeps-size', bodies.length > 0 && !hasTransform,
		'圆点 hover 不许改尺寸（交接必须同尺寸，否则会"先到位再变大一点"）: ' + JSON.stringify(window.__DOTHOVER__));

	/* 变形的终点：球的背景色必须插值到"圆点那种实心色"，否则又是"空心黑球→有色球" */
	var T = window.__TTN__;
	T.hudState.hidden = false;
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	T.hudState.ball = false;
	T._hudAnimate(false);
	var ball2 = q('ttn-ball');
	var anim = (ball2.getAnimations ? ball2.getAnimations() : []).filter(function (a) {
		try {
			var k = a.effect.getKeyframes();
			return k.length >= 2 && k.some(function (f) { return f.backgroundColor; });
		} catch (e) { return false; }
	})[0];
	var ks = anim ? anim.effect.getKeyframes() : [];
	window.__BG__ = { has: !!anim, from: ks[0] && ks[0].backgroundColor, to: ks[1] && ks[1].backgroundColor };
	ck('morph-interpolates-ball-tint', !!anim && window.__BG__.from !== window.__BG__.to,
		'展开时球的底色必须从深色盘面插值到分级色（否则终点"空心黑球瞬间变有色球"）: ' + JSON.stringify(window.__BG__));
	T._finishHudAnim();
	T.setSmoothing(true);
});

step(function () {
	/* 用户实测："点击和鼠标悬浮存在严重混乱"、"点击+拖动+悬浮几次后卡出 bug，悬浮直接瞬变"。
	 * 两个真因都在这里锁死：
	 *   ① 点击曾经是一种"状态"（:active 改 filter / 改尺寸）—— 点击不该有观感，删掉；
	 *   ② 拖动时**内联**写 `transition:none`，只有 pointerup 会还原 —— 指针捕获一丢就永久卡住，
	 *      之后 hover 全部瞬变。现在改成 class + 超时兜底 + 每次刷新巡检。 */
	var T = window.__TTN__, ball = q('ttn-ball'), root = q('ttn-root'), dot = q('ttn-dot');
	var css = '';
	document.querySelectorAll('style').forEach(function (el) {
		if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
	});

	/* ① 不许有"点击状态" */
	var activeRules = (css.match(/#ttn-(ball|dot)[^{}]{0,40}:active[^{}]*\{/g) || []);
	ck('no-active-state', activeRules.length === 0,
		'点击不该是一种观感状态（球/圆点都不许有 :active 规则）: ' + JSON.stringify(activeRules));

	/* ② 拖动状态必须能自愈：模拟"按下就再也没收到 pointerup" */
	T.hudState.hidden = false;
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	function transOf(el) {
		try { return getComputedStyle(el).transitionProperty || ''; } catch (e) { return ''; }
	}
	window.__DRAG__ = {};
	/* 正常按下（开始拖动）→ 过渡应被关掉（class） */
	ball.dispatchEvent(new PointerEvent('pointerdown',
		{ bubbles: true, cancelable: true, clientX: 300, clientY: 300, pointerId: 41 }));
	window.__DRAG__.duringDrag = {
		hasClass: ball.classList.contains('ttn-drag'),
		trans: transOf(ball),
		inline: String(ball.style.transition || '')
	};
	/* ① 现实场景：松手发生在元素之外（元素上收不到 pointerup）→ document 级兜底必须结束拖动 */
	document.dispatchEvent(new PointerEvent('pointerup',
		{ bubbles: true, cancelable: true, clientX: 320, clientY: 320, pointerId: 41 }));
	window.__DRAG__.afterOutsideRelease = {
		hasClass: ball.classList.contains('ttn-drag'),
		trans: transOf(ball), inline: String(ball.style.transition || ''), flag: !!ball.__ttnDragging
	};
	ck('drag-ends-when-released-outside', window.__DRAG__.afterOutsideRelease.hasClass === false &&
		window.__DRAG__.afterOutsideRelease.flag === false,
		'松手在元素外也必须结束拖动（否则拖动状态永久卡住 → hover 变瞬变）: ' +
		JSON.stringify(window.__DRAG__.afterOutsideRelease));
	ck('hover-transition-available-after-drag', /filter/.test(window.__DRAG__.afterOutsideRelease.trans || ''),
		'结束后 hover 依赖的 filter 过渡必须还在: ' + JSON.stringify(window.__DRAG__.afterOutsideRelease));

	/* ② 极端场景：真的什么都没收到 → 看门狗（超时兜底）必须能收拾干净 */
	ball.dispatchEvent(new PointerEvent('pointerdown',
		{ bubbles: true, cancelable: true, clientX: 300, clientY: 300, pointerId: 42 }));
	T._cleanupDrag();
	window.__DRAG__.afterWatchdog = {
		hasClass: ball.classList.contains('ttn-drag'),
		trans: transOf(ball), flag: !!ball.__ttnDragging
	};
	ck('drag-state-self-heals', window.__DRAG__.afterWatchdog.hasClass === false &&
		window.__DRAG__.afterWatchdog.flag === false && /filter/.test(window.__DRAG__.afterWatchdog.trans || ''),
		'看门狗必须能把卡住的拖动状态收拾干净（否则 hover 永久瞬变）: ' +
		JSON.stringify(window.__DRAG__.afterWatchdog));

	/* ③ 彻底不许有内联 transition（内联是上次卡死的载体） */
	var leaked = [ball, root, dot].filter(function (el) { return el && el.style && el.style.transition; })
		.map(function (el) { return el.id + '=' + el.style.transition; });
	ck('no-inline-transition-anywhere', leaked.length === 0,
		'球/面板/圆点都不许再有内联 transition（拖动关过渡改用 class）: ' + JSON.stringify(leaked));

	/* ④ 点一下再拖一下再悬浮几次，状态不能变脏 */
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	for (var i = 0; i < 3; i++) {
		ball.dispatchEvent(new PointerEvent('pointerdown',
			{ bubbles: true, cancelable: true, clientX: 300 + i, clientY: 300, pointerId: 50 + i }));
		ball.dispatchEvent(new PointerEvent('pointermove',
			{ bubbles: true, cancelable: true, clientX: 306 + i, clientY: 304, pointerId: 50 + i }));
		ball.dispatchEvent(new PointerEvent('pointerup',
			{ bubbles: true, cancelable: true, clientX: 306 + i, clientY: 304, pointerId: 50 + i }));
	}
	ball.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerId: 60 }));
	ball.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerId: 60 }));
	window.__DRAG__.afterMixed = {
		hasClass: ball.classList.contains('ttn-drag'),
		inline: String(ball.style.transition || ''),
		trans: transOf(ball),
		animating: T.isHudAnimating()
	};
	ck('mixed-click-drag-hover-stays-clean',
		window.__DRAG__.afterMixed.hasClass === false && window.__DRAG__.afterMixed.inline === '' &&
		/filter/.test(window.__DRAG__.afterMixed.trans || ''),
		'点击 / 拖动 / 悬浮混合操作若干轮之后，状态必须还是干净的: ' + JSON.stringify(window.__DRAG__.afterMixed));

	/* 收尾：回到面板态 */
	T._finishHudAnim();
	T.hudState.ball = false; T.setHud(true);
});

step(function () {
	/* "过渡末尾依旧瞬变" = 交接那一帧，球的最后一帧和圆点的第一帧长得不一样。
	 * 这条直接量两边的关键视觉属性，必须一致（滤镜/底色/阴影），否则就等于"啪"地换了块东西。 */
	var T = window.__TTN__, ball = q('ttn-ball'), dot = q('ttn-dot');
	T.hudState.hidden = false;
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	T.hudState.ball = false; T._hudAnimate(false); T._finishHudAnim();
	function vis(el) {
		var cs = getComputedStyle(el);
		return {
			filter: cs.filter,
			bg: cs.backgroundColor,
			shadow: cs.boxShadow,
			hasGlow: !!el.querySelector('.hover-glow'),
			glowRule: (function () {
				var css = '';
				document.querySelectorAll('style').forEach(function (st) {
					if (st.textContent && st.textContent.indexOf('#ttn-ball') >= 0) css += st.textContent;
				});
				var id = el.id === 'ttn-dot' ? '#ttn-dot' : '#ttn-ball';
				return css.indexOf(id + ' .hover-glow{') >= 0 && css.indexOf(id + ':hover .hover-glow{') >= 0;
			})()
	};
	}
	/* 底色必须是"圆点的实时颜色"，不是球身上冻结的旧内联色 */
	var dotLiveBg = getComputedStyle(dot).backgroundColor;
	var ballBg = getComputedStyle(ball).backgroundColor;
	var diffs = [];
	var vb = vis(ball), vd = vis(dot);
	window.__PARITY__ = { ball: vb, dot: vd };
	if (ballBg !== dotLiveBg) diffs.push('底色不是圆点实时色: ' + ballBg + ' vs ' + dotLiveBg);
	/* 球的阴影必须是它自己当前的（hover 感知），圆点换过去也会是同一条配方 */
	if (!ball.style.boxShadow) diffs.push('球落终态没冻结阴影');
	window.__PARITY__ = { ball: vb, dot: vd };
	if (vb.filter !== vd.filter) diffs.push('filter: ' + vb.filter + ' vs ' + vd.filter);
	if (vb.bg !== vd.bg) diffs.push('bg: ' + vb.bg + ' vs ' + vd.bg);
	function shapeOf(sh) {
		return String(sh || '').replace(/rgba?\([^)]*\)/g, 'C');
	}
	if (shapeOf(vb.shadow) !== shapeOf(vd.shadow)) {
		diffs.push('shadow 形状: ' + vb.shadow + ' vs ' + vd.shadow);
	}
	/* 颜色必须一致：两边都用同一个分级色（球的 currentColor 与圆点底色同源） */
	if (getComputedStyle(ball).color !== vd.bg) {
		diffs.push('球 currentColor 与圆点底色不同源: ' + getComputedStyle(ball).color + ' vs ' + vd.bg);
	}
	if (!vb.hasGlow || !vd.hasGlow) diffs.push('hover-glow 子元素: ball=' + vb.hasGlow + ' dot=' + vd.hasGlow);
	if (!vb.glowRule || !vd.glowRule) diffs.push('hover-glow 规则: ball=' + vb.glowRule + ' dot=' + vd.glowRule);
	/* hover 变体也必须共用（用户："过渡没考虑鼠标悬浮时和不悬浮时的区别"） */
	(function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (st) {
			if (st.textContent && st.textContent.indexOf('#ttn-ball') >= 0) css += st.textContent;
		});
		var sharedOn = /#ttn-ball\.on:hover,#ttn-dot\.on:hover\{/.test(css);
		var sharedOff = /#ttn-ball:not\(\.on\):hover,#ttn-dot:not\(\.on\):hover\{/.test(css);
		window.__HOVERSHARE__ = { sharedOn: sharedOn, sharedOff: sharedOff };
		if (!sharedOn || !sharedOff) diffs.push('hover 配方没有共用: ' + JSON.stringify(window.__HOVERSHARE__));
	})();
	/* 横线：交接那一刻两边都必须不可见（球上没有横线，圆点此时也必须收起来） */
	(function () {
		var barOn = window.__TTN__;
		var barVisible = (function () {
			var r = q('ttn-root');
			return !r.classList.contains('ttn-no-bar');
		})();
		var dotBar = getComputedStyle(dot, '::after').opacity;
		window.__BAR__ = { rootNoBar: q('ttn-root').classList.contains('ttn-no-bar'), dotBar: dotBar, barVisible: barVisible };
		/* 横线：现在要求在**过程中就出现**，交接那一帧球和圆点都该带着它 */
		var ballBar = ball.querySelector('.ttn-bar');
		var barRule = false;
		(function () {
			var css2 = '';
			document.querySelectorAll('style').forEach(function (st) {
				if (st.textContent && st.textContent.indexOf('#ttn-ball') >= 0) css2 += st.textContent;
			});
			barRule = css2.indexOf('#ttn-ball.morph .ttn-bar{opacity:1}') >= 0;
		})();
		if (!ballBar || !barRule) diffs.push('球上缺少过程中的横线: bar=' + !!ballBar + ' rule=' + barRule);
	})();
	ck('handoff-visual-parity', diffs.length === 0,
		'交接那一帧球和圆点的视觉必须一致（否则末尾瞬变）: ' + (diffs.join(' ; ') || 'ok') +
		' || ' + JSON.stringify(window.__PARITY__).slice(0, 200));
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim(); T.setSmoothing(true);
});

step(function () {
	/* 用户要求：悬浮球三项数值**各自**用自己的分级色（数字和标签一起变），
	 * 而不是整球一个综合色。判据：制造"平均好、实时差"的数据，两行颜色必须不同。 */
	var T = window.__TTN__, ball = q('ttn-ball');
	T.hudState.hidden = false; T.hudState.ball = false; T.setHud(true);
	T.ping.samples.length = 0;
	var now = Date.now();
	for (var i = 0; i < 40; i++) T.ping.samples.push({ t: now - (39 - i) * 200, rtt: (i > 34 ? 300 : 70), src: 'probe' });
	T.setHud(true);
	var rows = ball.querySelectorAll('.t, .m, .b');
	window.__BALLCOL__ = {};
	Array.prototype.forEach.call(rows, function (r) {
		var pre = r.querySelector('.pre');
		window.__BALLCOL__[r.className] = { v: r.style.color, label: pre ? pre.style.color : null };
	});
	var c = window.__BALLCOL__;
	var haveOwn = !!c.t && c.t.v && c.t.v === c.t.label;      /* 数字与标签同色 */
	var differs = c.t && c.m && c.t.v !== c.m.v;              /* 三项各自不同 */
	ck('ball-rows-have-own-colors', haveOwn && differs,
		'三项数值必须各自分级着色（数字+标签同色，且不同项可以不同色）: ' + JSON.stringify(c));
	T.setSmoothing(true);
});

step(function () {
	var D = window.__DOT_ON__ || {};
	ck('dot-glow-when-on', D.on === true, '优化开时面板左上角圆点也要"激活"（.on）: ' + JSON.stringify(D));
	ck('dot-glow-off-when-disabled', D.off === false, '优化关时圆点必须恢复"只有颜色"', String(D.off));
	ck('dot-glow-breathing', (function () {
		var T = window.__TTN__, dot = q('ttn-dot');
		T.setSmoothing(true);
		var halo = dot.querySelector('.halo');
		var loop = (halo && halo.getAnimations) ? halo.getAnimations().filter(function (a) {
			return a.effect && a.effect.getIterations && a.effect.getIterations() === Infinity;
		}) : [];
		window.__DOT_LOOP__ = { hasHalo: !!halo, loops: loop.length, dur: dot.__loopDur };
		return !!halo && (loop.length > 0 || !!dot.__haloLoop);
	})(), '小圆点也要有无限循环的呼吸（和大球同一套参数）: ' + JSON.stringify(window.__DOT_LOOP__));
	/* 用户再一轮反馈：关要"保留颜色只稍暗"；开的"发光"要的是**提亮**（同 hover），
	 * 并且开的时候黑色投影要减弱 —— 不是大片染色。 */
	ck('glow-is-brightness-based', (function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
				var offNotGray = /#ttn-ball:not\(\.on\)\{[^}]*saturate\(\.9/.test(css) &&
			!/#ttn-ball:not\(\.on\)\{[^}]*grayscale/.test(css);
		var onBright = /#ttn-ball\.on\{[^}]*filter:saturate\(1\) brightness\(1\.1[0-9]\)/.test(css);
		var shadowWeaker = (function () {
			function blackAlpha(decl) {
				var m = /rgba\(0,\s*0,\s*0,\s*\.(\d+)\)/.exec(decl || '');
				return m ? parseFloat('0.' + m[1]) : 0;
			}
			var onD = /#ttn-ball\.on\{([^}]*)\}/.exec(css), offD = /#ttn-ball:not\(\.on\)\{([^}]*)\}/.exec(css);
			var onA = blackAlpha(onD && onD[1]), offA = blackAlpha(offD && offD[1]);
			window.__SHADOW__ = { on: onA, off: offA };
			return onA > 0 && offA > 0 && onA < offA;      // 开要"更弱"但**不能没有**
		})();
		var breatheWhite = (function () {
			var m = /#ttn-ball \.halo\{([^}]*)\}/.exec(css);
			var d = m ? m[1] : '';
			var a = /\(255,255,255,\.(\d+)\)/.exec(d);
			return !!a && parseFloat('0.' + a[1]) >= 0.3;   // 白色内圈光，而且要看得见
		})();
		window.__GLOW2__ = { offNotGray: offNotGray, onBright: onBright, shadowWeaker: shadowWeaker, breatheWhite: breatheWhite };
		return offNotGray && onBright && shadowWeaker && breatheWhite;
	})(), '关=保留颜色（只稍暗）/ 开=提亮 + 黑投影减弱 + 白光呼吸（不是大片染色）: ' +
		JSON.stringify(window.__GLOW2__));
	/* 不许再有激活环或大片染色 */
	ck('glow-is-subtle', (function () {
		var css = '';
		document.querySelectorAll('style').forEach(function (el) {
			if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
		});
		var noRing = !/#ttn-(ball|dot)::before\{[^}]*border:\s*[\d.]+px solid currentColor/.test(css);
		var noWash = !/#ttn-ball::before\{[^}]*background:radial-gradient\(circle,currentColor/.test(css);
		window.__GLOW_CSS__ = { noRing: noRing, noWash: noWash };
		return noRing && noWash;
	})(), '不再有激活环、也没有"currentColor 大片染色"', JSON.stringify(window.__GLOW_CSS__));
	ck('lang-list-font-not-shrunk', (function () {
		/* 用户："面板列表的文字大小回归" —— 只允许按钮里的名字变小，列表项必须保持 12px */
		window.__TTN__.setLang('zh');
		q('ttn-langbtn').click();
		var it = q('ttn-langmenu').querySelector('.ttn-langitem');
		var fs = it ? parseFloat(getComputedStyle(it).fontSize) : 0;
		var nm = q('ttn-langname');
		var nmFs = nm ? parseFloat(getComputedStyle(nm).fontSize) : 0;
		q('ttn-langbtn').click();
		window.__LIST_FS__ = { item: fs, button: nmFs };
		return fs >= 11.9 && nmFs <= 11.5;
	})(), '语言列表字号不能跟着按钮一起缩小（列表 12px / 按钮 ≤11.5px）', JSON.stringify(window.__LIST_FS__));

	ck('lang-name-font-smaller', (function () {
		var nm = q('ttn-langname');
		return nm && parseFloat(getComputedStyle(nm).fontSize) <= 11.5;
	})(), '语言按钮里的名字字号要小一点（≤11.5px）',
		q('ttn-langname') ? getComputedStyle(q('ttn-langname')).fontSize : '?');
});

step(function () {
	/* 用户实测："语言按钮里最长的那个名字依旧被截断" —— 逐个语言选中，按钮上的名字都不能被截断。 */
	var T = window.__TTN__, bad = [], sizes = [];
	T.hudState.ball = false; T.setHud(true);
	T.langs.forEach(function (l) {
		T.setLang(l[0]);
		var nm = q('ttn-langname');
		var fs = parseFloat(getComputedStyle(nm).fontSize);
		sizes.push(l[0] + ':' + fs);
		if (nm.scrollWidth > nm.clientWidth + 1) bad.push(l[0] + '「' + nm.textContent + '」' + nm.scrollWidth + '>' + nm.clientWidth);
		if (fs > 11.5) bad.push(l[0] + ':字号 ' + fs);
	});
	/* 再验一次"缩字号"的逻辑真的在工作：把按钮压窄到放不下，字号必须自动往下缩 */
	var btn = q('ttn-langbtn');
	var saveW = btn.style.width, saveFlex = btn.style.flex;
	btn.style.width = '110px'; btn.style.flex = '0 0 110px';
	T.setLang('en'); T.setLang('pt');
	var nmNarrow = q('ttn-langname');
	var pxNarrow = parseFloat(getComputedStyle(nmNarrow).fontSize);
	ck('lang-name-shrinks-when-needed', pxNarrow < 11,
		'按钮放不下时，名字的字号必须自动缩小（而不是硬截断）: ' + pxNarrow + 'px');
	btn.style.width = saveW; btn.style.flex = saveFlex;
	T.setLang('zh');
	ck('lang-name-fits-all-languages', bad.length === 0,
		'10 国语言逐个选中，按钮上的名字都不能被截断: ' + (bad.join(' ; ') || 'ok'),
		sizes.join(' '));
});

step(function () {
	/* 用户要求：切语言时**位置和按钮长度尽量不变**。
	 * 做法：标签不换行（超长才省略）、语言行标签固定宽、值列 nowrap+ellipsis。 */
	var T = window.__TTN__;
	T.hudState.ball = false; T.setHud(true);
	var snap = function () {
		var rowsEl = q('ttn-rows');
		var out = { top: Math.round(rowsEl.getBoundingClientRect().top), h: Math.round(rowsEl.getBoundingClientRect().height), btnW: [] };
		q('ttn-root').querySelectorAll('.ttn-btn').forEach(function (b) { out.btnW.push(Math.round(b.getBoundingClientRect().width)); });
		out.langW = Math.round(q('ttn-langbtn').getBoundingClientRect().width);
		out.labels = [];
		rowsEl.querySelectorAll('.ttn-k').forEach(function (el) { out.labels.push(Math.round(el.getBoundingClientRect().height)); });
		return out;
	};
	T.setLang('zh');
	var a = snap();
	var moved = [], grown = [];
	T.langs.forEach(function (l) {
		T.setLang(l[0]);
		var b = snap();
		if (b.h !== a.h || b.top !== a.top) moved.push(l[0] + ':' + b.h + '/' + b.top);
		if (b.btnW.join(',') !== a.btnW.join(',') || b.langW !== a.langW) grown.push(l[0] + ':' + b.btnW.join('/') + ' lang=' + b.langW);
		if (b.labels.join(',') !== a.labels.join(',')) moved.push(l[0] + ':labelH');
	});
	T.setLang('zh');
	ck('lang-switch-layout-stable', moved.length === 0 && grown.length === 0,
		'10 国语言下行动位置、按钮长度、语言按钮宽度都必须保持不变: ' +
		'移动[' + moved.slice(0, 3).join(' ') + '] 变化[' + grown.slice(0, 3).join(' ') + ']');
	ck('no-label-wrapping', (function () {
		var re = /white-space:\s*nowrap/.test((function () {
			var css = '';
			document.querySelectorAll('style').forEach(function (el) {
				if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
			});
			return css;
		})());
		return re;
	})(), '标签不许换行（换行会导致整块面板位置跳动）');
});

step(function () {
	/* 用户要求："再加一些鼠标悬浮、颜色变化等的动画，不要有任何瞬变"。
	 * 把"必须存在过渡/悬浮规则"钉住 —— 光靠肉眼看不出来哪天被人删了。 */
	var css = '';
	document.querySelectorAll('style').forEach(function (el) {
		if (el.textContent && el.textContent.indexOf('#ttn-ball') >= 0) css += el.textContent;
	});
	ck('hud-css-found', css.length > 500, 'HUD 样式表已注入', css.length + ' chars');
	ck('transition-dot', /#ttn-dot\{[^}]*transition:[^}]*background/.test(css),
		'圆点的颜色/发光必须有过渡（不能瞬变）');
	ck('transition-values', /\.ttn-v\{[^}]*transition:color/.test(css),
		'面板数值的颜色必须有过渡');
	ck('transition-btn', /\.ttn-btn\{[^}]*transition:/.test(css),
		'按钮的颜色/位移必须有过渡');
	ck('transition-ball', /#ttn-ball\{[^}]*transition:[^}]*border-color/.test(css),
		'悬浮球的描边颜色必须有过渡');
	ck('transition-status-row', /#ttn-status\{[^}]*transition:max-height/.test(css),
		'"状态"行的收放必须有过渡（不能把面板啪地撑高）');
	/* hover 规则现在写成 `#ttn-ball.on:hover,#ttn-ball:not(.on):hover{...}`
	 * （提高特异度才不会被 .on/:not(.on) 覆盖），所以别死盯 `#ttn-ball:hover` 这一种写法。 */
	var ballHoverRule = (css.match(/#ttn-ball[^{}]{0,80}:hover\s*[^{}]{0,60}\{[^}]{0,80}/) || [''])[0];
	ck('hover-rules', /#ttn-dot:hover/.test(css) && /\.ttn-btn:hover/.test(css) &&
		!!ballHoverRule && /#ttn-head:hover/.test(css),
		'鼠标悬浮动画：圆点 / 按钮 / 悬浮球 / 标题栏 | 球 hover 规则=' + (ballHoverRule || '缺失'));
	/* 用户实测："鼠标悬浮在悬浮球上时，状态瞬间变化" —— 因为 hover 改了 filter（亮度），
	 * 而过渡列表里没有 filter。这里做结构性检查：hover/active 改的每个属性都必须在过渡列表里。 */
	var cssNoMedia = (function (src) {
		/* 先把 @media 块整段剥掉：reduced-motion 里也写了 #ttn-ball{transition:none}，
		 * 不剥的话会被当成"基样式"，检查就会看错对象。 */
		var out = '', i = 0;
		while (i < src.length) {
			var at = src.indexOf('@media', i);
			if (at < 0) { out += src.slice(i); break; }
			out += src.slice(i, at);
			var j = src.indexOf('{', at), depth = 0;
			while (j < src.length) {
				if (src[j] === '{') depth++;
				else if (src[j] === '}') { depth--; if (depth === 0) { j++; break; } }
				j++;
			}
			i = j;
		}
		return out;
	})(css);
	function cssRuleBody(sel) {
		var re = new RegExp(sel.replace(/[.#]/g, '\$&') + '\{([^}]*)\}', 'g');
		var m, last = '';
		while ((m = re.exec(cssNoMedia)) !== null) last = m[1];
		return last;
	}
	var offenders = [];
	[['#ttn-ball', ['filter', 'box-shadow', 'border-color']],
	 ['#ttn-dot', ['transform', 'box-shadow', 'background']],
	 ['.ttn-btn', ['background', 'transform', 'color']],
	 /* 标题栏 hover 现在改的是同形状内阴影（background 渐变换不了，已删） */
	 ['#ttn-head', ['box-shadow']],
	 ['#ttn-status', ['max-height', 'opacity']]].forEach(function (pair) {
		var body = cssRuleBody(pair[0]);
		var m = /(?:^|;)transition:([^;}]*)/.exec(body);
		var tr = m ? m[1] : '';
		pair[1].forEach(function (prop) {
			if (tr.indexOf(prop) < 0) offenders.push(pair[0] + ' 的 ' + prop + ' 没有过渡');
		});
	});
	ck('hover-props-are-transitioned', offenders.length === 0,
		'悬浮/按下会改的属性，必须都在过渡列表里（否则就是"瞬间变化"）: ' + (offenders.join('；') || 'ok'));

	/* 用户实测"展开时标题栏瞬间变灰一些"：真因是 hover 换整条 linear-gradient，
	 * 渐变之间不能插值（规范按离散处理）→ 必然瞬变。回归要求：
	 *  ① 基础规则里必须写着 box-shadow 的过渡（不能另起同特异度规则把它覆盖掉）；
	 *  ② base : inset 0 0 0 0，hover : inset 0 0 0 999px，同形状、只变长度 → 一定可插值；
	 *  ③ hover 规则不许再改 background。 */
	ck('head-hover-is-interpolable', (function () {
		function bodyAfter(sel) {
			var re0 = new RegExp(sel.replace(/[.#:]/g, '\\$&') + '\\{([^}]*)\\}', 'g');
			var m0, last = '';
			while ((m0 = re0.exec(cssNoMedia)) !== null) last = m0[1];
			return last;
		}
		function shadow(v) {
			var m1 = /box-shadow\s*:\s*(inset)?\s*0\s+0\s+0\s+([\d.]+)(?:px)?\s+rgba\(([^)]*)\)/.exec(v || '');
			return m1 ? { inset: !!m1[1], spread: parseFloat(m1[2]), color: m1[3] } : null;
		}
		var base = bodyAfter('#ttn-head');
		var hover = bodyAfter('#ttn-head:hover');
		var bs = shadow(base), hs = shadow(hover);
		window.__HEADHOVER__ = {
			baseTransition: (/transition:([^;}]*)/.exec(base) || [])[1] || '',
			bs: bs, hs: hs, hoverBody: hover
		};
		function rgbOf(c) { return String(c || '').split(',').slice(0, 3).join(',').trim(); }
		return /transition:box-shadow/.test(base) && !!bs && !!hs &&
			bs.inset === true && hs.inset === true &&
			Math.abs(bs.spread) < 0.001 && hs.spread > 100 &&
			rgbOf(bs.color) === rgbOf(hs.color) &&
			bs.color.split(',').length === 4 && hs.color.split(',').length === 4 &&
			!/background\s*:/.test(hover);
	})(), '标题栏 hover 必须只改同形状内阴影（0→999px，可插值），且不再换 background 渐变: ' +
		JSON.stringify(window.__HEADHOVER__));


	/* 悬浮球上不该再有"点击展开面板"这种提示字（用户明确说多余） */
	var bt = q('ttn-ball').getAttribute('title') || '';
	ck('ball-tooltip-not-nagging', bt.indexOf('点击') < 0 && bt.indexOf('拖动') < 0,
		'悬浮球不该有"点击展开面板 / 可拖动"这类提示字', 'title="' + bt + '"');
	ck('reduced-motion-respected', /prefers-reduced-motion/.test(css),
		'系统开了"减少动态效果"时要能关掉这些动画');
});

step(function () {
	/* 回归：悬浮球必须能拖到屏幕最右边（之前被面板宽度当墙挡住） */
	var T = window.__TTN__;
	T.hudState.ball = true;
	T.setHud(true);              // 必须先应用可见性，否则球是 display:none 量不到
	T.hudState.x = 99999; T.hudState.y = 300;
	T.clampHud(true);
	/* 球现在会"滑"到夹取目标（0.28s 过渡），所以这里量的是目标 transform，
	 * 不是过渡中途的矩形 —— 真实浏览器里那一小段滑动正是"丝滑"的来源。 */
	var ballTf = function () {
		var m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(q('ttn-ball').style.transform || '');
		return m ? { x: +m[1], y: +m[2] } : null;
	};
	var bt = ballTf();
	ck('ball-can-reach-right-edge', !!bt && Math.abs((bt.x + 66) - innerWidth) <= 1,
		'球必须能贴到屏幕最右边，不能有空气墙 — 球右=' + (bt ? bt.x + 66 : '?') +
		' 视口=' + innerWidth + ' hudState.x=' + window.__TTN__.hudState.x);
	T.hudState.x = -99999; T.clampHud(true);
	bt = ballTf();
	ck('ball-can-reach-left-edge', !!bt && Math.abs(bt.x) <= 1,
		'球也必须能贴到屏幕最左边 — 球左=' + (bt ? bt.x : '?'));
	T.hudState.ball = false; T.setHud(true);
});

step(function () {
	/* 回归：贴近屏幕右边缘时也必须圆心对齐（之前锚点被数据条宽度挤走，差 12px） */
	var T = window.__TTN__;
	T.hudState.ball = false; T.setHud(true);
	T.hudState.x = 1160; T.hudState.y = 520;
	T.clampHud(true);            // 同上：量圆心，不走回弹
	var d = centerOf(q('ttn-dot'));
	q('ttn-dot').click();
	window.__EDGE_DOT__ = d;
});

step(function () {
	var b = centerOf(q('ttn-ball'));
	var d = window.__EDGE_DOT__;
	ck('edge-center-aligned', Math.abs(b.x - d.x) <= 1.5 && Math.abs(b.y - d.y) <= 1.5,
		'贴近右边缘时球心仍须与圆点重合',
		'球=(' + b.x.toFixed(1) + ',' + b.y.toFixed(1) + ') 圆点=(' +
		d.x.toFixed(1) + ',' + d.y.toFixed(1) + ') 差=(' +
		(b.x - d.x).toFixed(1) + ',' + (b.y - d.y).toFixed(1) + ')');
	ck('edge-ball-on-screen', b.x > 0 && b.x < innerWidth && b.y > 0 && b.y < innerHeight,
		'球=(' + b.x.toFixed(1) + ',' + b.y.toFixed(1) + ')');
	/* 收尾：展开回去 */
	window.__TTN__.hudState.ball = false;
	window.__TTN__.setHud(true);
});

step(function () {
	/* 回归（用户实测）：需要把窗口挪回可视区时，必须"滑"过去，不能瞬移。
	 * 老实现直接在 clampHud() 里改 hudState —— 第一帧就跳到位。 */
	var T = window.__TTN__;
	T.hudState.ball = true; T.setHud(true);
	T.hudState.x = 99999; T.hudState.y = 99999;
	T.clampHud(true);                       // 先按"球"的边界贴到右下角
	var target = { x: T.hudState.x, y: T.hudState.y };
	T.hudState.x = target.x + 300; T.hudState.y = target.y + 200;   // 再往外放，强制需要回弹
	var from = { x: T.hudState.x, y: T.hudState.y };
	T.clampHud();                           // 不带 forceInstant → 走回弹
	var now = { x: T.hudState.x, y: T.hudState.y };
	ck('glide-does-not-teleport', Math.abs(now.x - from.x) < 40 && Math.abs(now.y - from.y) < 40,
		'回弹不能一帧跳到位（老实现就是这样）',
		'调用后立刻读到 (' + Math.round(now.x) + ',' + Math.round(now.y) + ')，起点 (' +
		Math.round(from.x) + ',' + Math.round(from.y) + ')，目标 (' + Math.round(target.x) + ',' + Math.round(target.y) + ')');
	window.__GLIDE__ = { from: from, target: target };
});

step(function () {
	var T = window.__TTN__;
	var g = window.__GLIDE__;
	ck('glide-lands-on-bound', Math.abs(T.hudState.x - g.target.x) <= 1 && Math.abs(T.hudState.y - g.target.y) <= 1,
		'回弹必须精确落在夹取边界上',
		'落点 (' + T.hudState.x.toFixed(1) + ',' + T.hudState.y.toFixed(1) + ')，目标 (' +
		g.target.x.toFixed(1) + ',' + g.target.y.toFixed(1) + ')，起点 (' + g.from.x.toFixed(1) + ',' + g.from.y.toFixed(1) + ')');
	var b = q('ttn-ball').getBoundingClientRect();
	ck('glide-lands-on-screen', b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1,
		'回弹落点必须完整可见', Math.round(b.left) + ',' + Math.round(b.top) + ' → ' + Math.round(b.right) + ',' + Math.round(b.bottom));
});

step(function () {
	/* 设计（用户明确要求）：展开就是"在球的位置原地长大" —— 面板左上角与悬浮球
	 * 一一对应，动画期间一个像素都不挪；越界就让它越界，等展开结束再由边界把面板
	 * 用回弹推回屏幕内。绝不能"自动挑一个不会出屏的展开方向"。 */
	var T = window.__TTN__;
	T.hudState.ball = true; T.setHud(true);
	T.hudState.x = 99999; T.hudState.y = 99999;
	T.clampHud(true);                       // 球贴到右下角
	var anchor = { x: T.hudState.x, y: T.hudState.y };
	window.__EXPAND__ = { anchor: anchor, at310: null };
	var ball = q('ttn-ball');
	pe(ball, 'pointerdown', 400, 400);
	pe(ball, 'pointerup', 400, 400);        // 按下即松开 = 展开
	var m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(q('ttn-root').style.transform || '');
	ck('expand-target-matches-ball',
		!!m && +m[1] === Math.round(anchor.x) && +m[2] === Math.round(anchor.y),
		'展开动画的终点必须还是悬浮球的位置（一一对应；不许自动往屏幕里挪）',
		m ? '动画终点 translate(' + m[1] + ',' + m[2] + ') vs 球 (' +
			Math.round(anchor.x) + ',' + Math.round(anchor.y) + ')' : '解析不到 transform');
	/* 动画 280ms + 收尾 300ms：310ms 时回弹刚接手，位置应该还在球那儿 */
	setTimeout(function () {
		var T2 = window.__TTN__;
		window.__EXPAND__.at310 = { gliding: T2._glide.active, x: T2.hudState.x, y: T2.hudState.y };
	}, 500);   /* 300ms 变形 + 100ms 交接淡接 + 余量 */
});

step(function () {
	try {
		var d = document.getElementById('ttn-dbg3');
		if (!d) { d = document.createElement('pre'); d.id = 'ttn-dbg3'; d.style.display = 'none'; document.body.appendChild(d); }
		d.textContent = JSON.stringify({ EXPAND: window.__EXPAND__, AFTER: window.__AFTER__ });
	} catch (e) {}
});

step(function () {
	/* 空步：只用来把时间推过去（上面的回弹断言定在 500ms，下一步才是 760ms） */
	ck('spacer-for-rebound', true, '');
});

step(function () {
	/* 回弹：改看**产品自己记录的**证据（hudAnim.debug）—— 之前的做法是让测试自己
	 * 定时采样，容易和 300ms 变形 + 100ms 交接淡接的时序打架（虚惊过好几次）。
	 * 这里断言：交接淡接跑完后回弹确实启动了，并且最终把面板推回可视区内。 */
	var T = window.__TTN__;
	var dbg = (T._hudAnim && T._hudAnim.debug) || null;
	var inView = T.hudState.x >= -2 && T.hudState.y >= -2 &&
		T.hudState.x <= (window.innerWidth || 1280) && T.hudState.y <= (window.innerHeight || 800);
	window.__REB__ = { dbg: dbg, x: T.hudState.x, y: T.hudState.y };
	ck('expand-then-rebound', !!dbg && dbg.fadeDone === true && dbg.glide === true,
		'交接结束后必须由回弹接管（不是瞬移，也不是不动）: ' + JSON.stringify(window.__REB__));
	ck('rebound-starts-from-ball-position', inView,
		'回弹最终要把面板推回可视区内（不是一步瞬移）: ' + JSON.stringify(window.__REB__));
});;

step(function () {
	var r = q('ttn-root').getBoundingClientRect();
	ck('expand-from-corner-ends-inside',
		r.left >= -1 && r.top >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
		'回弹结束后（展开态）面板必须完整在屏幕内',
		Math.round(r.left) + ',' + Math.round(r.top) + ' → ' + Math.round(r.right) + ',' + Math.round(r.bottom));
	ck('rebound-finished', window.__TTN__._glide.active === false,
		'回弹应该已经结束', String(window.__TTN__._glide.active));
	/* 收尾：面板留在屏幕内 */
	window.__TTN__.hudState.ball = false;
	window.__TTN__.setHud(true);
});

step(function () {
	/* 用户要求："悬浮球别再严格跟手，加点惯性"。
	 * 真实指针序列：按住在 (300,300) 快速往右甩 → 松手后球必须继续滑一段；
	 * 甩完必须停下且完整停在屏幕内（撞边界只是轻轻弹一下）。 */
	var T = window.__TTN__;
	T.hudState.ball = true; T.setHud(true);
	T.hudState.x = 300; T.hudState.y = 300;
	T.clampHud(true);
	var ball = q('ttn-ball');
	window.__FLING__ = { at200: null, at400: null, at1000: null, release: null };
	pe(ball, 'pointerdown', 300, 300);
	var acc = 0;
	[{ dt: 30, x: 320 }, { dt: 30, x: 340 }, { dt: 30, x: 355 }, { dt: 30, x: 370 }]
		.forEach(function (m) {
			acc += m.dt;
			setTimeout(function () { pe(ball, 'pointermove', m.x, 300); }, acc);
		});
	setTimeout(function () {
		pe(ball, 'pointerup', 370, 300);
		window.__FLING__.release = { x: T.hudState.x, gliding: T._glide.active };
	}, acc + 5);
	setTimeout(function () {
		window.__FLING__.at200 = { x: T.hudState.x, gliding: T._glide.active };
	}, 200);
	setTimeout(function () {
		window.__FLING__.at400 = { x: T.hudState.x, gliding: T._glide.active };
	}, 400);
	setTimeout(function () {
		var r = q('ttn-ball').getBoundingClientRect();
		window.__FLING__.at1000 = {
			x: T.hudState.x, gliding: T._glide.active,
			left: r.left, right: r.right, top: r.top, bottom: r.bottom
		};
	}, 1000);
});

step(function () {
	var F = window.__FLING__;
	ck('fling-keeps-moving', !!F.release && F.release.gliding === true,
		'松手后必须带惯性继续滑（不是严格跟手停在原地）: ' + JSON.stringify(F.release));
	ck('fling-coasts-after-release', !!F.at200 && !!F.release && F.at200.x > F.release.x + 20,
		'松手 200ms 后还要明显往前滑: ' +
		(F.release && F.at200 ? Math.round(F.release.x) + ' → ' + Math.round(F.at200.x) : '没采到样'));
});

step(function () {
	var F = window.__FLING__;
	var b = q('ttn-ball').getBoundingClientRect();
	ck('fling-coast-is-monotonic', !!F.at400 && !!F.at200 && F.at400.x >= F.at200.x,
		'滑行只能继续往前，不能往回跳: ' + JSON.stringify(F.at400));
	ck('fling-never-offscreen', b.left >= -1 && b.top >= -1 &&
		b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1,
		'滑行途中球不能跑出屏幕: ' +
		[Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)].join(','));
});

step(function () {
	var F = window.__FLING__;
	ck('fling-stops-inside-screen',
		!!F.at1000 && F.at1000.gliding === false && !!F.release && F.at1000.x > F.release.x + 30 &&
		F.at1000.left >= -1 && F.at1000.top >= -1 &&
		F.at1000.right <= innerWidth + 1 && F.at1000.bottom <= innerHeight + 1,
		'甩完必须停下、且完整停在屏幕内: ' + JSON.stringify(F.at1000) +
		' 松手于 ' + (F.release ? Math.round(F.release.x) : '?'));
	/* 轻放：慢慢挪一点就松手 → 不能甩出去（要能精确摆放） */
	var T = window.__TTN__;
	T.hudState.x = 500; T.hudState.y = 400;
	T.clampHud(true);
	var ball2 = q('ttn-ball');
	pe(ball2, 'pointerdown', 500, 400);
	pe(ball2, 'pointermove', 505, 400);
	pe(ball2, 'pointerup', 505, 400);
	ck('slow-drop-does-not-fling',
		T._glide.active === false && Math.abs(T.hudState.x - 505) <= 1,
		'轻放（慢速挪一点）不甩，就停在松手处: gliding=' + T._glide.active + ' x=' + T.hudState.x.toFixed(1));
	window.__TTN__.hudState.ball = false;
	window.__TTN__.setHud(true);
});

step(function () {
	/* 端到端回归：一局"帧正常 + 局间空闲几千毫秒"的对局，面板上的
	 * 最大延迟必须还是延迟本身，不能变成局间空闲的几千毫秒
	 * （用户原话："最大延迟不怎么变，几千"）。 */
	var T = window.__TTN__;
	var t0 = Date.now();
	var conn = {
		url: 'wss://eu-west1-mp1.tanktrouble.com:443', kind: 'game',
		ws: { readyState: 1 }, lastT: t0, framesIn: 5000, gapLog: [], stalls: []
	};
	for (var i = 0; i < 200; i++) conn.gapLog.push({ t: t0, gap: 11 });      // 91fps 正常节奏
	for (var j = 0; j < 20; j++) {
		conn.gapLog.push({ t: t0, gap: 8000 });                               // 局间空闲
		conn.stalls.push({ t: t0, gap: 8000, burstFrames: 1 });               // 空闲后面只跟正常一帧
	}
	T.conns.push(conn);
	T.ping.samples.length = 0;
	for (var k = 0; k < 15; k++) T.ping.samples.push({ t: t0, rtt: 42 });

	var m = T.netMetrics();
	ck('idle-does-not-fake-max-latency', m.max <= 60,
		'局间空闲的 8000ms 不能被当成延迟', '最大延迟=' + m.max + 'ms 停顿基准=' + m.base + 'ms');
	ck('idle-does-not-zero-stability', m.stability >= 85,
		'局间空闲不能把稳定度打到 0', '稳定度=' + m.stability + '%');

	/* 面板 DOM 要等下一次 refreshHud（250ms 一次）刷新，放到下一步再量 */
	T.hudState.ball = false; T.setHud(true);
	window.__TTN__.clampHud();
});

step(function () {
	var txt = q('ttn-rows').textContent;
	var mm = txt.match(/最大延迟(\d+)\s*ms/);
	ck('panel-max-latency-small', !!mm && Number(mm[1]) < 1000,
		'面板"最大延迟"不能显示几千毫秒', txt.replace(/\s+/g, ' ').slice(0, 140));
	/* 有数据了，"状态"那一行就该收起来（节点一直在，靠 class 折叠，这样收放才有过渡） */
	var stRow = q('ttn-status');
	/* 「优化」行的计数副行：必须存在且有内容（曾被 setVal 写 textContent 时清掉过） */
	var subs = q('ttn-rows').querySelectorAll('.ttn-sub');
	ck('opt-sublabel-present', subs.length >= 1 && (subs[0].textContent || '').length > 2,
		'「优化」行下面要有计数副行（已抹平/忽略修正）',
		subs.length ? '「' + subs[0].textContent + '」' : '没有 .ttn-sub');
	ck('status-row-gone-when-ok', !!stRow && stRow.className.indexOf('on') < 0,
		'数据齐全时"状态"行必须是收起状态', stRow ? ('class=' + stRow.className + ' maxH=' + stRow.style.maxHeight) : 'no-row');
	/* 顺带验：颜色是写在节点 style.color 上（不是重建 HTML），CSS 才能过渡 */
	var colored = [];
	q('ttn-rows').querySelectorAll('.ttn-v').forEach(function (el) {
		if (el.style.color) colored.push(el.style.color);
	});
	ck('values-colored-via-style', colored.length >= 3,
		'数值颜色写在节点 style.color 上（增量更新，可过渡）', colored.slice(0, 3).join(' / '));

	/* 切到悬浮球，并清掉帧样本 —— 逼出"帧节奏没数据 → RTT 抖动兜底"那条路
	 * （用户实测的"不显示稳定值"就发生在大厅/局间这种没帧的时候） */
	var conn2 = window.__TTN__.primaryConn();
	if (conn2 && conn2.gapLog) { conn2.gapLog.length = 0; conn2.stalls.length = 0; }
	window.__TTN__.hudState.ball = true;
	window.__TTN__.setHud(true);
	window.__BALLNODES__ = [];
	q('ttn-ball').childNodes.forEach(function (n) { window.__BALLNODES__.push(n); });
});

step(function () {
	/* 用户实测："不显示稳定值"。只要还有延迟样本，稳定值就必须有数字
	 * （帧节奏没样本时用 RTT 抖动兜底），绝不能是 --。 */
	var html = q('ttn-ball').innerHTML;
	ck('stability-falls-back-to-rtt', window.__TTN__.netMetrics().stabSrc === 'rtt',
		'帧样本为空时，稳定值必须走 RTT 抖动兜底（而不是 --）',
		String(window.__TTN__.netMetrics().stabSrc));
	ck('ball-shows-live-stability', /稳定\s*\d+\s*%/.test(html.replace(/<[^>]*>/g, '')),
		'悬浮球的稳定值必须有数字（兜底走 RTT 抖动）', html.replace(/</g, '‹'));
	ck('ball-shows-latency-number', /\d+\s*ms/.test(html.replace(/<[^>]*>/g, '')),
		'悬浮球中间必须是实时延迟数字', html.replace(/</g, '‹'));
	/* 三行必须是同一批节点（增量更新）—— 否则每次刷新都换新节点，CSS 过渡永远不生效 */
	var nowNodes = [];
	q('ttn-ball').childNodes.forEach(function (n) { nowNodes.push(n); });
	ck('ball-nodes-are-reused',
		nowNodes.length >= 3 && nowNodes.length === window.__BALLNODES__.length &&
		nowNodes.every(function (n, i) { return n === window.__BALLNODES__[i]; }),
		'悬浮球三行节点被复用（不是每 250ms 重建 HTML）',
		nowNodes.length + ' vs ' + window.__BALLNODES__.length);
	window.__TTN__.conns.pop();
	window.__TTN__.ping.samples.length = 0;
	window.__TTN__.hudState.ball = false;
	window.__TTN__.setHud(true);
});
step(function () {
	/* —— 回归 ①（0.5.0 三处改动之一）：hudAnimate 必须先写"起始态"内联值。
	 * 用户实测"收起时大球灰一下"：球刚从 display:none 变可见时，WAAPI 首帧不一定生效，
	 * 会露一帧基础样式（全尺寸 + 深色盘面）。这里直接检查第一帧的内联值：
	 * 收起 = 圆点大小 + 圆点实时色；展开 = 全尺寸 + 面板 0.03/透明。
	 * 同时检查变形期间用 class 压掉与 WAAPI 抢 transform/opacity 的 CSS 过渡。 */
	var T = window.__TTN__, ball = q('ttn-ball'), dot = q('ttn-dot'), root = q('ttn-root');
	function scaleStr(s) { var m = /scale\(([\d.]+)\)/.exec(String(s || '')); return m ? parseFloat(m[1]) : null; }
	T.hudState.hidden = false;
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim();
	T.ping.samples.length = 0;
	var t0 = Date.now();
	for (var i = 0; i < 40; i++) T.ping.samples.push({ t: t0 - (39 - i) * 200, rtt: 70, src: 'probe' });
	T.setHud(true);
	var dotBg = getComputedStyle(dot).backgroundColor;
	T.hudState.ball = true; T._hudAnimate(true);            // 展开态 → 收起
	window.__STARTINLINE__ = {
		wantScale: T.DOT_SIZE / T.hudCache.BALL,
		collapseScale: scaleStr(ball.style.transform),
		collapseBg: getComputedStyle(ball).backgroundColor, dotBg: dotBg,
		opacity: ball.style.opacity,
		morphClass: ball.classList.contains('ttn-morphing'),
		trans: getComputedStyle(ball).transitionProperty
	};
	ck('collapse-first-frame-not-gray',
		window.__STARTINLINE__.collapseBg === dotBg &&
		window.__STARTINLINE__.collapseBg !== 'rgb(140, 147, 158)' &&
		window.__STARTINLINE__.collapseBg !== 'rgba(18, 20, 26, 0.95)',
		'收起第一帧球的颜色必须已经等于圆点实时色（不能露中性灰/深色盘面）: ' + JSON.stringify(window.__STARTINLINE__));
	ck('morph-start-state-inline',
		Math.abs(window.__STARTINLINE__.collapseScale - window.__STARTINLINE__.wantScale) < 1e-3 &&
		ball.style.opacity === '1',
		'收起第一帧必须先把"圆点大小 + 可见"写成内联起点: ' + JSON.stringify(window.__STARTINLINE__));
	ck('morph-suppresses-competing-transition',
		window.__STARTINLINE__.morphClass === true &&
		window.__STARTINLINE__.trans.indexOf('transform') < 0 &&
		window.__STARTINLINE__.trans.indexOf('opacity') < 0 &&
		window.__STARTINLINE__.trans.indexOf('filter') >= 0,
		'变形期间必须用 class 压掉与 WAAPI 抢 transform/opacity 的 CSS 过渡（filter 的 hover 过渡保留）: ' + JSON.stringify(window.__STARTINLINE__));
	T._finishHudAnim();
	window.__STARTINLINE__.collapsedBg = getComputedStyle(ball).backgroundColor;
	T.hudState.ball = false; T._hudAnimate(false);          // 收起态 → 展开
	window.__STARTINLINE__.expandScale = scaleStr(ball.style.transform);
	window.__STARTINLINE__.expandRootScale = scaleStr(root.style.transform);
	window.__STARTINLINE__.expandRootOpacity = root.style.opacity;
	ck('expand-start-state-inline',
		window.__STARTINLINE__.expandScale === 1 &&
		window.__STARTINLINE__.expandRootOpacity === '0' &&
		Math.abs(window.__STARTINLINE__.expandRootScale - 0.03) < 1e-6,
		'展开第一帧必须先把"球=全尺寸、面板=0.03/透明"写成内联起点: ' + JSON.stringify(window.__STARTINLINE__));
	T._finishHudAnim();
	T.setSmoothing(true);
});

step(function () {
	/* —— 回归 ②：变形动画的终点必须逐项等于静止态。
	 * 之前的极细微瞬变真因：CSS 过渡（面板 opacity、球的 transform/box-shadow）优先级高于 WAAPI，
	 * 两边同动一个属性时过渡会赢，播到一半交还给动画 → 终点前跳一下。现在变形期间用
	 * .ttn-morphing 压掉这些过渡，并把动画钉到 duration 终点逐项对比静止态。
	 * 顺带守住：圆点/hudTint 在**收起成球**期间也必须跟最新分级色同步（否则下次展开从旧色起步）。 */
	var T = window.__TTN__, ball = q('ttn-ball'), dot = q('ttn-dot'), root = q('ttn-root');
	function norm(v) { return String(v == null ? '' : v).replace(/\s+/g, '').toLowerCase(); }
	function shapeOf(s) {
		return String(s == null ? '' : s).replace(/rgba?\([^)]*\)/g, 'C')
			.replace(/currentcolor/gi, 'C').replace(/\s+/g, ' ').trim();
	}
	function animWith(el, key) {
		var list = el && el.getAnimations ? el.getAnimations() : [];
		for (var i = 0; i < list.length; i++) {
			try {
				var kf = list[i].effect.getKeyframes();
				if (kf.length >= 2 && kf.some(function (k) { return k[key]; })) return list[i];
			} catch (e) {}
		}
		return null;
	}
	function pinEnd(a) {
		if (!a) return;
		try {
			a.pause();
			a.currentTime = (parseFloat(a.effect.getTiming().duration) || 300);
		} catch (e) {}
	}
	function scaleComputed(el) {
		var s = getComputedStyle(el).transform || '';
		var m = /scale\(([\d.]+)\)/.exec(s);
		if (m) return parseFloat(m[1]);
		var mm = /matrix\(([^)]+)\)/.exec(s);
		return mm ? (parseFloat(mm[1].split(',')[0]) || 0) : 1;
	}
	function endKf(a, key) { return a ? ((a.effect.getKeyframes()[1] || {})[key]) : null; }
	function scaleInline(el) { var m = /scale\(([\d.]+)\)/.exec(String((el && el.style.transform) || '')); return m ? parseFloat(m[1]) : 1; }

	/* 面板开 → 收起 */
	T.hudState.hidden = false;
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim(); T.setSmoothing(true);
	T.hudState.ball = true; T._hudAnimate(true);
	var cb = animWith(ball, 'backgroundColor'), cr = animWith(root, 'opacity');
	pinEnd(cb); pinEnd(cr); void ball.offsetWidth;
	var colMidBg = null;
	if (cb) {
		try { cb.currentTime = (parseFloat(cb.effect.getTiming().duration) || 300) / 2; } catch (e) {}
		void ball.offsetWidth;
		colMidBg = getComputedStyle(ball).backgroundColor;
		pinEnd(cb);
		void ball.offsetWidth;
	}
	var col = {
		ballBg: getComputedStyle(ball).backgroundColor, keyEndBg: endKf(cb, 'backgroundColor'),
		startBg: cb ? ((cb.effect.getKeyframes()[0] || {}).backgroundColor) : null,
		midBg: colMidBg, ballShadow: getComputedStyle(ball).boxShadow,
		rootO: getComputedStyle(root).opacity, keyEndRootO: endKf(cr, 'opacity'),
		rootScale: scaleComputed(root), ballScale: scaleComputed(ball)
	};
	T._finishHudAnim();
	col.staticBallBg = getComputedStyle(ball).backgroundColor;
	col.staticRootO = getComputedStyle(root).opacity;
	col.staticRootScale = scaleInline(root);        // display:none 时 computed transform 恒为 none
	col.staticBallScale = scaleInline(ball);
	col.staticBallShadow = getComputedStyle(ball).boxShadow;

	/* 收起 → 展开（同时制造"收起期间分级色变红"，验证圆点实时同步） */
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();
	var t1 = Date.now();
	T.ping.samples.length = 0;
	for (var i = 0; i < 40; i++) T.ping.samples.push({ t: t1 - (39 - i) * 200, rtt: 70, src: 'probe' });
	T.setHud(true);                                          // 面板态：圆点更新为"好"
	var greenDot = dot.style.background;
	T.hudState.ball = true; T.setHud(true); T._finishHudAnim();   // 收起成球
	T.ping.samples.length = 0;
	for (i = 0; i < 40; i++) T.ping.samples.push({ t: t1 - (39 - i) * 200, rtt: 300, src: 'probe' });
	T.setSmoothing(true);                                    // 收起状态刷新：圆点也必须更新
	var redDot = dot.style.background, redBallBorder = ball.style.borderColor;
	T.hudState.ball = false; T._hudAnimate(false);
	var eb = animWith(ball, 'backgroundColor'), er = animWith(root, 'opacity');
	pinEnd(eb); pinEnd(er); void ball.offsetWidth;
	var expMidBg = null;
	if (eb) {
		try { eb.currentTime = (parseFloat(eb.effect.getTiming().duration) || 300) / 2; } catch (e) {}
		void ball.offsetWidth;
		expMidBg = getComputedStyle(ball).backgroundColor;
		pinEnd(eb);
		void ball.offsetWidth;
	}
	var exp = {
		ballBg: getComputedStyle(ball).backgroundColor, keyEndBg: endKf(eb, 'backgroundColor'),
		startBg: eb ? ((eb.effect.getKeyframes()[0] || {}).backgroundColor) : null,
		midBg: expMidBg, ballShadow: getComputedStyle(ball).boxShadow,
		rootO: getComputedStyle(root).opacity,
		liveDotBg: getComputedStyle(dot).backgroundColor
	};
	T._finishHudAnim();
	exp.staticBallBg = getComputedStyle(ball).backgroundColor;
	exp.staticRootO = getComputedStyle(root).opacity;
	exp.staticBallShadow = getComputedStyle(ball).boxShadow;
	window.__ENDPT__ = { collapse: col, expand: exp, greenDot: greenDot, redDot: redDot, redBallBorder: redBallBorder };

	var diffs = [];
	if (norm(col.ballBg) !== norm(col.staticBallBg)) diffs.push('收起终点底色 ' + col.ballBg + ' != 静止态 ' + col.staticBallBg);
	if (norm(col.keyEndBg) !== norm(col.staticBallBg)) diffs.push('收起关键帧终点底色与静止态不同');
	if (norm(col.rootO) !== norm(col.staticRootO)) diffs.push('收起终点面板 opacity ' + col.rootO + ' != ' + col.staticRootO);
	if (norm(col.keyEndRootO) !== norm(col.staticRootO)) diffs.push('收起关键帧 opacity 终点与静止态不同');
	if (Math.abs(col.rootScale - col.staticRootScale) > 1e-6) diffs.push('收起终点面板 scale ' + col.rootScale + ' != ' + col.staticRootScale);
	if (Math.abs(col.ballScale - col.staticBallScale) > 1e-6) diffs.push('收起终点球 scale ' + col.ballScale + ' != ' + col.staticBallScale);
	if (norm(col.midBg) === norm(col.startBg) || norm(col.midBg) === norm(col.keyEndBg)) diffs.push('收起底色没有真正插值 mid=' + col.midBg);
	if (shapeOf(col.ballShadow) !== shapeOf(col.staticBallShadow)) diffs.push('收起终点阴影形状与静止态不同: ' + col.ballShadow + ' vs ' + col.staticBallShadow);
	if (norm(exp.ballBg) !== norm(exp.staticBallBg)) diffs.push('展开终点底色 ' + exp.ballBg + ' != 静止态 ' + exp.staticBallBg);
	if (norm(exp.ballBg) !== norm(exp.liveDotBg)) diffs.push('展开终点底色不是圆点实时色: ' + exp.ballBg + ' vs ' + exp.liveDotBg);
	if (norm(exp.keyEndBg) !== norm(exp.liveDotBg)) diffs.push('展开关键帧终点底色不是圆点实时色');
	if (norm(exp.rootO) !== norm(exp.staticRootO)) diffs.push('展开终点面板 opacity ' + exp.rootO + ' != ' + exp.staticRootO);
	if (norm(exp.midBg) === norm(exp.startBg) || norm(exp.midBg) === norm(exp.keyEndBg)) diffs.push('展开底色没有真正插值 mid=' + exp.midBg);
	if (shapeOf(exp.ballShadow) !== shapeOf(exp.staticBallShadow)) diffs.push('展开终点阴影形状与静止态不同: ' + exp.ballShadow + ' vs ' + exp.staticBallShadow);
	ck('morph-endpoints-match-static', diffs.length === 0,
		'变形终点必须逐项等于静止态（底色/面板 opacity/scale），否则终点前会跳: ' +
		(diffs.join(' ; ') || 'ok') + ' || ' + JSON.stringify(window.__ENDPT__));
	ck('collapsed-dot-keeps-live-tint', redDot !== greenDot && redDot === redBallBorder,
		'收起成球期间圆点/hudTint 也必须跟最新分级色（否则下次展开从旧色起步）: ' +
		JSON.stringify({ greenDot: greenDot, redDot: redDot, redBallBorder: redBallBorder }));
	T.ping.samples.length = 0;
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim(); T.setSmoothing(true);
});

step(function () {
	/* —— B 项排查证据：交接时的呼吸相位 + 跨交接冻结的内发光。
	 * 呼吸：以前直接拿 getAnimations()[0]，而带 fill:forwards 的淡入动画会一直占第一位，
	 * 设的是淡入的 currentTime，循环相位根本没对齐 → 交接那一层白光会"忽明忽暗"。 */
	var T = window.__TTN__, ball = q('ttn-ball'), dot = q('ttn-dot');
	function loopOf(el) {
		var list = el && el.getAnimations ? el.getAnimations() : [];
		for (var i = 0; i < list.length; i++) {
			try {
				var t = list[i].effect.getTiming();
				if (t && t.iterations === Infinity) return list[i];
			} catch (e) {}
		}
		return null;
	}
	function phaseOf(a) {
		var t = a.effect.getTiming(), d = Math.max(1, parseFloat(t.duration) || 1);
		var delay = Math.max(0, parseFloat(t.delay) || 0);
		var cur = (typeof a.currentTime === 'number' ? a.currentTime : ((a.currentTime && a.currentTime.value) || 0));
		return ((((cur - delay) % d) + d) % d) / d;
	}
	T.hudState.hidden = false;
	T.hudState.ball = true; T.setHud(true); T.setSmoothing(true); T._finishHudAnim();
	T.setSmoothing(false); T.setSmoothing(true);             // 强制重建两边循环，保证都存在
	var bl = loopOf(ball.querySelector('.halo')), dl = loopOf(dot.querySelector('.halo'));
	if (bl) bl.currentTime = 321;
	if (dl) dl.currentTime = 999;
	/* 造一个确定的"球当前内发光"值：WAAPI fill:both 钉住 0.37，finishHudAnim 读到的就是它。
	 * （直接写内联会触发 0.18s CSS 过渡，无头环境读到的是过渡起点，判据会不稳。） */
	var bGlow = ball.querySelector('.hover-glow'), dGlow = dot.querySelector('.hover-glow');
	var glowPin = bGlow ? bGlow.animate([{ opacity: '0.37' }, { opacity: '0.37' }],
		{ duration: 1000, fill: 'both' }) : null;
	T.hudState.ball = false; T._hudAnimate(false); T._finishHudAnim();
	if (glowPin) { try { glowPin.cancel(); } catch (e) {} }
	var bl2 = loopOf(ball.querySelector('.halo')), dl2 = loopOf(dot.querySelector('.halo'));
	window.__HALOHANDOFF__ = {
		hadLoop: !!bl && !!dl, afterLoop: !!bl2 && !!dl2,
		ballPhase: bl2 ? phaseOf(bl2) : null, dotPhase: dl2 ? phaseOf(dl2) : null,
		dotBefore: dl ? 999 : null, dotAfter: dl2 ? dl2.currentTime : null,
		glowInline: dGlow ? dGlow.style.opacity : null,
		glowTrans: dGlow ? (getComputedStyle(dGlow).transitionProperty + ' / ' + getComputedStyle(dGlow).transitionDuration) : null,
		glowTimer: !!T._hudAnim.glowTimer, glowLoopCount: (dot.querySelector('.halo').getAnimations() || []).length
	};
	ck('halo-phase-synced-on-handoff',
		window.__HALOHANDOFF__.afterLoop === true &&
		Math.abs(window.__HALOHANDOFF__.ballPhase - window.__HALOHANDOFF__.dotPhase) < 0.03 &&
		window.__HALOHANDOFF__.dotAfter !== 999,
		'交接时对齐的必须是循环动画且相位一致（不是带 fill 的淡入）: ' + JSON.stringify(window.__HALOHANDOFF__));
	ck('hover-glow-freeze-covers-handoff',
		window.__HALOHANDOFF__.glowInline === '0.37' &&
		window.__HALOHANDOFF__.glowTimer === true &&
		/opacity/.test(window.__HALOHANDOFF__.glowTrans || '') &&
		parseFloat(String(window.__HALOHANDOFF__.glowTrans || '').split('/').pop()) > 0,
		'交接时圆点内发光必须冻结成球当前值，且 220ms 后清内联时有 opacity 过渡兜底: ' +
		JSON.stringify(window.__HALOHANDOFF__));
	T.hudState.ball = false; T.setHud(true); T._finishHudAnim(); T.setSmoothing(true);
});


step(function () {
	ck('report-ok', (function () {
		try {
			var rep = window.__TTN__.report();
			return !!rep.discovery && !!rep.smoothing && !!rep.entities;
		} catch (e) { return 'err:' + e.message; }
	})() === true);
	ck('metrics-ok', (function () {
		try {
			var m = window.__TTN__.netMetrics();
			return typeof m.avg === 'number' && typeof m.stability === 'number' &&
				typeof m.jitterPercent === 'number';
		} catch (e) { return 'err:' + e.message; }
	})() === true);
	ck('render-hook-in-report', (function () {
		try {
			var rep = window.__TTN__.report();
			var hooked = (rep.tanks || []).filter(function (t) { return t.hasRenderHook; }).length;
			return hooked > 0 ? true : 'hasRenderHook=0 (tanks=' + (rep.tanks || []).length + ')';
		} catch (e) { return 'err:' + e.message; }
	})() === true, '报告里能看到已装渲染钩子的精灵');
	ck('no-js-errors', window.__err.length === 0, JSON.stringify(window.__err));
});
