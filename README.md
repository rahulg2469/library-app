# library-app

A small library-management API (Node.js 20, Express, in-memory data). It is the demo target for
**DoubleCheck**, a CS6620 Cloud Computing project: every pull request is scanned by a SAST scanner
before merge, and after deploy to staging the running app is attacked by an API pentest tool.

**This app is deliberately vulnerable.** Do not deploy it anywhere public.

## Run it

```bash
npm install
ADMIN_PASSWORD=choose-one MEMBER_PASSWORD=choose-one npm start
curl localhost:4000/health
```

Or with Docker:

```bash
docker build -t library-app .
docker run -p 4000:4000 -e ADMIN_PASSWORD=choose-one library-app
```

Configuration is all environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Listen port | `4000` |
| `ADMIN_PASSWORD` | Password of the `admin` user | random, so login is impossible |
| `MEMBER_PASSWORD` | Password of `alice` and `bob` | random, so login is impossible |

Data lives in memory and is re-seeded on every start.

## API

| Method | Path | Behaviour |
|---|---|---|
| GET | `/health` | `{"status":"ok"}` |
| POST | `/api/login` | `{username, password}` returns `{token}`, or 401 |
| GET | `/api/users` | list users |
| GET | `/api/users/:id` | one user |
| GET | `/api/books` | list books |
| GET | `/api/books/search?q=` | filter books by title |
| POST | `/api/books` | add a book (send `Authorization: Bearer <token>`) |

## Seeded vulnerabilities on `main`

These only show up at runtime, so `main` passes SAST but fails the pentest:

- No rate limiting on `POST /api/login`.
- No security headers; `X-Powered-By: Express` is left on.
- `GET /api/users` returns password hashes and a `secret` field, and error responses include stack traces.
- `GET /api/users` needs no authentication.

## Demo branches

Each branch is based on `main` and becomes a PR during the demo.

| Branch | Change | Expected SAST result |
|---|---|---|
| `demo/vulnerable-login` | "Remember me" login with a hardcoded admin password, MD5 hashing and `Math.random()` tokens | blocks (HIGH) |
| `demo/fixed-login` | The same feature done properly | passes |
| `demo/medium-only` | `Math.random()` for a non-security ID and a hardcoded IP | warns only (MEDIUM) |

`.security-gate.yml` holds the DoubleCheck settings. `.github/workflows/deploy.yml` is a placeholder for the
deploy pipeline.
