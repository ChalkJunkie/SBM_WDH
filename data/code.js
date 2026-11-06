// =====================================================================
// data/code.js – Bereich 2, Teil A: Code und Kommentar zuordnen
// ---------------------------------------------------------------------
// Jedes Programm:
//   id         interner Name (in der Adresse: zuordnen.html?programm=servo)
//   titel      Überschrift
//   auftrag    Text über dem Code
//   dokument   Wo man nachschlagen kann (Kurzname aus dokumente.js)
//   zeilen     die Codezeilen von oben nach unten:
//     code        die Zeile, genau so, wie sie angezeigt wird
//     kommentar   der passende Kommentar. Zeilen OHNE "kommentar" werden
//                 grau angezeigt und müssen nicht zugeordnet werden.
//     dokument    (freiwillig) anderes Dokument nur für diese Zeile
// Zwei Zeilen mit genau gleichem Kommentar sind austauschbar
// (z. B. zweimal "delay(1000);").
//
// Die Kommentare sind absichtlich NICHT wörtlich aus den Arbeitsblättern,
// sondern kürzer und anders formuliert (Inhalt wie im Erwartungshorizont).
// Das Programm "DC-Motor, Taster und Servo" gibt es hier bewusst nicht:
// Das sollen die Schüler:innen für ihr Projekt selbst schreiben.
// =====================================================================
DATEN.programme = [

  // ------------------------------------------------------------------
  {
    "id": "servo",
    "titel": "Servo",
    "auftrag": "Der Servo fährt abwechselnd auf 30 Grad und auf 90 Grad.",
    "dokument": "Arbeitsblatt Servomotor",
    "zeilen": [
      { "code": "#include <Servo.h>", "kommentar": "Bindet die Servo-Bibliothek ein. Sie erzeugt die Signale für den Servo." },
      { "code": "Servo S1;", "kommentar": "Legt einen Servo mit dem Namen S1 an." },
      { "code": "void setup() {", "kommentar": "Setup: läuft nur einmal beim Start.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "  S1.attach(9);", "kommentar": "Der Servo S1 hängt an Pin 9." },
      { "code": "}" },
      { "code": "void loop() {", "kommentar": "Loop: wird immer wieder wiederholt.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "  S1.write(30);", "kommentar": "Servo auf 30 Grad drehen." },
      { "code": "  delay(1000);", "kommentar": "1 Sekunde warten." },
      { "code": "  S1.write(90);", "kommentar": "Servo auf 90 Grad drehen." },
      { "code": "  delay(1000);", "kommentar": "1 Sekunde warten." },
      { "code": "}" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": "taster",
    "titel": "Taster mit INPUT_PULLUP",
    "auftrag": "Wird der zweibeinige Taster gedrückt, leuchtet die LED fünf Sekunden lang.",
    "dokument": "Arbeitsblatt Taster Praxis",
    "zeilen": [
      { "code": "int LED = 6;", "kommentar": "Die Variable LED wird angelegt und bekommt den Wert 6 (die Pinnummer der LED)." },
      { "code": "int taster = 2;", "kommentar": "Die Variable taster wird angelegt und bekommt den Wert 2 (die Pinnummer des Tasters)." },
      { "code": "void setup()", "kommentar": "Setup: läuft nur einmal beim Start.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  pinMode(LED, OUTPUT);", "kommentar": "Der LED-Pin wird ein Ausgang.", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  pinMode(taster, INPUT_PULLUP);", "kommentar": "Der Taster-Pin wird ein Eingang mit internem Pullup-Widerstand.", "dokument": "Aufschrieb Taster" },
      { "code": "}" },
      { "code": "void loop()" },
      { "code": "{", "kommentar": "Öffnet den Loop-Teil." },
      { "code": "  if (digitalRead(taster) == LOW)", "kommentar": "Wenn der Taster gedrückt ist (bei INPUT_PULLUP heißt das LOW) …", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  {", "kommentar": "Beginn des if-Teils." },
      { "code": "    digitalWrite(LED, HIGH);", "kommentar": "… LED einschalten," },
      { "code": "    delay(5000);", "kommentar": "5 Sekunden warten," },
      { "code": "    digitalWrite(LED, LOW);", "kommentar": "LED wieder ausschalten." },
      { "code": "  }", "kommentar": "Ende des if-Teils." },
      { "code": "  else", "kommentar": "Sonst (Taster nicht gedrückt) …" },
      { "code": "  {", "kommentar": "Beginn des else-Teils." },
      { "code": "    digitalWrite(LED, LOW);", "kommentar": "… bleibt die LED aus." },
      { "code": "  }", "kommentar": "Ende des else-Teils." },
      { "code": "}", "kommentar": "Schließt den Loop-Teil." }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": "motor",
    "titel": "DC-Motor mit Motortreiber",
    "auftrag": "Der Motor dreht sich zwei Sekunden in die eine Richtung, zwei Sekunden in die andere Richtung und steht dann zwei Sekunden still.",
    "dokument": "Arbeitsblatt DC-Motor Praxis",
    "zeilen": [
      { "code": "int ENB = 3;", "kommentar": "Die Variable ENB wird angelegt und bekommt den Wert 3 (die Pinnummer von ENB, ein Pin mit ~).", "dokument": "Aufschrieb Gleichstrommotor" },
      { "code": "int in4 = 7;", "kommentar": "Die Variable in4 wird angelegt und bekommt den Wert 7 (die Pinnummer von IN4)." },
      { "code": "int in3 = 8;", "kommentar": "Die Variable in3 wird angelegt und bekommt den Wert 8 (die Pinnummer von IN3)." },
      { "code": "void setup()", "kommentar": "Setup: läuft nur einmal beim Start.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  pinMode(ENB, OUTPUT);", "kommentar": "Pin 3 (ENB) wird ein Ausgang." },
      { "code": "  pinMode(in3, OUTPUT);", "kommentar": "Pin 8 (in3) wird ein Ausgang." },
      { "code": "  pinMode(in4, OUTPUT);", "kommentar": "Pin 7 (in4) wird ein Ausgang." },
      { "code": "}" },
      { "code": "void loop()", "kommentar": "Loop: wird immer wieder wiederholt.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  digitalWrite(in3, HIGH);", "kommentar": "in3 auf HIGH …", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  digitalWrite(in4, LOW);", "kommentar": "… und in4 auf LOW: Der Motor dreht in die eine Richtung.", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  analogWrite(ENB, 200);", "kommentar": "Geschwindigkeit 200 per PWM an ENB.", "dokument": "Aufschrieb Gleichstrommotor" },
      { "code": "  delay(2000);", "kommentar": "2 Sekunden warten." },
      { "code": "  digitalWrite(in3, LOW);", "kommentar": "in3 auf LOW …", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  digitalWrite(in4, HIGH);", "kommentar": "… und in4 auf HIGH: Der Motor dreht andersherum.", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  delay(2000);", "kommentar": "2 Sekunden warten." },
      { "code": "  digitalWrite(in3, LOW);", "kommentar": "in3 auf LOW …", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  digitalWrite(in4, LOW);", "kommentar": "… und in4 auf LOW: Beide sind LOW, der Motor steht still.", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  delay(2000);", "kommentar": "2 Sekunden warten." },
      { "code": "}" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": "servo_taster",
    "titel": "Servo und Taster",
    "auftrag": "Solange der Taster gedrückt ist, fährt der Servo auf 90 Grad. Sonst steht er auf der Startposition 0 Grad.",
    "dokument": "Arbeitsblatt Servomotor",
    "zeilen": [
      { "code": "#include <Servo.h>", "kommentar": "Bindet die Servo-Bibliothek ein. Sie erzeugt die Signale für den Servo." },
      { "code": "Servo S1;", "kommentar": "Legt einen Servo mit dem Namen S1 an." },
      { "code": "int taster = 2;", "kommentar": "Die Variable taster wird angelegt und bekommt den Wert 2 (die Pinnummer des Tasters).", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "void setup()", "kommentar": "Setup: läuft nur einmal beim Start.", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  S1.attach(9);", "kommentar": "Der Servo S1 hängt an Pin 9." },
      { "code": "  pinMode(taster, INPUT_PULLUP);", "kommentar": "Der Taster-Pin wird ein Eingang mit internem Pullup-Widerstand.", "dokument": "Aufschrieb Taster" },
      { "code": "  S1.write(0);", "kommentar": "Startposition: Servo auf 0 Grad." },
      { "code": "}" },
      { "code": "void loop()" },
      { "code": "{", "kommentar": "Öffnet den Loop-Teil." },
      { "code": "  if (digitalRead(taster) == LOW)", "kommentar": "Wenn der Taster gedrückt ist (bei INPUT_PULLUP heißt das LOW) …", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  {" },
      { "code": "    S1.write(90);", "kommentar": "… Servo auf 90 Grad drehen" },
      { "code": "    delay(1000);", "kommentar": "und 1 Sekunde warten." },
      { "code": "  }" },
      { "code": "  else", "kommentar": "Sonst (Taster nicht gedrückt) …", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "  {" },
      { "code": "    S1.write(0);", "kommentar": "… Servo zurück auf 0 Grad." },
      { "code": "  }" },
      { "code": "}", "kommentar": "Schließt den Loop-Teil." }
    ]
  }
];
