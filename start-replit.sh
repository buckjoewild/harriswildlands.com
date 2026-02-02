#!/bin/bash
echo "╔══════════════════════════════════════════╗"
echo "║  HARRIS WILDERNESS MUD - REPLIT START    ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "[1/3] Starting BruceOps..."
cd structure/harriswildlands && npm run dev &
echo "[2/3] Starting MUD Server..."
cd ../mud-server && python src/server.py &
echo "[3/3] All services started!"
echo ""
echo "Access your app at the URL shown in the Webview"
echo ""
wait
