// =====================================================================
// data/vergleich.js – Bereich 2, Teil C: Zwei- oder vierbeiniger Taster?
// ---------------------------------------------------------------------
// Zwei Übungen (Adresse: vergleich.html?uebung=sortieren bzw. =schaltung)
//
// sortieren: Karten in die richtige Spalte legen
//   karten: text      was auf der Karte steht
//           spalte    "zwei" oder "vier"
//           code      true = als Code anzeigen
//           dokument  wo man nachschlagen kann
//
// schaltung: Zu jeder Frage die passende Schaltung antippen
//   fragen: frage     Text der Frage
//           code      (freiwillig) Codezeilen, die gezeigt werden
//           richtig   "zwei", "vier" oder "keine"
//           erklaerung, dokument
// Alle Texte sind von mir und stehen in ZU_PRUEFEN.md.
// =====================================================================
DATEN.vergleich = [

  {
    "id": "sortieren",
    "titel": "Zwei- oder vierbeinig?",
    "auftrag": "Gehört die Karte zum zweibeinigen oder zum vierbeinigen Taster? Ziehe jede Karte seitlich in die passende Spalte. Falsch einsortiert? Einfach zurück nach links oder in die andere Spalte ziehen. Neu einsortierte Karten stehen oben.",
    "spalten": [
      { "id": "zwei", "titel": "Zweibeiniger Taster", "untertitel": "interner Widerstand", "bild": "assets/Taster_neu.png" },
      { "id": "vier", "titel": "Vierbeiniger Taster", "untertitel": "externer Widerstand", "bild": "assets/Taster.png" }
    ],
    "karten": [
      { "text": "pinMode(taster, INPUT_PULLUP);", "spalte": "zwei", "code": true, "dokument": "Aufschrieb Taster" },
      { "text": "pinMode(taster, INPUT);", "spalte": "vier", "code": true, "dokument": "Aufschrieb Taster" },
      { "text": "if (digitalRead(taster) == LOW)", "spalte": "zwei", "code": true, "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "if (digitalRead(taster) == HIGH)", "spalte": "vier", "code": true, "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Der Widerstand ist im Arduino eingebaut.", "spalte": "zwei", "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Ein 10-kΩ-Widerstand steckt auf dem Breadboard.", "spalte": "vier", "dokument": "Aufschrieb Taster" },
      { "text": "Rotes Kabel an den Pin, schwarzes Kabel an GND.", "spalte": "zwei", "dokument": "Aufschrieb Taster" },
      { "text": "Ein Bein an 5V, das diagonale Bein an den Pin.", "spalte": "vier", "dokument": "Aufschrieb Taster" },
      { "text": "Der Widerstand liegt zwischen Pin und GND (Pulldown).", "spalte": "vier", "dokument": "Aufschrieb Taster" },
      { "text": "Gedrückt: Der Pin wird mit GND verbunden und ist LOW.", "spalte": "zwei", "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Gedrückt: Der Pin bekommt 5V und ist HIGH.", "spalte": "vier", "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Nicht gedrückt: Der Widerstand zieht den Pin auf HIGH (Pullup).", "spalte": "zwei", "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Nicht gedrückt: Der Widerstand zieht den Pin auf LOW (Pulldown).", "spalte": "vier", "dokument": "Arbeitsblatt Taster Theorie" },
      { "text": "Immer diagonal anschließen, sonst droht ein Kurzschluss.", "spalte": "vier", "dokument": "Arbeitsblatt Taster Theorie" }
    ]
  },

  {
    "id": "schaltung",
    "titel": "Welche Schaltung passt?",
    "auftrag": "Lies die Frage und tippe die passende Schaltung an.",
    "antworten": [
      { "id": "zwei", "titel": "Zweibeiniger Taster", "text": "Rotes Kabel an Pin 2, schwarzes Kabel an GND", "bild": "assets/Taster_neu.png" },
      { "id": "vier", "titel": "Vierbeiniger Taster", "text": "Ein Bein an 5V, das diagonale Bein an Pin 2, 10 kΩ von Pin 2 nach GND", "bild": "assets/Taster.png" },
      { "id": "keine", "titel": "Passt zu keiner", "text": "Hier stimmt etwas nicht zusammen." }
    ],
    "fragen": [
      {
        "frage": "Zu welcher Schaltung passt dieser Code?",
        "code": ["pinMode(taster, INPUT_PULLUP);", "if (digitalRead(taster) == LOW)"],
        "richtig": "zwei",
        "erklaerung": "INPUT_PULLUP schaltet den internen Widerstand ein, und gedrückt ist der Pin LOW. Das ist der zweibeinige Taster.",
        "dokument": "Aufschrieb Taster"
      },
      {
        "frage": "Zu welcher Schaltung passt dieser Code?",
        "code": ["pinMode(taster, INPUT);", "if (digitalRead(taster) == HIGH)"],
        "richtig": "vier",
        "erklaerung": "INPUT ohne internen Widerstand und gedrückt HIGH: Der Pulldown-Widerstand steckt außen auf dem Breadboard. Das ist der vierbeinige Taster.",
        "dokument": "Aufschrieb Taster"
      },
      {
        "frage": "Bei welcher Schaltung ist der Pin LOW, solange niemand drückt?",
        "richtig": "vier",
        "erklaerung": "Der Pulldown-Widerstand zieht den Pin nach GND, also auf LOW. Erst beim Drücken kommen 5V an.",
        "dokument": "Arbeitsblatt Taster Theorie"
      },
      {
        "frage": "Bei welcher Schaltung brauchst du ein Breadboard und einen zusätzlichen Widerstand?",
        "richtig": "vier",
        "erklaerung": "Beim vierbeinigen Taster verwenden wir einen externen 10-kΩ-Widerstand auf dem Breadboard.",
        "dokument": "Aufschrieb Taster"
      },
      {
        "frage": "Bei welcher Schaltung wird der Widerstand erst durch den Code „zugeschaltet“?",
        "richtig": "zwei",
        "erklaerung": "pinMode(taster, INPUT_PULLUP); schaltet den internen Pullup-Widerstand im Arduino zu.",
        "dokument": "Aufschrieb Taster"
      },
      {
        "frage": "Zu welcher Schaltung passt dieser Code?",
        "code": ["pinMode(taster, INPUT);", "if (digitalRead(taster) == LOW)"],
        "richtig": "keine",
        "erklaerung": "Vorsicht, Falle! INPUT gehört zum vierbeinigen Taster, == LOW als „gedrückt“ aber zum zweibeinigen. Dieser Code passt zu keiner der beiden Schaltungen.",
        "dokument": "Arbeitsblatt Taster Theorie"
      }
    ]
  }
];
