# Demo Engine - Functional Tests

## Prerequisites
- Application running at localhost:5000
- Environment variables:
  - `TEST_MODE=true`
  - `ENABLE_DEMO_MODE=true`

## Running Tests
```bash
TEST_MODE=true npx tsx tests/demo-engine/demo-engine.test.ts
```

## Test Cases
1. Room allocation and credential generation
2. Login with demo credentials
3. Dashboard access
4. Expiry enforcement
5. Housekeeping reset
6. Post-housekeeping credential invalidation
7. Concurrency safety (max 10 rooms)
8. Room status endpoint

## Test Hooks
Test hooks are only available when TEST_MODE=true and NODE_ENV is not production.
- POST /api/test/demo/expire-room
- POST /api/test/demo/run-housekeeping
- GET /api/test/demo/room-status
- POST /api/test/demo/force-available
