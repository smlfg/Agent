I'll read the mandated documents first, then the existing UI and tech files.
## 1) Befunde

**Auslieferung**
- Kein Deploy-Pfad im Repo: keine `wrangler.*`, keine `_headers`/`_routes.json`, kein Pages-Projekt (`ls -a`, `package.json:8`). Dev ist nur `python3 http.server` auf `src/`. Deploy ist M4 (`docs/EXECUTION_PLAN-M0-M5.md:144-159`), nicht gebaut.
- `src/` hat kein `index.html`; Einstieg ist `living-surface.html` (`src/living-surface.html:1`, Umbenennung laut `M1-BERICHT.md:38`). Pages liefert `/` nur mit `index.html` oder `_redirects` → ohne Regel 404 auf der Wurzel.
- Keine Index-/Noindex-Steuerung, kein `robots.txt`, keine `theme-color`, kein Favicon, keine Description (`src/living-surface.html:3-12`). Für eine „ungelistete URL" (`tech/FREMDTEST-PLAN.md:49`) fehlt `X-Robots-Tag: noindex` bzw. `<meta name="robots">`.
- CI prüft nur das Gerüst: `.github/workflows/validate.yml` ruft ausschließlich `scripts/validate.sh`; `npm test` (`package.json:9`, 41 Tests) läuft nicht als Gate.
- Produktionsreste: `window.__agentfaehig = { store }` ist ungegated (`src/main.js:29`), Badge „DEV DATA" wird immer eingeblendet (`src/main.js:18-19`).

**Budget/Kontingent**
- Belegt aufgebraucht: 10.000 Neurons/Tag Free, durch offene Mikrofon-Sessions verbraucht (`docs/UNSOLVED-TECHNIK.md:26`; `ADR-BESPRECHUNG.md:19`); Streaming-STT ≈ 700 Neurons/min ≈ 14 Min/Tag, Voice ≈ 18 Wechsel/Tag (`docs/UX-INFORMATIONSARCHITEKTUR.md:146,666`).
- Textlimits: 300 req/min Standard, 20/50 req/min für Paid-Modelle (`docs/CLOUDFLARE-MACHBARKEIT-AUDIT-2026-11-19.md:116-127`); vier Rollen bei 20/min = 5 Turns/min global (`docs/handoffs/2026-11-19-upstream-grenzen.md:22`).
- Kein Guard im Code (keine `fetch`/`WebSocket`/Storage-Aufrufe in `src/`, grep ohne Treffer). M4 verlangt „Kosten-/Rate-Guard" als Deliverable (`EXECUTION_PLAN…:151`), existiert nicht.
- Erschöpftes Kontingent ist laut Papier ein gestalteter Zustand, Textweg bleibt offen (`UX-INFORMATIONSARCHITEKTUR.md:588,666-667`), im Code gibt es dafür keinen Zustand: keine Phase, kein Text, kein `data-status` (`src/state/store.js:5`).

**Datenschutz**
- M1 ist ehrlich „keine Persistenz": null Netzwerk-, Cookie-, Storage-APIs in `src/`. Das gilt nur lokal; sobald ein Modell angebunden wird, entstehen Prompts in Plattform-Logs. Kein Datenschutz-Dokument im Repo; Lücke explizit offen (`tech/LUECKEN-2026-11-12.md:167-171`), D7 ist Gate vor M4 (`EXECUTION_PLAN…:330`).
- Kein Consent/keine Datenschutzseite, kein Impressum (grep über `docs/`, `tech/`: 0 Treffer).

**Performance**
- Gemessen (gzip): JS ≈ 14,0 kB, CSS ≈ 6,3 kB, HTML 1,2 kB; keine Bilder, keine Webfonts geladen → Budget unkritisch (Summe ≈ 21,5 kB).
- Regel „nur transform/opacity" wird verletzt: `pair-out` animiert `filter: blur(4px)` (`src/styles/conversation.css:69-72`); `box-shadow`/`background-size` werden transitioniert (`:128-131`, `:174-180`); `background-attachment: fixed` (`src/styles/base.css:31`) und `backdrop-filter` (`src/styles/presence.css:108-109`) kosten Paint/GPU.
- Ungebündelt: 9 JS- + 6 CSS-Requests (je Modul ein Request, `src/living-surface.html:7-12,71`). Unter HTTP/2 unkritisch, als Budgetgrenze aber festhalten.
- Augen schreiben pro rohem `mousemove` zwei `style.transform` ungedrosselt (`src/vendor/openvoiceui/face/EyeFace.js:130-146,187`); bei 120-Hz-Pointern Dauerarbeit auf dem Main-Thread.
- LCP ist nicht gemessen; es gibt kein großes Bild/Text-Element, das LCP früh setzt (Composer ist leer, `src/living-surface.html:52`) → messen, nicht annehmen.
- Schriften `Bricolage Grotesque`/`Newsreader` werden benannt, aber nicht geladen (`src/styles/base.css:20-21`) → plattformabhängiger Fallback (Avenir/Georgia), kein Netzfehler.

