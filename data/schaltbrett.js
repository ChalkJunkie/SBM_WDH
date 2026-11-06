// =====================================================================
// data/schaltbrett.js – Wo liegt welches Bauteil auf dem Schaltbrett?
// ---------------------------------------------------------------------
// x / y     linke obere Ecke des Bauteils auf dem Brett
// skala     Größe (1 = Originalgröße des Bildes)
// drehung   0, 90, 180 oder 270 (Grad im Uhrzeigersinn)
// spiegeln  true = Bild links/rechts gespiegelt
// Der Motor ist so groß und so hoch gesetzt, dass seine beiden Kabelenden
// genau auf Höhe der Schrauben von Klemme B liegen (gerade Kabel).
// In jeder Aufgabe werden nur die Bauteile gezeigt, die sie braucht,
// die Lage bleibt aber immer gleich.
// =====================================================================
DATEN.schaltbrett = {
  "arduino":  { "x": 480,  "y": 640, "skala": 1,    "drehung": 0,  "spiegeln": false },
  "treiber":  { "x": 660,  "y": 20,  "skala": 1,    "drehung": 90, "spiegeln": false },
  "motor":    { "x": 1150, "y": 179.4, "skala": 1.2963, "drehung": 0,  "spiegeln": false },
  "batterie": { "x": 160,  "y": 820, "skala": 0.5,  "drehung": 0,  "spiegeln": false },
  "servo":    { "x": 20,   "y": 400, "skala": 0.75, "drehung": 0,  "spiegeln": true  },
  "taster":   { "x": 1300, "y": 480, "skala": 0.7,  "drehung": 0,  "spiegeln": false },
  "breadboard": { "x": 660, "y": 60, "skala": 1,  "drehung": 0,  "spiegeln": false }
};
