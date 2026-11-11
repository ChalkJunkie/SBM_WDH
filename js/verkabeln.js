// =====================================================================
// js/verkabeln.js – Ablauf von Bereich 1 (Verdrahtungsaufgaben)
// =====================================================================
(function () {

  // ---------- Welche Aufgabe? ----------
  var aufgaben = DATEN.aufgaben;
  var gewuenscht = parseInt(adressParameter("aufgabe"), 10);
  var aufgabe = aufgaben.filter(function (a) { return a.id === gewuenscht; })[0] || aufgaben[0];
  var speicherName = "verkabeln_" + aufgabe.id;

  // ---------- Kabelfarben ----------
  var FARBEN = [
    { name: "rot",     wert: "#d32020" },
    { name: "schwarz", wert: "#1e1e1e" },
    { name: "orange",  wert: "#f08a1c" },
    { name: "gelb",    wert: "#f2c200" },
    { name: "grün",    wert: "#2e9d4a" },
    { name: "blau",    wert: "#1f63d6" },
    { name: "lila",    wert: "#8e3fc4" },
    { name: "weiß",    wert: "#f4f4f4" }
  ];
  var WECHSELFARBEN = ["#1f63d6", "#2e9d4a", "#8e3fc4", "#f2c200", "#f08a1c"];
  var gewaehlteFarbe = "auto";
  var wechselZaehler = 0;

  // Farbe automatisch wählen: Bauteilkabel behalten ihre Farbe,
  // GND wird schwarz, Plus wird rot, sonst wechselnde Farben.
  function autoFarbe(a, b) {
    var pa = Pins.daten(a), pb = Pins.daten(b);
    if (pa && pa.farbe) return pa.farbe;
    if (pb && pb.farbe) return pb.farbe;
    var istGnd = function (s, p) { return (p && p.art === "gnd") || s === "treiber.GND"; };
    var istPlus = function (s, p) {
      return (p && (p.art === "plus" || p.art === "buchse")) || s === "batterie.stecker" ||
        s === "treiber.P12V" || s === "treiber.P5V";
    };
    if (istGnd(a, pa) || istGnd(b, pb)) return "#1e1e1e";
    if (istPlus(a, pa) || istPlus(b, pb)) return "#d32020";
    return WECHSELFARBEN[(wechselZaehler++) % WECHSELFARBEN.length];
  }

  // ---------- Zustand ----------
  var gespeichert = Speicher.lesen(speicherName, null) || {};
  var selbst = !!gespeichert.selbst;          // "Alles selbst verkabeln"
  // Eigene Kabel. Kabel an Anschlüssen, die es nicht (mehr) gibt, fallen weg
  // (z. B. aus einer älteren Version des Spiels).
  function gibtEs(k) { return !!Pins.daten(k.a) && !!Pins.daten(k.b); }
  var kabel = (gespeichert.kabel || []).filter(gibtEs);
  var vorgabeFarben = gespeichert.vorgabeFarben || {};   // Nummer des vorgegebenen Kabels -> eigene Farbe
  var festeWege = gespeichert.wege || {};                 // Kabel-ID -> von Hand verlegter Weg
  var verlauf = [];                           // für "Rückgängig"
  var naechsteId = 1;
  kabel.forEach(function (k) {
    var n = parseInt(String(k.id).replace(/\D/g, ""), 10);
    if (n >= naechsteId) naechsteId = n + 1;
  });

  // ---------- Vorgegebene Kabel aus der vorherigen Aufgabe ----------
  // Nur wenn die vorherige Aufgabe ("vorgaenger") gelöst ist, und zwar mit
  // der EIGENEN Lösung der Schüler:innen. Sonst startet das Brett leer,
  // damit niemand die Lösung geschenkt bekommt.
  var vorgabe = [];          // Liste von [a, b]
  var vorgabeFehlt = false;  // vorherige Aufgabe noch nicht gelöst
  if (aufgabe.vorgaenger) {
    if (Fortschritt.istGeloest("verkabeln", aufgabe.vorgaenger)) {
      vorgabe = (Speicher.lesen("loesung_" + aufgabe.vorgaenger, null) || aufgabe.vorverkabelt || [])
        .filter(function (paar) { return gibtEs({ a: paar[0], b: paar[1] }); });
    } else {
      vorgabeFehlt = true;
      selbst = true;
    }
  }

  function vorgegebeneKabel() {
    if (selbst) return [];
    return vorgabe.map(function (paar, i) {
      return { id: "v" + i, a: paar[0], b: paar[1], farbe: vorgabeFarben[i] || autoFarbeFest(paar[0], paar[1]), gesperrt: true,
               widerstand: paar[2] === "widerstand" || undefined };
    });
  }
  function autoFarbeFest(a, b) { var z = wechselZaehler; var f = autoFarbe(a, b); wechselZaehler = z; return f; }

  function alleKabel() { return vorgegebeneKabel().concat(kabel); }

  function speichern() {
    Speicher.schreiben(speicherName, { kabel: kabel, selbst: selbst, vorgabeFarben: vorgabeFarben, wege: festeWege });
  }

  // ---------- Seite aufbauen ----------
  if (DATEN.kalibrierTest) {
    var hinweis = document.createElement("div");
    hinweis.className = "datenfehler";
    hinweis.textContent = "Testmodus: Dieses Gerät benutzt die Pin-Werte aus dem Kalibriermodus, nicht aus data/pins.js.";
    document.body.insertBefore(hinweis, document.body.firstChild);
  }
  document.getElementById("titel").textContent = "Aufgabe " + aufgabe.id + ": " + aufgabe.titel;
  document.title = "Aufgabe " + aufgabe.id + " – Verkabeln";
  // Auftragstext: bei "Alles selbst verkabeln" ggf. ein eigener Text
  function zeigeAuftrag() {
    document.getElementById("auftrag").textContent =
      (selbst && aufgabe.auftragSelbst) ? aufgabe.auftragSelbst : aufgabe.auftrag;
  }
  zeigeAuftrag();

  var wahl = document.getElementById("aufgabenwahl");
  aufgaben.forEach(function (a) {
    var link = document.createElement("a");
    link.href = "verkabeln.html?aufgabe=" + a.id;
    link.className = "knopf rund" + (a.id === aufgabe.id ? " aktiv" : "");
    link.setAttribute("aria-label", "Aufgabe " + a.id + (Fortschritt.istGeloest("verkabeln", a.id) ? " (gelöst)" : ""));
    link.innerHTML = a.id + (Fortschritt.istGeloest("verkabeln", a.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(link);
  });

  // Vorherige Aufgabe noch nicht gelöst: Hinweis statt Vorgabe
  if (vorgabeFehlt) {
    var tipp = document.createElement("p");
    tipp.className = "tipp-vorgaenger";
    tipp.innerHTML = 'ℹ Tipp: Löse zuerst <a href="verkabeln.html?aufgabe=' + aufgabe.vorgaenger + '">Aufgabe ' +
      aufgabe.vorgaenger + "</a>. Dann ist deine Schaltung von dort hier schon gesteckt und du musst nur noch ergänzen.";
    var auftragEl = document.getElementById("auftrag");
    auftragEl.parentNode.insertBefore(tipp, auftragEl.nextSibling);
  }

  // "Alles selbst verkabeln" nur zeigen, wenn es Vorgaben gibt
  if (vorgabe.length) {
    var zeile = document.getElementById("selbstVerkabelnZeile");
    var box = document.getElementById("selbstVerkabeln");
    zeile.hidden = false;
    box.checked = selbst;
    box.addEventListener("change", function () {
      selbst = box.checked;
      zeigeAuftrag();
      kabel = []; verlauf = []; vorgabeFarben = {}; festeWege = {};
      kabelAbwaehlen();
      brett.setzeFesteWege(festeWege);
      speichern(); geaendert();
    });
  }

  // Farbwahl
  var farbwahl = document.getElementById("farbwahl");
  function farbknopf(wert, beschriftung, stil) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "farbe" + (wert === gewaehlteFarbe ? " aktiv" : "");
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", wert === gewaehlteFarbe ? "true" : "false");
    b.setAttribute("aria-label", "Kabelfarbe " + beschriftung);
    b.innerHTML = stil;
    b.setAttribute("data-farbe", wert);
    b.addEventListener("click", function () {
      if (gewaehltesKabel) { umfaerben(wert); return; }
      gewaehlteFarbe = wert;
      zeigeFarbe(wert);
    });
    farbwahl.appendChild(b);
  }
  // Markiert eine Farbe in der Farbwahl als aktiv
  function zeigeFarbe(wert) {
    Array.prototype.forEach.call(farbwahl.children, function (c) {
      var an = c.getAttribute("data-farbe") === wert;
      c.classList.toggle("aktiv", an); c.setAttribute("aria-checked", an ? "true" : "false");
    });
  }
  farbknopf("auto", "automatisch", '<span class="farbe-auto">Auto</span>');
  FARBEN.forEach(function (f) {
    farbknopf(f.wert, f.name, '<span class="farbe-punkt" style="background:' + f.wert + '"></span>');
  });

  // ---------- Widerstand direkt ins Breadboard stecken ----------
  var widerstandModus = false;
  var widerstandKnopf = document.getElementById("widerstandEinsetzen");
  function widerstandDa() { return alleKabel().filter(function (k) { return k.widerstand; })[0]; }
  function setzeWiderstandModus(an) {
    widerstandModus = an;
    widerstandKnopf.classList.toggle("aktiv-modus", an);
    widerstandKnopf.setAttribute("aria-pressed", an ? "true" : "false");
  }
  if (aufgabe.widerstand) {
    widerstandKnopf.hidden = false;
    widerstandKnopf.addEventListener("click", function () {
      waehleAb();
      kabelAbwaehlen();
      if (widerstandModus) { setzeWiderstandModus(false); zeigeAnzeige("Tippe auf einen Anschluss."); return; }
      if (widerstandDa()) {
        zeigeAnzeige("Der Widerstand steckt schon. Tippe ihn an, wenn du ihn herausnehmen willst.", true);
        return;
      }
      setzeWiderstandModus(true);
      zeigeAnzeige("<strong>Widerstand einsetzen</strong><small>Tippe auf das Loch für das erste Bein.</small>", true);
    });
  }
  // Steckt in diesem Loch schon etwas?
  function lochBelegt(s) {
    return alleKabel().filter(function (k) { return k.a === s || k.b === s; })[0];
  }
  var WIDERSTAND_REICHWEITE = 4.6 * 28.8;   // höchstens 4 Löcher Abstand (Lochabstand im Bild: 28,8)

  function waehleWiderstandLoch(s) {
    var name = esc(Pins.langerName(s));
    if (Pins.bauteil(s) !== "breadboard") {
      zeigeAnzeige("Die Beine des Widerstands kommen ins Breadboard. Tippe auf ein Loch.", true);
      return;
    }
    if (lochBelegt(s)) { zeigeAnzeige("In <strong>" + name + "</strong> steckt schon etwas.", true); return; }
    if (!auswahl) {
      auswahl = s;
      brett.setzeAuswahl(s);
      zeigeAnzeige("<strong>" + name + "</strong><small>Tippe jetzt auf das Loch für das zweite Bein.</small>", true);
      return;
    }
    if (auswahl === s) { waehleAb(); zeigeAnzeige("<small>Tippe auf das Loch für das erste Bein.</small>", true); return; }
    var pa = Pins.daten(auswahl), pb = Pins.daten(s);
    if (Math.hypot(pa.x - pb.x, pa.y - pb.y) > WIDERSTAND_REICHWEITE) {
      zeigeAnzeige("So weit reichen die Beine des Widerstands nicht. Wähle ein Loch, das näher am ersten liegt.", true);
      return;
    }
    var a = auswahl;
    waehleAb();
    merkeFuerRueckgaengig();
    kabel.push({ id: "w" + (naechsteId++), a: a, b: s, farbe: "#e3c28f", widerstand: true });
    setzeWiderstandModus(false);
    speichern();
    geaendert();
    zeigeAnzeige("Widerstand eingesetzt: <strong>" + esc(Pins.langerName(a)) + "</strong> ↔ <strong>" + name + "</strong>");
  }

  // ---------- Schaltbrett ----------
  var anzeige = document.getElementById("pinAnzeige");
  var auswahl = null;

  var brett = new Schaltbrett(document.getElementById("brett"), {
    bauteile: aufgabe.bauteile,
    beimPin: beimPin,
    beimKabel: beimKabel,
    beimBauteilWahl: function (n) {
      document.getElementById("drehen").disabled = !n;
      zeigeSpiegeln(n);
      zeigeAnzeige(n ? "<strong>" + esc(DATEN.pins[n].name) + "</strong> ausgewählt.<small>Ziehen zum Verschieben, „Drehen“ zum Drehen.</small>"
                     : "Tippe ein Bauteil an oder ziehe es an eine neue Stelle.", !!n);
    },
    beimAnordnen: function (n, ergebnis) {
      document.getElementById("drehen").disabled = false;
      zeigeSpiegeln(n);
      zeigeAnzeige(ergebnis === "kein_platz"
        ? "Dort ist kein Platz: Bauteile brauchen etwas Abstand zueinander, damit die Kabel durchpassen."
        : "<strong>" + esc(DATEN.pins[n].name) + "</strong> verschoben.", ergebnis !== "kein_platz");
    },
    beimLeeren: function () { waehleAb(); kabelAbwaehlen(); zeigeAnzeige("Tippe auf einen Anschluss."); },
    // Ein Kabel wurde von Hand verlegt (ecken) oder sein Weg passt nicht mehr (null)
    beimKabelweg: function (id, ecken) {
      if (ecken) merkeFuerRueckgaengig();
      if (ecken) festeWege[id] = ecken; else delete festeWege[id];
      speichern();
      if (ecken && id === gewaehltesKabel) zeigeKabelAuswahl();
    }
  });
  brett.setzeFesteWege(festeWege);
  brett.setzeKabel(alleKabel());

  document.getElementById("zoomPlus").addEventListener("click", function () { brett.zoom.zoomen(1.4); });
  document.getElementById("zoomMinus").addEventListener("click", function () { brett.zoom.zoomen(1 / 1.4); });
  richteVollbildEin(document.getElementById("vollbild"));
  document.getElementById("zoomAlles").addEventListener("click", function () { brett.zoom.allesZeigen(); });

  // ---------- Modus "Bauteile anordnen" ----------
  function anordnenUmschalten(an) {
    waehleAb();
    kabelAbwaehlen();
    setzeWiderstandModus(false);
    document.body.classList.toggle("modus-anordnen", an);
    brett.setzeAnordnen(an);
    document.getElementById("drehen").disabled = true;
    zeigeSpiegeln(null);
    if (an) {
      zeigeAnzeige("Tippe ein Bauteil an oder ziehe es an eine neue Stelle.");
    } else {
      zeigeAnzeige("Tippe auf einen Anschluss.");
      brett.zoom.allesZeigen();   // ganzes Brett zeigen (Bauteile können jetzt woanders liegen)
      geaendert();
    }
  }
  document.getElementById("anordnenStart").addEventListener("click", function () { anordnenUmschalten(true); });
  document.getElementById("anordnenFertig").addEventListener("click", function () { anordnenUmschalten(false); });
  // "Spiegeln" nur für Bauteile, die gespiegelt werden dürfen (zweibeiniger Taster)
  var spiegelKnopf = document.getElementById("spiegeln");
  var spiegelbareDa = aufgabe.bauteile.some(function (n) { return DATEN.schaltbrett[n] && DATEN.schaltbrett[n].spiegelbar; });
  spiegelKnopf.hidden = !spiegelbareDa;
  function zeigeSpiegeln(n) {
    spiegelKnopf.disabled = !(n && DATEN.schaltbrett[n] && DATEN.schaltbrett[n].spiegelbar);
  }
  spiegelKnopf.addEventListener("click", function () {
    var e = brett.spiegleGewaehltes();
    zeigeAnzeige(e === "kein_platz" ? "Zum Spiegeln ist dort nicht genug Platz. Schiebe das Bauteil erst etwas zur Seite."
               : e === "gespiegelt" ? "Gespiegelt." : "Tippe zuerst den Taster an.");
  });

  document.getElementById("drehen").addEventListener("click", function () {
    var e = brett.dreheGewaehltes();
    zeigeAnzeige(e === "kein_platz" ? "Zum Drehen ist dort nicht genug Platz. Schiebe das Bauteil erst etwas zur Seite."
               : e === "keins" ? "Tippe zuerst ein Bauteil an." : "Gedreht.");
  });
  document.getElementById("anordnungZurueck").addEventListener("click", function () {
    zeigeDialog({
      titel: "Anordnung zurücksetzen?",
      html: "<p>Alle Bauteile kommen wieder an ihren ursprünglichen Platz. Die Kabel bleiben gesteckt.</p>",
      knoepfe: [
        { text: "↺ Zurücksetzen", haupt: true, aktion: function () { brett.anordnungZuruecksetzen(); zeigeAnzeige("Anordnung zurückgesetzt."); } },
        { text: "Abbrechen" }
      ]
    });
  });

  function zeigeAnzeige(html, gross) {
    anzeige.innerHTML = html;
    anzeige.classList.toggle("gross", !!gross);
  }

  function waehleAb() {
    auswahl = null;
    brett.setzeAuswahl(null);
  }

  // Antippen in der Nähe von Anschlüssen
  function beimPin(nahe, typ, kabelId) {
    kabelAbwaehlen();
    // Eindeutig? Dann direkt nehmen, sonst die Lupe öffnen.
    var eindeutig = nahe.length === 1 ||
      (typ !== "touch" && nahe[1].abstand > 2 * nahe[0].abstand) ||
      (nahe[0].abstand < 6 && nahe[1].abstand > 18);
    if (eindeutig && !kabelId) { waehlePin(nahe[0].schluessel); return; }
    oeffneLupe(nahe.slice(0, 8), kabelId);
  }

  // Lupe: die Anschlüsse in der Nähe als große Knöpfe
  function oeffneLupe(kandidaten, kabelId) {
    kandidaten.sort(function (a, b) { return (a.x - b.x) || (a.y - b.y); });
    var knoepfe = kandidaten.map(function (k) {
      var p = Pins.daten(k.schluessel), b = DATEN.pins[Pins.bauteil(k.schluessel)];
      return {
        text: '<span class="lupe-name">' + esc(p.name) + '</span><span class="lupe-bauteil">' + esc(b.name) + "</span>",
        klasse: "lupe-knopf" + (p.belegbar === false ? " nicht-belegbar" : ""),
        aktion: function () { waehlePin(k.schluessel); }
      };
    });
    // Liegt dort auch ein Kabel, kann man es von hier aus löschen
    if (kabelId) knoepfe.push({
      text: "Kabel an dieser Stelle auswählen", klasse: "lupe-abbrechen",
      aktion: function () { setTimeout(function () { beimKabel(kabelId); }, 0); }
    });
    knoepfe.push({ text: "Abbrechen", klasse: "lupe-abbrechen" });
    var d = zeigeDialog({ titel: "Welchen Anschluss meinst du?", html: "", knoepfe: knoepfe });
    d.querySelector(".dialog").classList.add("lupe");
  }

  function waehlePin(s) {
    var name = esc(Pins.langerName(s));
    if (!Pins.istBelegbar(s)) {
      zeigeAnzeige("<strong>" + name + "</strong> wird nicht verwendet.", true);
      return;
    }
    if (widerstandModus) { waehleWiderstandLoch(s); return; }
    var belegt = lochBelegt(s);
    if (belegt && belegt.widerstand) {
      zeigeAnzeige("In <strong>" + name + "</strong> steckt schon ein Bein des Widerstands. Nimm ein anderes Loch in derselben Reihe.", true);
      return;
    }
    if (!auswahl) {
      auswahl = s;
      brett.setzeAuswahl(s);
      zeigeAnzeige("<strong>" + name + "</strong><small>Tippe jetzt auf das andere Ende des Kabels.</small>", true);
      return;
    }
    if (auswahl === s) {
      waehleAb();
      zeigeAnzeige("Auswahl aufgehoben.");
      return;
    }
    var a = auswahl;
    waehleAb();
    var schonDa = alleKabel().some(function (k) { return (k.a === a && k.b === s) || (k.a === s && k.b === a); });
    if (schonDa) {
      zeigeAnzeige("Dieses Kabel gibt es schon.");
      return;
    }
    merkeFuerRueckgaengig();
    var farbe = gewaehlteFarbe === "auto" ? autoFarbe(a, s) : gewaehlteFarbe;
    var neuesKabel = { id: "k" + (naechsteId++), a: a, b: s, farbe: farbe };
    if (gewaehlteFarbe !== "auto") neuesKabel.farbeGewaehlt = true;
    kabel.push(neuesKabel);
    speichern();
    geaendert();
    zeigeAnzeige("Kabel gesteckt: <strong>" + esc(Pins.langerName(a)) + "</strong> ↔ <strong>" + name + "</strong>");
  }

  // Antippen von Kabeln: liegen mehrere fast gleich nah, nachfragen
  function beimKabel(liste, typ) {
    if (typeof liste === "string") { kabelGewaehlt(liste); return; }
    var eindeutig = liste.length === 1 || liste[1].abstand - liste[0].abstand > 5;
    if (eindeutig) { kabelGewaehlt(liste[0].id); return; }
    var alle = alleKabel();
    var knoepfe = liste.slice(0, 5).map(function (t) {
      var k = alle.filter(function (x) { return x.id === t.id; })[0];
      return {
        text: '<span class="farbe-punkt" style="background:' + (k.gesperrt ? "#ccc" : k.farbe) + '"></span>' +
          '<span class="kabel-wahl">' + (k.widerstand ? "Widerstand: " : "") + esc(Pins.langerName(k.a)) + " ↔ " + esc(Pins.langerName(k.b)) + "</span>",
        klasse: "lupe-knopf kabel-knopf",
        aktion: function () { setTimeout(function () { kabelGewaehlt(t.id); }, 0); }
      };
    });
    knoepfe.push({ text: "Abbrechen", klasse: "lupe-abbrechen" });
    var d = zeigeDialog({ titel: "Welches Kabel meinst du?", html: "", knoepfe: knoepfe });
    d.querySelector(".dialog").classList.add("lupe");
  }

  // ---------- Ausgewähltes Kabel: umfärben, löschen, verlegen ----------
  var gewaehltesKabel = null;
  var auswahlLeiste = document.getElementById("kabelAuswahl");

  function kabelGewaehlt(id) {
    var k = alleKabel().filter(function (x) { return x.id === id; })[0];
    if (!k) return;
    waehleAb();
    if (widerstandModus) setzeWiderstandModus(false);
    gewaehltesKabel = id;
    brett.setzeKabelAuswahl(id);
    zeigeKabelAuswahl();
  }

  function istBatteriekabel(k) { return k.a === "batterie.stecker" || k.b === "batterie.stecker"; }

  function zeigeKabelAuswahl() {
    var k = alleKabel().filter(function (x) { return x.id === gewaehltesKabel; })[0];
    if (!k) { kabelAbwaehlen(); return; }
    var name = esc(Pins.langerName(k.a)) + " ↔ " + esc(Pins.langerName(k.b));
    var html, anzeige;
    if (k.widerstand) {
      html = "<p><strong>Widerstand</strong><br>" + name + "</p>" +
        '<button type="button" class="knopf" data-aktion="loeschen">🗑 Widerstand herausnehmen</button>';
      anzeige = "<strong>Widerstand</strong> ausgewählt.";
    } else {
      html = "<p><strong>" + (k.gesperrt ? "Vorgegebenes Kabel" : "Kabel") + "</strong><br>" + name + "</p>" +
        (istBatteriekabel(k) ? '<p class="klein">Das Batteriekabel ist immer rot und schwarz.</p>'
                             : '<p class="klein">Tippe oben eine Farbe an, um das Kabel umzufärben.</p>') +
        (brett.istFest(k.id) ? '<button type="button" class="knopf" data-aktion="automatisch">↺ Automatisch verlegen</button>' : "") +
        (k.gesperrt ? '<p class="klein">Vorgegebene Kabel löschst du mit „Alles selbst verkabeln“.</p>'
                    : '<button type="button" class="knopf" data-aktion="loeschen">🗑 Dieses Kabel löschen</button>');
      anzeige = "<strong>" + name + "</strong> ausgewählt.<small>Ziehe an einem Griff ⇕, um das Kabel anders zu verlegen.</small>";
    }
    auswahlLeiste.innerHTML = html;
    auswahlLeiste.hidden = false;
    farbwahl.classList.toggle("gesperrt", !!k.widerstand || istBatteriekabel(k));
    zeigeFarbe(k.widerstand || istBatteriekabel(k) ? "" : farbeVon(k));
    zeigeAnzeige(anzeige, true);
  }

  // Welche Farbe aus der Farbwahl gehört zum Kabel? ("auto", wenn nicht selbst gewählt)
  function farbeVon(k) {
    if (k.gesperrt) return vorgabeFarben[parseInt(k.id.slice(1), 10)] || "auto";
    return k.farbeGewaehlt ? k.farbe : "auto";
  }

  function kabelAbwaehlen() {
    if (!gewaehltesKabel) return;
    gewaehltesKabel = null;
    brett.setzeKabelAuswahl(null);
    auswahlLeiste.hidden = true;
    auswahlLeiste.innerHTML = "";
    farbwahl.classList.remove("gesperrt");
    zeigeFarbe(gewaehlteFarbe);
  }

  function umfaerben(wert) {
    var k = alleKabel().filter(function (x) { return x.id === gewaehltesKabel; })[0];
    if (!k) return;
    if (k.widerstand) { zeigeAnzeige("Der Widerstand hat keine Kabelfarbe.", true); return; }
    if (istBatteriekabel(k)) { zeigeAnzeige("Das Batteriekabel ist immer rot und schwarz.", true); return; }
    merkeFuerRueckgaengig();
    if (k.gesperrt) {
      var nr = parseInt(k.id.slice(1), 10);
      if (wert === "auto") delete vorgabeFarben[nr]; else vorgabeFarben[nr] = wert;
    } else {
      var eigenes = kabel.filter(function (x) { return x.id === k.id; })[0];
      if (wert === "auto") { eigenes.farbe = autoFarbeFest(eigenes.a, eigenes.b); delete eigenes.farbeGewaehlt; }
      else { eigenes.farbe = wert; eigenes.farbeGewaehlt = true; }
    }
    speichern();
    brett.setzeKabel(alleKabel());
    zeigeFarbe(wert);
  }

  auswahlLeiste.addEventListener("click", function (e) {
    var knopf = e.target.closest ? e.target.closest("[data-aktion]") : null;
    if (!knopf || !gewaehltesKabel) return;
    var id = gewaehltesKabel, k = alleKabel().filter(function (x) { return x.id === id; })[0];
    if (!k) return;
    if (knopf.getAttribute("data-aktion") === "automatisch") {
      merkeFuerRueckgaengig();
      delete festeWege[id];
      brett.automatischVerlegen(id);
      speichern();
      zeigeKabelAuswahl();
      return;
    }
    if (k.gesperrt) return;
    merkeFuerRueckgaengig();
    kabel = kabel.filter(function (x) { return x.id !== id; });
    delete festeWege[id];
    kabelAbwaehlen();
    speichern(); geaendert();
    zeigeAnzeige(k.widerstand ? "Widerstand herausgenommen." : "Kabel gelöscht.");
  });

  // ---------- Rückgängig / Alles löschen ----------
  function merkeFuerRueckgaengig() {
    verlauf.push(JSON.stringify({ kabel: kabel, vorgabeFarben: vorgabeFarben, wege: festeWege }));
    if (verlauf.length > 50) verlauf.shift();
  }

  document.getElementById("rueckgaengig").addEventListener("click", function () {
    if (!verlauf.length) { zeigeAnzeige("Es gibt nichts rückgängig zu machen."); return; }
    var alt = JSON.parse(verlauf.pop());
    kabel = alt.kabel; vorgabeFarben = alt.vorgabeFarben; festeWege = alt.wege;
    kabelAbwaehlen();
    waehleAb(); speichern();
    brett.setzeFesteWege(festeWege);
    brett.setzeMarkierungen(null);
    brett.kabel = alleKabel();
    brett.neuVerlegen();
    geaendert();
    zeigeAnzeige("Rückgängig gemacht.");
  });

  document.getElementById("allesLoeschen").addEventListener("click", function () {
    if (!kabel.length) { zeigeAnzeige("Es gibt noch keine eigenen Kabel."); return; }
    zeigeDialog({
      titel: "Alle eigenen Kabel löschen?",
      html: "<p>Vorgegebene (helle) Kabel bleiben stecken.</p>",
      knoepfe: [
        { text: "🗑 Alles löschen", haupt: true, aktion: function () {
          merkeFuerRueckgaengig();
          kabel = [];
          Object.keys(festeWege).forEach(function (id) { if (id.charAt(0) !== "v") delete festeWege[id]; });
          kabelAbwaehlen();
          waehleAb(); speichern(); geaendert();
          zeigeAnzeige("Alle eigenen Kabel gelöscht.");
        } },
        { text: "Abbrechen" }
      ]
    });
  });

  // Nach jeder Änderung: Zeichnung erneuern, alte Rückmeldung als veraltet zeigen
  var rueckmeldung = document.getElementById("rueckmeldung");
  function geaendert() {
    brett.setzeMarkierungen(null);
    brett.setzeKabel(alleKabel());
    if (rueckmeldung.innerHTML) {
      rueckmeldung.innerHTML = '<p class="hinweis-veraltet">Du hast etwas geändert. Drücke wieder „Ich bin fertig“, wenn du so weit bist.</p>';
    }
  }

  // ---------- Prüfen ----------
  var SYMBOL = {
    fehler: { zeichen: "✖", wort: "Fehler" },
    fehlt:  { zeichen: "＋", wort: "Fehlt noch" },
    info:   { zeichen: "ℹ", wort: "Hinweis" }
  };

  document.getElementById("fertig").addEventListener("click", function () {
    waehleAb();
    kabelAbwaehlen();
    // Noch gar nichts gesteckt? Dann nicht die ganze Lösung als Liste verraten.
    if (!kabel.length) {
      brett.setzeMarkierungen(null);
      rueckmeldung.innerHTML = '<div class="meldung meldung-info"><span class="meldung-symbol" aria-hidden="true">ℹ</span>' +
        "<div><strong>Hinweis:</strong> Du hast noch kein eigenes Kabel gesteckt. Tippe auf einen Anschluss und dann auf den zweiten.</div></div>";
      return;
    }
    var ergebnis = Pruefung.pruefe(aufgabe, alleKabel());
    var marken = { kabel: {}, pins: {} };
    ergebnis.meldungen.forEach(function (m, i) {
      m.kabel.forEach(function (id) { if (!marken.kabel[id]) marken.kabel[id] = i + 1; });
      m.pins.forEach(function (s) { if (!marken.pins[s]) marken.pins[s] = i + 1; });
    });
    brett.setzeMarkierungen(marken);
    zeigeErgebnis(ergebnis);
  });

  function zeigeErgebnis(ergebnis) {
    if (ergebnis.geloest) {
      Fortschritt.setzeGeloest("verkabeln", aufgabe.id);
      // Eigene Lösung merken: sie wird in der nächsten Aufgabe vorgesteckt
      Speicher.schreiben("loesung_" + aufgabe.id, alleKabel().map(function (k) {
        return k.widerstand ? [k.a, k.b, "widerstand"] : [k.a, k.b];
      }));
      rueckmeldung.innerHTML = '<div class="meldung meldung-richtig"><span class="meldung-symbol">✔</span>' +
        "<div><strong>Alles richtig!</strong> Du hast einen Stern bekommen.</div></div>";
      var stern = wahl.querySelector(".aktiv");
      if (stern && !stern.querySelector(".stern-klein")) stern.innerHTML += '<span class="stern-klein">★</span>';
      var naechste = aufgaben[aufgaben.indexOf(aufgabe) + 1];
      var knoepfe = [];
      if (naechste) knoepfe.push({ text: "Nächste Aufgabe →", haupt: true, aktion: function () {
        window.location.href = "verkabeln.html?aufgabe=" + naechste.id;
      } });
      knoepfe.push({ text: "Zur Übersicht", haupt: !naechste, aktion: function () { window.location.href = "index.html"; } });
      knoepfe.push({ text: "Hierbleiben" });
      if (pruefeGlueckwunsch()) return;   // alle Sterne gesammelt: großer Glückwunsch
      zeigeDialog({
        titel: "Super, alles richtig!",
        html: '<p class="stern-gross" aria-hidden="true">★</p><p>Aufgabe ' + aufgabe.id + " ist gelöst.</p>",
        knoepfe: knoepfe
      });
      return;
    }
    var n = ergebnis.meldungen.length;
    var html = '<h2 class="rueckmeldung-titel">' + (n === 1 ? "1 Sache stimmt noch nicht:" : n + " Sachen stimmen noch nicht:") + "</h2><ol class=\"meldungen\">";
    ergebnis.meldungen.forEach(function (m, i) {
      var s = SYMBOL[m.art];
      html += '<li><button type="button" class="meldung meldung-' + m.art + '" data-nr="' + i + '">' +
        '<span class="meldung-nr">' + (i + 1) + "</span>" +
        '<span class="meldung-symbol" aria-hidden="true">' + s.zeichen + "</span>" +
        '<span class="meldung-text"><span class="meldung-art">' + s.wort + ":</span> " + esc(m.text) +
        (m.dokument ? '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(m.dokument)) + "</span>" : "") +
        "</span></button></li>";
    });
    html += "</ol><p class=\"klein\">Tippe auf eine Meldung, um die Stelle auf dem Brett zu sehen.</p>";
    rueckmeldung.innerHTML = html;

    Array.prototype.forEach.call(rueckmeldung.querySelectorAll(".meldung[data-nr]"), function (knopf) {
      knopf.addEventListener("click", function () {
        var m = ergebnis.meldungen[parseInt(knopf.getAttribute("data-nr"), 10)];
        var punkte = [];
        var alle = alleKabel();
        m.kabel.forEach(function (id) {
          var k = alle.filter(function (x) { return x.id === id; })[0];
          if (k) { punkte.push(brett.pinPosition(k.a)); punkte.push(brett.pinPosition(k.b)); }
        });
        m.pins.forEach(function (s) { punkte.push(brett.pinPosition(s)); });
        brett.zeigeStellen(punkte);
      });
    });
  }

  // ---------- Als Bild exportieren ----------
  // Bauteile und Kabel in der aktuellen Anordnung als PNG (weißer Hintergrund,
  // ohne die gelben Anschluss-Ringe). Speichern oder (auf dem iPad) teilen.
  document.getElementById("exportieren").addEventListener("click", function () {
    waehleAb();
    kabelAbwaehlen();
    zeigeAnzeige("Das Bild wird erstellt …");
    brett.alsBild().then(function (blob) {
      zeigeAnzeige("Tippe auf einen Anschluss.");
      var url = URL.createObjectURL(blob);
      var name = "Aufgabe-" + aufgabe.id + "-" + aufgabe.titel.replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, "-").replace(/^-|-$/g, "") + ".png";
      var datei = null;
      try { datei = new File([blob], name, { type: "image/png" }); } catch (e) { datei = null; }
      var teilenGeht = false;
      try { teilenGeht = !!(datei && navigator.canShare && navigator.canShare({ files: [datei] })); } catch (e) { teilenGeht = false; }
      var knoepfe = [];
      if (teilenGeht) knoepfe.push({ text: "📤 Teilen / In Fotos sichern", haupt: true, aktion: function () {
        navigator.share({ files: [datei], title: name }).catch(function () {});
      } });
      knoepfe.push({ text: "⬇ Als Datei speichern", haupt: !teilenGeht, aktion: function () {
        var link = document.createElement("a");
        link.href = url; link.download = name;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
      } });
      knoepfe.push({ text: "Schließen" });
      zeigeDialog({
        titel: "Deine Schaltung als Bild",
        html: '<img class="export-vorschau" alt="Vorschau des Bildes" src="' + url + '">' +
          '<p class="klein">Tipp: Du kannst das Bild auch lange antippen und „Zu Fotos hinzufügen“ wählen.</p>',
        knoepfe: knoepfe
      });
    }).catch(function () {
      zeigeAnzeige("Tippe auf einen Anschluss.");
      zeigeDialog({
        titel: "Exportieren hat nicht geklappt",
        html: "<p>" + (location.protocol === "file:"
          ? "Das Exportieren geht nur, wenn das Spiel über eine Webadresse geöffnet ist (z. B. GitHub Pages), nicht per Doppelklick auf die Datei."
          : "Bitte versuche es noch einmal.") + "</p>"
      });
    });
  });

  // Beim Drehen des iPads Ansicht anpassen
  window.addEventListener("orientationchange", function () {
    setTimeout(function () { brett.zoom.allesZeigen(); }, 300);
  });
})();
