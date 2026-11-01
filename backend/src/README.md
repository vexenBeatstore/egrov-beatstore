## Worker notes
Worker API entrypoint: `src/index.js`. Bind D1 as `DB`. Authentication uses opaque random session cookie; only SHA-256 digest is stored in D1. Password hashing is Argon2id via `argon2-browser`; validate WASM compatibility in your target Workers runtime and run load/security tests before production.

Telegram Login hash validation follows Telegram's HMAC-SHA256 scheme. Add rate limiting and CSRF/Origin validation at the edge before production. Cookie SameSite=Lax plus JSON API is baseline; configure a strict allowed Origin and reject cross-origin unsafe requests.
