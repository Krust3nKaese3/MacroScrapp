/*
 * LG Developer Mode verlängern (webOS)
 *
 * Zweck:     Hält die Developer-Mode-Session des LG-Fernsehers (webOS 25) am Leben.
 *            Ruft ResetDevModeSession auf (setzt die Restzeit wieder auf ca. 1000 h)
 *            und prüft danach mit CheckDevModeSession die Restzeit.
 *            Läuft über das Internet (developer.lge.com), der Fernseher muss nicht im selben WLAN sein.
 * Auslöser:  interval(6 h) – prüft alle 6 Stunden, verlängert aber nur, wenn die letzte
 *                            erfolgreiche Verlängerung mindestens 24 h her ist
 *                            (so klappt es auch, wenn das Handy mal offline war)
 *            manual()       – Test-Button: verlängert sofort und meldet die Restzeit
 * Meldung:   Benachrichtigung bei Fehler oder wenn die Restzeit unter RESTZEIT_WARNUNG_H liegt.
 * Secret:    LG_DEVMODE_TOKEN – 64-stelliger Session-Token. Auslesen im Dev-Manager-Terminal mit
 *            cat /var/luna/preferences/devmode_enabled
 *            Der Token steht nie im Code, nur in MacroScrapp (wird beim Speichern abgefragt).
 * Voraussetzungen: Hintergrundmodus von OpenScr an, Internet auf dem Handy.
 */
macro({
  id: "lg-devmode-verlaengern",
  name: "LG Developer Mode verlängern",
  secrets: [{ key: "LG_DEVMODE_TOKEN", label: "LG Dev-Mode Session-Token (64 Zeichen)", hint: "Dev-Manager-Terminal: cat /var/luna/preferences/devmode_enabled" }],
  triggers: [interval(6 * 60 * 60 * 1000), manual()],
  actions: async (ctx) => {
    // ===== EINSTELLUNGEN =====
    const ABSTAND_H = 24;            // frühestens alle 24 h verlängern
    const RESTZEIT_WARNUNG_H = 500;  // Warnung, wenn danach weniger Restzeit übrig ist

    const manuell = ctx.trigger && ctx.trigger.type === "manual";
    const jetzt = Date.now();
    const letzte = ctx.vars.lastSuccess || 0;
    if (!manuell && jetzt - letzte < ABSTAND_H * 3600000) {
      ctx.log("Letzte Verlängerung vor " + Math.round((jetzt - letzte) / 3600000) + " h, nichts zu tun");
      return;
    }

    const token = String(ctx.secrets.LG_DEVMODE_TOKEN || "").trim();
    const basis = "https://developer.lge.com/secure/";
    const aufruf = async (name) => {
      const r = await ctx.http.request({ url: basis + name + ".dev?sessionToken=" + encodeURIComponent(token), method: "GET", timeoutMs: 20000 });
      let j = null;
      try { j = JSON.parse(r.body); } catch (e) { /* kein JSON */ }
      if (r.status !== 200 || !j || j.result !== "success") {
        throw new Error(name + ": HTTP " + r.status + " " + String(r.body || "").slice(0, 200));
      }
      return j;
    };

    try {
      await aufruf("ResetDevModeSession");
      const check = await aufruf("CheckDevModeSession");
      const rest = String(check.errorMsg || "");          // z. B. "999:59:58"
      const stunden = parseInt(rest.split(":")[0], 10);
      if (isNaN(stunden)) throw new Error("Restzeit nicht lesbar: " + rest);

      ctx.vars.lastSuccess = jetzt;
      ctx.vars.lastRest = rest;
      delete ctx.vars.lastError;
      ctx.log("Verlängert, Restzeit " + rest);

      if (stunden < RESTZEIT_WARNUNG_H) {
        await ctx.notify("LG Dev-Mode: wenig Restzeit", "Nur noch " + rest + " h trotz Verlängerung. Token noch gültig?");
      } else if (manuell) {
        await ctx.notify("LG Dev-Mode verlängert", "Restzeit " + rest + " h");
      }
    } catch (e) {
      ctx.vars.lastError = e.message;
      ctx.log("FEHLER: " + e.message);
      await ctx.notify("LG Dev-Mode: Verlängerung fehlgeschlagen", e.message);
    }
  }
})
