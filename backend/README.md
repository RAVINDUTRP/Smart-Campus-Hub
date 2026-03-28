# Backend (Spring Boot)

Layered package structure is prepared under:

`src/main/java/com/smartcampus/operationshub/`

- `controller`
- `service`
- `repository`
- `entity`
- `dto`
- `mapper`
- `exception`
- `validation`
- `security`
- `config`

Testing folders are prepared under `src/test/java/com/smartcampus/operationshub/`.

## Baseline Run

- Default profile: `dev` (H2 in-memory database)
- Production profile: `prod` (PostgreSQL via environment variables)

Commands:

1. `mvn test`
2. `mvn spring-boot:run`

Health endpoint:

- `GET /api/v1/health`
