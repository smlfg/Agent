#!/usr/bin/env bash
# Sichert die Ergebnisse der DeepSeek-Agenten aus dem Scratchpad dauerhaft.
# - Berichte (out-*.md, brief-*.md) → docs/missions/agent-reports/
# - Code-Ergebnisse jeder isolierten Kopie (nur Dateien, die vom Hauptstand abweichen
#   oder neu sind) → deploy/agent-results/<agent>.tar.gz + Dateiliste
# Nichts davon wird in src/ übernommen. Wiederholbar (überschreibt die Archive).
set -euo pipefail
S=/private/tmp/claude-501/-Users-samuelfleig--claude-spares-spare-Um09sn/322679cd-6203-4b01-87ce-8c2f2a42f0d8/scratchpad
A=/Users/samuelfleig/Projects/03_HAI/Agentfaehig/Agent
R=$A/docs/missions/agent-reports
C=$A/deploy/agent-results
mkdir -p "$R" "$C"
for f in "$S"/out-*.md "$S"/brief-*.md; do
  [ -s "$f" ] || continue
  cp "$f" "$R/$(basename "$f" | sed 's/^out-/report-/')"
done
for wt in "$S"/wt-*; do
  [ -d "$wt" ] || continue
  id=$(basename "$wt" | sed 's/^wt-//')
  list="$C/$id-files.txt"
  ( cd "$wt" && { find src tests THIRD_PARTY_NOTICES.md -type f 2>/dev/null || true; } | while read -r p; do
      if [ ! -f "$A/$p" ] || ! cmp -s "$p" "$A/$p"; then echo "$p"; fi
    done ) > "$list"
  if [ -s "$list" ]; then
    tar -czf "$C/$id.tar.gz" -C "$wt" -T "$list"
  else
    rm -f "$list" "$C/$id.tar.gz"
  fi
done
echo "Berichte: $(ls "$R" | wc -l | tr -d ' ')  Code-Archive: $(ls "$C"/*.tar.gz 2>/dev/null | wc -l | tr -d ' ')"
