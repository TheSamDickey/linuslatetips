See https://dev.twitch.tv/docs/eventsub for details on setting up webhooks

Use

```ts
`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
```

to get token to use in Authorization header.

Use

```ts
`https://api.twitch.tv/helix/users?login=${username}`;
```

to get a users id.
