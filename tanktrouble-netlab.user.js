// ==UserScript==
// @name         TankTrouble Network Optimization
// @name:zh-CN   TankTrouble 网络优化
// @name:ja      TankTrouble ネットワーク最適化
// @namespace    tt.network.optimization
// @version      0.4.4
// @description  Richer, more real-time and more accurate network display + real optimization (render-time smoothing, local authority, dead reckoning). No server, no network config, not a VPN.
// @description:zh-CN 更丰富、更实时、更准确的网络情况显示 + 真正的网络优化（渲染期平滑 / 本地权威 / 静默外推）。不用服务器、不用改网络配置、不是加速器。
// @author       L-Shy-P
// @license      MIT
// @homepageURL  https://github.com/L-Shy-P/TankTrouble-Network-Optimization
// @supportURL   https://github.com/L-Shy-P/TankTrouble-Network-Optimization/issues
// @updateURL    https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
// @downloadURL  https://raw.githubusercontent.com/L-Shy-P/TankTrouble-Network-Optimization/main/tanktrouble-netlab.user.js
// @match        *://tanktrouble.com/*
// @match        *://*.tanktrouble.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/*
 * 用法
 *   1. 装好后打开 https://tanktrouble.com/game 正常进一局，左上角会出现面板：
 *      线路 / 实时延迟 / 平均延迟 / 最大延迟 / 小抖动 / 稳定度 / 优化状态。
 *   2. 点左上角圆点 → 收起成悬浮球（显示 平均 / 实时延迟 / 稳定度）；点球 → 展开。
 *      拖标题栏或球本身可移动（带惯性）。
 *   3. Ctrl+Shift+S 或面板里的 ⚡ 开关网络优化，可实时 A/B 对比；
 *      Ctrl+Shift+L 隐藏/显示 HUD；Ctrl+Shift+E 导出诊断报告（同时进剪贴板）。
 *   4. 面板里可选 10 国语言；位置 / 语言 / 开关 / 收起状态都会缓存。
 *   5. 控制台可用 window.__TTN__：report() / export() / conns / probeRegions(30) /
 *      langs / setLang('ja') / motion / setSmoothing(false) 等。
 *   6. 优化默认只动"画面"：游戏逻辑、物理、服务端校验全程用真值；自己的坦克以本地为准。
 *      想细调：__TTN__.smoothing.renderSmooth / localAuthority / deadReckon ...
 */

