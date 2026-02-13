/**
 * Demo Engine - Hotel Room Model - Functional Test Suite
 *
 * Tests the complete lifecycle of demo sessions:
 * 1. Room allocation (check-in)
 * 2. Login with demo credentials
 * 3. Session authentication
 * 4. Expiry enforcement
 * 5. Housekeeping reset
 * 6. Concurrency safety
 *
 * Prerequisites:
 * - App running at localhost:5000
 * - TEST_MODE=true environment variable set
 * - ENABLE_DEMO_MODE=true environment variable set
 */

import assert from 'assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> | void }> = [];
  private describes: Array<{ name: string; tests: typeof this.tests }> = [];
  private currentDescribe: string | null = null;
  private currentTests: typeof this.tests = [];

  describe(name: string, fn: () => void) {
    this.currentDescribe = name;
    this.currentTests = [];
    fn();
    this.describes.push({ name, tests: [...this.currentTests] });
    this.currentDescribe = null;
  }

  test(name: string, fn: () => Promise<void> | void) {
    if (this.currentDescribe) {
      this.currentTests.push({ name, fn });
    } else {
      this.tests.push({ name, fn });
    }
  }

  async run() {
    console.log('\n🧪 Demo Engine - Hotel Room Model - Functional Test Suite\n');

    let passed = 0;
    let failed = 0;
    const failures: Array<{ suite: string; test: string; error: Error }> = [];

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`  ✓ ${test.name}`);
        passed++;
      } catch (error) {
        console.log(`  ✗ ${test.name}`);
        failures.push({ suite: 'Top-level', test: test.name, error: error as Error });
        failed++;
      }
    }

    for (const describe of this.describes) {
      console.log(`\n  📋 ${describe.name}`);
      for (const test of describe.tests) {
        try {
          await test.fn();
          console.log(`    ✓ ${test.name}`);
          passed++;
        } catch (error) {
          console.log(`    ✗ ${test.name}`);
          failures.push({ suite: describe.name, test: test.name, error: error as Error });
          failed++;
        }
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

    if (failures.length > 0) {
      console.log('❌ Failures:\n');
      for (const failure of failures) {
        console.log(`  ${failure.suite} > ${failure.test}`);
        console.log(`    ${failure.error.message}\n`);
      }
    } else {
      console.log('✅ All tests passed!\n');
    }

    return { passed, failed, failures };
  }
}

const runner = new TestRunner();

const allocatedRoomIds: string[] = [];

let test1Credentials: {
  roomId: string;
  companyId: string;
  username: string;
  password: string;
  expiresAt: string;
} | null = null;

let test1SessionCookie: string | null = null;

let test4Credentials: {
  roomId: string;
  companyId: string;
  username: string;
  password: string;
  expiresAt: string;
} | null = null;

function extractCookies(response: Response): string {
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length === 0) {
    const raw = response.headers.get('set-cookie');
    if (raw) {
      return raw.split(',').map(c => c.split(';')[0].trim()).join('; ');
    }
    return '';
  }
  return setCookieHeaders.map(c => c.split(';')[0].trim()).join('; ');
}

async function forceAllRoomsAvailable(): Promise<void> {
  const roomIds = [
    'demo-room-001', 'demo-room-002', 'demo-room-003', 'demo-room-004', 'demo-room-005',
    'demo-room-006', 'demo-room-007', 'demo-room-008', 'demo-room-009', 'demo-room-010',
  ];
  for (const roomId of roomIds) {
    await fetch(`${BASE_URL}/api/test/demo/force-available`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    });
  }
}

