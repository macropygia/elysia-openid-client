---
title: Logger
# description:
---

ロガーを定義する。

```typescript
const rp = await OidcClient.factory({
  //...
  logger: OIDCClientLogger | null,
  //...
})
```

- [pino](https://getpino.io/)に最適化されている
    - 変換すれば任意のロガーを使用可能
- 省略すると `consoleLogger("info")` を使用する
- `null` に設定するとログを出力しない
- 参照: [OIDCClientLogger](/elysia-openid-client/ja/api/types/interfaces/oidcclientlogger/)

### ログレベルポリシー

- `silent`:
    - トークン等のセンシティブ情報のデバッグ用出力
    - 使用時は明示的に表示させる必要がある
- `trace`:
    - 関数やメソッドの呼び出し時に名称を表示
- `debug`:
    - デバッグ情報
- `info`:
    - (TBA)
- `warn`:
    - 予期しない呼び出し・不正な操作・攻撃などの可能性がある操作の情報
- `error`:
    - キャッチした例外などの情報
- `fatal`:
    - 現状では不使用

### pinoの使用

直接[pino](https://getpino.io/)を割り当てられる

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

[Console](https://bun.sh/docs/api/console)を使用するロガー。

```typescript
import { consoleLogger } from "elysia-openid-client/loggers/consoleLogger";
const minimumLogLevel = "debug"; // pinoと同様
const rp = await OidcClient.factory({
  //...
  logger: consoleLogger(minimumLogLevel),
  //...
})
```

### カスタムロガー

[OIDCClientLogger](/elysia-openid-client/ja/api/types/interfaces/oidcclientlogger/)の型定義と `consoleLogger` の実装を参照のこと。
