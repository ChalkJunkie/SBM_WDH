// =====================================================================
// js/schaltbrett.js – Bauteile und Kabel auf dem Schaltbrett zeichnen
// ---------------------------------------------------------------------
// Ein Anschluss heißt im Programm immer "bauteil.pin",
// z. B. "arduino.D9" oder "servo.rot".
// =====================================================================

var SVG_NS = "http://www.w3.org/2000/svg";

// Testmodus aus kalibrieren.html: Auf diesem Gerät die neuen Pin-Werte
// statt data/pins.js benutzen (nur wenn dort das Häkchen gesetzt ist).
(function () {
  var test = Speicher.lesen("kalibrierung_test", null);
  if (test && test.aktiv && test.pins) {
    DATEN.pins = test.pins;
    DATEN.kalibrierTest = true;
  }
})();

function svgElement(name, attribute) {
  var el = document.createElementNS(SVG_NS, name);
  Object.keys(attribute || {}).forEach(function (k) { el.setAttribute(k, attribute[k]); });
  return el;
}

// ---------- Hilfen rund um Anschlüsse ----------
var Pins = {
  // Liefert die Pin-Daten zu "arduino.D9"
  daten: function (schluessel) {
    var teile = schluessel.split(".");
    var b = DATEN.pins[teile[0]];
    if (!b) return null;
    for (var i = 0; i < b.pins.length; i++) if (b.pins[i].id === teile[1]) return b.pins[i];
    return null;
  },
  bauteil: function (schluessel) { return schluessel.split(".")[0]; },
  // "arduino.D9" -> "Arduino – ~9"
  langerName: function (schluessel) {
    var p = Pins.daten(schluessel), b = DATEN.pins[Pins.bauteil(schluessel)];
    if (!p || !b) return schluessel;
    return b.name + " – " + p.name;
  },
  istBelegbar: function (schluessel) {
    var p = Pins.daten(schluessel);
    return !!p && p.belegbar !== false;
  }
};

// Rechnet einen Punkt im Originalbild in Brettkoordinaten um
// (berücksichtigt Lage, Größe, Drehung und Spiegelung aus schaltbrett.js).
function bildZuBrett(bauteilName, px, py) {
  var b = DATEN.pins[bauteilName], L = DATEN.schaltbrett[bauteilName];
  var s = L.skala || 1, W = b.breite, H = b.hoehe;
  if (L.spiegeln) px = W - px;
  var q;
  switch (((L.drehung || 0) % 360 + 360) % 360) {
    case 90:  q = { x: H - py, y: px };     break;
    case 180: q = { x: W - px, y: H - py }; break;
    case 270: q = { x: py,     y: W - px }; break;
    default:  q = { x: px,     y: py };
  }
  return { x: L.x + q.x * s, y: L.y + q.y * s };
}

// SVG-Transformation für das Bauteilbild (passt zu bildZuBrett)
function bauteilTransform(bauteilName) {
  var b = DATEN.pins[bauteilName], L = DATEN.schaltbrett[bauteilName];
  var W = b.breite, H = b.hoehe;
  var t = "translate(" + L.x + " " + L.y + ") scale(" + (L.skala || 1) + ")";
  switch (((L.drehung || 0) % 360 + 360) % 360) {
    case 90:  t += " translate(" + H + " 0) rotate(90)"; break;
    case 180: t += " translate(" + W + " " + H + ") rotate(180)"; break;
    case 270: t += " translate(0 " + W + ") rotate(270)"; break;
  }
  if (L.spiegeln) t += " translate(" + W + " 0) scale(-1 1)";
  return t;
}

// Größe des Bauteils auf dem Brett
function bauteilRahmen(bauteilName) {
  var b = DATEN.pins[bauteilName], L = DATEN.schaltbrett[bauteilName], s = L.skala || 1;
  var quer = ((L.drehung || 0) % 180 + 180) % 180 === 90;
  return { x: L.x, y: L.y, b: (quer ? b.hoehe : b.breite) * s, h: (quer ? b.breite : b.hoehe) * s };
}

// ---------- Eigene Anordnung (Bauteile verschoben/gedreht) ----------
// Wird nur auf diesem Gerät gespeichert und gilt für alle Aufgaben.
var Anordnung = {
  standard: JSON.parse(JSON.stringify(DATEN.schaltbrett)),
  laden: function () {
    var eigene = Speicher.lesen("anordnung", null) || {};
    Object.keys(eigene).forEach(function (n) {
      if (!DATEN.schaltbrett[n]) return;
      ["x", "y", "drehung"].forEach(function (k) {
        if (typeof eigene[n][k] === "number") DATEN.schaltbrett[n][k] = eigene[n][k];
      });
    });
  },
  speichern: function () {
    var aus = {};
    Object.keys(DATEN.schaltbrett).forEach(function (n) {
      var L = DATEN.schaltbrett[n], S = Anordnung.standard[n];
      if (L.x !== S.x || L.y !== S.y || (L.drehung || 0) !== (S.drehung || 0)) aus[n] = { x: L.x, y: L.y, drehung: L.drehung || 0 };
    });
    Speicher.schreiben("anordnung", aus);
  },
  zuruecksetzen: function () {
    Object.keys(Anordnung.standard).forEach(function (n) {
      DATEN.schaltbrett[n] = JSON.parse(JSON.stringify(Anordnung.standard[n]));
    });
    Speicher.schreiben("anordnung", {});
  },
  istVeraendert: function () {
    return Object.keys(Speicher.lesen("anordnung", {}) || {}).length > 0;
  }
};
Anordnung.laden();

