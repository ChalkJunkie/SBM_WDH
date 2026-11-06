// =====================================================================
// js/gemeinsam.js – Hilfsfunktionen, die alle Seiten benutzen
// ---------------------------------------------------------------------
// - Speichern im localStorage (immer mit try/catch abgesichert,
//   damit das Spiel auch funktioniert, wenn Speichern verboten ist)
// - Fortschritt (gelöste Aufgaben, Sterne)
// - Texte für Hinweise und Dokumente
// - Dialogfenster
// =====================================================================

// Versionsnummer des Spiels. Steht auch hinter allen Dateinamen in den
// HTML-Dateien (?v=...), damit der Browser nach einem Update keine alten
// Dateien aus dem Zwischenspeicher mischt. Wird auf der Startseite angezeigt.
var SPIEL_VERSION = "2026-11-06h";

// Name, unter dem alles im localStorage abgelegt wird.
var SPEICHER_PRAEFIX = "seifenblasen_";

var Speicher = {
  // Liest einen Wert. Gibt "standard" zurück, wenn nichts da ist
  // oder der Browser das Lesen verbietet.
  lesen: function (schluessel, standard) {
    try {
      var roh = window.localStorage.getItem(SPEICHER_PRAEFIX + schluessel);
      if (roh === null) return standard;
      return JSON.parse(roh);
    } catch (e) {
      return standard;
    }
  },
  // Schreibt einen Wert. Fehler werden still ignoriert.
  schreiben: function (schluessel, wert) {
    try {
      window.localStorage.setItem(SPEICHER_PRAEFIX + schluessel, JSON.stringify(wert));
    } catch (e) { /* Speichern nicht möglich – Spiel läuft trotzdem */ }
  },
  // Löscht alles, was dieses Spiel gespeichert hat.
  allesLoeschen: function () {
    try {
      var weg = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(SPEICHER_PRAEFIX) === 0) weg.push(k);
      }
      weg.forEach(function (k) { window.localStorage.removeItem(k); });
    } catch (e) { /* nichts zu tun */ }
  }
};

// ---------- Fortschritt ----------
// Aufbau: { "verkabeln": { "1": true, "2": true }, "zuordnen": {...}, ... }
var Fortschritt = {
  alle: function () {
    return Speicher.lesen("fortschritt", {});
  },
  istGeloest: function (bereich, id) {
    var f = Fortschritt.alle();
    return !!(f[bereich] && f[bereich][id]);
  },
  setzeGeloest: function (bereich, id) {
    var f = Fortschritt.alle();
    if (!f[bereich]) f[bereich] = {};
    f[bereich][id] = true;
    Speicher.schreiben("fortschritt", f);
  },
  // Alle Aufgaben des Spiels: [Bereichsname, Liste der IDs]
  // (dafür müssen aufgaben.js, code.js und fehlersuche.js geladen sein)
  liste: function () {
    function ids(l) { return (l || []).map(function (a) { return a.id; }); }
    return [
      ["verkabeln", ids(DATEN.aufgaben)],
      ["zuordnen", ids(DATEN.programme)],
      ["fehlersuche4", ids(DATEN.fehlersuche)],
      ["vergleich", ids(DATEN.vergleich)]
    ];
  },
  // Sterne nur für Aufgaben, die es (noch) gibt
  anzahlSterne: function () {
    var n = 0;
    Fortschritt.liste().forEach(function (b) {
      b[1].forEach(function (id) { if (Fortschritt.istGeloest(b[0], id)) n++; });
    });
    return n;
  },
  anzahlAufgaben: function () {
    var n = 0;
    Fortschritt.liste().forEach(function (b) { n += b[1].length; });
    return n;
  },
  allesGeschafft: function () {
    var anzahl = Fortschritt.anzahlAufgaben();
    return anzahl > 0 && Fortschritt.anzahlSterne() === anzahl;
  }
};

// ---------- Glückwunsch, wenn alle Sterne gesammelt sind ----------
// Gibt true zurück, wenn der Glückwunsch gezeigt wurde (nur einmal).
function pruefeGlueckwunsch() {
  if (!Fortschritt.allesGeschafft() || Speicher.lesen("glueckwunsch_gezeigt", false)) return false;
  Speicher.schreiben("glueckwunsch_gezeigt", true);
  var n = Fortschritt.anzahlAufgaben();
  var sterne = "";
  for (var i = 0; i < Math.min(n, 30); i++) sterne += '<span style="animation-delay:' + (i * 0.06).toFixed(2) + 's">★</span>';
  var d = zeigeDialog({
    titel: "🎉 Herzlichen Glückwunsch!",
    html: '<p class="sternregen" aria-hidden="true">' + sterne + "</p>" +
      "<p><strong>Du hast alle " + n + " Aufgaben gelöst und jeden einzelnen Stern gesammelt!</strong></p>" +
      "<p>Du kannst Servo, Taster und DC-Motor richtig verkabeln, du verstehst die Programme und du findest Fehler im Code. Das ist eine richtig starke Leistung!</p>" +
      "<p>Viel Erfolg bei der Klassenarbeit und beim Bau deiner Seifenblasenmaschine!</p>",
    knoepfe: [
      { text: "Danke! 😊", haupt: true },
      { text: "Zur Übersicht", aktion: function () { location.href = "index.html"; } }
    ]
  });
  d.querySelector(".dialog").classList.add("glueckwunsch");
  return true;
}

