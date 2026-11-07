// =====================================================================
// data/lesen.js – Bereich 3: Genau lesen (Leseverständnis)
// ---------------------------------------------------------------------
// Adresse: lesen.html?aufgabe=1
//
// Eine Aufgabe besteht aus
//   einleitung  kurzer Text über der Aufgabe
//   blatt       die Aufgabenstellung wie in einer Klassenarbeit:
//               titel und eine Liste von Sätzen. Jeder Satz hat eine id,
//               damit die Fragen auf ihn zeigen können. "absatz": true
//               beginnt einen neuen Absatz, "teil": "a)" einen Aufgabenteil.
//   fragen      frage      Text der Frage
//               antworten  Liste der Antworten
//               richtig    Nummer der richtigen Antwort (0 = erste)
//               saetze     ids der Sätze, die beim Fehler markiert werden
//               tipp       Hinweis bei falscher Antwort (verrät die Lösung nicht)
// Ein Stern gibt es, wenn alle Fragen richtig beantwortet sind.
// =====================================================================
DATEN.lesen = [
  {
    "id": 1,
    "titel": "Tims Snackautomat",
    "einleitung": "In Klassenarbeiten geht oft etwas schief, weil man die Aufgabe nicht genau gelesen hat. Lies die Aufgabe genau. Du musst sie nicht lösen! Beantworte nur die Fragen dazu.",
    "blatt": {
      "titel": "Aufgabe 3: Der Snackautomat (8 Punkte)",
      "saetze": [
        { "id": "s1", "text": "Tims Snackautomat besteht aus einem Arduino, einem DC-Motor am Motortreiber L298N, einem Servo und einem zweibeinigen Taster." },
        { "id": "s2", "text": "Der DC-Motor dreht eine Spirale, die einen Schokoriegel nach vorne schiebt. Der Servo bewegt die Ausgabeklappe." },
        { "id": "s3", "text": "Solange niemand den Taster drückt, steht der Motor still und die Klappe ist geschlossen (0 Grad)." },
        { "id": "s4", "text": "Drückt man den Taster, dreht sich die Spirale 2 Sekunden lang mit der Geschwindigkeit 180.", "absatz": true },
        { "id": "s5", "text": "Erst wenn die Spirale wieder stillsteht, öffnet der Servo die Klappe (90 Grad)." },
        { "id": "s6", "text": "Nach 5 Sekunden schließt sich die Klappe wieder." },
        { "id": "s7", "text": "Tim hat den Taster an Pin 4 und den Servo an Pin 9 angeschlossen. Am Motortreiber hat er nichts verändert.", "absatz": true },
        { "id": "s8a", "text": "Zeichne einen Programmablaufplan für das Programm.", "teil": "a)" },
        { "id": "s8b", "text": "Du musst den Code nicht schreiben. (4 P.)" },
        { "id": "s9", "text": "Bei Tim öffnet sich die Klappe gleichzeitig mit dem Start der Spirale. Beschreibe, was dann passieren kann, und begründe, warum die Klappe erst später öffnen soll. (3 P.)", "teil": "b)" },
        { "id": "s10", "text": "Nenne den pinMode-Befehl für Tims Taster. (1 P.)", "teil": "c)" }
      ]
    },
    "fragen": [
      {
        "frage": "Was sollst du in Teilaufgabe a) abgeben?",
        "antworten": [
          "Einen Programmablaufplan und das fertige Programm.",
          "Nur einen Programmablaufplan.",
          "Nur das fertige Programm."
        ],
        "richtig": 1,
        "saetze": ["s8a", "s8b"],
        "tipp": "Lies Teilaufgabe a) bis zum Ende. Der zweite Satz ist wichtig."
      },
      {
        "frage": "In welcher Reihenfolge passiert alles, wenn man den Taster drückt?",
        "antworten": [
          "Spirale an und Klappe auf gleichzeitig → 2 Sekunden → beides zurück",
          "Klappe auf → Spirale 2 Sekunden → Klappe zu",
          "Spirale 2 Sekunden → Spirale aus → Klappe auf → 5 Sekunden → Klappe zu"
        ],
        "richtig": 2,
        "saetze": ["s4", "s5", "s6"],
        "tipp": "Geh die markierten Sätze Schritt für Schritt durch. Achte auf „Erst wenn“ und „Nach 5 Sekunden“."
      },
      {
        "frage": "Wie schnell dreht sich die Spirale?",
        "antworten": [
          "Mit der Geschwindigkeit 180.",
          "Mit voller Geschwindigkeit (255).",
          "Das steht nicht im Text."
        ],
        "richtig": 0,
        "saetze": ["s4"],
        "tipp": "Die Zahl steht im Text. Lies den markierten Satz noch einmal."
      },
      {
        "frage": "Was bedeutet: „Erst wenn die Spirale wieder stillsteht, öffnet der Servo die Klappe“?",
        "antworten": [
          "Die Klappe bleibt offen, solange die Spirale stillsteht, also auch nach den 5 Sekunden.",
          "Die Klappe öffnet nach der Spirale, nicht vorher und nicht gleichzeitig.",
          "Die Klappe öffnet nur beim ersten Drücken des Tasters."
        ],
        "richtig": 1,
        "saetze": ["s5", "s6"],
        "tipp": "„Erst wenn“ sagt etwas über den Zeitpunkt. Wann die Klappe wieder zugeht, steht im nächsten Satz."
      },
      {
        "frage": "Teilaufgabe b) enthält zwei Operatoren. Was musst du tun?",
        "antworten": [
          "Nur begründen, warum die Klappe erst später öffnen soll.",
          "Beschreiben, wie man das Programm ändert, damit die Klappe später öffnet.",
          "Beschreiben, was dann passieren kann, UND begründen, warum die Klappe erst später öffnen soll."
        ],
        "richtig": 2,
        "saetze": ["s9"],
        "tipp": "Suche in b) die Verben, die dir sagen, was du tun sollst. Achte auf das Wort „und“."
      },
      {
        "frage": "Was passiert laut Aufgabe, wenn man den Taster drückt, während die Klappe offen ist?",
        "antworten": [
          "Die Klappe geht sofort zu.",
          "Die 5 Sekunden beginnen von vorne.",
          "Das steht nicht in der Aufgabe."
        ],
        "richtig": 2,
        "saetze": ["s4", "s5", "s6"],
        "tipp": "Suche in den markierten Sätzen genau diesen Fall. Findest du ihn wirklich?"
      },
      {
        "frage": "Welcher Befehl ist in Teilaufgabe c) richtig?",
        "antworten": [
          "pinMode(9, INPUT_PULLUP);",
          "pinMode(4, INPUT_PULLUP);",
          "pinMode(4, INPUT);"
        ],
        "richtig": 1,
        "saetze": ["s1", "s7", "s10"],
        "tipp": "Zwei Dinge stehen an verschiedenen Stellen im Text: An welchem Pin hängt der Taster? Und was für ein Taster ist es?"
      },
      {
        "frage": "Welche Aussage passt NICHT zur Aufgabe?",
        "antworten": [
          "Der Servo hängt an Pin 9.",
          "Tim hat den Motortreiber an andere Pins angeschlossen als sonst.",
          "Die Klappe bleibt 5 Sekunden offen."
        ],
        "richtig": 1,
        "saetze": ["s6", "s7"],
        "tipp": "Achtung: Gesucht ist die Aussage, die NICHT stimmt. Prüfe jede Antwort an den markierten Sätzen."
      }
    ]
  }
];
