/* Holst — files: open/save, images, export to HTML / .holst / print */
(function () {
  'use strict';

  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  function safeName(name) {
    return (String(name || 'holst').replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'holst').slice(0, 80);
  }

  function toBase64Utf8(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }

  // Save text content as a file. Android (Capacitor): Documents folder + share sheet. Elsewhere: download.
  function saveFile(filename, mime, text) {
    if (isNative && window.Capacitor.Plugins && window.Capacitor.Plugins.Filesystem) {
      var FS = window.Capacitor.Plugins.Filesystem;
      // Write to the app cache, then open the Android share sheet (save to Files, Drive, send to a messenger…)
      return FS.writeFile({ path: filename, data: toBase64Utf8(text), directory: 'CACHE', recursive: true })
        .then(function (res) {
          var Share = window.Capacitor.Plugins.Share;
          if (Share && res && res.uri) {
            return Share.share({ title: filename, files: [res.uri] })
              .catch(function () { return Share.share({ title: filename, url: res.uri }); })
              .catch(function () {})
              .then(function () { return filename; });
          }
          return filename;
        });
    }
    return new Promise(function (resolve) {
      var blob = new Blob([text], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
      resolve(filename);
    });
  }

  function readAsText(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsText(file);
    });
  }

  // Read an image file, downscale large pictures, return {src, w, h}
  function readImage(file, maxSide) {
    maxSide = maxSide || 1920;
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onerror = reject;
      r.onload = function () {
        var src = r.result;
        if (/svg|gif/.test(file.type)) {
          var im0 = new Image();
          im0.onload = function () { resolve({ src: src, w: im0.naturalWidth || 400, h: im0.naturalHeight || 300 }); };
          im0.onerror = reject;
          im0.src = src;
          return;
        }
        var img = new Image();
        img.onload = function () {
          var w = img.naturalWidth, h = img.naturalHeight;
          var k = Math.min(1, maxSide / Math.max(w, h));
          if (k >= 1 && file.size < 1.5e6) return resolve({ src: src, w: w, h: h });
          var c = document.createElement('canvas');
          c.width = Math.round(w * k); c.height = Math.round(h * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var png = file.type === 'image/png';
          resolve({ src: c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.88), w: c.width, h: c.height });
        };
        img.onerror = reject;
        img.src = src;
      };
      r.readAsDataURL(file);
    });
  }

  function pick(input) {
    return new Promise(function (resolve) {
      input.value = '';
      input.onchange = function () { resolve(input.files && input.files[0]); };
      input.click();
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  // A standalone, offline web page containing the project and the player
  function buildHtml(project, strings) {
    var data = JSON.stringify(project).replace(/</g, '\\u003c');
    var str = JSON.stringify(strings || {}).replace(/</g, '\\u003c');
    var player = holstPlayerModule.toString();
    return '<!doctype html>\n<html lang="' + (document.documentElement.lang || 'en') + '">\n<head>\n<meta charset="utf-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<meta name="generator" content="Holst (open source)">\n' +
      '<title>' + escapeHtml(project.name || 'Holst') + '</title>\n' +
      '<style>html,body{margin:0;height:100%;background:#0d0f14;overflow:hidden}#holst{position:fixed;inset:0}</style>\n' +
      '</head>\n<body>\n<div id="holst"></div>\n<script>\n' +
      player + '\n' +
      '(function(){var P=holstPlayerModule();var project=' + data + ';var strings=' + str + ';' +
      'P.create(document.getElementById("holst"),project,{strings:strings});})();\n' +
      '</script>\n</body>\n</html>\n';
  }

  function exportHtml(project, strings) {
    return saveFile(safeName(project.name) + '.html', 'text/html', buildHtml(project, strings));
  }

  function exportHolst(project) {
    var copy = JSON.parse(JSON.stringify(project));
    copy.format = 'holst';
    return saveFile(safeName(project.name) + '.holst', 'application/json', JSON.stringify(copy));
  }

  function printProject(project) {
    var area = document.getElementById('printArea');
    area.innerHTML = '';
    area.appendChild(HolstPlayer.printable(project));
    document.body.classList.add('printing');
    var done = function () { document.body.classList.remove('printing'); area.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function () { window.print(); setTimeout(done, 500); }, 60);
  }

  function parseProject(text) {
    var p = JSON.parse(text);
    if (!p || !Array.isArray(p.slides) || !p.slides.length) throw new Error('bad');
    p.slides.forEach(function (s) { if (!Array.isArray(s.objects)) s.objects = []; if (!s.id) s.id = Model.uid(); });
    return p;
  }

  window.Files = {
    isNative: isNative,
    canPrint: !isNative,
    saveFile: saveFile, readAsText: readAsText, readImage: readImage, pick: pick,
    buildHtml: buildHtml, exportHtml: exportHtml, exportHolst: exportHolst, printProject: printProject,
    parseProject: parseProject
  };
})();
