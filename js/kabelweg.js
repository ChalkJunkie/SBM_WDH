// =====================================================================
// js/kabelweg.js – Rechtwinklige Kabelführung
// ---------------------------------------------------------------------
// Jedes Kabel verlässt seinen Pin zuerst gerade nach außen (vom Bauteil
// weg). Danach sucht das Programm auf einem unsichtbaren Raster einen
// Weg, der nur waagrecht und senkrecht verläuft:
//   - nie über ein Bauteil,
//   - nie auf einem anderen Kabel (keine Überlappung),
//   - möglichst ohne Kreuzung und mit wenigen Knicken.
// Bereits gelegte Kabel bleiben liegen, neue Kabel weichen ihnen aus.
// =====================================================================

var KABELWEG = {
  RASTER: 12,        // Abstand der Bahnen in Brett-Einheiten
  ABSTAND: 12,       // so weit bleiben Kabel von Bauteilen weg
  STUMMEL: 14,       // so weit ragt der gerade Anfang über den Abstand hinaus
  STECKER: 40,       // zusätzlich vor der Strombuchse (Platz für den Hohlstecker)
  FANG: 4,           // Pins, die so nah auf einer Linie liegen, teilen sich eine Bahn
  ZEIT: 300,         // höchstens so viele Millisekunden fürs Aufräumen nach jedem Kabel
  RAND: 140,         // so weit dürfen Kabel um die Bauteile herum laufen
  KNICK: 60,         // "Kosten" für einen Knick (je höher, desto gerader)
  KREUZUNG: 2000,    // "Kosten" für eine Kreuzung (lieber ein kleiner Umweg als eine Kreuzung)
  KONFLIKT: 20000    // "Kosten" für Überlappung (nur im Notfall)
};

// Richtungen: 0 = rechts, 1 = unten, 2 = links, 3 = oben
var RICHTUNG = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];

// ---------- In welche Richtung verlässt ein Kabel den Pin? ----------
// Entweder "ausgang" aus pins.js ("oben", "unten", "links", "rechts",
// bezogen auf das Originalbild) oder automatisch: zur nächsten Bildkante.
function pinAusgang(bauteilName, pin) {
  var b = DATEN.pins[bauteilName], L = DATEN.schaltbrett[bauteilName];
  var namen = { rechts: { x: 1, y: 0 }, unten: { x: 0, y: 1 }, links: { x: -1, y: 0 }, oben: { x: 0, y: -1 } };
  var v = namen[pin.ausgang];
  if (!v) {
    var abst = [
      { d: b.breite - pin.x, v: namen.rechts },
      { d: b.hoehe - pin.y,  v: namen.unten },
      { d: pin.x,            v: namen.links },
      { d: pin.y,            v: namen.oben }
    ];
    abst.sort(function (p, q) { return p.d - q.d; });
    v = abst[0].v;
  }
  var dx = v.x, dy = v.y;
  if (L.spiegeln) dx = -dx;
  var t, d = ((L.drehung || 0) % 360 + 360) % 360;
  if (d === 90)  { t = dx; dx = -dy; dy = t; }
  if (d === 180) { dx = -dx; dy = -dy; }
  if (d === 270) { t = dx; dx = dy; dy = -t; }
  for (var i = 0; i < 4; i++) if (RICHTUNG[i].x === dx && RICHTUNG[i].y === dy) return i;
  return 0;
}