**Accessibility (WCAG 2.2)**
- Kontrast: `--muted` auf `--bg-start` = 4,57:1, auf `--bg-end` = **4,07:1** (`base.css:3,6`) → `.pair-prompt` (0,9 rem, normaler Text, `conversation.css:29-34`) fällt unten unter 1.4.3.
- Placeholder mit `opacity: .55` ergibt ≈ **2,1:1** (`conversation.css:156-159`) → 1.4.3 verletzt, wenn Placeholder als Text gilt (tut er).
- Fehlertext wird nur ins `<p>` geschrieben, nicht in `#live` (`src/conversation/conversation.js:145-147` vs. `:136`) → Screenreader hört ihn nicht (4.1.3).
- „Denkt" ist stumm: `thinking-dots` sind `aria-hidden`, `#live` bleibt leer (`conversation.js:6,101`) → kein Status zwischen Senden und Antwort (4.1.3).
- Identische Zweitantwort wird nicht angesagt: `live.textContent = text` mit gleichem Wert erzeugt keine Mutation (`conversation.js:136`); bei 5 festen Antworten (`src/dev/devAgent.js:6-12`) real.
- Input-Fokus ist nur eine 2-px-Unterlinie, `outline: none` (`conversation.css:148-154`) → Kontrast ok (6,01:1), Fläche aber klein; als Risiko zu 2.4.11/2.4.13 führen, nicht als Verstoß.
- 2.2.2 ist gelöst (Toggle, `presence.js:113-121`); Reduced-Motion-Pfad existiert (`presence.js:78-83,123-125`), wurde aber nie mit emulierter Media-Query im Browser geprüft (`M1-BERICHT.md:41`). Media-Query wird nur einmal gelesen (`src/main.js:11`), kein `change`-Listener.

**Browser**
- Keine deklarierte Baseline, kein `browserslist`, kein Build. Genutzt: `:has()` (`conversation.css:191`), `100dvh` (`base.css:37`), `Intl.Segmenter` mit Fallback (`typewriter.js:67-73`), `dvh`/`:has` ohne Fallback. Firefox <121 und Safari <15.4 degradieren sichtbar (Sende-Gewichtung, Höhe).

**E2E**
- Kein Playwright: `package.json:11-13` enthält nur `code-canvas-server`; M1 verweigert Installation (`M1-BERICHT.md:42`). Testabdeckung ist Reducer/Dev-Agent/Typewriter plus Regex-Markup (`tests/store.test.js`, `tests/typewriter.test.js`, `tests/markup.test.js`) — kein DOM-Test für `conversation.js`/`presence.js`, kein Unterbrechen-Test im Browser.
- Plan fordert 3 Smokes (Aufwachen ≤ 6 s, Reduced-Motion, Tab-Reihenfolge) (`docs/EXECUTION_PLAN-M0-M5.md:550,659`); für öffentlich fehlen Senden und Unterbrechen.
- Stabile Haken existieren schon: `#stage[data-phase]` (`main.js:14-16`), `#composer-input`, `#pair`, `aria-busy` (`conversation.js:100,135`), `#motion-toggle` `aria-pressed` (`presence.js:74`), `entry.dataset.turn` (`conversation.js:170`). Kein Markup-Umbau nötig.

**Fremdtest**
- ADR-0005 ist Entscheidung, Ablauf liegt nur als ungeprüfter Vorschlag (`tech/FREMDTEST-PLAN.md:3-7`). Kriterium dort: T_first_action ≤ 20 s, ≥ 4/5 (`:67,88`) = „Person tippt von selbst"; Aufzeichnung Bild+Audio in einer Datei, frisches Profil, kein Think-Aloud in 20 s (`:49-54`).
- Der Plan testet T3–T6 (Regler, Hintergrund, Voice, `:69-72`), die es in M1 per Owner-Entscheid nicht gibt (`M1-BERICHT.md:44-50`) → Ablauf ist auf T1/T2 zu kürzen, sonst misst er Nichtvorhandenes.
- Er braucht eine ungelistete URL (`:49`) → Fremdtest setzt Deploy voraus.

## 2) Schnittstellen (andocken, ohne Bruch)

**Agent-Seam (bestehend, reicht für Backend):** `mountConversation({ root, store, agent, reducedMotion })` verlangt nur `agent.respond(prompt, { signal }) → Promise<{ text, dev }>` (`conversation.js:10,113`). Ein HTTP-Agent ersetzt `devAgent` ohne UI-Änderung.

**Ergänzend (additiv, alte Aufrufer bleiben gültig):**
```js
createHttpAgent({ endpoint:'/api/turn', fetchImpl=globalThis.fetch })
  .respond(prompt, { signal, onDelta }) -> Promise<{text, dev:false, status}>   // onDelta(text) optional
createStatusSurface({ root, store }) -> { destroy() }   // besitzt #live + Statuszeile
```
Stream-Format (NDJSON/SSE-Zeile): `{"type":"delta","text":"…"}` · `{"type":"done","text":"…"}` · `{"type":"error","code":"quota"|"rate_limited"|"network","retryAfterMs":n}`.

