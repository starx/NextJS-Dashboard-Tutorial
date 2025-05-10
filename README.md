## Next.js App Router Course - Starter

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Project structure

**App**

The `app/`

See this as the presentation layer of your app, rather than what `app/` or `src/` represents in other frameworks. It defines routes, layouts, templates, metadata, loading states, error boundaries, and server actions.

**Actions**

Abstraction layer for the ui to use the services, form actions, links etc

```txt
/app
  /invoices
    actions.ts        ← local to the invoices feature
  /users
    actions.ts
```

**lib**

`db/`: raw queries or ORM
`services/`: business computation or derived logic
`types/`: TypeScript or Zod types

## Dev server

Run pnpm i to install the project's packages.

    pnpm i

Followed by pnpm dev to start the development server.


    pnpm dev

pnpm dev starts your Next.js development server on port 3000

## Password

em: user@nextmail.com
pw: 123456

## Common issues

Next.js is out of date.

    pnpm add next@latest
