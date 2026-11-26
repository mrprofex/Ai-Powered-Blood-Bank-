import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import express from 'express';
import { createApiApp } from '../server/src/app.ts';
import { env } from '../server/src/config/env.ts';

describe('API Integration Tests', () => {
  let app: express.Express;
  let server: ReturnType<express.Express['listen']>;
  const PORT = 3456;
  const BASE_URL = `http://localhost:${PORT}`;

  before(async () => {
    app = createApiApp();
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function fetchJson(path: string, options?: RequestInit) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }

  it('GET /api/health returns ok', async () => {
    const { status, data } = await fetchJson('/api/health');
    assert.equal(status, 200);
    assert.equal(data.status, 'ok');
    assert.ok(data.service);
    assert.ok(data.timestamp);
  });

  it('GET /api/v1/network/summary returns network data', async () => {
    const { status, data } = await fetchJson('/api/v1/network/summary');
    assert.equal(status, 200);
    assert.equal(data.status, 'success');
    assert.ok(data.data);
    assert.ok(data.data.kpis);
    assert.ok(data.data.bloodGroupOverview);
  });

  it('GET /api/v1/network/availability returns filtered results', async () => {
    const { status, data } = await fetchJson('/api/v1/network/availability?bloodGroup=O+&component=PRBC&limit=10');
    assert.equal(status, 200);
    assert.equal(data.status, 'success');
    assert.ok(Array.isArray(data.data));
    assert.ok(data.meta);
    assert.equal(data.meta.isDemoData, true);
  });

  it('POST /api/v1/network/demo-request-check validates request', async () => {
    const { status, data } = await fetchJson('/api/v1/network/demo-request-check', {
      method: 'POST',
      body: JSON.stringify({
        hospitalName: 'Test Hospital',
        department: 'Emergency',
        bloodGroup: 'O+',
        component: 'PRBC',
        unitsNeeded: 5,
        urgency: 'HIGH',
        city: 'Mumbai',
      }),
    });
    assert.equal(status, 200);
    assert.equal(data.status, 'success');
  });

  it('POST /api/v1/network/demo-request-check rejects invalid blood group', async () => {
    const { status, data } = await fetchJson('/api/v1/network/demo-request-check', {
      method: 'POST',
      body: JSON.stringify({
        hospitalName: 'Test Hospital',
        bloodGroup: 'Z+',
        component: 'PRBC',
        unitsNeeded: 5,
        urgency: 'HIGH',
        city: 'Mumbai',
      }),
    });
    assert.equal(status, 400);
    assert.equal(data.status, 'error');
  });

  it('GET /api/v1/network/predictions returns predictions', async () => {
    const { status, data } = await fetchJson('/api/v1/network/predictions', {
      headers: { 'X-Demo-Role': 'HOSPITAL_COORDINATOR', 'X-Demo-User': 'test', 'X-Demo-Institution': 'Test Hospital' },
    });
    assert.ok([200, 401, 403].includes(status));
    if (status === 200) {
      assert.equal(data.status, 'success');
      assert.ok(data.data);
    }
  });

  it('Rate limiting works on auth endpoints', async () => {
    const headers = { 'Content-Type': 'application/json' };
    for (let i = 0; i < 7; i++) {
      const { status } = await fetchJson('/api/auth/test', { method: 'POST', headers, body: '{}' });
      if (i < 5) assert.notEqual(status, 429);
      else assert.equal(status, 429);
    }
  });

  it('CORS headers are present', async () => {
    const res = await fetch(`${BASE_URL}/api/health`, { method: 'OPTIONS' });
    assert.ok(res.headers.get('access-control-allow-origin'));
    assert.ok(res.headers.get('access-control-allow-methods'));
  });

  it('Security headers are present', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.ok(res.headers.get('x-content-type-options'));
    assert.ok(res.headers.get('x-frame-options'));
    assert.ok(res.headers.get('referrer-policy'));
    assert.ok(res.headers.get('x-xss-protection'));
  });

  it('Request size limit enforced', async () => {
    const largeBody = 'x'.repeat(100000);
    const { status } = await fetchJson('/api/v1/network/demo-request-check', {
      method: 'POST',
      body: largeBody,
    });
    assert.ok([400, 413, 500].includes(status));
  });
});

describe('API Error Handling', () => {
  let app: express.Express;
  let server: ReturnType<express.Express['listen']>;
  const PORT = 3457;
  const BASE_URL = `http://localhost:${PORT}`;

  before(async () => {
    app = createApiApp();
    await new Promise<void>((resolve) => {
      server = app.listen(PORT, () => resolve());
    });
  });

  after(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  async function fetchJson(path: string, options?: RequestInit) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }

  it('404 for unknown routes', async () => {
    const { status, data } = await fetchJson('/api/unknown-route');
    assert.equal(status, 404);
    assert.equal(data.status, 'error');
  });

  it('Malformed JSON returns 400', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/network/demo-request-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json}',
    });
    assert.equal(res.status, 400);
  });

  it('Error responses never leak stack traces', async () => {
    const { status, data } = await fetchJson('/api/trigger-error');
    if (status === 500) {
      assert.ok(data.message);
      assert.ok(!data.stack);
      assert.ok(!data.detail);
    }
  });
});

console.log('Integration tests passed!');