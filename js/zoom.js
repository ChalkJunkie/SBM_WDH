// =====================================================================
// js/zoom.js – Zoomen, Verschieben und Antippen auf einer SVG-Fläche
// ---------------------------------------------------------------------
// Bedienung:
//   - ein Finger / Stift antippen      -> "beimAntippen" wird aufgerufen
//   - ein Finger ziehen                -> Brett verschieben
//   - zwei Finger auseinander/zusammen -> zoomen
//   - Mausrad (am Computer)            -> zoomen
// Die sichtbare Fläche wird über die viewBox der SVG gesteuert.
// =====================================================================

function ZoomFlaeche(svg, optionen) {
  this.svg = svg;
  this.beimAntippen = optionen.beimAntippen || function () {};
  // Optional: liefert für einen Startpunkt ein "greifbares" Objekt
  // { bewege(dx, dy), loslassen(gezogen) } oder null (dann wird das Brett verschoben).
  this.objektGreifen = optionen.objektGreifen || null;
  this.minBreite = optionen.minBreite || 120;     // stärkster Zoom
  this.maxBreite = optionen.maxBreite || 4000;    // weitester Zoom
  this.ansicht = { x: 0, y: 0, b: 1000, h: 700 }; // aktuelle viewBox
  this.zeiger = {};                               // aktive Finger
  this.inhalt = { x: 0, y: 0, b: 1000, h: 700 };  // Fläche für "alles zeigen"
  this._verbinde();
}

// Ab wie vielen Bildschirm-Pixeln Bewegung ein "Ziehen" statt "Tippen" ist.
ZoomFlaeche.ZIEH_SCHWELLE = 10;

// Legt fest, was "Alles zeigen" anzeigt, und zeigt es an.
ZoomFlaeche.prototype.setzeInhalt = function (x, y, b, h) {
  this.inhalt = { x: x, y: y, b: b, h: h };
  this.allesZeigen();
};

ZoomFlaeche.prototype.allesZeigen = function () {
  var r = this.svg.getBoundingClientRect();
  var seiten = (r.width || 1) / (r.height || 1);
  var i = this.inhalt;
  // Seitenverhältnis an den Bildschirm anpassen, Inhalt mittig
  var b = i.b, h = i.h;
  if (b / h < seiten) b = h * seiten; else h = b / seiten;
  this.ansicht = { x: i.x - (b - i.b) / 2, y: i.y - (h - i.h) / 2, b: b, h: h };
  this._anwenden();
};

// Bei Größenänderung (z. B. iPad gedreht) Seitenverhältnis nachführen.
ZoomFlaeche.prototype.groesseGeaendert = function () {
  var r = this.svg.getBoundingClientRect();
  if (!r.width || !r.height) return;
  var mitteX = this.ansicht.x + this.ansicht.b / 2;
  var mitteY = this.ansicht.y + this.ansicht.h / 2;
  var b = this.ansicht.b, h = b * r.height / r.width;
  this.ansicht = { x: mitteX - b / 2, y: mitteY - h / 2, b: b, h: h };
  this._anwenden();
};

// faktor > 1 vergrößert. Ohne Bildschirmpunkt wird um die Mitte gezoomt.
ZoomFlaeche.prototype.zoomen = function (faktor, clientX, clientY) {
  var r = this.svg.getBoundingClientRect();
  if (clientX === undefined) { clientX = r.left + r.width / 2; clientY = r.top + r.height / 2; }
  var p = this.clientZuBrett(clientX, clientY);
  var neuB = this.ansicht.b / faktor;
  neuB = Math.max(this.minBreite, Math.min(this.maxBreite, neuB));
  var f = neuB / this.ansicht.b;
  this.ansicht = {
    x: p.x - (p.x - this.ansicht.x) * f,
    y: p.y - (p.y - this.ansicht.y) * f,
    b: neuB,
    h: this.ansicht.h * f
  };
  this._anwenden();
};

// Zeigt einen Bereich des Bretts (z. B. um einen Fehler zu zeigen).
ZoomFlaeche.prototype.zeigeBereich = function (x, y, b, h) {
  var alt = this.inhalt;
  this.inhalt = { x: x, y: y, b: b, h: h };
  this.allesZeigen();
  this.inhalt = alt;
};

// Bildschirmkoordinaten -> Brettkoordinaten
ZoomFlaeche.prototype.clientZuBrett = function (cx, cy) {
  var pt = this.svg.createSVGPoint();
  pt.x = cx; pt.y = cy;
  var m = this.svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  var q = pt.matrixTransform(m.inverse());
  return { x: q.x, y: q.y };
};

// Brettkoordinaten -> Bildschirmkoordinaten
ZoomFlaeche.prototype.brettZuClient = function (x, y) {
  var pt = this.svg.createSVGPoint();
  pt.x = x; pt.y = y;
  var m = this.svg.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  var q = pt.matrixTransform(m);
  return { x: q.x, y: q.y };
};

// Wie viele Bildschirm-Pixel ist eine Brett-Einheit gerade groß?
ZoomFlaeche.prototype.massstab = function () {
  var r = this.svg.getBoundingClientRect();
  return r.width / this.ansicht.b;
};

