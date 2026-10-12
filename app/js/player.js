/* Holst — player: renders slides and runs interactivity.
   Self-contained on purpose: export.js inlines holstPlayerModule.toString()
   into exported .html files, so this file must not depend on anything else. */
function holstPlayerModule() {
  /* Holst player · SPDX-License-Identifier: MIT · https://github.com/skysyndicatecorner/holst */
  'use strict';

  var W = 1280, H = 720;

  var FONTS = {
    sans: 'Inter, "Segoe UI", Roboto, Ubuntu, "Noto Sans", "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, "Noto Serif", "Times New Roman", serif',
    display: '"Trebuchet MS", "Segoe UI Semibold", Ubuntu, "Noto Sans", sans-serif',
    mono: '"JetBrains Mono", Consolas, "Ubuntu Mono", "Noto Sans Mono", monospace',
    hand: '"Segoe Print", "Comic Sans MS", "Comic Neue", "Noto Sans", cursive'
  };

  var CSS = [
    '.hp-root{position:relative;width:100%;height:100%;overflow:hidden;background:#0d0f14;touch-action:manipulation;-webkit-user-select:none;user-select:none}',
    '.hp-root.hp-transparent{background:transparent}',
    '.hp-stage{position:absolute;left:0;top:0;width:1280px;height:720px;transform-origin:0 0;overflow:hidden}',
    '.hp-slide{position:absolute;inset:0;overflow:hidden;background-size:cover;background-position:center}',
    '.hp-obj{position:absolute;box-sizing:border-box}',
    '.hp-obj svg{position:absolute;inset:0;overflow:visible}',
    '.hp-text{white-space:pre-wrap;word-wrap:break-word;line-height:1.25;outline:none}',
    '.hp-img{width:100%;height:100%;display:block;pointer-events:none;-webkit-user-drag:none}',
    '.hp-btn{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;cursor:pointer;transition:transform .12s,filter .12s;padding:0 12px}',
    '.hp-run .hp-btn:hover{filter:brightness(1.08);transform:translateY(-2px)}',
    '.hp-run .hp-btn:active{transform:translateY(1px) scale(.98)}',
    '.hp-run .hp-click{cursor:pointer}',
    '.hp-quiz{display:flex;flex-direction:column;gap:14px;padding:24px;overflow:hidden}',
    '.hp-q{font-weight:700;line-height:1.2}',
    '.hp-opts{display:grid;gap:12px;flex:1;min-height:0;grid-auto-rows:minmax(56px,120px);align-content:center}',
    '.hp-opt{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 16px;border-radius:12px;border:2px solid rgba(0,0,0,.08);background:rgba(255,255,255,.9);color:#1d2129;font:inherit;font-weight:600;text-align:left;cursor:pointer;transition:transform .12s,background .15s,border-color .15s}',
    '.hp-opt .hp-letter{flex:none;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff}',
    '.hp-run .hp-opt:hover{transform:translateY(-2px)}',
    '.hp-opt.hp-ok{background:#e3f7ea;border-color:#22a55a}',
    '.hp-opt.hp-bad{background:#fde7e7;border-color:#e0464a}',
    '.hp-opt[disabled]{cursor:default}',
    '.hp-fb{min-height:28px;font-weight:700}',
    '.hp-fb.hp-ok{color:#18894a}.hp-fb.hp-bad{color:#c9353a}',
    '.hp-spot{border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;box-shadow:0 4px 14px rgba(0,0,0,.25)}',
    '.hp-spot::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:3px solid currentColor;opacity:0;animation:hp-ring 2s ease-out infinite}',
    '@keyframes hp-ring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.6);opacity:0}}',
    '.hp-popup-wrap{position:absolute;inset:0;background:rgba(10,12,18,.45);display:flex;align-items:center;justify-content:center;z-index:50;animation:hp-fade .2s ease}',
    '.hp-popup{width:min(620px,80%);max-height:80%;overflow:auto;background:#fff;color:#1d2129;border-radius:18px;padding:32px 36px;box-shadow:0 30px 80px rgba(0,0,0,.35);animation:hp-zoom .25s cubic-bezier(.2,.9,.3,1.2);font-family:' + FONTS.sans + '}',
    '.hp-popup h3{margin:0 0 12px;font-size:32px;line-height:1.2}',
    '.hp-popup p{margin:0 0 24px;font-size:22px;line-height:1.45;white-space:pre-wrap}',
    '.hp-popup button{font:inherit;font-size:20px;font-weight:600;padding:12px 28px;border-radius:12px;border:0;color:#fff;cursor:pointer}',
    '.hp-chrome{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;opacity:0;transition:opacity .25s;z-index:60;pointer-events:none;font-family:' + FONTS.sans + '}',
    '.hp-root:hover .hp-chrome,.hp-root.hp-touch .hp-chrome{opacity:1}',
    '.hp-chrome>*{pointer-events:auto}',
    '.hp-cbtn{width:48px;height:48px;border-radius:50%;border:0;background:rgba(20,22,30,.72);color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)}',
    '.hp-cbtn:disabled{opacity:.35;cursor:default}',
    '.hp-count{background:rgba(20,22,30,.72);color:#fff;border-radius:24px;padding:10px 18px;font-size:15px;backdrop-filter:blur(6px)}',
    '.hp-close{position:absolute;top:14px;right:14px;z-index:61}',
    '.hp-progress{position:absolute;left:0;bottom:0;height:4px;z-index:59;transition:width .3s}',
    '@keyframes hp-fade{from{opacity:0}to{opacity:1}}',
    '@keyframes hp-up{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}',
    '@keyframes hp-left{from{opacity:0;transform:translateX(-80px)}to{opacity:1;transform:none}}',
    '@keyframes hp-zoom{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}',
    '@keyframes hp-bounce{0%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.08)}70%{transform:scale(.95)}100%{transform:none}}',
    '@keyframes hp-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}',
    '@keyframes hp-slidein{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}',
    '.hp-a-fade,.hp-a-up,.hp-a-left,.hp-a-zoom,.hp-a-bounce{animation-duration:.7s;animation-fill-mode:both;animation-timing-function:cubic-bezier(.2,.8,.2,1)}',
    '.hp-a-fade>.hp-in{animation:hp-fade .7s both}',
    '.hp-enter{animation:hp-slidein .45s cubic-bezier(.2,.8,.2,1) both}',
    '@media print{.hp-print-page{page-break-after:always;break-after:page}}'
  ].join('\n');

  function injectCSS(doc) {
    doc = doc || document;
    if (doc.getElementById('hp-css')) return;
    var s = doc.createElement('style');
    s.id = 'hp-css';
    s.textContent = CSS;
    (doc.head || doc.documentElement).appendChild(s);
  }

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  var SVGNS = 'http://www.w3.org/2000/svg';

  function shapePath(shape, w, h, r) {
    var cx = w / 2, cy = h / 2, i, pts = [];
    switch (shape) {
      case 'ellipse':
        return 'M' + cx + ' 0A' + cx + ' ' + cy + ' 0 1 1 ' + cx + ' ' + h + 'A' + cx + ' ' + cy + ' 0 1 1 ' + cx + ' 0Z';
      case 'triangle':
        return 'M' + cx + ' 0L' + w + ' ' + h + 'L0 ' + h + 'Z';
      case 'diamond':
        return 'M' + cx + ' 0L' + w + ' ' + cy + 'L' + cx + ' ' + h + 'L0 ' + cy + 'Z';
      case 'hexagon':
        var q = w * 0.25;
        return 'M' + q + ' 0L' + (w - q) + ' 0L' + w + ' ' + cy + 'L' + (w - q) + ' ' + h + 'L' + q + ' ' + h + 'L0 ' + cy + 'Z';
      case 'star':
        for (i = 0; i < 10; i++) {
          var ang = -Math.PI / 2 + i * Math.PI / 5;
          var rr = i % 2 === 0 ? 1 : 0.42;
          pts.push((cx + Math.cos(ang) * cx * rr).toFixed(2) + ' ' + (cy + Math.sin(ang) * cy * rr + h * 0.05).toFixed(2));
        }
        return 'M' + pts.join('L') + 'Z';
      case 'arrow':
        var hw = Math.min(w * 0.45, h * 0.9), t = h * 0.28;
        return 'M0 ' + t + 'L' + (w - hw) + ' ' + t + 'L' + (w - hw) + ' 0L' + w + ' ' + cy + 'L' + (w - hw) + ' ' + h + 'L' + (w - hw) + ' ' + (h - t) + 'L0 ' + (h - t) + 'Z';
      case 'heart':
        return 'M' + cx + ' ' + h + 'C' + (w * -0.1) + ' ' + (h * 0.55) + ' ' + (w * 0.02) + ' ' + (h * -0.12) + ' ' + cx + ' ' + (h * 0.22) +
          'C' + (w * 0.98) + ' ' + (h * -0.12) + ' ' + (w * 1.1) + ' ' + (h * 0.55) + ' ' + cx + ' ' + h + 'Z';
      case 'bubble':
        var bh = h * 0.78, rad = Math.min(r || 24, bh / 2, w / 2);
        return 'M' + rad + ' 0H' + (w - rad) + 'Q' + w + ' 0 ' + w + ' ' + rad + 'V' + (bh - rad) + 'Q' + w + ' ' + bh + ' ' + (w - rad) + ' ' + bh +
          'H' + (w * 0.38) + 'L' + (w * 0.2) + ' ' + h + 'L' + (w * 0.24) + ' ' + bh + 'H' + rad + 'Q0 ' + bh + ' 0 ' + (bh - rad) + 'V' + rad + 'Q0 0 ' + rad + ' 0Z';
      default: // rect
        r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
        if (!r) return 'M0 0H' + w + 'V' + h + 'H0Z';
        return 'M' + r + ' 0H' + (w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + w + ' ' + r + 'V' + (h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (w - r) + ' ' + h +
          'H' + r + 'A' + r + ' ' + r + ' 0 0 1 0 ' + (h - r) + 'V' + r + 'A' + r + ' ' + r + ' 0 0 1 ' + r + ' 0Z';
    }
  }

  function shapeSVG(o) {
    var s = o.style || {};
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', o.w);
    svg.setAttribute('height', o.h);
    svg.setAttribute('viewBox', '0 0 ' + o.w + ' ' + o.h);
    var p = document.createElementNS(SVGNS, 'path');
    p.setAttribute('d', shapePath(o.shape, o.w, o.h, s.radius));
    p.setAttribute('fill', s.fill || 'none');
    if (s.stroke && s.strokeW) {
      p.setAttribute('stroke', s.stroke);
      p.setAttribute('stroke-width', s.strokeW);
      p.setAttribute('stroke-linejoin', 'round');
    }
    svg.appendChild(p);
    return svg;
  }

  function fillText(str, state) {
    if (!state || str == null) return str;
    return String(str).replace(/\{score\}/g, state.score).replace(/\{total\}/g, state.total);
  }

  function applyBox(node, o) {
    node.style.left = o.x + 'px';
    node.style.top = o.y + 'px';
    node.style.width = o.w + 'px';
    node.style.height = o.h + 'px';
    var tr = [];
    if (o.rot) tr.push('rotate(' + o.rot + 'deg)');
    node.style.transform = tr.join(' ');
    var s = o.style || {};
    node.style.opacity = s.opacity != null ? s.opacity : 1;
    if (s.shadow) node.style.filter = 'drop-shadow(0 10px 24px rgba(0,0,0,.22))';
    else node.style.filter = '';
  }

  function textStyle(node, s, project) {
    node.style.color = s.color || '#1d2129';
    node.style.fontSize = (s.fontSize || 28) + 'px';
    node.style.fontWeight = s.bold ? 700 : 400;
    node.style.fontStyle = s.italic ? 'italic' : 'normal';
    node.style.textAlign = s.align || 'left';
    node.style.fontFamily = FONTS[s.font || (project && project.font) || 'sans'] || FONTS.sans;
  }

  var LETTER_COLORS = ['#5b5bf7', '#f59e0b', '#10b981', '#ef4444', '#0ea5e9', '#ec4899'];

  // Build one object element. ctx: {edit, state, onAction, onAnswer, project}
  function renderObject(o, ctx) {
    var s = o.style || {};
    var node = el('div', 'hp-obj');
    node.dataset.id = o.id;
    applyBox(node, o);
    var inner;

    switch (o.type) {
      case 'text':
        inner = el('div', 'hp-text hp-in', node);
        inner.style.width = '100%';
        inner.style.height = '100%';
        textStyle(inner, s, ctx.project);
        inner.style.display = 'flex';
        inner.style.flexDirection = 'column';
        inner.style.justifyContent = s.valign === 'middle' ? 'center' : (s.valign === 'bottom' ? 'flex-end' : 'flex-start');
        if (s.fill && s.fill !== 'none') {
          inner.style.background = s.fill;
          inner.style.borderRadius = (s.radius || 0) + 'px';
          inner.style.padding = '12px 18px';
          inner.style.boxSizing = 'border-box';
        }
        var span = el('div', 'hp-tx', inner);
        span.textContent = ctx.edit ? o.text : fillText(o.text, ctx.state);
        break;

      case 'shape':
        node.appendChild(shapeSVG(o));
        if (o.text) {
          inner = el('div', 'hp-text hp-in', node);
          inner.style.position = 'absolute';
          inner.style.inset = '0';
          inner.style.display = 'flex';
          inner.style.alignItems = 'center';
          inner.style.justifyContent = 'center';
          inner.style.padding = '8px 14px';
          textStyle(inner, s, ctx.project);
          inner.style.textAlign = s.align || 'center';
          inner.textContent = ctx.edit ? o.text : fillText(o.text, ctx.state);
        }
        break;

      case 'image':
        var img = el('img', 'hp-img', node);
        img.alt = o.alt || '';
        img.draggable = false;
        img.src = o.src || '';
        img.style.objectFit = o.fit || 'cover';
        img.style.borderRadius = (s.radius || 0) + 'px';
        if (s.stroke && s.strokeW) img.style.border = s.strokeW + 'px solid ' + s.stroke;
        img.style.boxSizing = 'border-box';
        break;

      case 'button':
        inner = el('div', 'hp-btn hp-in', node);
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.boxSizing = 'border-box';
        inner.style.background = s.fill || '#5b5bf7';
        inner.style.borderRadius = (s.radius != null ? s.radius : 14) + 'px';
        if (s.stroke && s.strokeW) inner.style.border = s.strokeW + 'px solid ' + s.stroke;
        textStyle(inner, s, ctx.project);
        inner.style.textAlign = 'center';
        inner.style.fontWeight = s.bold === false ? 400 : 700;
        inner.textContent = o.text;
        break;

      case 'hotspot':
        inner = el('div', 'hp-spot hp-in', node);
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.position = 'relative';
        inner.style.background = s.fill || '#ef4444';
        inner.style.color = s.fill || '#ef4444';
        var mark = el('span', '', inner);
        mark.textContent = o.text || '+';
        mark.style.color = s.color || '#fff';
        mark.style.fontSize = Math.round(Math.min(o.w, o.h) * 0.5) + 'px';
        mark.style.fontFamily = FONTS.sans;
        mark.style.lineHeight = '1';
        break;

      case 'quiz':
        renderQuiz(node, o, ctx);
        break;
    }

    // interactivity
    if (!ctx.edit) {
      var act = o.action || {};
      if (act.type && act.type !== 'none' && o.type !== 'quiz') {
        node.classList.add('hp-click');
        node.setAttribute('role', 'button');
        node.tabIndex = 0;
        var fire = function (e) {
          e.stopPropagation();
          ctx.onAction && ctx.onAction(act, o);
        };
        node.addEventListener('click', fire);
        node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') fire(e); });
      }
      // animation
      var an = o.anim || {};
      if (an.type && an.type !== 'none' && ctx.animate) {
        var dly = (Number(an.delay) || 0) + 's';
        if (an.type === 'pulse') {
          node.style.animation = 'hp-pulse 1.6s ease-in-out ' + dly + ' infinite';
        } else {
          var tf = node.style.transform || '';
          // keep rotation: wrap content so keyframes don't override the rotate transform
          var wrap = el('div', '');
          wrap.style.position = 'absolute';
          wrap.style.inset = '0';
          while (node.firstChild) wrap.appendChild(node.firstChild);
          node.appendChild(wrap);
          wrap.style.animation = 'hp-' + an.type + ' .7s cubic-bezier(.2,.8,.2,1) ' + dly + ' both';
          node.style.transform = tf;
        }
      }
    }
    return node;
  }

  function renderQuiz(node, o, ctx) {
    var s = o.style || {};
    var q = o.quiz || { question: '', options: [], correct: 0 };
    var box = el('div', 'hp-quiz', node);
    box.style.width = '100%';
    box.style.height = '100%';
    box.style.boxSizing = 'border-box';
    box.style.background = s.fill || '#ffffff';
    box.style.borderRadius = (s.radius != null ? s.radius : 20) + 'px';
    box.style.fontFamily = FONTS[s.font || (ctx.project && ctx.project.font) || 'sans'];
    box.style.color = s.color || '#1d2129';
    if (s.stroke && s.strokeW) box.style.border = s.strokeW + 'px solid ' + s.stroke;
    var qe = el('div', 'hp-q', box);
    qe.textContent = q.question;
    qe.style.fontSize = (s.fontSize || 30) + 'px';
    var opts = el('div', 'hp-opts', box);
    var n = (q.options || []).length;
    opts.style.gridTemplateColumns = n > 2 && o.w > 700 ? '1fr 1fr' : '1fr';
    var fb = el('div', 'hp-fb', box);
    fb.style.fontSize = Math.max(18, (s.fontSize || 30) * 0.7) + 'px';
    var answered = ctx.state && ctx.state.answered && ctx.state.answered[o.id];
    var buttons = [];
    (q.options || []).forEach(function (txt, i) {
      var b = el('button', 'hp-opt', opts);
      b.type = 'button';
      var letter = el('span', 'hp-letter', b);
      letter.textContent = String.fromCharCode(65 + i);
      letter.style.background = LETTER_COLORS[i % LETTER_COLORS.length];
      var lab = el('span', '', b);
      lab.textContent = txt;
      b.style.fontSize = Math.max(16, (s.fontSize || 30) * 0.72) + 'px';
      buttons.push(b);
      if (ctx.edit) {
        b.tabIndex = -1;
        if (i === q.correct) b.style.borderColor = '#22a55a';
        return;
      }
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (ctx.state.answered[o.id]) return;
        var ok = i === q.correct;
        ctx.state.answered[o.id] = { choice: i, ok: ok };
        showResult(i, ok);
        ctx.onAnswer && ctx.onAnswer(o, ok);
      });
    });
    function showResult(i, ok) {
      buttons.forEach(function (b, j) {
        b.disabled = true;
        if (j === q.correct) b.classList.add('hp-ok');
        if (j === i && !ok) b.classList.add('hp-bad');
      });
      fb.className = 'hp-fb ' + (ok ? 'hp-ok' : 'hp-bad');
      fb.textContent = ok ? (q.ok || '✓') : (q.bad || '✗');
    }
    if (answered && !ctx.edit) showResult(answered.choice, answered.ok);
  }

  // Render a whole slide into a 1280x720 element
  function renderSlide(slide, project, ctx) {
    ctx = ctx || {};
    ctx.project = project;
    var root = el('div', 'hp-slide');
    root.style.background = slide.bg || '#ffffff';
    if (slide.bgImage) {
      root.style.backgroundImage = 'url("' + slide.bgImage + '")' + (slide.bg && slide.bg.indexOf('gradient') >= 0 ? ',' + slide.bg : '');
      root.style.backgroundSize = 'cover';
      root.style.backgroundPosition = 'center';
    }
    var map = {};
    (slide.objects || []).forEach(function (o) {
      if (o.hidden) return;
      var n = renderObject(o, ctx);
      map[o.id] = n;
      root.appendChild(n);
    });
    root._objMap = map;
    return root;
  }

  // Scaled static thumbnail of a slide inside a container of given width
  function thumbnail(slide, project, width) {
    injectCSS();
    var wrap = el('div', '');
    var h = Math.round(width * H / W);
    wrap.style.cssText = 'position:relative;overflow:hidden;width:' + width + 'px;height:' + h + 'px;pointer-events:none';
    var sl = renderSlide(slide, project, { edit: true });
    sl.style.width = W + 'px';
    sl.style.height = H + 'px';
    sl.style.right = 'auto';
    sl.style.bottom = 'auto';
    sl.style.transformOrigin = '0 0';
    sl.style.transform = 'scale(' + (width / W) + ')';
    wrap.appendChild(sl);
    return wrap;
  }

  function countTotal(project) {
    var t = 0;
    (project.slides || []).forEach(function (s) {
      (s.objects || []).forEach(function (o) {
        if (o.type === 'quiz') t += Number(o.quiz && o.quiz.points != null ? o.quiz.points : 1) || 0;
      });
    });
    return t;
  }

  // Interactive player
  function create(container, project, opts) {
    opts = opts || {};
    injectCSS();
    var strings = opts.strings || {};
    var accent = project.accent || '#5b5bf7';
    var root = el('div', 'hp-root hp-run', container);
    if ('ontouchstart' in window) root.classList.add('hp-touch');
    var stage = el('div', 'hp-stage', root);
    var progress = el('div', 'hp-progress', root);
    progress.style.background = accent;
    var state = { score: 0, total: countTotal(project), answered: {}, history: [] };
    var index = -1;
    var free = project.nav !== 'buttons';
    var popupEl = null;

    // chrome
    var chrome = el('div', 'hp-chrome', root);
    var prevB = el('button', 'hp-cbtn', chrome); prevB.innerHTML = '&#8249;'; prevB.setAttribute('aria-label', strings.prev || 'Previous');
    var count = el('div', 'hp-count', chrome);
    var nextB = el('button', 'hp-cbtn', chrome); nextB.innerHTML = '&#8250;'; nextB.setAttribute('aria-label', strings.next || 'Next');
    var fsB = el('button', 'hp-cbtn', chrome); fsB.innerHTML = '&#x26F6;'; fsB.setAttribute('aria-label', 'Fullscreen');
    prevB.onclick = function () { api.prev(); };
    nextB.onclick = function () { api.next(); };
    fsB.onclick = function () {
      var d = document;
      if (d.fullscreenElement) d.exitFullscreen && d.exitFullscreen();
      else root.requestFullscreen && root.requestFullscreen().catch(function () {});
    };
    if (opts.onClose) {
      var cl = el('button', 'hp-cbtn hp-close', root);
      cl.innerHTML = '&#10005;';
      cl.setAttribute('aria-label', strings.close || 'Close');
      cl.onclick = function () { opts.onClose(); };
    }
    if (!free) { prevB.style.display = 'none'; nextB.style.display = 'none'; }

    function fit() {
      var r = root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var sc = Math.min(r.width / W, r.height / H);
      stage.style.transform = 'translate(' + ((r.width - W * sc) / 2) + 'px,' + ((r.height - H * sc) / 2) + 'px) scale(' + sc + ')';
    }
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(root); else window.addEventListener('resize', fit);

    function closePopup() {
      if (popupEl) { popupEl.remove(); popupEl = null; }
    }

    function showPopup(title, text) {
      closePopup();
      popupEl = el('div', 'hp-popup-wrap', stage);
      var card = el('div', 'hp-popup', popupEl);
      if (title) { var h = el('h3', '', card); h.textContent = title; }
      var p = el('p', '', card); p.textContent = fillText(text || '', state);
      var b = el('button', '', card); b.textContent = strings.close || 'OK'; b.style.background = accent;
      b.onclick = closePopup;
      popupEl.onclick = function (e) { if (e.target === popupEl) closePopup(); };
      setTimeout(function () { b.focus(); }, 30);
    }

    function slideIndexById(id) {
      for (var i = 0; i < project.slides.length; i++) if (project.slides[i].id === id) return i;
      return -1;
    }

    function onAction(act) {
      switch (act.type) {
        case 'next': api.next(true); break;
        case 'prev': api.prev(true); break;
        case 'goto': var i = slideIndexById(act.target); if (i >= 0) api.go(i); break;
        case 'popup': showPopup(act.title, act.text); break;
        case 'restart': api.restart(); break;
        case 'link':
          if (act.url) {
            var u = String(act.url);
            if (!/^(https?:|mailto:)/i.test(u)) u = 'https://' + u;
            if (opts.openLink) opts.openLink(u); else window.open(u, '_blank', 'noopener');
          }
          break;
      }
    }

    function onAnswer(o, ok) {
      if (ok) state.score += Number(o.quiz && o.quiz.points != null ? o.quiz.points : 1) || 0;
      var after = o.quiz && o.quiz.after;
      if (after && after !== 'stay') {
        setTimeout(function () {
          if (after === 'next') api.next(true);
          else { var i = slideIndexById(after); if (i >= 0) api.go(i); }
        }, 1300);
      }
    }

    function render() {
      closePopup();
      stage.innerHTML = '';
      var slide = project.slides[index];
      var sl = renderSlide(slide, project, { edit: false, animate: true, state: state, onAction: onAction, onAnswer: onAnswer });
      sl.classList.add('hp-enter');
      stage.appendChild(sl);
      count.textContent = (strings.slideOf || '{n} / {total}').replace('{n}', index + 1).replace('{total}', project.slides.length);
      prevB.disabled = index === 0;
      nextB.disabled = index >= project.slides.length - 1;
      progress.style.width = ((index + 1) / project.slides.length * 100) + '%';
      fit();
      opts.onSlide && opts.onSlide(index);
    }

    var api = {
      root: root,
      state: state,
      get index() { return index; },
      go: function (i) {
        if (i < 0 || i >= project.slides.length) return;
        if (index >= 0) state.history.push(index);
        index = i;
        render();
      },
      next: function (force) { if ((free || force) && index < project.slides.length - 1) api.go(index + 1); },
      prev: function (force) { if ((free || force) && index > 0) api.go(index - 1); },
      restart: function () { state.score = 0; state.answered = {}; state.history = []; index = -1; api.go(0); },
      destroy: function () {
        document.removeEventListener('keydown', onKey);
        if (ro) ro.disconnect();
        root.remove();
      }
    };

    function onKey(e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (popupEl && (e.key === 'Escape')) { closePopup(); return; }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && free)) { e.preventDefault(); api.next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); api.prev(); }
      else if (e.key === 'Home') api.go(0);
      else if (e.key === 'End' && free) api.go(project.slides.length - 1);
      else if (e.key === 'Escape' && opts.onClose) opts.onClose();
    }
    document.addEventListener('keydown', onKey);

    // swipe
    var sx = null, sy = null;
    root.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { if (dx < 0) api.next(); else api.prev(); }
    });

    api.go(Math.max(0, Math.min(opts.start || 0, project.slides.length - 1)));
    return api;
  }

  // All slides stacked for printing
  function printable(project, doc) {
    injectCSS(doc);
    var wrap = el('div', '');
    project.slides.forEach(function (s) {
      var page = el('div', 'hp-print-page', wrap);
      page.style.cssText = 'position:relative;width:1280px;height:720px;overflow:hidden';
      page.appendChild(renderSlide(s, project, { edit: true }));
    });
    return wrap;
  }

  return {
    W: W, H: H, FONTS: FONTS,
    injectCSS: injectCSS,
    renderSlide: renderSlide,
    renderObject: renderObject,
    shapePath: shapePath,
    thumbnail: thumbnail,
    create: create,
    printable: printable,
    countTotal: countTotal
  };
}
window.HolstPlayer = holstPlayerModule();
