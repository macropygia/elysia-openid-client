---
title: Data Adapter
# description:
---

セッション情報の保存方法を定義したもの。

```typescript
const rp = await OidcClient.factory({
  //...
  dataAdapter: OIDCClientDataAdapter,
  //...
})
```

- 本パッケージにはSQLite/LokiJS/Lowdb/Redisを使用したデータアダプターが含まれる
- カスタムデータアダプターを作成可能
- 既定ではSQLiteのインメモリーモードが使用される
- 複数のOPを使用する場合は一つのデータアダプターを共有する
- 参照: [OIDCClientDataAdapter](/elysia-openid-client/ja/api/types/interfaces/oidcclientdataadapter/)

### SQLite

[Bun内蔵のSQLiteドライバー](https://bun.sh/docs/api/sqlite)を使用する。

```typescript
import { SQLiteAdapter } from 'elysia-openid-client/dataAdapters/SQLiteAdapter';

// インメモリーモード
const memoryAdapter = new SQLiteAdapter();
// new SQLiteAdapter({ filename: ":memory:" }) と同義

// 永続化モード
const fileAdapter = new SQLiteAdapter({
  filename: "path/to/sessions.sqlite"
});

```

### LokiJS

[LokiJS](https://www.npmjs.com/package/lokijs)を使用する。

```bash
bun add lokijs
bun add -D @types/lokijs
```

```typescript
// インメモリーモード
import { LokiInMemoryAdapter } from 'elysia-openid-client/dataAdapters/LokiInMemoryAdapter';
const memoryAdapter = new LokiInMemoryAdapter();

// 永続化モード
import { LokiFileAdapter } from 'elysia-openid-client/dataAdapters/LokiFileAdapter';
const fileAdapter = await LokiFileAdapter.factory({
  filename: "path/to/sessions.db"
});
```

### Lowdb

[Lowdb](https://github.com/typicode/lowdb)を使用する。

```bash
bun add lowdb
```

```typescript
import { LowdbAdapter } from 'elysia-openid-client/dataAdapters/LowdbAdapter';

// インメモリーモード
const memoryAdapter = await LowdbAdapter.factory();

// 永続化モード
const fileAdapter = await LowdbAdapter.factory({
  filename: "sessions.json",
})
```

### Redis

[Redis](https://redis.io/)を[ioredis](https://github.com/redis/ioredis)で使用する。

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

### カスタムデータアダプター

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
