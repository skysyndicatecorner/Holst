// Prepares the generated Capacitor Android project: icons, splash, names, version, large-screen support.
// Run after `npx cap add android` (npm run android:init does both).
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

if (!fs.existsSync(res)) {
  console.error('android/ not found — run `npx cap add android` first');
  process.exit(1);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f), d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

// 1. Icons (legacy, round, adaptive)
const iconSrc = path.join(root, 'resources', 'android');
for (const d of fs.readdirSync(iconSrc)) {
  const p = path.join(iconSrc, d);
  if (fs.statSync(p).isDirectory()) copyDir(p, path.join(res, d));
}

// 2. Splash: replace every splash.png the template ships with
const splash = path.join(iconSrc, 'splash.png');
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f === 'splash.png') fs.copyFileSync(splash, p);
  }
})(res);

// 3. App name: Russian by default, English for English-language devices
function setAppName(dir, name) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'strings.xml');
  let xml = fs.existsSync(file) ? fs.readFileSync(file, 'utf8')
    : '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n</resources>\n';
  for (const key of ['app_name', 'title_activity_main']) {
    const re = new RegExp('<string name="' + key + '">[^<]*</string>');
    const line = '<string name="' + key + '">' + name + '</string>';
    xml = re.test(xml) ? xml.replace(re, line) : xml.replace('</resources>', '    ' + line + '\n</resources>');
  }
  fs.writeFileSync(file, xml);
}
setAppName(path.join(res, 'values'), 'Холст');
setAppName(path.join(res, 'values-en'), 'Holst');

// 4. Manifest: touch screen optional (boards with a mouse, TV panels), resizable windows, .holst files
const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
let man = fs.readFileSync(manifestPath, 'utf8');
if (!man.includes('android.hardware.touchscreen')) {
  man = man.replace('<application', '<uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n\n    <application');
}
if (!man.includes('android:resizeableActivity')) {
  man = man.replace('<application', '<application android:resizeableActivity="true"');
}
fs.writeFileSync(manifestPath, man);

// 5. Version
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
const code = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
gradle = gradle.replace(/versionCode \d+/, 'versionCode ' + code).replace(/versionName "[^"]*"/, 'versionName "' + pkg.version + '"');
fs.writeFileSync(gradlePath, gradle);

console.log('Android project prepared: Holst ' + pkg.version + ' (' + code + ')');