**Store (nur erweitern):** `RESPONSE_ERROR { turn, reason? }` — Reducer ignoriert Fremdfelder (`store.js:50-52`), Rückwärtskompatibilität bleibt. Kein neuer `phase`-Wert; Betriebsgrenze als `state.status ∈ null|'quota'|'rate_limited'|'offline'`, gespiegelt als `#stage[data-status]` neben `data-phase` (`main.js:15`).

**Rate-/Budget-Guard (Server, nicht Client):**
```js
guard.check(visitorId) -> { ok:boolean, reason?, retryAfterMs? }
// HTTP: 429 + Retry-After, Body {"code":"rate_limited","retryAfterMs":n}
//      503/200 mit {"code":"quota_exhausted"}  (Textweg bleibt offen)
```
`visitorId` = `crypto.randomUUID()` im Speicher, kein Cookie, kein Storage (passt zu „Reload = Neustart"). Vorhandenes, lokal bewiesenes Gerüst: `FleetLedger`/`FleetQuota`/`RateLimiter` (`CLOUDFLARE-MACHBARKEIT-AUDIT…:54,158`).

**CSS-Variablen (neu, additiv zu `base.css:2-23`):** `--status-fg`, `--status-bg`, `--status-line`, `--status-muted`. Vorhandene Achsen (`--bg-start/-end`, `--text`, `--muted`, `--accent`, `--line`, `--focus-ring`, `--ease`) bleiben; `--muted` braucht einen dunkleren Wert oder eine zweite Stufe für Fließtext.

**Header-Form (`_headers`):**
```
/*            X-Robots-Tag: noindex, nofollow
              Referrer-Policy: no-referrer
              X-Content-Type-Options: nosniff
              Content-Security-Policy: default-src 'self'; img-src 'self' data:; connect-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'self'
```

## 3) Was in der bestehenden UI vorbereitet/geändert werden muss

- `src/state/store.js`: `status`-Feld + `RESPONSE_ERROR.reason`; kein neuer Phase-Wert.
- `src/main.js`: `data-status` spiegeln; Reduced-Motion `change`-Listener; Debug-Global und Dev-Badge hinter ein `import.meta.env`/Query-Flag legen (`main.js:18-19,29`).
- `src/conversation/conversation.js`: Fehlertext zusätzlich in `#live`; „Thinking" einmal in `#live`; identische Antwort durch kurzes Leeren + Setzen ansagen (`:136`); Statuszeile statt reiner Fehlerzeile, damit `quota`/`rate_limited` denselben Pfad nutzen.
- `src/styles/*.css`: `--muted`-Kontrast für `bg-end`; Placeholder-Opacity ≥ Wert für 4,5:1; `filter: blur` aus `pair-out` entfernen; `background-attachment: fixed` prüfen.
- `src/living-surface.html`: `_redirects`/`index.html`-Entscheidung, `noindex`-Meta als Fallback zu den Headern, Favicon.
- Kein Umbau von `mount*`-Signaturen nötig; Tests bleiben gültig.

## 4) Reihenfolge / Priorität

**P1 (blockiert öffentlich):** Deploy-Pfad + `_redirects`/Noindex/Header; Server-Schlüssel + Rate-/Budget-Guard mit gestaltetem Grenzzustand; Datenschutz-Entscheidung (D7) vorher; `npm test` in CI; Fehler-/Denk-Status für AT; `--muted`- und Placeholder-Kontrast.
**P2:** Playwright-Setup mit den 5 Smokes (Erwachen, Senden, Unterbrechen, Reduced-Motion emuliert, Tab-Reihenfolge); Streaming-Seam (`onDelta`) und `first_glyph_ms`; Motion-Hygiene (`filter`, `mousemove`-Drosselung); Browser-Baseline dokumentieren.
**P3:** Fremdtest-Ablauf auf T1/T2 kürzen und mit ADR-0005 (eine Person, 20 s, zwei Fragen, Aufzeichnung) fahren; danach Feinschliff. Nicht vor P1, weil er eine URL braucht.

## 5) Owner-Fragen (Produkt)

1. Was darf eine öffentliche Version über Besucher speichern: nichts, nur anonyme Zählung, oder Modell-Logs mit Aufbewahrungsfrist?
2. Soll die Betriebsgrenze sichtbar benannt werden (ohne Zahl, Textweg offen) oder unsichtbar bleiben, bis sie greift?
3. Gilt „Reload = Neustart" auch für das Kontingent — also zählt ein Reload als neuer Besucher oder nicht?
4. Ist die erste öffentliche URL ungelistet oder sofort `agentfähig.de`?
5. Soll der Fremdtest (ADR-0005) vor oder nach der öffentlichen Version laufen — und darf dafür eine Testperson eine ungelistete URL sehen?
