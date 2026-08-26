#!/bin/bash
# PRODERMA PLUS — dupli klik i sajt se otvara.
# Diže lokalni server u folderu u kom se ova skripta nalazi.

cd "$(dirname "$0")" || exit 1

PORT=8080
# ako je 8080 zauzet, traži prvi slobodan
while lsof -i ":$PORT" >/dev/null 2>&1; do
  PORT=$((PORT+1))
  [ $PORT -gt 8100 ] && { echo "Nema slobodnog porta."; read -r; exit 1; }
done

echo ""
echo "  PRODERMA PLUS"
echo "  ─────────────────────────────────────────"
echo "  Sajt se otvara na: http://localhost:$PORT"
echo ""
echo "  Ovaj prozor mora da ostane otvoren."
echo "  Kad završiš prezentaciju: Ctrl+C ili zatvori prozor."
echo "  ─────────────────────────────────────────"
echo ""

( sleep 1.2; open "http://localhost:$PORT/index.html" ) &

python3 -m http.server "$PORT" --bind 127.0.0.1
