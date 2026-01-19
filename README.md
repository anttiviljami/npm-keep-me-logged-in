# 🔐 npm-keep-me-logged-in

CLI command that keeps you logged in to npm registry so you don't have to run `npm login` every day.

```
npx npm-keep-me-logged-in
```

After npm deprecated classic tokens, the default behavior for `npm login` is to generate a legacy token that only lasts a day.

This is extra annoying for users who rely on private scoped packages, who now need to log in daily.

This CLI command generates a 90-day read-write Access Token, so you dont' have to keep logging in every day.