// ---------- Das Schaltbrett ----------
// optionen: { bauteile: ["arduino", "servo"], beimPin(schluessel), beimKabel(id), beimLeeren() }
function Schaltbrett(svg, optionen) {
  var self = this;
  this.svg = svg;
  this.optionen = optionen;
  this.bauteile = optionen.bauteile;
  this.kabel = [];
  this.markierungen = { kabel: {}, pins: {} };
  this.auswahl = null;

  svg.innerHTML = "";
  this.ebeneBauteile = svgElement("g");
  this.ebeneKabel = svgElement("g");
  this.ebenePins = svgElement("g");
  this.ebeneMarken = svgElement("g");
  this.ebeneRahmen = svgElement("g");   // Rahmen um Bauteile im Modus "anordnen"
  [this.ebeneBauteile, this.ebeneKabel, this.ebenePins, this.ebeneMarken, this.ebeneRahmen].forEach(function (e) { svg.appendChild(e); });
  this.anordnen = false;        // Modus "Bauteile anordnen" aktiv?
  this.gewaehlt = null;         // im Anordnen-Modus ausgewähltes Bauteil

  this._zeichneBauteile();
  if (typeof Kabelwege === "undefined") {
    throw new Error("js/kabelweg.js fehlt oder verkabeln.html ist veraltet. Bitte ALLE Spieldateien neu hochladen.");
  }
  this.wege = new Kabelwege(this.bauteile);   // rechtwinklige Kabelführung
  this.routen = {};                           // Kabel-ID -> { punkte }

  this.zoom = new ZoomFlaeche(svg, {
    beimAntippen: function (cx, cy, typ, ziel) { self._antippen(cx, cy, typ, ziel); },
    objektGreifen: function (cx, cy) { return self._greifen(cx, cy); }
  });
  var r = this.rahmen();
  this.zoom.setzeInhalt(r.x, r.y, r.b, r.h);
  window.addEventListener("resize", function () { self.zoom.groesseGeaendert(); });
}

// Fläche, die alle gezeigten Bauteile umfasst (mit Rand)
Schaltbrett.prototype.rahmen = function () {
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  this.bauteile.forEach(function (n) {
    var r = bauteilRahmen(n);
    minX = Math.min(minX, r.x); minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.b); maxY = Math.max(maxY, r.y + r.h);
  });
  var rand = 70;
  return { x: minX - rand, y: minY - rand, b: maxX - minX + 2 * rand, h: maxY - minY + 2 * rand };
};

Schaltbrett.prototype._zeichneBauteile = function () {
  var self = this;
  this.ebeneBauteile.innerHTML = "";
  this.ebenePins.innerHTML = "";
  this.bauteilGruppen = {};
  this.bauteile.forEach(function (n) {
    var b = DATEN.pins[n];
    var g = svgElement("g", { transform: bauteilTransform(n), "data-bauteil": n });
    self.bauteilGruppen[n] = g;
    var bild = svgElement("image", { width: b.breite, height: b.hoehe, preserveAspectRatio: "none" });
    bild.setAttribute("href", b.bild);
    bild.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", b.bild);
    g.appendChild(bild);
    self.ebeneBauteile.appendChild(g);

    // Kleine Ringe zeigen, wo man Kabel anschließen kann
    b.pins.forEach(function (p) {
      if (p.belegbar === false) return;
      var pos = bildZuBrett(n, p.x, p.y);
      self.ebenePins.appendChild(svgElement("circle", {
        cx: pos.x, cy: pos.y, r: 6.5, "class": "pin-ring"
      }));
    });
  });
};

// Position eines Anschlusses auf dem Brett
Schaltbrett.prototype.pinPosition = function (schluessel) {
  var p = Pins.daten(schluessel);
  return bildZuBrett(Pins.bauteil(schluessel), p.x, p.y);
};

// Alle Anschlüsse in der Nähe eines Bildschirmpunkts, nach Abstand sortiert
Schaltbrett.prototype.pinsInDerNaehe = function (cx, cy, radiusPx) {
  var self = this, treffer = [];
  this.bauteile.forEach(function (n) {
    DATEN.pins[n].pins.forEach(function (p) {
      var pos = bildZuBrett(n, p.x, p.y);
      var c = self.zoom.brettZuClient(pos.x, pos.y);
      var d = Math.hypot(c.x - cx, c.y - cy);
      if (d <= radiusPx) treffer.push({ schluessel: n + "." + p.id, abstand: d, x: pos.x, y: pos.y });
    });
  });
  treffer.sort(function (a, b) { return a.abstand - b.abstand; });
  return treffer;
};

// Wird von der ZoomFlaeche nach einem Antippen aufgerufen
// =====================================================================
// Modus "Bauteile anordnen": verschieben (ziehen) und drehen (↻)
// =====================================================================
var PLATZ = 28;   // so viel Abstand brauchen Bauteile untereinander (für die Kabel)

