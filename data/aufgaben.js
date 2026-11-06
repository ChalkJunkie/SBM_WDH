// =====================================================================
// data/aufgaben.js – Level 1: Verdrahtungsaufgaben
// ---------------------------------------------------------------------
// So liest du die Anschluss-Angaben:
//   "servo.rot"        = genau dieser Anschluss (Bauteil.Pin, siehe pins.js)
//   "arduino:gnd"      = irgendein GND-Pin des Arduino
//   "arduino:signal"   = ein Digitalpin 2 bis 13
//   "arduino:pwm"      = ein Digitalpin mit ~ (3, 5, 6, 9, 10, 11)
//   "arduino:plus"     = 3V3, 5V oder VIN
//   "arduino:analog"   = A0 bis A5
//   "treiber:alle"     = irgendein Anschluss des Motortreibers
//
// BAUSTEINE sind Teil-Schaltungen (z. B. "servo"), die mehrere Aufgaben
// gemeinsam benutzen. Jede ANFORDERUNG beschreibt ein Kabel:
//   id       Name der Anforderung (für Sonderregeln)
//   von      Anschluss am Bauteil, an dem das Kabel stecken muss
//   zu       wohin das andere Ende gehört (eine Angabe oder eine Liste)
//   verboten Anschlüsse, die zwar zu "zu" passen, hier aber falsch sind
//   fehlt    Hinweis (aus hinweise.js), wenn an "von" gar kein Kabel steckt
//   falsch   Hinweis, wenn das Kabel woanders steckt
//   typisch  besondere Hinweise für typische Fehler (werden zuerst geprüft)
//
// Ein Baustein kann VARIANTEN haben (z. B. Motor an Klemme B oder A).
// Das Spiel nimmt die Variante, die am besten zur Verkabelung passt.
//   fremd    Pins, die zur anderen Variante gehören, und der Hinweis,
//            wenn dort trotzdem ein Kabel steckt ("gemischt").
//
// Die Hinweistexte selbst stehen in hinweise.js.
// =====================================================================
DATEN.bausteine = {

  // ------------------------------------------------------------------
  "servo": {
    "anforderungen": [
      {
        "id": "servo_plus",
        "von": "servo.rot",
        "zu": "arduino.3V3",
        "fehlt": "servo_rot_fehlt",
        "falsch": "servo_rot_falsch",
        "typisch": [
          { "zu": "arduino.5V",  "hinweis": "servo_rot_5v" },
          { "zu": "arduino:gnd", "hinweis": "servo_rot_gnd" }
        ]
      },
      {
        "id": "servo_gnd",
        "von": "servo.braun",
        "zu": "arduino:gnd",
        "fehlt": "servo_braun_fehlt",
        "falsch": "servo_braun_falsch",
        "typisch": [
          { "zu": "arduino:plus", "hinweis": "servo_braun_plus" },
          { "zu": "treiber.GND",  "hinweis": "servo_gnd_treiber" }
        ]
      },
      {
        "id": "servo_signal",
        "von": "servo.orange",
        "zu": "arduino:signal",
        "fehlt": "servo_orange_fehlt",
        "falsch": "servo_orange_falsch",
        "typisch": [
          { "zu": ["arduino.D3", "arduino.D11"], "hinweis": "servo_pin_3_11" }
        ]
      }
    ]
  },

  // ------------------------------------------------------------------
  // Zweibeiniger Taster mit INPUT_PULLUP: Rot an einen Pin, Schwarz an GND
  "taster": {
    "anforderungen": [
      {
        "id": "taster_pin",
        "von": "taster.rot",
        "zu": "arduino:signal",
        "fehlt": "taster_rot_fehlt",
        "falsch": "taster_rot_falsch",
        "typisch": [
          { "zu": "arduino:gnd", "hinweis": "taster_rot_gnd" }
        ]
      },
      {
        "id": "taster_gnd",
        "von": "taster.schwarz",
        "zu": "arduino:gnd",
        "fehlt": "taster_schwarz_fehlt",
        "falsch": "taster_schwarz_falsch",
        "typisch": [
          { "zu": ["arduino:digital", "arduino:analog"], "hinweis": "taster_schwarz_pin" },
          { "zu": "arduino:plus", "hinweis": "taster_schwarz_plus" },
          { "zu": "treiber.GND",  "hinweis": "taster_gnd_treiber" }
        ]
      }
    ]
  },

  // ------------------------------------------------------------------
  // DC-Motor mit Motortreiber L298N und 9-V-Batterie
  "motor_l298n": {
    "varianten": [
      {
        "name": "Motor an Klemme B (ENB, IN3, IN4)",
        "anforderungen": [
          {
            "id": "batterie",
            "von": "batterie.stecker",
            "zu": "arduino.BUCHSE",
            "fehlt": "batterie_fehlt",
            "falsch": "batterie_falsch",
            "typisch": [ { "zu": "treiber:alle", "hinweis": "batterie_an_treiber" } ]
          },
          {
            "id": "treiber_strom",
            "von": "treiber.P12V",
            "zu": "arduino.VIN",
            "fehlt": "treiber_12v_fehlt",
            "falsch": "treiber_12v_falsch"
          },
          {
            "id": "treiber_gnd",
            "von": "treiber.GND",
            "zu": "arduino:gnd",
            "fehlt": "treiber_gnd_fehlt",
            "falsch": "treiber_gnd_falsch"
          },
          {
            "id": "motor_enable",
            "von": "treiber.ENB",
            "zu": "arduino:pwm",
            "fehlt": "enable_fehlt",
            "falsch": "enable_kein_pwm",
            "typisch": [ { "zu": ["arduino:gnd", "arduino:plus"], "hinweis": "enable_an_versorgung" } ]
          },
          {
            "id": "motor_in_a",
            "von": "treiber.IN3",
            "zu": "arduino:signal",
            "fehlt": "in_fehlt",
            "falsch": "in_falsch"
          },
          {
            "id": "motor_in_b",
            "von": "treiber.IN4",
            "zu": "arduino:signal",
            "fehlt": "in_fehlt",
            "falsch": "in_falsch"
          },
          {
            "id": "motor_kabel_1",
            "von": "motor.gruen",
            "zu": ["treiber.MB1", "treiber.MB2"],
            "fehlt": "motor_kabel_fehlt",
            "falsch": "motor_falsch",
            "typisch": [ { "zu": ["treiber.MA1", "treiber.MA2"], "hinweis": "motor_falsche_klemme_b" } ]
          },
          {
            "id": "motor_kabel_2",
            "von": "motor.gelb",
            "zu": ["treiber.MB1", "treiber.MB2"],
            "fehlt": "motor_kabel_fehlt",
            "falsch": "motor_falsch",
            "typisch": [ { "zu": ["treiber.MA1", "treiber.MA2"], "hinweis": "motor_falsche_klemme_b" } ]
          }
        ],
        "fremd": { "pins": ["treiber.ENA", "treiber.IN1", "treiber.IN2"], "hinweis": "gemischt_b" }
      },
      {
        "name": "Motor an Klemme A (ENA, IN1, IN2)",
        "anforderungen": [
          {
            "id": "batterie",
            "von": "batterie.stecker",
            "zu": "arduino.BUCHSE",
            "fehlt": "batterie_fehlt",
            "falsch": "batterie_falsch",
            "typisch": [ { "zu": "treiber:alle", "hinweis": "batterie_an_treiber" } ]
          },
          {
            "id": "treiber_strom",
            "von": "treiber.P12V",
            "zu": "arduino.VIN",
            "fehlt": "treiber_12v_fehlt",
            "falsch": "treiber_12v_falsch"
          },
          {
            "id": "treiber_gnd",
            "von": "treiber.GND",
            "zu": "arduino:gnd",
            "fehlt": "treiber_gnd_fehlt",
            "falsch": "treiber_gnd_falsch"
          },
          {
            "id": "motor_enable",
            "von": "treiber.ENA",
            "zu": "arduino:pwm",
            "fehlt": "enable_fehlt",
            "falsch": "enable_kein_pwm",
            "typisch": [ { "zu": ["arduino:gnd", "arduino:plus"], "hinweis": "enable_an_versorgung" } ]
          },
          {
            "id": "motor_in_a",
            "von": "treiber.IN1",
            "zu": "arduino:signal",
            "fehlt": "in_fehlt",
            "falsch": "in_falsch"
          },
          {
            "id": "motor_in_b",
            "von": "treiber.IN2",
            "zu": "arduino:signal",
            "fehlt": "in_fehlt",
            "falsch": "in_falsch"
          },
          {
            "id": "motor_kabel_1",
            "von": "motor.gruen",
            "zu": ["treiber.MA1", "treiber.MA2"],
            "fehlt": "motor_kabel_fehlt",
            "falsch": "motor_falsch",
            "typisch": [ { "zu": ["treiber.MB1", "treiber.MB2"], "hinweis": "motor_falsche_klemme_a" } ]
          },
          {
            "id": "motor_kabel_2",
            "von": "motor.gelb",
            "zu": ["treiber.MA1", "treiber.MA2"],
            "fehlt": "motor_kabel_fehlt",
            "falsch": "motor_falsch",
            "typisch": [ { "zu": ["treiber.MB1", "treiber.MB2"], "hinweis": "motor_falsche_klemme_a" } ]
          }
        ],
        "fremd": { "pins": ["treiber.ENB", "treiber.IN3", "treiber.IN4"], "hinweis": "gemischt_a" }
      }
    ]
  }
};

