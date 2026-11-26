import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApiApp } from '../../server/src/app.ts';
import type { Express } from 'express';

describe('API Integration Tests', () => {
  let app: Express;
  const demoHeaders = {
    'X-Demo-Role': 'HOSPITAL_COORDINATOR',
    'X-Demo-User': 'Dr. Priya Sharma (Demo)',
    'X-Demo-Institution': 'Metro Trauma Center (Demo)',
  };

  beforeAll(() => {
    app = createApiApp();
  });

  describe('Health Check', () => {
    it('GET /api/health returns 200 with service info', async () => {
      const response = await request(app).get('/api/health').expect(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('predictive-emergency-blood-shortage-network');
      expect(response.body.phase).toBe('phase-1-foundation');
      expect(response.body.database.provider).toBe('neon-postgresql');
      expect(response.body.integrations).toBeDefined();
    });
  });

  describe('Network Summary', () => {
    it('GET /api/v1/network/summary returns demo network data', async () => {
      const response = await request(app).get('/api/v1/network/summary').expect(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.isDemoData).toBe(true);
      expect(response.body.data.kpis).toBeDefined();
      expect(response.body.data.kpis.registeredHospitals).toBeGreaterThan(0);
      expect(response.body.data.kpis.registeredBloodBanks).toBeGreaterThan(0);
      expect(response.body.data.kpis.availableBloodUnits).toBeGreaterThan(0);
      expect(response.body.data.bloodGroupOverview).toHaveLength(8);
    });

    it('blood group overview has all 8 blood groups', async () => {
      const response = await request(app).get('/api/v1/network/summary').expect(200);
      const groups = response.body.data.bloodGroupOverview.map((g: any) => g.bloodGroup);
      expect(groups).toEqual(expect.arrayContaining(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']));
    });

    it('each blood group has required fields', async () => {
      const response = await request(app).get('/api/v1/network/summary').expect(200);
      for (const group of response.body.data.bloodGroupOverview) {
        expect(group).toHaveProperty('bloodGroup');
        expect(group).toHaveProperty('availableUnits');
        expect(group).toHaveProperty('minimumThreshold');
        expect(group).toHaveProperty('daysOfCover');
        expect(group).toHaveProperty('riskLevel');
        expect(['LOW', 'MODERATE', 'CRITICAL']).toContain(group.riskLevel);
      }
    });
  });

  describe('Blood Availability', () => {
    it('GET /api/v1/network/availability returns filtered records', async () => {
      const response = await request(app).get('/api/v1/network/availability').expect(200);
      expect(response.body.status).toBe('success');
      expect(response.body.meta.isDemoData).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('filters by blood group', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ bloodGroup: 'O-' })
        .expect(200);
      for (const record of response.body.data) {
        expect(record.bloodGroup).toBe('O-');
      }
    });

    it('filters by component', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ component: 'PRBC' })
        .expect(200);
      for (const record of response.body.data) {
        expect(record.component).toBe('PRBC');
      }
    });

    it('filters by state', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ state: 'Maharashtra' })
        .expect(200);
      for (const record of response.body.data) {
        expect(record.state).toBe('Maharashtra');
      }
    });

    it('filters by risk level', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ riskLevel: 'CRITICAL' })
        .expect(200);
      for (const record of response.body.data) {
        expect(record.riskLevel).toBe('CRITICAL');
      }
    });

    it('searches by facility name', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ search: 'KEM' })
        .expect(200);
      for (const record of response.body.data) {
        const haystack = `${record.facilityName} ${record.city} ${record.state}`.toLowerCase();
        expect(haystack).toContain('kem');
      }
    });

    it('respects limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/network/availability')
        .query({ limit: 5 })
        .expect(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('rejects invalid blood group', async () => {
      await request(app)
        .get('/api/v1/network/availability')
        .query({ bloodGroup: 'Z+' })
        .expect(400);
    });

    it('rejects invalid risk level', async () => {
      await request(app)
        .get('/api/v1/network/availability')
        .query({ riskLevel: 'INVALID' })
        .expect(400);
    });
  });

  describe('Demo Request Validation', () => {
    it('POST /api/v1/network/demo-request-check validates valid request', async () => {
      const response = await request(app)
        .post('/api/v1/network/demo-request-check')
        .send({
          hospitalName: 'Test Hospital',
          bloodGroup: 'O-',
          component: 'PRBC',
          unitsNeeded: 4,
          urgency: 'CRITICAL',
          city: 'Mumbai',
        })
        .expect(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.previewRequestId).toBeDefined();
    });

    it('rejects invalid blood group', async () => {
      await request(app)
        .post('/api/v1/network/demo-request-check')
        .send({
          hospitalName: 'Test Hospital',
          bloodGroup: 'Z+',
          component: 'PRBC',
          unitsNeeded: 4,
          urgency: 'CRITICAL',
          city: 'Mumbai',
        })
        .expect(400);
    });

    it('rejects units over maximum', async () => {
      await request(app)
        .post('/api/v1/network/demo-request-check')
        .send({
          hospitalName: 'Test Hospital',
          bloodGroup: 'O-',
          component: 'PRBC',
          unitsNeeded: 100,
          urgency: 'CRITICAL',
          city: 'Mumbai',
        })
        .expect(400);
    });
  });

  describe('Organization Onboarding', () => {
    it('POST /api/v1/onboarding/organizations creates hospital onboarding', async () => {
      const response = await request(app)
        .post('/api/v1/onboarding/organizations')
        .send({
          fullName: 'Dr. Test',
          organizationName: 'Test Hospital',
          contactEmail: 'test@hospital.com',
          contactPhone: '+91-9876543210',
          organizationType: 'HOSPITAL',
          licenseNumber: 'LIC-123',
          city: 'Mumbai',
          state: 'Maharashtra',
          bedCapacity: 200,
        })
        .expect(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.organizationId).toBeDefined();
      expect(response.body.data.verificationId).toBeDefined();
      expect(response.body.data.status).toBe('PENDING');
    });

    it('POST /api/v1/onboarding/organizations creates blood bank onboarding', async () => {
      const response = await request(app)
        .post('/api/v1/onboarding/organizations')
        .send({
          fullName: 'Dr. Test',
          organizationName: 'Test Blood Bank',
          contactEmail: 'test@bloodbank.com',
          contactPhone: '+91-9876543210',
          organizationType: 'BLOOD_BANK',
          licenseNumber: 'LIC-456',
          city: 'Mumbai',
          state: 'Maharashtra',
          storageCapacityUnits: 500,
        })
        .expect(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.organizationId).toBeDefined();
    });

    it('rejects duplicate license number', async () => {
      const payload = {
        fullName: 'Dr. Test',
        organizationName: 'Test Hospital',
        contactEmail: 'test@hospital.com',
        contactPhone: '+91-9876543210',
        organizationType: 'HOSPITAL' as const,
        licenseNumber: 'LIC-DUPLICATE',
        city: 'Mumbai',
        state: 'Maharashtra',
        bedCapacity: 200,
      };
      await request(app).post('/api/v1/onboarding/organizations').send(payload).expect(201);
      await request(app).post('/api/v1/onboarding/organizations').send(payload).expect(409);
    });

    it('rejects hospital without bed capacity', async () => {
      await request(app)
        .post('/api/v1/onboarding/organizations')
        .send({
          fullName: 'Dr. Test',
          organizationName: 'Test Hospital',
          contactEmail: 'test@hospital.com',
          contactPhone: '+91-9876543210',
          organizationType: 'HOSPITAL',
          licenseNumber: 'LIC-789',
          city: 'Mumbai',
          state: 'Maharashtra',
        })
        .expect(400);
    });

    it('rejects blood bank without storage capacity', async () => {
      await request(app)
        .post('/api/v1/onboarding/organizations')
        .send({
          fullName: 'Dr. Test',
          organizationName: 'Test Blood Bank',
          contactEmail: 'test@bloodbank.com',
          contactPhone: '+91-9876543210',
          organizationType: 'BLOOD_BANK',
          licenseNumber: 'LIC-789',
          city: 'Mumbai',
          state: 'Maharashtra',
        })
        .expect(400);
    });
  });

  describe('RBAC Protected Endpoints', () => {
    const publicHeaders = {
      'X-Demo-Role': 'PUBLIC',
      'X-Demo-User': 'Public User',
      'X-Demo-Institution': 'Public Portal',
    };

    const bloodBankHeaders = {
      'X-Demo-Role': 'BLOOD_BANK_OFFICER',
      'X-Demo-User': 'Rajesh Kulkarni (Demo)',
      'X-Demo-Institution': 'KEM Regional Blood Center (Demo)',
    };

    const adminHeaders = {
      'X-Demo-Role': 'ADMIN',
      'X-Demo-User': 'Vikram Nair (Demo)',
      'X-Demo-Institution': 'State Health Coordination Cell (Demo)',
    };

    describe('Network Predictions', () => {
      it('allows HOSPITAL_COORDINATOR', async () => {
        await request(app)
          .get('/api/v1/network/predictions')
          .set(demoHeaders)
          .expect(200);
      });

      it('allows BLOOD_BANK_OFFICER', async () => {
        await request(app)
          .get('/api/v1/network/predictions')
          .set(bloodBankHeaders)
          .expect(200);
      });

      it('allows ADMIN', async () => {
        await request(app)
          .get('/api/v1/network/predictions')
          .set(adminHeaders)
          .expect(200);
      });

      it('denies PUBLIC', async () => {
        await request(app)
          .get('/api/v1/network/predictions')
          .set(publicHeaders)
          .expect(403);
      });
    });

    describe('Hospital Requests', () => {
      it('allows HOSPITAL_COORDINATOR to list requests', async () => {
        await request(app)
          .get('/api/v1/requests')
          .set(demoHeaders)
          .expect(200);
      });

      it('allows ADMIN to list requests', async () => {
        await request(app)
          .get('/api/v1/requests')
          .set(adminHeaders)
          .expect(200);
      });

      it('denies BLOOD_BANK_OFFICER from listing requests', async () => {
        await request(app)
          .get('/api/v1/requests')
          .set(bloodBankHeaders)
          .expect(403);
      });

      it('allows HOSPITAL_COORDINATOR to create request', async () => {
        const response = await request(app)
          .post('/api/v1/requests')
          .set(demoHeaders)
          .send({
            hospitalName: 'Test Hospital',
            bloodGroup: 'O-',
            component: 'PRBC',
            unitsNeeded: 4,
            urgency: 'CRITICAL',
            city: 'Mumbai',
          })
          .expect(201);
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.status).toBeDefined();
      });
    });

    describe('Blood Bank Inventory', () => {
      it('allows BLOOD_BANK_OFFICER to list inventory batches', async () => {
        await request(app)
          .get('/api/v1/inventory/batches')
          .set(bloodBankHeaders)
          .expect(200);
      });

      it('allows BLOOD_BANK_OFFICER to update stock', async () => {
        await request(app)
          .post('/api/v1/inventory/update')
          .set(bloodBankHeaders)
          .send({
            batchCode: 'TEST-BATCH-001',
            bloodGroup: 'O+',
            component: 'PRBC',
            movementType: 'ADD_UNITS',
            unitsDelta: 10,
            storageUnit: 'Cold Vault A-01',
            expiryDate: '2026-12-31',
          })
          .expect(201);
      });

      it('denies HOSPITAL_COORDINATOR from updating stock', async () => {
        await request(app)
          .post('/api/v1/inventory/update')
          .set(demoHeaders)
          .send({
            batchCode: 'TEST-BATCH-001',
            bloodGroup: 'O+',
            component: 'PRBC',
            movementType: 'ADD_UNITS',
            unitsDelta: 10,
            storageUnit: 'Cold Vault A-01',
            expiryDate: '2026-12-31',
          })
          .expect(403);
      });
    });

    describe('Admin Endpoints', () => {
      it('allows ADMIN to list directory', async () => {
        await request(app)
          .get('/api/v1/admin/directory')
          .set(adminHeaders)
          .expect(200);
      });

      it('denies HOSPITAL_COORDINATOR from admin directory', async () => {
        await request(app)
          .get('/api/v1/admin/directory')
          .set(demoHeaders)
          .expect(403);
      });

      it('allows ADMIN to list connections', async () => {
        await request(app)
          .get('/api/v1/admin/connections')
          .set(adminHeaders)
          .expect(200);
      });

      it('allows ADMIN to list audit logs', async () => {
        await request(app)
          .get('/api/v1/audit-logs')
          .set(adminHeaders)
          .expect(200);
      });

      it('allows BLOOD_BANK_OFFICER to list audit logs', async () => {
        await request(app)
          .get('/api/v1/audit-logs')
          .set(bloodBankHeaders)
          .expect(200);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('applies auth rate limiter to /api/auth endpoints', async () => {
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'password' });
      }
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'password' })
        .expect(429);
    });
  });

  describe('Error Handling', () => {
    it('returns 404 for unknown API routes', async () => {
      await request(app).get('/api/v1/unknown').expect(404);
    });

    it('returns 400 for invalid JSON', async () => {
      await request(app)
        .post('/api/v1/network/demo-request-check')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});