// ---------- Kleine Vorrangwarteschlange (für die Wegsuche) ----------
function Warteschlange() { this.k = []; this.p = []; }
Warteschlange.prototype.rein = function (wert, prio) {
  var k = this.k, p = this.p, i = k.length;
  k.push(wert); p.push(prio);
  while (i > 0) {
    var e = (i - 1) >> 1;
    if (p[e] <= prio) break;
    k[i] = k[e]; p[i] = p[e]; i = e;
  }
  k[i] = wert; p[i] = prio;
};
Warteschlange.prototype.raus = function () {
  var k = this.k, p = this.p, oben = k[0];
  var letzterK = k.pop(), letzterP = p.pop();
  if (k.length) {
    var i = 0, n = k.length;
    while (true) {
      var l = 2 * i + 1, r = l + 1, m = i, mp = letzterP;
      if (l < n && p[l] < mp) { m = l; mp = p[l]; }
      if (r < n && p[r] < mp) { m = r; mp = p[r]; }
      if (m === i) break;
      k[i] = k[m]; p[i] = p[m]; i = m;
    }
    k[i] = letzterK; p[i] = letzterP;
  }
  return oben;
};
Warteschlange.prototype.leer = function () { return this.k.length === 0; };

// ---------- Das Raster ----------
function Kabelwege(bauteile) {
  var self = this, K = KABELWEG;
  this.hindernisse = [];
  this.pins = {};

  var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  var wichtigX = [], wichtigY = [];   // Bauteilränder
  var pinX = [], pinY = [];           // gerade Anfänge der Pins

  bauteile.forEach(function (n) {
    var r = bauteilRahmen(n);
    var h = { x0: r.x - K.ABSTAND, y0: r.y - K.ABSTAND, x1: r.x + r.b + K.ABSTAND, y1: r.y + r.h + K.ABSTAND };
    self.hindernisse.push(h);
    wichtigX.push(h.x0, h.x1); wichtigY.push(h.y0, h.y1);
    minX = Math.min(minX, h.x0); minY = Math.min(minY, h.y0);
    maxX = Math.max(maxX, h.x1); maxY = Math.max(maxY, h.y1);

    DATEN.pins[n].pins.forEach(function (p) {
      if (p.belegbar === false) return;
      var pos = bildZuBrett(n, p.x, p.y);
      var ri = pinAusgang(n, p), d = RICHTUNG[ri];
      var ende = { x: pos.x, y: pos.y };
      // Vor der Strombuchse braucht der Hohlstecker Platz: längerer gerader Anfang
      var stummel = K.STUMMEL + (p.art === "buchse" ? K.STECKER : 0);
      if (d.y < 0) ende.y = h.y0 - stummel;
      if (d.y > 0) ende.y = h.y1 + stummel;
      if (d.x < 0) ende.x = h.x0 - stummel;
      if (d.x > 0) ende.x = h.x1 + stummel;
      self.pins[n + "." + p.id] = { pos: pos, richtung: ri, ende: ende, kante: { x0: h.x0, y0: h.y0, x1: h.x1, y1: h.y1 } };
      pinX.push(ende.x); pinY.push(ende.y);
    });
  });

  minX -= K.RAND; minY -= K.RAND; maxX += K.RAND; maxY += K.RAND;
  // Fast gleiche Pin-Linien zusammenfassen (vermeidet winzige Knicke)
  this.xs = Kabelwege.bahnen(wichtigX.concat(Kabelwege.buendeln(pinX)), minX, maxX);
  this.ys = Kabelwege.bahnen(wichtigY.concat(Kabelwege.buendeln(pinY)), minY, maxY);
  this.nx = this.xs.length; this.ny = this.ys.length;
  var anzahl = this.nx * this.ny;

  // Gesperrte Knoten: im Inneren eines Bauteils
  this.gesperrt = new Uint8Array(anzahl);
  for (var ix = 0; ix < this.nx; ix++) {
    for (var iy = 0; iy < this.ny; iy++) {
      var x = this.xs[ix], y = this.ys[iy];
      for (var hi = 0; hi < this.hindernisse.length; hi++) {
        var hh = this.hindernisse[hi];
        if (x > hh.x0 + 0.1 && x < hh.x1 - 0.1 && y > hh.y0 + 0.1 && y < hh.y1 - 0.1) { this.gesperrt[ix * this.ny + iy] = 1; break; }
      }
    }
  }

  // Reservierte Knoten: der gerade Anfang jedes Pins (auch ohne Kabel),
  // damit kein anderes Kabel quer davor entlangläuft.
  this.reserviert = {};
  Object.keys(this.pins).forEach(function (s) {
    var info = self.pins[s];
    info.knoten = self.knotenBei(info.ende.x, info.ende.y);
    self.stummelKnoten(info).forEach(function (k) {
      (self.reserviert[k] = self.reserviert[k] || []).push(s);
    });
  });

  this.belegung = {};   // Kabel-ID -> { kanten: [...], knoten: [...] }
  this.historie = {};   // Knoten -> Zusatzkosten (Stellen, an denen es immer wieder Kreuzungen gab)
  this.kanten = {};     // "k1-k2" -> [Kabel-IDs]
  this.knoten = {};     // Knoten -> [{ id, waag, senk, knick }]
}

