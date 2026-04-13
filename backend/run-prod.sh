#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Missing backend/.env"
  exit 1
fi

set -a
source .env
set +a

mvn spring-boot:run
