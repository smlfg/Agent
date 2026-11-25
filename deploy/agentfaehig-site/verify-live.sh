#!/usr/bin/env bash
# Prüft nach jedem Deploy den echten Inhalt und die Routen BEIDER Worker.
# agentfähig.de (Worker agentfaehig) und human-agent-interface.com (Worker human-agent-interface)
# müssen getrennt bleiben. Exit != 0 bei jeder Abweichung.
set -uo pipefail
AF="https://www.xn--agentfhig-02a.de"
HAI="https://www.human-agent-interface.com"
fail=0
check() { # name, url, erwarteter Status, Muster im Inhalt (oder -)
  local body status
  body="$(curl -s -m 20 -w '\n%{http_code}' "$2")"; status="${body##*$'\n'}"; body="${body%$'\n'*}"
  if [ "$status" != "$3" ]; then echo "FAIL $1: HTTP $status (erwartet $3)"; fail=1; return; fi
  if [ "$4" != "-" ] && ! grep -qF "$4" <<<"$body"; then echo "FAIL $1: Inhalt ohne '$4'"; fail=1; return; fi
  echo "ok   $1"
}
check "agentfähig /  = Living Surface"       "$AF/"                       200 'id="composer-input"'
check "agentfähig /  ist NICHT die HAI-Seite" "$AF/"                       200 '<title>agentfähig</title>'
check "agentfähig /classic/ = alte Startseite" "$AF/classic/"               200 'Was willst du heute erledigen lassen'
check "agentfähig /main.js"                    "$AF/main.js"                200 'mountConversation'
check "agentfähig /agent/persona.json"         "$AF/agent/persona.json"     200 'agentfaehig/persona'
check "HAI / = HAI-Startseite"                 "$HAI/"                      200 'Human Agent Interface (HAI)'
check "HAI / ist NICHT die Living Surface"     "$HAI/"                      200 '-'
if grep -q 'id="composer-input"' <<<"$(curl -s -m 20 "$HAI/")"; then echo "FAIL HAI zeigt Living Surface (falscher Worker!)"; fail=1; fi
check "HAI /datenschutz/"                      "$HAI/datenschutz/"          200 '-'
check "HAI /impressum/"                        "$HAI/impressum/"            200 '-'
# /api/agent muss JSON liefern (Antwort oder ehrlicher Fehler), nie HTML.
api="$(curl -s -m 30 -X POST "$AF/api/agent" -H 'Content-Type: application/json' -H "Origin: $AF" -d '{"prompt":"ping from verify-live"}' -w '\n%{http_code}')"
code="${api##*$'\n'}"; json="${api%$'\n'*}"
# Grün nur mit echter Agentenantwort. {"error":"no_provider"} ist JSON, aber keine Antwort.
if printf '%s' "$json" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{const j=JSON.parse(d);process.exit(typeof j.text==="string"&&j.text.trim()?0:2)}catch{process.exit(1)}})' 2>/dev/null; then
  echo "ok   agentfähig /api/agent antwortet mit text (HTTP $code): $(printf '%s' "$json" | head -c 120)"
else
  echo "FAIL agentfähig /api/agent: HTTP $code, keine Agentenantwort — $(printf '%s' "$json" | head -c 140)"
  fail=1
fi
exit $fail
