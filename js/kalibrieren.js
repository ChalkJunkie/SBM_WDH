// =====================================================================
// js/kalibrieren.js – Pin-Positionen auf den Bauteilbildern festlegen
// ---------------------------------------------------------------------
// Die Lehrkraft tippt nacheinander jeden Pin an. Am Ende wird der
// komplette Inhalt für data/pins.js erzeugt (Knopf "Kopieren").
// Die Arbeit wird zwischendurch im localStorage gesichert.
// =====================================================================
(function () {

  var SVG_NS = "http://www.w3.org/2000/svg";

  // Arbeitskopie: Werte aus data/pins.js, darüber die gespeicherte Arbeit
  // (so tauchen neue Pins aus der Datei auch nach dem Speichern auf).
  var pins = JSON.parse(JSON.stringify(DATEN.pins));
  var alteArbeit = Speicher.lesen("kalibrierung", null);
  if (alteArbeit) {
    Object.keys(pins).forEach(function (n) {
      if (!alteArbeit[n]) return;
      pins[n].pins.forEach(function (p) {
        alteArbeit[n].pins.forEach(function (q) {
          if (q.id === p.id) { p.x = q.x; p.y = q.y; p.name = q.name; }
        });
      });
    });
  }
  var bauteilNamen = Object.keys(pins);
  var bauteil = bauteilNamen[0];
  var index = 0;                 // aktueller Pin
  var gesetzt = Speicher.lesen("kalibrierung_gesetzt", {}); // "bauteil.pin" -> true

  var svg = document.getElementById("flaeche");
  var anzeige = document.getElementById("anzeige");
  var liste = document.getElementById("pinliste");
  var nameFeld = document.getElementById("pinName");
  var exportFeld = document.getElementById("export");
  var testen = document.getElementById("testen");

  var zoom = new ZoomFlaeche(svg, { beimAntippen: angetippt, minBreite: 40 });

  // ---------- Bauteilwahl ----------
  var wahl = document.getElementById("bauteilwahl");
  bauteilNamen.forEach(function (n) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "knopf";
    b.textContent = pins[n].name;
    b.addEventListener("click", function () { bauteil = n; index = 0; aufbauen(true); });
    wahl.appendChild(b);
  });

  function aktuellerPin() { return pins[bauteil].pins[index]; }

  function sichern() {
    Speicher.schreiben("kalibrierung", pins);
    Speicher.schreiben("kalibrierung_gesetzt", gesetzt);
    if (testen.checked) Speicher.schreiben("kalibrierung_test", { aktiv: true, pins: pins });
    exportFeld.value = dateiInhalt();
  }

  // ---------- Zeichnen ----------
  function aufbauen(neuZoomen) {
    Array.prototype.forEach.call(wahl.children, function (k, i) {
      k.classList.toggle("aktiv", bauteilNamen[i] === bauteil);
    });
    var b = pins[bauteil];
    svg.innerHTML = "";
    var bild = document.createElementNS(SVG_NS, "image");
    bild.setAttribute("width", b.breite);
    bild.setAttribute("height", b.hoehe);
    bild.setAttribute("href", b.bild);
    bild.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", b.bild);
    svg.appendChild(bild);
    var rahmen = document.createElementNS(SVG_NS, "rect");
    rahmen.setAttribute("width", b.breite); rahmen.setAttribute("height", b.hoehe);
    rahmen.setAttribute("fill", "none"); rahmen.setAttribute("stroke", "#888"); rahmen.setAttribute("stroke-dasharray", "4 4");
    svg.appendChild(rahmen);

    b.pins.forEach(function (p, i) {
      var c = document.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", p.x); c.setAttribute("cy", p.y);
      c.setAttribute("r", i === index ? 5 : 3.5);
      c.setAttribute("class", "kalib-punkt" + (i === index ? " aktuell" : ""));
      svg.appendChild(c);
      var t = document.createElementNS(SVG_NS, "text");
      t.setAttribute("x", p.x + 6); t.setAttribute("y", p.y - 6);
      t.setAttribute("class", "kalib-text");
      t.textContent = p.name;
      svg.appendChild(t);
    });

    if (neuZoomen) zoom.setzeInhalt(-20, -20, b.breite + 40, b.hoehe + 40);

    // Liste rechts
    liste.innerHTML = "";
    b.pins.forEach(function (p, i) {
      var li = document.createElement("li");
      var k = document.createElement("button");
      k.type = "button";
      k.className = "knopf" + (i === index ? " aktuell" : "") + (gesetzt[bauteil + "." + p.id] ? " gesetzt" : "");
      k.textContent = (i + 1) + ". " + p.name + (p.belegbar === false ? " (nicht belegbar)" : "");
      k.addEventListener("click", function () { index = i; aufbauen(false); });
      li.appendChild(k);
      liste.appendChild(li);
    });
    var akt = liste.querySelector(".aktuell");
    if (akt && akt.scrollIntoView) akt.scrollIntoView({ block: "nearest" });

    var p = aktuellerPin();
    nameFeld.value = p.name;
    anzeige.innerHTML = "<strong>" + esc(b.name + " – " + p.name) + "</strong>" +
      "<small>Pin " + (index + 1) + " von " + b.pins.length + ": tippe genau auf diese Stelle. (x " + p.x + ", y " + p.y + ")</small>";
    anzeige.classList.add("gross");
  }

  // ---------- Antippen setzt den aktuellen Pin ----------
  function angetippt(cx, cy) {
    var q = zoom.clientZuBrett(cx, cy);
    var b = pins[bauteil];
    if (q.x < 0 || q.y < 0 || q.x > b.breite || q.y > b.hoehe) return;
    var p = aktuellerPin();
    p.x = Math.round(q.x);
    p.y = Math.round(q.y);
    gesetzt[bauteil + "." + p.id] = true;
    if (index < b.pins.length - 1) index++;
    sichern();
    aufbauen(false);
  }

  document.getElementById("weiter").addEventListener("click", function () {
    if (index < pins[bauteil].pins.length - 1) index++;
    aufbauen(false);
  });
  document.getElementById("zurueck").addEventListener("click", function () {
    if (index > 0) index--;
    aufbauen(false);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".pfeile .knopf"), function (k) {
    k.addEventListener("click", function () {
      var p = aktuellerPin();
      p.x += parseInt(k.getAttribute("data-dx"), 10);
      p.y += parseInt(k.getAttribute("data-dy"), 10);
      gesetzt[bauteil + "." + p.id] = true;
      sichern(); aufbauen(false);
    });
  });
  nameFeld.addEventListener("input", function () {
    aktuellerPin().name = nameFeld.value;
    sichern();
    // Nur Liste/Beschriftung neu zeichnen, Eingabefeld behält den Fokus
    var akt = liste.querySelector(".aktuell");
    if (akt) akt.textContent = (index + 1) + ". " + nameFeld.value;
  });
  nameFeld.addEventListener("change", function () { aufbauen(false); });

  document.getElementById("zoomPlus").addEventListener("click", function () { zoom.zoomen(1.5); });
  document.getElementById("zoomMinus").addEventListener("click", function () { zoom.zoomen(1 / 1.5); });
  richteVollbildEin(document.getElementById("vollbild"));
  document.getElementById("zoomAlles").addEventListener("click", function () { zoom.allesZeigen(); });
  window.addEventListener("resize", function () { zoom.groesseGeaendert(); });

  // ---------- Ergebnis ----------
  var KOPF = [
    "// =====================================================================",
    "// data/pins.js – Lage der Anschlüsse (Pins) auf den Bauteilbildern",
    "// ---------------------------------------------------------------------",
    "// x / y = Position in Pixeln im ORIGINALBILD (links oben = 0 / 0).",
    "// Diese Datei erzeugst du am bequemsten mit kalibrieren.html:",
    "// dort \"Kopieren\" drücken und den GESAMTEN Inhalt dieser Datei ersetzen.",
    "//",
    "// Felder je Pin:",
    "//   id        interner Name (nicht ändern, wird in aufgaben.js benutzt)",
    "//   name      Anzeigename im Spiel",
    "//   art       \"digital\", \"analog\", \"gnd\", \"plus\", \"buchse\", \"klemme\"",
    "//   pwm       true = Pin mit ~ (PWM)",
    "//   belegbar  false = sichtbar, aber es darf kein Kabel dran",
    "//   farbe     Kabelfarbe des Bauteilkabels (für die Kabel-Automatik)",
    "//   ausgang   (freiwillig) \"oben\", \"unten\", \"links\" oder \"rechts\": in diese",
    "//             Richtung (im Originalbild) verlässt das Kabel den Pin. Ohne",
    "//             Angabe: zur nächsten Bildkante.",
    "// ====================================================================="
  ].join("\n");

  // Gut lesbares Format: ein Pin pro Zeile
  function dateiInhalt() {
    var zeilen = [KOPF, "DATEN.pins = {"];
    bauteilNamen.forEach(function (n, bi) {
      var b = pins[n];
      zeilen.push('  "' + n + '": {');
      ["name", "bild", "breite", "hoehe"].forEach(function (k) {
        zeilen.push('    "' + k + '": ' + JSON.stringify(b[k]) + ",");
      });
      zeilen.push('    "pins": [');
      b.pins.forEach(function (p, i) {
        zeilen.push("      " + JSON.stringify(p).replace(/":/g, '": ').replace(/,"/g, ', "') + (i < b.pins.length - 1 ? "," : ""));
      });
      zeilen.push("    ]");
      zeilen.push("  }" + (bi < bauteilNamen.length - 1 ? "," : ""));
    });
    zeilen.push("};");
    return zeilen.join("\n") + "\n";
  }

  document.getElementById("kopieren").addEventListener("click", function () {
    var text = dateiInhalt();
    exportFeld.value = text;
    function altKopieren() {
      exportFeld.removeAttribute("readonly");
      exportFeld.focus();
      exportFeld.select();
      exportFeld.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      exportFeld.setAttribute("readonly", "");
      meldeKopie(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { meldeKopie(true); }, altKopieren);
    } else {
      altKopieren();
    }
  });

  function meldeKopie(ok) {
    zeigeDialog({
      titel: ok ? "Kopiert ✔" : "Bitte selbst kopieren",
      html: ok
        ? "<p>Öffne jetzt <code>data/pins.js</code>, markiere alles und füge den Text ein.</p>"
        : "<p>Der Text ist im Feld unter dem Knopf markiert. Kopiere ihn von Hand (lange drücken → Kopieren).</p>"
    });
  }

  // ---------- Testen im Spiel ----------
  testen.checked = !!(Speicher.lesen("kalibrierung_test", {}) || {}).aktiv;
  testen.addEventListener("change", function () {
    if (testen.checked) Speicher.schreiben("kalibrierung_test", { aktiv: true, pins: pins });
    else Speicher.schreiben("kalibrierung_test", { aktiv: false });
  });

  document.getElementById("zuruecksetzen").addEventListener("click", function () {
    zeigeDialog({
      titel: "Zurücksetzen?",
      html: "<p>Alle Änderungen auf diesem Gerät gehen verloren. Es gelten wieder die Werte aus <code>data/pins.js</code>.</p>",
      knoepfe: [
        { text: "↺ Zurücksetzen", haupt: true, aktion: function () {
          pins = JSON.parse(JSON.stringify(DATEN.pins));
          gesetzt = {};
          Speicher.schreiben("kalibrierung", null);
          Speicher.schreiben("kalibrierung_gesetzt", {});
          Speicher.schreiben("kalibrierung_test", { aktiv: false });
          testen.checked = false;
          index = 0;
          sichern(); aufbauen(true);
        } },
        { text: "Abbrechen" }
      ]
    });
  });

  exportFeld.value = dateiInhalt();
  aufbauen(true);
})();