ZoomFlaeche.prototype._anwenden = function () {
  var a = this.ansicht;
  this.svg.setAttribute("viewBox", a.x + " " + a.y + " " + a.b + " " + a.h);
  if (this.beimZoom) this.beimZoom();
};

// ---------- Finger, Stift und Maus ----------
ZoomFlaeche.prototype._verbinde = function () {
  var self = this, svg = this.svg;

  svg.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    try { svg.setPointerCapture(e.pointerId); } catch (x) { /* egal */ }
    self.zeiger[e.pointerId] = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY };
    var ids = Object.keys(self.zeiger);
    if (ids.length === 1) {
      self.geste = {
        art: "tippen", ziel: e.target, typ: e.pointerType,
        ansicht: { x: self.ansicht.x, y: self.ansicht.y, b: self.ansicht.b, h: self.ansicht.h },
        objekt: self.objektGreifen ? self.objektGreifen(e.clientX, e.clientY, e.target) : null
      };
    } else if (ids.length === 2) {
      if (self.geste && self.geste.objekt) self.geste.objekt.loslassen(false);
      var a = self.zeiger[ids[0]], b = self.zeiger[ids[1]];
      self.geste = {
        art: "kneifen",
        abstand: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mitte: self.clientZuBrett((a.x + b.x) / 2, (a.y + b.y) / 2),
        ansicht: { x: self.ansicht.x, y: self.ansicht.y, b: self.ansicht.b, h: self.ansicht.h }
      };
    }
    e.preventDefault();
  });

  svg.addEventListener("pointermove", function (e) {
    var z = self.zeiger[e.pointerId];
    if (!z || !self.geste) return;
    z.x = e.clientX; z.y = e.clientY;
    var g = self.geste, ids = Object.keys(self.zeiger);

    if (g.art === "tippen" || g.art === "ziehen") {
      var dx = z.x - z.startX, dy = z.y - z.startY;
      if (g.art === "tippen" && Math.hypot(dx, dy) > ZoomFlaeche.ZIEH_SCHWELLE) g.art = "ziehen";
      if (g.art === "ziehen" && g.objekt) {
        // Bauteil verschieben statt Brett
        var mo = g.ansicht.b / svg.getBoundingClientRect().width;
        g.objekt.bewege(dx * mo, dy * mo);
      } else if (g.art === "ziehen") {
        var m = g.ansicht.b / svg.getBoundingClientRect().width;
        self.ansicht.x = g.ansicht.x - dx * m;
        self.ansicht.y = g.ansicht.y - dy * m;
        self._anwenden();
      }
    } else if (g.art === "kneifen" && ids.length >= 2) {
      var a = self.zeiger[ids[0]], b = self.zeiger[ids[1]];
      var abstand = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      var neuB = g.ansicht.b * g.abstand / abstand;
      neuB = Math.max(self.minBreite, Math.min(self.maxBreite, neuB));
      var f = neuB / g.ansicht.b;
      // Der Brettpunkt unter der Fingermitte soll unter der Fingermitte bleiben
      var r = svg.getBoundingClientRect();
      var mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      var m2 = neuB / r.width;
      self.ansicht = { x: g.mitte.x - mx * m2, y: g.mitte.y - my * m2, b: neuB, h: g.ansicht.h * f };
      self._anwenden();
    }
    e.preventDefault();
  });

  function ende(e) {
    var z = self.zeiger[e.pointerId];
    if (!z) return;
    delete self.zeiger[e.pointerId];
    var g = self.geste;
    if (g && g.objekt) g.objekt.loslassen(g.art === "ziehen" && e.type === "pointerup");
    if (g && g.art === "tippen" && e.type === "pointerup") {
      self.beimAntippen(e.clientX, e.clientY, g.typ, g.ziel);
    }
    var rest = Object.keys(self.zeiger);
    if (rest.length === 0) {
      self.geste = null;
    } else if (g && g.art === "kneifen") {
      // Nach dem Kneifen nicht versehentlich tippen: restlichen Finger als "ziehen" weiterführen
      var r = self.zeiger[rest[0]];
      r.startX = r.x; r.startY = r.y;
      self.geste = { art: "ziehen", ansicht: { x: self.ansicht.x, y: self.ansicht.y, b: self.ansicht.b, h: self.ansicht.h } };
    }
  }
  svg.addEventListener("pointerup", ende);
  svg.addEventListener("pointercancel", ende);

  svg.addEventListener("wheel", function (e) {
    e.preventDefault();
    self.zoomen(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
  }, { passive: false });

  // Keinen zusätzlichen Klick nach dem Antippen erzeugen lassen
  svg.addEventListener("touchend", function (e) { e.preventDefault(); }, { passive: false });

  // Safari: eigenes Seiten-Zoomen auf dem Brett verhindern
  svg.addEventListener("gesturestart", function (e) { e.preventDefault(); });
  svg.addEventListener("gesturechange", function (e) { e.preventDefault(); });
};