Schaltbrett.prototype.setzeAnordnen = function (an) {
  this.anordnen = !!an;
  this.gewaehlt = null;
  this.auswahl = null;
  this.svg.classList.toggle("anordnen", this.anordnen);
  this._zeichneRahmen();
  this.zeichneKabel();
};

// Welches Bauteil liegt an diesem Bildschirmpunkt? (oberstes zuerst)
Schaltbrett.prototype.bauteilBei = function (cx, cy) {
  var p = this.zoom.clientZuBrett(cx, cy);
  for (var i = this.bauteile.length - 1; i >= 0; i--) {
    var r = bauteilRahmen(this.bauteile[i]);
    if (p.x >= r.x && p.x <= r.x + r.b && p.y >= r.y && p.y <= r.y + r.h) return this.bauteile[i];
  }
  return null;
};

// Überlappt das Bauteil (mit Platz für Kabel) ein anderes?
Schaltbrett.prototype.ueberlappt = function (n) {
  var a = bauteilRahmen(n);
  return this.bauteile.some(function (m) {
    if (m === n) return false;
    var b = bauteilRahmen(m);
    return a.x - PLATZ < b.x + b.b + PLATZ && b.x - PLATZ < a.x + a.b + PLATZ &&
           a.y - PLATZ < b.y + b.h + PLATZ && b.y - PLATZ < a.y + a.h + PLATZ;
  });
};

Schaltbrett.prototype._greifen = function (cx, cy) {
  if (!this.anordnen) return null;
  var n = this.bauteilBei(cx, cy);
  if (!n) return null;
  var self = this, L = DATEN.schaltbrett[n], start = { x: L.x, y: L.y };
  return {
    bewege: function (dx, dy) {
      if (!self._zieht) { self._zieht = true; self.svg.classList.add("zieht"); self.gewaehlt = n; }
      L.x = start.x + dx; L.y = start.y + dy;
      self.bauteilGruppen[n].setAttribute("transform", bauteilTransform(n));
      self._zeichneRahmen();
    },
    loslassen: function (gezogen) {
      self._zieht = false;
      self.svg.classList.remove("zieht");
      if (!gezogen) return;
      L.x = Math.round(L.x / 10) * 10; L.y = Math.round(L.y / 10) * 10;
      var ok = !self.ueberlappt(n);
      if (!ok) { L.x = start.x; L.y = start.y; }
      self.neuAufbauen();
      if (ok) Anordnung.speichern();
      if (self.optionen.beimAnordnen) self.optionen.beimAnordnen(n, ok ? "verschoben" : "kein_platz");
    }
  };
};

// Ausgewähltes Bauteil um 90° im Uhrzeigersinn drehen (um seine Mitte)
Schaltbrett.prototype.dreheGewaehltes = function () {
  var n = this.gewaehlt;
  if (!n) return "keins";
  var L = DATEN.schaltbrett[n], alt = { x: L.x, y: L.y, drehung: L.drehung || 0 };
  var r = bauteilRahmen(n), mx = r.x + r.b / 2, my = r.y + r.h / 2;
  L.drehung = ((L.drehung || 0) + 90) % 360;
  var r2 = bauteilRahmen(n);
  L.x = Math.round((mx - r2.b / 2) / 10) * 10; L.y = Math.round((my - r2.h / 2) / 10) * 10;
  if (this.ueberlappt(n)) { L.x = alt.x; L.y = alt.y; L.drehung = alt.drehung; return "kein_platz"; }
  this.neuAufbauen();
  Anordnung.speichern();
  return "gedreht";
};

Schaltbrett.prototype.anordnungZuruecksetzen = function () {
  Anordnung.zuruecksetzen();
  this.gewaehlt = null;
  this.neuAufbauen();
  this.zoom.allesZeigen();
};

// Nach einer Änderung der Anordnung: Bilder, Raster und alle Kabel neu
Schaltbrett.prototype.neuAufbauen = function () {
  this._zeichneBauteile();
  this.wege = new Kabelwege(this.bauteile);
  var kabel = this.kabel;
  this.kabel = [];
  this.markierungen = { kabel: {}, pins: {} };
  this.setzeKabel(kabel);
  this._zeichneRahmen();
  var r = this.rahmen();
  this.zoom.inhalt = { x: r.x, y: r.y, b: r.b, h: r.h };
};

Schaltbrett.prototype._zeichneRahmen = function () {
  var self = this;
  this.ebeneRahmen.innerHTML = "";
  if (!this.anordnen) return;
  this.bauteile.forEach(function (n) {
    var r = bauteilRahmen(n);
    self.ebeneRahmen.appendChild(svgElement("rect", {
      x: r.x - 6, y: r.y - 6, width: r.b + 12, height: r.h + 12, rx: 8,
      "class": "bauteil-rahmen" + (n === self.gewaehlt ? " gewaehlt" : "")
    }));
  });
};

