# Elysia OpenID Client

[English](README.md) | **日本語**

[ElysiaJS](https://elysiajs.com/)用[OpenID Connect](https://openid.net/)クライアントプラグイン（[openid-client](https://github.com/panva/node-openid-client)ラッパー）

**開発初期段階につき全ての仕様は破壊的変更の有無に関わらず予告なく変更される可能性あり**

## Overview

- 全ての認証・認可の情報はサーバーサイドで保持される
    - 認証・認可の情報は[resolve](https://elysiajs.com/life-cycle/before-handle.html#resolve)フックを使用してルーティングに受け渡す
- ユーザーの識別にはCookieを使用する
- [Bun](https://bun.sh/)専用
- TypeScriptのみ同梱
- [ESM専用](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- `Authorization Code Flow` （認証コードフロー）専用
- Links: [GitHub](https://github.com/macropygia/elysia-openid-client) / [npm](https://www.npmjs.com/package/elysia-openid-client) / [Documentation](https://macropygia.github.io/elysia-openid-client/)

## Documentation

詳しい情報は[公式ドキュメント](https://macropygia.github.io/elysia-openid-client/ja/getting-started/)を参照

- 仕様・機能・特徴: [Introduction](https://macropygia.github.io/elysia-openid-client/ja/getting-started/)
- クイックスタートガイド: [Getting Started](https://macropygia.github.io/elysia-openid-client/ja/getting-started/)

## Contributing

本リポジトリに提供するコードを `GitHub Copilot` で生成する場合、必ず `Suggestions matching public code` オプションを `Block` に設定すること。同様のオプションが存在する類似のサービスを使用する場合も同様。
