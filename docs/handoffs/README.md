# Handoffs — nicht anwendbare Änderungen

Stand: 19.11.2026. Ein Handoff ist **keine** Entscheidungswarteschlange und
**kein** Backlog. Er enthält einen fertigen, aber nicht angewendeten Patch oder
Befund, weil die Zieldatei parallel bearbeitet wurde oder außerhalb des
Write-Roots lag. Der Owner entscheidet, ob der Inhalt übernommen wird.

## Namensregel

`YYYY-MM-DD-<thema>.md` — Datum der Erstellung, danach das Thema in
Kleinschreibung mit Bindestrichen. Kein `HANDOFF-`-Präfix (der Ordner sagt es),
keine Großbuchstaben, keine Session-Hashes, keine laufenden Nummern.

## Bestand

| Datei | Thema | Herkunft / Status |
|---|---|---|
| [`2026-11-19-plan-konsolidierung.md`](2026-11-19-plan-konsolidierung.md) | K-1…K-4: Plan-/ID-Konflikte | nicht angewendet |
| [`2026-11-19-unsolved-ergaenzungen.md`](2026-11-19-unsolved-ergaenzungen.md) | U9–U14: Ergänzungen zur Prior-Art-Queue | nicht eingefügt |
| [`2026-11-19-unsolved-ids.md`](2026-11-19-unsolved-ids.md) | doppelte U-IDs, Materialwiderspruch | nicht angewendet |
| [`2026-11-19-upstream-grenzen.md`](2026-11-19-upstream-grenzen.md) | Upstream-Grenzen fürs Risikoregister | nicht eingebaut |
| [`2026-11-19-verifikation.md`](2026-11-19-verifikation.md) | V1–V7: Befunde der unabhängigen Prüfung | nicht eingefügt |
| [`2026-11-19-voice-slice2-review.md`](2026-11-19-voice-slice2-review.md) | Voice als Slice 2 | nicht angewendet |

Die eigentlichen Warteschlangen liegen in
[`docs/UNSOLVED-TECHNIK.md`](../UNSOLVED-TECHNIK.md) (Technik/Planung) und
[`docs/UNSOLVED-PLANUNG.md`](../UNSOLVED-PLANUNG.md) (Produkt/Wireframes).
