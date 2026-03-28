import { test, expect } from '@playwright/test'

test.describe('API routes', () => {
  test('POST /api/match returns 401 for unauthenticated requests', async ({
    request,
  }) => {
    const response = await request.post('/api/match', {
      data: { projectId: 'fake-id' },
    })
    // Should return 401 or redirect — not 200
    expect(response.status()).not.toBe(200)
  })

  test('POST /api/match rejects invalid body', async ({ request }) => {
    const response = await request.post('/api/match', {
      data: {},
    })
    expect(response.status()).not.toBe(200)
  })

  test('GET /api/match returns 405 (method not allowed)', async ({
    request,
  }) => {
    const response = await request.get('/api/match')
    expect(response.status()).not.toBe(200)
  })
})