Schaltbrett.prototype._antippen = function (cx, cy, typ, ziel) {
  if (this.anordnen) {
    this.gewaehlt = this.bauteilBei(cx, cy);
    this._zeichneRahmen();
    if (this.optionen.beimBauteilWahl) this.optionen.beimBauteilWahl(this.gewaehlt);
    return;
  }
  // Stift und Maus sind genau, Finger nicht: unterschiedlich große Trefferflächen
  var radius = (typ === "touch") ? 26 : 14;
  var nahe = this.pinsInDerNaehe(cx, cy, radius);
  // Kabel in der Nähe (nach Abstand sortiert). Nicht einfach das Kabel
  // "unter" dem Finger nehmen: Nebeneinander liegende Kabel überlappen sich.
  var kabelNahe = this.kabelInDerNaehe(cx, cy, typ === "touch" ? 14 : 8);
  // Liegt ein Kabel unter dem Finger und ist kein Pin genau getroffen,
  // dann ist das Kabel gemeint.
  // Der Widerstand verdeckt die Löcher unter ihm: Antippen meint den Widerstand.
  var self = this;
  var istWiderstand = kabelNahe.length && this.kabel.some(function (k) { return k.id === kabelNahe[0].id && k.widerstand; });
  if (istWiderstand) { this.optionen.beimKabel(kabelNahe[0].id, typ); return; }
  if (kabelNahe.length && (!nahe.length || nahe[0].abstand > 8)) { this.optionen.beimKabel(kabelNahe, typ); return; }
  if (nahe.length > 0) {
    this.optionen.beimPin(nahe, typ, kabelNahe.length ? kabelNahe[0].id : null);
    return;
  }
  this.optionen.beimLeeren();
};

// Alle Kabel, die näher als radiusPx (Bildschirmpixel) am Punkt liegen
Schaltbrett.prototype.kabelInDerNaehe = function (cx, cy, radiusPx) {
  var self = this, p = this.zoom.clientZuBrett(cx, cy);
  var radius = radiusPx / this.zoom.massstab(), treffer = [];
  this.kabel.forEach(function (k) {
    var pk = (self.routen[k.id] || {}).punkte;
    if (!pk) return;
    var best = Infinity;
    for (var i = 1; i < pk.length; i++) {
      var a = pk[i - 1], b = pk[i];
      var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
      var t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
      best = Math.min(best, Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)));
    }
    if (best <= radius) treffer.push({ id: k.id, abstand: best * self.zoom.massstab() });
  });
  treffer.sort(function (a, b) { return a.abstand - b.abstand; });
  return treffer;
};

// ---------- Kabel zeichnen ----------

// kabel: [{ id, a, b, farbe, gesperrt }]
// Bereits gelegte Kabel behalten möglichst ihren Weg, neue Kabel werden
// um sie herum gelegt, entfernte Kabel geben ihren Platz frei. Danach
// werden Kabel mit Kreuzungen wenn möglich neu gelegt.
Schaltbrett.prototype.setzeKabel = function (kabel) {
  var self = this, neu = {}, alle = kabel;
  // Der Widerstand steckt direkt im Breadboard: kein Kabelweg nötig
  kabel = kabel.filter(function (k) { return !k.widerstand; });
  kabel.forEach(function (k) { neu[k.id] = k; });
  Object.keys(this.wege.belegung).forEach(function (id) {
    var r = self.wege.belegung[id], k = neu[id];
    if (!k || k.a !== r.a || k.b !== r.b) self.wege.entferne(id);
  });
  var fehlend = kabel.filter(function (k) { return !self.wege.belegung[k.id]; });
  if (fehlend.length > 1) fehlend = this.wege.sortiere(fehlend);
  fehlend.forEach(function (k) { self.wege.lege(k.id, k.a, k.b); });
  this.kabel = alle;
  this._routenUebernehmen(alle);
  this.zeichneKabel();
  // Danach kurz "aufräumen" (Kreuzungen auflösen, mit Zeitlimit). Das passiert
  // erst nach dem Zeichnen, damit das neue Kabel sofort zu sehen ist.
  clearTimeout(this._aufraeumTimer);
  if (fehlend.length && this.wege.gesamtProbleme() > 0) {
    this._aufraeumTimer = setTimeout(function () {
      var start = jetzt();
      self.wege.verbessere(5, start + KABELWEG.ZEIT / 2);
      self.wege.neuOrdnen(start + KABELWEG.ZEIT);
      self._routenUebernehmen(self.kabel);
      self.zeichneKabel();
    }, 60);
  }
};

Schaltbrett.prototype._routenUebernehmen = function (kabel) {
  var self = this;
  this.routen = {};
  kabel.forEach(function (k) {
    var bel = self.wege.belegung[k.id];
    self.routen[k.id] = { punkte: bel ? bel.punkte : [self.pinPosition(k.a), self.pinPosition(k.b)] };
  });
  this._breadboardSpuren(kabel);
};

