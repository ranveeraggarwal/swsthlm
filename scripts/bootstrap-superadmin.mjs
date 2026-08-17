// Grants the `superadmin` custom claim to a Firebase Auth user (issue: member
// plane Phase 1, docs/architecture/BACKEND.md "Roles" and "Security model").
//
// Per BACKEND.md, this script is the ONLY way superadmin is ever granted:
// "root" is a property of possessing the service-account key, not of a
// button anyone can click through an authenticated endpoint. There is no
// route handler and never will be one for this operation.
//
// Usage:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json \
//     node scripts/bootstrap-superadmin.mjs someone@example.com
//
//   # or, with the key inlined (e.g. a CI/local secret store that hands you
//   # the JSON directly rather than a file path):
//   FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' \
//     node scripts/bootstrap-superadmin.mjs someone@example.com
//
// Requires exactly one of those two env vars — this script never runs
// without the service-account key, and it is never invoked from a request
// handler. It:
//   1. Looks up the Firebase Auth user by email (fails loudly if none exists
//      — it never creates one; superadmin is granted to an existing member).
//   2. Sets the `superadmin: true` custom claim, preserving any other custom
//      claims already on the account.
//   3. Writes an append-only audit doc to the `role_grants` collection
//      recording who was granted the role, by what mechanism, and when —
//      the same collection the security rules make unwritable from any
//      client (docs/architecture/BACKEND.md "Collections").
//
// The claim only takes effect on the user's next ID token refresh (sign out
// / sign in, or up to ~1 hour) — this script does not force that.

import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function fail(message) {
  console.error(`\nbootstrap-superadmin: ${message}\n`);
  process.exit(1);
}

function loadServiceAccount() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!keyPath && !keyJson) {
    fail(
      'no service-account credentials found. Set GOOGLE_APPLICATION_CREDENTIALS ' +
        '(path to a service-account JSON file) or FIREBASE_SERVICE_ACCOUNT_KEY ' +
        '(the JSON itself) and try again. This script deliberately refuses to run ' +
        'without one — superadmin is only ever granted by whoever holds the key.',
    );
  }

  const raw = keyPath
    ? (() => {
        try {
          return readFileSync(keyPath, 'utf-8');
        } catch (err) {
          fail(`could not read GOOGLE_APPLICATION_CREDENTIALS at "${keyPath}": ${err.message}`);
        }
      })()
    : keyJson;

  try {
    return JSON.parse(raw);
  } catch (err) {
    const source = keyPath ? `the file at GOOGLE_APPLICATION_CREDENTIALS` : 'FIREBASE_SERVICE_ACCOUNT_KEY';
    fail(`${source} is not valid JSON: ${err.message}`);
  }
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    fail('missing email.\n\nUsage: node scripts/bootstrap-superadmin.mjs <email>');
  }

  const serviceAccount = loadServiceAccount();

  initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth();
  const db = getFirestore();

  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch (err) {
    fail(
      `no Firebase Auth user found for "${email}" (${err.code ?? err.message}). ` +
        'The person must sign in at least once before superadmin can be granted — ' +
        'this script never creates accounts.',
    );
  }

  const nextClaims = { ...(user.customClaims ?? {}), superadmin: true };
  await auth.setCustomUserClaims(user.uid, nextClaims);

  await db.collection('role_grants').add({
    granted_uid: user.uid,
    granted_email: email,
    role: 'superadmin',
    granted_by: 'bootstrap-superadmin.mjs (service-account key)',
    mechanism: 'bootstrap-script',
    created_at: FieldValue.serverTimestamp(),
  });

  console.log(
    `Granted superadmin to ${email} (uid: ${user.uid}) and logged the grant in role_grants.\n` +
      'The claim takes effect on their next sign-in or ID token refresh (up to ~1 hour).',
  );
}

main().catch((err) => {
  fail(err.stack ?? err.message ?? String(err));
});
