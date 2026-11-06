// =====================================================================
// js/fehlersuche.js – Bereich 2, Teil B: Fehler im Programm finden
// ---------------------------------------------------------------------
// Links steht der Programmablaufplan (so SOLL das Programm laufen) und
// die Verkabelung, rechts der Code mit Fehlern. Die Schüler:innen tippen
// die falschen Zeilen an und drücken "Prüfen" (Fußleiste).
// Rückmeldung direkt an den Zeilen:
//   ✔ richtig gefunden  -> Erklärung, richtige Zeile, Dokument
//   ✖ falsch markiert   -> "Diese Zeile ist in Ordnung."
//   nicht gefunden      -> nur die Anzahl (ohne zu verraten, wo)
// =====================================================================
(function () {

  var aufgaben = DATEN.fehlersuche;
  var gewuenscht = parseInt(adressParameter("aufgabe"), 10);
  var aufgabe = aufgaben.filter(function (a) { return a.id === gewuenscht; })[0] || aufgaben[0];
  var speicherName = "fehlersuche2_" + aufgabe.id;   // "2": Aufgaben wurden neu nummeriert

  // Fehler nach Zeilenindex (0-basiert)
  var fehlerBei = {};
  aufgabe.fehler.forEach(function (f) { fehlerBei[f.zeile - 1] = f; });

  var markiert = (Speicher.lesen(speicherName, null) || {}).markiert || {};   // Zeilenindex -> true
  var geprueft = false;

  function speichern() { Speicher.schreiben(speicherName, { markiert: markiert }); }

  // ---------- Seite aufbauen ----------
  document.getElementById("titel").textContent = "Fehlersuche " + aufgabe.id + ": " + aufgabe.titel;
  document.title = "Fehlersuche " + aufgabe.id;
  document.getElementById("verkabelung").innerHTML = "<tr><th>So ist die Schaltung verkabelt</th></tr>" +
    aufgabe.verkabelung.map(function (v) { return "<tr><td>" + esc(v) + "</td></tr>"; }).join("");
  if (aufgabe.pap) PAP.zeichne(document.getElementById("pap"), aufgabe.pap);
  else document.getElementById("pap").innerHTML = "<p>" + esc(aufgabe.soll || "") + "</p>";
  var n = aufgabe.fehler.length;
  document.getElementById("anzahl").textContent = (n === 1 ? "Hier steckt 1 Fehler." : "Hier stecken " + n + " Fehler.");

  var wahl = document.getElementById("aufgabenwahl");
  aufgaben.forEach(function (a) {
    var link = document.createElement("a");
    link.href = "fehlersuche.html?aufgabe=" + a.id;
    link.className = "knopf rund" + (a.id === aufgabe.id ? " aktiv" : "");
    link.setAttribute("aria-label", "Fehlersuche " + a.id + (Fortschritt.istGeloest("fehlersuche2", a.id) ? " (gelöst)" : ""));
    link.innerHTML = a.id + (Fortschritt.istGeloest("fehlersuche2", a.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(link);
  });

  var codeliste = document.getElementById("codeliste");
  var zusammenfassung = document.getElementById("zusammenfassung");

  function zeichne() {
    codeliste.innerHTML = "";
    aufgabe.zeilen.forEach(function (code, i) {
      var li = document.createElement("li");
      var f = fehlerBei[i];
      var klasse = "codezeile antippbar";
      if (geprueft && markiert[i] && f) klasse += " gefunden";
      else if (geprueft && markiert[i]) klasse += " daneben";
      else if (markiert[i]) klasse += " angetippt";
      li.className = klasse;
      li.setAttribute("data-zeile", i);
      li.setAttribute("role", "button");
      li.setAttribute("aria-pressed", markiert[i] ? "true" : "false");
      var html = '<span class="zeilennr">' + (i + 1) + '</span><code class="code">' + CodeAnzeige.faerbe(code) + "</code>";
      if (geprueft && markiert[i] && f) {
        html += '<div class="erklaerung richtig"><strong>✔ Richtig erkannt.</strong> ' + esc(f.warum) +
          '<span class="korrektur-code">' + (f.fehlt ? "Davor fehlt: " : "Richtig: ") + esc(f.richtig.trim()) + "</span>" +
          (f.dokument ? '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(f.dokument)) + "</span>" : "") + "</div>";
      } else if (geprueft && markiert[i]) {
        html += '<div class="erklaerung falsch"><strong>✖ Diese Zeile ist in Ordnung.</strong></div>';
      }
      li.innerHTML = html;
      codeliste.appendChild(li);
    });
  }

  codeliste.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-zeile]") : null;
    if (!el) return;
    var i = parseInt(el.getAttribute("data-zeile"), 10);
    if (markiert[i]) delete markiert[i]; else markiert[i] = true;
    if (geprueft) {
      geprueft = false;
      zusammenfassung.innerHTML = '<span class="klein">Du hast etwas geändert. Drücke wieder „Prüfen“.</span>';
    }
    speichern(); zeichne();
  });

  // ---------- Prüfen ----------
  document.getElementById("pruefen").addEventListener("click", function () {
    geprueft = true;
    var gefunden = 0, daneben = 0;
    Object.keys(markiert).forEach(function (s) { if (fehlerBei[s]) gefunden++; else daneben++; });
    var fehlend = aufgabe.fehler.length - gefunden;
    zeichne();

    if (!fehlend && !daneben) {
      zusammenfassung.innerHTML = '<span class="zf zf-richtig">✔ Alle Fehler gefunden!</span>';
      Fortschritt.setzeGeloest("fehlersuche2", aufgabe.id);
      var stern = wahl.querySelector(".aktiv");
      if (stern && !stern.querySelector(".stern-klein")) stern.innerHTML += '<span class="stern-klein">★</span>';
      var naechste = aufgaben[aufgaben.indexOf(aufgabe) + 1];
      var knoepfe = [];
      if (naechste) knoepfe.push({ text: "Nächste Aufgabe →", haupt: true, aktion: function () { location.href = "fehlersuche.html?aufgabe=" + naechste.id; } });
      knoepfe.push({ text: "Zur Übersicht", haupt: !naechste, aktion: function () { location.href = "index.html"; } });
      knoepfe.push({ text: "Hierbleiben" });
      if (pruefeGlueckwunsch()) return;   // alle Sterne gesammelt: großer Glückwunsch
      zeigeDialog({ titel: "Super, alle Fehler gefunden!", html: '<p class="stern-gross" aria-hidden="true">★</p><p>Die Erklärungen stehen jetzt direkt an den Zeilen.</p>', knoepfe: knoepfe });
      return;
    }
    var teile = ['<span class="zf">' + gefunden + " von " + aufgabe.fehler.length + " Fehlern gefunden.</span>"];
    if (daneben) teile.push('<span class="zf zf-falsch">✖ ' + daneben + (daneben === 1 ? " Zeile ist" : " Zeilen sind") + " in Ordnung.</span>");
    if (fehlend) teile.push('<span class="zf zf-fehlt">＋ ' + fehlend + (fehlend === 1 ? " Fehler fehlt" : " Fehler fehlen") + " noch. Vergleiche mit dem Ablaufplan und der Verkabelung.</span>");
    zusammenfassung.innerHTML = teile.join(" ");
  });

  document.getElementById("neustart").addEventListener("click", function () {
    markiert = {}; geprueft = false;
    zusammenfassung.innerHTML = "";
    speichern(); zeichne();
  });

  zeichne();
})();
