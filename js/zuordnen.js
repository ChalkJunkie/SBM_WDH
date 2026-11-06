// =====================================================================
// js/zuordnen.js – Bereich 2, Teil A: Code und Kommentar zuordnen
// ---------------------------------------------------------------------
// Bedienung: Zeile antippen, dann Kommentar antippen (oder umgekehrt).
// Zusätzlich kann man einen Kommentar auf eine Zeile ziehen.
// =====================================================================
(function () {

  var programme = DATEN.programme;
  var gewuenscht = adressParameter("programm");
  var prog = programme.filter(function (p) { return p.id === gewuenscht; })[0] || programme[0];
  var speicherName = "zuordnen_" + prog.id;

  // Zeilen, die einen Kommentar brauchen
  var ziele = [];
  prog.zeilen.forEach(function (z, i) { if (z.kommentar) ziele.push(i); });

  // ---------- Zustand ----------
  // karten: Kommentare in gemischter Reihenfolge (Index = Kartennummer)
  // zuordnung: Zeilenindex -> Kartennummer
  var gespeichert = Speicher.lesen(speicherName, null);
  var reihenfolge, zuordnung = {};
  if (gespeichert && gespeichert.reihenfolge && gespeichert.reihenfolge.length === ziele.length) {
    reihenfolge = gespeichert.reihenfolge;
    zuordnung = gespeichert.zuordnung || {};
  } else {
    reihenfolge = mische(ziele.slice());
  }
  var karten = reihenfolge.map(function (zeile) { return prog.zeilen[zeile].kommentar; });
  var markierung = {};     // Zeilenindex -> "richtig" | "falsch" (nach dem Prüfen)
  var gewaehlteZeile = null, gewaehlteKarte = null;

  function mische(liste) {
    for (var i = liste.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = liste[i];
      liste[i] = liste[j]; liste[j] = t;
    }
    return liste;
  }

  function speichern() {
    Speicher.schreiben(speicherName, { reihenfolge: reihenfolge, zuordnung: zuordnung });
  }

  function karteBenutzt(k) {
    for (var z in zuordnung) if (zuordnung[z] === k) return true;
    return false;
  }

  // ---------- Seite aufbauen ----------
  document.getElementById("titel").textContent = "Code und Kommentar: " + prog.titel;
  document.title = prog.titel + " – Code und Kommentar";
  document.getElementById("auftrag").textContent = prog.auftrag;

  var wahl = document.getElementById("programmwahl");
  programme.forEach(function (p, i) {
    var a = document.createElement("a");
    a.href = "zuordnen.html?programm=" + p.id;
    a.className = "knopf rund" + (p.id === prog.id ? " aktiv" : "");
    a.setAttribute("aria-label", p.titel + (Fortschritt.istGeloest("zuordnen", p.id) ? " (gelöst)" : ""));
    a.innerHTML = (i + 1) + (Fortschritt.istGeloest("zuordnen", p.id) ? '<span class="stern-klein">★</span>' : "");
    wahl.appendChild(a);
  });

  var codeliste = document.getElementById("codeliste");
  // Breite der Code-Spalte = längste Zeile (damit alle Kommentare bündig stehen)
  codeliste.classList.add("mit-kommentaren");
  codeliste.style.setProperty("--code-ch", Math.max.apply(null, prog.zeilen.map(function (z) { return z.code.length; })));
  var kommentarliste = document.getElementById("kommentarliste");
  var rueckmeldung = document.getElementById("rueckmeldung");

  function zeichne() {
    // Codezeilen
    codeliste.innerHTML = "";
    prog.zeilen.forEach(function (z, i) {
      var li = document.createElement("li");
      li.className = "codezeile" + (z.kommentar ? " zuordenbar" : " grau") +
        (i === gewaehlteZeile ? " gewaehlt" : "") + (markierung[i] ? " " + markierung[i] : "");
      li.setAttribute("data-zeile", i);
      var html = '<span class="zeilennr">' + (i + 1) + '</span><code class="code">' + CodeAnzeige.faerbe(z.code) + "</code>";
      if (z.kommentar) {
        var k = zuordnung[i];
        var symbol = markierung[i] === "richtig" ? '<span class="slot-symbol" aria-label="richtig">✔</span>'
                   : markierung[i] === "falsch" ? '<span class="slot-symbol" aria-label="falsch">✖</span>' : "";
        html += '<button type="button" class="slot' + (k !== undefined ? " belegt" : "") + '" data-zeile="' + i + '">' +
          (k !== undefined ? symbol + '<span class="slot-text">// ' + esc(karten[k]) + "</span>"
                           : '<span class="slot-leer">＋ Kommentar zuordnen</span>') + "</button>";
      }
      li.innerHTML = html;
      codeliste.appendChild(li);
    });
    // Kommentarkarten (nur die noch nicht benutzten)
    kommentarliste.innerHTML = "";
    var frei = 0;
    karten.forEach(function (text, k) {
      if (karteBenutzt(k)) return;
      frei++;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "karte" + (k === gewaehlteKarte ? " gewaehlt" : "");
      b.setAttribute("data-karte", k);
      b.textContent = "// " + text;
      kommentarliste.appendChild(b);
    });
    if (!frei) kommentarliste.innerHTML = '<p class="klein">Alle Kommentare sind verteilt. Drücke „Prüfen“.</p>';
  }

  // ---------- Antippen ----------
  function ordneZu(zeile, karte) {
    // Hatte die Zeile schon einen Kommentar? Der geht zurück in die Liste.
    zuordnung[zeile] = karte;
    delete markierung[zeile];
    gewaehlteZeile = null; gewaehlteKarte = null;
    speichern(); zeichne();
  }

  codeliste.addEventListener("click", function (e) {
    var el = e.target.closest ? e.target.closest("[data-zeile]") : null;
    if (!el) return;
    var i = parseInt(el.getAttribute("data-zeile"), 10);
    if (!prog.zeilen[i].kommentar) return;
    // Belegten Kommentar antippen: lösen
    if (e.target.closest(".slot.belegt")) {
      delete zuordnung[i]; delete markierung[i];
      gewaehlteZeile = i; gewaehlteKarte = null;
      speichern(); zeichne();
      return;
    }
    if (gewaehlteKarte !== null) { ordneZu(i, gewaehlteKarte); return; }
    gewaehlteZeile = (gewaehlteZeile === i) ? null : i;
    zeichne();
  });

  kommentarliste.addEventListener("click", function (e) {
    if (Date.now() - letztesZiehen < 400) return;   // Klick nach dem Ziehen ignorieren
    var el = e.target.closest ? e.target.closest("[data-karte]") : null;
    if (!el) return;
    var k = parseInt(el.getAttribute("data-karte"), 10);
    if (gewaehlteZeile !== null) { ordneZu(gewaehlteZeile, k); return; }
    gewaehlteKarte = (gewaehlteKarte === k) ? null : k;
    zeichne();
  });

  // ---------- Ziehen (zusätzlich zum Antippen) ----------
  var ziehen = null, letztesZiehen = 0;
  kommentarliste.addEventListener("pointerdown", function (e) {
    var el = e.target.closest ? e.target.closest("[data-karte]") : null;
    if (!el) return;
    ziehen = { karte: parseInt(el.getAttribute("data-karte"), 10), x: e.clientX, y: e.clientY, aktiv: false, el: el };
  });
  window.addEventListener("pointermove", function (e) {
    if (!ziehen) return;
    if (!ziehen.aktiv && Math.hypot(e.clientX - ziehen.x, e.clientY - ziehen.y) > 12) {
      ziehen.aktiv = true;
      ziehen.geist = ziehen.el.cloneNode(true);
      ziehen.geist.className = "karte geist";
      document.body.appendChild(ziehen.geist);
      document.body.classList.add("zieht-karte");
    }
    if (ziehen.aktiv) {
      ziehen.geist.style.left = (e.clientX + 8) + "px";
      ziehen.geist.style.top = (e.clientY + 8) + "px";
      var ziel = document.elementFromPoint(e.clientX, e.clientY);
      Array.prototype.forEach.call(codeliste.querySelectorAll(".ueber"), function (x) { x.classList.remove("ueber"); });
      var zeile = ziel && ziel.closest ? ziel.closest(".codezeile.zuordenbar") : null;
      if (zeile) zeile.classList.add("ueber");
      e.preventDefault();
    }
  }, { passive: false });
  window.addEventListener("pointerup", function (e) {
    if (!ziehen) return;
    var z = ziehen; ziehen = null;
    if (!z.aktiv) return;
    letztesZiehen = Date.now();
    document.body.removeChild(z.geist);
    document.body.classList.remove("zieht-karte");
    var ziel = document.elementFromPoint(e.clientX, e.clientY);
    var zeile = ziel && ziel.closest ? ziel.closest(".codezeile.zuordenbar") : null;
    if (zeile) ordneZu(parseInt(zeile.getAttribute("data-zeile"), 10), z.karte);
    else zeichne();
  });
  window.addEventListener("pointercancel", function () {
    if (ziehen && ziehen.geist) document.body.removeChild(ziehen.geist);
    document.body.classList.remove("zieht-karte");
    ziehen = null; zeichne();
  });

  // ---------- Prüfen ----------
  document.getElementById("pruefen").addEventListener("click", function () {
    gewaehlteZeile = null; gewaehlteKarte = null;
    var falsch = [], leer = 0, richtig = 0;
    markierung = {};
    ziele.forEach(function (i) {
      var k = zuordnung[i];
      if (k === undefined) { leer++; return; }
      // Richtig, wenn der Text stimmt (gleiche Kommentare sind austauschbar)
      if (karten[k] === prog.zeilen[i].kommentar) { markierung[i] = "richtig"; richtig++; }
      else { markierung[i] = "falsch"; falsch.push(i); }
    });
    zeichne();

    if (!falsch.length && !leer) {
      Fortschritt.setzeGeloest("zuordnen", prog.id);
      rueckmeldung.innerHTML = '<div class="meldung meldung-richtig"><span class="meldung-symbol">✔</span>' +
        "<div><strong>Alles richtig!</strong> Du hast einen Stern bekommen.</div></div>";
      var naechstes = programme[programme.indexOf(prog) + 1];
      var knoepfe = [];
      if (naechstes) knoepfe.push({ text: "Nächstes Programm →", haupt: true, aktion: function () { location.href = "zuordnen.html?programm=" + naechstes.id; } });
      knoepfe.push({ text: "Zur Übersicht", haupt: !naechstes, aktion: function () { location.href = "index.html"; } });
      knoepfe.push({ text: "Hierbleiben" });
      if (pruefeGlueckwunsch()) return;   // alle Sterne gesammelt: großer Glückwunsch
      zeigeDialog({ titel: "Super, alles richtig!", html: '<p class="stern-gross" aria-hidden="true">★</p><p>Alle Kommentare passen.</p>', knoepfe: knoepfe });
      return;
    }
    var html = "<h2 class=\"rueckmeldung-titel\">" + richtig + " von " + ziele.length + " Kommentaren passen.</h2><ol class=\"meldungen\">";
    falsch.forEach(function (i, n) {
      var dok = prog.zeilen[i].dokument || prog.dokument;
      html += '<li><button type="button" class="meldung meldung-fehler" data-zeile-sprung="' + i + '">' +
        '<span class="meldung-symbol" aria-hidden="true">✖</span><span class="meldung-text"><span class="meldung-art">Zeile ' + (i + 1) + ":</span> " +
        "Dieser Kommentar passt nicht zu <code>" + esc(prog.zeilen[i].code.trim()) + "</code>." +
        '<span class="meldung-dokument">📖 Schau nach: ' + esc(dokumentText(dok)) + "</span></span></button></li>";
    });
    if (leer) html += '<li><div class="meldung meldung-fehlt"><span class="meldung-symbol" aria-hidden="true">＋</span><span class="meldung-text"><span class="meldung-art">Fehlt noch:</span> ' +
      (leer === 1 ? "1 Zeile hat" : leer + " Zeilen haben") + " noch keinen Kommentar.</span></div></li>";
    html += "</ol><p class=\"klein\">Tippe einen falschen Kommentar an, um ihn zu lösen, und ordne neu zu.</p>";
    rueckmeldung.innerHTML = html;
    Array.prototype.forEach.call(rueckmeldung.querySelectorAll("[data-zeile-sprung]"), function (b) {
      b.addEventListener("click", function () {
        var el = codeliste.querySelector('[data-zeile="' + b.getAttribute("data-zeile-sprung") + '"]');
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  });

  document.getElementById("neustart").addEventListener("click", function () {
    zeigeDialog({
      titel: "Von vorne beginnen?",
      html: "<p>Alle Zuordnungen in diesem Programm werden gelöscht und die Kommentare neu gemischt.</p>",
      knoepfe: [
        { text: "↺ Von vorne", haupt: true, aktion: function () {
          reihenfolge = mische(ziele.slice());
          karten = reihenfolge.map(function (zeile) { return prog.zeilen[zeile].kommentar; });
          zuordnung = {}; markierung = {}; gewaehlteZeile = null; gewaehlteKarte = null;
          rueckmeldung.innerHTML = "";
          speichern(); zeichne();
        } },
        { text: "Abbrechen" }
      ]
    });
  });

  zeichne();
})();
