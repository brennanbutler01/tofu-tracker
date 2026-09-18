#!/usr/bin/env python3
"""Prepare only the disposable, loopback-only development database."""
from pathlib import Path
import os
import secrets
import subprocess

ROOT = Path(__file__).resolve().parent.parent
DATABASE = "postgresql://demo:local-demo-only@127.0.0.1:5197/tofu_tracker"
local_environment = ROOT / ".env.local"
if not local_environment.exists():
    descriptor = os.open(local_environment, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(descriptor, "w") as output:
        output.write("DATABASE_URL=" + DATABASE + "\nNEXTAUTH_URL=http://127.0.0.1:5196\nNEXTAUTH_SECRET=" + secrets.token_urlsafe(40) + "\n")

values = dict(line.split("=", 1) for line in local_environment.read_text().splitlines() if "=" in line and not line.startswith("#"))
if values.get("DATABASE_URL") != DATABASE:
    raise SystemExit("Refusing setup: .env.local must target the documented disposable database.")
subprocess.run(["docker", "compose", "up", "-d", "--wait"], cwd=ROOT, check=True)
subprocess.run(["corepack", "yarn", "prisma", "db", "push"], cwd=ROOT, env={**os.environ, "DATABASE_URL": DATABASE}, check=True)
print("Local database ready. Run corepack yarn dev --port 5196. Email sign-in requires separate local provider credentials.")
