/* Holst — i18n (English / Русский) */
(function () {
  'use strict';

  var DICT = {
    en: {
      appName: 'Holst',
      tagline: 'Interactive presentations, quizzes and games — free and open source',
      create: 'Create',
      createNew: 'Create new',
      recent: 'Recent projects',
      templates: 'Templates',
      noProjects: 'No projects yet. Pick a type above to start.',
      openFile: 'Open file',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System',
      boardMode: 'Board mode (large buttons)',
      boardModeHint: 'For interactive whiteboards and touch screens',
      type_presentation: 'Presentation',
      type_presentation_d: 'Slides with animation and clickable elements',
      type_quiz: 'Quiz',
      type_quiz_d: 'Questions, points and a results screen',
      type_image: 'Interactive image',
      type_image_d: 'Hotspots with pop-up explanations',
      type_game: 'Quest game',
      type_game_d: 'Branching story with choices and endings',
      type_blank: 'Blank',
      type_blank_d: 'Start from an empty slide',
      untitled: 'Untitled',
      edited: 'Edited',
      duplicate: 'Duplicate',
      delete: 'Delete',
      rename: 'Rename',
      confirmDelete: 'Delete this project? This cannot be undone.',
      home: 'Home',
      undo: 'Undo',
      redo: 'Redo',
      preview: 'Present',
      export: 'Export',
      exportHtml: 'Web page (.html)',
      exportHtmlD: 'Opens in any browser, works offline',
      exportHolst: 'Project file (.holst)',
      exportHolstD: 'To continue editing on another device',
      exportPdf: 'Print / PDF',
      exportPdfD: 'All slides, one per page',
      saved: 'Saved',
      add: 'Add',
      text: 'Text',
      heading: 'Heading',
      paragraph: 'Paragraph',
      headingText: 'Your heading',
      paragraphText: 'Double-click to edit this text',
      shapes: 'Shapes',
      media: 'Media',
      image: 'Image',
      interactive: 'Interactive',
      button: 'Button',
      buttonText: 'Next',
      quiz: 'Question',
      hotspot: 'Hotspot',
      slides: 'Slides',
      slide: 'Slide',
      addSlide: 'Add slide',
      duplicateSlide: 'Duplicate slide',
      deleteSlide: 'Delete slide',
      moveLeft: 'Move left',
      moveRight: 'Move right',
      tabStyle: 'Style',
      tabAnim: 'Animation',
      tabAction: 'Interactive',
      slideSettings: 'Slide',
      background: 'Background',
      bgImage: 'Background image',
      removeImage: 'Remove image',
      fill: 'Fill',
      stroke: 'Border',
      strokeWidth: 'Border width',
      radius: 'Corner radius',
      opacity: 'Opacity',
      textColor: 'Text color',
      fontSize: 'Size',
      font: 'Font',
      bold: 'Bold',
      italic: 'Italic',
      align: 'Align',
      position: 'Position and size',
      rotation: 'Rotation',
      arrange: 'Arrange',
      bringFront: 'To front',
      sendBack: 'To back',
      shadow: 'Shadow',
      animation: 'Entrance',
      anim_none: 'None',
      anim_fade: 'Fade in',
      anim_up: 'Slide up',
      anim_left: 'Slide from left',
      anim_zoom: 'Zoom in',
      anim_bounce: 'Bounce',
      anim_pulse: 'Pulse (loop)',
      delay: 'Delay',
      seconds: 's',
      onClick: 'When clicked',
      act_none: 'Nothing',
      act_next: 'Go to next slide',
      act_prev: 'Go to previous slide',
      act_goto: 'Go to slide…',
      act_popup: 'Show pop-up window',
      act_link: 'Open link',
      act_restart: 'Restart from the beginning',
      targetSlide: 'Slide',
      popupTitle: 'Pop-up title',
      popupText: 'Pop-up text',
      url: 'Link (URL)',
      question: 'Question',
      questionText: 'Which planet is the largest?',
      options: 'Answers',
      correctHint: 'Tap the circle to mark the correct answer',
      addOption: 'Add answer',
      option: 'Answer',
      feedbackOk: 'Message if correct',
      feedbackBad: 'Message if wrong',
      okText: 'Correct!',
      badText: 'Not quite.',
      points: 'Points',
      afterAnswer: 'After answering',
      stay: 'Stay on slide',
      scoreHint: 'Tip: write {score} and {total} in any text to show the result.',
      close: 'Close',
      nothingSelected: 'Select an object on the slide to change it.',
      deleteObj: 'Delete',
      duplicateObj: 'Duplicate',
      zoomFit: 'Fit',
      tapToAdd: 'Tap to add',
      hotspotTitle: 'Point of interest',
      hotspotText: 'Write an explanation here.',
      langName: 'English',
      boardOn: 'Board mode on',
      importError: 'This file could not be opened.',
      exported: 'File saved',
      selectHint: 'Click an object to select it, drag to move',
      about: 'About',
      aboutText: 'Holst is free and open-source software (AGPL-3.0). Your projects are stored only on this device.',
      version: 'Version',
      pickColor: 'Color',
      done: 'Done',
      layers: 'Layers',
      emptySlide: 'Empty slide',
      properties: 'Properties',
      insert: 'Insert',
      gradient: 'Gradient',
      solid: 'Solid',
      startPresenting: 'Start',
      endOfPresentation: 'End of presentation',
      restart: 'Start over',
      slideOf: 'Slide {n} of {total}',
      projectsCount: '{count, plural, one {# project} other {# projects}}',
      slidesCount: '{count, plural, one {# slide} other {# slides}}'
    },
    ru: {
      appName: 'Холст',
      tagline: 'Интерактивные презентации, квизы и игры — бесплатно и с открытым кодом',
      create: 'Создать',
      createNew: 'Создать новую работу',
      recent: 'Недавние проекты',
      templates: 'Шаблоны',
      noProjects: 'Пока нет проектов. Выберите тип работы выше, чтобы начать.',
      openFile: 'Открыть файл',
      settings: 'Настройки',
      language: 'Язык',
      theme: 'Тема',
      themeLight: 'Светлая',
      themeDark: 'Тёмная',
      themeSystem: 'Как в системе',
      boardMode: 'Режим доски (крупные кнопки)',
      boardModeHint: 'Для интерактивных досок и сенсорных экранов',
      type_presentation: 'Презентация',
      type_presentation_d: 'Слайды с анимацией и кликабельными элементами',
      type_quiz: 'Квиз',
      type_quiz_d: 'Вопросы, баллы и экран результатов',
      type_image: 'Интерактивное изображение',
      type_image_d: 'Точки с всплывающими пояснениями',
      type_game: 'Игра-квест',
      type_game_d: 'История с выбором и разными концовками',
      type_blank: 'С чистого листа',
      type_blank_d: 'Начать с пустого слайда',
      untitled: 'Без названия',
      edited: 'Изменено',
      duplicate: 'Копировать',
      delete: 'Удалить',
      rename: 'Переименовать',
      confirmDelete: 'Удалить проект? Это действие нельзя отменить.',
      home: 'Главная',
      undo: 'Отменить',
      redo: 'Повторить',
      preview: 'Показ',
      export: 'Экспорт',
      exportHtml: 'Веб-страница (.html)',
      exportHtmlD: 'Открывается в любом браузере, работает без интернета',
      exportHolst: 'Файл проекта (.holst)',
      exportHolstD: 'Чтобы продолжить работу на другом устройстве',
      exportPdf: 'Печать / PDF',
      exportPdfD: 'Все слайды, по одному на страницу',
      saved: 'Сохранено',
      add: 'Добавить',
      text: 'Текст',
      heading: 'Заголовок',
      paragraph: 'Абзац',
      headingText: 'Ваш заголовок',
      paragraphText: 'Дважды нажмите, чтобы изменить текст',
      shapes: 'Фигуры',
      media: 'Медиа',
      image: 'Изображение',
      interactive: 'Интерактив',
      button: 'Кнопка',
      buttonText: 'Далее',
      quiz: 'Вопрос',
      hotspot: 'Точка',
      slides: 'Слайды',
      slide: 'Слайд',
      addSlide: 'Добавить слайд',
      duplicateSlide: 'Копировать слайд',
      deleteSlide: 'Удалить слайд',
      moveLeft: 'Сдвинуть влево',
      moveRight: 'Сдвинуть вправо',
      tabStyle: 'Стиль',
      tabAnim: 'Анимация',
      tabAction: 'Интерактив',
      slideSettings: 'Слайд',
      background: 'Фон',
      bgImage: 'Фоновое изображение',
      removeImage: 'Убрать изображение',
      fill: 'Заливка',
      stroke: 'Обводка',
      strokeWidth: 'Толщина обводки',
      radius: 'Скругление углов',
      opacity: 'Прозрачность',
      textColor: 'Цвет текста',
      fontSize: 'Размер',
      font: 'Шрифт',
      bold: 'Жирный',
      italic: 'Курсив',
      align: 'Выравнивание',
      position: 'Положение и размер',
      rotation: 'Поворот',
      arrange: 'Порядок',
      bringFront: 'На передний план',
      sendBack: 'На задний план',
      shadow: 'Тень',
      animation: 'Появление',
      anim_none: 'Без анимации',
      anim_fade: 'Проявление',
      anim_up: 'Выезд снизу',
      anim_left: 'Выезд слева',
      anim_zoom: 'Увеличение',
      anim_bounce: 'Прыжок',
      anim_pulse: 'Пульсация (повтор)',
      delay: 'Задержка',
      seconds: 'с',
      onClick: 'При нажатии',
      act_none: 'Ничего',
      act_next: 'Следующий слайд',
      act_prev: 'Предыдущий слайд',
      act_goto: 'Перейти на слайд…',
      act_popup: 'Показать всплывающее окно',
      act_link: 'Открыть ссылку',
      act_restart: 'Начать всё заново',
      targetSlide: 'Слайд',
      popupTitle: 'Заголовок окна',
      popupText: 'Текст окна',
      url: 'Ссылка (URL)',
      question: 'Вопрос',
      questionText: 'Какая планета самая большая?',
      options: 'Ответы',
      correctHint: 'Нажмите на кружок, чтобы отметить правильный ответ',
      addOption: 'Добавить ответ',
      option: 'Ответ',
      feedbackOk: 'Сообщение при верном ответе',
      feedbackBad: 'Сообщение при ошибке',
      okText: 'Верно!',
      badText: 'Не совсем.',
      points: 'Баллы',
      afterAnswer: 'После ответа',
      stay: 'Остаться на слайде',
      scoreHint: 'Подсказка: напишите {score} и {total} в любом тексте, чтобы показать результат.',
      close: 'Закрыть',
      nothingSelected: 'Выберите объект на слайде, чтобы изменить его.',
      deleteObj: 'Удалить',
      duplicateObj: 'Копировать',
      zoomFit: 'Вписать',
      tapToAdd: 'Нажмите, чтобы добавить',
      hotspotTitle: 'Интересное место',
      hotspotText: 'Напишите здесь пояснение.',
      langName: 'Русский',
      boardOn: 'Режим доски включён',
      importError: 'Не удалось открыть этот файл.',
      exported: 'Файл сохранён',
      selectHint: 'Нажмите на объект, чтобы выбрать, перетащите, чтобы сдвинуть',
      about: 'О программе',
      aboutText: 'Холст — свободная программа с открытым кодом (AGPL-3.0). Ваши проекты хранятся только на этом устройстве.',
      version: 'Версия',
      pickColor: 'Цвет',
      done: 'Готово',
      layers: 'Слои',
      emptySlide: 'Пустой слайд',
      properties: 'Свойства',
      insert: 'Вставка',
      gradient: 'Градиент',
      solid: 'Цвет',
      startPresenting: 'Начать',
      endOfPresentation: 'Конец показа',
      restart: 'Начать заново',
      slideOf: 'Слайд {n} из {total}',
      projectsCount: '{count, plural, one {# проект} few {# проекта} many {# проектов} other {# проекта}}',
      slidesCount: '{count, plural, one {# слайд} few {# слайда} many {# слайдов} other {# слайда}}'
    }
  };

  function pluralCategory(lang, n) {
    if (typeof Intl !== 'undefined' && Intl.PluralRules) {
      return new Intl.PluralRules(lang).select(n);
    }
    if (lang === 'ru') {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return 'one';
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
      return 'many';
    }
    return n === 1 ? 'one' : 'other';
  }

  // Minimal ICU-like formatter: {name} and {count, plural, one {...} other {...}}
  function format(str, params, lang) {
    if (!params) return str;
    str = str.replace(/\{(\w+), plural,((?:\s*\w+\s*\{[^}]*\})+)\s*\}/g, function (_, key, body) {
      var n = Number(params[key]) || 0;
      var cat = pluralCategory(lang, n);
      var forms = {};
      body.replace(/(\w+)\s*\{([^}]*)\}/g, function (__, k, v) { forms[k] = v; });
      var form = forms[cat] != null ? forms[cat] : (forms.other != null ? forms.other : '');
      return form.replace(/#/g, String(n));
    });
    return str.replace(/\{(\w+)\}/g, function (m, k) {
      return params[k] != null ? String(params[k]) : m;
    });
  }

  var current = 'en';
  var listeners = [];

  var I18N = {
    langs: [{ code: 'ru', name: 'Русский' }, { code: 'en', name: 'English' }],
    get lang() { return current; },
    detect: function () {
      var nav = (navigator.language || 'en').toLowerCase();
      return nav.indexOf('ru') === 0 || nav.indexOf('uk') === 0 || nav.indexOf('be') === 0 || nav.indexOf('kk') === 0 ? 'ru' : 'en';
    },
    set: function (lang) {
      if (!DICT[lang]) lang = 'en';
      current = lang;
      document.documentElement.lang = lang;
      listeners.forEach(function (fn) { fn(lang); });
    },
    onChange: function (fn) { listeners.push(fn); },
    t: function (key, params) {
      var d = DICT[current] || DICT.en;
      var s = d[key];
      if (s == null) s = DICT.en[key];
      if (s == null) return key;
      return format(s, params, current);
    },
    // translate all [data-i18n] nodes inside root
    apply: function (root) {
      (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = I18N.t(el.getAttribute('data-i18n'));
      });
      (root || document).querySelectorAll('[data-i18n-title]').forEach(function (el) {
        var v = I18N.t(el.getAttribute('data-i18n-title'));
        el.title = v;
        el.setAttribute('aria-label', v);
      });
      (root || document).querySelectorAll('[data-i18n-ph]').forEach(function (el) {
        el.placeholder = I18N.t(el.getAttribute('data-i18n-ph'));
      });
    }
  };

  window.I18N = I18N;
  window.t = I18N.t;
})();
