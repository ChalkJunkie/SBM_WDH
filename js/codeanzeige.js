// =====================================================================
// js/codeanzeige.js – Arduino-Code farbig darstellen (Level 2)
// ---------------------------------------------------------------------
// Färbt Schlüsselwörter, Befehle, Konstanten und Zahlen ein, ähnlich
// wie in der Arduino-Software. Alles andere bleibt normal.
// =====================================================================
var CodeAnzeige = (function () {
  var WOERTER = {
    schluessel: ["void", "int", "if", "else", "#include"],
    befehl: ["pinMode", "digitalWrite", "digitalRead", "analogWrite", "delay", "attach", "write", "setup", "loop"],
    konstante: ["HIGH", "LOW", "OUTPUT", "INPUT_PULLUP", "INPUT"],
    typ: ["Servo"]
  };

  function faerbe(code) {
    // Zerlegen in Wörter, Zahlen und den Rest
    return String(code).replace(/(#include|[A-Za-z_][A-Za-z_0-9]*|\d+|[^A-Za-z_0-9#]+|#)/g, function (teil) {
      var e = esc(teil);
      if (/^\d+$/.test(teil)) return '<span class="c-zahl">' + e + "</span>";
      for (var art in WOERTER) {
        if (WOERTER[art].indexOf(teil) >= 0) return '<span class="c-' + art + '">' + e + "</span>";
      }
      return e;
    });
  }

  return { faerbe: faerbe };
})();
