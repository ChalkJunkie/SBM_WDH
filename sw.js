// Service Worker der Offline-Web-App (erzeugt von werkzeuge/veroeffentlichen.py)
// Speichert beim ersten Öffnen alle Spieldateien auf dem Gerät. Danach
// kommen sie aus dem Speicher, auch ohne Internet. Bei einer neuen
// Version (anderer Cache-Name) werden alle Dateien neu geladen.
var CACHE = "seifenblasen-2026-11-07a";
var DATEIEN = [
  "./",
  "assets/9V-Batterie.png",
  "assets/Arduino.png",
  "assets/Breadboard_with_pushbutton.svg",
  "assets/DC-Motor.png",
  "assets/Motortreiber-L298N.png",
  "assets/Servo.png",
  "assets/Taster.png",
  "assets/Taster_neu.png",
  "css/stil.css",
  "data/aufgaben.js",
  "data/code.js",
  "data/dokumente.js",
  "data/fehlersuche.js",
  "data/hinweise.js",
  "data/lesen.js",
  "data/pins.js",
  "data/schaltbrett.js",
  "data/vergleich.js",
  "fehlersuche.html",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "index.html",
  "js/codeanzeige.js",
  "js/fehlersuche.js",
  "js/gemeinsam.js",
  "js/kabelweg.js",
  "js/kalibrieren.js",
  "js/lesen.js",
  "js/pap.js",
  "js/pruefung.js",
  "js/schaltbrett.js",
  "js/vergleich.js",
  "js/verkabeln.js",
  "js/zoom.js",
  "js/zuordnen.js",
  "kalibrieren.html",
  "lesen.html",
  "manifest.webmanifest",
  "vergleich.html",
  "verkabeln.html",
  "zuordnen.html"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (namen) {
    return Promise.all(namen.filter(function (n) { return n.indexOf("seifenblasen-") === 0 && n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    // ?aufgabe=2 und ?v=... spielen für die gespeicherte Datei keine Rolle
    return c.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request);
    });
  }));
});
