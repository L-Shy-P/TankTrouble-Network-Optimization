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
	ck('dot-collapse-works', !vis(root), '点圆点必须能收起');
	ck('panel-hidden-after-collapse', !vis(root));
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
});

step(function () {
	ck('click-ball-expands', vis(root), '点击悬浮球应当展开面板');
	ck('ball-hidden-after-expand', !vis(q('ttn-ball')));
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
		return /#ttn-dot\.on\{filter:saturate\(1\) brightness\(1\.18\)\}/.test(css);
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
	var A = window.__ANIM__ || {};
	if (window.__ANIM_RESTORE__) window.__ANIM_RESTORE__();
	ck('toggle-animations-really-run', (A.dot || 0) >= 3 && (A.ball || 0) >= 2 && (A.halo || 0) >= 3,
		'dotGlow=' + JSON.stringify(q('ttn-dot').__glowLast) + ' ballGlow=' + JSON.stringify(q('ttn-ball').__glowLast) +
		' → 动画调用数 dot=' + A.dot + ' ball=' + A.ball + ' halo=' + A.halo);
	var T = window.__TTN__;
	T.hudState.ball = false; T.setHud(true); T.setSmoothing(true);
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
		var offNotGray = /#ttn-ball:not\(\.on\)\{[^}]*saturate\(\.85\)/.test(css) &&
			!/#ttn-ball:not\(\.on\)\{[^}]*grayscale/.test(css);
		var onBright = /#ttn-ball\.on\{[^}]*filter:saturate\(1\) brightness\(1\.1[0-9]\)/.test(css);
		var shadowWeaker = /#ttn-ball\.on\{[^}]*box-shadow:0 2px 7px rgba\(0,0,0,\.2\)/.test(css);
		var breatheWhite = /#ttn-ball \.halo\{[^}]*rgba\(255,255,255,\.2/.test(css);
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
	ck('hover-rules', /#ttn-dot:hover/.test(css) && /\.ttn-btn:hover/.test(css) &&
		/#ttn-ball:hover/.test(css) && /#ttn-head:hover/.test(css),
		'鼠标悬浮动画：圆点 / 按钮 / 悬浮球 / 标题栏');
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
	 ['#ttn-head', ['background']],
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
	}, 310);
});

step(function () {
	var E = window.__EXPAND__;
	ck('expand-then-rebound', !!E.at310 && E.at310.gliding === true,
		'展开结束后由回弹接管（不是瞬移，也不是不动）',
		E.at310 ? JSON.stringify(E.at310) : '没采到样');
	ck('rebound-starts-from-ball-position',
		!!E.at310 && Math.abs(E.at310.x - E.anchor.x) < 40 && Math.abs(E.at310.y - E.anchor.y) < 40,
		'回弹起点仍是球的位置（不能动画一结束就贴到边界上）',
		E.at310 ? '(' + Math.round(E.at310.x) + ',' + Math.round(E.at310.y) + ')' : '没采到样');
});

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
