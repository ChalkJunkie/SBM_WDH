// =====================================================================
// data/code.js – Level 2, Teil A: Code und Kommentar zuordnen
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
//     herkunft    nur zu deiner Orientierung:
//                   "material"   wörtlich aus deinen Unterlagen
//                   "angepasst"  aus deinen Unterlagen, aber verändert
//                   "neu"        von mir geschrieben (steht in ZU_PRUEFEN.md)
//     dokument    (freiwillig) anderes Dokument nur für diese Zeile
// Zwei Zeilen mit genau gleichem Kommentar sind austauschbar
// (z. B. zweimal "delay(1000);").
// =====================================================================
DATEN.programme = [

  // ------------------------------------------------------------------
  {
    "id": "servo",
    "titel": "Servo",
    "auftrag": "Der Servo fährt abwechselnd auf 30 Grad und auf 90 Grad.",
    "dokument": "Arbeitsblatt Servomotor",
    "zeilen": [
      { "code": "#include <Servo.h>", "kommentar": "Die Servo-Bibliothek wird eingebunden. Sie kümmert sich darum, dass der Servo die richtigen Signale bekommt.", "herkunft": "neu" },
      { "code": "Servo S1;", "kommentar": "Für jeden angeschlossenen Servo legt man ein Objekt an. Man kann jeden gültigen Variablennamen benutzen: S1, Klaus, Nepomuk…", "herkunft": "material" },
      { "code": "void setup() {", "kommentar": "Hier beginnt das Setup.", "herkunft": "neu", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "  S1.attach(9);", "kommentar": "Hier wird der Servo an Pin 9 initialisiert.", "herkunft": "material" },
      { "code": "}" },
      { "code": "void loop() {", "kommentar": "Hier beginnt der Loop-Teil. Er wird immer wieder wiederholt.", "herkunft": "neu", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "  S1.write(30);", "kommentar": "Hier stellt man den Servo auf 30 Grad.", "herkunft": "material" },
      { "code": "  delay(1000);", "kommentar": "Eine Sekunde (1000 Millisekunden) warten.", "herkunft": "neu" },
      { "code": "  S1.write(90);", "kommentar": "… und so auf 90 Grad.", "herkunft": "material" },
      { "code": "  delay(1000);", "kommentar": "Eine Sekunde (1000 Millisekunden) warten.", "herkunft": "neu" },
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
      { "code": "int LED = 6;", "kommentar": "Das Wort „LED“ steht jetzt für den Wert 6", "herkunft": "material" },
      { "code": "int taster = 2;", "kommentar": "Das Wort „taster“ steht jetzt für den Wert 2", "herkunft": "angepasst" },
      { "code": "void setup()", "kommentar": "Hier beginnt das Setup.", "herkunft": "material" },
      { "code": "{" },
      { "code": "  pinMode(LED, OUTPUT);", "kommentar": "Der Pin mit der LED (Pin 6) ist jetzt ein Ausgang", "herkunft": "material" },
      { "code": "  pinMode(taster, INPUT_PULLUP);", "kommentar": "Der Pin mit dem Taster (Pin 2) ist jetzt ein Eingang mit zugeschaltetem, internen Widerstand", "herkunft": "angepasst", "dokument": "Aufschrieb Taster" },
      { "code": "}" },
      { "code": "void loop()" },
      { "code": "{", "kommentar": "Mit dieser Klammer wird der Loop-Teil geöffnet.", "herkunft": "material" },
      { "code": "  if (digitalRead(taster) == LOW)", "kommentar": "Der als taster definierte Pin 2 wird ausgelesen, FALLS das ausgelesene Spannungssignal niedrig ist…", "herkunft": "angepasst", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  {", "kommentar": "Programmabschnitt des IF-Befehls öffnen.", "herkunft": "material" },
      { "code": "    digitalWrite(LED, HIGH);", "kommentar": "dann soll die LED leuchten", "herkunft": "material" },
      { "code": "    delay(5000);", "kommentar": "und zwar für 5 Sekunden (5000 Millisekunden)", "herkunft": "angepasst" },
      { "code": "    digitalWrite(LED, LOW);", "kommentar": "danach soll die LED aus sein", "herkunft": "material" },
      { "code": "  }", "kommentar": "Programmabschnitt des IF-Befehls schließen", "herkunft": "material" },
      { "code": "  else", "kommentar": "...ansonsten...", "herkunft": "material" },
      { "code": "  {", "kommentar": "Programmabschnitt des else-Befehls öffnen", "herkunft": "material" },
      { "code": "    digitalWrite(LED, LOW);", "kommentar": "...soll die LED aus sein", "herkunft": "material" },
      { "code": "  }", "kommentar": "Programmabschnitt des else-Befehls schließen", "herkunft": "material" },
      { "code": "}", "kommentar": "Mit dieser letzten Klammer wird der Loop-Teil geschlossen", "herkunft": "material" }
    ]
  },

  // ------------------------------------------------------------------
  {
    "id": "motor",
    "titel": "DC-Motor mit Motortreiber",
    "auftrag": "Der Motor dreht sich zwei Sekunden in die eine Richtung, zwei Sekunden in die andere Richtung und steht dann zwei Sekunden still.",
    "dokument": "Arbeitsblatt DC-Motor Praxis",
    "zeilen": [
      { "code": "int ENB = 3;", "kommentar": "Das Wort „ENB“ steht jetzt für den Wert 3", "herkunft": "neu" },
      { "code": "int in4 = 7;", "kommentar": "Das Wort „in4“ steht jetzt für den Wert 7", "herkunft": "neu" },
      { "code": "int in3 = 8;", "kommentar": "Das Wort „in3“ steht jetzt für den Wert 8", "herkunft": "neu" },
      { "code": "void setup()", "kommentar": "Hier beginnt das Setup.", "herkunft": "neu", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  pinMode(ENB, OUTPUT);", "kommentar": "Der als ENB definierte Pin 3 wird als Ausgang definiert.", "herkunft": "angepasst" },
      { "code": "  pinMode(in3, OUTPUT);", "kommentar": "Der als in3 definierte Pin 8 wird als Ausgang definiert.", "herkunft": "material" },
      { "code": "  pinMode(in4, OUTPUT);", "kommentar": "Der als in4 definierte Pin 7 wird als Ausgang definiert.", "herkunft": "material" },
      { "code": "}" },
      { "code": "void loop()", "kommentar": "Hier beginnt der Loop-Teil. Er wird immer wieder wiederholt.", "herkunft": "neu", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  digitalWrite(in3, HIGH);", "kommentar": "Der Motor beginnt zu rotieren.", "herkunft": "angepasst" },
      { "code": "  digitalWrite(in4, LOW);", "kommentar": "in4 bekommt LOW. Zusammen mit in3 = HIGH legt das die Drehrichtung fest.", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  analogWrite(ENB, 200);", "kommentar": "Der Motor hat eine Geschwindigkeit von „200“.", "herkunft": "angepasst", "dokument": "Aufschrieb Gleichstrommotor" },
      { "code": "  delay(2000);", "kommentar": "Zwei Sekunden Verzögerung.", "herkunft": "material" },
      { "code": "  digitalWrite(in3, LOW);", "kommentar": "Durch die Veränderung von HIGH auf LOW (bzw. LOW auf HIGH) wird die Richtung der Rotation verändert.", "herkunft": "material" },
      { "code": "  digitalWrite(in4, HIGH);", "kommentar": "in4 bekommt HIGH, in3 ist jetzt LOW: Der Motor dreht sich andersherum.", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  delay(2000);", "kommentar": "Zwei Sekunden Verzögerung.", "herkunft": "neu" },
      { "code": "  digitalWrite(in3, LOW);", "kommentar": "Der Motor hört auf zu rotieren.", "herkunft": "angepasst" },
      { "code": "  digitalWrite(in4, LOW);", "kommentar": "in3 und in4 sind beide LOW: Der Motor bekommt keine Spannung mehr.", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  delay(2000);", "kommentar": "Zwei Sekunden Verzögerung.", "herkunft": "neu" },
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
      { "code": "#include <Servo.h>", "kommentar": "Die Servo-Bibliothek wird eingebunden. Sie kümmert sich darum, dass der Servo die richtigen Signale bekommt.", "herkunft": "neu" },
      { "code": "Servo S1;", "kommentar": "Für jeden angeschlossenen Servo legt man ein Objekt an. Man kann jeden gültigen Variablennamen benutzen: S1, Klaus, Nepomuk…", "herkunft": "material" },
      { "code": "int taster = 2;", "kommentar": "Das Wort „taster“ steht jetzt für den Wert 2", "herkunft": "angepasst", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "void setup()", "kommentar": "Hier beginnt das Setup.", "herkunft": "material", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  S1.attach(9);", "kommentar": "Hier wird der Servo an Pin 9 initialisiert.", "herkunft": "material" },
      { "code": "  pinMode(taster, INPUT_PULLUP);", "kommentar": "Der Pin mit dem Taster (Pin 2) ist jetzt ein Eingang mit zugeschaltetem, internen Widerstand", "herkunft": "angepasst", "dokument": "Aufschrieb Taster" },
      { "code": "  S1.write(0);", "kommentar": "Startposition: Der Servo fährt auf 0 Grad.", "herkunft": "neu" },
      { "code": "}" },
      { "code": "void loop()" },
      { "code": "{", "kommentar": "Mit dieser Klammer wird der Loop-Teil geöffnet.", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "  if (digitalRead(taster) == LOW)", "kommentar": "Der als taster definierte Pin 2 wird ausgelesen, FALLS das ausgelesene Spannungssignal niedrig ist (Taster gedrückt)…", "herkunft": "angepasst", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  {" },
      { "code": "    S1.write(90);", "kommentar": "dann fährt der Servo auf 90 Grad", "herkunft": "neu" },
      { "code": "    delay(1000);", "kommentar": "und bleibt dort eine Sekunde (1000 Millisekunden)", "herkunft": "neu" },
      { "code": "  }" },
      { "code": "  else", "kommentar": "...ansonsten...", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "  {" },
      { "code": "    S1.write(0);", "kommentar": "...fährt der Servo zurück auf die Startposition 0 Grad", "herkunft": "neu" },
      { "code": "  }" },
      { "code": "}", "kommentar": "Mit dieser letzten Klammer wird der Loop-Teil geschlossen", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" }
    ]
  },

  // ------------------------------------------------------------------
  // Nach dem Programmablaufplan aus dem Aufschrieb Servomotor (6a):
  // Taster gedrückt? ja -> Servoarm 90° -> Motor an -> 2 s -> Motor aus
  //                  nein -> Motor aus (und Servo zurück auf 0°)
  {
    "id": "alles",
    "titel": "DC-Motor, Taster und Servo",
    "auftrag": "Wird der Taster gedrückt, fährt der Servoarm auf 90 Grad und der Motor dreht sich zwei Sekunden lang. Sonst ist der Motor aus und der Servo steht auf 0 Grad.",
    "dokument": "Aufschrieb Servomotor",
    "zeilen": [
      { "code": "#include <Servo.h>", "kommentar": "Die Servo-Bibliothek wird eingebunden. Sie kümmert sich darum, dass der Servo die richtigen Signale bekommt.", "herkunft": "neu", "dokument": "Arbeitsblatt Servomotor" },
      { "code": "Servo S1;", "kommentar": "Für jeden angeschlossenen Servo legt man ein Objekt an. Man kann jeden gültigen Variablennamen benutzen: S1, Klaus, Nepomuk…", "herkunft": "material", "dokument": "Arbeitsblatt Servomotor" },
      { "code": "int ENB = 3;", "kommentar": "Das Wort „ENB“ steht jetzt für den Wert 3", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "int in4 = 7;", "kommentar": "Das Wort „in4“ steht jetzt für den Wert 7", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "int in3 = 8;", "kommentar": "Das Wort „in3“ steht jetzt für den Wert 8", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "int taster = 2;", "kommentar": "Das Wort „taster“ steht jetzt für den Wert 2", "herkunft": "angepasst", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "void setup()", "kommentar": "Hier beginnt das Setup.", "herkunft": "material", "dokument": "Arbeitsblatt Ampel und PAP" },
      { "code": "{" },
      { "code": "  S1.attach(9);", "kommentar": "Hier wird der Servo an Pin 9 initialisiert.", "herkunft": "material", "dokument": "Arbeitsblatt Servomotor" },
      { "code": "  pinMode(ENB, OUTPUT);", "kommentar": "Der als ENB definierte Pin 3 wird als Ausgang definiert.", "herkunft": "angepasst", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "  pinMode(in3, OUTPUT);", "kommentar": "Der als in3 definierte Pin 8 wird als Ausgang definiert.", "herkunft": "material", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "  pinMode(in4, OUTPUT);", "kommentar": "Der als in4 definierte Pin 7 wird als Ausgang definiert.", "herkunft": "material", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "  pinMode(taster, INPUT_PULLUP);", "kommentar": "Der Pin mit dem Taster (Pin 2) ist jetzt ein Eingang mit zugeschaltetem, internen Widerstand", "herkunft": "angepasst", "dokument": "Aufschrieb Taster" },
      { "code": "  S1.write(0);", "kommentar": "Startposition: Der Servo fährt auf 0 Grad.", "herkunft": "neu", "dokument": "Arbeitsblatt Servomotor" },
      { "code": "}" },
      { "code": "void loop()" },
      { "code": "{", "kommentar": "Mit dieser Klammer wird der Loop-Teil geöffnet.", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "  if (digitalRead(taster) == LOW)", "kommentar": "Der als taster definierte Pin 2 wird ausgelesen, FALLS das ausgelesene Spannungssignal niedrig ist (Taster gedrückt)…", "herkunft": "angepasst", "dokument": "Arbeitsblatt Taster Theorie" },
      { "code": "  {" },
      { "code": "    S1.write(90);", "kommentar": "dann fährt der Servoarm auf 90 Grad", "herkunft": "neu" },
      { "code": "    digitalWrite(in3, HIGH);", "kommentar": "Der Motor beginnt zu rotieren.", "herkunft": "angepasst", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "    digitalWrite(in4, LOW);", "kommentar": "in4 bekommt LOW. Zusammen mit in3 = HIGH legt das die Drehrichtung fest.", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "    analogWrite(ENB, 200);", "kommentar": "Der Motor hat eine Geschwindigkeit von „200“.", "herkunft": "angepasst", "dokument": "Aufschrieb Gleichstrommotor" },
      { "code": "    delay(2000);", "kommentar": "Zwei Sekunden Verzögerung.", "herkunft": "material", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "    digitalWrite(in3, LOW);", "kommentar": "Der Motor hört auf zu rotieren.", "herkunft": "angepasst", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "    digitalWrite(in4, LOW);", "kommentar": "in3 und in4 sind beide LOW: Der Motor bekommt keine Spannung mehr.", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Theorie" },
      { "code": "  }" },
      { "code": "  else", "kommentar": "...ansonsten...", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" },
      { "code": "  {" },
      { "code": "    digitalWrite(in3, LOW);", "kommentar": "...bleibt der Motor aus", "herkunft": "neu", "dokument": "Arbeitsblatt DC-Motor Praxis" },
      { "code": "    digitalWrite(in4, LOW);" },
      { "code": "    S1.write(0);", "kommentar": "...und der Servo fährt zurück auf die Startposition 0 Grad", "herkunft": "neu" },
      { "code": "  }" },
      { "code": "}", "kommentar": "Mit dieser letzten Klammer wird der Loop-Teil geschlossen", "herkunft": "material", "dokument": "Arbeitsblatt Taster Praxis" }
    ]
  }
];
