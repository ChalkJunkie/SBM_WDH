// =====================================================================
// data/hinweise.js – Alle Rückmeldungen beim Prüfen (Bereich 1)
// ---------------------------------------------------------------------
// text      Was die Schüler:innen lesen. Platzhalter:
//             {ziel}  = Anschluss am anderen Kabelende, z. B. "Arduino – 5V"
//             {pin}   = betroffener Anschluss
//             {kabel} = das Kabel, z. B. "Servo – rotes Kabel ↔ Arduino – 5V"
//             {wer}   = (nur pin_doppelt) was alles an dem Pin steckt
// dokument  Wo man nachschlagen kann (Kurzname aus dokumente.js).
//           "@aufgabe" = das erste Dokument der jeweiligen Aufgabe.
//           null = kein Dokument anzeigen.
// Alle Texte hier stammen NICHT wörtlich aus deinen Materialien und
// stehen deshalb auch in ZU_PRUEFEN.md.
// =====================================================================
DATEN.hinweise = {

  // ---------- Servo ----------
  "servo_rot_fehlt": {
    "text": "Das rote Kabel des Servos ist noch nicht angeschlossen.",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_braun_fehlt": {
    "text": "Das braune Kabel des Servos ist noch nicht angeschlossen.",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_orange_fehlt": {
    "text": "Das orange Kabel des Servos ist noch nicht angeschlossen.",
    "dokument": "Arbeitsblatt Servomotor"
  },
  "servo_rot_5v": {
    "text": "Das rote Kabel des Servos steckt an 5V. Im Unterricht betreiben wir den Servo mit einer kleineren Spannung.",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_rot_gnd": {
    "text": "Das rote Kabel des Servos steckt an GND. Rot ist beim Servo das Plus-Kabel. Hast du Rot und Braun vertauscht?",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_rot_falsch": {
    "text": "Das rote Kabel des Servos steckt an {ziel}. Rot ist das Plus-Kabel, es braucht die richtige Spannung.",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_braun_plus": {
    "text": "Das braune Kabel des Servos steckt an {ziel}. Braun ist beim Servo GND. Hast du Rot und Braun vertauscht?",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_braun_falsch": {
    "text": "Das braune Kabel des Servos steckt an {ziel}. Überlege, wofür das braune Kabel da ist.",
    "dokument": "Aufschrieb Servomotor"
  },
  "servo_orange_falsch": {
    "text": "Das orange Kabel des Servos steckt an {ziel}. Orange ist das Signalkabel, es gehört an einen Digitalpin.",
    "dokument": "Arbeitsblatt Servomotor"
  },
  "servo_pin_3_11": {
    "text": "Das Signalkabel des Servos steckt an {ziel}. Die Pins ~3 und ~11 halten wir für die Geschwindigkeit des Motors frei. Nimm einen anderen Digitalpin.",
    "dokument": "Arbeitsblatt Servomotor"
  },

  // ---------- Servo (Ergänzung) ----------
  "servo_gnd_treiber": {
    "text": "Das braune Kabel des Servos steckt am GND des Motortreibers. Schließe es direkt an einen GND-Pin des Arduino an.",
    "dokument": "Aufschrieb Servomotor"
  },

  // ---------- Taster ----------
  "taster_rot_fehlt": {
    "text": "Das rote Kabel des Tasters ist noch nicht angeschlossen.",
    "dokument": "Aufschrieb Taster"
  },
  "taster_schwarz_fehlt": {
    "text": "Das schwarze Kabel des Tasters ist noch nicht angeschlossen.",
    "dokument": "Aufschrieb Taster"
  },
  "taster_rot_gnd": {
    "text": "Das rote Kabel des Tasters steckt an GND. Bei uns kommt Rot an den Pin und Schwarz an GND. Hast du die beiden vertauscht?",
    "dokument": "Aufschrieb Taster"
  },
  "taster_rot_falsch": {
    "text": "Das rote Kabel des Tasters steckt an {ziel}. Rot gehört an einen Digitalpin, den das Programm abfragen kann.",
    "dokument": "Aufschrieb Taster"
  },
  "taster_schwarz_pin": {
    "text": "Das schwarze Kabel des Tasters steckt an {ziel}. Beim zweibeinigen Taster kommt ein Kabel an einen Pin und eines an GND.",
    "dokument": "Arbeitsblatt Taster Theorie"
  },
  "taster_schwarz_plus": {
    "text": "Das schwarze Kabel des Tasters steckt an {ziel}. Mit INPUT_PULLUP liefert der Arduino die Spannung über den internen Widerstand selbst. Das schwarze Kabel gehört an GND.",
    "dokument": "Arbeitsblatt Taster Theorie"
  },
  "taster_schwarz_falsch": {
    "text": "Das schwarze Kabel des Tasters steckt an {ziel}. Überlege, wohin das schwarze Kabel beim zweibeinigen Taster gehört.",
    "dokument": "Aufschrieb Taster"
  },
  "taster_gnd_treiber": {
    "text": "Das schwarze Kabel des Tasters steckt am GND des Motortreibers. Schließe es direkt an einen GND-Pin des Arduino an.",
    "dokument": "Aufschrieb Taster"
  },

  // ---------- DC-Motor, Motortreiber, Batterie ----------
  "batterie_fehlt": {
    "text": "Die 9-V-Batterie ist noch nicht angeschlossen.",
    "dokument": "Arbeitsblatt DC-Motor Praxis"
  },
  "batterie_an_treiber": {
    "text": "Die Batterie steckt am Motortreiber ({ziel}). Bei uns kommt die Batterie über den Adapter an den Arduino.",
    "dokument": "Arbeitsblatt DC-Motor Praxis"
  },
  "batterie_falsch": {
    "text": "Die Batterie steckt an {ziel}. Überlege, wo der Adapter der Batterie am Arduino hineinpasst.",
    "dokument": "Arbeitsblatt DC-Motor Praxis"
  },
  "treiber_12v_fehlt": {
    "text": "Der Motortreiber bekommt noch keinen Strom: An der Klemme +12V steckt kein Kabel.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "treiber_12v_falsch": {
    "text": "Die Klemme +12V des Motortreibers steckt an {ziel}. Der Motor braucht die Spannung der Batterie, und die kommt am Arduino an einem bestimmten Pin heraus.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "vin_falsche_klemme": {
    "text": "VIN steckt am Motortreiber an der falschen Klemme ({ziel}). Schau dir die drei Klemmen am Motortreiber genau an.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "treiber_5v_nicht_gebraucht": {
    "text": "Die Klemme +5V des Motortreibers brauchen wir nicht. Das Kabel {kabel} kann weg.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "treiber_gnd_fehlt": {
    "text": "Es fehlt noch eine Verbindung vom GND des Motortreibers zum Arduino.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "treiber_gnd_falsch": {
    "text": "Die GND-Klemme des Motortreibers steckt an {ziel}. Arduino und Motortreiber brauchen dasselbe GND (gleiches Nullpotential), sonst kommen die Signale nicht an.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "enable_fehlt": {
    "text": "{pin} ist noch nicht angeschlossen. Über diesen Pin wird die Geschwindigkeit des Motors gesteuert.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "enable_kein_pwm": {
    "text": "{pin} steckt an {ziel}. Für die Geschwindigkeit braucht der Enable-Pin einen Pin mit ~ (PWM).",
    "dokument": "Aufschrieb Gleichstrommotor"
  },
  "enable_an_versorgung": {
    "text": "{pin} steckt an {ziel}. Der Enable-Pin wird vom Arduino über einen Pin mit ~ (PWM) gesteuert.",
    "dokument": "Aufschrieb Gleichstrommotor"
  },
  "enable_9_10": {
    "text": "{pin} steckt an {ziel}. Das ist zwar ein PWM-Pin, aber die Servo-Bibliothek nutzt für die Pins 9 und 10 denselben Timer. Dort ist dann keine PWM-Ausgabe mehr möglich, und du könntest die Geschwindigkeit des Motors nicht steuern. Bitte wähle einen anderen PWM-Pin.",
    "dokument": "Arbeitsblatt Servomotor"
  },
  "in_fehlt": {
    "text": "{pin} ist noch nicht angeschlossen. Über die IN-Pins wird die Drehrichtung des Motors gesteuert.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "in_falsch": {
    "text": "{pin} steckt an {ziel}. Die IN-Pins werden vom Arduino über Digitalpins gesteuert.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "motor_kabel_fehlt": {
    "text": "{pin} ist noch nicht angeschlossen.",
    "dokument": "Arbeitsblatt DC-Motor Praxis"
  },
  "motor_falsch": {
    "text": "{pin} steckt an {ziel}. Der Motor wird an eine der blauen Motorklemmen des Motortreibers angeschlossen.",
    "dokument": "Arbeitsblatt DC-Motor Praxis"
  },
  "motor_falsche_klemme_b": {
    "text": "Der Motor hängt an der Klemme Motor A. Gesteuert wird er aber über ENB, IN3 und IN4, und die gehören zu Motor B.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "motor_falsche_klemme_a": {
    "text": "Der Motor hängt an der Klemme Motor B. Gesteuert wird er aber über ENA, IN1 und IN2, und die gehören zu Motor A.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "gemischt_b": {
    "text": "{pin} gehört zu Motor A. Dein Motor wird aber über Motor B gesteuert (ENB, IN3, IN4). Mische die beiden Seiten nicht.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },
  "gemischt_a": {
    "text": "{pin} gehört zu Motor B. Dein Motor wird aber über Motor A gesteuert (ENA, IN1, IN2). Mische die beiden Seiten nicht.",
    "dokument": "Arbeitsblatt DC-Motor Theorie"
  },

  // ---------- Allgemein ----------
  "pin_rx_tx": {
    "text": "Ein Kabel steckt an {ziel}. Die Pins 0 und 1 (RX/TX) benutzen wir nicht. Nimm einen Digitalpin von 2 bis 13.",
    "dokument": null
  },
  "pin_analog": {
    "text": "Ein Kabel steckt an {ziel}. A0 bis A5 sind analoge Eingänge, die benutzen wir hier nicht. Nimm einen Digitalpin von 2 bis 13.",
    "dokument": null
  },
  "pin_doppelt": {
    "text": "An {pin} stecken mehrere Kabel ({wer}). Jeder Pin darf nur einmal belegt sein (außer GND, 3V3, 5V und VIN).",
    "dokument": "@aufgabe"
  },
  "mehrere_kabel_am_anschluss": {
    "text": "An {pin} stecken mehrere Kabel. Jeder Anschluss eines Bauteils bekommt genau ein Kabel.",
    "dokument": "@aufgabe"
  },
  "kabel_nicht_gebraucht": {
    "text": "Das Kabel {kabel} wird in dieser Aufgabe nicht gebraucht.",
    "dokument": "@aufgabe"
  },
  "bauteile_direkt": {
    "text": "Das Kabel {kabel} verbindet zwei Bauteile direkt miteinander. Schließe jedes Bauteil direkt an den richtigen Anschluss an.",
    "dokument": "@aufgabe"
  },
  "kurzschluss": {
    "text": "Achtung, Kurzschluss! {pin} ist über deine Kabel direkt mit GND verbunden. Das kann den Arduino beschädigen.",
    "dokument": null
  }
};
