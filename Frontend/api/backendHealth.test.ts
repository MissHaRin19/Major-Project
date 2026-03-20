import { afterEach, describe, expect, it, vi } from "vitest";

import { checkBackendHealth } from "./backendHealth";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("checkBackendHealth", () => {
  it("returns true when backend reports model_loaded", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        text: async () => JSON.stringify({ model_loaded: true })
      })
    );

    await expect(checkBackendHealth()).resolves.toBe(true);
  });

  it("returns false when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network failure"))
    );

    await expect(checkBackendHealth()).resolves.toBe(false);
  });
});
