---
title: Logger
# description:
---

Defines logger.

```typescript
const rp = await OidcClient.factory({
  //...
  logger: OIDCClientLogger | null,
  //...
})
```

- Optimized for [pino](https://getpino.io/).
    - Other loggers can be used if converted.
- If omitted, use `consoleLogger("info")`.
- If set to `null`, disable logging.
- Ref: [OIDCClientLogger](/elysia-openid-client/api/types/interfaces/oidcclientlogger/)

### Log level policy

- `silent`:
    - Used to output tokens and other sensitive data. Only display explicitly if needed.
- `trace`:
    - Functions and methods executed.
- `debug`:
    - Debug info.
- `info`:
    - (TBA)
- `warn`:
    - Outputs for unexpected calls, tampering, and possible attacks.
- `error`:
    - Caught exceptions, etc.
- `fatal`:
    - Currently unused.

### Using pino

Assign [pino](https://getpino.io/) directly.

```bash
bun add pino
```

```typescript
import pino from "pino";
const rp = await OidcClient.factory({
  //...
  logger: pino(),
  //...
})
```

### Console logger

Using [Console](https://bun.sh/docs/api/console).

```typescript
import { consoleLogger } from "elysia-openid-client/loggers/consoleLogger";
const minimumLogLevel = "debug"; // same as pino
const rp = await OidcClient.factory({
  //...
  logger: consoleLogger(minimumLogLevel),
  //...
})
```

### Custom logger

See [OIDCClientLogger](/elysia-openid-client/api/types/interfaces/oidcclientlogger/) and `consoleLogger` implementation.
