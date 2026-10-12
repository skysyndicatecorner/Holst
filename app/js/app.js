/* Holst — application shell: home screen, settings, present mode */
(function () {
  'use strict';

  var VERSION = '0.1.0';
  var $ = function (id) { return document.getElementById(id); };
  var player = null;
  var TYPE_COLORS = { presentation: '#5b5bf7', quiz: '#0ea5e9', image: '#10b981', game: '#b45309', blank: '#6b7280' };

  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- theme / board mode ---------- */
  var mqDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function applyTheme() {
    var th = Settings.data.theme || 'system';
    var dark = th === 'dark' || (th === 'system' && mqDark && mqDark.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
  function autoBoard() {
    // Large touch screens (interactive whiteboards, TV panels) get board mode by default
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    return coarse && Math.min(screen.width, screen.height) >= 1000;
  }
  function applyBoard() {
    var on = Settings.data.board == null ? autoBoard() : !!Settings.data.board;
    document.documentElement.classList.toggle('board', on);
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    document.documentElement.classList.toggle('coarse', !!coarse);
  }

  /* ---------- toasts & context menu ---------- */
  function toast(msg) {
    var tEl = el('div', 'toast', $('toasts'), msg);
    setTimeout(function () { tEl.style.transition = 'opacity .3s'; tEl.style.opacity = '0'; }, 2400);
    setTimeout(function () { tEl.remove(); }, 2800);
  }

  var ctxEl = null;
  function closeCtx() { if (ctxEl) { ctxEl.remove(); ctxEl = null; } }
  function contextMenu(x, y, items) {
    closeCtx();
    ctxEl = el('div', 'menu ctx-menu', document.body);
    items.forEach(function (it) {
      var b = el('button', it.danger ? 'danger' : '', ctxEl);
      b.innerHTML = Icons.svg(it.icon, 18) + '<span></span>';
      b.lastChild.textContent = it.label;
      if (it.danger) { b.style.color = 'var(--danger)'; b.firstChild.style.color = 'var(--danger)'; }
      b.disabled = !!it.disabled;
      if (it.disabled) b.style.opacity = '.4';
      b.onclick = function () { closeCtx(); it.fn(); };
    });
    var w = 200, h = items.length * 40 + 12;
    ctxEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x)) + 'px';
    ctxEl.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, y)) + 'px';
    setTimeout(function () { document.addEventListener('pointerdown', onOutside, true); }, 0);
    function onOutside(e) {
      if (ctxEl && !ctxEl.contains(e.target)) { closeCtx(); document.removeEventListener('pointerdown', onOutside, true); }
      else if (!ctxEl) document.removeEventListener('pointerdown', onOutside, true);
    }
  }

  /* ---------- home ---------- */
  var DESC = { presentation: 'type_presentation', quiz: 'type_quiz', image: 'type_image', game: 'type_game', blank: 'type_blank' };

  function renderTypes() {
    var g = $('typeGrid');
    g.innerHTML = '';
    Model.TYPES.forEach(function (type) {
      var c = el('button', 'type-card', g);
      var th = el('div', 'thumb', c);
      var sample = Model.newProject(type, I18N.lang);
      var w = 280;
      var tn = HolstPlayer.thumbnail(sample.slides[0], sample, w);
      th.appendChild(tn);
      requestAnimationFrame(function () { scaleThumb(th, tn, w); });
      if (type === 'blank') {
        var plus = el('div', '', th);
        plus.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:' + TYPE_COLORS.blank;
        plus.innerHTML = Icons.svg('plus', 44);
      }
      var m = el('div', 'meta', c);
      el('b', '', m, t(DESC[type]));
      el('small', '', m, t(DESC[type] + '_d'));
      c.onclick = function () { createProject(type); };
    });
  }

  // make a fixed-width thumbnail fill its responsive container
  function scaleThumb(container, tn, w) {
    var cw = container.clientWidth;
    if (!cw) return;
    var inner = tn.firstChild;
    var k = cw / 1280;
    tn.style.width = cw + 'px';
    tn.style.height = Math.round(cw * 720 / 1280) + 'px';
    inner.style.transform = 'scale(' + k + ')';
  }

  function fmtDate(ts) {
    try {
      return new Intl.DateTimeFormat(I18N.lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
    } catch (e) { return new Date(ts).toLocaleString(); }
  }

  function renderProjects() {
    return Store.list().then(function (list) {
      var g = $('projGrid');
      g.innerHTML = '';
      $('projEmpty').hidden = list.length > 0;
      $('projCount').textContent = list.length ? t('projectsCount', { count: list.length }) : '';
      list.forEach(function (p) {
        var c = el('div', 'proj-card', g);
        c.tabIndex = 0;
        var th = el('div', 'thumb', c);
        if (p.slides && p.slides[0]) {
          var tn = HolstPlayer.thumbnail(p.slides[0], p, 300);
          th.appendChild(tn);
          requestAnimationFrame(function () { scaleThumb(th, tn, 300); });
        }
        var m = el('div', 'meta', c);
        var d = el('div', '', m);
        el('b', '', d, p.name || t('untitled'));
        el('small', '', d, t('slidesCount', { count: (p.slides || []).length }) + ' · ' + fmtDate(p.updated));
        var more = el('button', 'btn ghost icon-only small', m);
        more.innerHTML = Icons.svg('more', 18);
        more.title = '…';
        more.setAttribute('aria-label', '…');
        more.onclick = function (e) {
          e.stopPropagation();
          var r = more.getBoundingClientRect();
          projectMenu(p, r.left - 160, r.bottom + 4);
        };
        c.oncontextmenu = function (e) { e.preventDefault(); projectMenu(p, e.clientX, e.clientY); };
        c.onclick = function () { openProject(p.id); };
        c.onkeydown = function (e) { if (e.key === 'Enter') openProject(p.id); };
      });
    });
  }

  function projectMenu(p, x, y) {
    contextMenu(x, y, [
      { icon: 'edit', label: t('rename'), fn: function () {
        var n = window.prompt(t('rename'), p.name);
        if (n && n.trim()) { p.name = n.trim(); Store.put(p).then(renderProjects); }
      } },
      { icon: 'copy', label: t('duplicate'), fn: function () {
        var c = JSON.parse(JSON.stringify(p));
        c.id = Model.uid(); c.name = p.name + ' (2)'; c.created = Date.now();
        Store.put(c).then(renderProjects);
      } },
      { icon: 'download', label: t('exportHtml'), fn: function () { Files.exportHtml(p, playerStrings()).then(function () { toast(t('exported')); }); } },
      { icon: 'file', label: t('exportHolst'), fn: function () { Files.exportHolst(p).then(function () { toast(t('exported')); }); } },
      { icon: 'trash', label: t('delete'), danger: true, fn: function () {
        if (window.confirm(t('confirmDelete'))) Store.del(p.id).then(renderProjects);
      } }
    ]);
  }

  function createProject(type) {
    var p = Model.newProject(type, I18N.lang);
    Store.put(p).then(function () { showEditor(p); });
  }

  function openProject(id) {
    Store.get(id).then(function (p) { if (p) showEditor(p); });
  }

  function showEditor(p) {
    $('home').hidden = true;
    $('editor').hidden = false;
    Editor.open(p);
    history.pushState && history.pushState({ screen: 'editor' }, '');
  }

  function goHome() {
    var pr = $('editor').hidden ? Promise.resolve() : Editor.close();
    $('editor').hidden = true;
    $('home').hidden = false;
    return pr.then(renderProjects);
  }

  function openFile() {
    Files.pick($('fileOpen')).then(function (f) {
      if (!f) return;
      Files.readAsText(f).then(function (txt) {
        var p;
        try { p = Files.parseProject(txt); } catch (e) { toast(t('importError')); return; }
        p.id = Model.uid();
        if (!p.name) p.name = f.name.replace(/\.[^.]+$/, '');
        Store.put(p).then(function () { showEditor(p); });
      });
    });
  }

  /* ---------- present ---------- */
  function playerStrings() {
    return { close: t('close'), slideOf: t('slideOf'), prev: t('moveLeft'), next: t('moveRight') };
  }

  function present(project, start) {
    var box = $('present');
    box.hidden = false;
    if (player) player.destroy();
    player = HolstPlayer.create(box, project, {
      start: start || 0,
      strings: playerStrings(),
      onClose: closePresent,
      openLink: function (u) { window.open(u, '_blank', 'noopener'); }
    });
    if (box.requestFullscreen && !Files.isNative) box.requestFullscreen().catch(function () {});
  }
  function closePresent() {
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    if (player) { player.destroy(); player = null; }
    $('present').hidden = true;
  }
  document.addEventListener('fullscreenchange', function () {
    // leaving fullscreen with Esc keeps the show open; a second Esc closes it
  });

  /* ---------- settings ---------- */
  function openSettings() {
    var m = $('settingsModal');
    m.hidden = false;
    renderSettings();
  }
  function renderSettings() {
    var segL = $('segLang');
    segL.innerHTML = '';
    I18N.langs.forEach(function (l) {
      var b = el('button', I18N.lang === l.code ? 'on' : '', segL, l.name);
      b.onclick = function () { Settings.data.lang = l.code; Settings.save(); I18N.set(l.code); };
    });
    var segT = $('segTheme');
    segT.innerHTML = '';
    [['system', 'themeSystem'], ['light', 'themeLight'], ['dark', 'themeDark']].forEach(function (x) {
      var b = el('button', (Settings.data.theme || 'system') === x[0] ? 'on' : '', segT, t(x[1]));
      b.onclick = function () { Settings.data.theme = x[0]; Settings.save(); applyTheme(); renderSettings(); };
    });
    var cb = $('chkBoard');
    cb.checked = document.documentElement.classList.contains('board');
    cb.onchange = function () {
      Settings.data.board = cb.checked; Settings.save(); applyBoard();
      Editor.rerender();
      if (cb.checked) toast(t('boardOn'));
    };
    $('appVersion').textContent = VERSION;
  }

  /* ---------- boot ---------- */
  function retranslate() {
    I18N.apply(document);
    document.title = I18N.lang === 'ru' ? 'Холст · Holst' : 'Holst';
    if (!$('home').hidden) { renderTypes(); renderProjects(); }
    if (!$('settingsModal').hidden) renderSettings();
  }

  function boot() {
    Settings.load();
    I18N.set(Settings.data.lang || I18N.detect());
    applyTheme();
    applyBoard();
    if (mqDark && mqDark.addEventListener) mqDark.addEventListener('change', applyTheme);
    Icons.apply(document);
    I18N.onChange(retranslate);
    retranslate();

    $('btnOpenFile').onclick = openFile;
    $('btnSettings').onclick = openSettings;
    $('btnSettings2').onclick = openSettings;
    $('settingsModal').addEventListener('click', function (e) {
      if (e.target.id === 'settingsModal' || e.target.closest('[data-close]')) $('settingsModal').hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('settingsModal').hidden) $('settingsModal').hidden = true;
    });

    // Browser / Android back button
    window.addEventListener('popstate', function () {
      if (!$('present').hidden) { closePresent(); history.pushState({ screen: 'editor' }, ''); return; }
      if (!$('editor').hidden) goHome();
    });
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', function () {
        if (!$('settingsModal').hidden) { $('settingsModal').hidden = true; return; }
        if (!$('present').hidden) { closePresent(); return; }
        if (!$('editor').hidden) { goHome(); return; }
        window.Capacitor.Plugins.App.exitApp();
      });
    }
    // keep thumbnails crisp when the window resizes
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (!$('home').hidden) { renderTypes(); renderProjects(); } }, 200);
    });
    // save before closing the window
    window.addEventListener('beforeunload', function () { if (Editor.project) Store.put(Editor.project); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && Editor.project) Store.put(Editor.project); });
  }

  window.App = {
    toast: toast, contextMenu: contextMenu, present: present, goHome: goHome,
    playerStrings: playerStrings, version: VERSION
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