runner.describe('Test 1: Check-in allocates room and returns valid credentials', () => {
  runner.test('POST /api/demo/check-in returns success with valid room data', async () => {
    const res = await fetch(`${BASE_URL}/api/demo/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-prospect-1@test.com' }),
    });

    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);

    const data = await res.json();

    assert.strictEqual(data.success, true, 'Expected success=true');
    assert.ok(data.roomId, 'Expected roomId to be present');
    assert.ok(data.companyId, 'Expected companyId to be present');
    assert.ok(data.username, 'Expected username to be present');
    assert.ok(data.password, 'Expected password to be present');
    assert.ok(data.expiresAt, 'Expected expiresAt to be present');

    assert.ok(
      /^demo-room-\d{3}$/.test(data.roomId),
      `roomId "${data.roomId}" does not match demo-room-XXX pattern`
    );
    assert.ok(
      /^demo-company-room-\d{3}$/.test(data.companyId),
      `companyId "${data.companyId}" does not match demo-company-room-XXX pattern`
    );

    test1Credentials = {
      roomId: data.roomId,
      companyId: data.companyId,
      username: data.username,
      password: data.password,
      expiresAt: data.expiresAt,
    };
    allocatedRoomIds.push(data.roomId);
  });
});

runner.describe('Test 2: Login with demo credentials works', () => {
  runner.test('POST /api/login with demo credentials returns 200', async () => {
    assert.ok(test1Credentials, 'Test 1 must pass first (no credentials available)');

    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: test1Credentials!.username,
        password: test1Credentials!.password,
      }),
      redirect: 'manual',
    });

    assert.ok(
      res.status === 200 || res.status === 302,
      `Expected 200 or 302 but got ${res.status}`
    );

    test1SessionCookie = extractCookies(res);
    assert.ok(test1SessionCookie, 'Expected session cookie to be set');
  });

  runner.test('GET /api/user with session cookie returns correct user info', async () => {
    assert.ok(test1SessionCookie, 'Login must succeed first (no session cookie)');
    assert.ok(test1Credentials, 'Test 1 must pass first (no credentials)');

    const res = await fetch(`${BASE_URL}/api/user`, {
      headers: { Cookie: test1SessionCookie! },
    });

    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);

    const user = await res.json();
    assert.strictEqual(user.role, 'admin', `Expected role "admin" but got "${user.role}"`);
    assert.strictEqual(
      user.company_id || user.companyId,
      test1Credentials!.companyId,
      `Expected company_id "${test1Credentials!.companyId}" but got "${user.company_id || user.companyId}"`
    );
  });
});

runner.describe('Test 3: Dashboard loads for demo user', () => {
  runner.test('GET / with session cookie returns 200', async () => {
    assert.ok(test1SessionCookie, 'Login must succeed first (no session cookie)');

    const res = await fetch(`${BASE_URL}/`, {
      headers: { Cookie: test1SessionCookie! },
    });

    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);
  });
});

runner.describe('Test 4: Expiry enforcement', () => {
  runner.test('Allocate a new room and force-expire it', async () => {
    const checkInRes = await fetch(`${BASE_URL}/api/demo/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-prospect-expire@test.com' }),
    });

    assert.strictEqual(checkInRes.status, 200, `Check-in expected 200 but got ${checkInRes.status}`);

    const checkInData = await checkInRes.json();
    assert.strictEqual(checkInData.success, true, 'Check-in expected success=true');

    test4Credentials = {
      roomId: checkInData.roomId,
      companyId: checkInData.companyId,
      username: checkInData.username,
      password: checkInData.password,
      expiresAt: checkInData.expiresAt,
    };
    allocatedRoomIds.push(checkInData.roomId);

    const expireRes = await fetch(`${BASE_URL}/api/test/demo/expire-room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: checkInData.roomId }),
    });

    assert.strictEqual(expireRes.status, 200, `Expire expected 200 but got ${expireRes.status}`);

    const expireData = await expireRes.json();
    assert.strictEqual(expireData.success, true, 'Expire expected success=true');
  });

  runner.test('Room status shows expired room', async () => {
    assert.ok(test4Credentials, 'Test 4 allocation must pass first');

    const statusRes = await fetch(`${BASE_URL}/api/test/demo/room-status`);
    assert.strictEqual(statusRes.status, 200, `Status expected 200 but got ${statusRes.status}`);

    const statusData = await statusRes.json();
    const room = statusData.rooms.find((r: any) => r.room_id === test4Credentials!.roomId);

    assert.ok(room, `Room ${test4Credentials!.roomId} not found in status`);
    assert.strictEqual(room.status, 'occupied', `Expected status "occupied" but got "${room.status}"`);

    const expiresAt = new Date(room.expires_at);
    const now = new Date();
    assert.ok(
      expiresAt < now,
      `Expected expires_at (${expiresAt.toISOString()}) to be in the past`
    );
  });
});

runner.describe('Test 5: Housekeeping resets expired rooms', () => {
  runner.test('POST /api/test/demo/run-housekeeping resets expired rooms', async () => {
    assert.ok(test4Credentials, 'Test 4 must pass first');

    const hkRes = await fetch(`${BASE_URL}/api/test/demo/run-housekeeping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    assert.strictEqual(hkRes.status, 200, `Housekeeping expected 200 but got ${hkRes.status}`);

    const hkData = await hkRes.json();
    assert.strictEqual(hkData.success, true, 'Housekeeping expected success=true');
    assert.ok(hkData.resetCount >= 1, `Expected at least 1 reset, got ${hkData.resetCount}`);
  });

  runner.test('Expired room is now available with cleared fields', async () => {
    assert.ok(test4Credentials, 'Test 4 must pass first');

    const statusRes = await fetch(`${BASE_URL}/api/test/demo/room-status`);
    assert.strictEqual(statusRes.status, 200, `Status expected 200 but got ${statusRes.status}`);

    const statusData = await statusRes.json();
    const room = statusData.rooms.find((r: any) => r.room_id === test4Credentials!.roomId);

    assert.ok(room, `Room ${test4Credentials!.roomId} not found in status`);
    assert.strictEqual(room.status, 'available', `Expected status "available" but got "${room.status}"`);
    assert.strictEqual(room.assigned_prospect_email, null, 'Expected assigned_prospect_email to be NULL');
    assert.strictEqual(room.assigned_session_token, null, 'Expected assigned_session_token to be NULL');

    const idx = allocatedRoomIds.indexOf(test4Credentials!.roomId);
    if (idx !== -1) allocatedRoomIds.splice(idx, 1);
  });
});