(function () {
	'use strict';

	if (window.__TTN__) return;

	const VERSION = '0.4.4';
	// 变更日志：只记"人看得懂的行为变化"，方便回退时对照
	const CHANGELOG = [
		['0.4.4', 'hover 改成"**边缘与外围更亮**"（用户："边缘以及外部发光太弱，比中心弱"）：内部渐变改成中心微弱、末端最强（.10 → .50），再加一圈 inset 白色描边（边缘发亮）+ 外层柔和光晕（`0 0 20px -3px currentColor`），整体亮度仍只"相对"加一点点',
			'修"双球转变结束时会闪"+"连点 bug 连篇"：根因是交接用了 90ms **交叉淡接** —— 两者同时绘制 → 亮度叠加 = 闪，而且那个延迟定时器会和下一次动画抢状态。现在球的最后一帧已经插值成和圆点同色同尺寸，改成**原子交换**（同一帧隐藏球/显示圆点），既没闪也没有时序竞争；连点只走"强化 + token"这一条路径'],
		['0.4.3', '修"点击和悬浮的混乱 + 几次点击/拖动/悬浮之后悬浮直接瞬变"（用户实测的卡死 bug）：根因是拖动时往**内联**写 `transition:none`，只有 pointerup 会还原 —— 指针捕获一丢/松手在元素外就**永久卡住**，之后所有 hover 都变瞬变。现在：① 拖动状态改用 class（`.ttn-drag`）；② **document 级 pointerup/pointercancel 兜底**（松手在元素外也能结束）；③ 4 秒看门狗 + 每次刷新巡检（不在拖动时清掉泄漏的 class/内联 transition/标志）；④ 彻底不再有任何内联 transition',
			'点击不再是一种状态：删掉球和圆点的 `:active` 规则（点击既不该改观感，也不该改尺寸、抢层叠）',
			'新增回归：不许存在 `:active` 规则；松手在元素外必须结束拖动；看门狗必须能收拾卡住的拖动状态；结束后 hover 依赖的 `filter` 过渡必须仍在；球/面板/圆点任何时刻都不许有内联 transition；"点击+拖动+悬浮"混合若干轮后状态必须干净'],
		['0.4.2', 'hover 重做（用户："太夸张、不要白环、要相对变亮"）：删掉白环与大改阴影，改成 **相对当前状态略微变亮**（开启 1.18→1.26、关闭 0.94→1.00，关闭态永远亮不过开启态）+ 一层 `.hover-glow` **内部发光**（CSS opacity 过渡，与状态规则叠加互不覆盖）；按下则相对变暗一点',
			'关闭态不再"很灰"：`saturate(.85) brightness(.9)` → `saturate(.95) brightness(.94)`（只压一点点）',
			'修"大变小终点：空心黑球瞬间变有色球"：变形时把球的**底色一起插值**到圆点那种实心色（深色盘面 → 分级色），交接再用 90ms **交叉淡接**，两者任何细微差异（描边、内部黑条）都被抹平',
			'修"小变大后先变成没悬浮的小球再变大一点"：圆点 hover 里的 `transform:scale(1.16)` 就是那"变大一点" —— 交接要求同尺寸，圆点 hover 改为**不改尺寸**（只加强光晕）',
			'新增回归：hover 必须是"相对变亮且幅度 0.05~0.2、无白环、无阴影改动、有内部发光"；圆点 hover 不许碰 transform；变形必须插值球的底色；交接显隐规则用确定性写法验证（不再依赖 100ms 淡接的时序）'],
		['0.4.1', '修"各种瞬变"：展开/收起变形改成 **Web Animations API（JS）驱动** —— CSS 过渡在"元素刚从 display:none 变可见""动画覆盖过渡"这类情况下会不创建/不推进（实测：无头环境里过渡从头到尾一动不动），表现就是瞬变。现在球的缩放、面板的缩放/淡入、球里文字的淡出都走 WAAPI：从"当前实时值"起步（中途反向连续）、终点同时写进内联样式（动画一撤就是终点，绝不跳）',
			'修"鼠标悬浮大球没有效果"：`#ttn-ball:hover` 与 `#ttn-ball.on` 特异度相同(1,1,0)，谁在后面谁赢 —— 而 hover 写在前面 → **被 .on/:not(.on) 完全覆盖，悬浮从来没生效过**。现在改成 `.on:hover` / `:not(.on):hover`（1,2,0）并放在状态规则之后双保险',
			'新增两条硬回归：① 把变形动画**钉到 50%**，computed 的 scale 必须严格在起点与终点之间（"有动画"不等于"在插值"，这个项目踩过两次）；② 按 (特异度, 顺序) 真算一遍层叠，hover 规则必须赢'],
		['0.4.0', '展开/收起改成**无缝变形**（用户要求）：不再是"大球淡出 + 圆点从 0 长大"两个独立动画，而是**大球原地从 66px 缩到 24px**、面板在它周围长大，圆点整段过程中隐藏、最后一帧在同一位置同一尺寸上交接（球心本来就严格落在圆点圆心上，所以是像素级对齐）；收起时完全反向：圆点立刻让位，球从"圆点大小"长回悬浮球',
			'变形期间球内的文字/数字会淡出（交接时球就是一块纯色圆盘，和圆点一致），收起时长回来',
			'修掉一个隐秘 bug：**在展开/收起动画没结束前拖动面板**会改锚点，而变形是按锚点算的 → 球和圆点会错位。现在只要一按下就先把变形落终态（`finishHudAnim()`），再正常拖动；同时修掉"落终态时 hudAnimating 还没清 → 收尾回弹被跳过"的顺序问题（vm 测试当场抓到的真回归）',
			'（用户提的"给面板也加惯性、质量匀速增大保持动能"这条没做：状态机交叉太多、很容易养出更隐蔽的 bug，改用"一碰即落终态"这个更安全的替代）'],
		['0.3.13', '修"首次开面板小球闪过一个不该出现的绿色"：圆点的 CSS 基础色是 `#4ade80`，而真实颜色要等 refreshHud 写内联样式 —— 中间就会露一帧绿。现在基础色改成中性"无数据"灰，并在建好 HUD 的**同一帧**就把球/圆点刷成中性色（再由 refreshHud 写真实分级色），任何"闪一下别的颜色"都不可能发生',
			'修"鼠标悬浮几乎看不出区别"：只提 `brightness()` 对**深色球体**几乎无效（近黑 ×1.42 还是近黑）→ hover 改成结构性变化：一圈 **3px 白色描边环** + 更强的本色光晕 + 更深的落地阴影，亮度也提到 1.42（开启态 1.18）；依旧不碰 transform',
			'新增三条回归：圆点基础色必须是中性灰（不许出现绿色）；面板一出现球/圆点就必须已带内联颜色；hover 必须**同时**有"亮度 +0.1 以上"和"白色描边环"（只看亮度会退化成人眼无感）'],
		['0.3.12', '修"大球纯亮、没阴影、没光晕、hover 无感"（都是 0.3.7 那轮"阴影要变弱/不要染色"改过头的后果）：开启态阴影恢复到看得见的 `0 6px 18px rgba(0,0,0,.42)` + 一点本色外光（关闭态是 `0 7px 20px rgba(0,0,0,.5)`，保持"开比关轻"但不再等于没有）',
			'光晕改成**白色内圈光**并调高到看得见（渐变峰值 .55、呼吸 0.34↔0.58）—— 是"被点亮"而不是一大片染色',
			'hover 改成明显更亮（1.18 → 1.34）且阴影同时变大变深（之前只 1.18→1.20，肉眼无感）；依旧**不碰 transform**（位置由内联 transform 管，碰了会抖）',
			'亮度动画加兜底：`finished` 后 cancel，外加 520ms 超时强制收回 —— 万一动画卡住（页面被节流等），元素不会一直停在起始值（表现就是"没阴影/没光晕"）',
			'新增四条回归：开启态必须留有 ≥12px/α≥.35 的落地阴影与本色外光；hover 亮度至少比开启态高 0.1 且改阴影、不碰 transform；光晕峰值 ≥.35；亮度动画不许带 fill'],
		['0.3.11', '找到"依旧瞬变"的**真正根因**（浏览器实测，不是推测）：开关动画的两个 filter 端点函数列表**形状不一致**（`saturate(.85) brightness(.9)` → `brightness(1.18)`），而按规范这种情况按**离散**插值处理 —— 动画确实在播（所以"数 animate() 调用"的测试是绿的），但属性值是到点就跳。实测：把动画钉在 50% 时读 computed 值是 `brightness(1.18)`（终点）而不是中间值',
			'修法：所有 filter 统一成 `saturate(...) brightness(...)` 这一种形状（开/关/hover/active 五处），并把 `.halo` 一并纳入形状检查',
			'新增两条硬回归：① 把**真实动画** pause 到 50%，computed 值必须既不是起点也不是终点（这才叫"在插值"）；② CSS 里所有 filter 必须只有一种函数形状（否则离散插值）。反例：把 ON 改回 `brightness(1.18)` → 第一条立刻红'],
		['0.3.10', '继续修"开关瞬变"，这次找到并修掉三个真原因：① 遇到 prefers-reduced-motion 就**整个跳过动画**（Windows 关掉"显示动画"很常见）→ 现在只把动画变短变小，**绝不跳过**；② 呼吸循环和淡入都动 opacity，后建的循环立刻顶掉淡入 → 光晕"跳"出来（循环加 delay，等淡入跑完再接手）；③ 关闭时先 cancel 了循环再读不透明度 → 读到 0，没有淡出（改成先读再取消）',
			'圆点开启亮度与动画终点对齐（CSS 1.15 → 1.18），动画结束不再跳一下',
			'导出报告新增 prefersReducedMotion 与上一次开关动画的详情（以后再报"没动画"可以直接查）'],
		['0.3.9', '元数据头部对齐正式版：@name / @description（中英）/ @author / @license MIT / @homepageURL / @supportURL，并补上 **@updateURL / @downloadURL** → 装了这个版本之后，油猴会自动跟着仓库 main 分支更新',
			'用法注释块更新成"显示 + 优化"的现状（收起成球、⚡ 开关、10 国语言、缓存项）'],
		['0.3.8', '修掉"开关时小悬浮球状态瞬变"：呼吸关键帧动了 opacity，而**动画会覆盖过渡** → 开关那一下成了瞬间切换（实测连 transitionrun 事件都不来）。开关动画现在完全由 **Web Animations API（JS）** 驱动：明确地从"旧观感"播到"新观感"，光晕也改成真实子元素 .halo，淡入淡出与呼吸循环都交给 JS，周期/强度仍随延迟变化',
			'新增回归：用 **Element.animate() 的调用次数**证明"开关真的播了动画"（无头环境里 CSS 过渡不推进、也收不到 transitionrun，不能当判据）',
			'随附：仓库开源（README 只放多语言介绍，安装教程按语言分文件；`docs/TECHNICAL.zh.md` 记录全部实测结论与踩坑）'],
		['0.3.7', '复制反馈改到**面板标题处**闪一句"已复制线路"（淡入 + 上浮 → 停留 → 淡出），标题同时淡出做交叉过渡；去掉"点击复制完整名称"的悬浮提示字（用户："不要那个提示"）',
			'关的观感不再灰掉：saturate(.85) 只压一点，保留颜色（用户："关闭时的颜色有些过于灰了"）',
			'开的"发光"改成**提亮**（brightness 1.18，和 hover 同一种效果），黑色投影减弱（0 2px 7px rgba(0,0,0,.2)）；呼吸改成内圈**白光**的轻微明暗 + 极小幅缩放，不再是大片染色（用户："发光要的是亮度高，不是大片染色"）',
			'语言**列表**字号回归 12px（上一版我只该缩按钮里的名字，列表项不该跟着缩小）'],
		['0.3.6', '修掉"开关时大小悬浮球都没动画"：呼吸关键帧里动了 opacity，而**动画会覆盖过渡** → 开关那一下成了瞬间切换。现在关键帧只动 transform，淡入淡出交给 opacity 过渡；圆点的 filter 过渡也挪到基样式（开/关两个方向都生效）',
			'修掉"语言按钮里最长的名字依旧被截断"：改成**按实测自动缩字号**（只在按钮里、11px 起最多缩到 9px，放得下就回 11px）—— 不同系统字体宽度不同，写死字号总会有人被截断',
			'新增回归：10 国语言逐个选中，按钮上的名字都不许被截断；把按钮压窄时字号必须自动变小；关键帧不许出现 opacity、开关两个方向都必须有过渡'],
		['0.3.5', '光晕收敛（用户："太夸张、华而不实"）：去掉"激活环"和一大片颜色，改成常见开关语义 —— 关=灰暗（降饱和+压暗、无发光），开=亮一点 + 一层很轻的柔光 + 幅度极小的呼吸；小圆点同一套',
			'「线路」改成**点击复制**完整主机名（复制后原地闪一下"已复制"，淡入淡出），不再用悬浮提示',
			'切语言时布局保持稳定：标签不再换行（超长才省略）、语言行标签固定宽度 → 语言按钮与菜单宽度不再随语言变化；面板加宽到 288px，12px 标签在 10 国语言下都能一行放下',
			'新增回归：10 国语言下"行位置/按钮宽度/语言按钮宽度/标签行高"必须完全不变、光晕必须是"关灰开亮"且无激活环、线路必须可点击复制且复制的是完整名称'],
		['0.3.4', '面板新增一行「实时延迟」，排在「平均延迟」**上面**（之前只在悬浮球里显示）',
			'修掉"语言名在按钮里显示不下"的真正原因：`font:11px/1.4 inherit` 这种简写里的 inherit 是**非法值**，整条声明被丢弃 → 按钮/菜单项一直按 16px 渲染。改成显式 font-size + line-height（按钮 11px）',
			'语言菜单宽度**严格等于**按钮宽度（对齐），同时收紧菜单项内边距/勾选图标，保证等宽后最长语言名仍完整',
			'被裁的文字（比如"线路"里的长主机名）鼠标悬浮会弹出完整内容，出现/消失都有动画（消失时先淡出再从布局里拿掉）',
			'光晕重做：一圈明确的"激活环" + 外发光 + 内圈柔光，整体随呼吸缩放（scale 1→1.14），不再像一块有色阴影；周期/强度仍随延迟变化',
			'面板左上角的小圆点与悬浮球用**同一套**激活效果（优化开关一动，两个一起变）'],
		['0.3.3', '修掉"变动的数字比旁边的单位低一点"+"线路显示不全"：数字动画从"两层 + overflow:hidden"改成**单层从下浮入**（inline-block 基线天然对齐，也不再按旧宽度裁剪长文本）',
			'去掉"（纯观测）"这类括号说明（10 国语言都只留"关/OFF"）',
			'换语言时面板内**所有**文字都有动画：标签/标题/按钮/球里的前缀/状态说明/副行的词统一走 .ttn-anim（位移 + 轻微淡入）',
			'语言菜单展开/收起都有动画：收起时先摘 .on 跑过渡，220ms 后再 display:none',
			'悬浮球分两种观感：优化**开**时有随延迟变化的呼吸光晕（周期 1.2~2.6s、强度随 RTT 走）；优化**关**时只有颜色，没有额外发光',
			'修掉"鼠标悬浮在悬浮球上依旧瞬变"：展开/收起动画收尾时把球的 inline transition 清空（之前卡在 none，样式表里的 filter/box-shadow 过渡永远不生效）；顺带补一次 reflow 让"落终态"真正生效',
			'新增回归：数字与单位的基线差 ≤0.75px、线路值不裁剪、换语言标签必带动画接线、菜单收起先动画、球 .on 只在优化开时存在、球 inline transition 必须为空'],
		['0.3.2', '修掉"语言列表一滚动就消失"：capture 阶段的 scroll 监听把菜单**自己内部**的滚动也当成页面滚动 → 立刻关菜单。现在内部滚动只记录滚动位置；页面滚动则把菜单重新贴回按钮（不再消失）',
			'语言列表的滚动位置会缓存：重新打开回到上次的位置；第一次打开自动把当前语言滚进可视区',
			'文字动画不再"一闪一闪"：去掉 ttn-bump 那种透明度闪烁，会变的数字改成**两层上下推入**的位置动画（旧值向上推走、新值从下推入）',
			'内容不变的文字一律不做动画：单位（ms / %）、前缀（≈）、行标签、状态说明都拆成独立静态节点 —— 数字变的时候它们一个字节都不动（用户明确要求）',
			'新增回归：菜单内部滚动不关菜单 / 滚动位置缓存 / 数字必须是位移过渡且不存在 ttn-bump / 换语言后单位节点与文本原封不动'],
		['0.3.1', '视觉全面重做（用户："语言列表过于丑、字被截断"）：面板加宽到 264px、字号回到 12px、标签允许折行 —— 10 国语言逐个切都不再有文字被截断',
			'语言选择换成自定义下拉（丢掉原生 <select>）：按钮上显示当前语言全名，菜单挂在页面层（不受面板 overflow 裁切）、可滚动、当前项高亮打勾、hover/键盘都有反馈、开合有过渡',
			'「优化」行的计数（已抹平/忽略修正）移到副行：10 国语言里这段最长，挤一行必然被截断',
			'修掉两个真 bug：① 菜单 z-index 写成 2147483650 超出 int32 被浏览器忽略 → 菜单被面板盖住（点开像没反应）；② 数值节点写 textContent 会把副行清空',
			'阿拉伯语排版修正：数字/单位/图标用 bidi isolate，不再把 "62 ms" 显示成 "ms 62"、⚡ 也不再跑到右边',
			'新增回归：10 国语言 × 面板/悬浮球全元素"无截断"扫描、菜单必须真的画在面板之上（elementFromPoint 验证）、副行必须存在'],
		['0.3.0', '面板新增 10 国语言选择（en/zh/ja/ko/ru/ar/fr/es/de/pt，代码与 TankTrouble-Chat-Fix 保持一致）；默认跟随浏览器语言，阿拉伯语自动切 RTL',
			'「选中的语言 + 优化开关 + 悬浮球位置/收起状态」存进同一个 localStorage 存档（老存档缺字段也能读、不会被冲掉默认值）',
			'语言切换立刻生效：面板每一行、按钮文案、悬浮球里的三个数值、状态原因全部跟着换',
			'新增结构性回归：10 个语言包必须把英文包的每个词条都填全（缺词会露出 key 本身）'],
		['0.2.13', '去掉悬浮球上的"点击展开面板 · 可拖动"提示字（用户：很多余）—— 只在缺数据时才附一句原因',
			'修掉"鼠标悬浮在悬浮球上时状态瞬间变化"：hover 改的是 filter:brightness()，而过渡列表里漏了 filter，所以那一下是硬切；现在 filter 也走 .3s 过渡（移开同理）',
			'新增结构性回归：hover/active 会改的每个属性都必须在过渡列表里，缺了就报"XX 的 YY 没有过渡"（这类"漏一个属性 = 瞬变"的 bug 以后不用靠肉眼找）'],
		['0.2.12', 'HUD 全面去"瞬变"（用户要求：加点悬浮/颜色动画，不要任何瞬变）：数值行改为**增量更新** —— 以前每 250ms 整块 innerHTML 重写，节点被换掉，CSS 过渡根本无从生效',
			'颜色一律走过渡：圆点、悬浮球描边与三行数字、面板数值、按钮状态（0.3~0.4s）；数值真的变了才播一下淡入（0.2s），不是硬切',
			'"状态"行改成折叠式（max-height + opacity 过渡），不再把面板"啪"地撑高；显示/隐藏（Ctrl+Shift+L）改为先淡出再从布局里拿掉',
			'鼠标悬浮：圆点放大、按钮上浮、悬浮球发光、标题栏高亮，全部带过渡；尊重 prefers-reduced-motion（系统开了"减少动态效果"就自动关掉这些动画）'],
		['0.2.11', '面板左上角的收起圆点 16 → 24px（用户实测"有点难点"），内圈横杠同步放大；圆点够大之后顺手暴露并修掉一个 1px 老偏差：它是相对标题栏 padding box 定位的，而面板自己还有 1px 边框 —— 圆心一直比变换原点 (20,20) 偏 1px，以前靠测试容差蒙过去了，现在严格重合',
			'收起/展开动画的起始缩放不再写死 16px，改由 DOT_SIZE 推导（以后调圆点大小不会再错位）'],
		['0.2.10', '修掉"拖动一下悬浮球之后停止，它还会弹一点距离"：松手速度以前是拿**指针**的轨迹算的，而且时间窗口锚在"最后一个采样点"上 —— 指针停住期间不会再发 pointermove，窗口里就只剩刚才那几下快速移动，于是凭空追认出一个速度',
			'现在按**悬浮球自己的位移**算速度（贴边被夹住没动 → 速度就是 0），时间窗口以**松手那一刻**为准（停住再松手 → 窗口里全是没动的点 → 不甩）',
			'松手时会补一个采样点，记录"球此刻在哪儿"（防御性）',
			'新增回归：拖完停住再松手不甩 / 还在动时松手正常甩（同一段轨迹，只看松手时刻）/ 贴边被夹住不甩'],
		['0.2.9', '惯性调参（用户实测："地面有点太滑了"）：摩擦 0.93 → 0.88、停下的速度阈值 0.03 → 0.06。1px/ms 的一次甩动：滑行 222px/784ms → 125px/352ms（距离 −44%，时长 −55%）',
			'手感可以实时微调：控制台 __TTN__.motion.friction / minV / maxV / minStart / bounce 改完立刻生效（不用刷新）',
			'新增"手感回归测试"：把 1px/ms 甩动的滑行距离与时长钉在带子里，以后调摩擦会明确告诉你数字变了多少'],
		['0.2.8', '悬浮球拖动加惯性（用户要求："别再严格跟手"）：拖动过程仍是 1:1 跟手（要能精确摆放），松手那一下按最近 120ms 的指针速度继续滑 —— 速度按摩擦衰减，撞到边界轻轻弹一下再停',
			'速度上限 6px/ms；慢放（<0.15px/ms）算轻放、不甩。面板拖动不加惯性（面板要精确摆位看数字）',
			'修掉一个把惯性掐死的 bug：refreshHud 每 250ms 调一次 clampHud，之前它无条件取消正在跑的运动 —— 球刚甩出去就被下一次刷新停住（真实浏览器里只剩几十像素）',
			'惯性 / 边缘回弹 / 展开动画共用同一个状态机：任何时刻只有一种运动在跑，抓住球立刻接管'],
		['0.2.7', '修掉「不显示稳定值」：稳定度以前只有「帧到达节奏」一个口径，大厅/局间/刚进房时帧本来就稀疏 → 直接显示 --',
			'新增兜底口径：帧节奏测不到时改用 ping RTT 的抖动来算（只要有延迟样本就一定有稳定值），面板上会标注「· RTT 抖动」',
			'主连接选择会排除「只收到过一两帧就关」的连接（游戏自己每 ~30s 为选服开的那批短命探测连接）—— 它们 lastT 很新，会把真正在跑游戏的那条挤掉，导致帧样本永远是空的',
			'稳定度来源优先级：帧节奏（对局中最准）> RTT 抖动（实时兜底）> 沿用上次（60 秒内）> 才算真的没数据'],
		['0.2.6', '按原始设计改回展开动画：面板左上角**始终和悬浮球位置一一对应**（动画期间一个像素都不挪），越界就让它越界，等展开结束再由边界把面板用回弹推回屏幕内',
			'撤销 0.2.5 里"自动挑一个不会出屏的展开方向"的做法 —— 那会让面板跑离球的位置（球在左下角却往左上角展开），看着就不是从球里长出来的',
			'新增回归：动画终点必须等于球的位置、动画期间不得提前夹取、收尾那一刻不得瞬移、回弹要精确落在按面板尺寸算出的边界上'],
		['0.2.5', '修掉「悬浮球一直灰、什么数据都不显示」的根因：我们自己的延迟探测连接被当成了游戏连接 —— 它 2 秒才来一帧，帧样本永远不够 → 稳定度算不出来 → 整球全灰；探测连接现在会打标记并从「主连接」里排除',
			'悬浮球不再「缺一半就整块灰」：延迟和稳定度各自独立显示，缺哪块只灰哪块，鼠标停上去会显示原因',
			'新增第二条真 RTT 来源：直接配对游戏自己发的 {"_typeId":15} 与它收到的 {"_typeId":28} —— 自建探测被服务器无视时照样有延迟可看',
			'面板新增一行「状态」（只在缺数据时出现），直说为什么没数据：探测没连上 / N 次无应答 / 帧样本不足（大厅、局间）',
			'探测无应答时自动退避（2s→5s→15s），不再像打靶一样刷陌生服务器；报告新增 metrics / ping / latencySources，远程排查一眼可见',
			'修掉「球在屏幕右下角展开时面板瞬移弹回」：需要挪回可视区时走 240ms 先快后慢的回弹，而不是瞬移（拖动时仍然严格跟手）'],
		['0.2.4', '指标重做：把"大厅/局间空闲"和"真网络卡顿"分开——空闲不再被算成几千毫秒的"最大延迟"，不再把稳定度打到 0',
			'真卡顿判定 = 停顿 ≥ 正常节奏 3 倍 且 之后有积压帧洪流（burstFrames ≥ 3）：只有 TCP 队头阻塞才会"静默一坨、然后挤着来"',
			'稳定度改成"节奏乱 + 离散度 + 卡顿次数(每分钟每 6 次扣 6 分) + 单次停顿时长"四项扣分，卡顿权重加大',
			'帧样本太少时窗口从 20s 放宽到 60s，仍不够就沿用上次判断（面板上标 ≈），彻底不再闪成 0%',
			'延迟只认 ping 的 RTT：帧间隔是"节奏"，不是"延迟"'],
		['0.2.3', '三个数值全部放进悬浮球：上=平均，中=实时延迟（字号最大），下=稳定度',
			'移除球右侧的数据条与迷你优化开关（"文字卡消失"的来源就是那条数据条的显隐时序）；优化开关只在展开面板里',
			'球径 58 → 66px 以容纳三行；ping 间隔 3s → 2s，让"实时"有意义'],
		['0.2.2', '修复换房间/换服后测速不对：探测器之前锁定第一个服就不再改，现在会跟着切并清空旧样本',
			'修复换服后指标仍显示旧服：连接选择从"总帧数最多"改为"最近还有数据来往"',
			'报告新增 ping.switches 记录换了几次服'],
		['0.2.1', '收起/展开动画改为可反向：动画途中再点会平滑反向，不再重播或跳变（连点已处理）',
			'圆点改为绝对定位常量（圆心恒为 20,20），彻底不再测量——缩放期间测量曾导致落位偏 16px',
			'数据条/优化按钮改用固定尺寸常量，出现时不再偏移',
			'动画一开始就把气泡摆到正确位置（之前用的是上一次的旧位置，动画结束才跳过去）'],
		['0.2.0', '渲染期平滑：只改绘制那一瞬间，游戏状态一个字节不动（旧版改状态会被游戏读回模型导致狂抖）',
			'悬浮球与小圆点共用圆心，收起/展开无缝过渡',
			'数据条淡入淡出；修复贴近屏幕边缘时圆心错位 12px',
			'修复拖动悬浮球被"空气墙"挡住（夹取改用当前可见元素尺寸）'],
		['0.1.0', '首个版本：网络诊断 HUD、线路质量探针、协议/实体分析、报告导出']
	];

	const CFG = {
		hud: true,
		stallFactor: 3,        // 帧间隔 > max(minStallMs, 中位数 * stallFactor) 记为一次卡顿
		minStallMs: 70,
		burstWindowMs: 45,     // 卡顿后多少 ms 内到达的帧算作"补发洪流"
		gapHist: 240,          // 保留多少个帧间隔样本
		maxWatchSprites: 12,   // 最多监视几个坦克精灵（平滑对手时需要挂满全场）
		maxEntitySprites: 300, // 子弹/地雷等实体的上限（会被回收复用，不会无限涨）
		watchEnemies: false,   // 额外强制监视对手（平滑对手时已自动监视，无需开）
		maxStacks: 8,          // 每个坦克最多记录几种调用栈
		stackSampleEvery: 100  // 每多少次写入抽样一次调用栈（保证报告里能看到写入路径）
	};

	/* ============================ 小工具 ============================ */

	const now = () => performance.now();

	function median(arr) {
		if (!arr.length) return 0;
		const a = arr.slice().sort((x, y) => x - y);
		const m = a.length >> 1;
		return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
	}

	function sizeOf(d) {
		if (typeof d === 'string') return d.length;
		if (d && typeof d.byteLength === 'number') return d.byteLength;
		if (d && typeof d.size === 'number') return d.size;
		return 0;
	}

	function bytesToHuman(n) {
		if (n < 1024) return n + 'B';
		if (n < 1024 * 1024) return (n / 1024).toFixed(1) + 'KB';
		return (n / 1048576).toFixed(2) + 'MB';
	}

	function round1(x) { return Math.round(x * 10) / 10; }

	/** 沿原型链找属性描述符（不修改任何东西，只读） */
	function findDescriptor(obj, prop) {
		let o = obj;
		while (o) {
			const d = Object.getOwnPropertyDescriptor(o, prop);
			if (d) return d;
			o = Object.getPrototypeOf(o);
		}
		return null;
	}

	/** 把调用栈压成"指纹"，用于把同一处代码的多次跳变归并成一条 */
	function stackSignature(err) {
		const s = String((err && err.stack) || '');
		return s.split('\n').slice(2, 6).map(l => l.trim().replace(/:\d+:\d+\)?/g, ')')).join(' | ');
	}

	/* ============================ ① WebSocket 观测层 ============================ */

	const conns = [];

	function classifyUrl(url) {
		const u = String(url);
		if (/-mp\d*\.tanktrouble\.com/i.test(u)) return 'mp';
		if (/monitor/i.test(u)) return 'monitor';
		if (/vpn/i.test(u)) return 'vpn';
		return 'other';
	}

	/* —— JSON 结构指纹：给出 schema 字符串 + 每个数值路径的 min/max/last —— */
	function describe(root) {
		const nums = new Map();
		let nodes = 0;

		function upd(path, v) {
			let r = nums.get(path);
			if (!r) { r = { min: v, max: v, last: v, count: 0 }; nums.set(path, r); }
			if (v < r.min) r.min = v;
			if (v > r.max) r.max = v;
			r.last = v;
			r.count++;
		}

		function walk(v, path, depth) {
			if (nodes++ > 400 || depth > 6) return '…';
			if (v === null) return 'null';
			const t = typeof v;
			if (t === 'number') { upd(path, v); return 'n'; }
			if (t === 'string') return 's';
			if (t === 'boolean') return 'b';
			if (Array.isArray(v)) return v.length ? '[' + walk(v[0], path + '[]', depth + 1) + ']' : '[]';
			if (t === 'object') {
				const keys = Object.keys(v);
				if (!keys.length) return '{}';
				const lim = keys.slice(0, 14).map(k => k + ':' + walk(v[k], path + '.' + k, depth + 1));
				if (keys.length > 14) lim.push('…+' + (keys.length - 14));
				return '{' + lim.join(',') + '}';
			}
			return '?';
		}

		const schema = walk(root, '$', 0);
		return { schema, nums };
	}

	function mergeNums(dst, src) {
		src.forEach((v, k) => {
			let r = dst.get(k);
			if (!r) { r = { min: v.min, max: v.max, last: v.last, count: 0 }; dst.set(k, r); }
			if (v.min < r.min) r.min = v.min;
			if (v.max > r.max) r.max = v.max;
			r.last = v.last;
			r.count += v.count;
		});
	}

	function analyzeText(conn, text, t) {
		let obj;
		try { obj = JSON.parse(text); } catch (e) { conn.nonJson++; return; }

		const tid = (obj && typeof obj === 'object' && obj._typeId != null) ? obj._typeId : '∅';
		let s = conn.shapes.get(tid);
		if (!s) {
			s = { typeId: tid, count: 0, schema: null, nums: new Map(), samples: [], firstT: t, lastT: null, intervals: [], bytes: 0 };
			conn.shapes.set(tid, s);
		}
		s.count++;
		s.bytes += text.length;
		if (s.lastT != null) {
			s.intervals.push(t - s.lastT);
			if (s.intervals.length > 200) s.intervals.shift();
		}
		s.lastT = t;
		if (s.samples.length < 2 && text.length <= 600) s.samples.push(text);

		/* 游戏自己的 RTT 探测：客户端发 {"_typeId":15}，服务器回 {"_typeId":28}。
		 * 在游戏自己的连接上配对 —— 这是"游戏眼里的延迟"，不依赖服务器搭理我们自建的连接。
		 * （之前只靠自建探测：一旦那条连接被服务器无视，整个悬浮球就一直灰、什么都看不到。） */
		if (tid === 28 && conn.pingSentAt) {
			const rtt = t - conn.pingSentAt;
			conn.pingSentAt = 0;
			conn.pingAnswers = (conn.pingAnswers || 0) + 1;
			pushLatency(rtt, connHost(conn), 'game');
		}

		try {
			const info = describe(obj);
			s.schema = info.schema;
			mergeNums(s.nums, info.nums);
		} catch (e) { /* 结构异常：忽略，不影响观测 */ }
	}

	function finalizeStall(conn) {
		if (!conn.pending) return;
		conn.stalls.push({
			t: Math.round(conn.pending.t),
			gap: Math.round(conn.pending.gap),
			burstFrames: conn.pending.n
		});
		if (conn.stalls.length > 200) conn.stalls.shift();
		conn.pending = null;
	}

	function gapLogic(conn, t) {
		if (conn.lastT == null) { conn.lastT = t; return; }
		const gap = t - conn.lastT;
		conn.lastT = t;

		conn.gaps.push(gap);
		if (conn.gaps.length > CFG.gapHist) conn.gaps.shift();
		conn.gapLog.push({ t: t, gap: gap });
		if (conn.gapLog.length > 600) conn.gapLog.shift();
		if (conn.framesIn % 16 === 0) conn.med = median(conn.gaps.slice(-120));

		if (conn.pending) {
			if (t - conn.pending.t <= CFG.burstWindowMs) conn.pending.n++;
			else finalizeStall(conn);
		}

		const thr = Math.max(CFG.minStallMs, conn.med * CFG.stallFactor);
		if (gap > thr) {
			finalizeStall(conn);
			conn.pending = { t, gap, n: 1 };
			conn.stallCount++;
			if (gap > conn.maxGap) conn.maxGap = gap;
		}
	}

	/* 同一个 MessageEvent 会分发给所有监听器；用 WeakSet 去重，
	 * 保证无论游戏注册几条监听，一帧只统计一次（也避免重复观测把中位数带偏）。 */
	const seenEvents = new WeakSet();

	/** 取二进制帧前 n 字节的十六进制，用于离线破译协议 */
	function hexPreview(data, maxBytes) {
		let u8 = null;
		try {
			if (data instanceof ArrayBuffer) u8 = new Uint8Array(data);
			else if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(data)) {
				u8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
			}
		} catch (e) { return null; }
		if (!u8) return null;                       // Blob 之类读不了就跳过
		const n = Math.min(u8.length, maxBytes);
		let out = '';
		for (let i = 0; i < n; i++) out += (u8[i] < 16 ? '0' : '') + u8[i].toString(16);
		return out;
	}

	function recordBinary(conn, data, t) {
		if (conn.framesIn < 100) return;          // 只留主连接，选区探测那些不要
		const hex = hexPreview(data, 128);
		if (hex == null) return;
		const item = { t: Math.round(t), n: sizeOf(data), hex: hex };
		if (conn.binFirst.length < 24) conn.binFirst.push(item);
		conn.binLast.push(item);
		if (conn.binLast.length > 40) conn.binLast.shift();
	}

	function recordIn(conn, ev) {
		if (!ev || typeof ev !== 'object' || seenEvents.has(ev)) return;
		seenEvents.add(ev);

		const data = ev.data;
		const t = now();
		conn.framesIn++;
		conn.bytesIn += sizeOf(data);
		// 自己的延迟探测连接：只计数，不进游戏统计（它的 2 秒节奏会污染帧间隔/卡顿判定）
		if (conn.probe) return;
		gapLogic(conn, t);
		if (typeof data === 'string') analyzeText(conn, data, t);
		else { conn.binaryIn++; recordBinary(conn, data, t); }
	}

	function recordOut(conn, data) {
		if (conn.probe) return;
		conn.framesOut++;
		conn.bytesOut += sizeOf(data);
		if (typeof data === 'string') {
			if (conn.outSamples.length < 6) conn.outSamples.push(data.slice(0, 300));
			// 游戏自己在探测延迟 —— 记下发送时刻，等对应的 {"_typeId":28} 回来就能算出真 RTT
			if (data.indexOf('"_typeId":15') >= 0 || data.indexOf('"_typeId": 15') >= 0) conn.pingSentAt = now();
		} else {
			// 关键：看客户端发出去的到底是位置（float）还是输入（小字节）
			if (conn.framesOut > 400) { /* 只留前 400 帧的样本，避免报告膨胀 */ }
			const hex = hexPreview(data, 96);
			if (hex != null) {
				const item = { t: Math.round(now()), n: sizeOf(data), hex: hex };
				// 前几次抓调用栈：这能直接定位"客户端在哪儿算出自己的位置"
				if (conn.binOutFirst.length < 16) {
					if (conn.outStacks.length < 3) {
						try { item.stack = String(new Error().stack || '').split('\n').slice(1, 12).join('\n'); } catch (e) {}
						conn.outStacks.push(item.stack || '');
					}
					conn.binOutFirst.push(item);
				}
				conn.binOutLast.push(item);
				if (conn.binOutLast.length > 20) conn.binOutLast.shift();
			}
		}
	}

	const RealWS = window.WebSocket;
	if (typeof RealWS === 'function' && !RealWS.__ttnWrapped) {

		function instrument(ws, url, protocols) {
			const conn = {
				url: String(url), protocols: protocols, kind: classifyUrl(url),
				openedAt: Date.now(), closedAt: null, ws: ws,
				framesIn: 0, framesOut: 0, bytesIn: 0, bytesOut: 0,
				gaps: [], lastT: null, med: 0, stallCount: 0, maxGap: 0,
				pending: null, stalls: [],
				shapes: new Map(), nonJson: 0, binaryIn: 0,
				binFirst: [], binLast: [], binOutFirst: [], binOutLast: [], outStacks: [], gapLog: [],
				outSamples: [], pingSentAt: 0, pingAnswers: 0
			};
			conns.push(conn);

			const origAdd = ws.addEventListener.bind(ws);
			const origRemove = ws.removeEventListener.bind(ws);
			const wrapped = new Map();

			ws.addEventListener = function (type, listener, opts) {
				if (type === 'message' && typeof listener === 'function') {
					const w = function (ev) {
						recordIn(conn, ev);
						return listener.call(this, ev);   // ← 第 2 阶段的平滑改写入口在这
					};
					wrapped.set(listener, w);
					return origAdd('message', w, opts);
				}
				return origAdd(type, listener, opts);
			};

			ws.removeEventListener = function (type, listener, opts) {
				if (type === 'message' && wrapped.has(listener)) {
					const w = wrapped.get(listener);
					wrapped.delete(listener);
					return origRemove('message', w, opts);
				}
				return origRemove(type, listener, opts);
			};

			let onmsg = null;
			try {
				Object.defineProperty(ws, 'onmessage', {
					configurable: true,
					enumerable: true,
					get() { return onmsg; },
					set(fn) {
						if (onmsg) origRemove('message', onmsg);
						if (typeof fn === 'function') {
							onmsg = function (ev) {
								recordIn(conn, ev);
								return fn.call(this, ev);
							};
							origAdd('message', onmsg);
						} else {
							onmsg = fn;
						}
					}
				});
			} catch (e) { /* 定义失败也无所谓，还有 addEventListener 路径 */ }

			const origSend = ws.send.bind(ws);
			ws.send = function (data) {
				recordOut(conn, data);
				return origSend(data);
			};

			// 自己也挂一条监听：即使游戏用非常规方式注册，也能完整观测到每一帧。
			// recordIn 内部按 MessageEvent 去重，所以不会与上面的包装重复计数。
			origAdd('message', ev => recordIn(conn, ev));

			origAdd('close', () => { conn.closedAt = Date.now(); });
			origAdd('error', () => { conn.errors = (conn.errors || 0) + 1; });

			return conn;
		}

		function WrappedWS(url, protocols) {
			const ws = protocols === undefined ? new RealWS(url) : new RealWS(url, protocols);
			try { instrument(ws, url, protocols); } catch (e) { /* 观测失败绝不能拖垮游戏 */ }
			return ws;
		}
		WrappedWS.prototype = RealWS.prototype;
		Object.setPrototypeOf(WrappedWS, RealWS);
		WrappedWS.__ttnWrapped = true;
		WrappedWS.__ttnRaw = RealWS;
		try { window.WebSocket = WrappedWS; } catch (e) { /* 某些页面可能锁死 */ }
	}

	/* ============================ ② 局内坦克坐标写入监视 ============================ */

	const tankWatch = {
		records: [],
		roundEvents: new Map(),
		roundEventNames: null,
		stateSnapshots: 0,
		stateFromHook: null,      // 从 Classy 钩子里抓到的活状态实例
		stateFoundVia: null,      // 最终用的是哪个来源
		discoveryInfo: null       // 一直找不到时留下的诊断快照
	};

	/* "哪个坦克是我的" —— 各版本 API 名字不一样，这里把能试的都试一遍。
	 * 上一份报告里 Users.getAllPlayerIds 根本不存在，导致所有坦克都被当成对手
	 * （你的坦克没瞬移纯属 enemyPosition 恰好也开着）。 */
	const localIdsInfo = { via: null, tried: [] };

	function localPlayerIds() {
		const out = [];
		let via = null;

		function take(v, how) {
			if (!v) return false;
			let arr = null;
			try {
				if (typeof v === 'string') arr = [v];
				else if (typeof v.length === 'number') arr = Array.prototype.slice.call(v);
				else if (typeof v.forEach === 'function') { arr = []; v.forEach(function (x) { arr.push(x); }); }
			} catch (e) { return false; }
			if (!arr || !arr.length) return false;
			arr.forEach(function (x) { if (x != null) out.push(String(x)); });
			if (!out.length) return false;
			via = how;
			return true;
		}

		const U = window.Users;
		if (U) {
			const fns = ['getAllPlayerIds', 'getOwnPlayerIds', 'getLocalPlayerIds', 'getMyPlayerIds', 'getPlayerIds'];
			for (let i = 0; i < fns.length; i++) {
				try {
					if (typeof U[fns[i]] === 'function' && take(U[fns[i]](), 'Users.' + fns[i] + '()')) {
						localIdsInfo.via = via;
						return out;
					}
				} catch (e) { localIdsInfo.tried.push('Users.' + fns[i] + ': ' + e.message); }
			}
			const props = ['localPlayerIds', 'ownPlayerIds', 'myPlayerIds', 'playerIds'];
			for (let i = 0; i < props.length; i++) {
				try { if (take(U[props[i]], 'Users.' + props[i])) { localIdsInfo.via = via; return out; } } catch (e) {}
			}
		}

		const st = tankWatch.stateFromHook;
		if (st) {
			const sp = ['localPlayerIds', 'ownPlayerIds', 'myPlayerIds', 'playerIds'];
			for (let i = 0; i < sp.length; i++) {
				try { if (take(st[sp[i]], 'state.' + sp[i])) { localIdsInfo.via = via; return out; } } catch (e) {}
			}
		}

		try {
			const CB = window.TankTrouble && window.TankTrouble.ChatBox;
			if (CB) {
				const cp = ['localPlayerIds', 'ownPlayerIds'];
				for (let i = 0; i < cp.length; i++) {
					try { if (take(CB[cp[i]], 'ChatBox.' + cp[i])) { localIdsInfo.via = via; return out; } } catch (e) {}
				}
			}
		} catch (e) {}

		// 全都没找到：留一次现场，便于下次报告定位
		if (!localIdsInfo.dumped) {
			localIdsInfo.dumped = {
				usersType: Object.prototype.toString.call(U),
				usersKeys: firstKeys(U, 40),
				stateKeys: firstKeys(st, 40)
			};
		}
		return out;
	}

	/* ---------------- 客户端平滑：把"瞬移"抹成快速滑动 ---------------- */
	/*
	 * 关键认识：瞬移有两种成因，必须用同一套机制覆盖
	 *   A. 一帧内一次大跳变（服务端直接改写位置）
	 *   B. 卡顿结束后，一帧内被连续写了几十次小步（把积压的更新一次性补上）
	 * 只看"单笔写入"的步长，B 根本检测不到（每笔都很小），所以这里改成逐帧度量：
	 *
	 *     游戏写入的值  → stored   （权威值，照单全收）
	 *     对外暴露的值  → shown    （渲染值，每帧朝 stored 逼近，单帧位移有上限）
	 *
	 * 单帧位移上限 = 该坦克"正常单帧位移的 P90 × catchUpFactor"，下限 minFrameStep。
	 * 用 P90 而不是最大值，是为了不被一次突发带偏。于是：
	 *   - 正常移动永远追得上（上限高于正常速度）→ 零输入延迟、零干预
	 *   - A 和 B 都会被摊成若干帧 → 瞬移变成快速滑动
	 * 而且读改写（sprite.x += dx）也是安全的，因为 stored 由我们自己维护。
	 *
	 * 安全阀：预热期 / 巨大跳变（复活重开）直接对齐 / 滑行超时直接对齐 / 回合事件全体对齐
	 */
	const SMOOTH = {
		// 默认只做"渲染期"平滑：精灵坐标一个字节都不改，只在绘制那一瞬临时替换，画完立刻还原。
		// 这样游戏逻辑/相机/服务端校验看到的永远是真值，不会出现"改状态被游戏读回去"的打架。
		enabled: true,
		renderSmooth: true,      // 渲染期平滑（安全，默认开）
		stateSmooth: false,      // 改状态式平滑（有害！实测会被游戏读回模型导致狂抖，仅留作对照）
		localPosition: true,     // 自己坦克的位置：收益最大
		localRotation: false,    // 自己的角度可能是鼠标直控，动了会变成瞄准延迟
		enemyPosition: true,     // 对手坦克的位置：纯视觉，零风险
		enemyRotation: true,
		entityPosition: true,    // 子弹/地雷/道具等实体的位置
		entityRotation: true,    // 上述实体的角度
		localAuthority: true,    // 自己坦克：位置以客户端为准，服务端修正一律不采纳
		localAuthorityRot: true, // 自己坦克的角度同样以客户端为准
		authFactor: 3,           // 本地权威：超过「中位单帧位移 × 该值」才算服务端修正（越小越严格）

		warmupFrames: 20,        // 坦克：先观察这么多帧的位移分布才启用
		entityWarmupFrames: 6,   // 子弹/地雷等：寿命短，预热必须更短
		frameJumpFactor: 6,      // 单帧位移 > 中位 × 该值 → 记一次"帧跳变"（诊断用）
		minFrameStep: 0.5,       // 位移阈值下限（游戏坐标单位；尺度不同就调它）
		catchUpFactor: 1.8,      // 单帧最多走「正常单帧位移中位数」的几倍（超过就摊开）
		giantFactor: 100,        // 超过 P90 的这么多倍才判定为「物理上不可能」→ 直接对齐。
		                         // 复活/重开由回合事件（TANK_CREATED / ROUND_STARTED…）负责对齐，
		                         // 这里只做兜底，阈值必须放宽，否则会把大卡顿的修正误判成复活
		glideMaxMs: 600,         // 一次滑行的时间预算：无论差距多大，都在这个时间内收敛
		backstopMs: 2400,        // 兜底：目标一直在跑、怎么都追不上时才硬对齐
		profileEvery: 15,        // 每多少帧重算一次位移分布
		stallTickMs: 200,        // 帧循环超过这么久没跑就退化成不干预（防标签页节流冻住坐标）
		deadReckon: true,        // 网络静默 + 模型不动时，按最后速度外推（别让实体冻住）
		deadReckonAfter: 150,    // 网络静默超过这么多毫秒才开始外推
		deadReckonMax: 30,       // 最多连续外推多少帧（≈500ms，之后原地停住不回跳）

		stats: { glides: 0, glideFrames: 0, giveUps: 0, snaps: 0, frameJumps: 0, reckoned: 0, ignored: 0 }
	};

	const SMOOTHERS = [];

	/** 角度差，归一化到 (-π, π]，避免炮管过 ±180° 时被当成巨大跳变 */
	function angleDelta(from, to) {
		let d = (to - from) % (Math.PI * 2);
		if (d > Math.PI) d -= Math.PI * 2;
		else if (d < -Math.PI) d += Math.PI * 2;
		return d;
	}

	function makeSmoother(isAngle, kind) {
		return {
			isAngle: isAngle, kind: kind,
			stored: null, shown: null, init: false,
			curStep: 0, curSigned: 0, motion: 0, vel: 0, backJumps: 0, fwdJumps: 0,
			modelIdle: 0, reckonFrames: 0, quietFrames: 0, quietMoved: 0, quietIdle: 0,
			thresh: 0.5, authThresh: 0.5, ignored: 0, authStep: 0,
			frameSteps: [], times: [], profile: { p90: 0, med: 0, p25: 0, n: 0 }, profileAge: 0,
			gliding: false, glideStart: 0, forceSnap: false,
			frameJumps: 0, maxStep: 0, writes: 0, glideFrames: 0,
			flush: null, lastTickT: 0
		};
	}

	/** 预热帧数：子弹寿命可能只有一两秒，不能跟坦克用同一个值 */
	function warmupFramesFor(sm) {
		return (sm.kind === 'projectile' || sm.kind === 'trap' || sm.kind === 'pickup')
			? SMOOTH.entityWarmupFrames
			: SMOOTH.warmupFrames;
	}

	function axisEnabled(sm) {
		if (!SMOOTH.enabled) return false;
		const kind = sm.kind;

		// 子弹/地雷/道具等实体
		if (kind === 'projectile' || kind === 'trap' || kind === 'pickup') {
			return sm.isAngle ? SMOOTH.entityRotation : SMOOTH.entityPosition;
		}

		const local = kind === 'local';
		return sm.isAngle
			? (local ? SMOOTH.localRotation : SMOOTH.enemyRotation)
			: (local ? SMOOTH.localPosition : SMOOTH.enemyPosition);
	}

	/** 估算这个轴的"每帧间隔"（ms），用于把滑行摊到指定时间预算里 */
	function estimateInterval(sm) {
		const t = sm.times;
		if (t.length < 3) return 16;
		const ivs = [];
		for (let i = 1; i < t.length; i++) ivs.push(t[i] - t[i - 1]);
		return Math.max(4, median(ivs));
	}

	function recomputeProfile(sm) {
		const a = sm.frameSteps;
		const n = a.length;
		if (!n) { sm.profile.p90 = 0; sm.profile.med = 0; sm.profile.p25 = 0; sm.profile.n = 0; return; }
		const sorted = a.slice().sort(function (x, y) { return x - y; });
		sm.profile.p90 = sorted[Math.min(n - 1, Math.floor(n * 0.9))];
		sm.profile.med = median(sorted);
		// p25 用作"正常速度"基线：比中位数更抗抖动污染
		// （抖动会让中位数自己往上飘，于是抖动被当成正常速度放行 —— 小抖动穿透的根因）
		sm.profile.p25 = sorted[Math.min(n - 1, Math.floor(n * 0.25))];
		sm.profile.n = n;
	}

	/** 每帧调用一次：结算这一帧真值移动了多少，并把渲染值朝真值推进一步 */
	function tickSmoothers(t) {
		// 每帧算一次网络静默时长；每个 smoother 都去查一次会触发排序，太浪费
		const quiet = networkQuietMs();

		for (let i = 0; i < SMOOTHERS.length; i++) {
			const sm = SMOOTHERS[i];
			if (!sm.init) continue;

			sm.lastTickT = t;
			sm.ready = sm.frameSteps.length >= warmupFramesFor(sm);

			// —— 结算上一帧：真值在这一帧里一共移动了多少
			const step = sm.curStep;
			const signed = sm.curSigned;
			const authStep = sm.authStep;
			sm.curStep = 0;
			sm.curSigned = 0;
			sm.authStep = 0;
			if (step > 1e-9) {
				sm.frameSteps.push(step);
				if (sm.frameSteps.length > 180) sm.frameSteps.shift();
			}
			if (step > sm.maxStep) sm.maxStep = step;
			if (++sm.profileAge >= SMOOTH.profileEvery) {
				sm.profileAge = 0;
				recomputeProfile(sm);
			}
			const p90 = sm.profile.p90;
			const med = sm.profile.med;
			// 阈值缓存给 setter：判定"这一笔是本地增量还是服务端修正"
			sm.thresh = Math.max(med * SMOOTH.frameJumpFactor, SMOOTH.minFrameStep);
			sm.authThresh = Math.max(med * SMOOTH.authFactor, SMOOTH.minFrameStep);

			// —— 诊断：这一帧的位移是否异常。A 和 B 两种情况都会在这里现形
			let isJump = false;
			if (sm.frameSteps.length >= warmupFramesFor(sm)) {
				const thresh = Math.max(med * SMOOTH.frameJumpFactor, SMOOTH.minFrameStep);
				if (step > thresh) {
					isJump = true;
					sm.frameJumps++;
					SMOOTH.stats.frameJumps++;
					// 与最近"正常运动方向"相反 → 这就是"回弹"
					if (Math.abs(sm.motion) > 1e-6 && signed * sm.motion < 0) sm.backJumps++;
					else sm.fwdJumps++;
				}
			}
			// 方向基线只用正常帧更新：跳变本身不能当方向，否则一次回弹会把方向带反。
			// 而且只有模型真在动的时候才更新——静默期 motion 不能衰减成 0，外推要用它。
			if (!isJump && Math.abs(signed) > 1e-9) sm.motion = sm.motion * 0.85 + signed * 0.15;

			// —— 关键测量：网络静默期间，模型还在自己动吗？
			//   动  → 客户端有本地模拟，瞬移来自服务端修正覆盖
			//   不动 → 位移被网络驱动，需要外推
			if (quiet > 150) {
				sm.quietFrames++;
				sm.quietMoved += step;
				if (step < 1e-9) sm.quietIdle++;
			} else {
				sm.quietFrames = 0; sm.quietMoved = 0; sm.quietIdle = 0;
			}

			// 模型这一帧到底动没动
			if (step < 1e-9) sm.modelIdle++; else { sm.modelIdle = 0; sm.reckonFrames = 0; }

			// 速度基线：模型在动就更新；网络正常且模型静止 = 实体真停了 → 清零
			// （网络静默时保留，否则外推会越来越弱）
			if (Math.abs(signed) > 1e-9) sm.vel = signed;
			else if (quiet <= 150) sm.vel = 0;

			// —— 算出这一帧应该对外暴露的值
			let next = sm.shown;

			if (!axisEnabled(sm)) {
				next = sm.stored;
				sm.gliding = false;
			} else if (sm.forceSnap) {
				next = sm.stored;
				sm.authStep = 0;
				sm.gliding = false;
				sm.forceSnap = false;
				SMOOTH.stats.snaps++;
			} else if (sm.frameSteps.length < warmupFramesFor(sm)) {
				next = sm.stored;                       // 预热期：绝不干预
				sm.gliding = false;
			} else {
				const gap = sm.isAngle ? angleDelta(sm.shown, sm.stored) : (sm.stored - sm.shown);
				const absGap = Math.abs(gap);

				const canReckon = SMOOTH.enabled && SMOOTH.deadReckon && quiet > SMOOTH.deadReckonAfter &&
					sm.modelIdle > 2 && Math.abs(sm.vel) > 1e-6;

				// 网络静默 + 模型不动 → 按最后速度外推，别让实体冻在原地。
				// 关键：外推期间必须豁免下面的 gap 拉回，否则下一帧又被拽回 stored。
				const authority = SMOOTH.enabled && (sm.kind === 'local') &&
					(sm.isAngle ? SMOOTH.localAuthorityRot : SMOOTH.localAuthority);

				if (authority) {
					// 本地权威：位置由客户端自己推进，服务端修正不采纳，
					// 所以绝不朝 stored 拉回（那正是"被服务器拽回去"）。
					let moved = authStep;
					if (Math.abs(moved) < 1e-9 && canReckon && sm.reckonFrames < SMOOTH.deadReckonMax) {
						sm.reckonFrames++;
						moved = sm.vel;
						SMOOTH.stats.reckoned++;
					} else if (Math.abs(moved) > 1e-9) {
						sm.reckonFrames = 0;
					}
					next = sm.shown + moved;
				} else if (canReckon && (absGap < 1e-9 || sm.reckonFrames > 0)) {
					if (sm.reckonFrames < SMOOTH.deadReckonMax) {
						sm.reckonFrames++;
						next = sm.shown + sm.vel;
						SMOOTH.stats.reckoned++;
					} else {
						next = sm.shown;               // 外推到头就原地停住，绝不往回跳
					}
					sm.gliding = false;
				} else if (absGap < 1e-9) {
					sm.reckonFrames = 0;
					sm.gliding = false;                 // 已经对上，零干预
				} else {
					sm.reckonFrames = 0;
					// 巨大跳变（复活 / 重开一局）滑过去会很怪 → 直接对齐
					const giant = Math.max(p90 * SMOOTH.giantFactor, SMOOTH.minFrameStep * 20);
					// 基线用 p25：中位数和 p90 都会被抖动本身抬高，
					// 于是"抖动"被当成正常速度直接放行 —— 小抖动穿透的根因。
					const cap = Math.max(sm.profile.p25 * SMOOTH.catchUpFactor, SMOOTH.minFrameStep);

					if (!sm.gliding && absGap > giant) {
						next = sm.stored;
						SMOOTH.stats.snaps++;
					} else if (absGap <= cap) {
						next = sm.stored;               // 追得上 → 一步到位，零延迟
						sm.gliding = false;
					} else {
						// 追不上才算"滑行"
						if (!sm.gliding) {
							sm.gliding = true;
							sm.glideStart = t;
							SMOOTH.stats.glides++;
						}
						const elapsed = t - sm.glideStart;

						// 兜底：目标一直跑、怎么都追不上 → 硬对齐，绝不无限拖后
						if (elapsed > SMOOTH.backstopMs) {
							next = sm.stored;
							sm.gliding = false;
							SMOOTH.stats.giveUps++;
						} else {
							// 两个约束取较大者：
							//   cap    = 单帧速度上限（小修正靠它，走得柔和）
							//   need   = 在剩余时间预算内走完所需的平均速度（大修正靠它，
							//            保证一定在 glideMaxMs 内收敛，不会拖成慢动作）
							const iv = estimateInterval(sm);
							const framesLeft = Math.max(1, (SMOOTH.glideMaxMs - elapsed) / iv);
							const need = absGap / framesLeft;
							const move = Math.min(absGap, Math.max(cap, need));
							next = sm.shown + (gap > 0 ? move : -move);
							sm.glideFrames++;
							SMOOTH.stats.glideFrames++;
						}
					}
				}
			}

			// —— 关键：把结果写回底层属性，否则渲染会永远慢一帧
			if (next !== sm.shown) {
				sm.shown = next;
				// 只有 stateSmooth 才写回游戏数据；渲染期平滑靠渲染钩子取用 shown，不写状态
				if (SMOOTH.stateSmooth && sm.flush) {
					try { sm.flush(); } catch (e) { /* 单个轴失败不影响其它 */ }
				}
			}
		}
	}

	/** 把某个坦克各轴的平滑统计汇总出来（顺带回填 perAxis） */
	function recStats(r) {
		let glideFrames = 0, frameJumps = 0, maxFrameStep = 0;
		Object.keys(r.smoothers).forEach(function (k) {
			const sm = r.smoothers[k];
			const ax = r.perAxis[k];
			if (ax) {
				ax.frameJumps = sm.frameJumps;
				ax.backJumps = sm.backJumps;
				ax.fwdJumps = sm.fwdJumps;
				ax.glideFrames = sm.glideFrames;
				ax.maxFrameStep = sm.maxStep;
				// 卡顿期间模型到底动没动 —— 这决定了修法
				ax.quietFrames = sm.quietFrames;
				ax.quietMoved = sm.quietMoved;
				ax.quietIdle = sm.quietIdle;
				ax.lastMotion = sm.motion;
				ax.lastVel = sm.vel;
				ax.ignored = sm.ignored;
				ax.divergence = sm.isAngle ? angleDelta(sm.shown, sm.stored) : (sm.shown - sm.stored);
			}
			glideFrames += sm.glideFrames;
			frameJumps += sm.frameJumps;
			if (sm.maxStep > maxFrameStep) maxFrameStep = sm.maxStep;
		});
		return { glideFrames: glideFrames, frameJumps: frameJumps, maxFrameStep: maxFrameStep };
	}

	/** 回合事件 / 重开时，把所有坦克立刻对齐真值 */
	function snapAllSmoothers() {
		SMOOTHERS.forEach(function (sm) { sm.forceSnap = true; });
	}

	/** 记录一处写入的调用栈（按指纹归并），用于确认"谁在改这个坐标" */
	function recordStack(rec, step) {
		let sig;
		try { sig = stackSignature(new Error()); } catch (e) { sig = '?'; }

		let entry = rec.stacks.get(sig);
		if (!entry && rec.stacks.size < CFG.maxStacks) {
			entry = { count: 0, maxStep: 0, stack: '' };
			try { entry.stack = String(new Error().stack || '').split('\n').slice(1, 9).join('\n'); } catch (e) {}
			rec.stacks.set(sig, entry);
		}
		if (entry) {
			entry.count++;
			if (step > entry.maxStep) entry.maxStep = Math.round(step * 100) / 100;
		}
	}

	/**
	 * 渲染期平滑钩子：只在 _renderWebGL/_renderCanvas 被调用的那一瞬把坐标换成平滑值，
	 * 画完立刻还原。游戏状态、相机、服务端校验全程看到真值 ——
	 * 这是唯一不会和游戏打架的做法。
	 */
	function installRenderHook(obj, rec) {
		if (!obj || obj.__ttnRender) return false;
		const smx = rec.smoothers.x, smy = rec.smoothers.y;

		function wrap(name) {
			let orig = null;
			try { orig = obj[name]; } catch (e) {}
			if (typeof orig !== 'function' || orig.__ttnWrapped) return false;
			try {
				const fn = function (renderer) {
					if (!SMOOTH.enabled || !SMOOTH.renderSmooth) return orig.call(this, renderer);
					if (!(smx && smx.ready) && !(smy && smy.ready)) return orig.call(this, renderer);

					// 真正替换过多少次 —— 报告里如果一直是 0，说明渲染路径跟预期不一样
					rec.renderSwaps = (rec.renderSwaps || 0) + 1;

					const x0 = smx ? smx.rawRead() : null;
					const y0 = smy ? smy.rawRead() : null;
					try {
						if (smx && smx.ready) smx.rawWrite(smx.shown);
						if (smy && smy.ready) smy.rawWrite(smy.shown);
						return orig.call(this, renderer);
					} finally {
						// 无论渲染是否抛异常，状态都必须还原
						if (smx && x0 != null) smx.rawWrite(x0);
						if (smy && y0 != null) smy.rawWrite(y0);
					}
				};
				fn.__ttnWrapped = true;
				obj[name] = fn;
				return true;
			} catch (e) { return false; }
		}

		const a = wrap('_renderWebGL');
		const b = wrap('_renderCanvas');
		if (a || b) { try { obj.__ttnRender = true; } catch (e) {} }
		return a || b;
	}

	function watchSprite(sprite, label, kindOverride) {
		if (!sprite || sprite.__ttn) return null;

		const isLocal = label.indexOf('LOCAL') === 0;
		const kind = kindOverride || (isLocal ? 'local' : 'enemy');
		const rec = {
			label: label, isLocal: isLocal,
			writes: 0, jumps: 0, maxStep: 0, glideFrames: 0,
			steps: [], stacks: new Map(), perAxis: {}, smoothers: {}, positionHost: null
		};

		/**
		 * 挂一个轴。兼容两种属性形态：
		 *   - accessor（Phaser/PIXI 的 sprite.x；或 Point 用 defineProperty 定义的 x）→ 委托原 setter
		 *   - 普通数据属性（PIXI.Point 常见的 this.x = 0）→ 在闭包里存值，读写语义完全等价
		 * 两种情况都保证非跳变写入原样生效，不改变游戏行为。
		 */
		function hookAxis(host, axis, isAngle) {
			const desc = findDescriptor(host, axis);
			if (!desc) return false;

			const canDelegate = typeof desc.get === 'function' && typeof desc.set === 'function';
			let stored = desc.value;

			const read = canDelegate ? (o => desc.get.call(o)) : (() => stored);
			const write = canDelegate ? ((o, v) => desc.set.call(o, v)) : ((o, v) => { stored = v; });

			const sm = makeSmoother(isAngle, kind);
			sm.flush = function () { write(host, sm.shown); };
			// 直通读写：渲染钩子用它临时替换/还原，不经过任何平滑逻辑
			sm.rawRead = function () { return read(host); };
			sm.rawWrite = function (val) { write(host, val); };
			rec.smoothers[axis] = sm;
			rec.perAxis[axis] = { writes: 0, maxStep: 0, frameJumps: 0, glideFrames: 0 };
			SMOOTHERS.push(sm);

			try {
				Object.defineProperty(host, axis, {
					configurable: true,
					enumerable: desc.enumerable !== false,
					get: function () { return read(this); },
					set: function (v) {
						if (typeof v !== 'number' || !isFinite(v)) { write(this, v); return; }

						const t = now();

						// 记录写入时刻：滑行时长按真实帧间隔摊，而不是按写入次数
						sm.times.push(t);
						if (sm.times.length > 30) sm.times.shift();

						if (!sm.init) { sm.init = true; sm.stored = v; sm.shown = v; }

						// 累计"这一帧真值移动了多少"——注意是逐帧累计，不是单笔步长
						const sd = sm.isAngle ? angleDelta(sm.stored, v) : (v - sm.stored);
						const d = Math.abs(sd);
						sm.curStep += d;
						sm.curSigned += sd;
						sm.stored = v;
						sm.writes++;
						// 记录速度基线（每笔真实位移）
						if (Math.abs(sd) > 1e-9) sm.vel = sd;

						// 预热期，或帧循环被节流/挂掉时 → 直接跟随真值。
						// 宁可退化成一动不动，也绝对不能把坐标冻在旧值上。
						if (!SMOOTH.enabled ||
							sm.frameSteps.length < warmupFramesFor(sm) ||
							!sm.lastTickT ||
							t - sm.lastTickT > SMOOTH.stallTickMs) {
							sm.shown = v;              // 优化关掉 → 原样跟随游戏真值
							sm.gliding = false;
							sm.authStep = 0;          // 已按绝对值跟随，增量不能再次叠加
						} else {
							// 本地权威模式：只累计"增量"（本地物理算出来的位移），
							// 绝对跳变（服务端回声/修正）不计入 —— 断线结束后就不会被拉回。
							if (Math.abs(sd) <= sm.authThresh) sm.authStep += sd;
							else { sm.ignored++; SMOOTH.stats.ignored++; }
						}

						// 诊断：写入次数、最大单笔步进、周期抽样调用栈
						rec.writes++;
						rec.perAxis[axis].writes++;
						if (d > rec.maxStep) rec.maxStep = d;
						if (d > rec.perAxis[axis].maxStep) rec.perAxis[axis].maxStep = d;
						if (rec.writes % CFG.stackSampleEvery === 0) recordStack(rec, d);

						// 默认：状态一律原样透传，绝不改游戏数据（平滑只发生在渲染瞬间）
						// 只有 stateSmooth 打开时才写回平滑值 —— 那是有害模式，仅用于对照
						write(this, SMOOTH.stateSmooth ? sm.shown : v);
					}
				});
				return true;
			} catch (e) { return false; }
		}

		// 优先挂在 position 上：Phaser/PIXI 的 sprite.x 本身就是委托给 position.x 的，
		// 挂 position 可以同时覆盖 `sprite.x = v` 和 `sprite.position.x = v` 两条写入路径。
		let hooked = 0;
		const pos = sprite.position;
		const usePos = !!pos && typeof pos === 'object' &&
			typeof pos.x === 'number' && typeof pos.y === 'number';

		if (usePos) {
			rec.positionHost = 'position';
			if (hookAxis(pos, 'x', false)) hooked++;
			if (hookAxis(pos, 'y', false)) hooked++;
		} else {
			rec.positionHost = 'sprite';
			if (hookAxis(sprite, 'x', false)) hooked++;
			if (hookAxis(sprite, 'y', false)) hooked++;
		}

		// rotation 始终挂在 sprite 自身（PIXI 把 rotation 存在对象自己身上）
		if (hookAxis(sprite, 'rotation', true)) hooked++;

		// 一个轴都没挂上 → 不留痕迹、不占用名额
		if (!hooked) return null;

		// 装渲染期平滑钩子（挂在精灵上；它内部通过 rawWrite 改的是 position，不是精灵本身）
		try { rec.hasRenderHook = installRenderHook(sprite, rec); } catch (e) {}
		try { sprite.__ttn = rec; } catch (e) { return null; }

		tankWatch.records.push(rec);
		return rec;
	}



	/* ---------------- 找局内状态实例（tankSprites 挂在它身上） ----------------
	 * 上一版只用 Game.state.getCurrentState()，结果在天上挂着没找到，平滑一次都没跑。
	 * 现在改成多路兜底 + 自诊断：把"试过哪些来源、它们长什么样"一起写进报告，
	 * 万一再失败，报告本身就能告诉我该改哪里。 */

	function scanGlobalsForTankSprites() {
		const hits = [];
		const seen = new Set();
		let budget = 2000;

		function looksLikeState(o) {
			try { return !!o && typeof o === 'object' && !!o.tankSprites; } catch (e) { return false; }
		}

		function probe(o, path, depth) {
			if (budget-- <= 0 || !o || typeof o !== 'object' || seen.has(o) || depth > 2) return;
			seen.add(o);

			let keys;
			try { keys = Object.keys(o); } catch (e) { return; }
			if (keys.length > 400) return;                       // 大对象（数组缓存等）跳过

			if (looksLikeState(o)) { hits.push([path, o]); return; }

			const interesting = /^(Game|TankTrouble|Content|OverlayManager|Users|RoundModel|Instance|Game\w*|UIGameState)$/;
			for (let i = 0; i < keys.length; i++) {
				const k = keys[i];
				if (depth === 0 && !interesting.test(k)) continue;   // 第一层只挑像游戏命名空间的
				let v;
				try { v = o[k]; } catch (e) { continue; }
				if (v && typeof v === 'object' && v !== window && !(v instanceof Node)) {
					if (looksLikeState(v)) hits.push([path + '.' + k, v]);
					else probe(v, path + '.' + k, depth + 1);
				}
			}
		}

		probe(window, 'window', 0);
		return hits;
	}

	/** 把所有可能的来源按可靠性排序 */
	function stateCandidates() {
		const out = [];
		if (tankWatch.stateFromHook) out.push(['classy-hook', tankWatch.stateFromHook]);

		try {
			const G = window.Game;
			if (G && G.state) {
				try {
					if (typeof G.state.getCurrentState === 'function') {
						const s = G.state.getCurrentState();
						if (s && typeof s === 'object') out.push(['state.getCurrentState()', s]);
					}
				} catch (e) {}
				try {
					const cur = G.state.current;
					if (cur && typeof cur === 'object') out.push(['state.current', cur]);
					else if (typeof cur === 'string' && G.state.states && G.state.states[cur]) {
						out.push(['state.states[' + cur + ']', G.state.states[cur]]);
					}
				} catch (e) {}
				try {
					if (G.state.states) {
						Object.keys(G.state.states).forEach(function (k) {
							const s = G.state.states[k];
							if (s && typeof s === 'object') out.push(['state.states.' + k, s]);
						});
					}
				} catch (e) {}
			}
		} catch (e) {}

		try { out.push.apply(out, scanGlobalsForTankSprites()); } catch (e) {}
		return out;
	}

	/** 遍历 tankSprites（可能是普通对象 / 数组 / Map 风格） */
	function eachTank(sprites, cb) {
		if (!sprites) return;
		try {
			if (Array.isArray(sprites)) {
				sprites.forEach(function (v, i) { cb(String(i), v); });
			} else if (typeof sprites.forEach === 'function') {
				sprites.forEach(function (v, k) { cb(String(k), v); });
			} else {
				Object.keys(sprites).forEach(function (k) { cb(String(k), sprites[k]); });
			}
		} catch (e) {}
	}

	/** 坦克可能是 Phaser Group：自己没坐标，真正的精灵在 children 里 */
	function hookTankLike(obj, label, depth, kindOverride) {
		if (!obj || typeof obj !== 'object' || depth > 2) return;
		if (obj.position || typeof obj.x === 'number') {
			return watchSprite(obj, label, kindOverride);
		}
		let kids = null;
		try { kids = obj.children; } catch (e) {}
		if (kids && typeof kids.forEach === 'function') {
			const list = [];
			kids.forEach(function (v) { list.push(v); });
			list.forEach(function (v, i) { hookTankLike(v, label + '/' + i, depth + 1); });
		}
	}

	function firstKeys(o, n) {
		try { return Object.keys(o).slice(0, n); } catch (e) { return null; }
	}

	function buildDiscoveryInfo(cands) {
		const info = {
			gameType: typeof window.Game,
			gameKeys: window.Game ? firstKeys(window.Game, 40) : null,
			stateKeys: null,
			stateFoundVia: tankWatch.stateFoundVia || null,
			userIds: localPlayerIds(),
			usersApi: !!(window.Users && typeof window.Users.getAllPlayerIds === 'function'),
			candidates: [],
			globalHits: [],
			note: ''
		};
		try {
			cands.forEach(function (c) {
				let keys = null, hasTanks = false, tankKeys = null;
				try {
					keys = firstKeys(c[1], 30);
					hasTanks = !!c[1].tankSprites;
					if (hasTanks) tankKeys = firstKeys(c[1].tankSprites, 20);
				} catch (e) {}
				info.candidates.push({ src: c[0], isObject: typeof c[1] === 'object', keys: keys, hasTankSprites: hasTanks, tankKeys: tankKeys });
			});
		} catch (e) { info.note += 'candidates 失败:' + e.message + ' '; }

		try {
			const hits = scanGlobalsForTankSprites();
			info.globalHits = hits.map(function (h) { return h[0]; });
			if (!info.candidates.length && hits.length) {
				info.candidates.push({ src: 'scan', keys: firstKeys(hits[0][1], 30), hasTankSprites: true, tankKeys: firstKeys(hits[0][1].tankSprites, 20) });
			}
		} catch (e) { info.note += 'scan 失败:' + e.message; }

		if (!info.candidates.length) info.note += ' 一个候选都没找到：Game 可能还没创建，或状态不在 window 上。';
		return info;
	}

	function attachFromState(st, via) {
		tankWatch.stateSnapshots++;
		tankWatch.stateFoundVia = via;
		tankWatch.discoveryInfo = null;                  // 成功了就别留着旧的失败快照误导人

		if (!tankWatch.stateKeys) tankWatch.stateKeys = firstKeys(st, 70);
		if (!tankWatch.groupKeys) {
			tankWatch.groupKeys = {};
			try {
				Object.keys(st).forEach(function (k) {
					const v = st[k];
					if (v && typeof v === 'object' && v.children && typeof v.children.forEach === 'function') {
						let n = 0;
						try { v.children.forEach(function () { n++; }); } catch (e) {}
						tankWatch.groupKeys[k] = n;
					}
				});
			} catch (e) {}
		}

		const ids = localPlayerIds();
		// 优化关着时也照挂对手：此时脚本是纯观测，需要完整数据
		// （优化开着时才受 enemyPosition/enemyRotation 开关约束）
		const wantEnemies = !SMOOTH.enabled || CFG.watchEnemies ||
			(SMOOTH.enemyPosition || SMOOTH.enemyRotation);

		eachTank(st.tankSprites, function (pid, sprite) {
			const isLocal = ids.indexOf(pid) >= 0;
			const rec = sprite && sprite.__ttn;
			if (rec) {
				// 之前可能是在 spawn 时按"没有 playerId"误判成对手的，这里纠正
				rec.label = (isLocal ? 'LOCAL' : 'ENEMY') + '#' + pid;
				rec.isLocal = isLocal;
				Object.keys(rec.smoothers).forEach(function (k) {
					rec.smoothers[k].kind = isLocal ? 'local' : 'enemy';
				});
				return;
			}
			if (!isLocal && !wantEnemies) return;
			if (tankWatch.records.length >= CFG.maxWatchSprites) return;
			hookTankLike(sprite, (isLocal ? 'LOCAL' : 'ENEMY') + '#' + pid, 0);
		});

		profileModels(st);
	}

	/* 模型字段画像：想按"服务端时间戳"过滤旧状态，就得先知道字段叫什么。
	 * 每秒钟采一次模型对象的字段值，记录每个数值字段的 min/max/last，
	 * 单调递增的那个就是 tick / 时间戳。 */
	const modelProfile = { samples: {}, at: null };

	function sampleValues(o, max) {
		const out = {};
		try {
			Object.keys(o).slice(0, max || 30).forEach(function (k) {
				let v;
				try { v = o[k]; } catch (e) { return; }
				const t = typeof v;
				if (t === 'number' || t === 'string' || t === 'boolean' || v === null) out[k] = v;
				else if (Array.isArray(v)) out[k] = '[arr' + v.length + ']';
				else out[k] = t;
			});
		} catch (e) {}
		return out;
	}

	function profileModels(st) {
		const colls = ['projectiles', 'traps', 'upgrades', 'counters', 'zones', 'collectibles', 'tankSprites'];
		colls.forEach(function (cn) {
			let coll = null;
			try { coll = st[cn]; } catch (e) { return; }
			if (!coll) return;

			let first = null;
			try {
				if (Array.isArray(coll)) first = coll[0];
				else if (typeof coll.forEach === 'function') coll.forEach(function (v) { if (first == null) first = v; });
				else { const ks = Object.keys(coll); if (ks.length) first = coll[ks[0]]; }
			} catch (e) {}
			if (!first || typeof first !== 'object') return;

			const vals = sampleValues(first, 30);
			let prof = modelProfile.samples[cn];
			if (!prof) prof = modelProfile.samples[cn] = { fields: {} };
			prof.lastSeen = Date.now();
			prof.sample = vals;

			Object.keys(vals).forEach(function (k) {
				const v = vals[k];
				if (typeof v !== 'number') return;
				let f = prof.fields[k];
				if (!f) f = prof.fields[k] = { min: v, max: v, last: v, count: 0, inc: 0, dec: 0 };
				if (v < f.min) f.min = v;
				if (v > f.max) f.max = v;
				if (f.count > 0) { if (v > f.last) f.inc++; else if (v < f.last) f.dec++; }
				f.last = v;
				f.count++;
			});
		});
		modelProfile.at = Date.now();
	}

	function probeGame() {
		// 快路径：Classy 钩子已经抓到了活的状态实例，直接用，不做任何扫描
		const hooked = tankWatch.stateFromHook;
		if (hooked && hooked.tankSprites) { attachFromState(hooked, 'classy-hook'); return; }

		// 慢路径（只在还没抓到实例时走，且每秒最多一次全窗口扫描）
		const cands = stateCandidates();
		for (let i = 0; i < cands.length; i++) {
			const st = cands[i][1];
			if (!st || typeof st !== 'object' || !st.tankSprites) continue;
			attachFromState(st, cands[i][0]);
			return;
		}
		if (!tankWatch.discoveryInfo) tankWatch.discoveryInfo = buildDiscoveryInfo(cands);
	}

	/** 挂钩服务端回合事件分发器：统计事件频率 + 顺便抓状态实例 */
	function hookRoundEvents() {
		const S = window.Game && window.Game.UIGameState;
		if (!S || S.__ttnHooked) return;
		try {
			if (typeof S.getMethod !== 'function' || typeof S.method !== 'function') return;

			// create() 是拿到"活的状态实例"最可靠的时机
			try {
				const origCreate = S.getMethod('create');
				if (typeof origCreate === 'function') {
					S.method('create', function () {
						tankWatch.stateFromHook = this;
						return origCreate.apply(this, arguments);
					});
				}
			} catch (e) {}

			const orig = S.getMethod('_roundEventHandler');
			if (typeof orig !== 'function') return;
			S.method('_roundEventHandler', function () {
				try {
					// args[0] 就是状态实例（LoadedByUserscript 里 killedByMessage 也是这么用的）
					if (!tankWatch.stateFromHook && arguments[0] && typeof arguments[0] === 'object') {
						tankWatch.stateFromHook = arguments[0];
					}

					const evt = arguments[2];
					const e = tankWatch.roundEvents.get(evt) || { n: 0, lastT: 0 };
					e.n++;
					e.lastT = Date.now();
					tankWatch.roundEvents.set(evt, e);

					// 除"碰撞"以外的一切回合事件都立刻对齐。
					// 碰撞事件高达 ~90 次/秒（坦克贴墙滑行），对齐它们等于把平滑关掉；
					// 而其余事件（tank created / round started / maze set…）都意味着
					// "实体被摆到了新位置"，滑过去就会看到你说的莫名平移。
					const names = roundEventNames();
					const name = names && names[evt];
					if (name && !/COLLISION/i.test(name) && /MAZE|ROUND|CELEBRATION|CHANGED|CHICKENED|RESET/i.test(name)) {
						snapAllSmoothers();
					}

					// 新实体往往就是在这类事件前后生成的，顺手补一次挂载
					if (name && /CREATED|SET|STARTED/i.test(name)) probeGame();
				} catch (e) {}
				return orig.apply(this, arguments);
			});
			S.__ttnHooked = true;
		} catch (e) {}
	}

	function roundEventNames() {
		try {
			const E = window.RoundModel && window.RoundModel._EVENTS;
			if (!E) return null;
			const out = {};
			Object.keys(E).forEach(k => { out[E[k]] = k; });
			return out;
		} catch (e) { return null; }
	}

	/* ---------------- 实体自动挂载：谁被 spawn，就给谁挂平滑 ----------------
	 * 坦克、子弹、地雷… 都是名字以 UI 开头的 Phaser 精灵类，统一带 spawn()。
	 * 与其去猜组名（projectileGroup? missileGroup?），不如直接把 spawn() 包起来：
	 * 任何实体一生成就自动挂上，回收复用的实例也不重复挂。
	 *
	 * 另一个关键点：spawn 意味着"这是全新位置，不是修正" → 必须立刻对齐，绝不能滑过去。
	 * （你看到的"回合开始 1 秒内坦克莫名平移"，就是新坦克被滑到出生点）
	 */
	const entityStats = { hookedClasses: [], spawns: {}, attached: {}, skipped: [] };

	/** 明显不需要平滑的装饰类，直接跳过，省性能也避免干扰 */
	function skipEntityClass(name) {
		return /Rubble|Particle|Effect|Text|Button|Icon|Overlay|Bar|Label|Panel|Group|Manager|Overlay|Marker|Arrow|Cursor|Name|Avatar|Background|Floor|Wall|Decor/i.test(name);
	}

	function classifyEntity(name) {
		if (/Tank/i.test(name)) return 'tank';
		if (/Projectile|Missile|Bullet|Laser|Bomb|Shell/i.test(name)) return 'projectile';
		if (/Mine|Trap|Spike|Saw/i.test(name)) return 'trap';
		if (/Collectible|Weapon|Upgrade|Counter|Powerup/i.test(name)) return 'pickup';
		return 'other';
	}

	function attachEntity(obj, cls) {
		if (!obj || typeof obj !== 'object') return null;
		if (obj.__ttn) return obj.__ttn;                       // 回收复用：已挂过

		let kind = classifyEntity(cls);
		// 坦克必须区分"自己/对手"：自己身上不平滑角度（炮塔可能是鼠标直控）
		if (kind === 'tank') {
			let pid = null;
			try { pid = obj.playerId != null ? String(obj.playerId) : null; } catch (e) {}
			const ids = localPlayerIds();
			kind = (pid && ids.indexOf(pid) >= 0) ? 'local' : 'enemy';
		}
		if (kind === 'other') {
			if (entityStats.skipped.indexOf(cls) < 0) entityStats.skipped.push(cls);
			return null;
		}
		if (tankWatch.records.length >= CFG.maxWatchSprites + CFG.maxEntitySprites) return null;

		const rec = hookTankLike(obj, 'ENTITY:' + kind + '#' + cls, 0, kind);
		if (!rec) return null;

		rec.entityKind = kind;
		rec.entityClass = cls;
		rec.renderSwaps = 0;
		entityStats.attached[cls] = (entityStats.attached[cls] || 0) + 1;
		return rec;
	}

	function onEntitySpawn(obj, cls) {
		entityStats.spawns[cls] = (entityStats.spawns[cls] || 0) + 1;
		if (!obj || typeof obj !== 'object') return;

		const rec = obj.__ttn || attachEntity(obj, cls);
		if (!rec || !rec.smoothers) return;

		// 生成即对齐：这是全新位置，不是需要平滑的修正。
		// 同时立刻 flush —— 否则回收复用的精灵会先在旧位置闪一帧再跳过去。
		Object.keys(rec.smoothers).forEach(function (k) {
			const sm = rec.smoothers[k];
			sm.forceSnap = true;
			sm.gliding = false;
			sm.shown = sm.stored;
			if (sm.flush) { try { sm.flush(); } catch (e) {} }
		});
	}

	/** 找出所有 "UI*" 精灵类并包住它们的 spawn()。可重复调用（幂等）。 */
	function installSpawnHooks() {
		let added = 0;
		let keys;
		try { keys = Object.keys(window); } catch (e) { return 0; }

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];
			if (!/^UI[A-Z]/.test(k)) continue;

			let C;
			try { C = window[k]; } catch (e) { continue; }
			const proto = C && C.prototype;
			if (!proto || typeof proto.spawn !== 'function' || proto.__ttnSpawn) continue;

			if (skipEntityClass(k)) {
				proto.__ttnSpawn = true;
				entityStats.skipped.push(k);
				continue;
			}

			try {
				const orig = proto.spawn;
				proto.spawn = function () {
					const r = orig.apply(this, arguments);
					try { onEntitySpawn(this, k); } catch (e) { /* 绝不能影响游戏 */ }
					return r;
				};
				proto.__ttnSpawn = true;
				entityStats.hookedClasses.push(k);
				added++;
			} catch (e) { /* 某些原型不可写就跳过 */ }
		}
		return added;
	}

	/* ============================ ②b 区域/线路质量探针 ============================ */
	/*
	 * 为什么不能只看延迟：
	 *   游戏自己每 ~30s 并行探测全部 7 个区域，然后"按 RTT 最低"选服务器。
	 *   但 RTT 好完全可能丢包/抖动差 —— 这正好解释了"连好了/没连好了"的玄学：
	 *   选出来的那条路 RTT 很漂亮，实际每隔几秒丢一簇包，于是频繁瞬移。
	 * 所以这里改成多轮重复采样，按 p50 + 抖动(MAD) + 失败率 综合打分排序。
	 *
	 * 采样协议直接复用游戏自己的探测帧：发 {"_typeId":15} → 收 {"_typeId":28,...}
	 * 目标主机不写死，优先用游戏当前正在探测的那批（避免服务器换 mpN 后失效）。
	 */

	const regionProbe = { running: false, hosts: [], result: null, lastRun: null };

	// 兜底列表：仅在还没观察到游戏自己的探测连接时使用
	const FALLBACK_HOSTS = [
		'asia-central1-mp1.tanktrouble.com',
		'eu-west1-mp1.tanktrouble.com',
		'us-east1-mp2.tanktrouble.com',
		'us-east2-mp1.tanktrouble.com',
		'us-south1-mp1.tanktrouble.com',
		'us-west1-mp1.tanktrouble.com',
		'australia-east1-mp1.tanktrouble.com'
	];

	function regionHosts() {
		const seen = new Set();
		conns.forEach(c => {
			const m = String(c.url).match(/^wss?:\/\/([a-z0-9-]*mp\d+\.tanktrouble\.com)/i);
			if (m) seen.add(m[1]);
		});
		const fromGame = Array.from(seen);
		return fromGame.length ? fromGame : FALLBACK_HOSTS.slice();
	}

	function rawWS() {
		return (window.WebSocket && window.WebSocket.__ttnRaw) || RealWS;
	}

	/** 单次探测：返回 消息 RTT（open→收到应答）与 建连耗时（t0→open） */
	function pingRegion(host, timeoutMs) {
		return new Promise(resolve => {
			const t0 = now();
			let tOpen = null;
			let settled = false;
			let ws = null;
			let timer = null;

			function finish(res) {
				if (settled) return;
				settled = true;
				if (timer) clearTimeout(timer);
				try { if (ws) ws.close(); } catch (e) {}
				resolve(res);
			}

			try {
				ws = new (rawWS())('wss://' + host + ':443');
			} catch (e) { finish({ ok: false, reason: 'ctor' }); return; }

			timer = setTimeout(() => finish({ ok: false, reason: 'timeout' }), timeoutMs);

			ws.onopen = () => {
				tOpen = now();
				try { ws.send('{"_typeId":15}'); } catch (e) { finish({ ok: false, reason: 'send' }); }
			};
			ws.onmessage = () => finish({ ok: true, rtt: now() - (tOpen == null ? t0 : tOpen), total: now() - t0 });
			ws.onerror = () => finish({ ok: false, reason: 'error' });
		});
	}

	/** 纯函数：把一轮轮采样汇总成分数（便于单测） */
	function aggregateRegion(host, rtts, failures) {
		const a = rtts.slice().sort((x, y) => x - y);
		const p50 = median(a);
		const p95 = a.length ? a[Math.min(a.length - 1, Math.floor(a.length * 0.95))] : 0;
		const jitter = median(a.map(v => Math.abs(v - p50)));
		const n = a.length + failures;
		const failRate = n ? failures / n : 1;

		// 抖动权重 ×2、失败一次折合 300ms —— 因为一次丢包重传 ≈ 200~1000ms 停顿
		const score = (a.length ? p50 + 2 * jitter : 9999) + failRate * 300;

		return {
			host: host,
			ok: a.length,
			failed: failures,
			failPercent: Math.round(failRate * 1000) / 10,
			p50: round1(p50),
			p95: round1(p95),
			jitter: round1(jitter),
			score: Math.round(score)
		};
	}

	function rankRegions(list) {
		return list.slice().sort((a, b) => a.score - b.score);
	}

	/**
	 * 多轮探测并排名。手动触发，不要常驻跑（每轮会并行开 N 条连接）。
	 * @param {number} seconds 采样时长，默认 30s
	 */
	async function probeRegions(seconds) {
		if (regionProbe.running) return regionProbe.result;

		const durMs = Math.min(180000, Math.max(6000, (seconds || 30) * 1000));
		const hosts = regionHosts();
		const samples = new Map(hosts.map(h => [h, []]));
		const failures = new Map(hosts.map(h => [h, 0]));

		regionProbe.running = true;
		regionProbe.hosts = hosts;
		regionProbe.result = null;

		const deadline = now() + durMs;
		const maxRounds = Math.ceil(durMs / 1500) + 2;   // 安全阀，避免任何异常下去不循环
		let rounds = 0;

		while (now() < deadline && rounds < maxRounds) {
			rounds++;
			const round = await Promise.all(hosts.map(h => pingRegion(h, 5000)));
			round.forEach((r, i) => {
				const h = hosts[i];
				if (r.ok) samples.get(h).push(r.rtt);
				else failures.set(h, failures.get(h) + 1);
			});
			await new Promise(res => setTimeout(res, 1500));
		}

		regionProbe.result = rankRegions(hosts.map(h => aggregateRegion(h, samples.get(h), failures.get(h))));
		regionProbe.running = false;
		regionProbe.lastRun = new Date().toISOString();
		console.log('[TTN] 区域质量排名（分数越低越好）：', regionProbe.result);
		return regionProbe.result;
	}

	/* ---------------- 真延迟探测（RTT） + 网络静默查询 ----------------
	 * 帧间隔 ≠ 延迟：游戏空闲时帧就停了，间隔能到几千毫秒。
	 * 真延迟要用 ping 量：复用游戏自己的探测帧 {"_typeId":15} → {"_typeId":28}。
	 *
	 * 三个来源，谁先有数据用谁（面板上"延迟来源"会写明，悬浮球灰不灰就看这里）：
	 *   probe —— 我们自己的常驻连接，每 2s 一测（最细，但服务器可能不搭理陌生连接）
	 *   game  —— 游戏自己发的 {"_typeId":15} 和它收到的应答（在它自己的连接上配对，
	 *            这条最能说明"游戏眼里的延迟"，因为它就是游戏在用的连接）
	 *   open  —— 连接 open 到第一帧的时间（含握手，偏大，只做兜底，会标注）
	 * 注意 ping 是小包，测不出大流量状态流的抖动 —— 抖动另算（见 netMetrics）。 */
	const ping = {
		ws: null, host: null, samples: [], pendingAt: 0, started: false,
		connected: false, fails: 0, sends: 0, answers: 0,
		lastErr: null, lastClose: null, sawTypes: {}, failsSinceStart: 0,
		interval: 2000, openedAt: 0, lastAnswerAt: 0
	};

	/** 记一条延迟样本。带 host/src，便于"换服后旧样本不能混进来"和"来源标注"。 */
	function pushLatency(rtt, host, src) {
		if (!(rtt >= 3 && rtt < 5000)) return false;      // 3ms 以下多半是误配；5s 以上是丢包后的下一次
		ping.samples.push({ t: now(), rtt: rtt, host: host || null, src: src || 'probe' });
		if (ping.samples.length > 240) ping.samples.shift();
		return true;
	}

	/** 从连接 URL 取主机名（报告里用来核对"测的是哪条线路"） */
	function connHost(conn) {
		const m = conn && String(conn.url).match(/^wss?:\/\/([^:\/]+)/);
		return m ? m[1] : null;
	}

	function startPingProbe(host) {
		if (!host) return;
		if (ping.started && ping.host === host) return;      // 同一个服，继续测
		if (ping.started) {
			// 换服了：关掉旧探测、清空样本（那些是上一个服的延迟，混在一起就是错的）
			try {
				if (ping.ws) { ping.ws.onclose = null; ping.ws.onerror = null; ping.ws.close(); }
			} catch (e) {}
			if (ping.timer) { clearInterval(ping.timer); ping.timer = null; }
			ping.ws = null;
			ping.connected = false;
			ping.pendingAt = 0;
			ping.samples.length = 0;
			ping.started = false;
			// 诊断计数也跟着清零：新服有没有应答要从头看，别被上一个服的数字盖住
			ping.sends = 0; ping.answers = 0; ping.failsSinceStart = 0; ping.interval = 2000;
			ping.switches = (ping.switches || 0) + 1;
			ping.lastSwitchAt = Date.now();
		}
		ping.started = true;
		ping.host = host;

		function connect() {
			let ws;
			try { ws = new (rawWS())('wss://' + host + ':443'); } catch (e) { ping.fails++; ping.lastErr = 'ctor: ' + e.message; return; }
			ping.ws = ws;
			/* 我们自己这条探测连接也会被 instrument 观测到。
			 * 必须打上标记：① primaryConn 绝不能选它当"游戏连接"
			 * （它是 2 秒才来一帧的节奏，选它 → 帧样本不足 → 整个悬浮球永远灰）；
			 * ② 它的收发不该混进游戏的帧/流量统计。 */
			try {
				const c = conns[conns.length - 1];
				if (c && c.ws === ws) { c.probe = true; c.kind = 'probe'; }
			} catch (e) {}
			ws.onopen = function () { ping.connected = true; ping.openedAt = now(); sendPing(); };
			ws.onclose = function (ev) {
				ping.connected = false;
				// 服务器主动关门 = 我们猜错了协议/被限流，把原因记下来（"一直灰"时全靠这个判断）
				ping.lastClose = { at: Math.round(now()), code: ev && ev.code, reason: (ev && ev.reason) || '', wasClean: !!(ev && ev.wasClean) };
				// 已被换服逻辑关掉的旧连接不要再自动重连
				if (ping.ws !== ws || !ping.started) return;
				setTimeout(connect, 4000);
			};
			ws.onerror = function () { ping.fails++; ping.lastErr = 'ws error'; };
			ws.onmessage = function (ev) {
				if (typeof ev.data !== 'string') return;
				// 先记一笔"服务器会主动发什么"，这样探测不到应答时能看出到底是哪种情况
				let o = null;
				try { o = JSON.parse(ev.data); } catch (e) { o = null; }
				const tid = (o && o._typeId != null) ? o._typeId : (o ? '∅' : 'nonjson');
				const key = String(tid);
				if (ping.sawTypes[key] == null && Object.keys(ping.sawTypes).length < 12) ping.sawTypes[key] = 0;
				if (ping.sawTypes[key] != null) ping.sawTypes[key]++;
				if (!ping.pendingAt) return;
				if (!o || o._typeId !== 28) return;
				const rtt = now() - ping.pendingAt;
				ping.pendingAt = 0;
				if (pushLatency(rtt, host, 'probe')) {
					ping.answers++;
					ping.failsSinceStart = 0;
					ping.interval = 2000;          // 通了就立刻回到 2s，别让退避拖累"实时"
					ping.lastAnswerAt = now();
				}
			};
		}

		function sendPing() {
			if (!ping.ws || ping.ws.readyState !== 1) return;
			try { ping.pendingAt = now(); ping.lastSend = now(); ping.sends++; ping.ws.send('{"_typeId":15}'); } catch (e) {}
		}

		connect();
		ping.timer = setInterval(function () {
			if (!ping.ws || ping.ws.readyState !== 1) return;
			// 上一个 ping 还没回就别发新的，避免样本互相污染
			if (ping.pendingAt && now() - ping.pendingAt < 2500) return;
			if (!ping.pendingAt) {
				// 连续没应答就退避（别把陌生服务器当靶子打）；有应答会立刻回到 2s
				ping.failsSinceStart++;
				if (ping.failsSinceStart >= 10) ping.interval = 15000;
				else if (ping.failsSinceStart >= 5) ping.interval = 5000;
			}
			if (ping.interval > 2000 && now() - (ping.lastSend || 0) < ping.interval) return;
			sendPing();
		}, 2000);   // 2 秒一测，中间的"实时"才有意义
	}

	/** 距上一帧已经多久没动静了（ms） */
	function networkQuietMs() {
		const c = primaryConn();
		if (!c || c.lastT == null) return 0;
		return now() - c.lastT;
	}

	let langMenu = null;

	/** 关掉语言菜单（关闭动画交给 CSS，不用等） */
	const langMenuAnim = { timer: null };

	function closeLangMenu() {
		if (!langMenu || !langMenu.classList.contains('on')) return;
		langMenu.classList.remove('on');          // 先摘掉 → CSS 过渡负责"收起动画"
		if (hudRefs && hudRefs.lang && hudRefs.lang.btn) hudRefs.lang.btn.setAttribute('aria-expanded', 'false');
		if (langMenuAnim.timer) clearTimeout(langMenuAnim.timer);
		langMenuAnim.timer = setTimeout(function () {
			langMenuAnim.timer = null;
			if (langMenu && !langMenu.classList.contains('on')) langMenu.style.display = 'none';
		}, 220);                                   // 动画跑完再从布局里拿掉
	}

	/** 打开语言菜单：贴在按钮下方，超出视口就往上翻 */
	let langMenuScrollTop = 0;      // 上次列表滚到哪儿（用户要求：滚动位置要缓存）

	/**
	 * 语言按钮里的名字"缩到放得下"。
	 * 不同系统/页面字体宽度不一样，写死字号总会有人被截断（用户实测：
	 * "最下面的超长语言名字依旧会被截断"），所以这里实测：放不下就 0.5px 一档往下缩，
	 * 最多缩到 9px；放得下就回到 11px。只影响**按钮上的名字**，列表项不变。
	 */
	function fitLangName() {
		const nm = hudRefs && hudRefs.lang && hudRefs.lang.name;
		if (!nm) return;
		nm.style.fontSize = '11px';
		if (typeof nm.scrollWidth !== 'number') return;
		let px = 11;
		while (px > 9 && nm.scrollWidth > nm.clientWidth) {
			px -= 0.5;
			nm.style.fontSize = px + 'px';
		}
		nm.__fitPx = px;
	}

	/** 把菜单重新贴到语言按钮下方（页面滚动/开合时都走它） */
	function anchorLangMenu() {
		if (!langMenu || !hudRefs || !hudRefs.lang || !hudRefs.lang.btn) return;
		const b = hudRefs.lang.btn.getBoundingClientRect();
		// 菜单宽度**严格等于**按钮宽度（用户要求对齐）；语言名用 11.5px，最长的
		// "Português (Portuguese)" 也能在这个宽度里显示全。
		langMenu.style.width = Math.round(b.width) + 'px';
		langMenu.style.minWidth = Math.round(b.width) + 'px';
		langMenu.style.left = '0px';
		langMenu.style.top = '0px';
		const mh = Math.min(236, 10 * 29 + 12);
		const below = window.innerHeight - b.bottom - 8;
		const above = b.top - 8;
		const h = Math.min(mh, Math.max(96, (below >= 140 || below >= above) ? below : above));
		langMenu.style.maxHeight = Math.round(h) + 'px';
		const top = (below >= 140 || below >= above) ? (b.bottom + 4) : Math.max(4, b.top - h - 4);
		const menuW = Math.round(b.width);
		let left = b.left;
		if (left + menuW > window.innerWidth - 4) left = Math.max(4, window.innerWidth - menuW - 4);
		langMenu.style.left = Math.round(left) + 'px';
		langMenu.style.top = Math.round(top) + 'px';
	}

	function openLangMenu() {
		if (!langMenu || !hudRefs || !hudRefs.lang || !hudRefs.lang.btn) return;
		const b = hudRefs.lang.btn.getBoundingClientRect();
		langMenu.style.maxHeight = '';
		if (langMenuAnim.timer) { clearTimeout(langMenuAnim.timer); langMenuAnim.timer = null; }
		langMenu.style.display = 'block';          // 先入场（display）再加 .on → 展开动画
		anchorLangMenu();
		void langMenu.offsetWidth;
		langMenu.classList.add('on');
		// 恢复上次的滚动位置；第一次打开（还没滚过）就把当前语言滚进可视区
		const want = langMenuScrollTop;
		langMenu.scrollTop = want;
		if (want <= 0) {
			const cur = langMenu.querySelector('.ttn-langitem[aria-selected="true"]');
			if (cur && cur.scrollIntoView) {
				try { cur.scrollIntoView({ block: 'nearest' }); } catch (e) {}
			}
		}
		hudRefs.lang.btn.setAttribute('aria-expanded', 'true');
	}

	function toggleLangMenu() {
		if (langMenu && langMenu.classList.contains('on')) closeLangMenu();
		else openLangMenu();
	}

	/** 把当前语言铺到界面上：标题、行标签、按钮、下拉框、RTL。 */
	function applyLang() {
		if (!hud) return;
		if (hudRefs) {
			const pairs = [['line', 'line'], ['live', 'live'], ['avg', 'avg'], ['max', 'max'], ['jit', 'jit'],
				['stab', 'stab'], ['opt', 'opt'], ['status', 'status'], ['lang', 'lang']];
			pairs.forEach(function (p) {
				const ref = hudRefs[p[0]];
				if (ref && ref.k) setRoll(ref.k, tr(p[1]));   // 标签也要有动画
			});
			if (hudRefs.ballT && hudRefs.ballT.pre) setRoll(hudRefs.ballT.pre, tr('ballAvg') + ' ');
			if (hudRefs.ballB && hudRefs.ballB.pre) setRoll(hudRefs.ballB.pre, tr('ballStab') + ' ');
			if (hudRefs.lang && hudRefs.lang.name) {
				const cur = LANGS.filter(function (l) { return l[0] === LANG; })[0] || LANGS[0];
				setRoll(hudRefs.lang.name, cur[1]);
				if (hudRefs.lang.btn) hudRefs.lang.btn.title = tr('lang');
				fitLangName();          // 名字放不下就把**按钮里**的字号一点点缩小
			}
		}
		if (langMenu) {
			const items = langMenu.children || [];
			for (let i = 0; i < items.length; i++) {
				const it = items[i];
				it.setAttribute('aria-selected', it.getAttribute('data-lang') === LANG ? 'true' : 'false');
			}
		}
		const title = hud.querySelector('#ttn-title');
		if (title) setRoll(title, tr('title'));
		const dot = hud.querySelector('#ttn-dot');
		if (dot) dot.title = tr('dotTip');
		const rowsEl = hud.querySelector('#ttn-rows');
		if (rowsEl) rowsEl.dir = 'ltr';   // 排版方向保持 LTR，阿拉伯语靠下面的 isolate 正确显示
		const btns = hud.querySelectorAll('.ttn-btn');
		if (btns[0]) btns[0].title = tr('optTip');
		if (btns[1]) { btns[1].title = tr('reportTip'); setRoll(btns[1], tr('reportBtn')); }
		updateOptLabel();
		refreshHud();
	}

	/** 换语言：立刻生效 + 存档（返回生效后的代码） */
	function setLang(code) {
		if (!isLang(code)) return LANG;
		if (code !== LANG) { LANG = code; applyLang(); saveHudState(); }
		else closeLangMenu();
		return LANG;
	}

	/* ============================ ③ HUD（面板 / 收起后的悬浮球+数据条） ============================ */

	const HUD_CSS = [
		/* ---------- 面板本体 ---------- */
		'#ttn-root{position:fixed;left:0;top:0;z-index:2147483000;width:288px;display:none;',
		'font:12px/1.5 "Segoe UI",system-ui,-apple-system,"Microsoft YaHei",sans-serif;',
		'color:#e4e8ef;background:rgba(20,22,28,.95);border:1px solid rgba(255,255,255,.12);border-radius:12px;',
		'box-shadow:0 12px 34px rgba(0,0,0,.62);backdrop-filter:blur(6px);overflow:hidden;',
		'transform-origin:0 0;user-select:none;-webkit-user-select:none;transition:opacity .22s ease}',
		'#ttn-root *{box-sizing:border-box}',

		/* ---------- 标题栏 ---------- */
		'#ttn-head{position:relative;display:flex;align-items:center;gap:8px;padding:9px 10px 9px 44px;',
		'min-height:44px;cursor:move;touch-action:none;',
		'background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.028));',
		'border-bottom:1px solid rgba(255,255,255,.08);transition:background .22s ease}',
		'#ttn-head:hover{background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05))}',
		/* 圆点 = 面板上的"收起"按钮，也是收起后悬浮球的落点。
		 * 24px；left/top 取 7（相对标题栏 padding box 定位，面板另有 1px 边框）→
		 * 7+1+12 = 20，圆心严格落在变换原点 (20,20) 上。 */
		'#ttn-dot{position:absolute;left:7px;top:7px;width:24px;height:24px;box-sizing:border-box;',
		'border-radius:50%;background:#8b93a1;box-shadow:0 0 7px currentColor;cursor:pointer;',
		'transition:transform .14s ease,box-shadow .3s ease,background .4s ease,color .4s ease}',
		/* hover 不许改尺寸：交接时圆点必须和球的最后一帧同尺寸，改 scale 就会"先到位再变大一点" */
		'#ttn-dot:hover{box-shadow:0 0 15px currentColor,0 0 0 1px rgba(255,255,255,.22) inset}',
		
		'#ttn-dot::after{content:"";position:absolute;left:50%;top:50%;width:10px;height:3px;',
		'background:rgba(0,0,0,.62);border-radius:2px;transform:translate(-50%,-50%)}',
		'#ttn-title{font-weight:600;font-size:12px;flex:1 1 auto;min-width:0;white-space:nowrap;direction:ltr;unicode-bidi:isolate;',
		'transition:opacity .2s ease;',
		'overflow:hidden;text-overflow:ellipsis}',
		'#ttn-ver{color:#7b8494;font-size:10px;flex:0 0 auto}',

		/* ---------- 数值行 ----------
		 * 标签允许换行（俄语/葡萄牙语标签很长），数值不换行但也绝不溢出：
		 * 一律 white-space:normal + overflow-wrap，宁可折行也不要"被截断"。 */
		'#ttn-body{padding:9px 10px 10px}',
		'#ttn-rows{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:6px 8px;align-items:baseline}',
		'.ttn-k{color:#98a1b0;font-size:12px;line-height:1.35;white-space:nowrap;overflow:hidden;',
		'text-overflow:ellipsis;',
		/* 阿拉伯语等 RTL 文本在 LTR 面板里要"自成一段"：否则 "62 ms" 会被整行方向翻成 "ms 62"，
		 * 单位/图标的位置也会跟着乱跑。 */
		'unicode-bidi:isolate}',
		'.ttn-v{text-align:right;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
		'font-variant-numeric:tabular-nums;',
		'direction:ltr;unicode-bidi:isolate;',
		'font-weight:600;font-size:12px;line-height:1.35;transition:color .4s ease}',
		'.ttn-sub{display:block;font-weight:400;font-size:10px;line-height:1.4;color:#8b93a1;',
		'white-space:normal;overflow-wrap:anywhere;text-align:right;margin-top:1px;unicode-bidi:isolate}',
		/* 会变的数字/文字：**单层**从下往上浮入（位置动画，不裁剪、不闪烁）。
		 * 之前用"两层 + overflow:hidden" → 数字和旁边单位错位、长文本（比如线路名）
		 * 被旧宽度裁掉。单层 inline-block 的基线就是它最后一行的基线，和旁边文字天然对齐。 */
		/* 所有"会变的文字"共用同一套过渡：标签、标题、按钮、球里的前缀、状态说明、
		 * 副行的词……换语言时它们全都要有动画（用户要求）。 */
		'.ttn-anim{display:inline-block;white-space:nowrap;vertical-align:baseline;',
		'transition:transform .26s cubic-bezier(.2,.85,.3,1),opacity .26s ease}',
		'.roll{display:inline-block;white-space:nowrap;vertical-align:baseline;',
		'transition:transform .26s cubic-bezier(.2,.85,.3,1),opacity .26s ease}',

		/* ---------- 语言选择 ---------- */
		'.ttn-langrow{grid-column:1/-1;display:flex;align-items:center;gap:8px;margin-top:3px}',
		'.ttn-langrow .ttn-k{flex:0 0 62px;overflow:hidden;text-overflow:ellipsis}',
		'#ttn-langbtn{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;cursor:pointer;',
		'background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#e4e8ef;',
		'font-size:12px;line-height:1.3;padding:5px 8px;text-align:left;',
		'transition:background .18s ease,border-color .2s ease,box-shadow .25s ease}',
		'#ttn-langbtn:hover{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.24)}',
		'#ttn-langbtn:focus-visible{outline:none;border-color:#4ade80;box-shadow:0 0 0 2px rgba(74,222,128,.25)}',
		'#ttn-langbtn[aria-expanded="true"]{border-color:rgba(74,222,128,.55);background:rgba(74,222,128,.12)}',
		'#ttn-langname{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;',
		'direction:ltr;unicode-bidi:isolate;font-size:11px}',
		'#ttn-langarrow{flex:0 0 auto;color:#9aa3b2;font-size:9px;transition:transform .22s ease}',
		'#ttn-langbtn[aria-expanded="true"] #ttn-langarrow{transform:rotate(180deg)}',
		/* 菜单挂在 documentElement 上：面板是 overflow:hidden 且带 transform，
		 * 放在面板里一定会被剪掉（也就会"显示不全"）。 */
		'#ttn-langmenu{position:fixed;z-index:2147483200;display:none;box-sizing:border-box;width:auto;',
		'max-width:calc(100vw - 16px);',
		'max-height:236px;overflow-y:auto;overscroll-behavior:contain;padding:5px;',
		'background:rgba(24,26,33,.985);border:1px solid rgba(255,255,255,.16);border-radius:10px;',
		'box-shadow:0 14px 34px rgba(0,0,0,.62);opacity:0;transform:translateY(-5px);',
		'transition:opacity .16s ease,transform .18s ease}',
		'#ttn-langmenu.on{display:block;opacity:1;transform:translateY(0)}',
		/* 收起时 JS 会先摘掉 .on（跑过渡），200ms 后再 display:none */
		'#ttn-langmenu::-webkit-scrollbar{width:8px}',
		'#ttn-langmenu::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:4px}',
		'.ttn-langitem{display:flex;align-items:center;gap:6px;padding:6px 7px;border-radius:7px;cursor:pointer;',
		'color:#dbe1ea;font-size:12px;line-height:1.4;white-space:nowrap;unicode-bidi:isolate;',
		'transition:background .15s ease,color .15s ease}',
		'.ttn-langitem:hover{background:rgba(255,255,255,.12)}',
		'.ttn-langitem[aria-selected="true"]{background:rgba(74,222,128,.14);color:#eafff2}',
		'.ttn-langitem .nm{flex:1 1 auto;min-width:0}',
		'.ttn-langitem .ck{flex:0 0 auto;color:#4ade80;font-size:9px;opacity:0;transition:opacity .18s ease}',
		'.ttn-langitem[aria-selected="true"] .ck{opacity:1}',

		/* 「线路」可点击复制（只给手型 + hover 底色，不再有"点击复制完整名称"的提示字） */
		'.ttn-copy{cursor:pointer;transition:color .3s ease,background .2s ease;border-radius:5px;padding:0 3px}',
		'.ttn-copy:hover{background:rgba(255,255,255,.1)}',
		/* 复制成功：在标题处闪一句"已复制线路"（淡入 + 轻微上浮 → 停留 → 淡出） */
		'#ttn-copied{position:absolute;left:44px;right:8px;top:50%;transform:translateY(-50%) translateX(-4px);',
		'color:#4ade80;font-size:11px;font-weight:600;opacity:0;pointer-events:none;',
		'transition:opacity .22s ease,transform .26s cubic-bezier(.2,.85,.3,1);white-space:nowrap;',
		'overflow:hidden;text-overflow:ellipsis}',
		'#ttn-copied.on{opacity:1;transform:translateY(-50%) translateX(0)}',
		/* 提示显示时把标题淡出，避免两行字叠在一起（交叉淡入淡出） */
		'#ttn-root.ttn-copied #ttn-title{opacity:0}',

		/* ---------- 悬浮提示：被裁文字的完整内容（出现/消失都有动画） ---------- */
		'#ttn-tip{position:fixed;z-index:2147483210;display:none;max-width:min(420px,calc(100vw - 12px));',
		'padding:5px 9px;border-radius:8px;background:rgba(24,26,33,.98);color:#e9eef6;',
		'border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 26px rgba(0,0,0,.6);',
		'font:11.5px/1.35 "Segoe UI",system-ui,"Microsoft YaHei",sans-serif;white-space:nowrap;',
		'pointer-events:none;opacity:0;transform:translateY(4px) scale(.98);',
		'transition:opacity .18s ease,transform .22s cubic-bezier(.2,.85,.3,1)}',
		'#ttn-tip.on{opacity:1;transform:translateY(0) scale(1)}',

		/* ---------- 状态行：收放走高度+透明度，别把面板"啪"地撑高 ---------- */
		'#ttn-status{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:4px 10px;',
		'align-items:baseline;overflow:hidden;max-height:0;opacity:0;',
		'transition:max-height .28s ease,opacity .22s ease}',
		'#ttn-status.on{max-height:76px;opacity:1}',
		'#ttn-status .ttn-v{white-space:normal;overflow-wrap:anywhere;text-align:left;font-weight:400;',
		'font-size:10px;line-height:1.4;color:#8b93a1}',

		/* ---------- 底部按钮 ---------- */
		'.ttn-foot{display:flex;gap:6px;margin-top:9px;padding-top:9px;border-top:1px solid rgba(255,255,255,.08)}',
		'.ttn-btn{cursor:pointer;flex:1 1 0;min-width:0;border:1px solid rgba(255,255,255,.13);',
		'background:rgba(255,255,255,.06);color:#e4e8ef;border-radius:8px;padding:6px 4px;font-size:12px;line-height:1.2;',
		'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;unicode-bidi:isolate;',
		'transition:background .18s ease,color .3s ease,border-color .3s ease,transform .14s ease,box-shadow .2s ease}',
		'.ttn-btn:hover{background:rgba(255,255,255,.18);transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.35)}',
		'.ttn-btn:active{transform:translateY(0) scale(.985)}',
		'.ttn-btn:focus-visible{outline:none;border-color:#4ade80;box-shadow:0 0 0 2px rgba(74,222,128,.25)}',

		/* ---------- 收起后的悬浮球 ---------- */
		'#ttn-ball{position:fixed;left:0;top:0;z-index:2147483100;width:66px;height:66px;box-sizing:border-box;',
		'border-radius:50%;display:none;flex-direction:column;align-items:center;justify-content:center;',
		'cursor:pointer;background:rgba(18,20,26,.95);border:3px solid #4ade80;color:#e4e8ef;',
		'box-shadow:0 6px 20px rgba(0,0,0,.5),0 0 14px -3px currentColor;',
		'pointer-events:auto;user-select:none;touch-action:none;',
		'font:9px/1.1 "Segoe UI",system-ui,"Microsoft YaHei",sans-serif;font-variant-numeric:tabular-nums;',
		/* filter 必须一起过渡：hover 改的就是 brightness()，漏了它那一下就是硬切 */
		'transition:filter .3s ease,border-color .4s ease,box-shadow .4s ease,color .4s ease,opacity .18s ease,transform .28s cubic-bezier(.2,.8,.3,1)}',

		/* 开/关的语义：关=稍暗但保留颜色；开=提亮（和 hover 同一种"更亮"）+ 黑投影减弱。
		 * 光晕用**真实子元素** .halo，动画全部由 JS（Web Animations API）驱动 ——
		 * 不再依赖 CSS 过渡/关键帧那套"动画覆盖过渡"的坑（用户实测过"开关瞬变"）。 */
		/* 拖动中：跟手优先，关掉过渡（用 class，不用内联样式 —— 内联会漏、卡住就永远瞬变） */
		'.ttn-drag{transition:none !important}',
		'#ttn-ball .hover-glow{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;',
		'pointer-events:none;opacity:0;transition:opacity .18s ease;',
		/* 中心**不**最亮：微弱一点，主要在边缘拉起来（用户："边缘以及外部发光太弱，比中心弱"） */
		'background:radial-gradient(circle,rgba(255,255,255,.10) 0%,rgba(255,255,255,.06) 52%,rgba(255,255,255,.34) 88%,rgba(255,255,255,.5) 100%)}',
		'#ttn-ball .halo{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;',
		'pointer-events:none;opacity:0;',
		'background:radial-gradient(circle,rgba(255,255,255,.55) 0%,rgba(255,255,255,.18) 45%,rgba(255,255,255,0) 74%)}',
		'#ttn-ball:not(.on){filter:saturate(.95) brightness(.94);box-shadow:0 7px 20px rgba(0,0,0,.5)}',
		'#ttn-ball.on{filter:saturate(1) brightness(1.18);box-shadow:0 6px 18px rgba(0,0,0,.42),0 0 12px -2px currentColor}',
		/* hover = **相对**当前状态略微变亮（不是绝对数值），并且主要是内部发光：
		 *  · 内部发光用一层 .hover-glow 子元素（CSS opacity 过渡，能和状态规则叠加，不会互相覆盖）；
		 *  · 亮度只加一点点，且分状态给 —— 关的时候也要"比关亮一点"，但绝不该亮到开启态。
		 *  · 不要白环、不要大改阴影：那都是"额外的可见物体"（用户明确不要）。 */
		'#ttn-ball:hover .hover-glow{opacity:.62}',
		/* 边缘更亮（inset 描边）+ 外发光（柔和光晕，不是白环那种"额外物体"）+ 只加一点点整体亮度 */
		'#ttn-ball.on:hover{filter:saturate(1) brightness(1.26);',
		'box-shadow:0 6px 18px rgba(0,0,0,.42),0 0 20px -3px currentColor,inset 0 0 0 1px rgba(255,255,255,.34)}',
		'#ttn-ball:not(.on):hover{filter:saturate(.95) brightness(1.0);',
		'box-shadow:0 7px 20px rgba(0,0,0,.5),0 0 18px -4px currentColor,inset 0 0 0 1px rgba(255,255,255,.26)}',
		/* 按下**不做**任何状态：点击不是一种观感（用户明确要求），
		 * 而且它还会和 hover 抢层叠、和变形抢尺寸。拖动本身有指针跟随就够了。 */
		/* 小圆点与大球同一套语义（同样用 .halo 子元素 + JS 动画） */
		'#ttn-dot .halo{position:absolute;left:-1px;top:-1px;right:-1px;bottom:-1px;border-radius:50%;',
		'pointer-events:none;opacity:0;',
		'background:radial-gradient(circle,rgba(255,255,255,.6) 0%,rgba(255,255,255,.2) 48%,rgba(255,255,255,0) 72%)}',
		/* 开关两个方向都要有过渡 → transition 写在基样式上，而不是只写在 :not(.on) 里 */
		'#ttn-dot{transition:transform .14s ease,box-shadow .3s ease,background .4s ease,color .4s ease,filter .45s ease}',
		'#ttn-dot:not(.on){filter:saturate(.95) brightness(.94)}',
		'#ttn-dot.on{filter:saturate(1) brightness(1.18)}',
		'#ttn-dot .halo{pointer-events:none}',
		'#ttn-ball .t,#ttn-ball .m,#ttn-ball .b{transition:color .4s ease;max-width:60px;',
		'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}',
		'#ttn-ball .t,#ttn-ball .m,#ttn-ball .b{transition:opacity .18s ease}',
		'#ttn-ball.morph .t,#ttn-ball.morph .m,#ttn-ball.morph .b{opacity:0}',
		'#ttn-ball .t{font-size:9px;line-height:1.05}',
		'#ttn-ball .m{font-size:15px;font-weight:700;line-height:1.15;letter-spacing:-.3px}',
		'#ttn-ball .roll{min-width:0;vertical-align:-.1em}',
		'#ttn-ball .b{font-size:9px;line-height:1.05}',

		/* 系统开了"减少动态效果"→ 动画全关 */
		'@media (prefers-reduced-motion: reduce){ #ttn-root *,#ttn-langmenu,#ttn-langmenu *,#ttn-ball{',
		'transition:none !important;animation:none !important} }'
	].join('');

	let hud = null, hudBall = null;
	let hudRefs = null;         // 面板/悬浮球里那些『要变的值』的节点引用（增量更新用）
	const hudCache = { w: 288, h: 198, BALL: 66 };
	let hudState = { x: 8, y: 8, ball: false, hidden: false };
	let hudAnimating = false;
	const HUD_KEY = 'ttn.hud.v4';

	/* ============================ 多语言（10 国） ============================
	 * 语言代码与显示名沿用 TankTrouble-Chat-Fix 的那一套（en/zh/ja/ko/ru/ar/fr/es/de/pt），
	 * 这样同一台机器上两个插件的语言是一致的。
	 * 选中的语言会和「优化开关」「悬浮球位置/收起状态」一起存进 localStorage（键 ttn.hud.v4，向后兼容）。
	 */
	const LANGS = [
		['en', 'English'],
		['zh', '中文 (Chinese)'],
		['ja', '日本語 (Japanese)'],
		['ko', '한국어 (Korean)'],
		['ru', 'Русский (Russian)'],
		['ar', 'العربية (Arabic)'],
		['fr', 'Français (French)'],
		['es', 'Español (Spanish)'],
		['de', 'Deutsch (German)'],
		['pt', 'Português (Portuguese)']
	];

	const I18N = {
		en: {
			title: 'TankTrouble Network', line: 'Line', live: 'Live ping', avg: 'Avg ping', max: 'Max latency', jit: 'Jitter',
			stab: 'Stability', opt: 'Optimize', status: 'Status', lang: 'Language',
			on: 'ON', off: 'OFF', btnOn: 'ON', btnOff: 'OFF', smoothed: 'smoothed', ignored: 'corrections ignored',
			rttJitter: '· RTT jitter', ballAvg: 'Avg', ballStab: 'Stab',
			waitConn: 'waiting for connection…', dotTip: 'Collapse into floating ball', copiedLine: 'Line copied',
			optTip: 'Toggle optimization (live A/B)', reportBtn: '⤓ Report', reportTip: 'Export diagnostic report',
			whyWaitGame: 'waiting for the game socket…', whyProbeOff: 'latency probe not started',
			whyProbeDown: 'latency probe not connected{code}', whyClose: ' (close code {code})',
			whyProbeSilent: 'latency probe silent after {n} pings{types}', whyTypes: ' (server sends only {t})',
			whyLatThin: 'not enough latency samples ({n}/3)',
			whyFrameSparse: 'not enough frame samples (lobby / between rounds)'
		},
		zh: {
			title: 'TankTrouble 网络', line: '线路', live: '实时延迟', avg: '平均延迟', max: '最大延迟', jit: '小抖动',
			stab: '稳定度', opt: '优化', status: '状态', lang: '语言',
			on: '开', off: '关', btnOn: '开', btnOff: '关', smoothed: '已抹平', ignored: '忽略修正',
			rttJitter: '· RTT 抖动', ballAvg: '平均', ballStab: '稳定',
			waitConn: '等待连接…', dotTip: '收起成悬浮球', copiedLine: '已复制线路',
			optTip: '开/关网络优化（实时对比）', reportBtn: '⤓ 报告', reportTip: '导出诊断报告',
			whyWaitGame: '等待游戏连接…', whyProbeOff: '延迟探测未启动',
			whyProbeDown: '延迟探测未连上{code}', whyClose: '（关闭码 {code}）',
			whyProbeSilent: '延迟探测 {n} 次无应答{types}', whyTypes: '（对方只发 {t}）',
			whyLatThin: '延迟样本不足（{n}/3）',
			whyFrameSparse: '帧样本不足（大厅/局间）'
		},
		ja: {
			title: 'TankTrouble ネットワーク', line: '回線', live: 'リアルタイム遅延', avg: '平均遅延', max: '最大遅延', jit: 'ジッター',
			stab: '安定度', opt: '最適化', status: '状態', lang: '言語',
			on: 'オン', off: 'オフ', btnOn: 'オン', btnOff: 'オフ', smoothed: '平滑化', ignored: '修正を無視',
			rttJitter: '· RTT ジッター', ballAvg: '平均', ballStab: '安定',
			waitConn: '接続を待機…', dotTip: 'ボールに折りたたむ', copiedLine: '回線をコピーしました',
			optTip: '最適化のオン/オフ（A/B 比較）', reportBtn: '⤓ レポート', reportTip: '診断レポートを書き出す',
			whyWaitGame: 'ゲーム接続を待機…', whyProbeOff: '遅延プローブ未起動',
			whyProbeDown: '遅延プローブ未接続{code}', whyClose: '（コード {code} で切断）',
			whyProbeSilent: '{n} 回応答なし{types}', whyTypes: '（相手は {t} のみ送信）',
			whyLatThin: '遅延サンプル不足（{n}/3）',
			whyFrameSparse: 'フレームサンプル不足（ロビー/ラウンド間）'
		},
		ko: {
			title: 'TankTrouble 네트워크', line: '회선', live: '실시간 지연', avg: '평균 지연', max: '최대 지연', jit: '지터',
			stab: '안정도', opt: '최적화', status: '상태', lang: '언어',
			on: '켜짐', off: '꺼짐', btnOn: '켜짐', btnOff: '꺼짐', smoothed: '평활화', ignored: '보정 무시',
			rttJitter: '· RTT 지터', ballAvg: '평균', ballStab: '안정',
			waitConn: '연결 대기 중…', dotTip: '공으로 접기', copiedLine: '회선 복사됨',
			optTip: '최적화 켜기/끄기(실시간 A/B)', reportBtn: '⤓ 보고서', reportTip: '진단 보고서 내보내기',
			whyWaitGame: '게임 연결 대기 중…', whyProbeOff: '지연 프로브 미시작',
			whyProbeDown: '지연 프로브 미연결{code}', whyClose: '(종료 코드 {code})',
			whyProbeSilent: '{n}회 무응답{types}', whyTypes: '(상대는 {t}만 전송)',
			whyLatThin: '지연 샘플 부족({n}/3)',
			whyFrameSparse: '프레임 샘플 부족(로비/라운드 사이)'
		},
		ru: {
			title: 'TankTrouble Сеть', line: 'Линия', live: 'Текущий пинг', avg: 'Средний пинг', max: 'Макс. задержка', jit: 'Джиттер',
			stab: 'Стабильность', opt: 'Оптимизация', status: 'Статус', lang: 'Язык',
			on: 'ВКЛ', off: 'ВЫКЛ', btnOn: 'ВКЛ', btnOff: 'ВЫКЛ', smoothed: 'сглажено', ignored: 'правок проигнор.',
			rttJitter: '· джиттер RTT', ballAvg: 'Сред.', ballStab: 'Стаб.',
			waitConn: 'ожидание соединения…', dotTip: 'Свернуть в шар', copiedLine: 'Линия скопирована',
			optTip: 'Вкл/выкл оптимизацию (A/B)', reportBtn: '⤓ Отчёт', reportTip: 'Экспорт отчёта',
			whyWaitGame: 'ожидание соединения с игрой…', whyProbeOff: 'пробник задержки не запущен',
			whyProbeDown: 'пробник не подключён{code}', whyClose: ' (код {code})',
			whyProbeSilent: '{n} пингов без ответа{types}', whyTypes: ' (сервер шлёт только {t})',
			whyLatThin: 'мало замеров задержки ({n}/3)',
			whyFrameSparse: 'мало замеров кадров (лобби/между раундами)'
		},
		ar: {
			title: 'شبكة TankTrouble', line: 'الخط', live: 'التأخير اللحظي', avg: 'متوسط التأخير', max: 'أقصى تأخير', jit: 'الاهتزاز',
			stab: 'الاستقرار', opt: 'التحسين', status: 'الحالة', lang: 'اللغة',
			on: 'مفعّل', off: 'معطّل', btnOn: 'مفعّل', btnOff: 'معطّل', smoothed: 'تم التنعيم', ignored: 'تصحيحات مُهملة',
			rttJitter: '· اهتزاز RTT', ballAvg: 'المتوسط', ballStab: 'الاستقرار',
			waitConn: 'في انتظار الاتصال…', dotTip: 'الطي إلى كرة', copiedLine: 'تم نسخ الخط',
			optTip: 'تشغيل/إيقاف التحسين (مقارنة)', reportBtn: '⤓ تقرير', reportTip: 'تصدير تقرير التشخيص',
			whyWaitGame: 'في انتظار اتصال اللعبة…', whyProbeOff: 'مسبار التأخير غير مُشغّل',
			whyProbeDown: 'مسبار التأخير غير متصل{code}', whyClose: ' (رمز الإغلاق {code})',
			whyProbeSilent: '{n} محاولات بلا رد{types}', whyTypes: ' (الخادم يرسل {t} فقط)',
			whyLatThin: 'عيّنات تأخير غير كافية ({n}/3)',
			whyFrameSparse: 'عيّنات إطارات غير كافية (الردهة/بين الجولات)'
		},
		fr: {
			title: 'TankTrouble Réseau', line: 'Ligne', live: 'Ping actuel', avg: 'Ping moyen', max: 'Latence max', jit: 'Gigue',
			stab: 'Stabilité', opt: 'Optimisation', status: 'État', lang: 'Langue',
			on: 'ACTIVÉ', off: 'DÉSACTIVÉ', btnOn: 'ACTIVÉ', btnOff: 'DÉSACTIVÉ', smoothed: 'lissé', ignored: 'corrections ignorées',
			rttJitter: '· gigue RTT', ballAvg: 'Moy.', ballStab: 'Stab.',
			waitConn: 'en attente de connexion…', dotTip: 'Réduire en ballon', copiedLine: 'Ligne copiée',
			optTip: "Activer/désactiver l'optimisation (A/B)", reportBtn: '⤓ Rapport', reportTip: 'Exporter le rapport',
			whyWaitGame: 'en attente du socket de jeu…', whyProbeOff: 'sonde de latence non démarrée',
			whyProbeDown: 'sonde non connectée{code}', whyClose: ' (code {code})',
			whyProbeSilent: '{n} pings sans réponse{types}', whyTypes: " (le serveur n'envoie que {t})",
			whyLatThin: 'échantillons de latence insuffisants ({n}/3)',
			whyFrameSparse: 'échantillons de frames insuffisants (lobby/entre manches)'
		},
		es: {
			title: 'TankTrouble Red', line: 'Línea', live: 'Ping actual', avg: 'Ping medio', max: 'Latencia máx.', jit: 'Jitter',
			stab: 'Estabilidad', opt: 'Optimización', status: 'Estado', lang: 'Idioma',
			on: 'ACTIVADO', off: 'DESACTIVADO', btnOn: 'ACTIVADO', btnOff: 'DESACTIVADO', smoothed: 'suavizado', ignored: 'correcciones ignoradas',
			rttJitter: '· jitter RTT', ballAvg: 'Med.', ballStab: 'Est.',
			waitConn: 'esperando conexión…', dotTip: 'Contraer en bola', copiedLine: 'Línea copiada',
			optTip: 'Activar/desactivar optimización (A/B)', reportBtn: '⤓ Informe', reportTip: 'Exportar informe',
			whyWaitGame: 'esperando el socket del juego…', whyProbeOff: 'sonda de latencia no iniciada',
			whyProbeDown: 'sonda no conectada{code}', whyClose: ' (código {code})',
			whyProbeSilent: '{n} pings sin respuesta{types}', whyTypes: ' (el servidor solo envía {t})',
			whyLatThin: 'muestras de latencia insuficientes ({n}/3)',
			whyFrameSparse: 'muestras de frames insuficientes (lobby/entre rondas)'
		},
		de: {
			title: 'TankTrouble Netzwerk', line: 'Leitung', live: 'Aktueller Ping', avg: 'Ø Ping', max: 'Max. Latenz', jit: 'Jitter',
			stab: 'Stabilität', opt: 'Optimierung', status: 'Status', lang: 'Sprache',
			on: 'AN', off: 'AUS', btnOn: 'AN', btnOff: 'AUS', smoothed: 'geglättet', ignored: 'Korrekturen ignoriert',
			rttJitter: '· RTT-Jitter', ballAvg: 'Ø', ballStab: 'Stab.',
			waitConn: 'warte auf Verbindung…', dotTip: 'Zum Ball einklappen', copiedLine: 'Leitung kopiert',
			optTip: 'Optimierung ein/aus (A/B)', reportBtn: '⤓ Bericht', reportTip: 'Diagnosebericht exportieren',
			whyWaitGame: 'warte auf Spiel-Verbindung…', whyProbeOff: 'Latenz-Sonde nicht gestartet',
			whyProbeDown: 'Sonde nicht verbunden{code}', whyClose: ' (Code {code})',
			whyProbeSilent: '{n} Pings ohne Antwort{types}', whyTypes: ' (Server sendet nur {t})',
			whyLatThin: 'zu wenige Latenz-Messwerte ({n}/3)',
			whyFrameSparse: 'zu wenige Frame-Messwerte (Lobby/zwischen Runden)'
		},
		pt: {
			title: 'TankTrouble Rede', line: 'Linha', live: 'Ping agora', avg: 'Ping médio', max: 'Latência máx.', jit: 'Jitter',
			stab: 'Estabilidade', opt: 'Otimização', status: 'Estado', lang: 'Idioma',
			on: 'ATIVADO', off: 'DESATIVADO', btnOn: 'ATIVADO', btnOff: 'DESATIVADO', smoothed: 'suavizado', ignored: 'correções ignoradas',
			rttJitter: '· jitter RTT', ballAvg: 'Méd.', ballStab: 'Est.',
			waitConn: 'aguardando conexão…', dotTip: 'Recolher em bola', copiedLine: 'Linha copiada',
			optTip: 'Ligar/desligar otimização (A/B)', reportBtn: '⤓ Relatório', reportTip: 'Exportar relatório',
			whyWaitGame: 'aguardando o socket do jogo…', whyProbeOff: 'sonda de latência não iniciada',
			whyProbeDown: 'sonda não conectada{code}', whyClose: ' (código {code})',
			whyProbeSilent: '{n} pings sem resposta{types}', whyTypes: ' (o servidor só envia {t})',
			whyLatThin: 'amostras de latência insuficientes ({n}/3)',
			whyFrameSparse: 'amostras de frames insuficientes (lobby/entre rodadas)'
		}
	};

	let LANG = detectLang();      // 默认跟浏览器语言；存档里有就用存档的（loadHudState 里覆盖）
	function isLang(c) { return LANGS.some(function (l) { return l[0] === c; }); }

	/** 没存档时按浏览器语言猜一个 */
	function detectLang() {
		try {
			const nl = String((navigator && (navigator.language || navigator.userLanguage)) || 'en').toLowerCase();
			const two = nl.slice(0, 2);
			if (isLang(two)) return two;
		} catch (e) {}
		return 'en';
	}

	/** 取词：{name} 用 args 替换；缺词条回退英文，再回退 key 本身 */
	function tr(key, args) {
		const pack = I18N[LANG] || I18N.en;
		let out = (pack && pack[key] != null) ? pack[key] : (I18N.en[key] != null ? I18N.en[key] : key);
		if (args) {
			out = String(out).replace(/\{(\w+)\}/g, function (m, k) {
				return (args[k] != null) ? String(args[k]) : '';
			});
		}
		return out;
	}

	const ST_GREEN = [74, 222, 128], ST_YELLOW = [251, 191, 36], ST_RED = [248, 113, 113], ST_GRAY = [140, 147, 158];

	function rgbStr(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
	function blend(list) {
		let r = 0, g = 0, b = 0;
		list.forEach(function (c) { r += c[0]; g += c[1]; b += c[2]; });
		const n = list.length || 1;
		return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
	}

	/* 存档内容（键沿用 ttn.hud.v4，老档少字段也能读）：
	 *   悬浮球位置/收起状态、面板隐藏、选中的语言、优化开关。 */
	function loadHudState() {
		try {
			const raw = localStorage.getItem(HUD_KEY);
			if (!raw) return;
			const o = JSON.parse(raw);
			if (typeof o.x === 'number') hudState.x = o.x;
			if (typeof o.y === 'number') hudState.y = o.y;
			hudState.ball = !!o.ball;
			hudState.hidden = !!o.hidden;
			if (typeof o.lang === 'string' && isLang(o.lang)) LANG = o.lang;
			if (typeof o.smooth === 'boolean') SMOOTH.enabled = o.smooth;
		} catch (e) {}
	}

	function saveHudState() {
		try {
			localStorage.setItem(HUD_KEY, JSON.stringify({
				x: hudState.x, y: hudState.y, ball: hudState.ball, hidden: hudState.hidden,
				lang: LANG, smooth: SMOOTH.enabled
			}));
		} catch (e) {}
	}

	function mkBtn(label, title, fn) {
		const b = document.createElement('button');
		b.className = 'ttn-btn ttn-anim';
		b.type = 'button';
		b.textContent = label;
		b.title = title;
		b.addEventListener('click', function (ev) { ev.stopPropagation(); fn(); });
		return b;
	}

	/* ---------------- 指标与红黄绿 ---------------- */

	/* 稳定度缓存：帧太少（大厅/局间）时沿用最近一次判断，别让数字闪成 0 */
	const stabHold = { v: 0, t: -1e9 };

	function netMetrics() {
		const c = primaryConn();
		const t = now();

		// —— 延迟：只认真 RTT 样本（自建探测 / 游戏自己的 _typeId:15→28 配对）
		const primaryHost = connHost(c);
		const latAt = function (winMs) {
			return ping.samples.filter(function (s) {
				if (t - s.t > winMs) return false;
				// 换服后旧服的样本不能混进来（不知道 host 的老样本放行，便于单测/兼容）
				if (s.host && primaryHost && s.host !== primaryHost) return false;
				return true;
			});
		};
		let latPick = latAt(30000);
		// 30 秒内不足 3 个（大厅/探测稀疏）→ 放宽到 2 分钟。延迟变化慢，旧一点也比"什么都看不到"强。
		let latWin = 30;
		if (latPick.length < 3) { latPick = latAt(120000); latWin = 120; }
		const rtts = latPick.map(function (s) { return s.rtt; });
		const rttSorted = rtts.slice().sort(function (a, b) { return a - b; });
		const rttMed = median(rtts);
		const rttMax = rttSorted.length ? rttSorted[rttSorted.length - 1] : 0;
		const lastLat = latPick.length ? latPick[latPick.length - 1] : null;
		const rttNow = lastLat ? lastLat.rtt : 0;
		const latSrc = lastLat ? (lastLat.src || 'probe') : 'none';
		const latAge = lastLat ? Math.round(t - lastLat.t) : -1;

		// —— 帧到达节奏：必须先区分「网络卡顿」和「大厅/局间空闲」
		//   两者都表现为"很久没帧"，但：
		//     真卡顿 → 之后有补发洪流（积压帧挤在一起到达，burstFrames ≥ 3）
		//     空闲   → 之后只有正常节奏的一帧（burstFrames ≈ 1~2）
		//   不区分的话，"最大延迟"会永远停在几千毫秒，稳定度也会被拉到 0。
		const cadenceAt = function (winMs) {
			const raw = c ? c.gapLog.filter(function (g) { return t - g.t <= winMs; })
				.map(function (g) { return g.gap; }) : [];
			const b = median(raw.filter(function (g) { return g < 500; })) || 33;   // 正常帧节奏
			return { base: b, jittery: raw.filter(function (g) { return g < b * 3; }) };
		};
		let cad = cadenceAt(20000);
		// 20 秒内样本太少（大厅/局间/刚进房）→ 放宽到 60 秒再判，别没数据就报 0
		if (cad.jittery.length < 5) cad = cadenceAt(60000);

		const base = cad.base;
		const jittery = cad.jittery;

		const jSorted = jittery.slice().sort(function (a, b) { return a - b; });
		const jMed = median(jittery);
		const jMax = jSorted.length ? jSorted[jSorted.length - 1] : 0;

		// 真卡顿：停顿时长 ≥ 正常节奏 3 倍，**且之后有积压帧洪流**（burstFrames ≥ 3）。
		// 大厅/局间的空闲停顿后面只有正常的一帧，不算卡顿。
		const isStall = function (s) { return s.gap >= base * 3 && s.burstFrames >= 3; };
		const stallList = c ? c.stalls.filter(function (s) { return t - s.t <= 20000 && isStall(s); }) : [];
		const stallMax = stallList.reduce(function (m, s) { return Math.max(m, s.gap); }, 0);
		const stalls60 = c ? c.stalls.filter(function (s) { return t - s.t <= 60000 && isStall(s); }).length : 0;

		// 小抖动：正常节奏里偏离中位数 40% 以上的帧占比
		let deviated = 0;
		if (jMed > 0) {
			for (let i = 0; i < jittery.length; i++) {
				if (Math.abs(jittery[i] - jMed) > jMed * 0.4) deviated++;
			}
		}
		const jitterRatio = jittery.length ? deviated / jittery.length : 0;
		const mad = jittery.length ? median(jittery.map(function (v) { return Math.abs(v - jMed); })) : 0;

		// —— 稳定度
		//   主口径：帧到达节奏（最贴近"手感"，对局中一定有数据）
		//   备用口径：ping RTT 的抖动 —— 大厅/局间/刚进房时帧本来就稀疏，
		//             以前这种时候稳定度直接显示 "--"（用户实测："不显示稳定值"）。
		//             有真延迟样本就一定有抖动数据，所以拿它兜底，绝不空着。
		let stability = 0;
		let stabSrc = 'none';          // cadence=帧节奏 / rtt=RTT 抖动兜底 / hold=沿用上次 / none=真没数据
		let rttStab = null;
		if (rtts.length >= 5) {
			const rMed = median(rtts);
			if (rMed > 0) {
				let rDev = 0;
				for (let i = 0; i < rtts.length; i++) {
					if (Math.abs(rtts[i] - rMed) > rMed * 0.4) rDev++;
				}
				const rMad = median(rtts.map(function (v) { return Math.abs(v - rMed); }));
				rttStab = Math.round(Math.max(0, Math.min(100,
					100 - (rDev / rtts.length) * 100 - (rMad / rMed) * 60)));
			}
		}
		if (jittery.length >= 5) {
			stability = 100
				- jitterRatio * 100
				- (mad / Math.max(1, jMed)) * 60
				- Math.min(40, stalls60 * 6);                       // 近 1 分钟卡顿次数
			if (stallMax > 0) {
				stability -= Math.min(25, Math.max(0, (stallMax - 300) / 50));   // 单次停顿越久越糟
			}
			stability = Math.round(Math.max(0, Math.min(100, stability)));
			stabHold.v = stability; stabHold.t = t;
			stabSrc = 'cadence';
		} else if (rttStab != null) {
			stability = rttStab;
			stabSrc = 'rtt';
		} else if (t - stabHold.t <= 60000) {
			stability = stabHold.v;
			stabSrc = 'hold';
		}

		// —— 可用性：两块数据各自独立判断。
		//   以前是"两个都齐了才显示"，结果只要其中一块缺（探测被服务器无视 / 在大厅帧太少），
		//   整个悬浮球就全灰、一个数字都不给 —— 用户看到的就是"坏了"。
		//   延迟只要有一个真样本就先显示（游戏自己的探测帧可能几十秒才来一个），
		//   样本少于 3 个时面板上带 ≈（中位数样本太少，参考意义打折）。
		const okPing = rtts.length >= 1;
		const okCad = (stabSrc !== 'none');
		const thin = rtts.length < 3;

		// —— 一句话说清"为什么没数据"（面板底部显示，悬浮球放 title 提示）
		//   结构化存一份（whyParts），再按当前语言拼成 why —— 换语言时 HUD 会重新拼。
		const whyParts = [];
		if (!c) {
			whyParts.push({ k: 'whyWaitGame' });
		} else {
			if (!okPing) {
				if (!ping.started) whyParts.push({ k: 'whyProbeOff' });
				else if (!ping.connected) {
					whyParts.push({ k: 'whyProbeDown', args: { code: (ping.lastClose && ping.lastClose.code) ? tr('whyClose', { code: ping.lastClose.code }) : '' } });
				} else if (ping.sends >= 3 && ping.answers === 0) {
					whyParts.push({ k: 'whyProbeSilent', args: {
						n: ping.sends,
						types: (ping.sawTypes && Object.keys(ping.sawTypes).length) ? tr('whyTypes', { t: Object.keys(ping.sawTypes).join('/') }) : ''
					} });
				} else whyParts.push({ k: 'whyLatThin', args: { n: rtts.length } });
			}
			if (!okCad) whyParts.push({ k: 'whyFrameSparse' });
		}
		const why = whyParts.map(function (w) { return tr(w.k, w.args); }).join(' ');

		return {
			now: Math.round(rttNow),
			avg: Math.round(rttMed),
			// 最大延迟 = 最大 RTT、正常节奏最大间隔、真卡顿最大停顿 三者取大
			max: Math.round(Math.max(rttMax, jMax, stallMax)),
			jitter: Math.round(mad),
			jitterPercent: Math.round(jitterRatio * 100),
			stalls: stalls60,
			base: Math.round(base),
			stallMax: Math.round(stallMax),
			stability: stability,
			stabSrc: stabSrc,
			samples: rtts.length,
			thin: thin,              // 样本 <3，中位数参考意义打折（面板上标 ≈）
			latSrc: latSrc,          // probe=自建探测 / game=游戏自己的探测帧 / none
			latAge: latAge,          // 最新样本多久之前（ms）
			latWin: latWin,          // 用的哪个窗口（30 / 120 秒）
			okPing: okPing,
			okCad: okCad,
			ok: okPing || okCad,
			why: why,
			whyParts: whyParts
		};
	}

	function gradeAvg(v) { return v < 80 ? ST_GREEN : (v < 160 ? ST_YELLOW : ST_RED); }
	function gradeMax(v) { return v < 250 ? ST_GREEN : (v < 500 ? ST_YELLOW : ST_RED); }
	function gradeStability(v) { return v >= 85 ? ST_GREEN : (v >= 60 ? ST_YELLOW : ST_RED); }

	/** 综合色：只有"两块数据全缺"才是灰；缺哪块就先不算哪块（而不是整球作废） */
	function overallColor(m) {
		const parts = [];
		if (m.okPing) { parts.push(gradeAvg(m.avg)); parts.push(gradeMax(m.max)); }
		if (m.okCad) parts.push(gradeStability(m.stability));
		return parts.length ? blend(parts) : ST_GRAY;
	}

	/* ---------------- 构建 ---------------- */

	function ensureHud() {
		if (hud || !document.documentElement) return;
		loadHudState();

		const style = document.createElement('style');
		style.textContent = HUD_CSS;
		(document.head || document.documentElement).appendChild(style);

		hud = document.createElement('div');
		hud.id = 'ttn-root';
		hud.innerHTML =
			'<div id="ttn-head">' +
				'<span id="ttn-dot" title="' + escapeHtml(tr('dotTip')) + '"></span>' +
				'<span id="ttn-title" class="ttn-anim">' + escapeHtml(tr('title')) + '</span>' +
				'<span id="ttn-copied"></span>' +
				'<span id="ttn-ver">v' + VERSION + '</span>' +
			'</div>' +
			'<div id="ttn-body">' +
				'<div id="ttn-rows"></div>' +
				'<div class="ttn-foot"></div>' +
			'</div>';

		hudBall = document.createElement('div');
		hudBall.id = 'ttn-ball';

		/* 数值行只建一次，之后只改『变了的那部分』。
		 * 原因：以前每 250ms 整块 innerHTML 重写，节点被换掉 → CSS 过渡根本无从生效，
		 * 颜色/数字全是『啪』地一换（用户要求『不要有任何瞬变』）。 */
		const rowsEl = hud.querySelector('#ttn-rows');
		hudRefs = {};
		/* 值这一格 = [前缀 plain] + [会变的 roll] + [单位 plain]。
		 * 单位（ms / %）永远不变 → 独立节点、永不参与动画（用户明确要求）。 */
		const VAL_LAYOUT = {
			line: { pre: false, unit: '' },
			live: { pre: false, unit: ' ms' },
			avg: { pre: true, unit: ' ms' },
			max: { pre: false, unit: ' ms' },
			jit: { pre: false, unit: '%' },
			stab: { pre: false, unit: '%', note: true },
			opt: { pre: false, unit: '' }
		};
		/* 「线路」的主机名可能很长：不裁不缩，改成**点击复制**完整名称，
		 * 复制后原地闪一下"已复制"（有淡入淡出）。 */
		function lineHostText() {
			const c = primaryConn();
			if (!c) return '';
			return String(c.url).replace(/^wss?:\/\//, '').replace(/:443$/, '');
		}
		/** 复制成功：标题处闪一句"已复制线路"（淡入 → 停留 → 淡出，全程有动画） */
		function flashCopied() {
			const tag = hud && hud.querySelector('#ttn-copied');
			if (!tag) return;
			tag.textContent = tr('copiedLine');
			tag.classList.remove('on');
			hud.classList.remove('ttn-copied');
			void tag.offsetWidth;
			tag.classList.add('on');
			hud.classList.add('ttn-copied');
			if (tag.__t1) clearTimeout(tag.__t1);
			tag.__t1 = setTimeout(function () {
				tag.classList.remove('on');          // 提示淡出
				hud.classList.remove('ttn-copied');  // 标题同时淡回
			}, 1200);
		}
		function copyLineHost() {
			const text = lineHostText();
			if (!text) return;
			let ok = false;
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(text);
					ok = true;
				}
			} catch (e) { ok = false; }
			if (!ok) {
				try {
					const ta = document.createElement('textarea');
					ta.value = text;
					ta.style.position = 'fixed';
					ta.style.opacity = '0';
					document.body.appendChild(ta);
					ta.select();
					document.execCommand('copy');
					ta.remove();
				} catch (e) {}
			}
			flashCopied();
		}

		['line', 'live', 'avg', 'max', 'jit', 'stab', 'opt'].forEach(function (key) {
			const cfg = VAL_LAYOUT[key];
			const k = document.createElement('span');
			k.className = 'ttn-k ttn-anim';
			const v = document.createElement('span');
			v.className = 'ttn-v';
			const ref = { k: k, v: v };
			if (cfg.pre) {
				ref.pre = document.createElement('span');
				ref.pre.className = 'pre ttn-anim';
				v.appendChild(ref.pre);
			}
			ref.roll = document.createElement('span');
			ref.roll.className = 'roll';
			v.appendChild(ref.roll);
			if (cfg.unit) {
				ref.unit = document.createElement('span');
				ref.unit.className = 'unit';
				ref.unit.textContent = cfg.unit;
				v.appendChild(ref.unit);
			}
			if (cfg.note) {
				ref.note = document.createElement('span');
				ref.note.className = 'note';
				v.appendChild(ref.note);
			}
			if (key === 'line') {
				// 线路：点击复制（title 里给提示，不占屏）
				v.classList.add('ttn-copy');
				v.addEventListener('click', function (ev) { ev.stopPropagation(); copyLineHost(); });
			} else if (key !== 'lang') {
				attachTip(v);        // 其它列若被裁，悬浮看全（带出现/消失动画）
			}
			rowsEl.appendChild(k);
			rowsEl.appendChild(v);
			hudRefs[key] = ref;
		});
		/* 「优化」行的计数（最长的一句）放副行；里面的数字各自可滚动，词不动 */
		const sub = {};
		['w1', 'r1', 'w2', 'r2'].forEach(function (name) {
			const sp = document.createElement('span');
			sp.className = (name[0] === 'r') ? 'roll' : 'sub-w ttn-anim';
			sub[name] = sp;
		});
		const optSub = document.createElement('span');
		optSub.className = 'ttn-sub';
		const sep = document.createElement('span');
		sep.className = 'sub-sep';
		sep.textContent = ' · ';
		[sub.w1, sub.r1, sep, sub.w2, sub.r2].forEach(function (sp) { optSub.appendChild(sp); });
		hudRefs.opt.v.appendChild(optSub);
		hudRefs.opt.sub = sub;
		/* 语言选择行（整行）：自定义下拉按钮，名字一定显示全。
		 * 用自定义控件而不是原生 <select>：原生控件在暗色面板里又丑又没法控制高度/圆角，
		 * 长语言名（Português (Portuguese)）还会在按钮里被截断。 */
		const langRow = document.createElement('div');
		langRow.className = 'ttn-langrow';
		const langK = document.createElement('span');
		langK.className = 'ttn-k';
		const langBtn = document.createElement('button');
		langBtn.id = 'ttn-langbtn';
		langBtn.type = 'button';
		langBtn.setAttribute('aria-haspopup', 'listbox');
		langBtn.setAttribute('aria-expanded', 'false');
		const langName = document.createElement('span');
		langName.id = 'ttn-langname';
		langName.className = 'ttn-anim';
		const langArrow = document.createElement('span');
		langArrow.id = 'ttn-langarrow';
		langArrow.textContent = '▼';
		langBtn.appendChild(langName);
		langBtn.appendChild(langArrow);
		attachTip(langName);
		langRow.appendChild(langK);
		langRow.appendChild(langBtn);
		rowsEl.appendChild(langRow);
		hudRefs.lang = { k: langK, row: langRow, btn: langBtn, name: langName };
		langBtn.addEventListener('click', function (ev) { ev.stopPropagation(); toggleLangMenu(); });
		langBtn.addEventListener('keydown', function (ev) {
			if (ev.key === 'Escape') { closeLangMenu(); return; }
			if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowDown') {
				ev.preventDefault();
				if (!langMenu || !langMenu.classList.contains('on')) openLangMenu();
			}
		});

		/* 菜单本身挂在 documentElement 上（面板 overflow:hidden + transform，放里面会被剪掉） */
		langMenu = document.createElement('div');
		langMenu.id = 'ttn-langmenu';
		langMenu.setAttribute('role', 'listbox');
		LANGS.forEach(function (l) {
			const it = document.createElement('div');
			it.className = 'ttn-langitem';
			it.setAttribute('role', 'option');
			it.setAttribute('data-lang', l[0]);
			const nm = document.createElement('span');
			nm.className = 'nm';
			nm.textContent = l[1];
			const ck = document.createElement('span');
			ck.className = 'ck';
			ck.textContent = '✓';
			it.appendChild(nm);
			it.appendChild(ck);
			it.addEventListener('click', function (ev) {
				ev.stopPropagation();
				setLang(l[0]);
				closeLangMenu();
			});
			langMenu.appendChild(it);
		});
		langMenu.addEventListener('scroll', function () { langMenuScrollTop = langMenu.scrollTop; }, { passive: true });
		document.documentElement.appendChild(langMenu);

		const stRow = document.createElement('div');
		stRow.id = 'ttn-status';
		const stK = document.createElement('span');
		stK.className = 'ttn-k ttn-anim';
		const stV = document.createElement('span');
		stV.className = 'ttn-v ttn-anim';
		stV.style.textAlign = 'left';
		stRow.appendChild(stK);
		stRow.appendChild(stV);
		rowsEl.appendChild(stRow);
		hudRefs.status = { k: stK, v: stV, row: stRow };


		/* 球里三行同样拆开：前缀(平均/稳定)、会变的数字(roll)、单位(ms/%)。
		 * 单位与前缀内容不变 → 永不参与动画。 */
		const ballHalo = document.createElement('span');
		ballHalo.className = 'halo';
		hudBall.appendChild(ballHalo);
		const ballGlow = document.createElement('span');
		ballGlow.className = 'hover-glow';
		hudBall.appendChild(ballGlow);
		const dotHalo = document.createElement('span');
		dotHalo.className = 'halo';
		hud.querySelector('#ttn-dot').appendChild(dotHalo);

		[['ballT', 't'], ['ballM', 'm'], ['ballB', 'b']].forEach(function (b) {
			const sp = document.createElement('span');
			sp.className = b[1];
			const ref = { v: sp };
			if (b[1] !== 'm') {
				ref.pre = document.createElement('span');
				ref.pre.className = 'pre ttn-anim';
				sp.appendChild(ref.pre);
			}
			ref.roll = document.createElement('span');
			ref.roll.className = 'roll';
			sp.appendChild(ref.roll);
			if (b[1] === 'm') {
				ref.unit = document.createElement('span');
				ref.unit.className = 'unit';
				ref.unit.textContent = 'ms';
				sp.appendChild(ref.unit);
			} else if (b[1] === 'b') {
				ref.unit = document.createElement('span');
				ref.unit.className = 'unit';
				ref.unit.textContent = '%';
				sp.appendChild(ref.unit);
			}
			hudBall.appendChild(sp);
			hudRefs[b[0]] = ref;
		});

		const foot = hud.querySelector('.ttn-foot');
		foot.appendChild(mkBtn('⚡', tr('optTip'), toggleOptimization));
		foot.appendChild(mkBtn(tr('reportBtn'), tr('reportTip'), function () { exportReport(); }));
		applyLang();          // 标题/标签/下拉框/按钮文案按当前语言铺好（ar 还要切 RTL）

		// 点左上角的圆点收起（"收起"按钮已移除）
		hud.querySelector('#ttn-dot').addEventListener('click', function (ev) {
			ev.stopPropagation();
			if (hudState.ball) return;
			hudState.ball = true;
			hudAnimate(true);        // 允许在展开动画途中反向
		});

		installHudDrag(hud.querySelector('#ttn-head'), true);
		installHudDrag(hudBall, false);

		document.documentElement.appendChild(hud);
		document.documentElement.appendChild(hudBall);

		applyHudVisibility();
		clampHud();

		addEventListener('resize', function () { closeLangMenu(); hideTip(); clampHud(); fitLangName(); }, { passive: true });
		/* 页面滚动时菜单要跟着按钮走（它是 fixed 定位，锚点会跑）。
		 * 关键：菜单**自己内部**滚动不能触发"关菜单" —— scroll 不冒泡，
		 * 但 capture 监听照样能收到它，之前就是这样"一滚动菜单就没了"。 */
		addEventListener('scroll', function (ev) {
			hideTip();
			if (!langMenu || !langMenu.classList.contains('on')) return;
			const t = ev && ev.target;
			if (t === langMenu || (t && langMenu.contains && langMenu.contains(t))) {
				langMenuScrollTop = langMenu.scrollTop;     // 记住列表滚到哪儿了
				return;
			}
			anchorLangMenu();                              // 页面在滚 → 菜单贴着按钮重排
		}, { passive: true, capture: true });
		document.addEventListener('pointerdown', function (ev) {
			if (!langMenu || !langMenu.classList.contains('on')) return;
			if (langMenu.contains(ev.target)) return;
			if (hudRefs && hudRefs.lang && hudRefs.lang.btn && hudRefs.lang.btn.contains(ev.target)) return;
			closeLangMenu();
		}, true);
		document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeLangMenu(); }, true);
		try {
			if (typeof ResizeObserver === 'function') new ResizeObserver(function () { clampHud(); }).observe(hud);
		} catch (e) {}
	}

	/** 网络优化总开关：面板里和收起后各有一个入口，随时 A/B 对比 */
	function toggleOptimization() {
		SMOOTH.enabled = !SMOOTH.enabled;
		if (!SMOOTH.enabled) snapAllSmoothers();     // 关掉时立刻对齐真值，方便看出差别
		updateOptLabel();
		refreshHud();                                 // 球的光晕/颜色立刻跟着变，不等下一个刷新周期
	}

	function updateOptLabel() {
		const on = SMOOTH.enabled;
		const btns = hud ? hud.querySelectorAll('.ttn-btn') : [];
		if (btns[0]) {
			btns[0].textContent = '⚡ ' + (on ? tr('btnOn') : tr('btnOff'));
			btns[0].title = tr('optTip') + ' · ' + tr('opt');
			btns[0].style.color = on ? '#4ade80' : '#9aa3b2';
			btns[0].style.borderColor = on ? 'rgba(74,222,128,.5)' : 'rgba(255,255,255,.13)';
		}
	}

	/**
	 * 拖动。isPanel=true 时拖动后不动；否则（悬浮球）拖动只是移动，
	 * 只有"按下即松开"才算点击 —— 之前拖动会展开就是因为又挂了 click 监听，
	 * 拖完浏览器补发一次 click，被当成点击了。
	 */
	/* 拖动状态的自愈清理：指针事件可能丢（capture 被抢走、页面失焦…），
	 * 以前内联 transition='none' 卡住 → 之后所有 hover 都变成瞬变（用户实测的"卡出 bug"）。
	 * 现在只用 class 表示"正在拖"，并且有超时兜底 + 每次刷新时的巡检。 */
	let activeDrag = null, dragWatchdog = null;
	function cleanupDrag() {
		if (activeDrag && activeDrag.el) {
			activeDrag.el.classList.remove('ttn-drag');
			if (activeDrag.el.style) activeDrag.el.style.transition = '';
			activeDrag.el.__ttnDragging = false;
		}
		activeDrag = null;
		if (dragWatchdog) { clearTimeout(dragWatchdog); dragWatchdog = null; }
	}
	/** 巡检：不在拖动时，任何人身上都不该留着 ttn-drag；也不该有内联 transition（全部走 class/WAAPI） */
	function sanitizeDragState() {
		if (activeDrag && activeDrag.el && activeDrag.el.__ttnDragging) return;
		cleanupDrag();
		[ hud, hudBall ].forEach(function (el) {
			if (!el) return;
			if (el.classList) el.classList.remove('ttn-drag');
			if (el.style && el.style.transition) el.style.transition = '';
			el.__ttnDragging = false;
		});
	}

	function installHudDrag(el, isPanel) {
		let dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
		const track = [];          // 最近几次"球的位置 + 时刻"：用来算松手速度

		/** 记一次"球自己"的位置（必须在夹取之后调用） */
		function pushTrack() {
			track.push({ x: hudState.x, y: hudState.y, t: now() });
			if (track.length > 12) track.shift();
		}

		el.addEventListener('pointerdown', function (ev) {
			// 按钮和左上角圆点都不参与拖拽：
			// 一旦对标题栏 setPointerCapture，click 会被重定向到标题栏，
			// 圆点上的收起监听就永远不会触发（这就是"根本无法收起"的原因）。
			if (ev.target && ev.target.classList.contains &&
				(ev.target.classList.contains('ttn-btn') || ev.target.id === 'ttn-dot')) return;
			/* 动画还没结束时碰它：先把变形落终态再做拖动。
			 * 否则拖动会改锚点，而变形是按锚点算的 —— 球和圆点就会错位。 */
			if (hudAnimating) finishHudAnim();
			dragging = true; moved = false;
			closeLangMenu();
			hideTip();
			el.__ttnDragging = true;
			el.__ttnDownTarget = ev.target;
			cancelGlide();                 // 抓住它就别再自己滑了，接下来跟手指
			sx = ev.clientX; sy = ev.clientY;
			ox = hudState.x; oy = hudState.y;
			track.length = 0;
			pushTrack();                   // 记的是"球的位置"，不是指针位置
			el.classList.add('ttn-drag');       // 用 class 关掉过渡（内联 transition 会漏，卡住就永远瞬变）
			activeDrag = { el: el, isPanel: !!isPanel };
			clearTimeout(dragWatchdog);          // 兜底：无论指针事件丢没丢，都必须能收拾干净
			dragWatchdog = setTimeout(cleanupDrag, 4000);
			try { el.setPointerCapture(ev.pointerId); } catch (e) {}
		});

		el.addEventListener('pointermove', function (ev) {
			if (!dragging) return;
			const dx = ev.clientX - sx, dy = ev.clientY - sy;
			if (!moved && Math.abs(dx) + Math.abs(dy) > 4) moved = true;
			if (!moved) return;
			hudState.x = ox + dx; hudState.y = oy + dy;
			clampHud(true);                // 拖动中必须跟手，不走回弹
			// 拖动过程仍然 1:1 跟手（要精确摆放时不能飘），
			// 但把"球的位置"记下来 —— 松手时按球自己最近 120ms 的位移算速度。
			// 注意是夹取之后再记：球被边界夹住没动，采样就是同一个点，速度自然是 0。
			pushTrack()
			ev.preventDefault();
		});

		const end = function (ev) {
			if (!dragging) return;
			dragging = false;
			el.__ttnDragging = false;
			el.classList.remove('ttn-drag');
			if (activeDrag && activeDrag.el === el) activeDrag = null;
			clearTimeout(dragWatchdog);
			dragWatchdog = null;
			if (moved) {
				// 松手带惯性：只有悬浮球甩，面板保持"放哪儿是哪儿"（面板要精确摆位读数）
				if (!isPanel && (!ev || ev.type !== 'pointercancel')) {
					// 松手那一刻补一个采样点，把"球此刻到底在哪儿"记进去。
					// （真正兜住"停住再松手"的是 throwVelocity 里以松手时刻为准的窗口；
					//   这里再补一个点是防御性的：万一以后球在拖动中会被别的机制挪动，
					//   没有这个点就会漏掉最后那段位移。）
					pushTrack();
					const v = throwVelocity(track, now());
					if (v) throwHud(v.vx, v.vy);
					else saveHudState();
				} else {
					saveHudState();
				}
				// 拖动结束时把"刚刚在拖"记下来，吞掉浏览器补发的那次 click
				el.__ttnJustDragged = true;
				setTimeout(function () { el.__ttnJustDragged = false; }, 60);
				return;
			} else {
				track.length = 0;
			}
			if (!isPanel) {
				// 悬浮球：按下不移动 = 切换。
				// 动画途中再点它 = 反向（展开到一半又收回去），而不是重播或继续展开。
				hudState.ball = !hudState.ball;
				hudAnimate(hudState.ball);
			} else if (el.__ttnDownTarget && el.__ttnDownTarget.id === 'ttn-dot') {
				// 兜底：即使 click 被指针捕获吞掉，这里也能收起
				if (!hudState.ball) { hudState.ball = true; hudAnimate(true); }
			}
			if (ev) ev.preventDefault();
		};
		el.addEventListener('pointerup', end);
		el.addEventListener('pointercancel', end);
		el.addEventListener('lostpointercapture', end);        // capture 被抢走也要收拾干净
		/* 关键：松手发生在元素之外时，元素上收不到 pointerup → 拖动状态会永久卡住，
		 * 之后 hover 全部瞬变（用户实测的"卡出 bug"）。所以在 document 上兜底收一次。 */
		document.addEventListener('pointerup', function (ev) {
			if (dragging) { try { el.releasePointerCapture(ev.pointerId); } catch (e) {} end(ev); }
		}, true);
		document.addEventListener('pointercancel', function (ev) { if (dragging) end(ev); }, true);
		window.addEventListener('blur', function () { if (el.__ttnDragging) end(null); }, true);
		// 兜底：万一根 pointerup 丢了，也不要把拖动当成点击
		el.addEventListener('click', function (ev) {
			if (el.__ttnJustDragged || moved) { ev.stopPropagation(); ev.preventDefault(); }
		});
	}

	/** 圆点圆心相对面板左上角的偏移（渲染时量一次并缓存） */
	// 圆点在标题栏里是绝对定位（left:12 top:12，尺寸 16），所以圆心恒为 (20,20)。
	// 之前是用 getBoundingClientRect 量的 —— 面板缩放时量到的是缩过的值（scale .03 → 约 1px），
	// 导致悬浮球落位算错 16px。改成布局常量后不存在这个问题。
	const DOT_SIZE = 24;                  // 圆点直径（也是收起/展开动画的起始尺寸）
	const DOT_CX = 20, DOT_CY = 20;

	function dotCenterRel() { return { x: DOT_CX, y: DOT_CY }; }

	/** 悬浮球的位置：让"球心"严格落在"圆点圆心"上 —— 这是无缝过渡的前提 */
	function ballAt() { return ballAtOf(hudState.x, hudState.y); }

	/** 给定锚点 (x,y) 时，悬浮球左上角应该在哪儿 */
	function ballAtOf(x, y) {
		const c = dotCenterRel();
		const B = hudCache.BALL;
		return { x: x + c.x - B / 2, y: y + c.y - B / 2 };
	}

	/**
	 * 锚点的可视区夹取（纯函数，不改状态）。
	 *   forBall=true  → 按收起后的"球"算（球允许比面板更靠边）
	 *   forBall=false → 按展开的"面板"算
	 *
	 * 夹取按"当前可见的那个"尺寸算（展开 → 面板自身；收起 → 悬浮球，否则拖到右边
	 * 会被一道看不见的墙挡住），但绝不能用"球+数据条"的总宽 —— 那会把锚点往回推，
	 * 球就和圆点错位了。最小边界两个状态必须一致（取"球完整可见"那条），否则切换
	 * 状态时锚点会被推一下，悬浮球就和圆点错位了（实测差 4px）。
	 */
	function clampedAnchor(forBall) {
		const W = window.innerWidth || 1200, H = window.innerHeight || 800;
		const B = hudCache.BALL;
		const dc = dotCenterRel();
		const minX = Math.max(0, B / 2 - dc.x);
		const minY = Math.max(0, B / 2 - dc.y);
		const maxX = forBall ? (W - B / 2 - dc.x) : (W - hudCache.w - 8);
		const maxY = forBall ? (H - B / 2 - dc.y) : (H - hudCache.h - 8);
		return {
			x: Math.min(Math.max(minX, hudState.x), Math.max(minX, maxX)),
			y: Math.min(Math.max(minY, hudState.y), Math.max(minY, maxY))
		};
	}

	/**
	 * 开关的观感：关=稍暗（保留颜色），开=提亮 + 光晕呼吸。
	 * 全部用 **Web Animations API** 驱动：
	 *   · CSS 过渡/关键帧在"动画覆盖过渡""display:none 不跑过渡"这些地方踩过坑，
	 *     用户实测过"开关瞬变"，所以这里由 JS 明确地播一段动画，谁都拦不住；
	 *   · 呼吸周期/强度随延迟变化（每次变化重建循环动画，量化过档位）。
	 */
	const GLOW_FILTER_ON = 'saturate(1) brightness(1.18)';
	const GLOW_FILTER_OFF = 'saturate(.95) brightness(.94)';

	function applyGlow(el, on, durMs, glowPx) {
		if (!el) return;
		const halo = el.querySelector('.halo');
		const canAnimate = typeof el.animate === 'function';
		/* 用户实测"开关还是瞬变"，三个坑都在这里：
		 *   ① 之前遇到 prefers-reduced-motion 就**整个跳过**动画 → 系统关了动效的机器上必然瞬变
		 *      （Windows"显示动画"关掉很常见）→ 现在改成"动画更短、幅度更小"，**绝不跳过**；
		 *   ② 呼吸循环和淡入同时创建，两者都动 opacity → 后建的循环立刻顶掉淡入 → 光晕直接跳出来
		 *      → 循环加 delay，等淡入跑完再接手；
		 *   ③ 关闭时先 cancel 了循环再读当前不透明度 → 读到 0 → 没有淡出
		 *      → 先读值，再取消。 */
		const soft = reducedMotion();
		const changed = el.__glowOn !== on;
		const dur = soft ? 200 : 420;

		el.classList.toggle('on', on);
		if (changed && canAnimate) {
			const from = on ? GLOW_FILTER_OFF : GLOW_FILTER_ON;
			const to = on ? GLOW_FILTER_ON : GLOW_FILTER_OFF;
			try {
				if (el.__glowAnim) el.__glowAnim.cancel();
				const anim = el.animate([{ filter: from }, { filter: to }],
					{ duration: dur, easing: 'ease' });
				el.__glowAnim = anim;
				/* 兜底：这段动画没有 fill，正常结束后会交还给 CSS；但万一它卡住
				 * （页面被节流、时间轴不动），元素就会一直停在**起始值** —— 表现就是
				 * "球变纯色、没有阴影/没有光晕"。所以无论如何 520ms 后强制收回。 */
				try {
					anim.finished.then(function () { try { anim.cancel(); } catch (e) {} })
						.catch(function () {});
				} catch (e) {}
				setTimeout(function () {
					try { if (anim.playState !== 'idle') anim.cancel(); } catch (e) {}
				}, dur + 100);
			} catch (e) {}
		}
		el.__glowOn = on;
		el.__glowLast = { changed: changed, on: on, soft: soft, dur: dur };

		if (!halo) return;
		if (!canAnimate) { halo.style.opacity = on ? '0.34' : '0'; return; }

		const fromOp = parseFloat(getComputedStyle(halo).opacity) || 0;   // ③ 先读
		if (changed) {
			try {
				if (el.__haloFade) el.__haloFade.cancel();
				if (el.__haloLoop) { el.__haloLoop.cancel(); el.__haloLoop = null; }
				el.__loopDur = null;                                       // 下次开时重建（带淡入延迟）
				el.__haloFade = halo.animate([{ opacity: fromOp }, { opacity: on ? 0.34 : 0 }],
					{ duration: dur, easing: 'ease', fill: 'forwards' });
			} catch (e) {}
		}
		if (!on) { if (el.__haloLoop) { el.__haloLoop.cancel(); el.__haloLoop = null; } return; }
		/* 呼吸：幅度很小；② 刚淡入时要 delay，别把淡入顶掉 */
		if (!el.__haloLoop || el.__loopDur !== durMs || el.__loopGlow !== glowPx) {
			el.__loopDur = durMs; el.__loopGlow = glowPx;
			if (el.__haloLoop) el.__haloLoop.cancel();
			const big = soft ? 1 : 1 + Math.min(0.06, glowPx / 500);
			try {
				el.__haloLoop = halo.animate([
					{ opacity: 0.34, transform: 'scale(1)' },
					{ opacity: 0.58, transform: 'scale(' + big.toFixed(3) + ')' }
				], {
					duration: durMs, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out',
					delay: changed ? dur : 0
				});
			} catch (e) {}
		}
	}

	function reducedMotion() {
		try {
			return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
		} catch (e) { return false; }
	}

	/** 把当前锚点写到 DOM 上（动画期间不插手，交给 hudAnimate） */
	function applyAnchorNow() {
		if (hudAnimating) return;
		const bp = ballAt();
		if (hudBall) hudBall.style.transform = 'translate(' + Math.round(bp.x) + 'px,' + Math.round(bp.y) + 'px)';
		// 收起态不要重写面板 transform，否则会把"已缩到 0.03"的收起动画抹掉
		if (!hudState.ball) {
			hud.style.transform = 'translate(' + Math.round(hudState.x) + 'px,' + Math.round(hudState.y) + 'px)';
		}
	}

	/* ---------------- 位置回弹 ----------------
	 * 用户实测："当悬浮球在屏幕右下角展开时，面板会瞬移弹回屏幕内。"
	 * 现在改成一小段"先快后慢"的滑动，而不是直接改 translate。
	 *
	 * 用 16ms 定时器逐帧改 hudState（不用 CSS transition、也不用 rAF）：
	 *   ① "当前视觉位置"永远等于 hudState —— 之后无论展开、收起还是拖动都能从
	 *      真正的位置接着走，不会因为还有过渡在飞而跳一下；
	 *   ② rAF 在后台标签页/无头环境里可能根本不跑，定时器到点必跑（这段只有 240ms）。
	 */
	const hudGlide = { timer: null, token: 0, tx: null, ty: null, dur: 240, active: false, mode: null };

	function cancelGlide() {
		if (hudGlide.timer) { clearTimeout(hudGlide.timer); hudGlide.timer = null; }
		hudGlide.token++;
		hudGlide.tx = hudGlide.ty = null;
		hudGlide.active = false;
		hudGlide.mode = null;
	}

	function glideAnchor(nx, ny, durMs) {
		// 已经朝同一个目标在滑 → 让它滑完。refreshHud 每 250ms 调一次 clampHud，
		// 每次都重启的话，动作会一顿一顿的。
		if (hudGlide.active && hudGlide.mode === 'glide' && hudGlide.tx != null &&
			Math.abs(hudGlide.tx - nx) < 1 && Math.abs(hudGlide.ty - ny) < 1) return;

		const dur = Math.max(80, durMs || hudGlide.dur);
		const token = ++hudGlide.token;
		if (hudGlide.timer) { clearTimeout(hudGlide.timer); hudGlide.timer = null; }
		hudGlide.tx = nx; hudGlide.ty = ny;
		hudGlide.active = true;
		hudGlide.mode = 'glide';

		const fx = hudState.x, fy = hudState.y;
		const t0 = now();
		const step = function () {
			if (token !== hudGlide.token) { hudGlide.active = false; return; }
			hudGlide.timer = null;
			const k = Math.min(1, (now() - t0) / dur);
			const e = 1 - Math.pow(1 - k, 3);          // easeOutCubic：像被边缘"弹"了一下
			hudState.x = fx + (nx - fx) * e;
			hudState.y = fy + (ny - fy) * e;
			applyAnchorNow();
			if (k < 1) { hudGlide.timer = setTimeout(step, 16); return; }
			hudState.x = nx; hudState.y = ny;
			hudGlide.tx = hudGlide.ty = null;
			hudGlide.active = false;
			hudGlide.mode = null;
			applyAnchorNow();
			saveHudState();
		};
		step();
	}

	/* ---------------- 惯性甩动 ----------------
	 * 用户要求："悬浮球别再严格跟手，加点惯性"。
	 * 拖动过程中仍然是 1:1（要精确摆放时不能飘），**松手那一下**开始带速度滑：
	 *   速度取最近 ~120ms 的指针平均速度 → 每 16ms 位置 += v*dt，速度按摩擦衰减；
	 *   撞到边界时把该轴速度反向衰减一点（轻微弹一下，而不是"啪"地贴死在墙上）。
	 * 和回弹共用 hudGlide 这个状态机：任何时刻只有一种运动在跑，抓住球就立刻接管。
	 */
	const THROW = {
		friction: 0.88,      // 每 16ms 剩多少速度（越小停得越快 = 地面越不滑）
		minV: 0.06,          // px/ms，低于这个就当停了
		maxV: 6,             // px/ms 上限：一个瞬移事件不至于把球甩飞
		minStart: 0.15,      // px/ms，低于这个算"轻放"，不甩
		bounce: 0.3,         // 撞墙后反向保留多少速度（轻微弹一下）
		window: 120,         // 取最近多少毫秒算速度
		step: 16
	};

	/**
	 * 用"悬浮球自己"最近一小段位移算松手速度（不是指针速度）；返回 null = 这算轻放，不甩。
	 *
	 * 两个关键点（用户实测踩过的坑："拖动一下悬浮球之后停止，悬浮球会弹一点距离"）：
	 *   ① 采样点记的是**球的位置**，不是指针位置 —— 球贴边被夹住没动时，速度就是 0；
	 *   ② 窗口以**松手那一刻**（refT）为准，而不是"最后一个采样点"。
	 *      因为指针停住时不会再发 pointermove，最后一个采样点可能已经是几百毫秒前的
	 *      "还在快速移动"状态；若以它为基准，就会凭空追认出一个速度 → 球白弹一段。
	 *      松手时补一个采样点 + 以松手时刻为基准，窗口里就只剩"没动"的点 → 速度 0。
	 */
	function throwVelocity(track, refT) {
		if (!track || track.length < 2) return null;
		const last = track[track.length - 1];
		const tEnd = (typeof refT === 'number' && isFinite(refT)) ? refT : last.t;
		let first = null;
		for (let i = track.length - 1; i >= 0; i--) {
			if (tEnd - track[i].t > THROW.window) break;   // 超出窗口的旧采样不要
			first = track[i];
		}
		if (!first) return null;                       // 窗口内一个点都没有（松手前早就停手了）
		const dt = tEnd - first.t;
		if (dt < 8) return null;                        // 窗口内只有一个点 → 停着松的手，不甩
		let vx = (last.x - first.x) / dt;
		let vy = (last.y - first.y) / dt;
		const sp = Math.sqrt(vx * vx + vy * vy);
		if (!isFinite(sp) || sp < THROW.minStart) return null;
		if (sp > THROW.maxV) { vx = vx / sp * THROW.maxV; vy = vy / sp * THROW.maxV; }
		return { vx: vx, vy: vy };
	}

	function throwHud(vx, vy) {
		if (!hud) return;
		const token = ++hudGlide.token;
		if (hudGlide.timer) { clearTimeout(hudGlide.timer); hudGlide.timer = null; }
		hudGlide.tx = hudGlide.ty = null;               // 不是"滑到某点"，没有固定目标
		hudGlide.active = true;
		hudGlide.mode = 'throw';

		let last = now();
		const step = function () {
			if (token !== hudGlide.token) { hudGlide.active = false; return; }
			hudGlide.timer = null;
			const t = now();
			const dt = Math.min(64, Math.max(1, t - last));
			last = t;

			hudState.x += vx * dt;
			hudState.y += vy * dt;
			// 撞边界：贴到边界上，该轴速度反向衰减（轻微回弹）
			const ta = clampedAnchor(!!hudState.ball);
			if (Math.abs(ta.x - hudState.x) > 0.01) {
				hudState.x = ta.x;
				vx = (Math.abs(vx) > 0.5) ? -vx * THROW.bounce : 0;
			}
			if (Math.abs(ta.y - hudState.y) > 0.01) {
				hudState.y = ta.y;
				vy = (Math.abs(vy) > 0.5) ? -vy * THROW.bounce : 0;
			}

			const damp = Math.pow(THROW.friction, dt / THROW.step);
			vx *= damp; vy *= damp;
			applyAnchorNow();

			if (Math.abs(vx) > THROW.minV || Math.abs(vy) > THROW.minV) {
				hudGlide.timer = setTimeout(step, THROW.step);
				return;
			}
			hudGlide.active = false;
			hudGlide.mode = null;
			applyAnchorNow();
			saveHudState();
		};
		step();
	}

	/**
	 * 夹取 + 落位。
	 * forceInstant=true 时立刻落位（拖动中必须跟手；测试要量边界也用这个）。
	 * 其余情况若是被"挤"回可视区，就走回弹。
	 */
	function clampHud(forceInstant) {
		if (!hud) return;
		// 展开/收起动画期间由 hudAnimate 负责夹取目标锚点（它会把目标算进动画里去）
		if (hudAnimating) return;

		const ta = clampedAnchor(!!hudState.ball);
		const needMove = Math.abs(ta.x - hudState.x) > 0.5 || Math.abs(ta.y - hudState.y) > 0.5;
		if (!needMove) {
			// 没越界就什么都别动 —— 尤其别打断正在跑的惯性甩动/回弹。
			// （refreshHud 每 250ms 会调一次 clampHud；之前这里无条件 cancelGlide，
			//   球刚甩出去就被下一次刷新掐停，惯性只剩几十像素。）
			applyAnchorNow();
			return;
		}

		const dragging = !!(hud.__ttnDragging || (hudBall && hudBall.__ttnDragging));
		if (!dragging && forceInstant !== true) { glideAnchor(ta.x, ta.y); return; }

		cancelGlide();          // 瞬时落位优先级最高：拖动跟手 / 测试量边界
		hudState.x = ta.x;
		hudState.y = ta.y;
		applyAnchorNow();
	}

	/**
	 * 变形动画（展开/收起，可反向）。
	 *
	 * 为什么不用 CSS 过渡：过渡在"元素刚从 display:none 变可见""动画覆盖过渡"这些
	 * 情况下会**不创建/不推进**，表现就是"瞬变"（这个项目已经在开关光晕上踩过一次，
	 * 用户这次报的又是"各种瞬变"）。所以整段变形改成 **Web Animations API**：
	 *   · 从"当前实时值"起步 → 中途反向也连续、不重播；
	 *   · 用真实关键帧，可以"钉到 50%"直接验证属性到底有没有在插值；
	 *   · 终点同时写进内联样式，动画一撤就是终点，绝不会跳。
	 */
	const hudAnim = { phase: 'idle', token: 0, timer: null, anims: [] };
	const hudTint = { last: '' };            // 最近一次的分级色（refreshHud 写）
	const BALL_SURFACE = 'rgba(18, 20, 26, 0.95)';   // 悬浮球的"深色盘面"（收起态的底色）

	function animAt(el, frames, dur, easing) {
		if (!el || typeof el.animate !== 'function') return null;
		try {
			return el.animate(frames, {
				duration: dur, easing: easing || 'cubic-bezier(.2,.8,.3,1)', fill: 'both'
			});
		} catch (e) { return null; }
	}

	/** 读"当前实际变换"，转成 translate+scale 字符串（中途反向的起点） */
	function currentTransform(el, fallback) {
		try {
			const m = getComputedStyle(el).transform;
			if (!m || m === 'none') return fallback;
			const p = /matrix\(([^)]+)\)/.exec(m);
			if (p) {
				const v = p[1].split(',').map(parseFloat);
				return 'translate(' + v[4] + 'px,' + v[5] + 'px) scale(' + v[0] + ')';
			}
			return m;
		} catch (e) { return fallback; }
	}

	function cancelMorph() {
		(hudAnim.anims || []).forEach(function (a) { try { a.cancel(); } catch (e) {} });
		hudAnim.anims = [];
		if (hudAnim.fadeTimer) { clearTimeout(hudAnim.fadeTimer); hudAnim.fadeTimer = null; }
	}

	function hudAnimate(collapse) {
		if (!hud) return;
		const token = ++hudAnim.token;
		if (hudAnim.timer) { clearTimeout(hudAnim.timer); hudAnim.timer = null; }
		cancelMorph();
		cancelGlide();                           // 回弹让位给展开/收起动画（从当前位置接着走）
		closeLangMenu();                         // 菜单挂在面板外，收起来时必须一起关
		hideTip();

		const fromScratch = hudAnim.phase === 'idle';
		hudAnim.phase = collapse ? 'collapsing' : 'expanding';
		hudAnimating = true;

		const B = hudCache.BALL;
		const s0 = DOT_SIZE / B;                 // 球要缩到圆点那么大，两个圆心才重合得上
		const c = dotCenterRel();
		const from = { x: hudState.x, y: hudState.y };   // 永远从"当前真实位置"起步
		const fromBall = ballAtOf(from.x, from.y);
		const tPose = function (p, scale) {
			return 'translate(' + Math.round(p.x) + 'px,' + Math.round(p.y) + 'px)' +
				(scale === 1 ? '' : ' scale(' + scale + ')');
		};
		const DUR = 300;

		/* 无缝变形（用户要求）：展开时**球保持可见**、原地从 66px 缩到圆点大小，
		 * 面板在它周围长大；圆点整段**隐藏**，最后一帧在同一位置同一尺寸上交接。
		 * 收起时完全反向（球从圆点大小长回去）。球心本来就压在圆点圆心上，所以只改 scale。 */
		const dotMorph = hud.querySelector('#ttn-dot');
		const ballStart = tPose(fromBall, collapse ? s0 : 1);
		const ballEnd = tPose(fromBall, collapse ? 1 : s0);
		const panelStart = tPose(from, collapse ? 1 : 0.03);
		const panelEnd = tPose(from, collapse ? 0.03 : 1);
		const panelOpStart = collapse ? '1' : '0';
		const panelOpEnd = collapse ? '0' : '1';

		/* display 不能动画，先让它生效（否则量不到尺寸、动画也看不到） */
		hud.style.display = 'block';
		hud.style.transformOrigin = Math.round(c.x) + 'px ' + Math.round(c.y) + 'px';
		if (hudBall) {
			hudBall.style.display = 'flex';
			hudBall.style.transformOrigin = '50% 50%';
			hudBall.style.opacity = '1';                    // 全程可见（不再是淡出）
			hudBall.classList.toggle('morph', !collapse);   // 展开时文字淡出、收起时淡回
		}
		if (dotMorph) dotMorph.style.opacity = '0';         // 圆点让位给球，交接那一帧才归位
		hudCache.w = hud.offsetWidth || hudCache.w;
		hudCache.h = hud.offsetHeight || hudCache.h;

		/* 终点先写进内联样式：动画只负责过程，动画一撤（或没建成）都不会跳 */
		hud.style.transform = panelEnd;
		hud.style.opacity = panelOpEnd;
		if (hudBall) hudBall.style.transform = ballEnd;

		/* 起点：从静止起步就用理论起点；反向则从"当前实时值"接上 */
		const curPanelT = fromScratch ? panelStart : currentTransform(hud, panelStart);
		const curBallT = fromScratch ? ballStart : currentTransform(hudBall, ballStart);
		let curPanelO = panelOpStart;
		if (!fromScratch) {
			try { curPanelO = getComputedStyle(hud).opacity || panelOpStart; } catch (e) {}
		}

		hudAnim.anims = [];
		hudAnim.anims.push(animAt(hud, [
			{ transform: curPanelT, opacity: curPanelO },
			{ transform: panelEnd, opacity: panelOpEnd }
		], DUR));
		if (hudBall) {
			/* 终点那一帧球必须"看起来就是圆点"：光缩尺寸不够（深色盘面 + 有色描边 →
			 * 圆点是实心色块），所以背景色也要一起插值过去，否则交接时"空心黑球瞬间
			 * 变成有色球"（用户实测的 bug）。收起方向反过来：变回深色盘面。 */
			let curBg = BALL_SURFACE;
			try { curBg = getComputedStyle(hudBall).backgroundColor || BALL_SURFACE; } catch (e) {}
			const wantBg = collapse ? BALL_SURFACE : (hudTint.last || curBg);
			const bgEnd = fromScratch ? wantBg : curBg;   // 反向时按当前色接着走
			hudAnim.anims.push(animAt(hudBall, [
				{ transform: curBallT, backgroundColor: fromScratch ? curBg : curBg },
				{ transform: ballEnd, backgroundColor: bgEnd }
			], DUR));
			/* 球里的文字/数字也走 WAAPI（别指望 CSS 过渡，见函数头注释） */
			const rows = hudBall.querySelectorAll('.t, .m, .b');
			const rowTo = collapse ? 1 : 0;
			Array.prototype.forEach.call(rows, function (el) {
				let from0 = 1;
				try { from0 = parseFloat(getComputedStyle(el).opacity) || 0; } catch (e) {}
				const a = animAt(el, [{ opacity: from0 }, { opacity: rowTo }], collapse ? DUR : 200);
				if (a) hudAnim.anims.push(a);
			});
		}

		/* 插桩：给测试/排查留一份"这次从哪到哪" */
		hudAnim.last = {
			collapse: !!collapse, fromScratch: fromScratch,
			startScale: collapse ? s0 : 1, endScale: collapse ? 1 : s0,
			dotSize: DOT_SIZE, ballSize: B, dur: DUR, at: now()
		};
		hudAnim.timer = setTimeout(finishHudAnim, DUR);
	}

	/**
	 * 结束展开/收起动画（正常到时，或用户中途开始拖动时立刻调用）。
	 * 之所以要能被提前调用：动画期间拖动面板会改锚点，而变形是按锚点算的 ——
	 * 拖到一半继续播下去必然错位，所以一碰就立刻落终态，把交接一次性做完。
	 */
	function finishHudAnim() {
		if (hudAnim.timer) { clearTimeout(hudAnim.timer); hudAnim.timer = null; }
		/* 先落"动画结束"这个状态：clampHud 在 hudAnimating 为真时会直接跳过，
		 * 顺序写反的话收尾的越界回弹就没了（vm 测试当场抓到）。 */
		hudAnim.phase = 'idle';
		hudAnimating = false;
		if (!hud) return;

		const dotEl = hud.querySelector('#ttn-dot');
		const collapsed = !!hudState.ball;
		const ta = { x: hudState.x, y: hudState.y };
		const bp = ballAtOf(ta.x, ta.y);
		const s0 = DOT_SIZE / hudCache.BALL;

		/* 先把终态写进内联样式，再撤主变形动画 —— 撤的那一帧不会跳 */
		hud.style.transform = 'translate(' + Math.round(ta.x) + 'px,' + Math.round(ta.y) + 'px)' +
			(collapsed ? ' scale(0.03)' : '');
		hud.style.opacity = collapsed ? '0' : '1';
		if (hudBall) {
			hudBall.style.transform = 'translate(' + Math.round(bp.x) + 'px,' + Math.round(bp.y) + 'px)' +
				(collapsed ? '' : ' scale(' + s0 + ')');
			hudBall.style.opacity = '1';
			hudBall.style.backgroundColor = collapsed ? BALL_SURFACE : (hudTint.last || BALL_SURFACE);
			hudBall.classList.toggle('morph', !collapsed);
			const rows = hudBall.querySelectorAll('.t, .m, .b');
			Array.prototype.forEach.call(rows, function (el) {
				el.style.opacity = collapsed ? '1' : '0';
			});
		}
		cancelMorph();

		/* 交接：**原子交换**（同一帧里球隐藏、圆点显示）。
		 * 之前用 90ms 交叉淡接，结果是两者同时绘制 → 亮度叠加 = 用户看到的"结束时会闪"，
		 * 而且那个延迟定时器会和"连点"的下一次动画抢状态（连点 bug 连篇）。
		 * 球的最后一帧已经插值成和圆点同色同尺寸，直接换没有任何可见跳变。 */
		if (dotEl) dotEl.style.opacity = '';
		applyHudVisibility(false);      // 动画自己已经管过 opacity 了
		clampHud();
		saveHudState();
		hudAnim.debug = { fadeDone: true, atomic: true, glide: hudGlide.active, x: hudState.x, y: hudState.y };
	}

	/* ---------------- 悬浮提示（内容被裁时显示完整文字） ----------------
	 * 用户实测："线路依旧显示不全" —— 面板宽度有限，长主机名只能在悬浮时看全。
	 * 出现/消失都要有动画（用户特意提醒"消失动画别忘记"）。 */
	let hudTip = null, hudTipTimer = null;

	function ensureTip() {
		if (hudTip || !document.documentElement) return hudTip;
		hudTip = document.createElement('div');
		hudTip.id = 'ttn-tip';
		document.documentElement.appendChild(hudTip);
		return hudTip;
	}

	function hideTip() {
		if (!hudTip || !hudTip.classList.contains('on')) return;
		hudTip.classList.remove('on');                 // 先摘 .on → 跑淡出
		if (hudTipTimer) clearTimeout(hudTipTimer);
		hudTipTimer = setTimeout(function () {
			hudTipTimer = null;
			if (hudTip && !hudTip.classList.contains('on')) hudTip.style.display = 'none';
		}, 200);
	}

	/** 给一个"可能被裁"的文本节点挂悬浮提示（只有真的溢出才显示） */
	function attachTip(el) {
		if (!el || el.__ttnTip) return;
		el.__ttnTip = true;
		el.addEventListener('mouseenter', function () {
			if (el.scrollWidth <= el.clientWidth + 1) return;      // 显示得下就不打扰
			const tip = ensureTip();
			if (!tip) return;
			tip.textContent = String(el.textContent || '').trim();
			if (hudTipTimer) { clearTimeout(hudTipTimer); hudTipTimer = null; }
			tip.style.display = 'block';
			tip.style.left = '0px'; tip.style.top = '0px';
			const r = el.getBoundingClientRect();
			const w = tip.offsetWidth, h = tip.offsetHeight;
			let left = r.left + r.width / 2 - w / 2;
			left = Math.max(6, Math.min(left, window.innerWidth - w - 6));
			let top = r.top - h - 6;
			if (top < 6) top = r.bottom + 6;                       // 上面放不下就放下面
			tip.style.left = Math.round(left) + 'px';
			tip.style.top = Math.round(top) + 'px';
			void tip.offsetWidth;
			tip.classList.add('on');
		});
		el.addEventListener('mouseleave', hideTip);
	}

	function setHudHidden(on) {
		if (hudState.hidden === !!on) return;
		closeLangMenu();
		hideTip();
		hudState.hidden = !!on;
		applyHudVisibility(true);
		saveHudState();
	}

	/* 显隐也要平滑：display 不能过渡，所以先过 opacity，再（延迟）把元素从布局里拿掉。
	 * fade=false 是给展开/收起动画用的 —— 那条路径的 opacity 由 CSS 过渡自己管，
	 * 这里插手会把动画抹掉（也就会闪一下）。 */
	const hudFade = { timer: null };

	function applyHudVisibility(fade) {
		if (!hud) return;
		const on = CFG.hud && !hudState.hidden;
		const target = hudState.ball ? hudBall : hud;
		const other = hudState.ball ? hud : hudBall;
		if (!target) return;
		if (hudFade.timer) { clearTimeout(hudFade.timer); hudFade.timer = null; }

		if (on) {
			if (other) other.style.display = 'none';
			target.style.display = hudState.ball ? 'flex' : 'block';
			if (fade === false) return;              // 动画路径：不碰 opacity
			target.style.opacity = '0';
			void target.offsetWidth;                 // 强制重排，淡入才有起点
			target.style.opacity = '1';
			return;
		}

		// 关闭：先淡出，再收起来
		if (fade === false) {
			if (hud) hud.style.display = 'none';
			if (hudBall) hudBall.style.display = 'none';
			return;
		}
		if (hud) hud.style.opacity = '0';
		if (hudBall) hudBall.style.opacity = '0';
		hudFade.timer = setTimeout(function () {
			hudFade.timer = null;
			if (CFG.hud && !hudState.hidden) return;   // 又打开了，别收
			if (hud) hud.style.display = 'none';
			if (hudBall) hudBall.style.display = 'none';
		}, 240);
	}

	/* ---------------- 渲染 ---------------- */

	function primaryConn() {
		// 必须把"我们自己开的延迟探测连接"排除掉：
		// 它是 2 秒才来一帧的节奏，一旦被选中当"游戏连接"，帧样本必然不足
		// → 稳定度算不出来 → 悬浮球永远灰、一个数字都不显示。
		const game = conns.filter(function (c) { return !c.probe; });
		if (!game.length) return null;
		const open = game.filter(c => c.ws && c.ws.readyState === 1);
		const pool = open.length ? open : game;
		// 游戏自己每隔 ~30s 会为选服开一批"只收一两帧就关"的探测连接。
		// 它们的 lastT 很新，会把真正在跑游戏的那条挤掉 —— 拿它们算帧节奏必然没样本。
		// 只收到过 ≤2 帧的连接不可能是游戏主连接，直接排除（排除后空了再退回全部）。
		const lively = pool.filter(function (c) { return (c.framesIn || 0) > 2; });
		const list = lively.length ? lively : pool;
		// 按"最后一次收到帧的时间"挑，而不是总帧数：
		// 换房间/换服后旧连接可能还挂着，按总帧数会一直选中它，
		// 于是延迟/卡顿全都显示的是上一个服的。
		return list.slice().sort(function (a, b) {
			const d = (b.lastT || 0) - (a.lastT || 0);
			return d !== 0 ? d : (b.framesIn - a.framesIn);
		})[0];
	}

	function shortHost(h) { return String(h).replace(/\.tanktrouble\.com$/, ''); }
	function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
	function row(k, v) { return '<span class="ttn-k">' + escapeHtml(k) + '</span><span class="ttn-v">' + v + '</span>'; }
	function num(v, color) { return '<span style="color:' + color + '">' + v + '</span>'; }
	function cstr(c) { return rgbStr(c); }

	/**
	 * 会变的数字/短文字：双层"推上去"的位置动画。
	 *  · 内容没变 → 一个字节都不碰（不闪、不重排）；
	 *  · 首次赋值 → 直接显示，不做动画；
	 *  · 变了 → 新值从下方推入、旧值向上推出（opacity 只轻微参与，不会"一闪一闪"）。
	 */
	function setRoll(box, text) {
		if (!box || text == null) return;
		if (box.__last === text) return;              // 内容没变 → 一个字节都不碰
		const first = box.__last == null;
		box.__last = text;
		box.textContent = text;
		if (first) return;                            // 首次赋值：直接显示，不做动画
		// 单层位移：从下方 0.42em 处浮上来（位置动画，不裁剪、不闪）
		box.style.transition = 'none';
		box.style.transform = 'translateY(.42em)';
		box.style.opacity = '.45';
		void box.offsetWidth;                         // 先摆好起点，再交给过渡
		box.style.transition = '';
		box.style.transform = '';
		box.style.opacity = '';
	}

	/** 静态文字（单位、前缀、说明…）：内容不变就完全不碰 */
	function setPlain(el, text) {
		if (!el || text == null) return;
		if (el.textContent !== text) el.textContent = text;
	}

	/** 写"值"这一格：颜色走过渡（柔和，不闪），文字交给 setRoll/setPlain */
	function setVal(ref, text, color) {
		if (!ref) return;
		const el = ref.v || ref;
		if (color && el.style.color !== color) el.style.color = color;
		if (text == null) return;
		if (ref.roll) setRoll(ref.roll, text);
		else setPlain(el, text);
	}

	function refreshHud() {
		if (!CFG.hud) return;
		sanitizeDragState();
		ensureHud();
		if (!hud || hudState.hidden) return;

		const m = netMetrics();
		const col = overallColor(m);
		const colStr = cstr(col);
		updateOptLabel();

		if (hudBall && hudRefs) {
			/* 每一行各自判断有没有数据：延迟缺了不影响稳定度那一行（反之亦然）。
			 * 以前是"两块都齐才显示"，缺一块整球就全灰，看着像坏了。 */
			setPlain(hudRefs.ballT.pre, tr('ballAvg') + ' ');
			setVal(hudRefs.ballT, m.okPing ? String(m.avg) : '--',
				cstr(m.okPing ? gradeAvg(m.avg) : ST_GRAY));
			setVal(hudRefs.ballM, m.okPing ? String(m.now) : '--',
				cstr(m.okPing ? gradeAvg(m.now) : ST_GRAY));
			setPlain(hudRefs.ballB.pre, tr('ballStab') + ' ');
			setVal(hudRefs.ballB, m.okCad ? String(m.stability) : '--',
				cstr(m.okCad ? gradeStability(m.stability) : ST_GRAY));
			if (hudBall.style.borderColor !== colStr) hudBall.style.borderColor = colStr;
			if (hudBall.style.color !== colStr) hudBall.style.color = colStr;
			/* 优化开：呼吸光晕（周期/强度跟着延迟走 —— 延迟越大，呼吸越慢、光晕越铺开）；
			 * 优化关：只有颜色，没有额外发光（全靠 CSS 的 .on / :not(.on)）。 */
			const wantOn = !!SMOOTH.enabled;
			// 延迟决定呼吸周期/强度：60ms → 1.4s，300ms → 2.6s（量化 200ms 一档，避免抖动）
			const breatheDur = Math.max(1200, Math.min(2600, Math.round((1400 + (m.avg - 60) * 5) / 200) * 200));
			const breatheGlow = Math.max(10, Math.min(30, Math.round(14 + (m.avg - 60) / 6)));
			// 大球和面板左上角的小圆点用**同一套**激活效果（用户要求同步）
			applyGlow(hudBall, wantOn, breatheDur, breatheGlow);
			applyGlow(hud.querySelector('#ttn-dot'), wantOn, breatheDur, breatheGlow);
			// 只在"缺数据"时给一句原因（用户明确不要"点击展开面板"这种提示字，多余）
			const tip = m.why || '';
			if (hudBall.title !== tip) hudBall.title = tip;
		}

		if (!hudState.ball && hudRefs) {
			const c = primaryConn();
			const host = c ? shortHost(String(c.url).replace(/^wss?:\/\//, '').replace(/:443$/, '')) : null;
			setVal(hudRefs.line, c ? host : tr('waitConn'), null);
			setVal(hudRefs.live, m.okPing ? String(m.now) : '—',
				m.okPing ? cstr(gradeAvg(m.now)) : null);      // 实时延迟（在平均延迟上面）
			setPlain(hudRefs.avg.pre, m.thin ? '≈ ' : '');     // 前缀：内容不变就不动
			setVal(hudRefs.avg, m.okPing ? String(m.avg) : '—',
				m.okPing ? cstr(gradeAvg(m.avg)) : null);
			setVal(hudRefs.max, m.okPing ? String(m.max) : '—',
				m.okPing ? cstr(gradeMax(m.max)) : null);
			setVal(hudRefs.jit, m.okCad ? String(m.jitterPercent) : '—',
				m.okCad ? cstr(m.jitterPercent < 15 ? ST_GREEN : (m.jitterPercent < 35 ? ST_YELLOW : ST_RED)) : null);
			// 稳定度要写明这一版是怎么算的：帧节奏（默认）/ RTT 抖动兜底 / 沿用上次
			setPlain(hudRefs.stab.note,
				m.stabSrc === 'rtt' ? ' ' + tr('rttJitter') : (m.stabSrc === 'hold' ? ' ≈' : ''));
			setVal(hudRefs.stab, m.okCad ? String(m.stability) : '—',
				m.okCad ? cstr(gradeStability(m.stability)) : null);
			setVal(hudRefs.opt, SMOOTH.enabled ? tr('on') : tr('off'),
				SMOOTH.enabled ? '#4ade80' : '#8b93a1');
			const sub = hudRefs.opt.sub;
			if (sub) {
				setRoll(sub.w1, tr('smoothed'));  setRoll(sub.r1, String(SMOOTH.stats.glideFrames));
				setRoll(sub.w2, tr('ignored'));   setRoll(sub.r2, String(SMOOTH.stats.ignored));
			}
			// 状态行：折叠/展开走过渡，不把面板"啪"地撑高
			const st = hudRefs.status;
			if (st) {
				setRoll(st.v, m.why || '');
				const on = !!m.why;
				if (st.on !== on) {
					st.on = on;
					st.row.className = on ? 'on' : '';
				}
			}
			/* 首次显示时，先给球/圆点一个中性色（和 CSS 基础色一致）。
		 * 否则在 refreshHud 写入真实颜色之前会露出基础色 —— 用户实测"闪一下不该出现的绿色"。 */
		const dotEl0 = hud.querySelector('#ttn-dot');
		if (dotEl0) {
			dotEl0.style.background = cstr(ST_GRAY);
			dotEl0.style.color = cstr(ST_GRAY);
		}
		if (hudBall) {
			hudBall.style.borderColor = cstr(ST_GRAY);
			hudBall.style.color = cstr(ST_GRAY);
		}

		hudCache.w = hud.offsetWidth || 288;
			hudCache.h = hud.offsetHeight || 198;

			hudTint.last = colStr;      // 变形要把球染成同一个色，交接才不会跳
			const dot = hud.querySelector('#ttn-dot');
			if (dot) {
				if (dot.style.background !== colStr) dot.style.background = colStr;
				if (dot.style.color !== colStr) dot.style.color = colStr;
			}
		}

		clampHud();
	}

	/* ============================ ④ 报告 ============================ */

	function buildReport() {
		return {
			script: 'tanktrouble-netlab',
			version: VERSION,
			changelog: CHANGELOG,
			time: new Date().toISOString(),
			href: location.href,
			ua: navigator.userAgent,
			prefersReducedMotion: reducedMotion(),
			glowLast: {
				ball: (hudBall && hudBall.__glowLast) || null,
				dot: (hud && hud.querySelector('#ttn-dot') && hud.querySelector('#ttn-dot').__glowLast) || null
			},
			connections: conns.map(c => ({
				url: c.url,
				kind: c.kind,
				openedAt: c.openedAt,
				closedAt: c.closedAt,
				open: c.ws.readyState === 1,
				framesIn: c.framesIn,
				framesOut: c.framesOut,
				bytesIn: c.bytesIn,
				bytesOut: c.bytesOut,
				nonJson: c.nonJson,
				binaryIn: c.binaryIn,
				gap: {
					median: round1(median(c.gaps.slice(-120))),
					max: round1(c.maxGap),
					stallCount: c.stallCount
				},
				stalls: c.stalls,
				shapes: Array.from(c.shapes.values()).map(s => ({
					typeId: s.typeId,
					count: s.count,
					avgBytes: Math.round(s.bytes / Math.max(1, s.count)),
					medianIntervalMs: round1(median(s.intervals)),
					schema: s.schema,
					numericFields: Array.from(s.nums.entries()).map(([path, v]) => ({
						path: path,
						min: v.min,
						max: v.max,
						last: v.last,
						samples: v.count
					})),
					samples: s.samples
				})),
				outSamples: c.outSamples,
				binarySamples: { first: c.binFirst, last: c.binLast },
				binaryOut: { first: c.binOutFirst, last: c.binOutLast, stacks: c.outStacks }
			})),
			discovery: {
				foundVia: tankWatch.stateFoundVia,
				stateSnapshots: tankWatch.stateSnapshots,
				stateKeys: tankWatch.stateKeys || null,
				groupKeys: tankWatch.groupKeys || null,
				localIds: { via: localIdsInfo.via, tried: localIdsInfo.tried, dumped: localIdsInfo.dumped || null },
				info: tankWatch.discoveryInfo
			},
			entities: entityStats,
			modelProfile: modelProfile.samples,
			// 悬浮球"全灰"时的排查全靠这一段：探测连没连上、有没有应答、对方都发些什么
			metrics: (function () {
				const m = netMetrics();
				return {
					ok: m.ok, okPing: m.okPing, okCad: m.okCad, why: m.why,
					avg: m.avg, now: m.now, max: m.max, stability: m.stability,
					samples: m.samples, thin: m.thin, latSrc: m.latSrc,
					latAgeMs: m.latAge, latWinSec: m.latWin,
					base: m.base, stallMax: m.stallMax, stalls60: m.stalls
				};
			})(),
			ping: { host: ping.host, connected: ping.connected, interval: ping.interval,
				sends: ping.sends, answers: ping.answers, fails: ping.fails,
				switches: ping.switches || 0, failsSinceStart: ping.failsSinceStart,
				lastErr: ping.lastErr, lastClose: ping.lastClose, sawTypes: ping.sawTypes,
				samples: ping.samples.slice(-40) },
			latencySources: (function () {
				const out = {};
				ping.samples.forEach(function (s) {
					const k = s.src || 'probe';
					if (!out[k]) out[k] = { n: 0, last: 0, lastRtt: 0 };
					out[k].n++;
					out[k].last = s.t; out[k].lastRtt = Math.round(s.rtt);
				});
				return out;      // 哪条路来的样本最多，一眼可见
			})(),
			tanks: tankWatch.records.map(r => {
				const st = recStats(r);
				return {
					label: r.label,
					positionHost: r.positionHost,
					renderSwaps: r.renderSwaps || 0,
					hasRenderHook: !!r.hasRenderHook,
					writes: r.writes,
					frameJumps: st.frameJumps,
					glideFrames: st.glideFrames,
					maxWriteStep: round1(r.maxStep),
					maxFrameStep: round1(st.maxFrameStep),
					perAxis: r.perAxis,
					// 抽样到的写入调用栈：这能直接告出"到底是谁在移动我的坦克"
					writeStacks: Array.from(r.stacks.values()).map(s => ({
						count: s.count,
						maxStep: s.maxStep,
						stack: s.stack
					}))
				};
			}),
			roundEvents: (() => {
				const names = roundEventNames();
				return {
					names: names,
					counts: Array.from(tankWatch.roundEvents.entries()).map(([id, v]) => ({
						id: id,
						name: (names && names[id]) || null,
						count: v.n
					}))
				};
			})(),
			regionProbe: {
				lastRun: regionProbe.lastRun,
				hosts: regionProbe.hosts,
				ranking: regionProbe.result
			},
			smoothing: {
				enabled: SMOOTH.enabled,
				config: {
					localPosition: SMOOTH.localPosition,
					localRotation: SMOOTH.localRotation,
					enemyPosition: SMOOTH.enemyPosition,
					enemyRotation: SMOOTH.enemyRotation,
					entityPosition: SMOOTH.entityPosition,
					entityRotation: SMOOTH.entityRotation,
					localAuthority: SMOOTH.localAuthority,
					localAuthorityRot: SMOOTH.localAuthorityRot,
					renderSmooth: SMOOTH.renderSmooth,
					stateSmooth: SMOOTH.stateSmooth,
					authFactor: SMOOTH.authFactor,
					warmupFrames: SMOOTH.warmupFrames,
					entityWarmupFrames: SMOOTH.entityWarmupFrames,
					frameJumpFactor: SMOOTH.frameJumpFactor,
					minFrameStep: SMOOTH.minFrameStep,
					catchUpFactor: SMOOTH.catchUpFactor,
					glideMaxMs: SMOOTH.glideMaxMs,
					backstopMs: SMOOTH.backstopMs,
					giantFactor: SMOOTH.giantFactor
				},
				stats: SMOOTH.stats,
				tanks: tankWatch.records.map(r => {
					const st = recStats(r);
					return {
						label: r.label,
						positionHost: r.positionHost,
						frameJumps: st.frameJumps,
						glideFrames: st.glideFrames,
						maxFrameStep: round1(st.maxFrameStep),
						axes: Object.keys(r.perAxis).map(k => ({
							axis: k,
							writes: r.perAxis[k].writes,
							frameJumps: r.perAxis[k].frameJumps,
							glideFrames: r.perAxis[k].glideFrames,
							maxStep: round1(r.perAxis[k].maxStep),
							maxFrameStep: round1(r.perAxis[k].maxFrameStep)
						}))
					};
				})
			},
			verdict: buildVerdict()
		};
	}

	function buildVerdict() {
		const out = [];
		const c = primaryConn();
		if (!c) { out.push('没抓到 WebSocket：还没进对局，或游戏换用了其它传输。'); return out; }

		const busy = c.stalls.filter(s => s.burstFrames >= 3);
		if (c.binaryIn > 0) out.push('协议是二进制的，第 2 阶段要走解码路线（不是 JSON 改写）。');
		else if (c.nonJson > 0) out.push('有 ' + c.nonJson + ' 帧不是 JSON，需单独确认。');
		else out.push('协议是文本 JSON，可以安全地在 WebSocket 层做平滑改写。');

		if (busy.length >= 3) {
			out.push('卡顿后紧跟多帧补发 (' + busy.length + ' 次)：强烈提示 TCP 队头阻塞，即"网络丢包 → 重传 → 客户端先僵住再跳"。');
			out.push('这种情况下，"某个按键事件被丢弃"不是主因（TCP 有序可靠，不会只丢一条输入）；真正要做的是缩短停顿或在客户端把这次跳跃抹平。');
		} else if (c.stallCount >= 3) {
			out.push('有 ' + c.stallCount + ' 次间隔异常但没有明显补发洪流，更可能是服务器 tick 抖动或本地渲染卡顿（而不是链路丢包）。');
		} else {
			out.push('本次采样没发现明显卡顿，瞬移可能是更偶发的事件——建议多玩几局、或在明显卡的时候立即导出。');
		}

		// 反读回检测：丢掉了修正但偏差始终为 0 → 游戏把精灵值读回模型了，改精灵就是在改模拟
		const la = tankWatch.records.filter(r => String(r.label).indexOf('LOCAL') === 0);
		for (let i = 0; i < la.length; i++) {
			const ax = la[i].perAxis && la[i].perAxis.x;
			if (ax && ax.ignored > 20 && Math.abs(ax.divergence) < 0.01) {
				out.push('检测到反读回：丢弃了 ' + ax.ignored + ' 次修正但偏差始终为 0 —— '
					+ '游戏会把精灵坐标读回模型，所以任何精灵层改动都会与服务器修正互相拽（狂抖）。'
					+ '优化默认关闭就是这个原因。');
				break;
			}
		}

		const anyJumpStack = tankWatch.records.some(r => r.stacks.size > 0);
		if (anyJumpStack) out.push('已抓到坦克坐标大跳变的调用栈 → 第 2 阶段可以直接只平滑那一条路径。');
		else if (tankWatch.records.length) out.push('监视了坦克但没抓到跳变（可能这局比较顺）；坦克坐标写入是 accessor，可直接平滑。');

		return out;
	}

	function exportReport() {
		const rep = buildReport();
		const text = JSON.stringify(rep, null, 1);
		try {
			const blob = new Blob([text], { type: 'application/json' });
			const a = document.createElement('a');
			a.href = URL.createObjectURL(blob);
			a.download = 'tt-netlab-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
			document.body.appendChild(a);
			a.click();
			setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
		} catch (e) { console.warn('[TTN] 下载失败：', e); }

		try {
			if (navigator.clipboard) navigator.clipboard.writeText(text).then(
				() => console.log('[TTN] 报告已复制到剪贴板，同时已下载文件。'),
				() => console.log('[TTN] 报告已下载（剪贴板被拒绝）。')
			);
		} catch (e) {}

		console.log('[TTN] 报告：', rep);
		return rep;
	}

	/* ============================ ⑤ 启动 ============================ */

	addEventListener('keydown', ev => {
		if (!ev.ctrlKey || !ev.shiftKey) return;
		if (ev.code === 'KeyL') { ensureHud(); setHudHidden(!hudState.hidden); ev.preventDefault(); }
		else if (ev.code === 'KeyE') { exportReport(); ev.preventDefault(); }
		else if (ev.code === 'KeyP') { probeRegions(30); ev.preventDefault(); }
		else if (ev.code === 'KeyS') {
			SMOOTH.enabled = !SMOOTH.enabled;
			if (!SMOOTH.enabled) snapAllSmoothers();
			console.log('[TTN] 平滑已' + (SMOOTH.enabled ? '开启' : '关闭'));
			ev.preventDefault();
		}
	}, true);

	let spawnHookTries = 0;
	setInterval(() => {
		conns.forEach(finalizeStall);
		probeGame();
		hookRoundEvents();
		// 游戏脚本可能在 document-start 之后才定义那些精灵类，所以持续补装（幂等，装完就几乎零成本）
		if (spawnHookTries < 120) { spawnHookTries++; try { installSpawnHooks(); } catch (e) {} }
		// 一旦有游戏连接，就开一条独立的 ping 连接测真 RTT
		try {
			const gc = primaryConn();
			if (gc && gc.framesIn > 20) {
				const hm = String(gc.url).match(/^wss?:\/\/([^:\/]+)/);
				if (hm) startPingProbe(hm[1]);
			}
		} catch (e) {}
	}, 1000);

	// 逐帧驱动平滑：优先 requestAnimationFrame，没有就退化到 16ms 定时器
	(function startFrameLoop() {
		const raf = window.requestAnimationFrame
			? window.requestAnimationFrame.bind(window)
			: (window.webkitRequestAnimationFrame ? window.webkitRequestAnimationFrame.bind(window) : null);
		if (raf) {
			const loop = function () {
				try { tickSmoothers(now()); } catch (e) { /* 平滑绝不能拖垮游戏 */ }
				raf(loop);
			};
			raf(loop);
		} else {
			setInterval(function () {
				try { tickSmoothers(now()); } catch (e) {}
			}, 16);
		}
	})();

	setInterval(refreshHud, 250);

	window.__TTN__ = {
		version: VERSION,
		conns: conns,
		tankWatch: tankWatch,
		regionProbe: regionProbe,
		report: buildReport,
		export: exportReport,
		probe: probeGame,
		probeRegions: probeRegions,
		aggregateRegion: aggregateRegion,
		smoothing: SMOOTH,
		entityStats: entityStats,
		modelProfile: modelProfile.samples,
		netMetrics: netMetrics,
		ping: ping,
		primaryConn: primaryConn,   // 测试/调试：当前正在用的连接
		_recordIn: recordIn,        // 测试用：直接喂一帧（走和真实路径完全相同的判定）
		_recordOut: recordOut,      // 测试用：直接喂一次发送
		connHost: connHost,
		pushLatency: pushLatency,
		startPingProbe: startPingProbe,
		_grade: { avg: gradeAvg, max: gradeMax, stability: gradeStability },
		_overallColor: overallColor,
		installSpawnHooks: installSpawnHooks,
		localPlayerIds: localPlayerIds,
		snapAll: snapAllSmoothers,
		_tick: tickSmoothers,        // 测试/手动驱动用：正常由 requestAnimationFrame 驱动
		setSmoothing(on) { SMOOTH.enabled = !!on; if (!SMOOTH.enabled) snapAllSmoothers(); saveHudState(); updateOptLabel(); refreshHud(); return SMOOTH.enabled; },
		setLang: setLang,                  // 换语言：立刻生效 + 存档
		getLang() { return LANG; },
		langs: LANGS,                      // [[code, displayName], …] 10 国
		i18n: I18N,
		tr: tr,
		_loadHudState: loadHudState,       // 测试用：模拟重新载入存档
		_saveHudState: saveHudState,
		regionHosts: regionHosts,
		setHud(on) { CFG.hud = !!on; ensureHud(); applyHudVisibility(); refreshHud(); clampHud(); },
		hudState: hudState,          // 调试/测试用
		clampHud: clampHud,
		dotCenterRel: dotCenterRel,
		ballAt: ballAt,
		ballAtOf: ballAtOf,
		_clampedAnchor: clampedAnchor,   // 测试/调试：给定状态下的可视区夹取结果
		hudCache: hudCache,
		DOT_SIZE: DOT_SIZE,
		_glide: hudGlide,                // 测试/调试：位置回弹/惯性甩动状态机
		_throwHud: throwHud,             // 测试/调试：惯性甩动
		_throwVelocity: throwVelocity,   // 测试/调试：从指针轨迹算松手速度
		_THROW: THROW,
		motion: THROW,                   // 手感实时微调：__TTN__.motion.friction = 0.85
		_hudAnimate: hudAnimate,          // 测试/调试：展开/收起动画
		_finishHudAnim: finishHudAnim,    // 测试/调试：立刻结束变形动画
		_cleanupDrag: cleanupDrag,        // 测试/调试：强制收拾拖动状态（看门狗就是调它）
		isHudAnimating: function () { return hudAnimating; },
		_hudAnim: hudAnim
	};

	console.log('%c[TT NetLab v' + VERSION + '] 已装载。进一局对战后按 Ctrl+Shift+E 导出报告。', 'color:#4ade80');
	console.log('[TTN] 控制台接口：__TTN__.report() / __TTN__.export() / __TTN__.conns / __TTN__.tankWatch');
	console.log('[TTN] 选线路：__TTN__.probeRegions(30) —— 换梯子节点后重跑一次，比较排名，别再靠玄学。');
	console.log('%c[TTN] 版本 ' + VERSION + ' 变更记录：', 'color:#7aa2f7');
	CHANGELOG.forEach(function (c) {
		console.log('  v' + c[0] + '  ' + c.slice(1).join('；'));
	});
})();
