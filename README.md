# Smart Campus Hub 🎓

![Smart Campus Hub Banner](https://img.shields.io/badge/SLIIT-PAF%20Module-blueviolet?style=for-the-badge)

> **SLIIT IT3030 - Programming Applications & Frameworks**  
> 3rd Year, 2nd Semester — Group Project

---

## 🚀 Project Overview

**Smart Campus Hub** is a modern, full-stack web application designed to streamline campus operations for students and staff. It integrates resource booking, ticketing, and real-time notifications into a single, user-friendly platform.

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Spring Boot, Spring Security, JPA/Hibernate
- **Database:** H2 (dev), Flyway migrations
- **DevOps:** Maven, Docker, Postman

---

## ✨ Features

- 📅 **Resource Booking:** Reserve rooms, labs, and equipment with approval workflows
- 🎫 **Ticketing System:** Report and track campus issues
- 🔔 **Notifications:** Real-time updates for bookings and tickets
- 🔐 **Authentication:** Secure login/signup with OAuth2 support
- 📊 **Dashboards:** Elegant UI with live stats and filters

---

## 🏗️ Project Structure

```
Smart-Campus-Hub/
├── backend/         # Spring Boot API & business logic
├── frontend/        # React client app
├── infra/           # Docker, K8s, deployment scripts
├── docs/            # Architecture, API, evidence
├── postman/         # API test collections
└── scripts/         # Utility scripts
```

---

## ⚡ Quick Start

### 1. Backend
```bash
cd backend
mvn spring-boot:run
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation
- [API Endpoints](docs/api/endpoint-ownership-matrix.md)
- [Architecture Diagrams](docs/architecture/)
- [Evidence & Testing](docs/evidence/)

---

## 👨‍💻 Authors & Contributors
- **Ravindu TRP** — [github.com/RAVINDUTRP](https://github.com/RAVINDUTRP)
- **Akindu Shenal**
- **Aravindi Chirathya**
- **Lihini Athukorala**

---

## 🏫 About
This project was developed as part of the SLIIT IT3030 Programming Applications & Frameworks module (3rd Year, 2nd Semester).

---

## 🌟 License
This project is for academic use at SLIIT. For other use, contact the authors.
	- `feat/ws4-...`
2. Use commit prefixes with the same workstream code.
	- `WS1: add resource create endpoint`
	- `WS2: add booking overlap validation`
3. Open PRs using the project PR template and complete the endpoint/UI ownership sections.
4. Record merged work in documentation:
	- `docs/requirements/work-allocation-plan.md`
	- `docs/api/endpoint-ownership-matrix.md`
	- `docs/evidence/contribution-log-template.md`

## Next Step

Generate the backend and frontend starter apps inside the existing structure and then wire auth, database, and CI checks.

## Run Locally

Prerequisites:

- Java 17+
- Maven 3.9+
- Node.js 20+

Backend:

1. `cd backend`
2. `mvn spring-boot:run`
3. Health check: `http://localhost:8080/api/v1/health`

Frontend:

1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`

## Shared Team Database Setup (Recommended)

Use this mode when all team members must see the same data.

1. Provision one shared PostgreSQL instance (cloud or centrally hosted).
2. Copy `backend/.env.shared.example` to `backend/.env.shared`.
3. Fill `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` with the same values for all team members.
4. Optional: create `backend/.env` for local-only overrides (for example OAuth2 keys).
5. Start backend with:
	- `./scripts/run_backend_shared.sh`
6. Start frontend with:
	- `cd frontend && npm run dev -- --host`

Notes:

- `dev` profile uses H2 in-memory and is not shared.
- `dev,persist` profile is local-file persistence on one machine only.
- `prod` profile + same PostgreSQL credentials is the team-shared mode.
- `./scripts/run_backend_shared.sh` keeps shared DB credentials from `backend/.env.shared`, while still applying local auth overrides from `backend/.env`.
