#!/usr/bin/env bash
set -Eeuo pipefail

# GreetingLab local server + optional public tunnel.
# Put this script in the folder containing index.html and run it there.

PORT="${PORT:-8080}"
HOST="127.0.0.1"
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PID=""
TUNNEL_PID=""

cleanup() {
  [[ -n "$TUNNEL_PID" ]] && kill "$TUNNEL_PID" 2>/dev/null || true
  [[ -n "$SERVER_PID" ]] && kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

fail() { echo "ERROR: $*" >&2; exit 1; }

clear 2>/dev/null || true
echo "========================================"
echo "          GREETINGLAB LAUNCHER"
echo "========================================"
echo "Project directory: $ROOT"
echo

[[ -f "$ROOT/index.html" ]] || fail "index.html not found. Place this script in the actual GreetingLab folder."
command -v python3 >/dev/null 2>&1 || fail "Python 3 is missing. Install with: sudo apt update && sudo apt install -y python3"

start_server() {
  if command -v ss >/dev/null 2>&1 && ss -ltn | grep -q ":${PORT} "; then
    fail "Port $PORT is already in use. Set another port, e.g. PORT=8081 ./greetinglab-launcher.sh"
  fi
  python3 -m http.server "$PORT" --bind "$HOST" --directory "$ROOT" >/tmp/greetinglab-http.log 2>&1 &
  SERVER_PID="$!"
  sleep 1
  kill -0 "$SERVER_PID" 2>/dev/null || {
    cat /tmp/greetinglab-http.log >&2 || true
    fail "Local web server failed to start."
  }
}

echo "Choose how to run GreetingLab:"
echo "[1] Localhost only (private to this Kali machine)"
echo "[2] Cloudflare Quick Tunnel (temporary public HTTPS link)"
echo "[3] ngrok tunnel (requires ngrok installed and authenticated)"
echo "[0] Exit"
echo
read -r -p "Select an option [0-3]: " choice

case "$choice" in
  1)
    start_server
    echo
    echo "GreetingLab is running locally:"
    echo "http://${HOST}:${PORT}"
    echo "Press Ctrl+C to stop."
    wait "$SERVER_PID"
    ;;
  2)
    command -v cloudflared >/dev/null 2>&1 || fail "cloudflared is not installed. Install Cloudflare Tunnel for Kali, then run this script again."
    start_server
    echo
    echo "Starting Cloudflare Quick Tunnel..."
    echo "Wait for the https:// URL below. Share it only with intended visitors."
    cloudflared tunnel --url "http://${HOST}:${PORT}" &
    TUNNEL_PID="$!"
    echo
    echo "Local URL: http://${HOST}:${PORT}"
    echo "Press Ctrl+C to stop the server and tunnel."
    wait "$TUNNEL_PID"
    ;;
  3)
    command -v ngrok >/dev/null 2>&1 || fail "ngrok is not installed. Install it and configure your ngrok auth token first."
    start_server
    echo
    echo "Starting ngrok tunnel..."
    ngrok http "$PORT" --host-header="localhost:${PORT}" &
    TUNNEL_PID="$!"
    echo
    echo "Local URL: http://${HOST}:${PORT}"
    echo "Find the public HTTPS URL in the ngrok terminal output."
    echo "Press Ctrl+C to stop the server and tunnel."
    wait "$TUNNEL_PID"
    ;;
  0)
    echo "Exited."
    ;;
  *)
    fail "Invalid option. Run the script again and select 0, 1, 2, or 3."
    ;;
esac
