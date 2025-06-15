# EY Chat App

A simple one-to-one chat application built with React, Socket.IO, Express, Sequelize and PostgreSQL, containerized with Docker.

---

## Prerequisites

- **Docker & Docker Compose**  
- **Node.js** (v16+ recommended)  
- **npm** (bundled with Node.js)  
- **mkcert** (for generating trusted local SSL certificates)

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
docker compose up -d
```

This will launch a PostgreSQL container at `localhost:5432` and create `chatapp` (and `chatapp_test`) databases.

### 2. Server Setup

```bash
cd server
cp .env.example .env       # copy & fill in your secrets
npm install
```

#### 2.1 Generate SSL certificates
First, install your local CA into the system trust store:
```bash
mkcert -install
```
Then create the SSL certificates:
```bash
mkdir -p ssl
mkcert -key-file ssl/key.pem -cert-file ssl/cert.pem localhost 127.0.0.1
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
              ┌─────────┐
              │ Browser │
              │ (React) │
              └─────────┘
                    │
    HTTPS/REST (auth, users, conversations)
       WebSocket (Socket.IO handshake)
                    |
                    ▼
        ┌───────────────────────┐
        │     API Server        │
        │  (Node.js + Express)  │
        │  • REST & WS routes   │
        │  • JWT auth middleware│
        │  • Sequelize ORM      │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │    PostgreSQL DB      │
        │     (Sequelize)       │
        │ • Users, Messages     │
        │ • Migrations & Seeds  │
        └───────────────────────┘

**Transport Layer**
- All traffic over HTTPS (local certs via mkcert)
- WebSocket upgrade on the same port for real-time messaging

**REST API**
- Endpoints under `/auth`, `/users`, `/conversations`
- JWT tokens issued at login, validated via middleware

**WebSocket (Socket.IO)**
- Handshake carries the JWT for authentication
- Private "rooms" by user-ID for one-to-one chat

**Database**
- PostgreSQL `chatapp` and `chatapp_test`
- Sequelize models, migrations, and seeds
- ACID compliance ensures message consistency

**Development Proxy**
- Vite's dev server proxies `/api` calls to Express via `VITE_API_URL`
- Fast HMR for React components and automatic server reload on change

### Tech Rationale

**PostgreSQL + Docker**
- ACID compliance ensures reliable message delivery and data consistency
- Docker provides consistent development environment and easy deployment

**React + Vite**
- Fast development with hot module replacement
- Component-based architecture ideal for chat UI patterns

**Express.js**
- Minimal framework with excellent Socket.IO integration
- Mature ecosystem for authentication and middleware

**Socket.IO**
- Built-in room management for private conversations
- Automatic fallback (WebSocket → polling) ensures reliable real-time communication

**Sequelize**
- Database migrations and relationship modeling
- Built-in validation and SQL injection protection

### Assumptions

- One-to-one chat only (no group threads)
- Text-only messaging (no file uploads yet)
- Self-signed certs for local HTTPS

### Scalability

- Stateless API servers behind a load balancer
- Redis adapter for Socket.IO to broadcast across multiple instances
- Horizontal scaling of app servers and Postgres read replicas