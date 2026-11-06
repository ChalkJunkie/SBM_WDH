// =====================================================================
// js/fehlersuche.js – Level 2, Teil B: Fehler im Programm finden
// ---------------------------------------------------------------------
// Die Schüler:innen tippen die falschen Zeilen an und prüfen.
// Rückmeldung: welche Zeilen richtig erkannt wurden (mit Erklärung und
// Dokument), welche Markierungen falsch sind und wie viele Fehler noch
// fehlen (ohne zu verraten, wo). "Lösung zeigen" verrät alles.
// =====================================================================
(function () {

  var aufgaben = DATEN.fehlersuche;
  var gewuenscht = parseInt(adressParameter("aufgabe"), 10);
  var aufgabe = aufgaben.filter(function (a) { return a.id === gewuenscht; })[0] || aufgaben[0];
  var speicherName = "fehlersuche_" + aufgabe.id;

  // Fehler nach Zeilenindex (0-basiert)
  var fehlerBei = {};
  aufgabe.fehler.forEach(function (f) { fehlerBei[f.zeile - 1] = f; });

  var gespeichert = Speicher.lesen(speicherName, null) || {};
  var markiert = gespeichert.markiert || {};        // Zeilenindex -> true
  var loesungGesehen = !!gespeichert.loesungGesehen;
  var ergebnis = null;                              // nach dem Prüfen
  var zeigeLoesung = false;

  function speichern() {
    Speicher.schreiben(speicherName, { markiert: markiert, loesungGesehen: loesungGesehen });
  }

  // ---------- Seite aufbauen ----------
  document.getElementById("titel").textContent = "Fehlersuche " + aufgabe.id + ": " + aufgabe.titel;
  document.title = "Fehlersuche " + aufgabe.id;
  document.getElementById("soll").innerHTML = "<strong>Das Programm soll:</strong> " + esc(aufgabe.soll);
  document.getElementById("verkabelung").innerHTML = "<tr><th>So ist die Schaltung verkabelt</th></tr>" +
    aufgabe.verkabelung.map(function (v) { return "<tr><td>" + esc(v) + "</td></tr>"; }).join("");
  var n = aufgabe.fehler.length;
  document.getElementById("anzahl").textContent = "In diesem Programm " + (n === 1 ? "steckt 1 Fehler." : "stecken " + n + " Fehler.");

  var wahl = document.getElementById("aufgabenwahl");
  aufgaben.forEach(function (a) {
    var link = document.createElement("a");
    link.href = "fehlersuche.html?aufgabe=" + a.id;
    link.className = "knopf rund" + (a.id === aufgabe.id ? " aktiv" : "");
    link.setAttribute("aria-label", "Fehlersuche " + a.id + (Fortschritt.istGeloest("fehlersuche", a.id) ? " (gelöst)" : ""));
    link.innerHTML = a.id + (Fortschritt.istGeloest("fehlersuche", a.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(link);
  });

  var codeliste = document.getElementById("codeliste");
  var rueckmeldung = document.getElementById("rueckmeldung");

  function zeichne() {
    codeliste.innerHTML = "";
    aufgabe.zeilen.forEach(function (code, i) {
      var li = document.createElement("li");
      var klasse = "codezeile antippbar";
      if (zeigeLoesung && fehlerBei[i]) klasse += " loesung";
      else if (ergebnis && markiert[i] && fehlerBei[i]) klasse += " gefunden";
      else if (markiert[i]) klasse += " angetippt";
      li.className = klasse;
      li.setAttribute("data-zeile", i);
      li.setAttribute("role", "button");
      li.setAttribute("aria-pressed", markiert[i] ? "true" : "false");
      var html = '<span class="zeilennr">' + (i + 1) + '</span><code class="code">' + CodeAnzeige.faerbe(code) + "</code>";
      // Korrektur anzeigen: bei Lösung für alle Fehler, nach dem Prüfen für gefundene
      var f = fehlerBei[i];
      if (f && (zeigeLoesung || (ergebnis && markiert[i]))) {
        html += '<div class="korrektur">' + (f.fehlt ? "Davor fehlt: " : "Richtig: ") + esc(f.richtig.trim()) + "</div>";
      }
      li.innerHTML = html;
      codeliste.appendChild(li);
    });
  }

  codeliste.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-zeile]") : null;
    if (!el || zeigeLoesung) return;
    var i = parseInt(el.getAttribute("data-zeile"), 10);
    if (markiert[i]) delete markiert[i]; else markiert[i] = true;
    ergebnis = null;
    if (rueckmeldung.innerHTML) rueckmeldung.innerHTML = '<p class="hinweis-veraltet">Du hast etwas geändert. Drücke wieder „Prüfen“.</p>';
    speichern(); zeichne();
  });

  // ---------- Prüfen ----------
  document.getElementById("pruefen").addEventListener("click", function () {
    zeigeLoesung = false;
    var gefunden = [], falschMarkiert = [], fehlend = 0;
    Object.keys(markiert).forEach(function (s) {
      var i = parseInt(s, 10);
      if (fehlerBei[i]) gefunden.push(i); else falschMarkiert.push(i);
    });
    fehlend = aufgabe.fehler.length - gefunden.length;
    gefunden.sort(function (a, b) { return a - b; });
    falschMarkiert.sort(function (a, b) { return a - b; });
    ergebnis = { gefunden: gefunden, falschMarkiert: falschMarkiert, fehlend: fehlend };
    zeichne();

    var html = "";
    var geloest = !fehlend && !falschMarkiert.length;
    if (geloest) {
      html += '<div class="meldung meldung-richtig"><span class="meldung-symbol">✔</span><div><strong>Alle Fehler gefunden!</strong>' +
        (loesungGesehen ? " Du hattest dir die Lösung angesehen. Für einen Stern löse die Aufgabe später nochmal ohne Lösung." : " Du hast einen Stern bekommen.") + "</div></div>";
    } else {
      html += '<h2 class="rueckmeldung-titel">' + gefunden.length + " von " + aufgabe.fehler.length + " Fehlern gefunden.</h2>";
    }
    html += '<ol class="meldungen">';
    gefunden.forEach(function (i) {
      var f = fehlerBei[i];
      html += '<li><div class="meldung meldung-richtig"><span class="meldung-symbol" aria-hidden="true">✔</span><span class="meldung-text">' +
        '<span class="meldung-art">Zeile ' + (i + 1) + ":</span> " + esc(f.warum) +
        (f.dokument ? '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(f.dokument)) + "</span>" : "") + "</span></div></li>";
    });
    falschMarkiert.forEach(function (i) {
      html += '<li><div class="meldung meldung-fehler"><span class="meldung-symbol" aria-hidden="true">✖</span><span class="meldung-text">' +
        '<span class="meldung-art">Zeile ' + (i + 1) + ":</span> Diese Zeile ist in Ordnung.</span></div></li>";
    });
    if (fehlend) {
      html += '<li><div class="meldung meldung-fehlt"><span class="meldung-symbol" aria-hidden="true">＋</span><span class="meldung-text">' +
        '<span class="meldung-art">Fehlt noch:</span> ' + (fehlend === 1 ? "1 Fehler hast" : fehlend + " Fehler hast") +
        " du noch nicht gefunden. Vergleiche den Code mit der Verkabelung und mit dem, was das Programm tun soll.</span></div></li>";
    }
    html += "</ol>";
    rueckmeldung.innerHTML = html;

    // Mit Lösung gelöst: kein Stern, aber beim nächsten Versuch zählt es wieder
    if (geloest && loesungGesehen) { loesungGesehen = false; speichern(); }
    else if (geloest) {
      Fortschritt.setzeGeloest("fehlersuche", aufgabe.id);
      var stern = wahl.querySelector(".aktiv");
      if (stern && !stern.querySelector(".stern-klein")) stern.innerHTML += '<span class="stern-klein">★</span>';
      var naechste = aufgaben[aufgaben.indexOf(aufgabe) + 1];
      var knoepfe = [];
      if (naechste) knoepfe.push({ text: "Nächste Aufgabe →", haupt: true, aktion: function () { location.href = "fehlersuche.html?aufgabe=" + naechste.id; } });
      knoepfe.push({ text: "Zur Übersicht", haupt: !naechste, aktion: function () { location.href = "index.html"; } });
      knoepfe.push({ text: "Hierbleiben" });
      zeigeDialog({ titel: "Super, alle Fehler gefunden!", html: '<p class="stern-gross" aria-hidden="true">★</p>', knoepfe: knoepfe });
    }
  });

  // ---------- Lösung ----------
  document.getElementById("loesung").addEventListener("click", function () {
    zeigeDialog({
      titel: "Lösung zeigen?",
      html: "<p>Versuche es ruhig erst selbst. Wenn du die Lösung ansiehst, gibt es für diese Aufgabe erst wieder einen Stern, wenn du sie später nochmal ohne Lösung schaffst.</p>",
      knoepfe: [
        { text: "💡 Lösung zeigen", haupt: true, aktion: function () {
          zeigeLoesung = true; loesungGesehen = true; ergebnis = null;
          speichern(); zeichne();
          var html = '<h2 class="rueckmeldung-titel">Lösung</h2><ol class="meldungen">';
          aufgabe.fehler.forEach(function (f) {
            html += '<li><div class="meldung meldung-info"><span class="meldung-symbol" aria-hidden="true">💡</span><span class="meldung-text">' +
              '<span class="meldung-art">Zeile ' + f.zeile + ":</span> " + esc(f.warum) +
              (f.dokument ? '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(f.dokument)) + "</span>" : "") + "</span></div></li>";
          });
          html += "</ol>";
          rueckmeldung.innerHTML = html;
        } },
        { text: "Abbrechen" }
      ]
    });
  });

  document.getElementById("neustart").addEventListener("click", function () {
    markiert = {}; ergebnis = null; zeigeLoesung = false;
    rueckmeldung.innerHTML = "";
    speichern(); zeichne();
  });

  zeichne();
})();