// Rasterlinien: wichtige Linien (Pins, Bauteilränder) plus regelmäßige
// Bahnen dazwischen. Zu nah beieinander liegende Bahnen werden weggelassen.
// Werte, die näher als FANG beieinander liegen, durch ihren Mittelwert ersetzen
Kabelwege.buendeln = function (werte) {
  var w = werte.slice().sort(function (a, b) { return a - b; }), aus = [], gruppe = [];
  w.forEach(function (v) {
    if (gruppe.length && v - gruppe[0] > KABELWEG.FANG) {
      aus.push(gruppe.reduce(function (s, x) { return s + x; }, 0) / gruppe.length); gruppe = [];
    }
    gruppe.push(v);
  });
  if (gruppe.length) aus.push(gruppe.reduce(function (s, x) { return s + x; }, 0) / gruppe.length);
  return aus;
};

Kabelwege.bahnen = function (wichtig, min, max) {
  var K = KABELWEG;
  var w = wichtig.slice().sort(function (a, b) { return a - b; });
  var linien = [];
  w.forEach(function (v) { if (!linien.length || v - linien[linien.length - 1] > 0.5) linien.push(v); });
  var start = Math.floor(min / K.RASTER) * K.RASTER;
  for (var v = start; v <= max; v += K.RASTER) {
    var nah = false;
    for (var i = 0; i < w.length; i++) if (Math.abs(w[i] - v) < K.RASTER * 0.55) { nah = true; break; }
    if (!nah) linien.push(v);
  }
  linien.sort(function (a, b) { return a - b; });
  return linien;
};

Kabelwege.prototype.knotenBei = function (x, y) {
  function naechster(liste, v) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < liste.length; i++) { var d = Math.abs(liste[i] - v); if (d < bd) { bd = d; best = i; } }
    return best;
  }
  return naechster(this.xs, x) * this.ny + naechster(this.ys, y);
};

// Alle Rasterknoten auf dem geraden Anfang eines Pins (außerhalb des Bauteils)
Kabelwege.prototype.stummelKnoten = function (info) {
  var liste = [], d = RICHTUNG[info.richtung];
  var ix = Math.floor(info.knoten / this.ny), iy = info.knoten % this.ny;
  // vom Ende zurück Richtung Bauteil, bis zur Kante des Abstandsbereichs
  while (ix >= 0 && iy >= 0 && ix < this.nx && iy < this.ny) {
    var x = this.xs[ix], y = this.ys[iy];
    var drin = x >= info.kante.x0 - 0.1 && x <= info.kante.x1 + 0.1 && y >= info.kante.y0 - 0.1 && y <= info.kante.y1 + 0.1;
    liste.push(ix * this.ny + iy);
    if (drin) break;
    ix -= d.x; iy -= d.y;
  }
  return liste;
};

Kabelwege.prototype._nachbar = function (k, r) {
  var ix = Math.floor(k / this.ny) + RICHTUNG[r].x, iy = k % this.ny + RICHTUNG[r].y;
  if (ix < 0 || iy < 0 || ix >= this.nx || iy >= this.ny) return -1;
  return ix * this.ny + iy;
};

Kabelwege.prototype._punkt = function (k) {
  return { x: this.xs[Math.floor(k / this.ny)], y: this.ys[k % this.ny] };
};