// ---------- Texte ----------

// Wandelt Text so um, dass er sicher in HTML eingefügt werden kann.
function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// "05_2_TA_Servomotor..." -> "Tafelanschrieb: 05_2_TA_Servomotor..."
// Name des Dokuments für die Anzeige ("Schau nach: ...").
// Es wird der Kurzname aus dokumente.js angezeigt, ohne Link.
function dokumentText(name) {
  return name ? String(name) : "";
}

// Ersetzt {platzhalter} im Text durch Werte aus "werte".
function fuelleText(text, werte) {
  return String(text).replace(/\{(\w+)\}/g, function (ganz, name) {
    return werte && werte[name] !== undefined ? werte[name] : ganz;
  });
}

// Liest einen Parameter aus der Adresse, z. B. ?aufgabe=2
function adressParameter(name) {
  var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
  return m ? decodeURIComponent(m[1]) : null;
}

// ---------- Dialogfenster ----------
// zeigeDialog({ titel, html, knoepfe: [{ text, haupt, aktion }] })
// Ein Knopf ohne "aktion" schließt einfach den Dialog.
function zeigeDialog(optionen) {
  schliesseDialog();
  var hg = document.createElement("div");
  hg.className = "dialog-hintergrund";
  hg.id = "dialog";
  var html = '<div class="dialog" role="dialog" aria-modal="true">';
  if (optionen.titel) html += "<h2>" + esc(optionen.titel) + "</h2>";
  html += '<div class="dialog-inhalt">' + (optionen.html || "") + "</div>";
  html += '<div class="dialog-knoepfe"></div></div>';
  hg.innerHTML = html;
  var leiste = hg.querySelector(".dialog-knoepfe");
  var geoeffnet = Date.now();
  (optionen.knoepfe || [{ text: "OK", haupt: true }]).forEach(function (k) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "knopf" + (k.haupt ? " haupt" : "") + (k.klasse ? " " + k.klasse : "");
    b.innerHTML = k.text;
    b.addEventListener("click", function () {
      // Schutz vor "Geisterklicks": Nach dem Antippen schickt das iPad noch
      // einen Klick hinterher, der sonst sofort einen Knopf im neuen
      // Dialog auslösen würde.
      if (Date.now() - geoeffnet < 400) return;
      schliesseDialog();
      if (k.aktion) k.aktion();
    });
    leiste.appendChild(b);
  });
  document.body.appendChild(hg);
  var erster = hg.querySelector(".knopf.haupt") || hg.querySelector(".knopf");
  if (erster) erster.focus();
  return hg;
}

function schliesseDialog() {
  var alt = document.getElementById("dialog");
  if (alt) alt.parentNode.removeChild(alt);
}

// ---------- Fehler in Datendateien sichtbar machen ----------
// Wenn beim Bearbeiten von data/*.js ein Komma fehlt o. Ä., zeigt das
// Spiel oben eine rote Meldung mit Datei und Zeile an.
window.addEventListener("error", function (e) {
  var datei = (e.filename || "").split("/").pop().split("?")[0];
  var box = document.createElement("div");
  box.className = "datenfehler";
  box.textContent = "Fehler in " + (datei || "einer Datei") +
    (e.lineno ? " (Zeile " + e.lineno + ")" : "") + ": " + e.message;
  if (document.body) document.body.insertBefore(box, document.body.firstChild);
});

// ---------- Vollbild ----------
// Richtet einen Vollbild-Knopf ein. Auf Geräten ohne Vollbild-Funktion
// (z. B. iPhone) bleibt der Knopf versteckt.
function richteVollbildEin(knopf) {
  if (!knopf) return;
  var el = document.documentElement;
  var an = el.requestFullscreen || el.webkitRequestFullscreen;
  var aus = document.exitFullscreen || document.webkitExitFullscreen;
  if (!an || !aus) return;
  knopf.hidden = false;
  function istVoll() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  knopf.addEventListener("click", function () {
    try {
      if (istVoll()) aus.call(document); else an.call(el);
    } catch (e) { /* Vollbild nicht erlaubt – nichts tun */ }
  });
}
