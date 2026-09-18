"""Deploy only the static portfolio artifact to the dedicated personal project."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument("--check", action="store_true", help="Validate packaging without deploying")
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
project_path = root / ".vercel/project.json"
project = json.loads(project_path.read_text())
if project.get("projectName") != "tofu-tracker-demo" or project.get("orgId") != "team_cwjFWlUVzkCIYgVepQ6Glc71":
    raise SystemExit("Link the dedicated personal tofu-tracker-demo Vercel project first.")
if not (root / "portfolio-site/out/index.html").is_file():
    raise SystemExit("Run corepack yarn build:portfolio first.")
for path in (root / "portfolio-site/out").rglob("*"):
    if path.is_file() and (path.name.startswith(".env") or path.suffix in {".map", ".pem"}):
        raise SystemExit("Unexpected sensitive or source artifact in static output: " + path.name)
# A directory outside Git publishes the verified artifact without Git author metadata.
with tempfile.TemporaryDirectory(prefix="tofu-tracker-deploy-") as directory:
    target = Path(directory)
    output = target / ".vercel/output"
    output.mkdir(parents=True)
    shutil.copyfile(project_path, target / ".vercel/project.json")
    shutil.copytree(root / "portfolio-site/out", output / "static")
    (output / "config.json").write_text(json.dumps({
        "version": 3,
        "routes": [{"handle": "filesystem"}, {"src": "/(.*)", "dest": "/404.html", "status": 404}],
    }))
    if args.check:
        print("Static deployment package validated; no upload performed.")
    else:
        subprocess.run([
            "npm", "exec", "--yes", "--package=vercel@59.15.0", "--",
            "vercel", "deploy", "--prebuilt", "--prod", "--yes",
            "--scope", "brennanbutler01s-projects",
        ], cwd=target, check=True)
