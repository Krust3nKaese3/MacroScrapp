# MacroScrapp - Limitationen und Einschränkungen

## Übersicht

Dieses Dokument beschreibt die aktuellen Limitationen von MacroScrapp und erklärt, welche Funktionen verfügbar sind bzw. welche zusätzliche OpenScr-Unterstützung benötigen.

## Aktuelle Limitationen

### 1. Bluetooth-Trigger

**Status:** ✅ VERFÜGBAR (ab OpenScr v2.0, PR #3)

**Implementiert in:** https://github.com/Krust3nKaese3/OpenScr/pull/3

**APIs:**
- ✅ `OpenScrBridge.events.on('bluetooth.connected', callback)`
- ✅ `OpenScrBridge.events.on('bluetooth.disconnected', callback)`
- ✅ `OpenScrBridge.bluetooth.getConnectedDevices()`

**Funktionen:**
- Classic Bluetooth Events (nicht BLE)
- Automatische Erkennung von Verbindungen/Trennungen
- Gerätefilterung nach Name oder MAC-Adresse

**Keine Einschränkungen mehr!**

---

### 2. App-Start-Trigger

**Status:** ✅ VERFÜGBAR (ab OpenScr v2.0, PR #3)

**Implementiert in:** https://github.com/Krust3nKaese3/OpenScr/pull/3

**APIs:**
- ✅ `OpenScrBridge.events.on('app.start', callback)`
- ✅ Funktioniert im Vordergrund UND Hintergrund

**Details:**
- Event wird 100ms nach WebView-Load gefeuert
- Enthält Timestamp im Payload: `{ timestamp: number }`

**Keine Einschränkungen mehr!**

---

### 3. Interval-Trigger im Hintergrund

**Status:** ✅ VERFÜGBAR (ab OpenScr v2.0, PR #3)

**Implementiert in:** https://github.com/Krust3nKaese3/OpenScr/pull/3

**APIs:**
- ✅ `OpenScrBridge.background.enable()`
- ✅ `OpenScrBridge.background.disable()`
- ✅ `OpenScrBridge.background.isEnabled()`

**Details:**
- Android Foreground Service mit persistenter Notification
- Hält WebView am Leben, auch bei Screen-Off
- Benutzer muss Battery Optimization deaktivieren (Prompt)
- Interval-Trigger laufen unbegrenzt im Hintergrund

**Keine Einschränkungen mehr!**

---

### 4. Erweiterte HTTP-API

**Status:** ✅ VERFÜGBAR (ab OpenScr v2.0, PR #3)

**Implementiert in:** https://github.com/Krust3nKaese3/OpenScr/pull/3

**API:**
```javascript
const response = await OpenScrBridge.http.request({
  url: 'http://192.168.1.100/api',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'value' }),
  timeoutMs: 5000
});
// Returns: { status: number, headers: object, body: string }
```

**Features:**
- ✅ Alle HTTP-Methoden (GET, POST, PUT, DELETE, etc.)
- ✅ Custom Headers
- ✅ Konfigurierbarer Timeout
- ✅ Response Headers verfügbar
- ✅ Cleartext HTTP (`http://`) für lokale Geräte

**Keine Einschränkungen mehr!**

---

### 5. Hintergrundmodus generell

**Status:** ✅ VERFÜGBAR (ab OpenScr v2.0, PR #3)

**Implementiert in:** https://github.com/Krust3nKaese3/OpenScr/pull/3

**Implementation:**
- Android Foreground Service mit Notification
- WebView bleibt am Leben bei Screen-Off
- Alle Trigger laufen unbegrenzt im Hintergrund

**User Experience:**
- Persistente Benachrichtigung: "OpenScr aktiv"
- Battery Optimization Dialog (einmalig)
- Kann mit `background.disable()` gestoppt werden

**Permissions:**
- ✅ `background` in `openscr.json` (und identisch in `everyapp.json`, Fallback)
- ✅ User-Consent erforderlich

**Keine Einschränkungen mehr!**

---

### 6. Keine UI für Trigger/Conditions-Builder

**Status:** ✅ By Design (nicht geplant)

**Grund:**
MacroScrapp ist bewusst **code-basiert** und für **AI-Generierung optimiert**. Ein grafischer Builder würde die Flexibilität einschränken und ist für den Use-Case nicht notwendig.

**Nutzung:**
Benutzer lassen Makros von einem AI-Assistenten schreiben:

**Beispiel-Prompt:**
> "Erstelle ein MacroScrapp, das bei Bluetooth-Verbindung mit 'MyCarAudio' eine HTTP POST-Anfrage an http://192.168.178.30/api/scene sendet mit Body {\"scene\":\"driving\"}."

AI generiert fertigen Code → Benutzer fügt ihn ein → Fertig.

**Alternative:**
Für Benutzer ohne AI-Zugang: Vorlagen in `examples/` Ordner bereitstellen.

---

### 7. HTTP CORS-Einschränkungen

**Status:** ⚠️ Plattform-abhängig

**Betroffen:**
- Externe APIs (z.B. öffentliche REST-APIs)

**Grund:**
HTTP-Requests von WebView aus unterliegen CORS-Policies. Viele externe APIs blockieren Requests ohne korrekte CORS-Header.

**Workaround:**
- Nur lokale Geräte/APIs verwenden (z.B. Smart Home im LAN)
- APIs mit CORS-Support nutzen
- Proxy-Server (außerhalb OpenScr-Scope)

**Lösung:**
OpenScr könnte HTTP-Requests über einen nativen Proxy ausführen (umgeht CORS), aber das hat Sicherheits-Implikationen.

---

### 8. Keine Multi-Step Debugging UI

**Status:** ✅ By Design

**Aktuell:**
- Makros werden als Ganzes ausgeführt
- Fehler werden im Log angezeigt
- Keine Schritt-für-Schritt-Ausführung oder Breakpoints

**Grund:**
Würde UI-Komplexität erhöhen und ist für den Use-Case nicht kritisch.

**Workaround:**
- Logs mit `ctx.log()` schreiben
- "Jetzt testen" Button für manuelles Debugging
- Makro in kleinere Schritte aufteilen

---

### 9. Keine persistenten Variablen über App-Neustart hinaus

**Status:** ⚠️ Eingeschränkt verfügbar

**Betroffen:**
- `ctx.vars` Persistierung

**Aktuell:**
- ✅ Variablen bleiben zwischen Makro-Ausführungen erhalten
- ✅ Überleben MacroScrapp-Neuladen
- ❌ Werden bei OpenScr-Neustart **möglicherweise** gelöscht (abhängig von Storage-Implementation)

**Grund:**
`OpenScrBridge.storage` verwendet `AsyncStorage`, sollte persistent sein - aber bei App-Cache-Löschen verloren gehen.

**Lösung:**
OpenScr dokumentiert Storage-Persistenz-Garantien.

---

### 10. Keine Makro-Prioritäten oder Abhängigkeiten

**Status:** ⏳ Zukünftig

**Aktuell:**
Alle Makros laufen unabhängig. Keine Möglichkeit zu sagen:
- "Makro A muss vor Makro B laufen"
- "Makro C hat höhere Priorität"

**Workaround:**
Makros kombinieren oder mit `ctx.wait()` verzögern.

**Zukünftige Erweiterung:**
```javascript
macro({
  name: "High Priority",
  priority: 1,  // Höhere Priorität zuerst
  // ...
})
```

---

## Zusammenfassung: Was funktioniert JETZT?

### ✅ ALLE Features vollständig verfügbar (ab OpenScr v2.0)

1. **Manual-Trigger:** "Jetzt testen" Button ✅
2. **Bluetooth-Trigger:** bluetoothConnected/Disconnected ✅
3. **App-Start-Trigger:** appStart() ✅
4. **Interval-Trigger:** Auch im Hintergrund ✅
5. **HTTP-API:** GET, POST, PUT, DELETE mit Custom Headers & Timeout ✅
6. **Hintergrundmodus:** background.enable/disable/isEnabled ✅
7. **Benachrichtigungen:** ctx.notify() ✅
8. **Vibration:** ctx.vibrate() ✅
9. **Logs:** ctx.log() ✅
10. **Persistente Variablen:** ctx.vars ✅
11. **Storage:** Makros werden gespeichert ✅
12. **Code-Validierung:** Syntax-Check beim Speichern ✅

### ⚠️ Verbleibende Einschränkungen

**Keine kritischen Einschränkungen mehr!** Alle Kern-Features sind implementiert.

---

## Roadmap: Feature-Status

### ✅ Phase 1 & 2: ABGESCHLOSSEN (OpenScr v2.0)

Alle Kern-Features sind implementiert und verfügbar:
- ✅ Bluetooth-Trigger (PR #3)
- ✅ Erweiterte HTTP-API (PR #3)
- ✅ Hintergrundmodus (PR #3)
- ✅ App-Start-Trigger (PR #3)
- ✅ Event-System (PR #3)

**Status:** PRODUCTION-READY

### Phase 3: **Erweiterte Features** (MacroScrapp v2.0, optional)
- ⏳ Weitere Trigger (WiFi, Standort, Zeit-basiert)
- ⏳ Makro-Prioritäten
- ⏳ Makro-Sharing (QR-Code, Export/Import)
- ⏳ Vorlagen-Bibliothek
- ⏳ Makro-Debugging UI

**Priorität:** Low (Nice-to-have)

---

## Update-Anleitung

### Stelle sicher, dass du OpenScr v2.0 oder neuer verwendest

**So prüfst du:**
1. Öffne MacroScrapp in OpenScr
2. Keine Warnmeldung "Einige Funktionen fehlen" → Du hast v2.0+
3. Mit Warnmeldung → Update OpenScr auf neueste Version

**Alle Features funktionieren ab OpenScr v2.0 (PR #3 gemerged).**

### Legacy-Workaround (nur für alte OpenScr-Versionen)

Falls du eine alte OpenScr-Version ohne PR #3 verwendest:

```javascript
macro({
  name: "Bluetooth-Polling (Workaround)",
  triggers: [interval(5000)],  // Alle 5 Sekunden
  actions: async (ctx) => {
    // Manual scan via existing API
    const Bridge = window.OpenScrBridge || window.EveryAppBridge;
    const devices = await Bridge.bluetooth.scan();
    const myDevice = devices.find(d => d.name === '1Mii');
    
    if (myDevice && !ctx.vars.wasConnected) {
      ctx.vars.wasConnected = true;
      // Execute action
      await ctx.http.get("http://192.168.178.20/power_on");
    } else if (!myDevice) {
      ctx.vars.wasConnected = false;
    }
  }
})
```

**Nachteile:**
- Battery-intensiv
- Verzögerung (bis zu 5 Sekunden)
- Unzuverlässig bei schnellen Verbindungswechseln

---

## Für Entwickler: Implementierungs-Priorität

**Empfohlene Reihenfolge für OpenScr-APIs:**

1. **Event-System** (Basis für alles andere)
2. **Bluetooth-Events** (höchster User-Value)
3. **Erweiterte HTTP-API** (einfach zu implementieren)
4. **Hintergrundmodus** (komplex, aber essentiell)
5. **App-Start-Event** (folgt aus Hintergrundmodus)

---

## Support & Feedback

- **Limitationen unerwartet?** → GitHub Issue in MacroScrapp-Repo
- **Feature-Request?** → Issue mit Label "enhancement"
- **Bridge-APIs fehlen?** → Issue in OpenScr-Repo

---

**Letzte Aktualisierung:** 2024 (damals Container EveryApp v1.0). Aktueller Name des Containers: OpenScr.

## Hintergrund (ab OpenScr mit nativem Makro-Task)
- Bluetooth- und interval-Trigger laufen im Hintergrund (interval mind. 10 s); `appStart()` nur bei geöffnetem MacroScrapp. Hintergrund-Code hat kein DOM/window.
- Hintergrundmodus muss an sein (Benachrichtigung "OpenScr aktiv"). Akku-Optimierung für OpenScr auf "Nicht eingeschränkt" stellen.
- Nach "Beenden erzwingen" in den Android-Einstellungen startet nichts mehr, bis die App wieder geöffnet wird.