// Breadboard: Ein Kabel verlässt sein Loch gerade nach außen. Liegt auf
// diesem Stück ein anderes belegtes Loch oder der Widerstand, würde das
// Kabel es verdecken. Dann läuft es stattdessen in der Lücke zwischen zwei
// Lochreihen (halber Lochabstand daneben) nach außen.
Schaltbrett.prototype._breadboardSpuren = function (kabel) {
  var self = this, BB = "breadboard";
  if (this.bauteile.indexOf(BB) < 0) return;
  var halb = 14.4 * (DATEN.schaltbrett[BB].skala || 1);
  var loecher = [], striche = [], spuren = [];
  kabel.forEach(function (k) {
    [k.a, k.b].forEach(function (s) { if (Pins.bauteil(s) === BB) loecher.push({ s: s, p: self.pinPosition(s) }); });
    if (k.widerstand) striche.push([self.pinPosition(k.a), self.pinPosition(k.b)]);
  });
  function abstandZuStrecke(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    var t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function schneiden(a, b, c, d) {
    function o(p, q, r) { return (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x); }
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  }
  // Ist die Strecke a-b frei (kein belegtes Loch außer "eigenes", kein Widerstand, keine andere Spur)?
  function frei(a, b, eigenes, mitSpuren) {
    if (loecher.some(function (l) { return l.s !== eigenes && abstandZuStrecke(l.p, a, b) < 6; })) return false;
    if (striche.some(function (w) { return schneiden(a, b, w[0], w[1]) || abstandZuStrecke(w[0], a, b) < 6 || abstandZuStrecke(w[1], a, b) < 6; })) return false;
    if (mitSpuren && spuren.some(function (sp) {
      return abstandZuStrecke(sp[0], a, b) < 4 || abstandZuStrecke(sp[1], a, b) < 4 ||
             abstandZuStrecke(a, sp[0], sp[1]) < 4 || abstandZuStrecke(b, sp[0], sp[1]) < 4;
    })) return false;
    return true;
  }
  kabel.forEach(function (k) {
    if (k.widerstand || !self.routen[k.id]) return;
    [k.a, k.b].forEach(function (s, ende) {
      if (Pins.bauteil(s) !== BB || !self.wege.pins[s]) return;
      var pk = self.routen[k.id].punkte.slice();
      if (ende === 1) pk.reverse();
      if (pk.length < 2) return;
      var loch = pk[0], aussen = self.wege.pins[s].ende;
      var d = RICHTUNG[self.wege.pins[s].richtung], n = { x: -d.y, y: d.x };
      if (frei(loch, aussen, s, false)) return;          // nichts im Weg
      // Seite bevorzugen, in die das Kabel danach ohnehin weiterläuft
      var nach = pk[1];
      var nahAussen = Math.abs((nach.x - aussen.x) * d.x + (nach.y - aussen.y) * d.y) < 1;
      var richtungDanach = (nahAussen && pk[2]) ? (pk[2].x - nach.x) * n.x + (pk[2].y - nach.y) * n.y : 0;
      var seiten = richtungDanach < 0 ? [-1, 1] : [1, -1];
      for (var i = 0; i < 2; i++) {
        var off = { x: n.x * halb * seiten[i], y: n.y * halb * seiten[i] };
        var a = { x: loch.x + off.x, y: loch.y + off.y }, b = { x: aussen.x + off.x, y: aussen.y + off.y };
        if (!frei(a, b, s, true)) continue;
        spuren.push([a, b]);
        var neu;
        if (nahAussen && pk[2] && richtungDanach * seiten[i] > 0) neu = [loch, a, b].concat(pk.slice(2));
        else neu = [loch, a, b, aussen].concat(nahAussen ? pk.slice(2) : pk.slice(1));
        if (ende === 1) neu.reverse();
        self.routen[k.id] = { punkte: neu };
        return;
      }
    });
  });
};

// markierungen: { kabel: { id: nummer }, pins: { schluessel: nummer } }
Schaltbrett.prototype.setzeMarkierungen = function (m) {
  this.markierungen = m || { kabel: {}, pins: {} };
  this.zeichneKabel();
};

Schaltbrett.prototype.zeichneKabel = function () {
  var self = this;
  this.ebeneKabel.innerHTML = "";
  this.ebeneMarken.innerHTML = "";
  var m = this.markierungen;

  var widerstaende = [];
  this.kabel.forEach(function (k) {
    if (k.widerstand) { widerstaende.push(k); return; }
    if (k.a === "batterie.stecker" || k.b === "batterie.stecker") { self._zeichneBatteriekabel(k, m.kabel[k.id]); return; }
    var a = self.pinPosition(k.a), b = self.pinPosition(k.b);
    var pfad = Kabelwege.pfad(self.routen[k.id].punkte);
    var g = svgElement("g", { "class": "kabel" + (k.gesperrt ? " gesperrt" : "") + (m.kabel[k.id] ? " falsch" : "") });
    g.appendChild(svgElement("path", { d: pfad.d, "class": "kabel-rand" }));
    g.appendChild(svgElement("path", { d: pfad.d, "class": "kabel-farbe", stroke: k.gesperrt ? pastell(k.farbe) : k.farbe }));
    if (m.kabel[k.id]) g.appendChild(svgElement("path", { d: pfad.d, "class": "kabel-falsch-muster" }));
    // Stecker an beiden Enden
    [a, b].forEach(function (p) {
      g.appendChild(svgElement("circle", { cx: p.x, cy: p.y, r: 5, "class": "kabel-stecker", fill: k.gesperrt ? pastell(k.farbe) : k.farbe }));
    });
    // Breite, unsichtbare Fläche zum Antippen des Kabels
    g.appendChild(svgElement("path", { d: pfad.d, "class": "kabel-treffer", "data-kabel": k.id }));
    self.ebeneKabel.appendChild(g);

    if (m.kabel[k.id]) self._marke(pfad.mitte, m.kabel[k.id], "falsch");
  });

  // Widerstände liegen über den Kabeln (sie stecken ja direkt im Brett)
  widerstaende.forEach(function (k) { self._zeichneWiderstand(k, m.kabel[k.id]); });

  Object.keys(m.pins || {}).forEach(function (s) {
    var p = self.pinPosition(s);
    self.ebeneMarken.appendChild(svgElement("circle", { cx: p.x, cy: p.y, r: 14, "class": "pin-fehlt-ring" }));
    self._marke({ x: p.x, y: p.y - 30 }, m.pins[s], "fehlt");
  });

  if (this.auswahl) {
    var pa = this.pinPosition(this.auswahl);
    this.ebeneMarken.appendChild(svgElement("circle", { cx: pa.x, cy: pa.y, r: 13, "class": "pin-auswahl" }));
  }
};

// 10-kΩ-Widerstand zwischen zwei Löchern: graue Beine, beiger Körper mit
// den Farbringen Braun-Schwarz-Orange-Gold
Schaltbrett.prototype._zeichneWiderstand = function (k, marke) {
  var a = this.pinPosition(k.a), b = this.pinPosition(k.b);
  var dx = b.x - a.x, dy = b.y - a.y, laenge = Math.hypot(dx, dy) || 1;
  var winkel = Math.atan2(dy, dx) * 180 / Math.PI;
  var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  var koerper = Math.max(16, Math.min(40, laenge - 12)), hoehe = 13;
  var g = svgElement("g", { "class": "widerstand" + (k.gesperrt ? " gesperrt" : "") + (marke ? " falsch" : "") });
  g.appendChild(svgElement("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, "class": "widerstand-bein" }));
  [a, b].forEach(function (p) { g.appendChild(svgElement("circle", { cx: p.x, cy: p.y, r: 3.5, "class": "widerstand-fuss" })); });
  var t = svgElement("g", { transform: "translate(" + mx + " " + my + ") rotate(" + winkel + ")" });
  t.appendChild(svgElement("rect", { x: -koerper / 2, y: -hoehe / 2, width: koerper, height: hoehe, rx: 5, "class": "widerstand-koerper" }));
  [[-0.3, "#7a4a1e"], [-0.12, "#1e1e1e"], [0.06, "#f08a1c"], [0.3, "#c9a227"]].forEach(function (r) {
    t.appendChild(svgElement("rect", { x: r[0] * koerper - 1.8, y: -hoehe / 2, width: 3.6, height: hoehe, fill: r[1] }));
  });
  g.appendChild(t);
  if (marke) g.appendChild(svgElement("line", { x1: a.x, y1: a.y, x2: b.x, y2: b.y, "class": "kabel-falsch-muster" }));
  this.ebeneKabel.appendChild(g);
  if (marke) this._marke({ x: mx, y: my - 24 }, marke, "falsch");
};

// Batterie-Adapterkabel: rote und schwarze Ader, die genau an die beiden
// Aderenden im Batteriebild anschließen. Am anderen Ende ein Hohlstecker in
// der Größe der Strombuchse des Arduino.
var BATTERIE_ADERN = 12;   // halber Abstand der Aderenden im Batteriebild (Pixel im Bild)
Schaltbrett.prototype._zeichneBatteriekabel = function (k, marke) {
  var pk = this.routen[k.id].punkte.slice();
  if (k.a !== "batterie.stecker") pk.reverse();      // pk beginnt an der Batterie
  var ende = pk[pk.length - 1], vor = pk[pk.length - 2];
  var lang = Math.hypot(ende.x - vor.x, ende.y - vor.y) || 1;
  var u = { x: (ende.x - vor.x) / lang, y: (ende.y - vor.y) / lang };
  // Maße des Steckers (passend zur Buchse im Arduino-Bild, mitskaliert)
  var ziel = k.a === "batterie.stecker" ? k.b : k.a;
  var sk = (DATEN.schaltbrett[Pins.bauteil(ziel)] || {}).skala || 1;
  var HUELSE = 24 * sk, KOERPER = 46 * sk, TUELLE = 26 * sk;
  var laenge = HUELSE + KOERPER + TUELLE;
  // Das Kabel endet hinten am Stecker
  var hinten = { x: ende.x - u.x * laenge, y: ende.y - u.y * laenge };
  var kabelPk = pk.slice(0, -1).concat([lang > laenge ? hinten : vor]);
  var mitte = Kabelwege.pfad(pk);
  var abstand = BATTERIE_ADERN * (DATEN.schaltbrett.batterie.skala || 1);
  var g = svgElement("g", { "class": "kabel batteriekabel" + (k.gesperrt ? " gesperrt" : "") + (marke ? " falsch" : "") });
  var farbe = function (f) { return k.gesperrt ? pastell(f) : f; };
  [[abstand, "#d32020"], [-abstand, "#1e1e1e"]].forEach(function (ader) {
    var d = Kabelwege.pfad(versetzt(kabelPk, ader[0])).d;
    g.appendChild(svgElement("path", { d: d, "class": "kabel-rand", style: "stroke-width:8.5px" }));
    g.appendChild(svgElement("path", { d: d, "class": "kabel-farbe", stroke: farbe(ader[1]), style: "stroke-width:5.5px" }));
  });
  if (marke) g.appendChild(svgElement("path", { d: Kabelwege.pfad(kabelPk).d, "class": "kabel-falsch-muster" }));
  // Hohlstecker (von hinten nach vorne): Knickschutz mit Rillen, Griff, Metallhülse
  var winkel = Math.atan2(u.y, u.x) * 180 / Math.PI;
  var st = svgElement("g", { transform: "translate(" + ende.x + " " + ende.y + ") rotate(" + winkel + ")" });
  var x0 = -laenge, schwarz = farbe("#1e1e1e");
  var hT = 2 * abstand + 10;   // Knickschutz: etwas breiter als die beiden Adern
  st.appendChild(svgElement("rect", { x: x0, y: -hT / 2, width: TUELLE + 4, height: hT, rx: 4, fill: schwarz, stroke: "rgba(0,0,0,.6)", "stroke-width": 1.5 }));
  for (var i = 0; i < 4; i++) {
    st.appendChild(svgElement("rect", { x: x0 + 3 + i * (TUELLE / 4), y: -hT / 2 - 2, width: TUELLE / 9, height: hT + 4, rx: 1.5, fill: farbe("#333") }));
  }
  var hK = 44 * sk;
  st.appendChild(svgElement("rect", { x: x0 + TUELLE, y: -hK / 2, width: KOERPER, height: hK, rx: 8 * sk, fill: schwarz, stroke: "rgba(0,0,0,.6)", "stroke-width": 1.5 }));
  st.appendChild(svgElement("rect", { x: x0 + TUELLE + 4, y: -hK / 2 + 4, width: KOERPER - 8, height: hK * 0.18, rx: 3, fill: "rgba(255,255,255,.12)" }));
  var hH = 28 * sk;
  st.appendChild(svgElement("rect", { x: -HUELSE, y: -hH / 2, width: HUELSE, height: hH, rx: 2, fill: "#cfcfcf", stroke: "#7d7d7d", "stroke-width": 1.5 }));
  st.appendChild(svgElement("rect", { x: -HUELSE + 2, y: -hH / 2 + 4, width: HUELSE - 4, height: hH * 0.2, fill: "#f4f4f4" }));
  st.appendChild(svgElement("rect", { x: -HUELSE + 2, y: hH / 2 - 7, width: HUELSE - 4, height: 3, fill: "#9a9a9a" }));
  g.appendChild(st);
  g.appendChild(svgElement("path", { d: mitte.d, "class": "kabel-treffer", "data-kabel": k.id }));
  this.ebeneKabel.appendChild(g);
  if (marke) this._marke(mitte.mitte, marke, "falsch");
};

// Linienzug seitlich verschieben (für zweiadrige Kabel). Bei rechtwinkligen
// Knicken ergibt die Summe der beiden Normalen genau die richtige Ecke.
function versetzt(punkte, d) {
  var n = [];
  for (var i = 1; i < punkte.length; i++) {
    var dx = punkte[i].x - punkte[i - 1].x, dy = punkte[i].y - punkte[i - 1].y, l = Math.hypot(dx, dy) || 1;
    n.push({ x: dy / l, y: -dx / l });
  }
  return punkte.map(function (p, i) {
    var a = n[Math.max(0, i - 1)], b = n[Math.min(n.length - 1, i)];
    var v = (i === 0 || i === punkte.length - 1 || a.x * b.x + a.y * b.y > 0.99) ? (i === 0 ? b : a) : { x: a.x + b.x, y: a.y + b.y };
    return { x: p.x + v.x * d, y: p.y + v.y * d };
  });
}

// Vorgegebene Kabel: dieselbe Farbe, nur heller (Pastellton)
function pastell(farbe) {
  var m = /^#?([0-9a-f]{6})$/i.exec(farbe || "");
  if (!m) return "#c8c8c8";
  var z = parseInt(m[1], 16), anteil = 0.55;   // 55 % Weiß dazumischen
  var r = (z >> 16) & 255, g = (z >> 8) & 255, b = z & 255;
  function mische(c) { return Math.round(c + (255 - c) * anteil); }
  return "rgb(" + mische(r) + "," + mische(g) + "," + mische(b) + ")";
}

// Nummerierte Markierung (passt zur Nummer in der Fehlerliste)
Schaltbrett.prototype._marke = function (pos, nummer, art) {
  var g = svgElement("g", { "class": "marke marke-" + art });
  g.appendChild(svgElement("circle", { cx: pos.x, cy: pos.y, r: 15 }));
  var t = svgElement("text", { x: pos.x, y: pos.y + 6, "text-anchor": "middle" });
  t.textContent = nummer;
  g.appendChild(t);
  this.ebeneMarken.appendChild(g);
};

Schaltbrett.prototype.setzeAuswahl = function (schluessel) {
  this.auswahl = schluessel;
  this.zeichneKabel();
};

// Kurz aufblinken lassen und hinzoomen (nach Antippen einer Rückmeldung)
Schaltbrett.prototype.zeigeStellen = function (punkte) {
  if (!punkte.length) return;
  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  punkte.forEach(function (p) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  });
  var rand = 120;
  this.zoom.zeigeBereich(minX - rand, minY - rand, maxX - minX + 2 * rand, maxY - minY + 2 * rand);
  var self = this;
  punkte.forEach(function (p) {
    var c = svgElement("circle", { cx: p.x, cy: p.y, r: 22, "class": "blinken" });
    self.ebeneMarken.appendChild(c);
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 1600);
  });
};

// =====================================================================
// Als Bild exportieren (PNG, weißer Hintergrund)
// ---------------------------------------------------------------------
// Kopiert nur Bauteile und Kabel in eine eigene SVG, ohne die gelben
// Anschluss-Ringe, Fehlermarkierungen und Auswahl. Die Bilder werden
// eingebettet, damit der Browser alles auf eine Leinwand malen darf.
// Gibt ein Promise mit einem PNG-Blob zurück.
// =====================================================================
Schaltbrett.prototype.alsBild = function () {
  var RAND = 30, FAKTOR = 2, MAX = 4096;

  // Ausschnitt: alle Bauteile und Kabel
  var a = this.ebeneBauteile.getBBox(), k = this.ebeneKabel.getBBox();
  var x0 = Math.min(a.x, k.width ? k.x : a.x) - RAND, y0 = Math.min(a.y, k.height ? k.y : a.y) - RAND;
  var x1 = Math.max(a.x + a.width, k.width ? k.x + k.width : 0) + RAND;
  var y1 = Math.max(a.y + a.height, k.height ? k.y + k.height : 0) + RAND;
  var b = x1 - x0, h = y1 - y0;
  var faktor = Math.min(FAKTOR, MAX / b, MAX / h);
  var breite = Math.round(b * faktor), hoehe = Math.round(h * faktor);

  var svg = svgElement("svg", { xmlns: SVG_NS, width: breite, height: hoehe, viewBox: x0 + " " + y0 + " " + b + " " + h });
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.appendChild(svgElement("rect", { x: x0, y: y0, width: b, height: h, fill: "#ffffff" }));

  // Aussehen aus dem Stylesheet direkt an die Elemente schreiben
  var EIGENSCHAFTEN = ["fill", "fill-opacity", "stroke", "stroke-width", "stroke-opacity", "stroke-linecap",
    "stroke-linejoin", "stroke-dasharray", "opacity", "display", "visibility"];
  function kopiere(original) {
    var kopie = original.cloneNode(false);
    if (original.nodeType === 1) {
      var st = window.getComputedStyle(original);
      kopie.setAttribute("style", EIGENSCHAFTEN.map(function (e) { return e + ":" + st.getPropertyValue(e); }).join(";"));
      kopie.removeAttribute("class");
    }
    for (var c = original.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 1) {
        var kl = c.getAttribute("class") || "";
        // Unsichtbare Trefferflächen und Fehlermuster weglassen
        if (/\b(kabel-treffer|kabel-falsch-muster)\b/.test(kl)) continue;
      }
      kopie.appendChild(kopiere(c));
    }
    return kopie;
  }
  svg.appendChild(kopiere(this.ebeneBauteile));
  var kabel = kopiere(this.ebeneKabel);
  svg.appendChild(kabel);
  // Ein als falsch markierter Widerstand bekommt im Bild seine normale Farbe
  Array.prototype.forEach.call(svg.querySelectorAll("rect"), function (r) {
    if (/stroke:\s*rgb\(198, 40, 40\)/.test(r.getAttribute("style") || "")) {
      r.setAttribute("style", r.getAttribute("style").replace(/stroke:[^;]+/, "stroke:#8a6a3a").replace(/stroke-width:[^;]+/, "stroke-width:1.2px"));
    }
  });

  // Bilder als data:-Adressen einbetten
  var cache = Schaltbrett._bildCache = Schaltbrett._bildCache || {};
  function alsDataUrl(src) {
    if (cache[src]) return Promise.resolve(cache[src]);
    return fetch(src).then(function (r) {
      if (!r.ok) throw new Error("Bild nicht gefunden: " + src);
      return r.blob();
    }).then(function (blob) {
      return new Promise(function (ok, fehler) {
        var fr = new FileReader();
        fr.onload = function () { cache[src] = fr.result; ok(fr.result); };
        fr.onerror = fehler;
        fr.readAsDataURL(blob);
      });
    });
  }
  var bilder = Array.prototype.slice.call(svg.querySelectorAll("image"));
  return Promise.all(bilder.map(function (img) {
    var src = img.getAttribute("href") || img.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    return alsDataUrl(src).then(function (d) {
      img.setAttribute("href", d);
      img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", d);
    });
  })).then(function () {
    var text = new XMLSerializer().serializeToString(svg);
    return new Promise(function (ok, fehler) {
      var bild = new Image();
      bild.onload = function () {
        // Safari braucht manchmal einen Moment, bis eingebettete Bilder bereit sind
        setTimeout(function () {
          try {
            var leinwand = document.createElement("canvas");
            leinwand.width = breite; leinwand.height = hoehe;
            var ctx = leinwand.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, breite, hoehe);
            ctx.drawImage(bild, 0, 0, breite, hoehe);
            leinwand.toBlob(function (blob) {
              if (blob) ok(blob); else fehler(new Error("Bild konnte nicht erzeugt werden."));
            }, "image/png");
          } catch (e) { fehler(e); }
        }, 120);
      };
      bild.onerror = function () { fehler(new Error("Bild konnte nicht erzeugt werden.")); };
      bild.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(text);
    });
  });
};
