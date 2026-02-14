import { describe, it, expect } from "vitest";
import { checkOperationLimits } from "../usage/usage.service.js";
import { ApiError } from "../lib/utils/apiError.js";
import { MAX_BATCH_SIZE, MAX_IMAGES_PER_REQUEST } from "../usage/limits.config.js";

describe("checkOperationLimits", () => {
  it("within limits → passes", () => {
    expect(() => {
      checkOperationLimits({
        imagesRequested: MAX_IMAGES_PER_REQUEST - 1,
        batchSize: MAX_BATCH_SIZE - 1,
      });
    }).not.toThrow();
  });

  it("exceeding image limit → throws 400", () => {
    expect(() => {
      checkOperationLimits({
        imagesRequested: MAX_IMAGES_PER_REQUEST + 1,
        batchSize: 1,
      });
    }).toThrow(ApiError);

    try {
      checkOperationLimits({
        imagesRequested: MAX_IMAGES_PER_REQUEST + 1,
        batchSize: 1,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(400);
      expect((err as ApiError).code).toBe("OPERATION_LIMIT_EXCEEDED");
    }
  });

  it("exceeding batch limit → throws 400", () => {
    expect(() => {
      checkOperationLimits({
        imagesRequested: 1,
        batchSize: MAX_BATCH_SIZE + 1,
      });
    }).toThrow(ApiError);

    try {
      checkOperationLimits({
        imagesRequested: 1,
        batchSize: MAX_BATCH_SIZE + 1,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(400);
      expect((err as ApiError).code).toBe("OPERATION_LIMIT_EXCEEDED");
    }
  });

  it("edge case exactly equal to limit → passes", () => {
    expect(() => {
      checkOperationLimits({
        imagesRequested: MAX_IMAGES_PER_REQUEST,
        batchSize: MAX_BATCH_SIZE,
      });
    }).not.toThrow();
  });
});
