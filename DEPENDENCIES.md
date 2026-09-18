# Dependency verification

Updated September 18, 2026. The application uses Node 24, Next.js 16.3.4 and Prisma 7.10.0 with the PostgreSQL driver adapter. Provider, upload and testing libraries were refreshed through their direct dependencies. No dependency overrides were added.

The full dependency audit still reports three advisories through the Prisma development command-line package: recursive-object stack exhaustion in deepmerge-ts 7.1.5, and two mysql2 advisories covering authentication downgrade and compressed-protocol decompression. The newest eligible Prisma release still pins these versions. These findings are not dismissed as fixed. The application uses PostgreSQL, does not run the Prisma development server, and does not accept untrusted Prisma configuration.

Prisma's command-line package is a development dependency. Do not expose Studio or other development tools publicly. The September 18 visitor deployment audit reports the same three development-tool advisories. The real application uses the PostgreSQL adapter; no MySQL connection or publicly exposed Prisma development server is configured. Deployment status and hosted verification are tracked in BACKEND-READINESS.md.

Run `corepack yarn audit --json` to reproduce the full dependency report. Source publication and a synthetic static demo do not imply production readiness of every legacy backend route.
