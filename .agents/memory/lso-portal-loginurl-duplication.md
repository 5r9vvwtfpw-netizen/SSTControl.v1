---
name: LSO portal loginUrl duplicated across email flows
description: Two independent code paths build the login link sent to an LSO in their credentials email; they can drift and point to the wrong page.
---

There is no single shared helper that builds the "login/portal" URL put into the LSO
credentials email. At least two separate call sites each construct their own
`loginUrl` string (`${baseUrl}/...`) and pass it into `sendLsoPortalAccessEmail`:
one in the external-LSO auto-create flow inside `server/routes.ts` (matching an
`externalLsoName`/license number and creating the user on the fly), and one in
`server/routes/lso-directory-jwt.ts` (the LSO directory sync flow).

One of them pointed to `/auth` (generic login) while the other correctly pointed
to `/portal-licenciado` (the LSO's actual portal). Functionally both eventually land
the LSO on `/portal-licenciado` after login (client-side role redirects in
`client/src/lib/protected-route.tsx` bounce `lso`/`lso_externo` there), but the
emailed link itself was inconsistent and confusing for non-technical users who
followed it literally.

**Why:** whoever added the second LSO-provisioning flow didn't know the first one
existed, so they each hardcoded the destination path independently instead of
sharing one constant/helper.

**How to apply:** when touching any code that emails an LSO their credentials or
portal link, grep for all `sendLsoPortalAccessEmail(` call sites (not just the one
you're editing) and make sure the `loginUrl` is consistent — ideally extract a
single `buildLsoPortalUrl(baseUrl)` helper instead of inlining the path at each
call site.
