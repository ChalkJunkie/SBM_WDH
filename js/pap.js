// =====================================================================
// js/pap.js – Programmablaufplan (PAP) als Grafik zeichnen
// ---------------------------------------------------------------------
// Formen wie im Arbeitsblatt "Ampel und PAP":
//   { "art": "start",  "text": "Start" }            abgerundetes Rechteck
//   { "art": "schritt", "text": "LED an" }          Rechteck (Tätigkeit)
//   { "art": "frage", "text": "Taster gedrückt?",   Raute (Verzweigung)
//     "ja": [ ...Schritte... ], "nein": [ ...Schritte... ] }
//     oder statt "nein": "neinZurLetzten": true -> der nein-Pfeil führt
//     in die letzte Box des ja-Zweigs (z. B. "LED aus")
//   { "art": "schleife", "schritte": [ ... ] }      Pfeil zurück in die erste
//                                                    Box (der Loop-Teil)
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

  // Zeichnet eine Liste von Schritten ab (cx, y). Gibt das untere Ende,
  // die größte x-Koordinate und die Lage der ersten/letzten Box zurück.
  // Vor jedem Schritt (außer dem ersten) wird ein Pfeil von oben gezeichnet.
  function folge(g, schritte, cx, y, mitPfeil) {
    var maxX = cx + BREITE / 2, erste = null, letzte = null;
    schritte.forEach(function (s, i) {
      if (i > 0 || mitPfeil) { pfeil(g, [[cx, y], [cx, y + ABSTAND]]); y += ABSTAND; }
      var r = einzeln(g, s, cx, y);
      if (!erste) erste = r.box;
      letzte = r.box;
      y = r.unten; maxX = Math.max(maxX, r.maxX);
    });
    return { unten: y, maxX: maxX, erste: erste, letzte: letzte };
  }

  // box: { oben, hoehe, links, rechts } der gezeichneten Form
  function einzeln(g, s, cx, y) {
    var h = hoehe(s), w = BREITE;
    if (s.art === "start") {
      g.appendChild(el("rect", { x: cx - 75, y: y, width: 150, height: h, rx: 19, "class": "pap-start" }));
      text(g, s, cx, y, h, 22);
      return { unten: y + h, maxX: cx + 75, box: { oben: y, hoehe: h, links: cx - 75, rechts: cx + 75 } };
    }
    if (s.art === "schritt") {
      g.appendChild(el("rect", { x: cx - w / 2, y: y, width: w, height: h, "class": "pap-schritt" }));
      text(g, s, cx, y, h, 22);
      return { unten: y + h, maxX: cx + w / 2, box: { oben: y, hoehe: h, links: cx - w / 2, rechts: cx + w / 2 } };
    }
    if (s.art === "schleife") {
      // Der Rücksprung-Pfeil führt links zurück in die ERSTE Box der Schleife
      var r = folge(g, s.schritte, cx, y, false);
      var unten = r.unten + ABSTAND / 2;
      var xl = cx - BREITE / 2 - 34;
      var ziel = r.erste.oben + r.erste.hoehe / 2;
      linie(g, [[cx, r.unten], [cx, unten], [xl, unten], [xl, ziel]]);
      pfeil(g, [[xl, ziel], [r.erste.links - 2, ziel]]);
      return { unten: unten, maxX: r.maxX, box: r.erste };
    }
    if (s.art === "frage") {
      var halb = h / 2;
      var box = { oben: y, hoehe: h, links: cx - w / 2 - 10, rechts: cx + w / 2 + 10 };
      g.appendChild(el("polygon", {
        points: [[cx, y], [box.rechts, y + halb], [cx, y + h], [box.links, y + halb]].map(function (p) { return p.join(","); }).join(" "),
        "class": "pap-frage"
      }));
      text(g, s, cx, y, h, 16);
      // ja: nach unten
      var start = y + h;
      var ja = (s.ja && s.ja.length) ? folge(g, s.ja, cx, start, true) : { unten: start, maxX: cx, letzte: null };
      var jaText = el("text", { x: cx + 10, y: start + 15, "class": "pap-label" }); jaText.textContent = "ja"; g.appendChild(jaText);
      var neinText = el("text", { x: box.rechts + 6, y: y + halb - 8, "class": "pap-label" }); neinText.textContent = "nein"; g.appendChild(neinText);

      // nein führt in die letzte Box des ja-Zweigs (z. B. "LED aus")
      if (s.neinZurLetzten && ja.letzte) {
        var nx = cx + BREITE / 2 + 40;
        var zy = ja.letzte.oben + ja.letzte.hoehe / 2;
        linie(g, [[box.rechts, y + halb], [nx, y + halb], [nx, zy]]);
        pfeil(g, [[nx, zy], [ja.letzte.rechts + 2, zy]]);
        return { unten: ja.unten, maxX: Math.max(ja.maxX, nx + 10, box.rechts + 40), box: box };
      }

      // nein: eigener Zweig rechts, dann zusammenführen
      var nx2 = cx + SPALTE, nein;
      if (s.nein && s.nein.length) {
        linie(g, [[box.rechts, y + halb], [nx2, y + halb], [nx2, start]]);
        nein = folge(g, s.nein, nx2, start, true);
      } else {
        linie(g, [[box.rechts, y + halb], [nx2, y + halb]]);
        nein = { unten: y + halb, maxX: nx2 };
      }
      var zusammen = Math.max(ja.unten, nein.unten) + ABSTAND;
      linie(g, [[cx, ja.unten], [cx, zusammen]]);
      pfeil(g, [[nx2, nein.unten], [nx2, zusammen], [cx + 3, zusammen]]);
      return { unten: zusammen, maxX: Math.max(ja.maxX, nein.maxX, nx2 + BREITE / 2), box: box };
    }
    return { unten: y, maxX: cx, box: { oben: y, hoehe: 0, links: cx, rechts: cx } };
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
