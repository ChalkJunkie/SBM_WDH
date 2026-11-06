// =====================================================================
// data/pins.js – Lage der Anschlüsse (Pins) auf den Bauteilbildern
// ---------------------------------------------------------------------
// x / y = Position in Pixeln im ORIGINALBILD (links oben = 0 / 0).
// Diese Datei erzeugst du am bequemsten mit kalibrieren.html:
// dort "Kopieren" drücken und den GESAMTEN Inhalt dieser Datei ersetzen.
//
// Felder je Pin:
//   id        interner Name (nicht ändern, wird in aufgaben.js benutzt)
//   name      Anzeigename im Spiel
//   art       "digital", "analog", "gnd", "plus", "buchse", "klemme"
//   pwm       true = Pin mit ~ (PWM)
//   belegbar  false = sichtbar, aber es darf kein Kabel dran
//   farbe     Kabelfarbe des Bauteilkabels (für die Kabel-Automatik)
//   ausgang   (freiwillig) "oben", "unten", "links" oder "rechts": in diese
//             Richtung (im Originalbild) verlässt das Kabel den Pin. Ohne
//             Angabe: zur nächsten Bildkante.
// =====================================================================
DATEN.pins = {
  "arduino": {
    "name": "Arduino",
    "bild": "assets/Arduino.png",
    "breite": 702,
    "hoehe": 500,
    "pins": [
      {"id": "SCL", "name": "SCL", "x": 234, "y": 24, "belegbar": false},
      {"id": "SDA", "name": "SDA", "x": 258, "y": 24, "belegbar": false},
      {"id": "AREF", "name": "AREF", "x": 281, "y": 24, "belegbar": false},
      {"id": "GND_OBEN", "name": "GND", "x": 305, "y": 24, "art": "gnd"},
      {"id": "D13", "name": "13", "x": 329, "y": 24, "art": "digital"},
      {"id": "D12", "name": "12", "x": 353, "y": 24, "art": "digital"},
      {"id": "D11", "name": "~11", "x": 377, "y": 24, "art": "digital", "pwm": true},
      {"id": "D10", "name": "~10", "x": 400, "y": 24, "art": "digital", "pwm": true},
      {"id": "D9", "name": "~9", "x": 424, "y": 24, "art": "digital", "pwm": true},
      {"id": "D8", "name": "8", "x": 448, "y": 24, "art": "digital"},
      {"id": "D7", "name": "7", "x": 486, "y": 24, "art": "digital"},
      {"id": "D6", "name": "~6", "x": 510, "y": 24, "art": "digital", "pwm": true},
      {"id": "D5", "name": "~5", "x": 534, "y": 24, "art": "digital", "pwm": true},
      {"id": "D4", "name": "4", "x": 557, "y": 24, "art": "digital"},
      {"id": "D3", "name": "~3", "x": 581, "y": 24, "art": "digital", "pwm": true},
      {"id": "D2", "name": "2", "x": 605, "y": 24, "art": "digital"},
      {"id": "D1", "name": "1 (TX)", "x": 629, "y": 24, "art": "digital"},
      {"id": "D0", "name": "0 (RX)", "x": 653, "y": 24, "art": "digital"},
      {"id": "NC", "name": "ohne Beschriftung", "x": 320, "y": 476, "belegbar": false},
      {"id": "IOREF", "name": "IOREF", "x": 343, "y": 476, "belegbar": false},
      {"id": "RESET", "name": "RESET", "x": 367, "y": 476, "belegbar": false},
      {"id": "3V3", "name": "3V3", "x": 391, "y": 476, "art": "plus"},
      {"id": "5V", "name": "5V", "x": 415, "y": 476, "art": "plus"},
      {"id": "GND_1", "name": "GND", "x": 439, "y": 476, "art": "gnd"},
      {"id": "GND_2", "name": "GND", "x": 462, "y": 476, "art": "gnd"},
      {"id": "VIN", "name": "VIN", "x": 486, "y": 476, "art": "plus"},
      {"id": "A0", "name": "A0", "x": 534, "y": 476, "art": "analog"},
      {"id": "A1", "name": "A1", "x": 557, "y": 476, "art": "analog"},
      {"id": "A2", "name": "A2", "x": 581, "y": 476, "art": "analog"},
      {"id": "A3", "name": "A3", "x": 605, "y": 476, "art": "analog"},
      {"id": "A4", "name": "A4", "x": 629, "y": 476, "art": "analog"},
      {"id": "A5", "name": "A5", "x": 653, "y": 476, "art": "analog"},
      {"id": "BUCHSE", "name": "Strombuchse", "x": 52, "y": 427, "art": "buchse"}
    ]
  },
  "treiber": {
    "name": "Motortreiber",
    "bild": "assets/Motortreiber-L298N.png",
    "breite": 427,
    "hoehe": 412,
    "pins": [
      {"id": "MB1", "name": "Motor B (1)", "x": 267, "y": 22, "art": "klemme"},
      {"id": "MB2", "name": "Motor B (2)", "x": 302, "y": 22, "art": "klemme"},
      {"id": "MA1", "name": "Motor A (1)", "x": 271, "y": 387, "art": "klemme"},
      {"id": "MA2", "name": "Motor A (2)", "x": 306, "y": 387, "art": "klemme"},
      {"id": "P5V", "name": "+5V", "x": 400, "y": 240, "art": "klemme"},
      {"id": "GND", "name": "GND", "x": 400, "y": 277, "art": "klemme"},
      {"id": "P12V", "name": "+12V", "x": 400, "y": 315, "art": "klemme"},
      {"id": "ENB", "name": "ENB", "x": 400, "y": 58},
      {"id": "IN4", "name": "IN4", "x": 400, "y": 85},
      {"id": "IN3", "name": "IN3", "x": 400, "y": 111},
      {"id": "IN2", "name": "IN2", "x": 400, "y": 138},
      {"id": "IN1", "name": "IN1", "x": 400, "y": 164},
      {"id": "ENA", "name": "ENA", "x": 400, "y": 190},
      {"id": "V5_B", "name": "5V+ (bei ENB)", "x": 376, "y": 58, "belegbar": false},
      {"id": "V5_A", "name": "5V+ (bei ENA)", "x": 376, "y": 190, "belegbar": false}
    ]
  },
  "servo": {
    "name": "Servo",
    "bild": "assets/Servo.png",
    "breite": 724,
    "hoehe": 219,
    "pins": [
      {"id": "orange", "name": "oranges Kabel", "x": 10, "y": 80, "farbe": "#f08a1c"},
      {"id": "rot", "name": "rotes Kabel", "x": 10, "y": 109, "farbe": "#d01010"},
      {"id": "braun", "name": "braunes Kabel", "x": 10, "y": 142, "farbe": "#7a3a0a"}
    ]
  },
  "motor": {
    "name": "DC-Motor",
    "bild": "assets/DC-Motor.png",
    "breite": 403,
    "hoehe": 185,
    "pins": [
      {"id": "gruen", "name": "grünes Kabel", "x": 8, "y": 83, "farbe": "#2fae4c"},
      {"id": "gelb", "name": "gelbes Kabel", "x": 8, "y": 110, "farbe": "#e8c400"}
    ]
  },
  "taster": {
    "name": "Taster",
    "bild": "assets/Taster_neu.png",
    "breite": 153,
    "hoehe": 250,
    "pins": [
      {"id": "schwarz", "name": "schwarzes Kabel", "x": 57, "y": 226, "farbe": "#222222"},
      {"id": "rot", "name": "rotes Kabel", "x": 84, "y": 226, "farbe": "#d01010"}
    ]
  },
  "batterie": {
    "name": "9-V-Batterie",
    "bild": "assets/9V-Batterie.png",
    "breite": 337,
    "hoehe": 502,
    "pins": [
      {"id": "stecker", "name": "Batterie (Adapter)", "x": 322, "y": 46}
    ]
  }
};
