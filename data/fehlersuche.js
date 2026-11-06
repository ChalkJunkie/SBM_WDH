// =====================================================================
// data/fehlersuche.js – Bereich 2, Teil B: Fehlersuche
// ---------------------------------------------------------------------
// Jede Aufgabe:
//   id           Nummer (in der Adresse: fehlersuche.html?aufgabe=1)
//   titel        Überschrift
//   soll         was das Programm tun soll
//   verkabelung  so ist die Schaltung gesteckt (Tabelle links)
//   pap          Programmablaufplan des RICHTIGEN Programms (links), Formen:
//                  {"art":"start","text":"Start"}           abgerundet
//                  {"art":"schritt","text":"LED an"}        Rechteck
//                  {"art":"frage","text":"Taster gedrückt?","ja":[...],"nein":[...]}
//                  "neinZurLetzten": true  -> nein führt in die letzte Box von ja
//                  {"art":"schleife","schritte":[...]}      Loop (Pfeil zurück)
//   zeilen       das Programm MIT den eingebauten Fehlern, Zeile für Zeile
//   fehler       die falschen Zeilen:
//     zeile      Zeilennummer (die erste Zeile ist 1)
//     richtig    so wäre die Zeile richtig (wird gezeigt, sobald gefunden)
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
    "titel": "Taster mit LED",
    "soll": "Wird der zweibeinige Taster gedrückt, soll die LED fünf Sekunden lang leuchten.",
    "verkabelung": ["Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND","LED (mit Vorwiderstand) an Pin 6"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Variablen und Werte definieren"},{"art":"schritt","text":"Ein- und Ausgänge definieren"},{"art":"schleife","schritte":[{"art":"frage","text":"Taster gedrückt?","ja":[{"art":"schritt","text":"LED an"},{"art":"schritt","text":"5 Sekunden warten"},{"art":"schritt","text":"LED aus"}],"neinZurLetzten":true}]}],
    "zeilen": [
      "int LED = 6;",
      "int taster = 7;",
      "void setup()",
      "{",
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
      {"zeile": 2, "richtig": "int taster = 2;", "warum": "Der Taster hängt laut Verkabelung an Pin 2, im Code steht aber Pin 7.", "dokument": "Arbeitsblatt Taster Praxis"},
      {"zeile": 5, "richtig": "  pinMode(taster, INPUT_PULLUP);", "warum": "Beim zweibeinigen Taster wird der interne Pullup-Widerstand gebraucht: INPUT_PULLUP statt INPUT.", "dokument": "Aufschrieb Taster"},
      {"zeile": 6, "fehlt": true, "richtig": "  pinMode(LED, OUTPUT);", "warum": "Vor dieser Zeile fehlt pinMode(LED, OUTPUT);. Ohne diesen Befehl ist der LED-Pin kein Ausgang und die LED leuchtet nicht richtig.", "dokument": "Arbeitsblatt Taster Theorie"},
      {"zeile": 9, "richtig": "  if (digitalRead(taster) == LOW)", "warum": "Mit INPUT_PULLUP ist der Pin LOW, wenn der Taster gedrückt ist. Die Abfrage muss also == LOW heißen.", "dokument": "Arbeitsblatt Taster Theorie"}
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 2,
    "titel": "Servo",
    "soll": "Der Servo soll abwechselnd auf 0 Grad und auf 90 Grad fahren und dort jeweils eine Sekunde bleiben.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9","Servo: Plus (rot) an 3V3, GND (braun) an GND"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Servo-Bibliothek einbinden"},{"art":"schritt","text":"Servo an Pin 9 festlegen"},{"art":"schleife","schritte":[{"art":"schritt","text":"Servo auf 0 Grad"},{"art":"schritt","text":"1 Sekunde warten"},{"art":"schritt","text":"Servo auf 90 Grad"},{"art":"schritt","text":"1 Sekunde warten"}]}],
    "zeilen": [
      "Servo S1;",
      "void setup() {",
      "  S1.attach(8);",
      "}",
      "void loop() {",
      "  S1.write(0);",
      "  delay(1000);",
      "  S1.write(90);",
      "  delay(1000)",
      "}"
    ],
    "fehler": [
      {"zeile": 1, "fehlt": true, "richtig": "#include <Servo.h>", "warum": "Vor dieser Zeile fehlt #include <Servo.h>. Ohne die Servo-Bibliothek kennt der Arduino „Servo“ nicht. Die Fehlermeldung erscheint genau in dieser Zeile.", "dokument": "Arbeitsblatt Servomotor"},
      {"zeile": 3, "richtig": "  S1.attach(9);", "warum": "Der Servo hängt laut Verkabelung an Pin 9, im Code steht aber Pin 8.", "dokument": "Arbeitsblatt Servomotor"},
      {"zeile": 9, "richtig": "  delay(1000);", "warum": "Am Ende des Befehls fehlt das Semikolon ;", "dokument": "Arbeitsblatt Ampel und PAP"}
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 3,
    "titel": "Servo und Taster",
    "soll": "Wird der Taster gedrückt, soll der Servo auf 90 Grad fahren, dort 5 Sekunden bleiben und dann zurück auf 0 Grad fahren.",
    "verkabelung": ["Servo: Signal (orange) an Pin 9","Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Servo-Bibliothek einbinden"},{"art":"schritt","text":"Variablen und Werte definieren"},{"art":"schritt","text":"Ein- und Ausgänge definieren"},{"art":"schleife","schritte":[{"art":"frage","text":"Taster gedrückt?","ja":[{"art":"schritt","text":"Servo auf 90 Grad"},{"art":"schritt","text":"5 Sekunden warten"},{"art":"schritt","text":"Servo auf 0 Grad"}]}]}],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  pinMode(taster, INPUT_PULLUP);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == LOW);",
      "  {",
      "    S1.write(90);",
      "    delay(5000);",
      "    S1.write(0);",
      "  }",
      "}"
    ],
    "fehler": [
      {"zeile": 6, "fehlt": true, "richtig": "  S1.attach(9);", "warum": "Vor dieser Zeile fehlt S1.attach(9);. Ohne attach weiß der Arduino nicht, an welchem Pin der Servo hängt.", "dokument": "Arbeitsblatt Servomotor"},
      {"zeile": 10, "richtig": "  if (digitalRead(taster) == LOW)", "warum": "Nach der if-Zeile darf kein Semikolon stehen! Mit ; ist der if-Befehl dort schon zu Ende, und der Teil in den geschweiften Klammern wird IMMER ausgeführt, egal ob der Taster gedrückt ist.", "dokument": "Aufschrieb Taster"}
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 4,
    "titel": "Vierbeiniger Taster und Servo",
    "soll": "Wird der vierbeinige Taster gedrückt, soll der Servo auf 90 Grad fahren, dort 5 Sekunden bleiben und dann zurück auf 0 Grad fahren.",
    "verkabelung": ["Vierbeiniger Taster auf dem Breadboard: ein Bein an 5V, das diagonale Bein an Pin 7","10-kΩ-Widerstand zwischen Pin 7 und GND (Pulldown)","Servo: Signal (orange) an Pin 9"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Servo-Bibliothek einbinden"},{"art":"schritt","text":"Variablen und Werte definieren"},{"art":"schritt","text":"Ein- und Ausgänge definieren"},{"art":"schleife","schritte":[{"art":"frage","text":"Taster gedrückt?","ja":[{"art":"schritt","text":"Servo auf 90 Grad"},{"art":"schritt","text":"5 Sekunden warten"},{"art":"schritt","text":"Servo auf 0 Grad"}]}]}],
    "zeilen": [
      "#include <Servo.h>",
      "Servo S1;",
      "int taster = 7;",
      "void setup()",
      "{",
      "  S1.attach(9);",
      "  pinMode(taster, INPUT_PULLUP);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == LOW)",
      "  {",
      "    S1.write(90);",
      "    delay(5000);",
      "    S1.write(0);",
      "  }",
      "}"
    ],
    "fehler": [
      {"zeile": 7, "richtig": "  pinMode(taster, INPUT);", "warum": "Beim vierbeinigen Taster steckt der Pulldown-Widerstand auf dem Breadboard. Deshalb INPUT. INPUT_PULLUP schaltet den internen Widerstand ein – das gehört zum zweibeinigen Taster.", "dokument": "Aufschrieb Taster"},
      {"zeile": 11, "richtig": "  if (digitalRead(taster) == HIGH)", "warum": "Mit Pulldown-Widerstand ist der Pin LOW, solange niemand drückt, und HIGH, wenn der Taster gedrückt ist. Die Abfrage muss also == HIGH heißen.", "dokument": "Arbeitsblatt Taster Theorie"}
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 5,
    "titel": "DC-Motor",
    "soll": "Der Motor soll sich zwei Sekunden in die eine Richtung drehen, zwei Sekunden in die andere Richtung und dann zwei Sekunden stillstehen.",
    "verkabelung": ["Motortreiber: ENB an Pin 3, IN4 an Pin 7, IN3 an Pin 8","DC-Motor an Klemme Motor B","Batterie in der Strombuchse, VIN an +12V, GND an GND"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Variablen und Werte definieren"},{"art":"schritt","text":"Ein- und Ausgänge definieren"},{"art":"schleife","schritte":[{"art":"schritt","text":"Motor dreht in eine Richtung (Geschwindigkeit 200)"},{"art":"schritt","text":"2 Sekunden warten"},{"art":"schritt","text":"Motor dreht andersherum"},{"art":"schritt","text":"2 Sekunden warten"},{"art":"schritt","text":"Motor aus"},{"art":"schritt","text":"2 Sekunden warten"}]}],
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
      {"zeile": 1, "richtig": "int ENB = 3;", "warum": "ENB hängt laut Verkabelung an Pin 3. Im Code steht Pin 2, und Pin 2 hat kein ~: Mit analogWrite ließe sich dort die Geschwindigkeit gar nicht steuern.", "dokument": "Aufschrieb Gleichstrommotor"},
      {"zeile": 20, "richtig": "  digitalWrite(in4, LOW);", "warum": "Zum Anhalten müssen in3 und in4 beide LOW sein. Mit in4 = HIGH dreht der Motor einfach weiter.", "dokument": "Arbeitsblatt DC-Motor Theorie"}
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": 6,
    "titel": "DC-Motor und Taster",
    "soll": "Wird der Taster gedrückt, soll sich der Motor zwei Sekunden lang drehen. Sonst ist der Motor aus.",
    "verkabelung": ["Motortreiber: ENB an Pin 3, IN4 an Pin 7, IN3 an Pin 8","Taster: rotes Kabel an Pin 2, schwarzes Kabel an GND","DC-Motor an Klemme Motor B, Batterie in der Strombuchse"],
    "pap": [{"art":"start","text":"Start"},{"art":"schritt","text":"Variablen und Werte definieren"},{"art":"schritt","text":"Ein- und Ausgänge definieren"},{"art":"schleife","schritte":[{"art":"frage","text":"Taster gedrückt?","ja":[{"art":"schritt","text":"Motor an (Geschwindigkeit 200)"},{"art":"schritt","text":"2 Sekunden warten"},{"art":"schritt","text":"Motor aus"}],"neinZurLetzten":true}]}],
    "zeilen": [
      "int ENB = 3;",
      "int in4 = 7;",
      "int in3 = 8;",
      "int taster = 2;",
      "void setup()",
      "{",
      "  pinMode(ENB, OUTPUT);",
      "  pinMode(in3, OUTPUT);",
      "  pinMode(in4, OUTPUT);",
      "}",
      "void loop()",
      "{",
      "  if (digitalRead(taster) == HIGH)",
      "  {",
      "    digitalWrite(in3, HIGH);",
      "    digitalWrite(in4, LOW);",
      "    analogWrite(ENB, 200),",
      "    delay(2000);",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "  }",
      "  else",
      "  {",
      "    digitalWrite(in3, LOW);",
      "    digitalWrite(in4, LOW);",
      "  }",
      "}"
    ],
    "fehler": [
      {"zeile": 10, "fehlt": true, "richtig": "  pinMode(taster, INPUT_PULLUP);", "warum": "Vor dieser Zeile fehlt pinMode(taster, INPUT_PULLUP);. Ohne diesen Befehl ist der Taster-Pin kein Eingang mit Pullup-Widerstand, und der Taster wird nicht richtig erkannt.", "dokument": "Aufschrieb Taster"},
      {"zeile": 13, "richtig": "  if (digitalRead(taster) == LOW)", "warum": "Mit INPUT_PULLUP ist der Pin LOW, wenn der Taster gedrückt ist. Die Abfrage muss also == LOW heißen.", "dokument": "Arbeitsblatt Taster Theorie"},
      {"zeile": 17, "richtig": "    analogWrite(ENB, 200);", "warum": "Am Ende eines Befehls steht ein Semikolon ; und kein Komma.", "dokument": "Arbeitsblatt Ampel und PAP"}
    ]
  }
];
