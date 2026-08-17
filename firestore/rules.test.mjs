// Emulator tests for firestore.rules — the security core of the member
// plane's Phase 1 (docs/architecture/BACKEND.md, "Security model").
//
// Run via the Firestore emulator, e.g.:
//   npx firebase-tools emulators:exec --only firestore \
//     "npx vitest run firestore/rules.test.mjs"
// (or `npm run test:rules`, which wraps the same invocation).
//
// Scope note: BACKEND.md's acceptance list includes "admin cannot grant
// admin or superadmin." That guarantee is enforced by there being no code
// path that writes Firebase Auth custom claims from a client at all — the
// claims are only ever set by the bootstrap script and (later) a
// server-side grant endpoint using firebase-admin, which bypasses Firestore
// rules entirely. Firestore security rules have no way to observe or
// constrain custom-claim writes, so that half of the guarantee is not
// expressible as a rules test and isn't attempted here. What IS covered
// below: no client of any role can write a role into Firestore (`users`,
// `approvers`), and `role_grants` — the audit trail for claim changes — is
// unwritable by every client, admin included.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RULES_PATH = path.join(__dirname, '..', 'firestore.rules');

function emulatorHostPort() {
  const raw = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const [host, portStr] = raw.split(':');
  return { host, port: Number(portStr) };
}

/** @type {import('@firebase/rules-unit-testing').RulesTestEnvironment} */
let testEnv;

beforeAll(async () => {
  const { host, port } = emulatorHostPort();
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-stockholm-swing',
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host,
      port,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

// --- context helpers --------------------------------------------------

function memberCtx(uid) {
  return testEnv.authenticatedContext(uid);
}

function adminCtx(uid = 'admin-1') {
  return testEnv.authenticatedContext(uid, { admin: true });
}

function anonCtx() {
  return testEnv.unauthenticatedContext();
}

/** Seed data bypassing rules entirely (setup, not the thing under test). */
async function seed(fn) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await fn(context.firestore());
  });
}

const PENDING_SUBMISSION = {
  submitter_uid: 'member-1',
  status: 'pending',
  venue_id: 'chicago',
  name: 'Test Social',
  style: 'lindy-hop',
  date: '2026-09-01',
  start: '19:00',
  end: '23:00',
};

// =========================================================================
// users/{uid}
// =========================================================================

describe('users/{uid}', () => {
  it('ALLOWS the owner to create their own doc with display fields only', async () => {
    const db = memberCtx('member-1').firestore();
    await assertSucceeds(
      setDoc(doc(db, 'users/member-1'), { display_name: 'Alex' })
    );
  });

  it('ALLOWS the owner to update display_name and photo_url', async () => {
    await seed((db) => setDoc(doc(db, 'users/member-1'), { display_name: 'Alex' }));
    const db = memberCtx('member-1').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'users/member-1'), {
        display_name: 'Alexandra',
        photo_url: 'https://example.com/a.png',
      })
    );
  });

  it('ALLOWS anyone (even signed out) to read a profile', async () => {
    await seed((db) => setDoc(doc(db, 'users/member-1'), { display_name: 'Alex' }));
    const db = anonCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'users/member-1')));
  });

  it('DENIES a member widening their own doc with role: "admin"', async () => {
    await seed((db) => setDoc(doc(db, 'users/member-1'), { display_name: 'Alex' }));
    const db = memberCtx('member-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'users/member-1'), { role: 'admin' })
    );
  });

  it('DENIES a member widening their own doc with admin: true', async () => {
    await seed((db) => setDoc(doc(db, 'users/member-1'), { display_name: 'Alex' }));
    const db = memberCtx('member-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'users/member-1'), { admin: true })
    );
  });

  it('DENIES a member creating their doc with a non-display field mixed in', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'users/member-1'), { display_name: 'Alex', admin: true })
    );
  });

  it('DENIES a member writing another uid\'s users doc', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'users/someone-else'), { display_name: 'Eve' })
    );
  });
});

// =========================================================================
// approvers/{uid}
// =========================================================================

describe('approvers/{uid}', () => {
  it('DENIES a member creating an approvers doc for themselves', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'approvers/member-1'), { venue_ids: ['chicago'] })
    );
  });

  it('DENIES a member creating an approvers doc for someone else', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'approvers/someone-else'), { venue_ids: ['chicago'] })
    );
  });

  it('DENIES an approver updating their own approvers doc', async () => {
    await seed((db) => setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] }));
    const db = memberCtx('approver-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago', 'sprallen'] })
    );
  });

  it('DENIES an admin writing an approvers doc directly (server-side/admin SDK only)', async () => {
    const db = adminCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] })
    );
  });

  it('ALLOWS the approver to read their own doc', async () => {
    await seed((db) => setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] }));
    const db = memberCtx('approver-1').firestore();
    await assertSucceeds(getDoc(doc(db, 'approvers/approver-1')));
  });

  it('ALLOWS an admin to read any approvers doc', async () => {
    await seed((db) => setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] }));
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'approvers/approver-1')));
  });

  it('DENIES an unrelated member reading someone else\'s approvers doc', async () => {
    await seed((db) => setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] }));
    const db = memberCtx('member-1').firestore();
    await assertFails(getDoc(doc(db, 'approvers/approver-1')));
  });
});

// =========================================================================
// submissions/{id}
// =========================================================================