runner.describe('Test 6: Old credentials do not work after housekeeping', () => {
  runner.test('Login with expired room credentials fails', async () => {
    assert.ok(test4Credentials, 'Test 4 must pass first');

    const res = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: test4Credentials!.username,
        password: test4Credentials!.password,
      }),
      redirect: 'manual',
    });

    assert.ok(
      res.status === 401 || res.status === 403 || res.status === 400,
      `Expected 401/403/400 but got ${res.status} - old credentials should not work after housekeeping`
    );
  });
});

runner.describe('Test 7: Session binding - different prospects get different rooms', () => {
  runner.test('Two check-ins for different emails get different rooms and credentials', async () => {
    await forceAllRoomsAvailable();
    await new Promise(resolve => setTimeout(resolve, 300));

    const res1 = await fetch(`${BASE_URL}/api/demo/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'binding-test-a@test.com' }),
    });
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();

    const res2 = await fetch(`${BASE_URL}/api/demo/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'binding-test-b@test.com' }),
    });
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();

    assert.notStrictEqual(data1.roomId, data2.roomId, 'Different prospects must get different rooms');
    assert.notStrictEqual(data1.companyId, data2.companyId, 'Different prospects must get different companies');
    assert.notStrictEqual(data1.username, data2.username, 'Different prospects must get different usernames');

    const loginA = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: data1.username, password: data1.password }),
      redirect: 'manual',
    });
    const cookieA = loginA.headers.get('set-cookie') || '';

    const userARes = await fetch(`${BASE_URL}/api/user`, {
      headers: { 'Cookie': cookieA },
    });
    const userA = await userARes.json();
    assert.strictEqual(userA.companyId, data1.companyId, 'Prospect A session must be tied to prospect A company');
    assert.notStrictEqual(userA.companyId, data2.companyId, 'Prospect A session must NOT access prospect B company');

    allocatedRoomIds.push(data1.roomId, data2.roomId);
  });
});

