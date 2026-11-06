// =====================================================================
// js/lesen.js – Bereich 3: Genau lesen
// ---------------------------------------------------------------------
// Links steht eine Aufgabenstellung wie in einer Klassenarbeit, rechts
// stehen Fragen dazu. Nach „Prüfen“ wird jede Frage grün oder rot. Bei
// einer falschen Antwort gibt es einen Tipp und die passende Stelle im
// Text wird markiert. Die richtige Antwort wird nicht verraten.
// =====================================================================
(function () {

  var aufgaben = DATEN.lesen;
  var gewuenscht = parseInt(adressParameter("aufgabe"), 10);
  var aufgabe = aufgaben.filter(function (a) { return a.id === gewuenscht; })[0] || aufgaben[0];
  var speicherName = "lesen_" + aufgabe.id;
  var blatt = document.getElementById("blatt");
  var fragenEl = document.getElementById("fragen");
  var zusammenfassung = document.getElementById("zusammenfassung");

  document.getElementById("titel").textContent = "Genau lesen: " + aufgabe.titel;
  document.title = "Genau lesen – " + aufgabe.titel;
  var wahl = document.getElementById("aufgabenwahl");
  if (aufgaben.length > 1) aufgaben.forEach(function (a) {
    var link = document.createElement("a");
    link.href = "lesen.html?aufgabe=" + a.id;
    link.className = "knopf rund" + (a.id === aufgabe.id ? " aktiv" : "");
    link.innerHTML = a.id + (Fortschritt.istGeloest("lesen", a.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(link);
  });

  // ---------- Zustand ----------
  var gespeichert = Speicher.lesen(speicherName, null) || {};
  var antworten = gespeichert.antworten || {};    // Fragennummer -> Antwortnummer
  var ergebnis = {};                               // Fragennummer -> "richtig" | "falsch" (nach dem Prüfen)
  function speichern() { Speicher.schreiben(speicherName, { antworten: antworten }); }

  // ---------- Aufgabenblatt ----------
  function zeichneBlatt() {
    var html = '<p class="lesen-einleitung">' + esc(aufgabe.einleitung) + "</p>";
    html += '<div class="arbeitsblatt"><h2>' + esc(aufgabe.blatt.titel) + "</h2><p>";
    aufgabe.blatt.saetze.forEach(function (s, i) {
      if (i > 0 && (s.absatz || s.teil)) html += "</p><p" + (s.teil ? ' class="teilaufgabe"' : "") + ">";
      if (s.teil) html += '<strong class="teil">' + esc(s.teil) + "</strong> ";
      html += '<span class="satz" data-satz="' + esc(s.id) + '">' + esc(s.text) + "</span> ";
    });
    blatt.innerHTML = html + "</p></div>";
  }

  function markiere(ids, scrollen) {
    Array.prototype.forEach.call(blatt.querySelectorAll(".satz"), function (el) {
      el.classList.toggle("markiert", ids.indexOf(el.getAttribute("data-satz")) >= 0);
    });
    var erstes = blatt.querySelector(".satz.markiert");
    if (scrollen && erstes && erstes.scrollIntoView) erstes.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  // ---------- Fragen ----------
  function zeichneFragen() {
    var html = "";
    aufgabe.fragen.forEach(function (f, i) {
      var e = ergebnis[i];
      html += '<section class="lesefrage' + (e ? " " + e : "") + '"><h2><span class="nr">' + (i + 1) + "</span> " + esc(f.frage) + "</h2>";
      html += '<div class="lese-antworten" role="radiogroup">';
      f.antworten.forEach(function (a, j) {
        var gewaehlt = antworten[i] === j;
        html += '<button type="button" class="knopf lese-antwort' + (gewaehlt ? " gewaehlt" : "") + '" role="radio" aria-checked="' +
          gewaehlt + '" data-frage="' + i + '" data-antwort="' + j + '">' + esc(a) + "</button>";
      });
      html += "</div>";
      if (e === "richtig") html += '<p class="lese-rueckmeldung richtig">✔ Richtig!</p>';
      if (e === "falsch") html += '<div class="lese-rueckmeldung falsch">✖ Noch nicht. ' + esc(f.tipp) +
        ' <button type="button" class="knopf klein-knopf" data-stelle="' + i + '">📖 Stelle im Text zeigen</button></div>';
      if (e === "fehlt") html += '<p class="lese-rueckmeldung fehlt">＋ Hier fehlt noch deine Antwort.</p>';
      html += "</section>";
    });
    fragenEl.innerHTML = html;
  }

  fragenEl.addEventListener("click", function (ev) {
    var knopf = ev.target.closest ? ev.target.closest("button") : null;
    if (!knopf) return;
    if (knopf.hasAttribute("data-stelle")) {
      markiere(aufgabe.fragen[parseInt(knopf.getAttribute("data-stelle"), 10)].saetze, true);
      return;
    }
    if (!knopf.hasAttribute("data-antwort")) return;
    var i = parseInt(knopf.getAttribute("data-frage"), 10), j = parseInt(knopf.getAttribute("data-antwort"), 10);
    antworten[i] = j;
    delete ergebnis[i];
    zusammenfassung.innerHTML = "";
    speichern();
    zeichneFragen();
  });

  document.getElementById("pruefen").addEventListener("click", function () {
    var richtig = 0, falsch = 0, fehlt = 0;
    aufgabe.fragen.forEach(function (f, i) {
      if (antworten[i] === undefined) { ergebnis[i] = "fehlt"; fehlt++; }
      else if (antworten[i] === f.richtig) { ergebnis[i] = "richtig"; richtig++; }
      else { ergebnis[i] = "falsch"; falsch++; }
    });
    zeichneFragen();
    markiere([], false);
    if (!falsch && !fehlt) { geloest(); return; }
    var t = ['<span class="zf">' + richtig + " von " + aufgabe.fragen.length + " richtig.</span>"];
    if (falsch) t.push('<span class="zf zf-falsch">✖ ' + falsch + (falsch === 1 ? " Antwort stimmt" : " Antworten stimmen") + " noch nicht. Tipp: „📖 Stelle im Text zeigen“ markiert, wo du nachlesen kannst.</span>");
    if (fehlt) t.push('<span class="zf zf-fehlt">＋ ' + fehlt + (fehlt === 1 ? " Frage ist" : " Fragen sind") + " noch offen.</span>");
    zusammenfassung.innerHTML = t.join(" ");
    var erste = fragenEl.querySelector(".lesefrage.falsch, .lesefrage.fehlt");
    if (erste && erste.scrollIntoView) erste.scrollIntoView({ block: "start", behavior: "smooth" });
  });

  document.getElementById("neustart").addEventListener("click", function () {
    antworten = {}; ergebnis = {};
    zusammenfassung.innerHTML = "";
    speichern(); markiere([], false); zeichneFragen();
    fragenEl.scrollTop = 0;
  });

  function geloest() {
    zusammenfassung.innerHTML = '<span class="zf zf-richtig">✔ Alle ' + aufgabe.fragen.length + " Fragen richtig beantwortet.</span>";
    Fortschritt.setzeGeloest("lesen", aufgabe.id);
    var stern = wahl.querySelector(".aktiv");
    if (stern && !stern.querySelector(".stern-klein")) stern.innerHTML += '<span class="stern-klein">★</span>';
    if (pruefeGlueckwunsch()) return;
    var naechste = aufgaben[aufgaben.indexOf(aufgabe) + 1], knoepfe = [];
    if (naechste) knoepfe.push({ text: "Nächste Aufgabe →", haupt: true, aktion: function () { location.href = "lesen.html?aufgabe=" + naechste.id; } });
    knoepfe.push({ text: "Zur Übersicht", haupt: !naechste, aktion: function () { location.href = "index.html"; } });
    knoepfe.push({ text: "Hierbleiben" });
    zeigeDialog({
      titel: "Super, genau gelesen!",
      html: '<p class="stern-gross" aria-hidden="true">★</p><p>Du hast alle Fragen richtig beantwortet. Lies in der Klassenarbeit genauso sorgfältig!</p>',
      knoepfe: knoepfe
    });
  }

  zeichneBlatt();
  zeichneFragen();
})();
