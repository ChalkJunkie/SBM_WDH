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
// Alle Texte sind von mir und stehen in ZU_PRUEFEN.md (Abschnitt J).
// =====================================================================
DATEN.lesen = [
  {
    "id": 1,
    "titel": "Lisas Seifenblasenmaschine",
    "einleitung": "In Klassenarbeiten geht oft etwas schief, weil man die Aufgabe nicht genau gelesen hat. Lies die Aufgabe links genau. Du musst sie nicht lösen! Beantworte nur die Fragen dazu.",
    "blatt": {
      "titel": "Aufgabe 3: Die Seifenblasenmaschine (8 Punkte)",
      "saetze": [
        { "id": "s1", "text": "Lisas Seifenblasenmaschine besteht aus einem Arduino, einem Servo, einem DC-Motor mit Lüfterrad am Motortreiber L298N und einem zweibeinigen Taster." },
        { "id": "s2", "text": "Der Servo hält einen Ring, der nach dem Einschalten in der Seifenlauge hängt (0 Grad)." },
        { "id": "s3", "text": "Solange niemand den Taster drückt, bleibt der Ring in der Lauge und der Lüfter ist aus." },
        { "id": "s4", "text": "Drückt man den Taster, fährt der Servo auf 90 Grad und hebt den Ring vor den Lüfter.", "absatz": true },
        { "id": "s5", "text": "Erst wenn der Ring oben ist, soll der Lüfter mit der Geschwindigkeit 150 anlaufen." },
        { "id": "s6", "text": "Nach 3 Sekunden geht der Lüfter wieder aus, und der Servo fährt zurück auf 0 Grad." },
        { "id": "s7", "text": "Lisa hat den Taster an Pin 4 und den Servo an Pin 9 angeschlossen. Am Motortreiber hat sie nichts verändert.", "absatz": true },
        { "id": "s8a", "text": "Zeichne einen Programmablaufplan für das Programm.", "teil": "a)" },
        { "id": "s8b", "text": "Du musst den Code nicht schreiben. (4 P.)" },
        { "id": "s9", "text": "Lisas Lüfter startet gleichzeitig mit dem Servo. Beschreibe, was dann mit dem Seifenfilm im Ring passiert, und begründe, warum der Lüfter erst später starten soll. (3 P.)", "teil": "b)" },
        { "id": "s10", "text": "Nenne den pinMode-Befehl für Lisas Taster. (1 P.)", "teil": "c)" }
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
          "Lüfter an und Servo auf 90 Grad gleichzeitig → 3 Sekunden → beides zurück",
          "Servo auf 90 Grad → 3 Sekunden warten → Lüfter an → Servo auf 0 Grad",
          "Servo auf 90 Grad → Lüfter an → 3 Sekunden → Lüfter aus und Servo auf 0 Grad"
        ],
        "richtig": 2,
        "saetze": ["s4", "s5", "s6"],
        "tipp": "Geh die markierten Sätze Schritt für Schritt durch. Achte auf „Erst wenn“ und „Nach 3 Sekunden“."
      },
      {
        "frage": "Wie schnell soll der Lüfter laufen?",
        "antworten": [
          "Mit der Geschwindigkeit 150.",
          "Mit voller Geschwindigkeit (255).",
          "Das steht nicht im Text."
        ],
        "richtig": 0,
        "saetze": ["s5"],
        "tipp": "Die Zahl steht im Text. Lies den markierten Satz noch einmal."
      },
      {
        "frage": "Was bedeutet: „Erst wenn der Ring oben ist, soll der Lüfter … anlaufen“?",
        "antworten": [
          "Der Lüfter läuft, solange der Ring oben ist, also auch nach den 3 Sekunden weiter.",
          "Der Lüfter startet nach dem Servo, nicht vorher und nicht gleichzeitig.",
          "Der Lüfter startet nur beim ersten Drücken des Tasters."
        ],
        "richtig": 1,
        "saetze": ["s5", "s6"],
        "tipp": "„Erst wenn“ sagt etwas über den Zeitpunkt. Wann der Lüfter wieder ausgeht, steht im nächsten Satz."
      },
      {
        "frage": "Teilaufgabe b) enthält zwei Operatoren. Was musst du tun?",
        "antworten": [
          "Nur begründen, warum der Lüfter später starten soll.",
          "Beschreiben, wie man das Programm ändert, damit der Lüfter später startet.",
          "Beschreiben, was mit dem Seifenfilm passiert, UND begründen, warum der Lüfter später starten soll."
        ],
        "richtig": 2,
        "saetze": ["s9"],
        "tipp": "Suche in b) die Verben, die dir sagen, was du tun sollst. Achte auf das Wort „und“."
      },
      {
        "frage": "Was passiert laut Aufgabe, wenn man den Taster drückt, während der Lüfter schon läuft?",
        "antworten": [
          "Der Lüfter geht sofort aus.",
          "Die 3 Sekunden beginnen von vorne.",
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
          "Lisa hat den Motortreiber an andere Pins angeschlossen als sonst.",
          "Der Lüfter läuft 3 Sekunden lang."
        ],
        "richtig": 1,
        "saetze": ["s6", "s7"],
        "tipp": "Achtung: Gesucht ist die Aussage, die NICHT stimmt. Prüfe jede Antwort an den markierten Sätzen."
      }
    ]
  }
];
