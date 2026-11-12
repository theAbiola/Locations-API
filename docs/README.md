# API documentation

The interactive API reference is available at `/docs/` when the API is running.
The canonical OpenAPI document is available at `/docs/openapi.json`.
The API logs each incoming request to the server console as its HTTP method and
endpoint, including requests to documentation, health, and unknown routes.

## Local usage

1. Start the API with `npm run dev`.
2. Open `http://localhost:<API_PORT>/docs/`.
3. Register or log in using the authentication operations. The API stores the
   resulting `locations.sid` session cookie in the client.
4. Use the authenticated session for location reads. Creating, updating, and
   deleting locations requires an administrator account.

The OpenAPI document in `docs/openapi.json` is the source of truth for routes,
request bodies, responses, security, and examples. Update it whenever an API
route or response contract changes.

Location responses include an optional `imageURLs` array. It defaults to an
empty array and accepts a maximum of four HTTP or HTTPS image URLs.

Administrators update locations with `PATCH /api/locations/{id}`. Send one or
more mutable location fields; omitted fields remain unchanged. Empty patch
bodies and bodies without supported location fields are rejected.

When `imageURLs` is included in a PATCH request, the supplied URLs are appended
to the existing list. Existing or duplicate URLs are ignored. The location can
contain at most four URLs; an append that would exceed this limit is rejected.

## Running integration tests

Integration tests use an externally managed MongoDB instance rather than
downloading a platform-specific MongoDB binary. Start MongoDB locally and set
`TEST_MONGODB_URI` to a dedicated test database before running `npm test`:

```sh
export TEST_MONGODB_URI=mongodb://127.0.0.1:27017/locations-api-test
npm test
```

Never set `TEST_MONGODB_URI` to a production database. CI starts a pinned
MongoDB 7.0 service and supplies this variable automatically.
