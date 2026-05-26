---
name: api-integration
description: Enforces the API layer architecture for diegofrayo's TypeScript/Next.js projects. Use this skill whenever creating, editing, or reviewing files inside the `src/api/` folder, adding a new API endpoint function, creating a route module, or wiring up a new data source call. Triggers on requests like "add an API call for X", "create a new endpoint for X", "fetch data from X", "add a new route to the api folder", "create the api module for X", or any task that involves defining how the frontend communicates with a backend or external data source. Apply these guidelines proactively — don't wait to be asked.
---

# API Layer Guidelines

The `src/api/` folder is the single source of truth for all remote data access. Every call to a backend, external service, or data source must go through here — never fetch data directly from components, pages, or hooks without going through this layer.

The goals are: one place to find every endpoint, consistent type safety from raw response to UI, and zero duplication of fetch logic or data transforms.

## Folder Structure

```
src/api/
  routes/
    {entity}/               ← one folder per domain entity (users, products, auth, etc.)
      endpoints/
        {action-name}.ts    ← one file per endpoint
      types.ts              ← types shared within this entity module only
      index.ts              ← barrel: re-exports all endpoint functions + types
  index.ts                  ← root barrel: composes entity routers into a single `api` object
  config.ts                 ← shared HTTP client setup (axios instance, base URL, headers, etc.)
  types.ts                  ← types shared across all entity modules
```

Entity names are **plural nouns** in kebab-case: `users`, `products`, `auth`, `deck-cards`.
Action names describe what the call does, also in kebab-case: `get-user-info`, `create-product`, `update-deck-card`.

## Endpoint File (`endpoints/{action-name}.ts`)

Each endpoint file owns exactly one API call. It defines the function, its raw and transformed types, and the transform logic — all in one place so the full data contract is readable at a glance.

```ts
// src/api/routes/users/endpoints/get-user-info.ts

async function getUserInfo(userId: string): Promise<GetUserInfoResponse> {
	const rawResponse = await fetchData<RawGetUserInfoResponse>(`/users/${userId}`);

	return transformResponse(rawResponse);
}

export default getUserInfo;

// --- TYPES ---

// Shape of the data as it arrives from the server (before any transformation)
export type RawGetUserInfoResponse = {
	user_id: string;
	full_name: string;
	created_at: string; // ISO string from the server
};

// Shape of the data after transformation — what the rest of the app uses
export type GetUserInfoResponse = {
	id: string;
	name: string;
	createdAt: Date;
};

// --- TRANSFORMS ---

function transformResponse(raw: RawGetUserInfoResponse): GetUserInfoResponse {
	return {
		id: raw.user_id,
		name: raw.full_name,
		createdAt: new Date(raw.created_at),
	};
}
```

**Rules for endpoint files:**

- The main function is the default export. It is `async` and always returns a typed `Promise<T>`.
- Always define `Raw{ActionName}Response` for what comes from the server, even if it currently looks the same as the final type. This makes future changes safe — you only update the transform, not call sites.
- `transform{Resource}` converts `Raw*` → final type. Keep it pure (no side effects, no async).
- The `// --- TYPES ---` and `// --- TRANSFORMS ---` section comments are required when those sections have content. Skip a section entirely if empty (e.g., a mutation with no response body).
- If the endpoint requires a request body or query params, define and export a `{ActionName}Params` type too.

## Entity Index (`routes/{entity}/index.ts`)

The entity index groups all endpoint functions under a named router object and re-exports every type so consumers can import from one place.

```ts
// src/api/routes/users/index.ts

import getUserInfo from "./endpoints/get-user-info";
import updateUserProfile from "./endpoints/update-user-profile";

const usersRouter = {
	getUserInfo,
	updateUserProfile,
};

export default usersRouter;

// --- RE-EXPORTS ---

export * from "./endpoints/get-user-info";
export * from "./endpoints/update-user-profile";
```

The router object is named `{entity}Router` (camelCase). Every endpoint added to the `endpoints/` folder must be imported here and added to the router object, and its exports re-exported.

## Root Index (`api/index.ts`)

Composes all entity routers into a single `api` object. This is the only export consumers should import directly.

```ts
// src/api/index.ts

import productsRouter from "./routes/products";
import usersRouter from "./routes/users";

const api = {
	users: usersRouter,
	products: productsRouter,
};

export default api;

// --- RE-EXPORTS ---

export * from "./routes/users";
export * from "./routes/products";
```

Consumers use `api.users.getUserInfo(...)` — the nested structure makes it clear which domain an endpoint belongs to.

## Shared Types (`types.ts`)

- `src/api/types.ts` — types used by more than one entity module (e.g., `PaginatedResponse<T>`, `ApiError`, common enums).
- `src/api/routes/{entity}/types.ts` — types used by more than one endpoint within that entity, but not needed outside it.

Don't put types that belong to a single endpoint file in either of these — keep them in the endpoint file itself.

## Config (`config.ts`)

Defines the shared HTTP client. Typically an axios instance with base URL, default headers, auth token injection, and error interceptors. All endpoint files import from here instead of calling `fetch` or `axios` directly.

```ts
// src/api/config.ts

import axios from "axios";

const httpClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export default httpClient;
```

## How to Add a New Endpoint

1. Create `src/api/routes/{entity}/endpoints/{action-name}.ts` following the endpoint file template.
2. Add the function to the entity router in `src/api/routes/{entity}/index.ts` and re-export its types.
3. If the entity is new, create its folder and `index.ts`, then import the entity router in `src/api/index.ts`.

That's it — the endpoint is now available everywhere as `api.{entity}.{actionName}(...)`.
