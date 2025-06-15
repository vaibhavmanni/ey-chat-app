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
```
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

- Self-signed certs for local HTTPS
- No typing indicators or read receipts
- No user presence/status beyond “online” when socket connected
- Simple pagination (infinite-scroll) only, no full‐text search over messages
- Single-device login (no multi‐device sync/modeling)
- No push notifications (relying entirely on WebSocket for real-time updates)


### Considerations for Scalability, Security, and Maintainability

#### Scalability
- **Stateless API servers** behind a load-balancer for easy horizontal scaling  
- **Redis adapter** for Socket.IO to share real-time events across instances  
- **Database scaling** with read-replicas and connection pooling (e.g. pg-pool)  
- **CDN or edge caching** for static assets in production  
- **Graceful shutdown** and connection draining to avoid dropped messages  

#### Security
- **HTTPS everywhere** (mkcert for local dev, proper CA in production)  
- **Secure HTTP headers** via Helmet (HSTS, CSP, X-Frame-Options, etc.)  
- **JWT best practices**: short expirations, refresh tokens, secure storage (httpOnly cookies)  
- **Rate limiting** and brute-force protection on auth endpoints  
- **Input validation & sanitization** at both client and server  

#### Maintainability
- **Modular architecture** (separate controllers, services, helpers)  
- **Automated testing**: unit, integration, and end-to-end tests  
- **CI/CD pipelines** for linting, building, testing, and deployment  
- **Centralized logging & metrics** (e.g. Winston/Logstash, Prometheus/Grafana)  
- **Clear documentation**: code comments, README, API specs  

