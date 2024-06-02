# Elysia OpenID Client

**English** | [日本語](README.ja.md)

[OpenID Connect](https://openid.net/) client (RP, Relying Party) plugin for [ElysiaJS](https://elysiajs.com/), wrapping [openid-client](https://github.com/panva/node-openid-client).

**Currently under early development. All specifications are subject to change without notice, including those involving breaking changes.**

## Overview

- All authentication/authorization information is stored on the server side.
    - The status is passed to routing using the [resolve](https://elysiajs.com/life-cycle/before-handle.html#resolve) hook.
- Use Cookie to identify users.
- Depends on [Bun](https://bun.sh/).
- Only TypeScript files included.
- [Only works as ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- Only `Authorization Code Flow` is supported.
- Links: [GitHub](https://github.com/macropygia/elysia-openid-client) / [npm](https://www.npmjs.com/package/elysia-openid-client) / [Documentation](https://macropygia.github.io/elysia-openid-client/)

## Documentation

Detailed information can be found in the [official documentation](https://macropygia.github.io/elysia-openid-client/).

- List of features and specifications: [Introduction](https://macropygia.github.io/elysia-openid-client/)
- Quick start guide: [Getting Started](https://macropygia.github.io/elysia-openid-client/getting-started/)

## Contributing

If you are using GitHub Copilot to generate suggested code, you must set the `Suggestions matching public code` option to `Block`. If you are using a similar service with a similar option, you must do the same.