describe('submissions/{id}', () => {
  it('ALLOWS a member to create a pending submission self-attributed to them', async () => {
    const db = memberCtx('member-1').firestore();
    await assertSucceeds(
      setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION)
    );
  });

  it('DENIES a member creating a submission attributed to someone else', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'submissions/sub-1'), {
        ...PENDING_SUBMISSION,
        submitter_uid: 'someone-else',
      })
    );
  });

  it('DENIES a member creating a submission that is not pending', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'submissions/sub-1'), {
        ...PENDING_SUBMISSION,
        status: 'approved',
      })
    );
  });

  it('ALLOWS the submitter to edit their own pending submission\'s non-status fields', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = memberCtx('member-1').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'submissions/sub-1'), { description: 'Updated blurb' })
    );
  });

  it('DENIES a member writing `status` on their own pending submission', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = memberCtx('member-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('DENIES a member writing `status` alongside a legitimate field edit', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = memberCtx('member-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), {
        description: 'Sneaky edit',
        status: 'approved',
      })
    );
  });

  it('DENIES a different member editing someone else\'s pending submission', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = memberCtx('member-2').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { description: 'Hijack' })
    );
  });

  it('DENIES the submitter editing their submission once it is no longer pending', async () => {
    await seed((db) =>
      setDoc(doc(db, 'submissions/sub-1'), { ...PENDING_SUBMISSION, status: 'approved' })
    );
    const db = memberCtx('member-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { description: 'Too late' })
    );
  });

  it('ALLOWS an approver to approve a submission inside their venue scope', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION);
      await setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] });
    });
    const db = memberCtx('approver-1').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('ALLOWS an approver to reject a submission inside their venue scope', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION);
      await setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] });
    });
    const db = memberCtx('approver-1').firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'rejected' })
    );
  });

  // Status transitions are one-way out of `pending`. An approval fires the
  // bridge that commits a row to /data, so a reversible status would let
  // approved -> rejected -> approved commit the same event twice.
  it('DENIES an in-scope approver re-flipping an already-approved submission', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'submissions/sub-1'), { ...PENDING_SUBMISSION, status: 'approved' });
      await setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] });
    });
    const db = memberCtx('approver-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'rejected' })
    );
  });

  it('DENIES an admin re-approving an already-rejected submission', async () => {
    await seed((db) =>
      setDoc(doc(db, 'submissions/sub-1'), { ...PENDING_SUBMISSION, status: 'rejected' })
    );
    const db = adminCtx().firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('DENIES an approver approving a submission whose venue_id is NOT in their venue_ids', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION); // venue_id: chicago
      await setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['sprallen'] });
    });
    const db = memberCtx('approver-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('DENIES a member with no approvers doc at all from approving anything', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = memberCtx('random-member').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('DENIES an in-scope approver from changing fields other than status while approving', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION);
      await setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] });
    });
    const db = memberCtx('approver-1').firestore();
    await assertFails(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved', price: '0 kr' })
    );
  });

  it('ALLOWS an admin to approve any submission regardless of venue', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = adminCtx().firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'approved' })
    );
  });

  it('ALLOWS an admin to reject any submission regardless of venue', async () => {
    await seed((db) => setDoc(doc(db, 'submissions/sub-1'), PENDING_SUBMISSION));
    const db = adminCtx().firestore();
    await assertSucceeds(
      updateDoc(doc(db, 'submissions/sub-1'), { status: 'rejected' })
    );
  });
});

// =========================================================================
// role_grants/{id} — append-only audit, no client ever writes here.
// =========================================================================

describe('role_grants/{id}', () => {
  it('DENIES a member writing a role_grants doc', async () => {
    const db = memberCtx('member-1').firestore();
    await assertFails(
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'member-1',
        role: 'admin',
        granted_by: 'member-1',
      })
    );
  });

  it('DENIES an approver writing a role_grants doc', async () => {
    await seed((db) => setDoc(doc(db, 'approvers/approver-1'), { venue_ids: ['chicago'] }));
    const db = memberCtx('approver-1').firestore();
    await assertFails(
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'approver-1',
        role: 'admin',
        granted_by: 'approver-1',
      })
    );
  });

  it('DENIES an admin writing a role_grants doc (server-side/admin SDK only)', async () => {
    const db = adminCtx().firestore();
    await assertFails(
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'member-1',
        role: 'admin',
        granted_by: 'admin-1',
      })
    );
  });

  it('DENIES an admin updating an existing role_grants doc', async () => {
    await seed((db) =>
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'member-1',
        role: 'admin',
        granted_by: 'admin-1',
      })
    );
    const db = adminCtx().firestore();
    await assertFails(
      updateDoc(doc(db, 'role_grants/grant-1'), { role: 'superadmin' })
    );
  });

  it('ALLOWS an admin to read role_grants', async () => {
    await seed((db) =>
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'member-1',
        role: 'admin',
        granted_by: 'admin-1',
      })
    );
    const db = adminCtx().firestore();
    await assertSucceeds(getDoc(doc(db, 'role_grants/grant-1')));
  });

  it('DENIES a member reading role_grants', async () => {
    await seed((db) =>
      setDoc(doc(db, 'role_grants/grant-1'), {
        target_uid: 'member-1',
        role: 'admin',
        granted_by: 'admin-1',
      })
    );
    const db = memberCtx('member-1').firestore();
    await assertFails(getDoc(doc(db, 'role_grants/grant-1')));
  });
});
