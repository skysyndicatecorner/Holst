<p align="center"><img src="build/icon.png" width="96" alt=""></p>

<h1 align="center">Холст · Holst</h1>

<p align="center">
Бесплатный редактор интерактивных презентаций, квизов и игр с открытым кодом.<br>
Free and open-source editor of interactive presentations, quizzes and games.
</p>

<p align="center">Windows · Linux · Android (телефоны и интерактивные доски / phones and interactive whiteboards) · браузер</p>

**[Русский](#русский) · [English](#english)**

---

## Русский

### Что умеет версия 0.1

- **Пять стартовых шаблонов:** презентация, квиз, интерактивное изображение, игра-квест, чистый лист.
- **Объекты:** заголовки и текст, 9 фигур (прямоугольник, круг, треугольник, ромб, звезда, шестиугольник, стрелка, сердце, облачко), изображения, кнопки, вопросы с вариантами ответа, точки-подсказки.
- **Интерактив без кода:** при нажатии — следующий / предыдущий слайд, переход на любой слайд, всплывающее окно, ссылка, «начать заново».
- **Квизы:** правильный ответ, баллы, сообщения «верно / неверно», автопереход после ответа, итог `{score} / {total}` в любом тексте.
- **Анимации появления:** проявление, выезд, увеличение, прыжок, пульсация, с задержкой.
- **Удобный редактор:** перетаскивание, изменение размера и поворот, умные направляющие, отмена и повтор (Ctrl+Z / Ctrl+Y), копирование (Ctrl+C / Ctrl+V / Ctrl+D), вставка картинок перетаскиванием и из буфера, автосохранение.
- **Режим показа:** на весь экран, стрелки и свайпы, режим «только кнопками» для игр.
- **Экспорт:** одна веб-страница `.html` (работает офлайн в любом браузере), файл проекта `.holst`, печать / PDF.
- **Два языка интерфейса:** русский и английский, переключение в один клик.
- **Темы:** светлая, тёмная, как в системе. **Режим доски** с крупными кнопками для интерактивных досок (включается сам на больших сенсорных экранах).

### Как установить

| Система | Файл | Что сделать |
| --- | --- | --- |
| Windows 10/11 (64-bit) | `Holst-…-windows-x64.zip` | Распаковать, запустить `Holst.exe` |
| Windows (установщик) | `Holst-…-windows-x64-nsis.exe` | Запустить и следовать шагам |
| Linux (Ubuntu, Debian, Mint, Astra) | `holst_…_amd64.deb` | `sudo apt install ./holst_0.1.0_amd64.deb` |
| Linux (любой) | `Holst-…-linux-x86_64.AppImage` | `chmod +x Holst-*.AppImage`, затем запустить |
| Android 7+ (телефоны, планшеты, доски) | `Holst-…-android.apk` | Открыть файл на устройстве, разрешить установку из этого источника |

Проекты хранятся только на вашем устройстве. Чтобы перенести проект на другое устройство, используйте «Экспорт → Файл проекта (.holst)» и «Открыть файл».

### Как получить APK и установщики через GitHub (без программирования)

1. Создайте на GitHub репозиторий, например `holst`, и загрузите в него все файлы этой папки (кнопка **Add file → Upload files**; папку `.github` тоже — она запускает сборку).
2. Откройте вкладку **Actions**. Сборка запустится сама и займёт 10–15 минут.
3. Откройте завершённый запуск → внизу раздел **Artifacts**: там `Holst-Android` (APK), `Holst-Windows` (установщик и portable), `Holst-Linux` (AppImage и deb).
4. Чтобы файлы появились на странице **Releases**, создайте тег версии: **Releases → Draft a new release → тег `v0.1.0` → Publish**.

> APK из сборки подписан отладочным ключом — его можно ставить на любые устройства, но для публикации в Google Play / RuStore понадобится свой ключ подписи.

### Для разработчиков

```bash
npm install          # Electron, electron-builder, Capacitor
npm start            # запустить настольную версию
npm run web          # открыть в браузере: http://localhost:8080
npm run dist:win     # установщик Windows   → dist/
npm run dist:linux   # AppImage и .deb       → dist/
npm run android:init # создать Android-проект (один раз)
npm run android:build # собрать APK (нужен Android SDK и JDK 21)
```

Приложение — это обычные HTML, CSS и JavaScript без сборщиков в папке `app/`. Его же используют Electron (Windows, Linux) и Capacitor (Android).

```
app/            веб-приложение (общее для всех платформ)
  js/i18n.js      переводы RU/EN
  js/player.js    проигрыватель работ (встраивается в экспорт .html)
  js/model.js     модель данных и шаблоны
  js/editor.js    редактор
  js/app.js       главный экран, настройки, показ
  js/files.js     открытие, сохранение, экспорт
electron/       оболочка для Windows и Linux
scripts/        подготовка Android-проекта
resources/      иконки и заставка Android
build/          иконки для настольных версий
.github/        автоматическая сборка всех платформ
```

### Что дальше

Аддоны, переменные и правила «Когда → Если → Сделать», совместная работа, импорт PowerPoint, экспорт SCORM — см. дорожную карту в описании концепции.

---

## English

### What version 0.1 does

- **Five starters:** presentation, quiz, interactive image, quest game, blank.
- **Objects:** headings and text, 9 shapes, images, buttons, multiple-choice questions, hotspots.
- **No-code interactivity:** on click go to next / previous / any slide, show a pop-up, open a link, restart.
- **Quizzes:** correct answer, points, feedback messages, auto-advance, results with `{score} / {total}` in any text.
- **Entrance animations** with delays, **smart guides**, drag / resize / rotate, undo / redo, copy / paste, drag-and-drop and pasted images, autosave.
- **Present mode:** fullscreen, arrows and swipes, "buttons only" navigation for games.
- **Export:** single offline `.html` page, `.holst` project file, print / PDF.
- **Two UI languages** (Russian, English), light / dark themes, **board mode** with large controls for interactive whiteboards.

### Install

| System | File | How |
| --- | --- | --- |
| Windows 10/11 (64-bit) | `Holst-…-windows-x64.zip` | Unzip, run `Holst.exe` |
| Windows (installer) | `Holst-…-windows-x64-nsis.exe` | Run and follow the steps |
| Linux (Debian/Ubuntu family) | `holst_…_amd64.deb` | `sudo apt install ./holst_0.1.0_amd64.deb` |
| Linux (any) | `Holst-…-linux-x86_64.AppImage` | `chmod +x`, then run |
| Android 7+ (phones, tablets, boards) | `Holst-…-android.apk` | Open on the device, allow installing from this source |

### Build everything on GitHub

Upload this folder to a GitHub repository (including `.github`). The **Actions** tab builds Windows, Linux and Android automatically; download the results from the run's **Artifacts**. Push a tag such as `v0.1.0` to publish a release.

### Develop

See the commands in the Russian section above: `npm install`, `npm start`, `npm run dist:win`, `npm run dist:linux`, `npm run android:init`, `npm run android:build`. The app in `app/` is plain HTML/CSS/JS with no build step.

## License

Editor: [AGPL-3.0](LICENSE). Player (`app/js/player.js`, embedded in exported `.html` files): MIT — your exported works are yours to share and sell freely.

Редактор: AGPL-3.0. Проигрыватель (`app/js/player.js`, встраивается в экспортированные `.html`): MIT — свои работы вы распространяете свободно.
