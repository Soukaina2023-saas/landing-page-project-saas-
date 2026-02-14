import { describe, it, expect, vi, beforeEach } from 'vitest';
import handler from '../api/generate-batch.js';
import { requestWithRetry } from '../lib/utils/requestWithRetry.js';

vi.mock('../lib/utils/requestWithRetry', () => ({
  requestWithRetry: vi.fn(),
}));

function createMockReq(body: object) {
  return {
    method: 'POST',
    body,
    headers: {},
    url: '/api/generate-batch',
    socket: { remoteAddress: '127.0.0.1' },
  };
}

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe('POST /api/generate-batch', () => {
  beforeEach(() => {
    vi.mocked(requestWithRetry).mockResolvedValue(undefined);
  });

  describe('A) Valid body', () => {
    it('should return status 200', async () => {
      const req = createMockReq({ prompts: [{ prompt_text: 'Test image' }] });
      const res = createMockRes();
      await handler(req as any, res as any);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, results: expect.any(Array) })
      );
    });
  });

  describe('B) Invalid body', () => {
    it('should return status 400', async () => {
      const req = createMockReq({ prompts: [] });
      const res = createMockRes();
      await handler(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
        })
      );
    });
  });

  describe('C) When requestWithRetry throws', () => {
    it('should return 500 with code RETRY_FAILED', async () => {
      vi.mocked(requestWithRetry).mockRejectedValueOnce({
        code: 'RETRY_FAILED',
        message: 'External service failed after retries',
      });
      const req = createMockReq({ prompts: [{ prompt_text: 'Test image' }] });
      const res = createMockRes();
      await handler(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'RETRY_FAILED' }),
        })
      );
    });
  });
});