// Wegsuche (A*). Liefert die Liste der Rasterknoten oder null.
Kabelwege.prototype._suche = function (start, startRichtung, ziel, zielRichtung, erlaubt) {
  var K = KABELWEG, self = this;
  var n = this.nx * this.ny * 4;
  // Speicher nur einmal anlegen und wiederverwenden (schneller auf dem iPad).
  // "stempel" sagt, ob ein Eintrag aus dieser Suche stammt.
  if (!this._kosten || this._kosten.length !== n) {
    this._kosten = new Float64Array(n); this._vorher = new Int32Array(n);
    this._stempel = new Uint32Array(n); this._fertig = new Uint32Array(n); this._lauf = 0;
  }
  var lauf = ++this._lauf;
  var stempel = this._stempel, fertigStempel = this._fertig, kostenRoh = this._kosten, vorher = this._vorher;
  var kosten = {
    get: function (i) { return stempel[i] === lauf ? kostenRoh[i] : Infinity; },
    set: function (i, v, von) { stempel[i] = lauf; kostenRoh[i] = v; vorher[i] = von; }
  };
  var zp = this._punkt(ziel);
  function schaetzung(k) { var p = self._punkt(k); return Math.abs(p.x - zp.x) + Math.abs(p.y - zp.y); }

  var q = new Warteschlange();
  var s0 = start * 4 + startRichtung;
  kosten.set(s0, 0, -1); q.rein(s0, schaetzung(start));
  var gegenteil = function (r) { return (r + 2) % 4; };

  while (!q.leer()) {
    var zustand = q.raus();
    if (fertigStempel[zustand] === lauf) continue;
    fertigStempel[zustand] = lauf;
    var k = zustand >> 2, r = zustand & 3;
    if (k === ziel) return this._rueckweg(vorher, zustand);
    var p = this._punkt(k);
    for (var nr = 0; nr < 4; nr++) {
      if (nr === gegenteil(r)) continue;
      var nk = this._nachbar(k, nr);
      if (nk < 0 || this.gesperrt[nk]) continue;
      if (this.reserviert[nk] && !erlaubt[nk]) continue;
      var np = this._punkt(nk);
      var c = kosten.get(zustand) + Math.abs(np.x - p.x) + Math.abs(np.y - p.y);
      if (nr !== r) c += K.KNICK;
      // schon belegte Kante?
      var kante = this.kanten[Math.min(k, nk) + "-" + Math.max(k, nk)];
      if (kante && kante.length) c += K.KONFLIKT;
      // Knoten k: Kreuzung oder Berührung mit anderen Kabeln?
      if (k !== start && this.knoten[k]) {
        var knick = nr !== r;
        for (var bi = 0; bi < this.knoten[k].length; bi++) {
          var b = this.knoten[k][bi];
          if (knick || b.knick) c += K.KONFLIKT;
          else if ((nr % 2 === 0 && b.waag) || (nr % 2 === 1 && b.senk)) c += K.KONFLIKT;
          else c += K.KREUZUNG + (this.historie[k] || 0);
        }
      }
      // Am Ziel muss das Kabel in den geraden Anfang des Zielpins einbiegen
      if (nk === ziel && nr !== zielRichtung) c += K.KNICK;
      var nz = nk * 4 + nr;
      if (c < kosten.get(nz)) {
        kosten.set(nz, c, zustand);
        q.rein(nz, c + schaetzung(nk));
      }
    }
  }
  return null;
};

Kabelwege.prototype._rueckweg = function (vorher, zustand) {
  var liste = [];
  while (zustand >= 0) { liste.push(zustand >> 2); zustand = vorher[zustand]; }
  return liste.reverse();
};

