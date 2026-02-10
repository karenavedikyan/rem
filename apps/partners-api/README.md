# RemCard Partners API

Lightweight micro-backend for RemCard partners.

- Stack: Node.js + TypeScript + Express
- Database: Prisma + SQLite (`prisma/dev.db`)
- Deployment target: Railway (or any Node hosting)

## Quick start

```bash
npm install
npx prisma migrate dev --name init_partner_model
npm run dev
```

Server runs on:

- `http://localhost:3001` by default
- `process.env.PORT` if provided

## Scripts

- `npm run dev` — start dev server with auto-reload
- `npm run build` — compile TypeScript into `dist/`
- `npm run start` — start compiled build
- `npm run prisma:migrate` — run Prisma migrations
- `npm run prisma:generate` — regenerate Prisma client

## API

### Healthcheck

- `GET /health`

Response:

```json
{ "ok": true, "service": "partners-api" }
```

### GET /partners

Returns partners list.

Query params:

- `approved=true` — returns only approved partners (`isApproved = true`)
- if param is missing — returns all partners

Example:

```http
GET http://localhost:3001/partners?approved=true
```

### POST /partners

Creates a new partner.

Required fields:

- `name`: string
- `type`: `"individual"` or `"company"`

Optional fields:

- `city`: string (default: `"Краснодар"`)
- `description`: string
- `isApproved`: boolean (default: `false`)
- `id`: number (if passed, updates existing partner with this id)

Create example:

```http
POST http://localhost:3001/partners
Content-Type: application/json

{
  "name": "Иван Петров",
  "type": "individual",
  "city": "Краснодар",
  "description": "Мастер по ремонту санузлов",
  "isApproved": true
}
```

Telegram/JS example:

```js
await fetch("https://<BASE_URL>/partners", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: partnerName,
    type: "individual",
    city: "Краснодар",
    description: specialization,
    isApproved: true,
  }),
});
```

## Notes for Railway

- Set `PORT` via Railway automatically (Express already supports it).
- For SQLite MVP, persistent disk is required.
- For production, you can switch Prisma datasource to Postgres.
