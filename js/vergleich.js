// =====================================================================
// js/vergleich.js – Bereich 2, Teil C: Zwei- oder vierbeiniger Taster?
// ---------------------------------------------------------------------
// Übung "sortieren": Karten antippen und in die passende Spalte legen,
//                    dann "Prüfen".
// Übung "schaltung": Zu jeder Frage die passende Schaltung antippen,
//                    die Rückmeldung kommt sofort.
// =====================================================================
(function () {

  var uebungen = DATEN.vergleich;
  var gewuenscht = adressParameter("uebung");
  var uebung = uebungen.filter(function (u) { return u.id === gewuenscht; })[0] || uebungen[0];
  var speicherName = "vergleich_" + uebung.id;
  var inhalt = document.getElementById("inhalt");
  var zusammenfassung = document.getElementById("zusammenfassung");

  document.getElementById("titel").textContent = uebung.titel;
  document.title = uebung.titel;
  var wahl = document.getElementById("uebungswahl");
  uebungen.forEach(function (u, i) {
    var a = document.createElement("a");
    a.href = "vergleich.html?uebung=" + u.id;
    a.className = "knopf rund" + (u.id === uebung.id ? " aktiv" : "");
    a.setAttribute("aria-label", u.titel + (Fortschritt.istGeloest("vergleich", u.id) ? " (gelöst)" : ""));
    a.innerHTML = (i + 1) + (Fortschritt.istGeloest("vergleich", u.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(a);
  });

  function mische(liste) {
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = liste[i]; liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }

  function geloest(text) {
    zusammenfassung.innerHTML = '<span class="zf zf-richtig">✔ ' + text + "</span>";
    Fortschritt.setzeGeloest("vergleich", uebung.id);
    var stern = wahl.querySelector(".aktiv");
    if (stern && !stern.querySelector(".stern-klein")) stern.innerHTML += '<span class="stern-klein">★</span>';
    if (pruefeGlueckwunsch()) return;
    var naechste = uebungen[uebungen.indexOf(uebung) + 1];
    var knoepfe = [];
    if (naechste) knoepfe.push({ text: "Nächste Übung →", haupt: true, aktion: function () { location.href = "vergleich.html?uebung=" + naechste.id; } });
    knoepfe.push({ text: "Zur Übersicht", haupt: !naechste, aktion: function () { location.href = "index.html"; } });
    knoepfe.push({ text: "Hierbleiben" });
    zeigeDialog({ titel: "Super, alles richtig!", html: '<p class="stern-gross" aria-hidden="true">★</p><p>' + esc(text) + "</p>", knoepfe: knoepfe });
  }

  // ===================================================================
  // Übung 1: Karten sortieren
  // ===================================================================
  function sortieren() {
    var gespeichert = Speicher.lesen(speicherName, null);
    var reihenfolge = (gespeichert && gespeichert.reihenfolge && gespeichert.reihenfolge.length === uebung.karten.length)
      ? gespeichert.reihenfolge : mische(uebung.karten.map(function (k, i) { return i; }));
    var lage = (gespeichert && gespeichert.lage) || {};   // Kartennummer -> Spalten-ID
    var gewaehlt = null, geprueft = false;

    function speichern() { Speicher.schreiben(speicherName, { reihenfolge: reihenfolge, lage: lage }); }

    function karteHtml(k) {
      var karte = uebung.karten[k];
      var status = geprueft && lage[k] ? (lage[k] === karte.spalte ? "richtig" : "falsch") : "";
      var html = '<button type="button" class="sortkarte' + (k === gewaehlt ? " gewaehlt" : "") + (status ? " " + status : "") + '" data-karte="' + k + '">' +
        (status === "richtig" ? '<span class="slot-symbol">✔</span> ' : status === "falsch" ? '<span class="slot-symbol">✖</span> ' : "") +
        (karte.code ? '<code class="code-klein">' + CodeAnzeige.faerbe(karte.text) + "</code>" : esc(karte.text));
      if (status === "falsch" && karte.dokument) html += '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(karte.dokument)) + "</span>";
      return html + "</button>";
    }

    function zeichne() {
      var frei = reihenfolge.filter(function (k) { return !lage[k]; });
      var html = '<p class="auftrag">' + esc(uebung.auftrag) + " Eine einsortierte Karte kannst du wieder antippen, um sie zurückzulegen.</p>";
      html += '<div class="kartenstapel">' + (frei.length ? frei.map(karteHtml).join("") : '<p class="klein">Alle Karten sind einsortiert. Drücke „Prüfen“.</p>') + "</div>";
      html += '<div class="spalten">';
      uebung.spalten.forEach(function (sp) {
        html += '<section class="spalte" data-spalte="' + sp.id + '" role="button" aria-label="In Spalte ' + esc(sp.titel) + ' legen">' +
          '<div class="spalte-kopf">' + (sp.bild ? '<img src="' + sp.bild + '" alt="">' : "") +
          "<div><strong>" + esc(sp.titel) + "</strong><br><span class=\"klein\">" + esc(sp.untertitel || "") + "</span></div></div>" +
          '<div class="spalte-karten">' + reihenfolge.filter(function (k) { return lage[k] === sp.id; }).map(karteHtml).join("") + "</div>" +
          (gewaehlt !== null ? '<div class="spalte-hier">＋ hierher legen</div>' : "") + "</section>";
      });
      inhalt.innerHTML = html + "</div>";
    }

    inhalt.addEventListener("click", function (e) {
      var karte = e.target.closest ? e.target.closest("[data-karte]") : null;
      var spalte = e.target.closest ? e.target.closest("[data-spalte]") : null;
      // Ist eine Karte ausgewählt, legt ein Tippen irgendwo in der Spalte sie dort ab
      if (spalte && gewaehlt !== null) {
        lage[gewaehlt] = spalte.getAttribute("data-spalte");
        gewaehlt = null; geprueft = false; zusammenfassung.innerHTML = "";
        speichern(); zeichne();
        return;
      }
      if (karte) {
        var k = parseInt(karte.getAttribute("data-karte"), 10);
        if (lage[k]) { delete lage[k]; gewaehlt = k; }          // einsortierte Karte zurücknehmen
        else gewaehlt = (gewaehlt === k) ? null : k;
        geprueft = false; zusammenfassung.innerHTML = "";
        speichern(); zeichne();
        return;
      }
      if (spalte && gewaehlt !== null) {
        lage[gewaehlt] = spalte.getAttribute("data-spalte");
        gewaehlt = null; geprueft = false; zusammenfassung.innerHTML = "";
        speichern(); zeichne();
      }
    });

    document.getElementById("pruefen").addEventListener("click", function () {
      geprueft = true; gewaehlt = null;
      zeichne();
      var falsch = 0, richtig = 0, frei = 0;
      uebung.karten.forEach(function (karte, k) {
        if (!lage[k]) frei++; else if (lage[k] === karte.spalte) richtig++; else falsch++;
      });
      if (!falsch && !frei) { geloest("Alle " + richtig + " Karten liegen richtig."); return; }
      var t = ['<span class="zf">' + richtig + " von " + uebung.karten.length + " Karten liegen richtig.</span>"];
      if (falsch) t.push('<span class="zf zf-falsch">✖ ' + falsch + (falsch === 1 ? " Karte liegt" : " Karten liegen") + " falsch (mit Tipp zum Nachschlagen).</span>");
      if (frei) t.push('<span class="zf zf-fehlt">＋ ' + frei + (frei === 1 ? " Karte fehlt" : " Karten fehlen") + " noch.</span>");
      zusammenfassung.innerHTML = t.join(" ");
    });

    document.getElementById("neustart").addEventListener("click", function () {
      reihenfolge = mische(uebung.karten.map(function (k, i) { return i; }));
      lage = {}; gewaehlt = null; geprueft = false; zusammenfassung.innerHTML = "";
      speichern(); zeichne();
    });

    zeichne();
  }

  // ===================================================================
  // Übung 2: Welche Schaltung passt?
  // ===================================================================
  function schaltung() {
    document.getElementById("pruefen").hidden = true;   // Rückmeldung kommt sofort
    var antworten = (Speicher.lesen(speicherName, null) || {}).antworten || {};   // Frage -> gewählte Antwort

    function speichern() { Speicher.schreiben(speicherName, { antworten: antworten }); }

    function zeichne() {
      var html = '<p class="auftrag">' + esc(uebung.auftrag) + "</p>";
      uebung.fragen.forEach(function (f, i) {
        var a = antworten[i], richtig = a === f.richtig;
        html += '<section class="quizfrage' + (a ? (richtig ? " richtig" : " falsch") : "") + '">' +
          "<h2>" + (i + 1) + ". " + esc(f.frage) + "</h2>" +
          (f.code ? '<pre class="quizcode">' + f.code.map(function (z) { return CodeAnzeige.faerbe(z); }).join("\n") + "</pre>" : "") +
          '<div class="quizantworten">';
        uebung.antworten.forEach(function (an) {
          var klasse = "knopf quizantwort" + (a === an.id ? (richtig ? " gewaehlt-richtig" : " gewaehlt-falsch") : "");
          html += '<button type="button" class="' + klasse + '" data-frage="' + i + '" data-antwort="' + an.id + '"' + (richtig ? " disabled" : "") + ">" +
            (an.bild ? '<img src="' + an.bild + '" alt="">' : '<span class="quiz-ohne-bild" aria-hidden="true">?</span>') +
            "<span><strong>" + esc(an.titel) + '</strong><br><span class="klein">' + esc(an.text) + "</span></span></button>";
        });
        html += "</div>";
        if (a && richtig) html += '<div class="erklaerung richtig"><strong>✔ Richtig!</strong> ' + esc(f.erklaerung) + "</div>";
        else if (a) html += '<div class="erklaerung falsch"><strong>✖ Leider nicht. Versuch es nochmal.</strong>' +
          (f.dokument ? '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(f.dokument)) + "</span>" : "") + "</div>";
        html += "</section>";
      });
      inhalt.innerHTML = html;
      var n = uebung.fragen.filter(function (f, i) { return antworten[i] === f.richtig; }).length;
      if (n < uebung.fragen.length) zusammenfassung.innerHTML = '<span class="zf">' + n + " von " + uebung.fragen.length + " Fragen richtig beantwortet.</span>";
      return n;
    }

    inhalt.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-antwort]") : null;
      if (!b || b.disabled) return;
      var i = parseInt(b.getAttribute("data-frage"), 10);
      antworten[i] = b.getAttribute("data-antwort");
      speichern();
      var n = zeichne();
      if (n === uebung.fragen.length) geloest("Alle " + n + " Fragen richtig beantwortet.");
    });

    document.getElementById("neustart").addEventListener("click", function () {
      antworten = {}; zusammenfassung.innerHTML = "";
      speichern(); zeichne();
    });

    zeichne();
  }

  if (uebung.id === "sortieren") sortieren(); else schaltung();
})();