// Besondere Hinweise für Kabel, die zu keiner Anforderung gehören.
// a / b = die beiden Enden (Reihenfolge egal).
DATEN.kabelHinweise = [
  { "a": "arduino.VIN", "b": ["treiber.P5V", "treiber.GND", "treiber:alle"], "hinweis": "vin_falsche_klemme" },
  { "a": "treiber.P5V", "b": "arduino:alle", "hinweis": "treiber_5v_nicht_gebraucht" }
];

// ---------------------------------------------------------------------
// Die Aufgaben
//   bauteile      welche Bauteile auf dem Brett liegen
//   bausteine     welche Teil-Schaltungen geprüft werden
//   dokumente     das erste wird bei allgemeinen Hinweisen angezeigt
//   vorverkabelt  helle (pastellfarbene), gesperrte Kabel aus der vorherigen Aufgabe
//                 (mit "Alles selbst verkabeln" startet das Brett leer)
//   auftragSelbst Auftragstext, wenn "Alles selbst verkabeln" gewählt ist
//   sonderregeln  Hinweis (ℹ) statt Fehler für bestimmte Pins; die Aufgabe
//                 ist erst gelöst, wenn der Pin geändert wurde
// ---------------------------------------------------------------------
DATEN.aufgaben = [
  {
    "id": 1,
    "titel": "Servo am Arduino",
    "auftrag": "Schließe den Servo an den Arduino an. Für das Signal darfst du einen Digitalpin selbst wählen.",
    "bauteile": ["arduino", "servo"],
    "bausteine": ["servo"],
    "dokumente": ["Arbeitsblatt Servomotor", "Aufschrieb Servomotor"],
    "vorverkabelt": []
  },
  {
    "id": 2,
    "titel": "Servo und Taster",
    "auftrag": "Der Servo aus Aufgabe 1 ist schon angeschlossen (helle Kabel). Schließe zusätzlich den Taster so an, dass du ihn mit INPUT_PULLUP abfragen kannst.",
    "auftragSelbst": "Schließe den Servo und den Taster an den Arduino an. Der Taster soll mit INPUT_PULLUP abgefragt werden.",
    "bauteile": ["arduino", "servo", "taster"],
    "bausteine": ["servo", "taster"],
    "dokumente": ["Aufschrieb Taster", "Arbeitsblatt Taster Theorie", "Arbeitsblatt Taster Praxis"],
    "vorverkabelt": [
      ["servo.rot", "arduino.3V3"],
      ["servo.braun", "arduino.GND_1"],
      ["servo.orange", "arduino.D9"]
    ]
  },
  {
    "id": 3,
    "titel": "DC-Motor mit Motortreiber",
    "auftrag": "Schließe den DC-Motor über den Motortreiber an den Arduino an. Den Strom liefert die 9-V-Batterie. Welche Pins du für die Steuerung nimmst, darfst du selbst entscheiden.",
    "bauteile": ["arduino", "treiber", "motor", "batterie"],
    "bausteine": ["motor_l298n"],
    "dokumente": ["Arbeitsblatt DC-Motor Praxis", "Arbeitsblatt DC-Motor Theorie", "Aufschrieb Gleichstrommotor"],
    "vorverkabelt": []
  },
  {
    "id": 4,
    "titel": "DC-Motor und Taster",
    "auftrag": "Die Schaltung aus Aufgabe 3 ist schon gesteckt (helle Kabel). Schließe zusätzlich den Taster an einem freien Pin an.",
    "auftragSelbst": "Schließe den DC-Motor mit Motortreiber und 9-V-Batterie sowie den Taster (INPUT_PULLUP) an den Arduino an.",
    "bauteile": ["arduino", "treiber", "motor", "batterie", "taster"],
    "bausteine": ["motor_l298n", "taster"],
    "dokumente": ["Arbeitsblatt DC-Motor Praxis", "Arbeitsblatt DC-Motor Theorie", "Aufschrieb Gleichstrommotor", "Aufschrieb Taster", "Arbeitsblatt Taster Theorie", "Arbeitsblatt Taster Praxis"],
    "vorverkabelt": [
      ["batterie.stecker", "arduino.BUCHSE"],
      ["arduino.VIN", "treiber.P12V"],
      ["treiber.GND", "arduino.GND_1"],
      ["treiber.ENB", "arduino.D3"],
      ["treiber.IN4", "arduino.D7"],
      ["treiber.IN3", "arduino.D8"],
      ["motor.gruen", "treiber.MB1"],
      ["motor.gelb", "treiber.MB2"]
    ]
  },
  {
    "id": 5,
    "titel": "DC-Motor, Taster und Servo",
    "auftrag": "Die Schaltung aus Aufgabe 4 ist schon gesteckt (helle Kabel). Schließe zusätzlich den Servo an einem freien Pin an.",
    "auftragSelbst": "Schließe DC-Motor mit Motortreiber und 9-V-Batterie, den Taster (INPUT_PULLUP) und den Servo an den Arduino an.",
    "bauteile": ["arduino", "treiber", "motor", "batterie", "taster", "servo"],
    "bausteine": ["motor_l298n", "taster", "servo"],
    "dokumente": ["Arbeitsblatt Servomotor", "Aufschrieb Servomotor", "Arbeitsblatt DC-Motor Praxis", "Arbeitsblatt DC-Motor Theorie", "Aufschrieb Gleichstrommotor", "Aufschrieb Taster", "Arbeitsblatt Taster Theorie", "Arbeitsblatt Taster Praxis"],
    "vorverkabelt": [
      ["batterie.stecker", "arduino.BUCHSE"],
      ["arduino.VIN", "treiber.P12V"],
      ["treiber.GND", "arduino.GND_1"],
      ["treiber.ENB", "arduino.D3"],
      ["treiber.IN4", "arduino.D7"],
      ["treiber.IN3", "arduino.D8"],
      ["motor.gruen", "treiber.MB1"],
      ["motor.gelb", "treiber.MB2"],
      ["taster.rot", "arduino.D2"],
      ["taster.schwarz", "arduino.GND_OBEN"]
    ],
    "sonderregeln": [
      { "anforderung": "motor_enable", "zu": ["arduino.D9", "arduino.D10"], "hinweis": "enable_9_10" }
    ]
  }
];
