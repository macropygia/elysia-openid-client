---
title: Data Adapter
# description:
---

Defines how session data is stored.

```typescript
const rp = await OidcClient.factory({
  //...
  dataAdapter: OIDCClientDataAdapter,
  //...
})
```

- The package includes data adapters using SQLite/LokiJS/Lowdb/Redis.
- You can make your own adapters.
- SQLite with in-memory option is used by default.
- When using multiple OP, share a single data adapter.
- Ref: [OIDCClientDataAdapter](/elysia-openid-client/api/types/interfaces/oidcclientdataadapter/)

### SQLite

Use [Bun built-in SQLite driver](https://bun.sh/docs/api/sqlite).

```typescript
import { SQLiteAdapter } from 'elysia-openid-client/dataAdapters/SQLiteAdapter';

// In-memory
const memoryAdapter = new SQLiteAdapter();
// Same as `new SQLiteAdapter({ filename: ":memory:" })`

// Persistence to file
const fileAdapter = new SQLiteAdapter({
  filename: "path/to/sessions.sqlite"
});

```

### LokiJS

Use [LokiJS](https://techfort.github.io/LokiJS/).

```bash
bun add lokijs
bun add -D @types/lokijs
```

```typescript
// In-memory
import { LokiInMemoryAdapter } from 'elysia-openid-client/dataAdapters/LokiInMemoryAdapter';
const memoryAdapter = new LokiInMemoryAdapter();

// Persistence to file
import { LokiFileAdapter } from 'elysia-openid-client/dataAdapters/LokiFileAdapter';
const fileAdapter = await LokiFileAdapter.factory({
  filename: "path/to/sessions.db"
});
```

### Lowdb

Use [Lowdb](https://github.com/typicode/lowdb).

```bash
bun add lowdb
```

```typescript
import { LowdbAdapter } from 'elysia-openid-client/dataAdapters/LowdbAdapter';

// In-memory
const memoryAdapter = await LowdbAdapter.factory();

// Persistence to file
const fileAdapter = await LowdbAdapter.factory({
  filename: "sessions.json",
})
```

### Redis

Use [Redis](https://redis.io/) with [ioredis](https://github.com/redis/ioredis).

```bash
bun add ioredis
```

```typescript
import { RedisAdapter } from 'elysia-openid-client/dataAdapters/RedisAdapter';
const redisAdapter = new RedisAdapter({
  port: 6379,
  host: "localhost",
});
```

### Creating your own adapters

```typescript
// MyDataAdapter.ts
import type { OIDCClientDataAdapter } from 'elysia-openid-client';
export class MyDataAdapter implements OIDCClientDataAdapter {
  // ...
}

// app.ts
import { MyDataAdapter } from 'path/to/MyDataAdapter';
const rp = await OidcClient.factory({
  //...
  dataAdapter: new MyDataAdapter(),
  //...
})
```
