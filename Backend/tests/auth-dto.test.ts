import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ValidationError } from "../src/error/AppError";
import { loginRequestDto } from "../src/dtos/auth/login.dto";
import { registerRequestDto } from "../src/dtos/auth/register.dto";

describe("auth DTO validation", () => {
  it("accepts a valid login request", () => {
    assert.deepEqual(
      loginRequestDto({
        emailOrUsername: "user@example.com",
        password: "secret1",
      }),
      {
        emailOrUsername: "user@example.com",
        password: "secret1",
      },
    );
  });

  it("rejects a short login password", () => {
    assert.throws(
      () => loginRequestDto({ emailOrUsername: "user@example.com", password: "123" }),
      ValidationError,
    );
  });

  it("accepts a valid register request", () => {
    assert.deepEqual(
      registerRequestDto({
        email: "user@example.com",
        username: "beacons_user",
        password: "secret1",
        phone: "0912345678",
      }),
      {
        email: "user@example.com",
        username: "beacons_user",
        password: "secret1",
        phone: "0912345678",
      },
    );
  });
});
