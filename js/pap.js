// =====================================================================
// js/pap.js – Programmablaufplan (PAP) als Grafik zeichnen
// ---------------------------------------------------------------------
// Formen wie im Arbeitsblatt "Ampel und PAP":
//   { "art": "start",  "text": "Start" }            abgerundetes Rechteck
//   { "art": "schritt", "text": "LED an" }          Rechteck (Tätigkeit)
//   { "art": "frage", "text": "Taster gedrückt?",   Raute (Verzweigung)
//     "ja": [ ...Schritte... ], "nein": [ ...Schritte... ] }
//   { "art": "schleife", "schritte": [ ... ] }      Pfeil zurück nach oben
//                                                    (der Loop-Teil)
// =====================================================================
var PAP = (function () {
  var NS = "http://www.w3.org/2000/svg";
  var BREITE = 190, ABSTAND = 26, SPALTE = 225, ZEILE = 17;

  function el(name, a) {
    var e = document.createElementNS(NS, name);
    Object.keys(a || {}).forEach(function (k) { e.setAttribute(k, a[k]); });
    return e;
  }

  // Text auf mehrere Zeilen verteilen
  function umbrechen(text, max) {
    var woerter = String(text).split(" "), zeilen = [], z = "";
    woerter.forEach(function (w) {
      if (z && (z + " " + w).length > max) { zeilen.push(z); z = w; } else z = z ? z + " " + w : w;
    });
    if (z) zeilen.push(z);
    return zeilen;
  }

  function hoehe(s) {
    if (s.art === "start") return 38;
    if (s.art === "frage") return Math.max(84, 44 + umbrechen(s.text, 16).length * ZEILE);
    return 18 + umbrechen(s.text, 22).length * ZEILE;
  }

  function text(g, s, cx, y, h, max) {
    var zeilen = umbrechen(s.text, max);
    var y0 = y + h / 2 - (zeilen.length - 1) * ZEILE / 2 + 5;
    zeilen.forEach(function (z, i) {
      var t = el("text", { x: cx, y: y0 + i * ZEILE, "text-anchor": "middle", "class": "pap-text" });
      t.textContent = z;
      g.appendChild(t);
    });
  }

  function pfeil(g, punkte) {
    g.appendChild(el("polyline", { points: punkte.map(function (p) { return p[0] + "," + p[1]; }).join(" "), "class": "pap-linie", "marker-end": "url(#pap-spitze)" }));
  }
  function linie(g, punkte) {
    g.appendChild(el("polyline", { points: punkte.map(function (p) { return p[0] + "," + p[1]; }).join(" "), "class": "pap-linie" }));
  }

  // Zeichnet eine Liste von Schritten ab (cx, y). Gibt das untere Ende
  // und die größte x-Koordinate zurück. Vor jedem Schritt (außer dem
  // ersten) wird ein Pfeil von oben gezeichnet.
  function folge(g, schritte, cx, y, mitPfeil) {
    var maxX = cx + BREITE / 2;
    schritte.forEach(function (s, i) {
      if (i > 0 || mitPfeil) {
        // Vor einer Schleife nur eine Linie: die Schleife zeichnet ihre eigene Pfeilspitze
        if (s.art === "schleife") linie(g, [[cx, y], [cx, y + ABSTAND]]);
        else pfeil(g, [[cx, y], [cx, y + ABSTAND]]);
        y += ABSTAND;
      }
      var r = einzeln(g, s, cx, y);
      y = r.unten; maxX = Math.max(maxX, r.maxX);
    });
    return { unten: y, maxX: maxX };
  }

  function einzeln(g, s, cx, y) {
    var h = hoehe(s), w = BREITE;
    if (s.art === "start") {
      g.appendChild(el("rect", { x: cx - 75, y: y, width: 150, height: h, rx: 19, "class": "pap-start" }));
      text(g, s, cx, y, h, 22);
      return { unten: y + h, maxX: cx + 75 };
    }
    if (s.art === "schritt") {
      g.appendChild(el("rect", { x: cx - w / 2, y: y, width: w, height: h, "class": "pap-schritt" }));
      text(g, s, cx, y, h, 22);
      return { unten: y + h, maxX: cx + w / 2 };
    }
    if (s.art === "schleife") {
      // Kleiner Vorlauf, damit der Rücksprung-Pfeil Platz hat
      var oben = y;
      var r = folge(g, s.schritte, cx, y + ABSTAND, true);
      var unten = r.unten + ABSTAND / 2;
      linie(g, [[cx, r.unten], [cx, unten], [cx - BREITE / 2 - 22, unten], [cx - BREITE / 2 - 22, oben + ABSTAND / 2]]);
      pfeil(g, [[cx - BREITE / 2 - 22, oben + ABSTAND / 2], [cx - 2, oben + ABSTAND / 2]]);
      linie(g, [[cx, oben], [cx, oben + ABSTAND]]);
      return { unten: unten, maxX: r.maxX };
    }
    if (s.art === "frage") {
      var halb = h / 2;
      g.appendChild(el("polygon", {
        points: [[cx, y], [cx + w / 2 + 10, y + halb], [cx, y + h], [cx - w / 2 - 10, y + halb]].map(function (p) { return p.join(","); }).join(" "),
        "class": "pap-frage"
      }));
      text(g, s, cx, y, h, 16);
      // ja: nach unten
      var start = y + h;
      var ja = (s.ja && s.ja.length) ? folge(g, s.ja, cx, start, true) : { unten: start, maxX: cx };
      var jaText = el("text", { x: cx + 10, y: start + 15, "class": "pap-label" }); jaText.textContent = "ja"; g.appendChild(jaText);
      // nein: nach rechts, dann nach unten
      var nx = cx + SPALTE;
      var neinText = el("text", { x: cx + w / 2 + 16, y: y + halb - 8, "class": "pap-label" }); neinText.textContent = "nein"; g.appendChild(neinText);
      var nein;
      if (s.nein && s.nein.length) {
        linie(g, [[cx + w / 2 + 10, y + halb], [nx, y + halb], [nx, start]]);
        nein = folge(g, s.nein, nx, start, true);
      } else {
        linie(g, [[cx + w / 2 + 10, y + halb], [nx, y + halb]]);
        nein = { unten: y + halb, maxX: nx };
      }
      // Zusammenführen
      var zusammen = Math.max(ja.unten, nein.unten) + ABSTAND;
      linie(g, [[cx, ja.unten], [cx, zusammen]]);
      pfeil(g, [[nx, nein.unten], [nx, zusammen], [cx + 3, zusammen]]);
      return { unten: zusammen, maxX: Math.max(ja.maxX, nein.maxX, nx + BREITE / 2) };
    }
    return { unten: y, maxX: cx };
  }

  // Zeichnet den ganzen PAP in den Behälter
  function zeichne(behaelter, schritte) {
    var svg = el("svg", { "class": "pap", role: "img", "aria-label": "Programmablaufplan" });
    var defs = el("defs");
    var m = el("marker", { id: "pap-spitze", markerWidth: 10, markerHeight: 10, refX: 8, refY: 5, orient: "auto" });
    m.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", "class": "pap-spitze" }));
    defs.appendChild(m); svg.appendChild(defs);
    var g = el("g");
    svg.appendChild(g);
    var cx = BREITE / 2 + 40;
    var r = folge(g, schritte, cx, 10, false);
    svg.setAttribute("viewBox", "0 0 " + (r.maxX + 12) + " " + (r.unten + 12));
    svg.style.maxWidth = (r.maxX + 12) + "px";
    behaelter.innerHTML = "";
    behaelter.appendChild(svg);
  }

  return { zeichne: zeichne };
})();
