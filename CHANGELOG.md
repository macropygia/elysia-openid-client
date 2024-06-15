# elysia-openid-client

## 0.1.11

### Patch Changes

- 269abba: **[BREAKING CHANGE]** Add client methods for inside the auth hook
- 2ef6462: Bump dependencies
- 9ba432b: Add feature to disable endpoints
- 5010f8d: **[BREAKING CHANGE]** Remove `scope` option and fix scope to `scoped`
- 9ba432b: **[BREAKING CHANGE]** Fix multiple issuer support

## 0.1.10

### Patch Changes

- 775f1fd: Add auto refresh to `userinfo`, `introspect`, `resource`, `status` and `claims` endpoints
- 775f1fd: **[BREAKING CHANGE]** Changed `getEndpoints()` and `getAuthHook()` to getter methods `endpoints` and `authHook`
- 775f1fd: **[BREAKING CHANGE]** Move hook settings to client options

## 0.1.9

### Patch Changes

- 05731b2: Add defineConfig
- 05731b2: **[BREAKING CHANGE]** Change factory method name from `create` to `factory`
- 6797fa2: Update docs