// Legt ein Kabel. Gibt die Eckpunkte des Weges zurück (oder null).
Kabelwege.prototype.lege = function (id, a, b) {
  var pa = this.pins[a], pb = this.pins[b];
  if (!pa || !pb) return null;
  // Die eigenen Pin-Anfänge darf das Kabel benutzen
  var erlaubt = {};
  this.stummelKnoten(pa).forEach(function (k) { erlaubt[k] = true; });
  this.stummelKnoten(pb).forEach(function (k) { erlaubt[k] = true; });
  var zielRichtung = (pb.richtung + 2) % 4;
  var weg = pa.knoten === pb.knoten ? [pa.knoten] : this._suche(pa.knoten, pa.richtung, pb.knoten, zielRichtung, erlaubt);
  if (!weg) return null;
  return this._registriere(id, weg, a, b);
};

// Merkt sich, welche Rasterkanten und -knoten das Kabel belegt,
// und zählt Kreuzungen und Überlappungen mit anderen Kabeln.
Kabelwege.prototype._registriere = function (id, weg, a, b) {
  var self = this;
  var bel = { weg: weg, a: a, b: b, kanten: [], knoten: [], kreuzt: [], kreuzKnoten: [], konflikte: 0 };
  // Jede Kante und jeder Knoten merkt sich ALLE Kabel, die dort liegen
  // (auch bei Kreuzungen), damit beim Neu-Legen nichts übersehen wird.
  for (var i = 0; i < weg.length; i++) {
    var k = weg[i];
    if (i > 0) {
      var kk = Math.min(weg[i - 1], k) + "-" + Math.max(weg[i - 1], k);
      var liste = this.kanten[kk] = this.kanten[kk] || [];
      if (liste.some(function (x) { return x !== id; })) bel.konflikte++;
      if (liste.indexOf(id) < 0) { liste.push(id); bel.kanten.push(kk); }
    }
    if (i > 0 && i < weg.length - 1) {
      var p0 = this._punkt(weg[i - 1]), p1 = this._punkt(k), p2 = this._punkt(weg[i + 1]);
      var rein = p1.x !== p0.x ? "waag" : "senk", raus = p2.x !== p1.x ? "waag" : "senk";
      var eintraege = this.knoten[k] = this.knoten[k] || [];
      eintraege.forEach(function (v) {
        if (v.id === id) return;
        if (rein === raus && !v.knick && !(rein === "waag" ? v.waag : v.senk)) { bel.kreuzt.push(v.id); bel.kreuzKnoten.push(k); }
        else bel.konflikte++;
      });
      eintraege.push({ id: id, knick: rein !== raus, waag: rein === "waag" || raus === "waag", senk: rein === "senk" || raus === "senk" });
      bel.knoten.push(k);
    }
  }
  var pa = this.pins[a], pb = this.pins[b];
  var punkte = [pa.pos];
  weg.forEach(function (k) { punkte.push(self._punkt(k)); });
  punkte.push(pb.pos);
  bel.punkte = Kabelwege.vereinfache(punkte);
  this.belegung[id] = bel;
  return bel.punkte;
};

Kabelwege.prototype.entferne = function (id) {
  var bel = this.belegung[id], self = this;
  if (!bel) return;
  bel.kanten.forEach(function (k) {
    var l = (self.kanten[k] || []).filter(function (x) { return x !== id; });
    if (l.length) self.kanten[k] = l; else delete self.kanten[k];
  });
  bel.knoten.forEach(function (k) {
    var l = (self.knoten[k] || []).filter(function (v) { return v.id !== id; });
    if (l.length) self.knoten[k] = l; else delete self.knoten[k];
  });
  delete this.belegung[id];
  Object.keys(this.belegung).forEach(function (andere) {
    self.belegung[andere].kreuzt = self.belegung[andere].kreuzt.filter(function (x) { return x !== id; });
  });
};

// Wie "schlecht" liegt ein Kabel? (Kreuzungen, Überlappungen zählen stark)
Kabelwege.prototype.probleme = function (id) {
  var bel = this.belegung[id], self = this;
  if (!bel) return 0;
  var n = bel.kreuzt.length + bel.konflikte * 10;
  Object.keys(this.belegung).forEach(function (andere) {
    if (andere !== id) n += self.belegung[andere].kreuzt.filter(function (x) { return x === id; }).length;
  });
  return n;
};