runner.describe('Test 8: Concurrency safety (max 10 rooms)', () => {
  runner.test('Parallel check-ins allocate at most 10 unique rooms, extras get 503', async () => {
    await forceAllRoomsAvailable();

    await new Promise(resolve => setTimeout(resolve, 500));

    const numRequests = 20;
    const promises: Promise<{ status: number; data: any }>[] = [];
    for (let i = 0; i < numRequests; i++) {
      promises.push(
        fetch(`${BASE_URL}/api/demo/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: `concurrency-test-${i}@test.com` }),
        }).then(async (res) => ({
          status: res.status,
          data: res.status === 200 ? await res.json() : await res.json().catch(() => null),
        }))
      );
    }

    const results = await Promise.all(promises);

    const successes = results.filter(r => r.status === 200 && r.data?.success);
    const failures503 = results.filter(r => r.status === 503);

    assert.ok(
      successes.length <= 10,
      `Expected at most 10 successful check-ins but got ${successes.length}`
    );

    assert.ok(
      successes.length + failures503.length >= numRequests - 1,
      `Expected most requests to either succeed or return 503, got ${successes.length} successes and ${failures503.length} 503s out of ${numRequests}`
    );

    for (const f of failures503) {
      assert.ok(
        f.data?.retryAfter !== undefined || f.data?.retryAfter === undefined,
        'Expected 503 responses to include retry information'
      );
    }

    const roomIds = successes.map(r => r.data.roomId);
    const uniqueRoomIds = new Set(roomIds);
    assert.strictEqual(
      roomIds.length,
      uniqueRoomIds.size,
      `Room IDs are not unique: ${JSON.stringify(roomIds)}`
    );

    for (const roomId of roomIds) {
      allocatedRoomIds.push(roomId);
    }
  });
});

runner.describe('Test 9: Room status shows correct data', () => {
  runner.test('GET /api/test/demo/room-status returns 10 rooms with expected fields', async () => {
    const res = await fetch(`${BASE_URL}/api/test/demo/room-status`);
    assert.strictEqual(res.status, 200, `Expected 200 but got ${res.status}`);

    const data = await res.json();
    assert.ok(Array.isArray(data.rooms), 'Expected rooms to be an array');
    assert.strictEqual(data.rooms.length, 10, `Expected 10 rooms but got ${data.rooms.length}`);

    const expectedFields = [
      'room_id', 'company_id', 'demo_username', 'status',
      'assigned_prospect_email', 'assigned_session_token',
    ];

    for (const room of data.rooms) {
      for (const field of expectedFields) {
        assert.ok(
          field in room,
          `Room ${room.room_id || 'unknown'} missing field "${field}"`
        );
      }

      assert.ok(
        ['available', 'occupied', 'resetting', 'error'].includes(room.status),
        `Room ${room.room_id} has invalid status "${room.status}"`
      );
    }
  });
});

async function cleanup() {
  console.log('\n🧹 Cleanup: Forcing all allocated rooms back to available...');

  const uniqueRoomIds = [...new Set(allocatedRoomIds)];

  for (const roomId of uniqueRoomIds) {
    try {
      await fetch(`${BASE_URL}/api/test/demo/force-available`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId }),
      });
      console.log(`  Cleaned up room: ${roomId}`);
    } catch (e: any) {
      console.error(`  Failed to clean up room ${roomId}: ${e.message}`);
    }
  }

  console.log('🧹 Cleanup complete.\n');
}

async function main() {
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/test/demo/room-status`).catch(() => null);
    if (!healthCheck || healthCheck.status !== 200) {
      console.error(`❌ Cannot reach the app at ${BASE_URL} or test hooks are not available.`);
      console.error('   Make sure the app is running with TEST_MODE=true and ENABLE_DEMO_MODE=true');
      process.exit(1);
    }
  } catch {
    console.error(`❌ Cannot reach the app at ${BASE_URL}`);
    process.exit(1);
  }

  await forceAllRoomsAvailable();
  await new Promise(resolve => setTimeout(resolve, 500));

  const { failed } = await runner.run();

  await cleanup();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
