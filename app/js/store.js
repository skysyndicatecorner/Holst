/* Holst — storage (IndexedDB with localStorage fallback) and settings */
(function () {
  'use strict';

  var DB_NAME = 'holst', STORE = 'projects', db = null;

  function openDB() {
    return new Promise(function (resolve) {
      if (db) return resolve(db);
      if (!window.indexedDB) return resolve(null);
      try {
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function () { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
        req.onsuccess = function () { db = req.result; resolve(db); };
        req.onerror = function () { resolve(null); };
      } catch (e) { resolve(null); }
    });
  }

  function tx(mode, fn) {
    return openDB().then(function (d) {
      if (!d) { var r = fn(null); return r ? r.result : undefined; }
      return new Promise(function (resolve, reject) {
        var t = d.transaction(STORE, mode);
        var st = t.objectStore(STORE);
        var out = fn(st);
        t.oncomplete = function () { resolve(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }

  // localStorage fallback
  var LS = 'holst.projects.';
  function lsAll() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf(LS) === 0) { try { out.push(JSON.parse(localStorage.getItem(k))); } catch (e) {} }
    }
    return out;
  }

  var Store = {
    list: function () {
      return tx('readonly', function (st) {
        if (!st) return { result: lsAll() };
        return st.getAll();
      }).then(function (arr) {
        arr = arr || [];
        arr.sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
        return arr;
      });
    },
    get: function (id) {
      return tx('readonly', function (st) {
        if (!st) { var v = localStorage.getItem(LS + id); return { result: v ? JSON.parse(v) : null }; }
        return st.get(id);
      });
    },
    put: function (p) {
      p.updated = Date.now();
      var copy = JSON.parse(JSON.stringify(p));
      return tx('readwrite', function (st) {
        if (!st) { localStorage.setItem(LS + p.id, JSON.stringify(copy)); return { result: true }; }
        st.put(copy);
        return { result: true };
      });
    },
    del: function (id) {
      return tx('readwrite', function (st) {
        if (!st) { localStorage.removeItem(LS + id); return { result: true }; }
        st.delete(id);
        return { result: true };
      });
    }
  };

  var SKEY = 'holst.settings';
  var Settings = {
    data: { lang: null, theme: 'system', board: null },
    load: function () {
      try { Object.assign(this.data, JSON.parse(localStorage.getItem(SKEY) || '{}')); } catch (e) {}
      return this.data;
    },
    save: function () {
      try { localStorage.setItem(SKEY, JSON.stringify(this.data)); } catch (e) {}
    }
  };

  window.Store = Store;
  window.Settings = Settings;
})();
