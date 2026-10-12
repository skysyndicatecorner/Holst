/* Holst — editor */
(function () {
  'use strict';

  var W = 1280, H = 720;
  var $ = function (id) { return document.getElementById(id); };

  var project = null, slideIdx = 0, selId = null;
  var history = [], future = [], lastKey = null, lastTime = 0;
  var scale = 1, ox = 0, oy = 0, objMap = {};
  var propTab = 'style', editing = null, session = null, clip = null;
  var saveTimer = null, thumbTimer = null, lastTap = { id: null, t: 0 };
  var wrap, holder, overlay, strip, propBody, propTabs;

  function slide() { return project.slides[slideIdx]; }
  function sel() {
    if (!selId) return null;
    var objs = slide().objects;
    for (var i = 0; i < objs.length; i++) if (objs[i].id === selId) return objs[i];
    return null;
  }
  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function round(n) { return Math.round(n); }

  /* ---------------- history ---------------- */
  function snapshot() { return JSON.stringify(project); }
  // Record an undo point. Changes with the same key within 900 ms merge into one step.
  function record(key) {
    var now = Date.now();
    if (key && key === lastKey && now - lastTime < 900) { lastTime = now; return; }
    history.push(snapshot());
    if (history.length > 60) history.shift();
    future = [];
    lastKey = key; lastTime = now;
  }
  function restore(json) {
    var p = JSON.parse(json);
    Object.keys(project).forEach(function (k) { delete project[k]; });
    Object.assign(project, p);
    if (slideIdx >= project.slides.length) slideIdx = project.slides.length - 1;
    if (!sel()) selId = null;
    $('projName').value = project.name;
    renderAll();
    scheduleSave();
  }
  function undo() {
    if (!history.length) return;
    future.push(snapshot());
    restore(history.pop());
    lastKey = null;
  }
  function redo() {
    if (!future.length) return;
    history.push(snapshot());
    restore(future.pop());
    lastKey = null;
  }
  function updateUndo() {
    $('btnUndo').disabled = !history.length;
    $('btnRedo').disabled = !future.length;
  }

  // Apply a change: record undo point, mutate, re-render
  function change(key, fn, opts) {
    opts = opts || {};
    record(key);
    fn();
    renderStage();
    renderOverlay();
    if (opts.props !== false) renderProps();
    if (opts.strip) renderStrip(); else scheduleThumb();
    scheduleSave();
    updateUndo();
  }

  /* ---------------- save ---------------- */
  function scheduleSave() {
    $('saveState').textContent = '…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 500);
  }
  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (!project) return Promise.resolve();
    return Store.put(project).then(function () {
      $('saveState').textContent = t('saved') + ' ✓';
    }).catch(function () { $('saveState').textContent = '⚠'; });
  }

  /* ---------------- stage ---------------- */
  function fit() {
    if (!project) return;
    var r = wrap.getBoundingClientRect();
    var pad = r.width < 600 ? 10 : 28;
    scale = Math.max(0.05, Math.min((r.width - pad * 2) / W, (r.height - pad * 2) / H));
    ox = (r.width - W * scale) / 2;
    oy = (r.height - H * scale) / 2;
    holder.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + scale + ')';
    renderOverlay();
  }

  function renderStage() {
    if (editing) return;
    holder.innerHTML = '';
    var s = HolstPlayer.renderSlide(slide(), project, { edit: true });
    holder.appendChild(s);
    objMap = s._objMap;
  }

  function toStage(clientX, clientY) {
    var r = wrap.getBoundingClientRect();
    return { x: (clientX - r.left - ox) / scale, y: (clientY - r.top - oy) / scale };
  }

  /* ---------------- overlay / selection ---------------- */
  function renderOverlay(guides) {
    overlay.innerHTML = '';
    var o = sel();
    if (!o) return;
    var box = el('div', 'sel', overlay);
    box.style.left = (ox + o.x * scale) + 'px';
    box.style.top = (oy + o.y * scale) + 'px';
    box.style.width = (o.w * scale) + 'px';
    box.style.height = (o.h * scale) + 'px';
    if (o.rot) box.style.transform = 'rotate(' + o.rot + 'deg)';
    var hs = o.type === 'hotspot' ? ['nw', 'ne', 'se', 'sw'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    if (o.type !== 'hotspot') { el('div', 'rot-line', box); hs.push('rot'); }
    if (!editing) hs.forEach(function (h) { var d = el('div', 'h', box); d.dataset.h = h; });

    if (!editing && !session) {
      var bar = el('div', 'sel-bar', overlay);
      [['copy', 'duplicateObj', duplicateSel], ['up', 'bringFront', function () { arrange(1); }],
        ['down', 'sendBack', function () { arrange(-1); }], ['trash', 'deleteObj', deleteSel]].forEach(function (b) {
        var btn = el('button', 'btn ghost icon-only small', bar);
        btn.innerHTML = Icons.svg(b[0], 18);
        btn.title = t(b[1]);
        btn.setAttribute('aria-label', t(b[1]));
        btn.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
        btn.addEventListener('click', function (e) { e.stopPropagation(); b[2](); });
      });
      var bw = bar.offsetWidth || 150;
      var top = oy + o.y * scale - 56;
      if (top < 6) top = oy + (o.y + o.h) * scale + 14;
      var left = ox + (o.x + o.w / 2) * scale - bw / 2;
      var wr = wrap.clientWidth;
      bar.style.left = Math.max(6, Math.min(wr - bw - 6, left)) + 'px';
      bar.style.top = Math.max(6, Math.min(wrap.clientHeight - 48, top)) + 'px';
    }
    (guides || []).forEach(function (g) {
      var d = el('div', 'guide ' + g.dir, overlay);
      if (g.dir === 'v') d.style.left = (ox + g.at * scale) + 'px';
      else d.style.top = (oy + g.at * scale) + 'px';
    });
  }

  function select(id) {
    if (editing) finishTextEdit();
    if (selId === id) return;
    selId = id;
    if (id && propTab !== 'style' && propTab !== 'anim' && propTab !== 'action') propTab = 'style';
    renderOverlay();
    renderProps();
  }

  /* ---------------- pointer interaction ---------------- */
  function snapMove(o, nx, ny) {
    var thr = 7 / scale, guides = [];
    var xs = [0, W / 2, W], ys = [0, H / 2, H];
    slide().objects.forEach(function (b) {
      if (b.id === o.id || b.hidden) return;
      xs.push(b.x, b.x + b.w / 2, b.x + b.w);
      ys.push(b.y, b.y + b.h / 2, b.y + b.h);
    });
    var bestX = null, bestY = null;
    [0, o.w / 2, o.w].forEach(function (off) {
      xs.forEach(function (c) {
        var d = c - (nx + off);
        if (Math.abs(d) < thr && (bestX === null || Math.abs(d) < Math.abs(bestX.d))) bestX = { d: d, at: c };
      });
    });
    [0, o.h / 2, o.h].forEach(function (off) {
      ys.forEach(function (c) {
        var d = c - (ny + off);
        if (Math.abs(d) < thr && (bestY === null || Math.abs(d) < Math.abs(bestY.d))) bestY = { d: d, at: c };
      });
    });
    if (bestX) { nx += bestX.d; guides.push({ dir: 'v', at: bestX.at }); }
    if (bestY) { ny += bestY.d; guides.push({ dir: 'h', at: bestY.at }); }
    return { x: nx, y: ny, guides: guides };
  }

  function liveApply(o) {
    var n = objMap[o.id];
    if (!n) return;
    if (o.type === 'shape' || n.querySelector('svg')) {
      // shapes depend on size; re-render this single object
      var nn = HolstPlayer.renderObject(o, { edit: true, project: project });
      n.replaceWith(nn);
      objMap[o.id] = nn;
      return;
    }
    n.style.left = o.x + 'px'; n.style.top = o.y + 'px';
    n.style.width = o.w + 'px'; n.style.height = o.h + 'px';
    n.style.transform = o.rot ? 'rotate(' + o.rot + 'deg)' : '';
  }

  function onPointerDown(e) {
    if (e.button === 2) return;
    var handle = e.target.closest && e.target.closest('.h');
    var o = sel();
    if (handle && o) {
      e.preventDefault();
      wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
      var p = toStage(e.clientX, e.clientY);
      session = { kind: handle.dataset.h === 'rot' ? 'rot' : 'resize', h: handle.dataset.h, start: p, box: { x: o.x, y: o.y, w: o.w, h: o.h, rot: o.rot || 0 }, moved: false, id: o.id };
      return;
    }
    if (editing) {
      if (e.target.closest('.editing')) return;
      finishTextEdit();
    }
    var objEl = e.target.closest && e.target.closest('.hp-obj');
    if (objEl && holder.contains(objEl)) {
      var id = objEl.dataset.id;
      var now = Date.now();
      var dbl = lastTap.id === id && now - lastTap.t < 380;
      lastTap = { id: id, t: now };
      select(id);
      if (dbl) { e.preventDefault(); startTextEdit(); return; }
      var ob = sel();
      wrap.setPointerCapture && wrap.setPointerCapture(e.pointerId);
      session = { kind: 'move', start: toStage(e.clientX, e.clientY), box: { x: ob.x, y: ob.y }, moved: false, id: id };
      e.preventDefault();
    } else {
      lastTap = { id: null, t: 0 };
      select(null);
    }
  }

  function onPointerMove(e) {
    if (!session) return;
    var o = sel();
    if (!o || o.id !== session.id) { session = null; return; }
    var p = toStage(e.clientX, e.clientY);
    var dx = p.x - session.start.x, dy = p.y - session.start.y;
    if (!session.moved) {
      if (Math.abs(dx) * scale < 3 && Math.abs(dy) * scale < 3 && session.kind === 'move') return;
      session.moved = true;
      record(null);
      overlay.innerHTML = '';
    }
    var guides = [];
    if (session.kind === 'move') {
      var sn = e.altKey ? { x: session.box.x + dx, y: session.box.y + dy, guides: [] } : snapMove(o, session.box.x + dx, session.box.y + dy);
      o.x = round(sn.x); o.y = round(sn.y); guides = sn.guides;
    } else if (session.kind === 'resize') {
      var b = session.box, h = session.h, nx = b.x, ny = b.y, nw = b.w, nh = b.h;
      if (h.indexOf('e') >= 0) nw = b.w + dx;
      if (h.indexOf('s') >= 0) nh = b.h + dy;
      if (h.indexOf('w') >= 0) { nw = b.w - dx; nx = b.x + dx; }
      if (h.indexOf('n') >= 0) { nh = b.h - dy; ny = b.y + dy; }
      var keep = (e.shiftKey || o.type === 'image' || o.type === 'hotspot') && h.length === 2;
      if (keep) {
        var k = Math.max(nw / b.w, nh / b.h);
        nw = b.w * k; nh = b.h * k;
        if (h.indexOf('w') >= 0) nx = b.x + b.w - nw;
        if (h.indexOf('n') >= 0) ny = b.y + b.h - nh;
      }
      var min = 16;
      if (nw < min) { if (h.indexOf('w') >= 0) nx -= (min - nw); nw = min; }
      if (nh < min) { if (h.indexOf('n') >= 0) ny -= (min - nh); nh = min; }
      o.x = round(nx); o.y = round(ny); o.w = round(nw); o.h = round(nh);
    } else if (session.kind === 'rot') {
      var cx = session.box.x + session.box.w / 2, cy = session.box.y + session.box.h / 2;
      var ang = Math.atan2(p.y - cy, p.x - cx) * 180 / Math.PI + 90;
      ang = ((ang % 360) + 360) % 360;
      if (ang > 180) ang -= 360;
      var snapTo = Math.round(ang / 15) * 15;
      if (e.shiftKey || Math.abs(ang - snapTo) < 4) ang = snapTo;
      o.rot = round(ang);
    }
    liveApply(o);
    renderOverlay(guides);
  }

  function onPointerUp() {
    if (!session) return;
    var moved = session.moved;
    session = null;
    if (moved) {
      lastKey = null;
      renderStage();
      renderOverlay();
      renderProps();
      scheduleThumb();
      scheduleSave();
      updateUndo();
    } else {
      renderOverlay();
    }
  }

  /* ---------------- inline text editing ---------------- */
  function textTarget(o, node) {
    if (o.type === 'text') return node.querySelector('.hp-tx');
    if (o.type === 'button') return node.querySelector('.hp-btn');
    if (o.type === 'shape') {
      var tnode = node.querySelector('.hp-text');
      if (!tnode) {
        // create an empty label to type into
        o.text = ' ';
        renderStage();
        node = objMap[o.id];
        tnode = node.querySelector('.hp-text');
        o.text = '';
        if (tnode) tnode.textContent = '';
      }
      return tnode;
    }
    return null;
  }

  function startTextEdit() {
    var o = sel();
    if (!o) return;
    if (o.type === 'quiz' || o.type === 'hotspot') { propTab = o.type === 'quiz' ? 'action' : 'action'; renderProps(); openSheet('props'); return; }
    if (o.type === 'image') return;
    var node = objMap[o.id];
    var tn = node && textTarget(o, node);
    node = objMap[o.id];
    if (!tn) return;
    editing = { id: o.id, node: node, tn: tn, before: o.text };
    node.classList.add('editing');
    try { tn.contentEditable = 'plaintext-only'; } catch (er) { tn.contentEditable = 'true'; }
    if (tn.contentEditable !== 'plaintext-only') tn.contentEditable = 'true';
    tn.style.pointerEvents = 'auto';
    tn.focus();
    var r = document.createRange();
    r.selectNodeContents(tn);
    var s = window.getSelection();
    s.removeAllRanges(); s.addRange(r);
    tn.addEventListener('blur', finishTextEdit, { once: true });
    tn.addEventListener('keydown', function (ev) {
      ev.stopPropagation();
      if (ev.key === 'Escape') { ev.preventDefault(); tn.blur(); }
    });
    renderOverlay();
  }

  function finishTextEdit() {
    if (!editing) return;
    var ed = editing;
    editing = null;
    var val = ed.tn.innerText.replace(/ /g, ' ').replace(/\n$/, '');
    var o = null;
    slide().objects.forEach(function (x) { if (x.id === ed.id) o = x; });
    if (o && val !== ed.before) {
      change('text-' + o.id, function () { o.text = val; });
    } else {
      renderStage(); renderOverlay();
    }
  }

  /* ---------------- object operations ---------------- */
  function addObject(o) {
    change('add', function () {
      // cascade if same spot is taken
      var tries = 0;
      while (tries < 8 && slide().objects.some(function (b) { return b.x === o.x && b.y === o.y; })) { o.x += 24; o.y += 24; tries++; }
      slide().objects.push(o);
      selId = o.id;
      propTab = o.type === 'quiz' ? 'action' : 'style';
      lastKey = null;
    });
    closeSheets();
  }

  function addByKind(kind) {
    var M = Model.Make, o;
    switch (kind) {
      case 'heading': o = M.heading(t('headingText'), { x: 140, y: 100, w: 1000, h: 110 }); break;
      case 'paragraph': o = M.text({ text: t('paragraphText'), x: 140, y: 260, w: 800, h: 120, style: { color: '#374151', fontSize: 30 } }); break;
      case 'button': o = M.button(t('buttonText')); break;
      case 'hotspot': o = M.hotspot(t('hotspotTitle'), t('hotspotText')); break;
      case 'quiz':
        o = M.quiz({ question: t('questionText'), options: [t('option') + ' 1', t('option') + ' 2', t('option') + ' 3', t('option') + ' 4'], correct: 0, ok: t('okText'), bad: t('badText') });
        break;
      case 'image':
        Files.pick($('fileImage')).then(function (f) { if (f) addImageFile(f); });
        return;
    }
    if (o) addObject(o);
  }

  function addImageFile(file, at) {
    if (!file || !/^image\//.test(file.type)) return;
    Files.readImage(file).then(function (im) {
      var k = Math.min(1, 640 / im.w, 440 / im.h);
      var w = round(im.w * k), h = round(im.h * k);
      var x = at ? round(at.x - w / 2) : round((W - w) / 2), y = at ? round(at.y - h / 2) : round((H - h) / 2);
      addObject(Model.Make.image(im.src, { x: x, y: y, w: w, h: h, alt: file.name.replace(/\.[^.]+$/, '') }));
    }).catch(function () { App.toast(t('importError')); });
  }

  function addShape(shape) {
    var o = Model.Make.shape(shape);
    if (shape === 'arrow') { o.w = 360; o.h = 180; o.y = 270; o.x = 460; }
    if (shape === 'bubble') { o.w = 380; o.h = 260; o.x = 450; o.style.fill = '#ffffff'; o.style.stroke = '#1d2129'; o.style.strokeW = 4; o.style.color = '#1d2129'; o.style.radius = 30; o.style.bold = false; }
    if (shape === 'heart' || shape === 'star') o.style.fill = shape === 'heart' ? '#ef4444' : '#f59e0b';
    addObject(o);
  }

  function deleteSel() {
    var o = sel();
    if (!o) return;
    change('del', function () {
      slide().objects = slide().objects.filter(function (b) { return b.id !== o.id; });
      selId = null; lastKey = null;
    });
  }
  function duplicateSel() {
    var o = sel();
    if (!o) return;
    var c = Model.cloneObject(o);
    c.x += 24; c.y += 24;
    addObject(c);
  }
  function arrange(dir) {
    var o = sel();
    if (!o) return;
    change('arrange', function () {
      var arr = slide().objects;
      var i = arr.indexOf(o);
      arr.splice(i, 1);
      if (dir > 0) arr.push(o); else arr.unshift(o);
      lastKey = null;
    });
  }
  function nudge(dx, dy) {
    var o = sel();
    if (!o) return;
    change('nudge', function () { o.x += dx; o.y += dy; }, { props: false });
    renderProps();
  }

  /* ---------------- slides ---------------- */
  function goSlide(i) {
    if (editing) finishTextEdit();
    slideIdx = Math.max(0, Math.min(project.slides.length - 1, i));
    selId = null;
    renderStage(); renderOverlay(); renderProps(); renderStrip();
  }
  function addSlide() {
    change('slide-add', function () {
      var cur = slide();
      var s = Model.Make.slide(cur.bg && cur.bg !== '' ? cur.bg : '#ffffff', []);
      project.slides.splice(slideIdx + 1, 0, s);
      slideIdx++; selId = null; lastKey = null;
    }, { strip: true });
    scrollStripToActive();
  }
  function duplicateSlide(i) {
    change('slide-dup', function () {
      project.slides.splice(i + 1, 0, Model.cloneSlide(project.slides[i]));
      slideIdx = i + 1; selId = null; lastKey = null;
    }, { strip: true });
    scrollStripToActive();
  }
  function deleteSlide(i) {
    if (project.slides.length <= 1) return;
    change('slide-del', function () {
      project.slides.splice(i, 1);
      if (slideIdx >= project.slides.length) slideIdx = project.slides.length - 1;
      selId = null; lastKey = null;
    }, { strip: true });
  }
  function moveSlide(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= project.slides.length) return;
    change('slide-move', function () {
      var s = project.slides.splice(i, 1)[0];
      project.slides.splice(j, 0, s);
      slideIdx = j; lastKey = null;
    }, { strip: true });
  }

  function thumbWidth() { return document.documentElement.classList.contains('board') ? 160 : 124; }

  function renderStrip() {
    strip.innerHTML = '';
    var tw = thumbWidth();
    project.slides.forEach(function (s, i) {
      var b = el('button', 'slide-th' + (i === slideIdx ? ' active' : ''), strip);
      b.title = t('slide') + ' ' + (i + 1);
      el('span', 'snum', b, String(i + 1));
      var box = el('div', 'box', b);
      box.appendChild(HolstPlayer.thumbnail(s, project, tw));
      b.addEventListener('click', function () { if (i !== slideIdx) goSlide(i); });
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); goSlide(i); slideMenu(i, e.clientX, e.clientY); });
      if (i === slideIdx) {
        var tools = el('div', 'slide-tools', strip);
        [['copy', 'duplicateSlide', function () { duplicateSlide(i); }],
          ['trash', 'deleteSlide', function () { deleteSlide(i); }]].forEach(function (d) {
          var tb = el('button', 'btn ghost icon-only small', tools);
          tb.innerHTML = Icons.svg(d[0], 16);
          tb.title = t(d[1]); tb.setAttribute('aria-label', t(d[1]));
          if (d[0] === 'trash' && project.slides.length <= 1) tb.disabled = true;
          tb.onclick = d[2];
        });
      }
    });
    var add = el('button', 'add-slide', strip);
    add.innerHTML = Icons.svg('plus', 18) + '<span>' + t('addSlide') + '</span>';
    add.onclick = addSlide;
  }
  function scrollStripToActive() {
    var a = strip.querySelector('.slide-th.active');
    if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function scheduleThumb() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(function () {
      var a = strip.querySelector('.slide-th.active .box');
      if (!a) return renderStrip();
      a.innerHTML = '';
      a.appendChild(HolstPlayer.thumbnail(slide(), project, thumbWidth()));
    }, 250);
  }

  function slideMenu(i, x, y) {
    App.contextMenu(x, y, [
      { icon: 'plus', label: t('addSlide'), fn: addSlide },
      { icon: 'copy', label: t('duplicateSlide'), fn: function () { duplicateSlide(i); } },
      { icon: 'left', label: t('moveLeft'), fn: function () { moveSlide(i, -1); }, disabled: i === 0 },
      { icon: 'right', label: t('moveRight'), fn: function () { moveSlide(i, 1); }, disabled: i === project.slides.length - 1 },
      { icon: 'trash', label: t('deleteSlide'), fn: function () { deleteSlide(i); }, disabled: project.slides.length <= 1, danger: true }
    ]);
  }

  /* ---------------- properties panel ---------------- */
  var UI = {
    sec: function (parent, title) {
      var s = el('div', 'prop-sec', parent);
      if (title) el('h4', '', s, title);
      return s;
    },
    row: function (parent, label) {
      var r = el('div', 'row', parent);
      if (label != null) el('label', '', r, label);
      return el('div', 'ctl', r);
    },
    colors: function (parent, value, onPick, opts) {
      opts = opts || {};
      var g = el('div', 'swatches' + (opts.bg ? ' bg-swatches' : ''), parent);
      var list = opts.list || Model.COLORS;
      if (opts.none) {
        var n = el('button', 'sw none' + (!value || value === 'none' ? ' on' : ''), g);
        n.title = '—'; n.onclick = function () { onPick('none'); };
      }
      list.forEach(function (c) {
        var b = el('button', 'sw' + (c === value ? ' on' : ''), g);
        b.style.background = c;
        b.title = c;
        b.onclick = function () { onPick(c); };
      });
      var cu = el('label', 'sw custom', g);
      cu.title = t('pickColor');
      var inp = el('input', '', cu);
      inp.type = 'color';
      inp.value = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#5b5bf7';
      inp.oninput = function () { onPick(inp.value, true); };
      return g;
    },
    slider: function (parent, value, min, max, step, onSet) {
      var r = el('input', '', parent);
      r.type = 'range'; r.min = min; r.max = max; r.step = step || 1; r.value = value;
      var n = el('input', 'inp num', parent);
      n.type = 'number'; n.min = min; n.max = max; n.step = step || 1; n.value = value;
      r.oninput = function () { n.value = r.value; onSet(Number(r.value)); };
      n.onchange = function () { var v = Math.max(min, Math.min(max, Number(n.value) || 0)); r.value = v; onSet(v); };
      return r;
    },
    seg: function (parent, items, value, onSet) {
      var g = el('div', 'segm', parent);
      items.forEach(function (it) {
        var b = el('button', it[0] === value ? 'on' : '', g);
        if (it[2]) b.innerHTML = Icons.svg(it[2], 18); else b.textContent = it[1];
        b.title = it[1];
        b.onclick = function () { onSet(it[0]); };
      });
      return g;
    },
    select: function (parent, items, value, onSet) {
      var s = el('select', 'sel-inp', parent);
      items.forEach(function (it) {
        var op = el('option', '', s, it[1]);
        op.value = it[0];
        if (it[0] === value) op.selected = true;
      });
      s.onchange = function () { onSet(s.value); };
      return s;
    },
    input: function (parent, value, onSet, type) {
      var i = el(type === 'area' ? 'textarea' : 'input', 'inp', parent);
      if (type && type !== 'area') i.type = type;
      i.value = value == null ? '' : value;
      i.oninput = function () { onSet(i.value); };
      return i;
    },
    check: function (parent, label, value, onSet) {
      var l = el('label', 'chk', parent);
      var c = el('input', '', l);
      c.type = 'checkbox'; c.checked = !!value;
      el('span', '', l, label);
      c.onchange = function () { onSet(c.checked); };
      return c;
    }
  };

  // shorthand to mutate the selected object without rebuilding the panel
  function setO(key, fn, rebuild) {
    var o = sel();
    if (!o) return;
    change(key + o.id, function () { fn(o); }, { props: !!rebuild });
  }
  function setStyle(k, v, rebuild) { setO('st-' + k, function (o) { o.style = o.style || {}; o.style[k] = v; }, rebuild); }

  var FONT_ITEMS = function () {
    return [['sans', 'Sans · Inter'], ['serif', 'Serif · Georgia'], ['display', 'Display · Trebuchet'], ['mono', 'Mono'], ['hand', 'Hand · Comic']];
  };

  function renderProps() {
    if (!project) return;
    propBody.innerHTML = '';
    propTabs.innerHTML = '';
    var o = sel();
    if (!o) {
      $('propsTitle').textContent = t('slideSettings');
      propTabs.style.display = 'none';
      renderSlideProps();
      return;
    }
    $('propsTitle').textContent = t('properties');
    propTabs.style.display = '';
    var tabs = [['style', t('tabStyle')], ['anim', t('tabAnim')], ['action', o.type === 'quiz' ? t('question') : t('tabAction')]];
    tabs.forEach(function (tb) {
      var b = el('button', 'tab' + (propTab === tb[0] ? ' active' : ''), propTabs, tb[1]);
      b.onclick = function () { propTab = tb[0]; renderProps(); };
    });
    if (propTab === 'anim') renderAnimProps(o);
    else if (propTab === 'action') { if (o.type === 'quiz') renderQuizProps(o); else renderActionProps(o); }
    else renderStyleProps(o);
  }

  function renderSlideProps() {
    var s = slide();
    var sec = UI.sec(propBody, t('background'));
    UI.colors(sec, s.bg, function (c) {
      change('bg', function () { s.bg = c; }, { props: false });
      sec.querySelectorAll('.sw').forEach(function (x) { x.classList.toggle('on', x.title === c); });
    }, { bg: true, list: Model.BACKGROUNDS });
    var r = UI.row(sec, null);
    var bimg = el('button', 'btn small', r);
    bimg.innerHTML = Icons.svg('image', 16) + '<span>' + t('bgImage') + '</span>';
    bimg.onclick = function () {
      Files.pick($('fileBg')).then(function (f) {
        if (!f) return;
        Files.readImage(f, 1920).then(function (im) { change('bgimg', function () { s.bgImage = im.src; }); });
      });
    };
    if (s.bgImage) {
      var rm = el('button', 'btn small danger', r, t('removeImage'));
      rm.onclick = function () { change('bgimg', function () { delete s.bgImage; }); };
    }

    var ps = UI.sec(propBody, t('font'));
    UI.select(UI.row(ps, null), FONT_ITEMS(), project.font || 'sans', function (v) { change('font', function () { project.font = v; }, { strip: true }); });

    var nav = UI.sec(propBody, project.nav === 'buttons' ? t('button') : t('slides'));
    nav.querySelector('h4').textContent = I18N.lang === 'ru' ? 'Переход между слайдами' : 'Slide navigation';
    UI.seg(UI.row(nav, null), [['free', I18N.lang === 'ru' ? 'Свободно' : 'Free'], ['buttons', I18N.lang === 'ru' ? 'Только кнопками' : 'Buttons only']], project.nav || 'free',
      function (v) { change('nav', function () { project.nav = v; }); });
    el('p', 'hint', nav, I18N.lang === 'ru'
      ? '«Только кнопками» — для игр и квестов: зритель идёт дальше лишь через ваши кнопки и ответы.'
      : '"Buttons only" suits games and quests: viewers move on only through your buttons and answers.');
    el('p', 'hint', UI.sec(propBody), t('scoreHint'));
    var tip = UI.sec(propBody);
    el('p', 'hint', tip, t('nothingSelected'));
  }

  function positionSection(o) {
    var sec = UI.sec(propBody, t('position'));
    var r1 = UI.row(sec, 'X · Y');
    ['x', 'y'].forEach(function (k) {
      var i = UI.input(r1, o[k], function (v) { setO('pos-' + k, function (ob) { ob[k] = Number(v) || 0; }); }, 'number');
      i.classList.add('num'); i.style.flex = '1';
    });
    var r2 = UI.row(sec, I18N.lang === 'ru' ? 'Ш · В' : 'W · H');
    ['w', 'h'].forEach(function (k) {
      var i = UI.input(r2, o[k], function (v) { setO('pos-' + k, function (ob) { ob[k] = Math.max(16, Number(v) || 16); }); }, 'number');
      i.classList.add('num'); i.style.flex = '1';
    });
    UI.slider(UI.row(sec, t('rotation')), o.rot || 0, -180, 180, 1, function (v) { setO('rot', function (ob) { ob.rot = v; }); });
    var ar = UI.row(sec, t('arrange'));
    var f = el('button', 'btn small', ar); f.innerHTML = Icons.svg('up', 16) + '<span>' + t('bringFront') + '</span>'; f.onclick = function () { arrange(1); };
    var b = el('button', 'btn small icon-only', ar); b.innerHTML = Icons.svg('down', 16); b.title = t('sendBack'); b.onclick = function () { arrange(-1); };
  }

  function commonLook(o, sec) {
    UI.slider(UI.row(sec, t('opacity')), Math.round((o.style.opacity != null ? o.style.opacity : 1) * 100), 5, 100, 1, function (v) { setStyle('opacity', v / 100); });
    UI.check(UI.row(sec, ''), t('shadow'), o.style.shadow, function (v) { setStyle('shadow', v); });
  }

  function textControls(o, sec, withAlign) {
    var c = UI.sec(propBody, t('text'));
    if (o.type !== 'text') {
      UI.input(UI.row(c, null), o.text, function (v) { setO('text', function (ob) { ob.text = v; }); }, o.type === 'button' ? 'text' : 'area');
    }
    var tc = UI.row(c, t('textColor'));
    UI.colors(tc, o.style.color, function (v) { setStyle('color', v, true); });
    UI.select(UI.row(c, t('font')), [['', '—']].concat(FONT_ITEMS()), o.style.font || '', function (v) { setStyle('font', v || null); });
    UI.slider(UI.row(c, t('fontSize')), o.style.fontSize || 28, 10, 200, 1, function (v) { setStyle('fontSize', v); });
    var bi = UI.row(c, '');
    UI.check(bi, t('bold'), o.style.bold, function (v) { setStyle('bold', v); });
    UI.check(bi, t('italic'), o.style.italic, function (v) { setStyle('italic', v); });
    if (withAlign) {
      UI.seg(UI.row(c, t('align')), [['left', 'L', 'alignL'], ['center', 'C', 'alignC'], ['right', 'R', 'alignR']], o.style.align || (o.type === 'text' ? 'left' : 'center'),
        function (v) { setStyle('align', v, true); });
    }
    return c;
  }

  function renderStyleProps(o) {
    o.style = o.style || {};
    var sec;
    switch (o.type) {
      case 'text':
        textControls(o, null, true);
        sec = UI.sec(propBody, t('background'));
        UI.colors(sec, o.style.fill || 'none', function (v) { setStyle('fill', v === 'none' ? null : v, true); }, { none: true });
        UI.slider(UI.row(sec, t('radius')), o.style.radius || 0, 0, 80, 1, function (v) { setStyle('radius', v); });
        commonLook(o, sec);
        break;
      case 'shape':
        sec = UI.sec(propBody, t('fill'));
        UI.colors(sec, o.style.fill, function (v) { setStyle('fill', v === 'none' ? 'none' : v, true); }, { none: true });
        var st = UI.sec(propBody, t('stroke'));
        UI.colors(st, o.style.strokeW ? o.style.stroke : 'none', function (v) {
          setO('stroke', function (ob) { if (v === 'none') ob.style.strokeW = 0; else { ob.style.stroke = v; if (!ob.style.strokeW) ob.style.strokeW = 4; } }, true);
        }, { none: true });
        UI.slider(UI.row(st, t('strokeWidth')), o.style.strokeW || 0, 0, 30, 1, function (v) { setStyle('strokeW', v); });
        if (o.shape === 'rect' || o.shape === 'bubble') UI.slider(UI.row(st, t('radius')), o.style.radius || 0, 0, 200, 1, function (v) { setStyle('radius', v); });
        commonLook(o, st);
        textControls(o, null, true);
        break;
      case 'image':
        sec = UI.sec(propBody, t('image'));
        var rep = el('button', 'btn small', UI.row(sec, null));
        rep.innerHTML = Icons.svg('image', 16) + '<span>' + (I18N.lang === 'ru' ? 'Заменить изображение' : 'Replace image') + '</span>';
        rep.onclick = function () {
          Files.pick($('fileImage')).then(function (f) {
            if (!f) return;
            Files.readImage(f).then(function (im) { setO('src', function (ob) { ob.src = im.src; }, true); });
          });
        };
        UI.seg(UI.row(sec, I18N.lang === 'ru' ? 'Вписать' : 'Fit'), [['cover', I18N.lang === 'ru' ? 'Заполнить' : 'Fill'], ['contain', I18N.lang === 'ru' ? 'Целиком' : 'Whole']], o.fit || 'cover',
          function (v) { setO('fit', function (ob) { ob.fit = v; }, true); });
        UI.slider(UI.row(sec, t('radius')), o.style.radius || 0, 0, 300, 1, function (v) { setStyle('radius', v); });
        UI.input(UI.row(sec, 'Alt'), o.alt || '', function (v) { setO('alt', function (ob) { ob.alt = v; }); });
        var bs = UI.sec(propBody, t('stroke'));
        UI.colors(bs, o.style.strokeW ? o.style.stroke : 'none', function (v) {
          setO('stroke', function (ob) { if (v === 'none') ob.style.strokeW = 0; else { ob.style.stroke = v; if (!ob.style.strokeW) ob.style.strokeW = 6; } }, true);
        }, { none: true });
        UI.slider(UI.row(bs, t('strokeWidth')), o.style.strokeW || 0, 0, 40, 1, function (v) { setStyle('strokeW', v); });
        commonLook(o, bs);
        break;
      case 'button':
        sec = UI.sec(propBody, t('fill'));
        UI.colors(sec, o.style.fill, function (v) { setStyle('fill', v, true); });
        UI.slider(UI.row(sec, t('radius')), o.style.radius != null ? o.style.radius : 14, 0, 60, 1, function (v) { setStyle('radius', v); });
        commonLook(o, sec);
        textControls(o, null, false);
        break;
      case 'hotspot':
        sec = UI.sec(propBody, t('fill'));
        UI.colors(sec, o.style.fill, function (v) { setStyle('fill', v, true); });
        UI.input(UI.row(sec, I18N.lang === 'ru' ? 'Значок' : 'Symbol'), o.text || '+', function (v) { setO('text', function (ob) { ob.text = v.slice(0, 2); }); });
        el('p', 'hint', sec, I18N.lang === 'ru' ? 'Текст окна — на вкладке «Интерактив».' : 'Pop-up text is on the Interactive tab.');
        break;
      case 'quiz':
        sec = UI.sec(propBody, t('background'));
        UI.colors(sec, o.style.fill, function (v) { setStyle('fill', v, true); });
        UI.slider(UI.row(sec, t('radius')), o.style.radius != null ? o.style.radius : 20, 0, 60, 1, function (v) { setStyle('radius', v); });
        UI.check(UI.row(sec, ''), t('shadow'), o.style.shadow, function (v) { setStyle('shadow', v); });
        var tq = UI.sec(propBody, t('text'));
        UI.colors(UI.row(tq, t('textColor')), o.style.color, function (v) { setStyle('color', v, true); });
        UI.slider(UI.row(tq, t('fontSize')), o.style.fontSize || 30, 14, 80, 1, function (v) { setStyle('fontSize', v); });
        break;
    }
    positionSection(o);
  }

  var ANIMS = ['none', 'fade', 'up', 'left', 'zoom', 'bounce', 'pulse'];
  function renderAnimProps(o) {
    o.anim = o.anim || { type: 'none', delay: 0 };
    var sec = UI.sec(propBody, t('animation'));
    var g = el('div', 'anim-grid', sec);
    ANIMS.forEach(function (a) {
      var c = el('button', 'anim-card' + ((o.anim.type || 'none') === a ? ' on' : ''), g);
      if (a !== 'none') el('span', 'demo', c);
      el('span', '', c, t('anim_' + a));
      c.onclick = function () { setO('anim', function (ob) { ob.anim.type = a; }, true); };
    });
    if (o.anim.type && o.anim.type !== 'none') {
      UI.slider(UI.row(sec, t('delay') + ', ' + t('seconds')), o.anim.delay || 0, 0, 5, 0.1, function (v) { setO('delay', function (ob) { ob.anim.delay = v; }); });
    }
    el('p', 'hint', sec, I18N.lang === 'ru' ? 'Анимация видна в режиме показа (кнопка «Показ»).' : 'Animations play in Present mode.');
  }

  function slideItems(withNone) {
    var items = [];
    if (withNone) items.push(['stay', t('stay')], ['next', t('act_next')]);
    project.slides.forEach(function (s, i) {
      var title = '';
      (s.objects || []).some(function (o) { if ((o.type === 'text' || o.type === 'shape') && o.text && o.text.trim()) { title = o.text.trim().split('\n')[0]; return true; } return false; });
      items.push([s.id, (i + 1) + '. ' + (title ? title.slice(0, 32) : t('slide'))]);
    });
    return items;
  }

  function renderActionProps(o) {
    o.action = o.action || { type: 'none' };
    var sec = UI.sec(propBody, t('onClick'));
    var acts = ['none', 'next', 'prev', 'goto', 'popup', 'link', 'restart'];
    UI.select(UI.row(sec, null), acts.map(function (a) { return [a, t('act_' + a)]; }), o.action.type || 'none', function (v) {
      setO('act', function (ob) {
        ob.action.type = v;
        if (v === 'goto' && !ob.action.target) {
          var nxt = project.slides[Math.min(project.slides.length - 1, slideIdx + 1)];
          ob.action.target = nxt.id;
        }
      }, true);
    });
    var a = o.action;
    if (a.type === 'goto') {
      UI.select(UI.row(sec, t('targetSlide')), slideItems(false), a.target, function (v) { setO('target', function (ob) { ob.action.target = v; }); });
    } else if (a.type === 'popup') {
      UI.input(UI.row(sec, t('popupTitle')), a.title || '', function (v) { setO('ptitle', function (ob) { ob.action.title = v; }); });
      var pt = UI.row(sec, t('popupText'));
      UI.input(pt, a.text || '', function (v) { setO('ptext', function (ob) { ob.action.text = v; }); }, 'area');
    } else if (a.type === 'link') {
      UI.input(UI.row(sec, t('url')), a.url || '', function (v) { setO('url', function (ob) { ob.action.url = v.trim(); }); }, 'url').placeholder = 'https://';
    }
    el('p', 'hint', sec, I18N.lang === 'ru' ? 'Проверить действие можно в режиме показа.' : 'Try the action in Present mode.');
  }

  function renderQuizProps(o) {
    var q = o.quiz;
    var sec = UI.sec(propBody, t('question'));
    UI.input(UI.row(sec, null), q.question, function (v) { setO('qq', function (ob) { ob.quiz.question = v; }); }, 'area');
    var os = UI.sec(propBody, t('options'));
    el('p', 'hint', os, t('correctHint'));
    q.options.forEach(function (txt, i) {
      var r = el('div', 'opt-row', os);
      var rb = el('button', 'radio' + (q.correct === i ? ' on' : ''), r);
      rb.innerHTML = q.correct === i ? Icons.svg('check', 14) : '';
      rb.title = t('correctHint');
      rb.onclick = function () { setO('qc', function (ob) { ob.quiz.correct = i; }, true); };
      var inp = UI.input(r, txt, function (v) { setO('qo' + i, function (ob) { ob.quiz.options[i] = v; }); });
      inp.placeholder = t('option') + ' ' + (i + 1);
      var del = el('button', 'btn ghost icon-only small', r);
      del.innerHTML = Icons.svg('x', 16);
      del.disabled = q.options.length <= 2;
      del.onclick = function () {
        setO('qdel', function (ob) {
          ob.quiz.options.splice(i, 1);
          if (ob.quiz.correct === i) ob.quiz.correct = 0; else if (ob.quiz.correct > i) ob.quiz.correct--;
        }, true);
      };
    });
    if (q.options.length < 6) {
      var add = el('button', 'btn small', os);
      add.innerHTML = Icons.svg('plus', 16) + '<span>' + t('addOption') + '</span>';
      add.onclick = function () { setO('qadd', function (ob) { ob.quiz.options.push(t('option') + ' ' + (ob.quiz.options.length + 1)); }, true); };
    }
    var fs = UI.sec(propBody, I18N.lang === 'ru' ? 'Ответ' : 'Feedback');
    UI.input(UI.row(fs, t('feedbackOk')), q.ok || '', function (v) { setO('qok', function (ob) { ob.quiz.ok = v; }); });
    UI.input(UI.row(fs, t('feedbackBad')), q.bad || '', function (v) { setO('qbad', function (ob) { ob.quiz.bad = v; }); });
    UI.slider(UI.row(fs, t('points')), q.points != null ? q.points : 1, 0, 10, 1, function (v) { setO('qpts', function (ob) { ob.quiz.points = v; }); });
    UI.select(UI.row(fs, t('afterAnswer')), slideItems(true), q.after || 'stay', function (v) { setO('qafter', function (ob) { ob.quiz.after = v; }); });
    el('p', 'hint', fs, t('scoreHint'));
  }

  /* ---------------- sheets (phones) ---------------- */
  function openSheet(which) {
    if (window.innerWidth > 860) return;
    closeSheets();
    $(which === 'add' ? 'panelAdd' : 'panelProps').classList.add('open');
    $('sheetBackdrop').hidden = false;
  }
  function closeSheets() {
    $('panelAdd').classList.remove('open');
    $('panelProps').classList.remove('open');
    $('sheetBackdrop').hidden = true;
  }

  /* ---------------- keyboard ---------------- */
  function onKey(e) {
    if (!project || $('editor').hidden || !$('present').hidden) return;
    if (editing) return;
    var tag = e.target && e.target.tagName;
    var inField = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    var mod = e.ctrlKey || e.metaKey;
    var k = e.key.toLowerCase();
    if (mod && k === 'z' && !inField) { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
    if (mod && k === 'y' && !inField) { e.preventDefault(); redo(); return; }
    if (inField) return;
    if (e.key === 'F5' || (mod && e.key === 'Enter')) { e.preventDefault(); App.present(project, slideIdx); return; }
    var o = sel();
    if (mod && k === 'd' && o) { e.preventDefault(); duplicateSel(); return; }
    if (mod && k === 'c' && o) { clip = JSON.stringify(o); return; }
    if (mod && k === 'x' && o) { clip = JSON.stringify(o); deleteSel(); return; }
    if (mod && k === 'v' && clip) {
      e.preventDefault();
      var c = Model.cloneObject(JSON.parse(clip)); c.x += 24; c.y += 24; clip = JSON.stringify(c); addObject(c); return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && o) { e.preventDefault(); deleteSel(); return; }
    if (e.key === 'Escape') { select(null); return; }
    if (e.key === 'Enter' && o) { e.preventDefault(); startTextEdit(); return; }
    var step = e.shiftKey ? 10 : 1;
    if (o && e.key.indexOf('Arrow') === 0) {
      e.preventDefault();
      nudge(e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0, e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0);
      return;
    }
    if (!o && (e.key === 'PageDown' || e.key === 'ArrowDown' || e.key === 'ArrowRight')) { e.preventDefault(); goSlide(slideIdx + 1); }
    if (!o && (e.key === 'PageUp' || e.key === 'ArrowUp' || e.key === 'ArrowLeft')) { e.preventDefault(); goSlide(slideIdx - 1); }
  }

  /* ---------------- setup ---------------- */
  function buildShapeGrid() {
    var g = $('shapeGrid');
    g.innerHTML = '';
    ['rect', 'ellipse', 'triangle', 'diamond', 'star', 'hexagon', 'arrow', 'heart', 'bubble'].forEach(function (s) {
      var b = el('button', 'shape-btn', g);
      var w = 40, h = s === 'arrow' ? 24 : 40;
      b.innerHTML = '<svg viewBox="-2 -2 ' + (w + 4) + ' ' + (h + 4) + '"><path d="' + HolstPlayer.shapePath(s, w, h, 8) + '" fill="var(--accent)" fill-opacity=".85"/></svg>';
      b.title = s;
      b.onclick = function () { addShape(s); };
    });
  }

  function renderAll() {
    renderStage();
    fit();
    renderOverlay();
    renderProps();
    renderStrip();
    updateUndo();
  }

  var inited = false;
  function init() {
    if (inited) return;
    inited = true;
    wrap = $('canvasWrap'); holder = $('stageHolder'); overlay = $('overlay');
    strip = $('slidesStrip'); propBody = $('propBody'); propTabs = $('propTabs');

    wrap.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    wrap.addEventListener('dblclick', function (e) {
      if (e.target.closest('.hp-obj') && !editing) startTextEdit();
    });
    wrap.addEventListener('contextmenu', function (e) {
      var objEl = e.target.closest('.hp-obj');
      e.preventDefault();
      if (!objEl) return;
      select(objEl.dataset.id);
      App.contextMenu(e.clientX, e.clientY, [
        { icon: 'edit', label: I18N.lang === 'ru' ? 'Изменить текст' : 'Edit text', fn: startTextEdit },
        { icon: 'copy', label: t('duplicateObj'), fn: duplicateSel },
        { icon: 'up', label: t('bringFront'), fn: function () { arrange(1); } },
        { icon: 'down', label: t('sendBack'), fn: function () { arrange(-1); } },
        { icon: 'trash', label: t('deleteObj'), fn: deleteSel, danger: true }
      ]);
    });
    // drop images
    wrap.addEventListener('dragover', function (e) { e.preventDefault(); });
    wrap.addEventListener('drop', function (e) {
      e.preventDefault();
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) addImageFile(f, toStage(e.clientX, e.clientY));
    });
    // paste images
    document.addEventListener('paste', function (e) {
      if (!project || $('editor').hidden || editing) return;
      if (/INPUT|TEXTAREA/.test(document.activeElement && document.activeElement.tagName)) return;
      var items = (e.clipboardData && e.clipboardData.items) || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image/') === 0) { addImageFile(items[i].getAsFile()); e.preventDefault(); return; }
      }
    });

    document.addEventListener('keydown', onKey);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(wrap);
    window.addEventListener('resize', fit);

    document.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () { addByKind(b.dataset.add); });
    });
    buildShapeGrid();

    $('btnUndo').onclick = undo;
    $('btnRedo').onclick = redo;
    $('btnPresent').onclick = function () { App.present(project, slideIdx); };
    $('btnHome').onclick = function () { App.goHome(); };
    $('btnToggleAdd').onclick = function () { openSheet('add'); };
    $('btnToggleProps').onclick = function () { openSheet('props'); };
    $('sheetBackdrop').onclick = closeSheets;
    document.querySelectorAll('.close-sheet').forEach(function (b) { b.onclick = closeSheets; });
    var nm = $('projName');
    nm.addEventListener('input', function () { record('name'); project.name = nm.value; scheduleSave(); updateUndo(); });
    nm.addEventListener('blur', function () { if (!nm.value.trim()) { nm.value = t('untitled'); project.name = nm.value; scheduleSave(); } });
    nm.addEventListener('keydown', function (e) { if (e.key === 'Enter') nm.blur(); });

    var exBtn = $('btnExport'), exMenu = $('exportMenu');
    exBtn.onclick = function (e) { e.stopPropagation(); exMenu.hidden = !exMenu.hidden; };
    document.addEventListener('pointerdown', function (e) { if (!exMenu.hidden && !e.target.closest('.menu-wrap')) exMenu.hidden = true; });
    if (!Files.canPrint) $('exportPdfBtn').hidden = true;
    exMenu.querySelectorAll('[data-export]').forEach(function (b) {
      b.onclick = function () {
        exMenu.hidden = true;
        saveNow();
        var kind = b.dataset.export, pr;
        if (kind === 'html') pr = Files.exportHtml(project, App.playerStrings());
        else if (kind === 'holst') pr = Files.exportHolst(project);
        else { Files.printProject(project); return; }
        pr.then(function () { App.toast(t('exported')); })
          .catch(function () { App.toast('⚠ ' + t('importError')); });
      };
    });
    I18N.onChange(function () { $('saveState').textContent = ''; if (project && !$('editor').hidden) { renderProps(); renderStrip(); renderOverlay(); } });
  }

  window.Editor = {
    init: init,
    open: function (p, startSlide) {
      init();
      project = p;
      slideIdx = startSlide || 0; selId = null;
      history = []; future = []; lastKey = null;
      propTab = 'style';
      $('projName').value = p.name;
      $('saveState').textContent = '';
      requestAnimationFrame(renderAll);
    },
    close: function () {
      if (editing) finishTextEdit();
      var pr = saveNow();
      closeSheets();
      project = null;
      holder.innerHTML = ''; overlay.innerHTML = ''; strip.innerHTML = '';
      return pr;
    },
    refit: function () { fit(); },
    get project() { return project; },
    get slideIndex() { return slideIdx; },
    rerender: function () { if (project) renderAll(); }
  };
})();
