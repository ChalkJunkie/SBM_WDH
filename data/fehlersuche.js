// =====================================================================
// data/fehlersuche.js – Level 2, Teil B: Fehlersuche
// ---------------------------------------------------------------------
// Jede Aufgabe:
//   id           Nummer (in der Adresse: fehlersuche.html?aufgabe=1)
//   titel        Überschrift
//   soll         was das Programm tun soll
//   verkabelung  so ist die Schaltung gesteckt (Tabelle über dem Code)
//   zeilen       das Programm MIT den eingebauten Fehlern, Zeile für Zeile
//   fehler       die falschen Zeilen:
//     zeile      Zeilennummer (die erste Zeile ist 1)
//     richtig    so wäre die Zeile richtig (wird bei der Lösung gezeigt)
//     fehlt      true = hier fehlt eine ganze Zeile. Die Schüler:innen
//                tippen dann die Zeile an, VOR der sie fehlen müsste.
//     warum      Erklärung
//     dokument   Wo man nachschlagen kann (Kurzname aus dokumente.js)
// Alle Aufgaben und Erklärungen hier sind von mir geschrieben und stehen
// deshalb in ZU_PRUEFEN.md.
// =====================================================================
DATEN.fehlersuche = [

  // ------------------------------------------------------------------
  {
    "id": 1,
    "titel": "Servo (2 Fehler)",
    "soll": "Der Servo soll abwechselnd auf 30 Grad und auf 90 Grad fahren und dort jeweils eine Sekunde bleiben.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9", "Servo: Plus (rot) an 3V3, GND (braun) an GND"],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "void setup() {",
      "  S1.attach(8);",
      "}",
      "void loop() {",
      "  S1.write(30);",
      "  delay(1000);",
      "  S1.write(90);",
      "  delay(1000)",
      "}"
    ],
    "fehler": [
      { "zeile": 4, "richtig": "  S1.attach(9);", "warum": "Der Servo hängt laut Verkabelung an Pin 9, im Code steht aber Pin 8.", "dokument": "Arbeitsblatt Servomotor" },
      { "zeile": 10, "richtig": "  delay(1000);", "warum": "Am Ende des Befehls fehlt das Semikolon ;", "dokument": "Arbeitsblatt Ampel und PAP" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 2,
    "titel": "Servo (1 Fehler)",
    "soll": "Der Servo soll abwechselnd auf 30 Grad und auf 90 Grad fahren und dort jeweils eine Sekunde bleiben.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9", "Servo: Plus (rot) an 3V3, GND (braun) an GND"],
    "zeilen": [
      "Servo S1;",
      "void setup() {",
      "  S1.attach(9);",
      "}",
      "void loop() {",
      "  S1.write(30);",
      "  delay(1000);",
      "  S1.write(90);",
      "  delay(1000);",
      "}"
    ],
    "fehler": [
      { "zeile": 1, "fehlt": true, "richtig": "#include <Servo.h>", "warum": "Vor dieser Zeile fehlt #include <Servo.h>. Ohne die Servo-Bibliothek kennt der Arduino „Servo“ nicht. Die Fehlermeldung erscheint genau in dieser Zeile.", "dokument": "Arbeitsblatt Servomotor" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 3,
    "titel": "Taster mit LED (2 Fehler)",
    "soll": "Wird der zweibeinige Taster gedrückt, soll die LED fünf Sekunden lang leuchten.",
    "verkabelung": ["Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND", "LED (mit Vorwiderstand) an Pin 6"],
    "zeilen": [
      "int LED = 6;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  pinMode(LED, OUTPUT);",
      "  pinMode(taster, INPUT);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == HIGH)",
      "  {",
      "    digitalWrite(LED, HIGH);",
      "    delay(5000);",
      "    digitalWrite(LED, LOW);",
      "  }",
      "  else",
      "  {",
      "    digitalWrite(LED, LOW);",
      "  }",
      "}"
    ],
    "fehler": [
      { "zeile": 6, "richtig": "  pinMode(taster, INPUT_PULLUP);", "warum": "Beim zweibeinigen Taster wird der interne Pullup-Widerstand gebraucht: INPUT_PULLUP statt INPUT.", "dokument": "Aufschrieb Taster" },
      { "zeile": 10, "richtig": "  if (digitalRead(taster) == LOW)", "warum": "Mit INPUT_PULLUP ist der Pin LOW, wenn der Taster gedrückt ist. Die Abfrage muss also == LOW heißen.", "dokument": "Arbeitsblatt Taster Theorie" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 4,
    "titel": "Taster mit LED (2 Fehler)",
    "soll": "Wird der zweibeinige Taster gedrückt, soll die LED fünf Sekunden lang leuchten.",
    "verkabelung": ["Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND", "LED (mit Vorwiderstand) an Pin 6"],
    "zeilen": [
      "int LED = 6;",
      "int taster = 7;",
      "void setup()",
      "{",
      "  pinMode(taster, INPUT_PULLUP);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == LOW)",
      "  {",
      "    digitalWrite(LED, HIGH);",
      "    delay(5000);",
      "    digitalWrite(LED, LOW);",
      "  }",
      "  else",
      "  {",
      "    digitalWrite(LED, LOW);",
      "  }",
      "}"
    ],
    "fehler": [
      { "zeile": 2, "richtig": "int taster = 2;", "warum": "Der Taster hängt laut Verkabelung an Pin 2, im Code steht aber Pin 7.", "dokument": "Arbeitsblatt Taster Praxis" },
      { "zeile": 5, "fehlt": true, "richtig": "  pinMode(LED, OUTPUT);", "warum": "Vor dieser Zeile fehlt pinMode(LED, OUTPUT);. Ohne diesen Befehl ist der LED-Pin kein Ausgang und die LED leuchtet nicht richtig.", "dokument": "Arbeitsblatt Taster Theorie" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 5,
    "titel": "DC-Motor (2 Fehler)",
    "soll": "Der Motor soll sich zwei Sekunden in die eine Richtung drehen, zwei Sekunden in die andere Richtung und dann zwei Sekunden stillstehen.",
    "verkabelung": ["Motortreiber: ENB an Pin 3, IN4 an Pin 7, IN3 an Pin 8", "DC-Motor an Klemme Motor B", "Batterie in der Strombuchse, VIN an +12V, GND an GND"],
    "zeilen": [
      "int ENB = 2;",
      "int in4 = 7;",
      "int in3 = 8;",
      "void setup()",
      "{",
      "  pinMode(ENB, OUTPUT);",
      "  pinMode(in3, OUTPUT);",
      "  pinMode(in4, OUTPUT);",
      "}",
      "void loop()",
      "{",
      "  digitalWrite(in3, HIGH);",
      "  digitalWrite(in4, LOW);",
      "  analogWrite(ENB, 200);",
      "  delay(2000);",
      "  digitalWrite(in3, LOW);",
      "  digitalWrite(in4, HIGH);",
      "  delay(2000);",
      "  digitalWrite(in3, LOW);",
      "  digitalWrite(in4, HIGH);",
      "  delay(2000);",
      "}"
    ],
    "fehler": [
      { "zeile": 1, "richtig": "int ENB = 3;", "warum": "ENB hängt laut Verkabelung an Pin 3. Im Code steht Pin 2, und Pin 2 hat kein ~: Mit analogWrite ließe sich dort die Geschwindigkeit gar nicht steuern.", "dokument": "Aufschrieb Gleichstrommotor" },
      { "zeile": 20, "richtig": "  digitalWrite(in4, LOW);", "warum": "Zum Anhalten müssen in3 und in4 beide LOW sein. Mit in4 = HIGH dreht der Motor einfach weiter.", "dokument": "Arbeitsblatt DC-Motor Theorie" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 6,
    "titel": "Servo und Taster (2 Fehler)",
    "soll": "Solange der Taster gedrückt ist, soll der Servo auf 90 Grad fahren. Sonst steht er auf 0 Grad.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9", "Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND"],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  pinMode(taster, INPUT_PULLUP);",
      "  S1.write(0);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == HIGH)",
      "  {",
      "    S1.write(90);",
      "    delay(1000);",
      "  }",
      "  else",
      "  {",
      "    S1.write(0);",
      "  }",
      "}"
    ],
    "fehler": [
      { "zeile": 6, "fehlt": true, "richtig": "  S1.attach(9);", "warum": "Vor dieser Zeile fehlt S1.attach(9);. Ohne attach weiß der Arduino nicht, an welchem Pin der Servo hängt.", "dokument": "Arbeitsblatt Servomotor" },
      { "zeile": 11, "richtig": "  if (digitalRead(taster) == LOW)", "warum": "Mit INPUT_PULLUP ist der Pin LOW, wenn der Taster gedrückt ist. Die Abfrage muss also == LOW heißen.", "dokument": "Arbeitsblatt Taster Theorie" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 7,
    "titel": "DC-Motor, Taster und Servo (3 Fehler)",
    "soll": "Wird der Taster gedrückt, soll der Servoarm auf 90 Grad fahren und der Motor sich zwei Sekunden lang drehen. Sonst ist der Motor aus und der Servo steht auf 0 Grad.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9", "Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND", "Motortreiber: ENB an Pin 3, IN4 an Pin 7, IN3 an Pin 8"],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "int ENB = 10;",
      "int in4 = 7;",
      "int in3 = 8;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  S1.attach(9);",
      "  pinMode(ENB, OUTPUT);",
      "  pinMode(in3, OUTPUT);",
      "  pinMode(in4, OUTPUT);",
      "  pinMode(taster, INPUT);",
      "  S1.write(0);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == LOW)",
      "  {",
      "    S1.write(90)",
      "    digitalWrite(in3, HIGH);",
      "    digitalWrite(in4, LOW);",
      "    analogWrite(ENB, 200);",
      "    delay(2000);",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "  }",
      "  else",
      "  {",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "    S1.write(0);",
      "  }",
      "}"
    ],
    "fehler": [
      { "zeile": 3, "richtig": "int ENB = 3;", "warum": "ENB hängt laut Verkabelung an Pin 3, im Code steht Pin 10. Außerdem: Mit der Servo-Bibliothek ist an Pin 10 keine PWM-Ausgabe mehr möglich.", "dokument": "Arbeitsblatt Servomotor" },
      { "zeile": 13, "richtig": "  pinMode(taster, INPUT_PULLUP);", "warum": "Beim zweibeinigen Taster wird der interne Pullup-Widerstand gebraucht: INPUT_PULLUP statt INPUT.", "dokument": "Aufschrieb Taster" },
      { "zeile": 20, "richtig": "    S1.write(90);", "warum": "Am Ende des Befehls fehlt das Semikolon ;", "dokument": "Arbeitsblatt Ampel und PAP" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 8,
    "titel": "DC-Motor, Taster und Servo (2 Fehler)",
    "soll": "Wird der Taster gedrückt, soll der Servoarm auf 90 Grad fahren und der Motor sich zwei Sekunden lang VORWÄRTS drehen (vorwärts heißt bei uns: in3 HIGH, in4 LOW). Sonst ist der Motor aus und der Servo steht auf 0 Grad.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9", "Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND", "Motortreiber: ENB an Pin 3, IN4 an Pin 7, IN3 an Pin 8"],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "int ENB = 3;",
      "int in4 = 7;",
      "int in3 = 8;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  S1.attach(9);",
      "  pinMode(ENB, OUTPUT);",
      "  pinMode(in3, OUTPUT);",
      "  pinMode(in4, OUTPUT);",
      "  pinMode(taster, INPUT_PULLUP);",
      "  S1.write(0);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == LOW)",
      "  {",
      "    S1.write(90);",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, HIGH);",
      "    analogWrite(ENB, 200);",
      "    delay(2000);",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "  }",
      "  else",
      "  {",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "    S1.write(0);",
      "  }",
      "}"
    ],
    "fehler": [
      { "zeile": 21, "richtig": "    digitalWrite(in3, HIGH);", "warum": "in3 und in4 sind vertauscht: So dreht sich der Motor rückwärts. Vorwärts heißt hier in3 HIGH und in4 LOW.", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "zeile": 22, "richtig": "    digitalWrite(in4, LOW);", "warum": "in3 und in4 sind vertauscht: So dreht sich der Motor rückwärts. Vorwärts heißt hier in3 HIGH und in4 LOW.", "dokument": "Arbeitsblatt DC-Motor Theorie" }
    ]
  }
];
