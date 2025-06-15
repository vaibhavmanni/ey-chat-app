# EY Chat App

A simple one-to-one chat application built with React, Socket.IO, Express, Sequelize and PostgreSQL, containerized with Docker.

---

## Prerequisites

- **Docker & Docker Compose**  
- **Node.js** (v16+ recommended)  
- **npm** (bundled with Node.js)  
- **OpenSSL** (for generating self-signed certificates)

---

## Project Structure

```text
ey-chat-app/
├── docker-compose.yml
├── server/
│   ├── src/
│   ├── ssl/        ← self-signed certs
│   ├── .env.example
│   ├── package.json
│   └── …
└── client/
    ├── src/
    ├── .env.example
    ├── package.json
    └── …
```

---

## Quickstart

All commands below assume you're at the project root (`ey-chat-app/`).

### 1. Bring up the database

```bash
docker-compose up -d
```

This will launch a PostgreSQL container at `localhost:5432` and create `chatapp` (and `chatapp_test`) databases.

### 2. Server Setup

```bash
cd server
cp .env.example .env       # copy & fill in your secrets
npm install
```

#### 2.1 Generate SSL certificates

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -days 365 \
  -subj "/CN=localhost"
```

#### 2.2 Run in development

```bash
npm run dev
```

This starts HTTP on `http://localhost:4000` and HTTPS on `https://localhost:4001`.

### 3. Client Setup

```bash
cd client
cp .env.example .env       # set VITE_API_URL=https://localhost:4001
npm install
npm run dev                # starts Vite on http://localhost:5173
```

---


## Seeding Dummy Data

After you've run migrations & your server is running:

```bash
cd server
npm run seed
```

Creates 5 demo users and ~100 chat messages for testing.

---

## Testing

### Server

```bash
cd server
npm test
```

### Client

```bash
cd client
npm run test
```

---

## System Design

### Architecture

```text
┌────────┐   HTTPS/WS    ┌────────┐   SQL    ┌───────────┐
│ Client │ ◀────────── ▶ │ Server │ ◀────── ▶│ Postgres  │  
│ (React)│               │(Express│          │(Sequelize)│
└────────┘               │ + WS)  │          └───────────┘
                         └────────┘
```

- REST endpoints for auth, users, conversations
- WebSocket (Socket.IO) for real-time messaging

### Tech Rationale

- **Sequelize**: familiar data-access layer, migrations & models
- **React (Vite)**: fast HMR, minimal config
- **Socket.IO**: simple rooms & real-time events
- **Docker**: uniform local environment

### Assumptions

- One-to-one chat only (no group threads)
- Text-only messaging (no file uploads yet)
- Self-signed certs for local HTTPS

### Scalability

- Stateless API servers behind a load balancer
- Redis adapter for Socket.IO to broadcast across multiple instances
- Horizontal scaling of app servers and Postgres read replicas