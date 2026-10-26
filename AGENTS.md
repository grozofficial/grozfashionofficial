<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The GROZ storefront lives in src/groz (imported app, client-only, hash navigation) and is mounted from src/routes/index.tsx; src/groz/localApi.ts stands in for the old /api server until a real backend is connected.
- GROZ data lives in Lovable Cloud; src/groz/localApi.ts maps the storefront's original /api/* calls onto the database (RLS enforces owner-only admin access via user_roles), so pages stay unchanged.
- Products table stores owner edits/additions over the built-in catalog (soft-delete flag), because the built-in items aren't seeded into the database.