// Kabel mit Kreuzungen herausnehmen und neu legen, solange es besser wird.
// Kabel mit Kreuzungen herausnehmen und neu legen. Stellen, an denen es
// immer wieder kreuzt, werden von Runde zu Runde "teurer", bis die Kabel
// sich anders verteilen ("Verhandeln"). Am Ende gilt die beste Runde.
function jetzt() { return (window.performance && performance.now) ? performance.now() : Date.now(); }

Kabelwege.prototype.verbessere = function (runden, frist) {
  var self = this;
  if (this.gesamtProbleme() === 0) return;
  frist = frist || (jetzt() + KABELWEG.ZEIT);
  var bestes = this._sichern(), besterWert = this.bewertung();
  for (var runde = 0; runde < (runden || 5); runde++) {
    Object.keys(this.belegung).forEach(function (id) {
      self.belegung[id].kreuzKnoten.forEach(function (k) {
        self.historie[k] = (self.historie[k] || 0) + KABELWEG.KREUZUNG;
      });
    });
    var ids = Object.keys(this.belegung).filter(function (id) { return self.probleme(id) > 0; });
    ids.sort(function (x, y) { return self.probleme(y) - self.probleme(x); });
    ids.forEach(function (id) {
      var alt = self.belegung[id];
      if (!alt || jetzt() > frist) return;
      self.entferne(id);
      if (!self.lege(id, alt.a, alt.b)) self._registriere(id, alt.weg, alt.a, alt.b);
    });
    var wert = this.bewertung();
    if (wert < besterWert) { bestes = this._sichern(); besterWert = wert; }
    if (this.gesamtProbleme() === 0 || jetzt() > frist) break;
  }
  this.historie = {};
  this._laden(bestes);
};

// Summe aller Probleme (Kreuzungen + Überlappungen) auf dem Brett
Kabelwege.prototype.gesamtProbleme = function () {
  var self = this, n = 0;
  Object.keys(this.belegung).forEach(function (id) {
    n += self.belegung[id].kreuzt.length + self.belegung[id].konflikte * 10;
  });
  return n;
};

// Gesamtbewertung: Kreuzungen/Überlappungen zählen am meisten,
// danach Knicke und Länge.
Kabelwege.prototype.bewertung = function () {
  var self = this, wert = this.gesamtProbleme() * 100000;
  Object.keys(this.belegung).forEach(function (id) {
    var pk = self.belegung[id].punkte;
    wert += (pk.length - 2) * KABELWEG.KNICK;
    for (var i = 1; i < pk.length; i++) wert += Math.abs(pk[i].x - pk[i - 1].x) + Math.abs(pk[i].y - pk[i - 1].y);
  });
  return wert;
};

Kabelwege.prototype._sichern = function () {
  var self = this;
  return Object.keys(this.belegung).map(function (id) {
    var b = self.belegung[id];
    return { id: id, a: b.a, b: b.b, weg: b.weg };
  });
};

Kabelwege.prototype._laden = function (liste) {
  var self = this;
  Object.keys(this.belegung).forEach(function (id) { self.entferne(id); });
  liste.forEach(function (k) { self._registriere(k.id, k.weg, k.a, k.b); });
};

// Bleiben Kreuzungen übrig: alle Kabel in verschiedenen Reihenfolgen neu
// legen und das beste Ergebnis übernehmen (nur wenn es besser ist).
Kabelwege.prototype.neuOrdnen = function (frist) {
  var self = this;
  if (this.gesamtProbleme() === 0) return;
  frist = frist || (jetzt() + KABELWEG.ZEIT);
  var start = this._sichern();
  var bestes = start, besterWert = this.bewertung();
  var kurz = this.sortiere(start);
  var problemZuerst = start.filter(function (k) { return self.probleme(k.id) > 0; })
    .concat(kurz.filter(function (k) { return self.probleme(k.id) === 0; }));
  [kurz, kurz.slice().reverse(), problemZuerst].forEach(function (reihenfolge) {
    if ((self.gesamtProbleme() === 0 && bestes !== start) || jetzt() > frist) return;   // fertig oder keine Zeit mehr
    Object.keys(self.belegung).forEach(function (id) { self.entferne(id); });
    reihenfolge.forEach(function (k) { self.lege(k.id, k.a, k.b); });
    self.verbessere(2, frist);
    var vollstaendig = reihenfolge.every(function (k) { return self.belegung[k.id]; });
    var wert = self.bewertung();
    if (vollstaendig && wert < besterWert) { bestes = self._sichern(); besterWert = wert; }
  });
  this._laden(bestes);
};

