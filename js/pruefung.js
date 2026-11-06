// =====================================================================
// js/pruefung.js – Prüft die Verkabelung („Ich bin fertig“)
// ---------------------------------------------------------------------
// Ablauf:
//  1. Für jede Lösungsvariante (z. B. Motor an Klemme A oder B) werden
//     alle Anforderungen der Aufgabe durchgegangen. Jede Anforderung
//     beschreibt ein Kabel: von einem Bauteil-Anschluss zu einem Ziel.
//  2. Kabel, die zu keiner Anforderung gehören, sind falsch.
//  3. Doppelt belegte Pins und Kurzschlüsse werden extra geprüft.
//  4. Die Variante mit den wenigsten Fehlern wird angezeigt.
// Ergebnis: { geloest: true/false, meldungen: [...] }
// Jede Meldung: { art: "fehler" | "fehlt" | "info", text, dokument,
//                 kabel: [Kabel-IDs], pins: [Anschlüsse] }
// =====================================================================

var Pruefung = (function () {

  // Pins, an denen mehrere Kabel stecken dürfen
  function mehrfachErlaubt(schluessel) {
    if (Pins.bauteil(schluessel) !== "arduino") return false;
    var p = Pins.daten(schluessel);
    return !!p && (p.art === "gnd" || p.art === "plus");
  }

  // Passt ein Anschluss zu einer Angabe wie "arduino.3V3",
  // "arduino:gnd" oder einer Liste solcher Angaben?
  function passt(angabe, schluessel) {
    if (!angabe) return false;
    if (Array.isArray(angabe)) {
      for (var i = 0; i < angabe.length; i++) if (passt(angabe[i], schluessel)) return true;
      return false;
    }
    if (angabe.indexOf(":") < 0) return angabe === schluessel;
    var teile = angabe.split(":"), bauteil = teile[0], gruppe = teile[1];
    if (Pins.bauteil(schluessel) !== bauteil) return false;
    var p = Pins.daten(schluessel);
    if (!p) return false;
    var istSignal = p.art === "digital" && p.id !== "D0" && p.id !== "D1";
    switch (gruppe) {
      case "alle":    return true;
      case "gnd":     return p.art === "gnd";
      case "plus":    return p.art === "plus";
      case "digital": return p.art === "digital";
      case "signal":  return istSignal;
      case "pwm":     return istSignal && !!p.pwm;
      case "analog":  return p.art === "analog";
      default:        return false;
    }
  }

  // Erwartet die Anforderung einen Digitalpin am Arduino?
  function willDigitalpin(anf) {
    var z = [].concat(anf.zu);
    return z.some(function (a) { return a === "arduino:signal" || a === "arduino:pwm"; });
  }

  // Bewertet ein Kabel für eine Anforderung.
  // Rückgabe: { status: "ok" | "info" | "fehler", hinweis }
  function bewerte(anf, anderesEnde) {
    var i;
    var typisch = anf.typisch || [];
    for (i = 0; i < typisch.length; i++) {
      if (passt(typisch[i].zu, anderesEnde)) return { status: "fehler", hinweis: typisch[i].hinweis };
    }
    var info = anf.info || [];
    for (i = 0; i < info.length; i++) {
      if (passt(info[i].zu, anderesEnde)) return { status: "info", hinweis: info[i].hinweis };
    }
    if (!passt(anf.verboten, anderesEnde) && passt(anf.zu, anderesEnde)) return { status: "ok" };
    if (willDigitalpin(anf) && Pins.bauteil(anderesEnde) === "arduino") {
      var p = Pins.daten(anderesEnde);
      if (p && (p.id === "D0" || p.id === "D1")) return { status: "fehler", hinweis: "pin_rx_tx" };
      if (p && p.art === "analog") return { status: "fehler", hinweis: "pin_analog" };
    }
    return { status: "fehler", hinweis: anf.falsch };
  }

  // Alle Varianten einer Aufgabe: Kombination der Varianten aller Bausteine.
  // Jede Variante: { anforderungen: [...], fremd: [...] }
  // "fremd" beschreibt Pins der jeweils anderen Variante (z. B. ENA, wenn
  // der Motor an Klemme B hängt) und den Hinweis, falls dort ein Kabel steckt.
  function varianten(aufgabe) {
    var liste = [{ anforderungen: [], fremd: [] }];
    aufgabe.bausteine.forEach(function (name) {
      var bs = DATEN.bausteine[name];
      if (!bs) throw new Error("Baustein '" + name + "' fehlt in aufgaben.js");
      var vs = bs.varianten || [{ anforderungen: bs.anforderungen }];
      var neu = [];
      liste.forEach(function (bisher) {
        vs.forEach(function (v) {
          neu.push({
            anforderungen: bisher.anforderungen.concat(v.anforderungen),
            fremd: bisher.fremd.concat(v.fremd ? [v.fremd] : [])
          });
        });
      });
      liste = neu;
    });
    // Sonderregeln der Aufgabe (z. B. Hinweis statt Fehler) einmischen
    liste.forEach(function (v) {
      v.anforderungen = v.anforderungen.map(function (anf) {
        var extra = (aufgabe.sonderregeln || []).filter(function (s) { return s.anforderung === anf.id; });
        if (!extra.length) return anf;
        var kopie = {};
        Object.keys(anf).forEach(function (k) { kopie[k] = anf[k]; });
        kopie.info = (anf.info || []).concat(extra);
        return kopie;
      });
    });
    return liste;
  }

  function kabelText(k) {
    return Pins.langerName(k.a) + " ↔ " + Pins.langerName(k.b);
  }

  // Prüft eine Variante. Gibt die Meldungen zurück.
  function pruefeVariante(aufgabe, variante, kabel) {
    var anforderungen = variante.anforderungen;
    var meldungen = [];
    var benutzt = {};        // Kabel-ID -> true, wenn einer Anforderung zugeordnet
    var bestesKabel = {};    // Anschluss -> Kabel-ID, das dort "zählt"
    var okKabel = {};        // Kabel-ID -> true, wenn richtig

    function melde(art, hinweis, werte, kabelIds, pins) {
      meldungen.push({ art: art, hinweis: hinweis, werte: werte || {}, kabel: kabelIds || [], pins: pins || [] });
    }

    // Kabel je Anschluss sammeln
    var amPin = {};
    kabel.forEach(function (k) {
      (amPin[k.a] = amPin[k.a] || []).push(k);
      (amPin[k.b] = amPin[k.b] || []).push(k);
    });

    // 1. Anforderungen
    var beansprucht = {};    // Kabel-ID -> ID der Anforderung, die es schon bewertet hat
    var gemeldet = {};       // Kabel-ID -> true, wenn dazu schon ein Fehler gemeldet ist
    anforderungen.forEach(function (anf) {
      var alle = amPin[anf.von] || [];
      if (!alle.length) {
        melde("fehlt", anf.fehlt, { pin: Pins.langerName(anf.von) }, [], [anf.von]);
        return;
      }
      // Ein Kabel, das schon eine andere Anforderung bewertet hat (z. B.
      // Batterie an +12V), nicht noch einmal melden.
      var dort = alle.filter(function (k) { return !beansprucht[k.id]; });
      if (!dort.length) return;
      var rang = { ok: 3, info: 2, fehler: 1 };
      var bestes = null;
      dort.forEach(function (k) {
        var anderes = k.a === anf.von ? k.b : k.a;
        var b = bewerte(anf, anderes);
        b.kabel = k; b.ziel = anderes;
        if (!bestes || rang[b.status] > rang[bestes.status]) bestes = b;
      });
      // An Pins mit mehreren erlaubten Kabeln (z. B. VIN) zählt nur das beste,
      // die anderen werden unten als "nicht gebraucht" geprüft.
      // Nur das beste Kabel gehört zu dieser Anforderung. Weitere Kabel an
      // einem Bauteil-Pin (z. B. Taster-GND am GND des Motortreibers) prüft
      // ihre eigene Anforderung oder die Prüfung "mehrere Kabel" unten.
      benutzt[bestes.kabel.id] = true;
      beansprucht[bestes.kabel.id] = anf.id;
      if (!mehrfachErlaubt(anf.von)) dort.forEach(function (k) { benutzt[k.id] = true; });
      bestesKabel[anf.von] = bestes.kabel.id;
      if (bestes.status === "ok") {
        okKabel[bestes.kabel.id] = true;
      } else {
        gemeldet[bestes.kabel.id] = true;
        melde(bestes.status, bestes.hinweis,
          { ziel: Pins.langerName(bestes.ziel), pin: Pins.langerName(anf.von), kabel: kabelText(bestes.kabel) },
          [bestes.kabel.id], []);
      }
    });

    // 2. Mehrfach belegte Anschlüsse
    Object.keys(amPin).forEach(function (s) {
      var dort = amPin[s];
      if (dort.length < 2 || mehrfachErlaubt(s)) return;
      if (Pins.bauteil(s) === "arduino") {
        var wer = dort.map(function (k) { return Pins.langerName(k.a === s ? k.b : k.a); }).join(" und ");
        melde("fehler", "pin_doppelt", { pin: Pins.langerName(s), wer: wer }, dort.map(function (k) { return k.id; }), []);
        dort.forEach(function (k) { delete okKabel[k.id]; });
      } else {
        // Kabel, zu denen schon ein eigener Hinweis kam, nicht doppelt melden
        var extra = dort.filter(function (k) { return k.id !== bestesKabel[s] && !gemeldet[k.id]; });
        if (!extra.length) return;
        melde("fehler", "mehrere_kabel_am_anschluss", { pin: Pins.langerName(s) }, extra.map(function (k) { return k.id; }), []);
      }
    });

    // 3. Kabel, die zu keiner Anforderung gehören
    kabel.forEach(function (k) {
      if (benutzt[k.id]) return;
      var werte = { kabel: kabelText(k), pin: Pins.langerName(k.a), ziel: Pins.langerName(k.b) };
      // Steckt das Kabel an einem Pin der anderen Variante? (z. B. ENA statt ENB)
      var fremd = null;
      variante.fremd.forEach(function (f) {
        if (fremd) return;
        if (passt(f.pins, k.a)) fremd = { f: f, pin: k.a, ziel: k.b };
        else if (passt(f.pins, k.b)) fremd = { f: f, pin: k.b, ziel: k.a };
      });
      // Besondere Hinweise für bestimmte falsche Kabel (aus aufgaben.js)
      var besonders = null;
      (DATEN.kabelHinweise || []).forEach(function (r) {
        if (besonders) return;
        if (passt(r.a, k.a) && passt(r.b, k.b)) besonders = { r: r, pin: k.a, ziel: k.b };
        else if (passt(r.a, k.b) && passt(r.b, k.a)) besonders = { r: r, pin: k.b, ziel: k.a };
      });
      if (fremd) {
        melde("fehler", fremd.f.hinweis, { kabel: kabelText(k), pin: Pins.langerName(fremd.pin), ziel: Pins.langerName(fremd.ziel) }, [k.id], []);
      } else if (besonders) {
        melde("fehler", besonders.r.hinweis, { kabel: kabelText(k), pin: Pins.langerName(besonders.pin), ziel: Pins.langerName(besonders.ziel) }, [k.id], []);
      } else if (Pins.bauteil(k.a) !== "arduino" && Pins.bauteil(k.b) !== "arduino" &&
                 Pins.bauteil(k.a) !== "treiber" && Pins.bauteil(k.b) !== "treiber") {
        melde("fehler", "bauteile_direkt", werte, [k.id], []);
      } else {
        melde("fehler", "kabel_nicht_gebraucht", werte, [k.id], []);
      }
    });

    // 4. Kurzschluss: Plus und GND im selben Netz
    var netze = bildeNetze(kabel);
    Object.keys(netze).forEach(function (wurzel) {
      var pins = netze[wurzel].pins;
      var hatGnd = pins.some(function (s) { var p = Pins.daten(s); return Pins.bauteil(s) === "arduino" && p && p.art === "gnd"; });
      var plus = pins.filter(function (s) {
        var p = Pins.daten(s);
        return (Pins.bauteil(s) === "arduino" && p && (p.art === "plus" || p.art === "buchse")) || s === "batterie.stecker";
      });
      if (hatGnd && plus.length) {
        var ids = netze[wurzel].kabel.filter(function (id) { return !okKabel[id]; });
        melde("fehler", "kurzschluss", { pin: Pins.langerName(plus[0]) }, ids, []);
      }
    });

    return meldungen;
  }

  // Netze: alle Anschlüsse, die über Kabel elektrisch verbunden sind.
  // Alle GND-Pins des Arduino gehören von vornherein zusammen.
  function bildeNetze(kabel) {
    var eltern = {};
    function finde(x) {
      if (eltern[x] === undefined) eltern[x] = x;
      while (eltern[x] !== x) { eltern[x] = eltern[eltern[x]]; x = eltern[x]; }
      return x;
    }
    function vereine(a, b) { eltern[finde(a)] = finde(b); }
    DATEN.pins.arduino.pins.forEach(function (p) {
      if (p.art === "gnd") vereine("arduino." + p.id, "arduino.GND_1");
    });
    kabel.forEach(function (k) { vereine(k.a, k.b); });
    var netze = {};
    Object.keys(eltern).forEach(function (s) {
      var w = finde(s);
      (netze[w] = netze[w] || { pins: [], kabel: [] }).pins.push(s);
    });
    kabel.forEach(function (k) { netze[finde(k.a)].kabel.push(k.id); });
    return netze;
  }

  // Gleiche Meldungen zusammenfassen und Texte erzeugen
  function aufbereiten(aufgabe, meldungen) {
    var gesehen = {}, ergebnis = [];
    meldungen.forEach(function (m) {
      var h = DATEN.hinweise[m.hinweis] || { text: "(Hinweis '" + m.hinweis + "' fehlt in hinweise.js)", dokument: null };
      var text = fuelleText(h.text, m.werte);
      var schluessel = m.art + "|" + text;
      if (gesehen[schluessel]) {
        var alt = gesehen[schluessel];
        alt.kabel = alt.kabel.concat(m.kabel);
        alt.pins = alt.pins.concat(m.pins);
        return;
      }
      var dok = h.dokument === "@aufgabe" ? aufgabe.dokumente[0] : h.dokument;
      var neu = { art: m.art, text: text, dokument: dok, kabel: m.kabel.slice(), pins: m.pins.slice() };
      gesehen[schluessel] = neu;
      ergebnis.push(neu);
    });
    // Reihenfolge: Fehler, dann Fehlendes, dann Hinweise
    var ordnung = { fehler: 0, fehlt: 1, info: 2 };
    ergebnis.sort(function (a, b) { return ordnung[a.art] - ordnung[b.art]; });
    return ergebnis;
  }

  function pruefe(aufgabe, kabel) {
    var beste = null;
    varianten(aufgabe).forEach(function (v) {
      var m = pruefeVariante(aufgabe, v, kabel);
      if (!beste || m.length < beste.length) beste = m;
    });
    var meldungen = aufbereiten(aufgabe, beste || []);
    return { geloest: meldungen.length === 0, meldungen: meldungen };
  }

  return { pruefe: pruefe, passt: passt, bildeNetze: bildeNetze };
})();
