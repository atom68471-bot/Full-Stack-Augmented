#!/usr/bin/env bash
# A convenience script to start both backend and frontend during development.
# Usage:
#   ./run.sh        # builds (if necessary) and runs services
#   ./run.sh build  # build backend jar and install frontend deps then exit

set -euo pipefail

ROOT=$(cd "$(dirname "$0")" && pwd)

function build_all() {
    echo "[build] backend: running mvn clean package"
    (cd "$ROOT/backend" && mvn clean package)

    echo "[build] frontend: installing npm packages"
    (cd "$ROOT/frontend" && npm install)
}

if [[ ${1-} == "build" ]]; then
    build_all
    echo "Build complete. Use './run.sh' to start the app."
    exit 0
fi

# Make sure dependencies exist
if [[ ! -f "$ROOT/backend/target/backend-1.0.0.jar" ]]; then
    echo "backend JAR not found; running build step first"
    build_all
fi

# start backend and frontend in parallel
echo "Starting backend and frontend..."

(cd "$ROOT/backend" && mvn spring-boot:run) &
BACK_PID=$!

# give backend a moment before launching frontend
sleep 2

(cd "$ROOT/frontend" && npm start) &
FRONT_PID=$!

# Trap termination signals to kill children (and their process groups)
# using negative PIDs ensures the entire group is killed, which catches Java
# subprocesses spawned by Maven.
trap "echo 'Shutting down...';
      kill -TERM -$BACK_PID 2>/dev/null || true;
      kill -TERM -$FRONT_PID 2>/dev/null || true" EXIT INT TERM

wait $BACK_PID $FRONT_PID
