/* Holst — data model, object factories and built-in templates */
(function () {
  'use strict';

  function uid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  var ACCENT = '#5b5bf7';

  var Make = {
    text: function (o) {
      return Object.assign({ id: uid(), type: 'text', x: 140, y: 120, w: 1000, h: 90, rot: 0, text: '',
        style: { color: '#1d2129', fontSize: 32, bold: false, align: 'left', font: null },
        anim: { type: 'none', delay: 0 }, action: { type: 'none' } }, o || {});
    },
    heading: function (txt, o) {
      return Make.text(Object.assign({ text: txt, h: 110, style: { color: '#1d2129', fontSize: 64, bold: true, align: 'left' } }, o || {}));
    },
    shape: function (shape, o) {
      return Object.assign({ id: uid(), type: 'shape', shape: shape || 'rect', x: 490, y: 210, w: 300, h: 300, rot: 0, text: '',
        style: { fill: ACCENT, stroke: '#1d2129', strokeW: 0, radius: shape === 'rect' ? 24 : 0, color: '#ffffff', fontSize: 28, bold: true, align: 'center' },
        anim: { type: 'none', delay: 0 }, action: { type: 'none' } }, o || {});
    },
    image: function (src, o) {
      return Object.assign({ id: uid(), type: 'image', x: 340, y: 160, w: 600, h: 400, rot: 0, src: src, fit: 'cover', alt: '',
        style: { radius: 16, stroke: '#ffffff', strokeW: 0 }, anim: { type: 'none', delay: 0 }, action: { type: 'none' } }, o || {});
    },
    button: function (txt, o) {
      return Object.assign({ id: uid(), type: 'button', x: 530, y: 560, w: 220, h: 72, rot: 0, text: txt,
        style: { fill: ACCENT, color: '#ffffff', fontSize: 26, radius: 36, shadow: true },
        anim: { type: 'none', delay: 0 }, action: { type: 'next' } }, o || {});
    },
    hotspot: function (title, text, o) {
      return Object.assign({ id: uid(), type: 'hotspot', x: 610, y: 330, w: 60, h: 60, rot: 0, text: '+',
        style: { fill: '#ef4444', color: '#ffffff' }, anim: { type: 'none', delay: 0 },
        action: { type: 'popup', title: title, text: text } }, o || {});
    },
    quiz: function (q, o) {
      return Object.assign({ id: uid(), type: 'quiz', x: 190, y: 170, w: 900, h: 380, rot: 0,
        quiz: Object.assign({ question: '', options: ['', '', '', ''], correct: 0, ok: '', bad: '', points: 1, after: 'stay' }, q || {}),
        style: { fill: '#ffffff', color: '#1d2129', fontSize: 34, radius: 24, shadow: true },
        anim: { type: 'none', delay: 0 }, action: { type: 'none' } }, o || {});
    },
    slide: function (bg, objects) {
      return { id: uid(), bg: bg || '#ffffff', objects: objects || [] };
    }
  };

  var BACKGROUNDS = [
    '#ffffff', '#f4f5f7', '#1d2129', '#0f172a', '#fff7ed', '#ecfdf5', '#eff6ff', '#fdf2f8',
    'linear-gradient(135deg,#5b5bf7 0%,#a855f7 100%)',
    'linear-gradient(135deg,#0ea5e9 0%,#22d3ee 100%)',
    'linear-gradient(135deg,#f97316 0%,#ec4899 100%)',
    'linear-gradient(135deg,#10b981 0%,#84cc16 100%)',
    'linear-gradient(160deg,#0f172a 0%,#312e81 100%)',
    'linear-gradient(160deg,#fdf2f8 0%,#e0e7ff 100%)',
    'linear-gradient(180deg,#fef3c7 0%,#fde68a 100%)',
    'radial-gradient(circle at 30% 20%,#1e293b 0%,#020617 70%)'
  ];

  var COLORS = ['#1d2129', '#ffffff', '#6b7280', '#5b5bf7', '#a855f7', '#ec4899', '#ef4444', '#f97316',
    '#f59e0b', '#eab308', '#84cc16', '#10b981', '#14b8a6', '#0ea5e9', '#3b82f6', '#78350f'];

  // L: pick a string for language
  function L(lang, en, ru) { return lang === 'ru' ? ru : en; }

  var Templates = {
    blank: function (lang) {
      return { name: L(lang, 'Untitled', 'Без названия'), slides: [Make.slide('#ffffff', [])] };
    },

    presentation: function (lang) {
      var s1 = Make.slide('linear-gradient(135deg,#5b5bf7 0%,#a855f7 100%)', [
        Make.shape('ellipse', { x: 900, y: -120, w: 520, h: 520, style: { fill: 'rgba(255,255,255,.12)', strokeW: 0 } }),
        Make.shape('ellipse', { x: -140, y: 460, w: 380, h: 380, style: { fill: 'rgba(255,255,255,.10)', strokeW: 0 } }),
        Make.text({ text: L(lang, 'PROJECT · 2026', 'ПРОЕКТ · 2026'), x: 120, y: 190, w: 700, h: 40,
          style: { color: 'rgba(255,255,255,.8)', fontSize: 22, bold: true }, anim: { type: 'fade', delay: 0 } }),
        Make.heading(L(lang, 'Presentation title', 'Название презентации'), { x: 120, y: 240, w: 1000, h: 170,
          style: { color: '#ffffff', fontSize: 80, bold: true }, anim: { type: 'up', delay: 0.15 } }),
        Make.text({ text: L(lang, 'A short subtitle that explains what this is about', 'Короткий подзаголовок о главном'), x: 120, y: 410, w: 900, h: 60,
          style: { color: 'rgba(255,255,255,.9)', fontSize: 30 }, anim: { type: 'up', delay: 0.3 } }),
        Make.button(L(lang, 'Start  →', 'Начать  →'), { x: 120, y: 520, w: 240, h: 72, style: { fill: '#ffffff', color: '#5b5bf7', fontSize: 26, radius: 36, shadow: true }, anim: { type: 'zoom', delay: 0.5 } })
      ]);
      var cards = [
        [L(lang, 'Idea', 'Идея'), L(lang, 'What problem we solve and for whom', 'Какую задачу решаем и для кого'), '#5b5bf7', '1'],
        [L(lang, 'Plan', 'План'), L(lang, 'The steps that get us to the result', 'Шаги, которые приведут к результату'), '#f97316', '2'],
        [L(lang, 'Result', 'Результат'), L(lang, 'What changes when we are done', 'Что изменится, когда закончим'), '#10b981', '3']
      ];
      var s2objs = [Make.heading(L(lang, 'Three key points', 'Три главные мысли'), { x: 100, y: 70, w: 1080, h: 100, anim: { type: 'fade', delay: 0 } })];
      cards.forEach(function (c, i) {
        var x = 100 + i * 370;
        s2objs.push(Make.shape('rect', { x: x, y: 220, w: 340, h: 380, style: { fill: '#ffffff', strokeW: 0, radius: 28, shadow: true }, anim: { type: 'up', delay: 0.15 + i * 0.15 } }));
        s2objs.push(Make.shape('ellipse', { x: x + 34, y: 254, w: 72, h: 72, text: c[3], style: { fill: c[2], strokeW: 0, color: '#fff', fontSize: 30, bold: true }, anim: { type: 'zoom', delay: 0.3 + i * 0.15 } }));
        s2objs.push(Make.text({ text: c[0], x: x + 34, y: 350, w: 280, h: 56, style: { color: '#1d2129', fontSize: 36, bold: true }, anim: { type: 'up', delay: 0.3 + i * 0.15 } }));
        s2objs.push(Make.text({ text: c[1], x: x + 34, y: 412, w: 280, h: 140, style: { color: '#4b5563', fontSize: 24 }, anim: { type: 'up', delay: 0.35 + i * 0.15 } }));
      });
      var s2 = Make.slide('#f4f5f7', s2objs);
      var s3 = Make.slide('#ffffff', [
        Make.heading(L(lang, 'Explore the details', 'Подробности'), { x: 100, y: 80, w: 560, h: 100 }),
        Make.text({ text: L(lang, 'Click the red points on the picture to learn more.\n\nAdd your own image: Insert → Image.', 'Нажмите на красные точки на картинке, чтобы узнать больше.\n\nДобавьте своё изображение: Вставка → Изображение.'),
          x: 100, y: 200, w: 520, h: 300, style: { color: '#4b5563', fontSize: 28 } }),
        Make.shape('rect', { x: 700, y: 110, w: 480, h: 500, style: { fill: '#e0e7ff', strokeW: 0, radius: 28 } }),
        Make.shape('ellipse', { x: 820, y: 200, w: 240, h: 240, style: { fill: '#a5b4fc', strokeW: 0 } }),
        Make.shape('triangle', { x: 760, y: 360, w: 360, h: 220, style: { fill: '#5b5bf7', strokeW: 0 } }),
        Make.hotspot(L(lang, 'The sun', 'Солнце'), L(lang, 'Any object can open a pop-up with an explanation.', 'Любой объект может открывать окно с пояснением.'), { x: 910, y: 290, w: 56, h: 56 }),
        Make.hotspot(L(lang, 'The mountain', 'Гора'), L(lang, 'Change this text in the Interactive tab.', 'Измените этот текст на вкладке «Интерактив».'), { x: 1000, y: 470, w: 56, h: 56 })
      ]);
      var s4 = Make.slide('linear-gradient(160deg,#0f172a 0%,#312e81 100%)', [
        Make.heading(L(lang, 'Thank you!', 'Спасибо!'), { x: 140, y: 230, w: 1000, h: 140, style: { color: '#ffffff', fontSize: 96, bold: true, align: 'center' }, anim: { type: 'bounce', delay: 0 } }),
        Make.text({ text: L(lang, 'Questions?', 'Вопросы?'), x: 140, y: 380, w: 1000, h: 60, style: { color: 'rgba(255,255,255,.8)', fontSize: 34, align: 'center' }, anim: { type: 'fade', delay: 0.4 } }),
        Make.button(L(lang, '↺  From the start', '↺  В начало'), { x: 520, y: 500, w: 240, h: 64, style: { fill: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 22, radius: 32 }, action: { type: 'goto' }, anim: { type: 'fade', delay: 0.7 } })
      ]);
      s4.objects[2].action.target = s1.id;
      return { name: L(lang, 'My presentation', 'Моя презентация'), slides: [s1, s2, s3, s4] };
    },

    quiz: function (lang) {
      var bg = 'linear-gradient(135deg,#0ea5e9 0%,#5b5bf7 100%)';
      var start = Make.slide(bg, [
        Make.shape('star', { x: 1000, y: 70, w: 140, h: 140, rot: 12, style: { fill: '#fde047', strokeW: 0 }, anim: { type: 'pulse', delay: 0 } }),
        Make.shape('ellipse', { x: 90, y: 520, w: 120, h: 120, style: { fill: 'rgba(255,255,255,.18)', strokeW: 0 } }),
        Make.heading(L(lang, 'Space quiz', 'Квиз: космос'), { x: 140, y: 210, w: 1000, h: 130, style: { color: '#fff', fontSize: 92, bold: true, align: 'center' }, anim: { type: 'bounce', delay: 0 } }),
        Make.text({ text: L(lang, '3 questions · 1 point each', '3 вопроса · по 1 баллу'), x: 140, y: 350, w: 1000, h: 50, style: { color: 'rgba(255,255,255,.85)', fontSize: 30, align: 'center' }, anim: { type: 'fade', delay: 0.3 } }),
        Make.button(L(lang, 'Play', 'Играть'), { x: 520, y: 460, w: 240, h: 80, style: { fill: '#fde047', color: '#1d2129', fontSize: 32, radius: 40, shadow: true }, anim: { type: 'zoom', delay: 0.5 } })
      ]);
      var qs = [
        [L(lang, 'Which planet is the largest?', 'Какая планета самая большая?'), [L(lang, 'Earth', 'Земля'), L(lang, 'Jupiter', 'Юпитер'), L(lang, 'Mars', 'Марс'), L(lang, 'Venus', 'Венера')], 1],
        [L(lang, 'Who was the first person in space?', 'Кто первым полетел в космос?'), [L(lang, 'Neil Armstrong', 'Нил Армстронг'), L(lang, 'Valentina Tereshkova', 'Валентина Терешкова'), L(lang, 'Yuri Gagarin', 'Юрий Гагарин'), L(lang, 'Alexei Leonov', 'Алексей Леонов')], 2],
        [L(lang, 'What is the Sun?', 'Что такое Солнце?'), [L(lang, 'A star', 'Звезда'), L(lang, 'A planet', 'Планета'), L(lang, 'A comet', 'Комета')], 0]
      ];
      var slides = [start];
      qs.forEach(function (q, i) {
        slides.push(Make.slide('#eef2ff', [
          Make.text({ text: L(lang, 'Question ', 'Вопрос ') + (i + 1) + ' / ' + qs.length, x: 190, y: 60, w: 600, h: 50, style: { color: '#5b5bf7', fontSize: 26, bold: true } }),
          Make.quiz({ question: q[0], options: q[1], correct: q[2], ok: L(lang, 'Correct! 🎉', 'Верно! 🎉'), bad: L(lang, 'Not quite.', 'Не совсем.'), points: 1, after: 'next' },
            { x: 190, y: 120, w: 900, h: 500, anim: { type: 'up', delay: 0 } })
        ]));
      });
      var res = Make.slide(bg, [
        Make.heading(L(lang, 'Your result', 'Ваш результат'), { x: 140, y: 170, w: 1000, h: 100, style: { color: '#fff', fontSize: 64, bold: true, align: 'center' }, anim: { type: 'fade', delay: 0 } }),
        Make.text({ text: '{score} / {total}', x: 140, y: 280, w: 1000, h: 160, style: { color: '#fde047', fontSize: 130, bold: true, align: 'center' }, anim: { type: 'bounce', delay: 0.3 } }),
        Make.button(L(lang, '↺  Play again', '↺  Сыграть ещё'), { x: 500, y: 500, w: 280, h: 72, style: { fill: '#ffffff', color: '#5b5bf7', fontSize: 26, radius: 36, shadow: true }, action: { type: 'restart' }, anim: { type: 'zoom', delay: 0.7 } })
      ]);
      slides.push(res);
      return { name: L(lang, 'Space quiz', 'Квиз о космосе'), slides: slides, nav: 'buttons' };
    },

    image: function (lang) {
      var s = Make.slide('linear-gradient(180deg,#bae6fd 0%,#e0f2fe 60%,#86efac 60%,#4ade80 100%)', [
        Make.heading(L(lang, 'How a tree works', 'Как устроено дерево'), { x: 60, y: 40, w: 820, h: 80, style: { color: '#0f172a', fontSize: 52, bold: true } }),
        Make.text({ text: L(lang, 'Tap the points', 'Нажимайте на точки'), x: 60, y: 118, w: 500, h: 44, style: { color: '#334155', fontSize: 26 } }),
        Make.shape('ellipse', { x: 1040, y: 50, w: 130, h: 130, style: { fill: '#fde047', strokeW: 0 } }),
        Make.shape('rect', { x: 600, y: 330, w: 80, h: 300, style: { fill: '#92400e', strokeW: 0, radius: 12 } }),
        Make.shape('ellipse', { x: 440, y: 120, w: 400, h: 300, style: { fill: '#16a34a', strokeW: 0 } }),
        Make.shape('ellipse', { x: 500, y: 90, w: 280, h: 200, style: { fill: '#22c55e', strokeW: 0 } }),
        Make.shape('rect', { x: 540, y: 610, w: 200, h: 24, style: { fill: '#78350f', strokeW: 0, radius: 12 } }),
        Make.hotspot(L(lang, 'Crown and leaves', 'Крона и листья'), L(lang, 'Leaves turn sunlight, water and carbon dioxide into food for the tree and release oxygen.', 'Листья превращают солнечный свет, воду и углекислый газ в питание для дерева и выделяют кислород.'), { x: 620, y: 180, w: 56, h: 56 }),
        Make.hotspot(L(lang, 'Trunk', 'Ствол'), L(lang, 'The trunk carries water up from the roots and holds the crown.', 'Ствол поднимает воду от корней и держит крону.'), { x: 612, y: 450, w: 56, h: 56, style: { fill: '#f97316', color: '#fff' } }),
        Make.hotspot(L(lang, 'Roots', 'Корни'), L(lang, 'Roots anchor the tree and absorb water and minerals from the soil.', 'Корни удерживают дерево и всасывают воду и минералы из почвы.'), { x: 700, y: 596, w: 56, h: 56, style: { fill: '#5b5bf7', color: '#fff' } }),
        Make.hotspot(L(lang, 'Sunlight', 'Солнечный свет'), L(lang, 'Without sunlight, leaves cannot make food.', 'Без солнечного света листья не смогут производить питание.'), { x: 1077, y: 87, w: 56, h: 56, style: { fill: '#f59e0b', color: '#fff' } })
      ]);
      return { name: L(lang, 'Interactive image', 'Интерактивное изображение'), slides: [s] };
    },

    game: function (lang) {
      var dark = 'radial-gradient(circle at 30% 20%,#1e293b 0%,#020617 70%)';
      var s1 = Make.slide(dark, [
        Make.shape('star', { x: 160, y: 90, w: 40, h: 40, style: { fill: '#fde047', strokeW: 0 }, anim: { type: 'pulse', delay: 0 } }),
        Make.shape('star', { x: 1080, y: 150, w: 30, h: 30, style: { fill: '#fde047', strokeW: 0 }, anim: { type: 'pulse', delay: 0.6 } }),
        Make.heading(L(lang, 'The Old Castle Mystery', 'Тайна старого замка'), { x: 140, y: 220, w: 1000, h: 130, style: { color: '#fef3c7', fontSize: 76, bold: true, align: 'center', font: 'serif' }, anim: { type: 'fade', delay: 0 } }),
        Make.text({ text: L(lang, 'A short quest. Choose wisely.', 'Короткий квест. Выбирайте с умом.'), x: 140, y: 360, w: 1000, h: 50, style: { color: '#cbd5e1', fontSize: 28, align: 'center' }, anim: { type: 'fade', delay: 0.4 } }),
        Make.button(L(lang, 'Enter the castle', 'Войти в замок'), { x: 470, y: 470, w: 340, h: 76, style: { fill: '#b45309', color: '#fff', fontSize: 28, radius: 14, shadow: true }, anim: { type: 'up', delay: 0.7 } })
      ]);
      var s2 = Make.slide('#1c1917', [
        Make.text({ text: L(lang, 'Two doors stand before you. Behind one is the treasure, behind the other a trap.', 'Перед вами две двери. За одной — сокровище, за другой — ловушка.'), x: 140, y: 50, w: 1000, h: 110, style: { color: '#e7e5e4', fontSize: 32, align: 'center' } }),
        Make.shape('rect', { x: 250, y: 200, w: 260, h: 400, text: '', style: { fill: '#7c2d12', stroke: '#fbbf24', strokeW: 6, radius: 130 }, action: { type: 'goto' }, anim: { type: 'up', delay: 0.1 } }),
        Make.shape('rect', { x: 770, y: 200, w: 260, h: 400, text: '', style: { fill: '#1e3a8a', stroke: '#93c5fd', strokeW: 6, radius: 130 }, action: { type: 'goto' }, anim: { type: 'up', delay: 0.25 } }),
        Make.text({ text: L(lang, 'Red door', 'Красная дверь'), x: 230, y: 620, w: 300, h: 50, style: { color: '#fca5a5', fontSize: 28, bold: true, align: 'center' } }),
        Make.text({ text: L(lang, 'Blue door', 'Синяя дверь'), x: 750, y: 620, w: 300, h: 50, style: { color: '#93c5fd', fontSize: 28, bold: true, align: 'center' } }),
        Make.hotspot(L(lang, 'A note on the wall', 'Записка на стене'), L(lang, '"Gold loves warm colors."', '«Золото любит тёплые цвета».'), { x: 612, y: 360, w: 56, h: 56, text: '?', style: { fill: '#a16207', color: '#fff' } })
      ]);
      var win = Make.slide('linear-gradient(180deg,#fef3c7 0%,#fde68a 100%)', [
        Make.shape('star', { x: 560, y: 90, w: 160, h: 160, style: { fill: '#f59e0b', strokeW: 0, shadow: true }, anim: { type: 'bounce', delay: 0 } }),
        Make.heading(L(lang, 'Treasure found!', 'Сокровище найдено!'), { x: 140, y: 290, w: 1000, h: 110, style: { color: '#78350f', fontSize: 72, bold: true, align: 'center', font: 'serif' }, anim: { type: 'up', delay: 0.3 } }),
        Make.button(L(lang, '↺  Play again', '↺  Играть снова'), { x: 500, y: 470, w: 280, h: 72, style: { fill: '#78350f', color: '#fff', fontSize: 26, radius: 14 }, action: { type: 'restart' }, anim: { type: 'fade', delay: 0.6 } })
      ]);
      var lose = Make.slide('#450a0a', [
        Make.heading(L(lang, 'A trap!', 'Ловушка!'), { x: 140, y: 220, w: 1000, h: 120, style: { color: '#fecaca', fontSize: 88, bold: true, align: 'center', font: 'serif' }, anim: { type: 'zoom', delay: 0 } }),
        Make.text({ text: L(lang, 'The floor opens beneath your feet…', 'Пол уходит из-под ног…'), x: 140, y: 350, w: 1000, h: 50, style: { color: '#fca5a5', fontSize: 30, align: 'center' }, anim: { type: 'fade', delay: 0.3 } }),
        Make.button(L(lang, 'Try again', 'Попробовать снова'), { x: 490, y: 460, w: 300, h: 72, style: { fill: '#fecaca', color: '#450a0a', fontSize: 26, radius: 14 }, action: { type: 'goto' }, anim: { type: 'up', delay: 0.6 } })
      ]);
      s2.objects[1].action.target = win.id;
      s2.objects[2].action.target = lose.id;
      lose.objects[2].action.target = s2.id;
      return { name: L(lang, 'Quest game', 'Игра-квест'), slides: [s1, s2, win, lose], nav: 'buttons', font: 'sans' };
    }
  };

  function newProject(type, lang) {
    var tpl = (Templates[type] || Templates.blank)(lang);
    return {
      id: uid(),
      format: 'holst',
      version: 1,
      type: type,
      name: tpl.name,
      nav: tpl.nav || 'free',
      font: tpl.font || 'sans',
      accent: ACCENT,
      slides: tpl.slides,
      created: Date.now(),
      updated: Date.now()
    };
  }

  // Deep clone object with fresh ids
  function cloneObject(o) {
    var c = JSON.parse(JSON.stringify(o));
    c.id = uid();
    return c;
  }
  function cloneSlide(s) {
    var c = JSON.parse(JSON.stringify(s));
    c.id = uid();
    c.objects.forEach(function (o) { o.id = uid(); });
    return c;
  }

  window.Model = {
    uid: uid, Make: Make, Templates: Templates, newProject: newProject,
    cloneObject: cloneObject, cloneSlide: cloneSlide,
    BACKGROUNDS: BACKGROUNDS, COLORS: COLORS, ACCENT: ACCENT,
    TYPES: ['presentation', 'quiz', 'image', 'game', 'blank']
  };
})();
