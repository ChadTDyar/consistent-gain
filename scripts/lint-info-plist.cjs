#!/usr/bin/env node
/**
 * Lints ios/App/App/Info.plist against the Capacitor plugins declared in
 * package.json. Fails CI if a plugin is installed that references a
 * privacy-sensitive API but the matching purpose string key is missing or empty.
 *
 * This prevents App Store Connect ITMS-90683 rejections from reaching review.
 *
 * To add a new rule: append to PLUGIN_REQUIREMENTS below.
 */

const fs = require('fs');
const path = require('path');

// Plugin → list of Info.plist keys required when the plugin is present.
// Sources:
// - https://capacitorjs.com/docs/apis/camera#ios
// - https://capacitorjs.com/docs/apis/geolocation#ios
// - https://developer.apple.com/documentation/bundleresources/information_property_list
const PLUGIN_REQUIREMENTS = {
  '@capacitor/camera': [
    'NSCameraUsageDescription',
    'NSPhotoLibraryUsageDescription',
    'NSPhotoLibraryAddUsageDescription',
  ],
  '@capacitor/geolocation': [
    'NSLocationWhenInUseUsageDescription',
  ],
  '@capacitor-community/barcode-scanner': [
    'NSCameraUsageDescription',
  ],
  '@capacitor/push-notifications': [
    // Push itself needs no purpose string, but aps-environment entitlement
    // is handled in the Xcode project, not Info.plist. Listed here for docs.
  ],
  '@capacitor-community/speech-recognition': [
    'NSSpeechRecognitionUsageDescription',
    'NSMicrophoneUsageDescription',
  ],
  '@capacitor/contacts': [
    'NSContactsUsageDescription',
  ],
  '@capacitor/motion': [
    'NSMotionUsageDescription',
  ],
};

const INFO_PLIST = path.join('ios', 'App', 'App', 'Info.plist');
const PACKAGE_JSON = 'package.json';

if (!fs.existsSync(PACKAGE_JSON)) {
  console.log('[info-plist-lint] No package.json found — skipping.');
  process.exit(0);
}

if (!fs.existsSync(INFO_PLIST)) {
  console.log(`[info-plist-lint] No ${INFO_PLIST} found — skipping (app is web-only).`);
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
const deps = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
};

const infoPlist = fs.readFileSync(INFO_PLIST, 'utf8');

const required = new Set();
const triggeredBy = {};
for (const [plugin, keys] of Object.entries(PLUGIN_REQUIREMENTS)) {
  if (deps[plugin]) {
    for (const k of keys) {
      required.add(k);
      (triggeredBy[k] = triggeredBy[k] || []).push(plugin);
    }
  }
}

if (required.size === 0) {
  console.log('[info-plist-lint] No privacy-sensitive Capacitor plugins detected.');
  process.exit(0);
}

const missing = [];
const empty = [];

for (const key of required) {
  // Match <key>NAME</key>...<string>VALUE</string>, tolerating whitespace.
  const keyRegex = new RegExp(
    `<key>\\s*${key}\\s*</key>\\s*<string>([\\s\\S]*?)</string>`,
    'm'
  );
  const match = infoPlist.match(keyRegex);
  if (!match) {
    missing.push(key);
  } else if (!match[1].trim()) {
    empty.push(key);
  }
}

if (missing.length === 0 && empty.length === 0) {
  console.log('[info-plist-lint] OK — all required purpose strings present.');
  console.log(`  Checked: ${[...required].join(', ')}`);
  process.exit(0);
}

console.error('\n[info-plist-lint] FAIL — Info.plist is missing required purpose strings.');
console.error('App Store Connect will reject uploads with ITMS-90683 until these are added.\n');

if (missing.length) {
  console.error('Missing keys:');
  for (const k of missing) {
    console.error(`  - ${k}  (required by: ${triggeredBy[k].join(', ')})`);
  }
}
if (empty.length) {
  console.error('\nKeys present but empty:');
  for (const k of empty) {
    console.error(`  - ${k}  (required by: ${triggeredBy[k].join(', ')})`);
  }
}

console.error(`\nAdd entries to ${INFO_PLIST} like:\n`);
console.error('    <key>NSCameraUsageDescription</key>');
console.error('    <string>Explain here why the app needs camera access.</string>\n');

process.exit(1);