// Kurze Kabel zuerst legen: das ergibt meist weniger Kreuzungen.
Kabelwege.prototype.sortiere = function (kabel) {
  var self = this;
  function laenge(k) {
    var a = self.pins[k.a], b = self.pins[k.b];
    if (!a || !b) return 0;
    return Math.abs(a.pos.x - b.pos.x) + Math.abs(a.pos.y - b.pos.y);
  }
  return kabel.slice().sort(function (x, y) { return laenge(x) - laenge(y); });
};

// Punkte auf einer geraden Linie zusammenfassen
Kabelwege.vereinfache = function (punkte) {
  var aus = [];
  punkte.forEach(function (p) {
    var n = aus.length;
    if (n && Math.abs(aus[n - 1].x - p.x) < 0.01 && Math.abs(aus[n - 1].y - p.y) < 0.01) return;
    if (n >= 2) {
      var a = aus[n - 2], b = aus[n - 1];
      var gerade = (Math.abs(a.x - b.x) < 0.01 && Math.abs(b.x - p.x) < 0.01) ||
                   (Math.abs(a.y - b.y) < 0.01 && Math.abs(b.y - p.y) < 0.01);
      if (gerade) { aus[n - 1] = p; return; }
    }
    aus.push(p);
  });
  return aus;
};

// SVG-Pfad mit leicht abgerundeten Ecken + Mittelpunkt (für Markierungen)
Kabelwege.pfad = function (punkte) {
  var d = "M" + punkte[0].x + " " + punkte[0].y;
  for (var i = 1; i < punkte.length; i++) {
    var p = punkte[i];
    if (i < punkte.length - 1) {
      var a = punkte[i - 1], c = punkte[i + 1];
      var l1 = Math.hypot(p.x - a.x, p.y - a.y), l2 = Math.hypot(c.x - p.x, c.y - p.y);
      var r = Math.min(7, l1 / 2, l2 / 2);
      var e1 = { x: p.x - (p.x - a.x) / (l1 || 1) * r, y: p.y - (p.y - a.y) / (l1 || 1) * r };
      var e2 = { x: p.x + (c.x - p.x) / (l2 || 1) * r, y: p.y + (c.y - p.y) / (l2 || 1) * r };
      d += " L" + e1.x + " " + e1.y + " Q" + p.x + " " + p.y + " " + e2.x + " " + e2.y;
    } else {
      d += " L" + p.x + " " + p.y;
    }
  }
  // Mittelpunkt entlang der Länge
  var laenge = 0, teile = [];
  for (var j = 1; j < punkte.length; j++) {
    var l = Math.hypot(punkte[j].x - punkte[j - 1].x, punkte[j].y - punkte[j - 1].y);
    teile.push(l); laenge += l;
  }
  var rest = laenge / 2, mitte = punkte[0];
  for (var m = 1; m < punkte.length; m++) {
    if (rest <= teile[m - 1]) {
      var t = teile[m - 1] ? rest / teile[m - 1] : 0;
      mitte = { x: punkte[m - 1].x + (punkte[m].x - punkte[m - 1].x) * t, y: punkte[m - 1].y + (punkte[m].y - punkte[m - 1].y) * t };
      break;
    }
    rest -= teile[m - 1];
  }
  return { d: d, mitte: mitte };
};
