import http from 'k6/http';
import encoding from 'k6/encoding';
import { check, group, sleep } from 'k6';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SUPABASE_URL = __ENV.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || '';

// Derive the cookie name from the Supabase URL (sb-{ref}-auth-token)
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const COOKIE_NAME = `sb-${projectRef}-auth-token`;

// ---------------------------------------------------------------------------
// Load profile & thresholds
// ---------------------------------------------------------------------------

export const options = {
  stages: [
    { duration: '15s', target: 10 }, // ramp up
    { duration: '30s', target: 10 }, // hold
    { duration: '15s', target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

// ---------------------------------------------------------------------------
// Setup – authenticate once and share the session cookie across all VUs
// ---------------------------------------------------------------------------

export function setup() {
  if (!SUPABASE_ANON_KEY) {
    console.error(
      'SUPABASE_ANON_KEY is required. Pass it via --env SUPABASE_ANON_KEY=...'
    );
    return { authCookie: null };
  }

  if (!TEST_USER_PASSWORD) {
    console.error(
      'TEST_USER_PASSWORD is required. Pass it via --env TEST_USER_PASSWORD=...'
    );
    return { authCookie: null };
  }

  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
    }
  );

  const ok = check(res, {
    'auth: status 200': (r) => r.status === 200,
  });

  if (!ok) {
    console.error(`Auth failed (${res.status}): ${res.body}`);
    return { authCookie: null };
  }

  const session = res.json();

  // @supabase/ssr (v0.8+) stores the session cookie as:
  //   "base64-" + base64url(JSON.stringify(session))
  // Chunked into cookies of max 3180 encodeURIComponent chars.
  const sessionPayload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });

  // base64url encode with "base64-" prefix (matches @supabase/ssr cookieEncoding: "base64url")
  const cookieValue = 'base64-' + encoding.b64encode(sessionPayload, 'rawurl');

  // Build cookie header – single cookie if ≤ 3180 chars, otherwise chunk
  const CHUNK_SIZE = 3180;
  let cookieHeader;
  if (cookieValue.length <= CHUNK_SIZE) {
    cookieHeader = `${COOKIE_NAME}=${cookieValue}`;
  } else {
    const chunks = [];
    for (let i = 0; i < cookieValue.length; i += CHUNK_SIZE) {
      chunks.push(cookieValue.substring(i, i + CHUNK_SIZE));
    }
    cookieHeader = chunks
      .map((chunk, idx) => `${COOKIE_NAME}.${idx}=${chunk}`)
      .join('; ');
  }

  console.log(`Authenticated as ${TEST_USER_EMAIL}`);
  return { authCookie: cookieHeader };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function publicGet(url, name) {
  const res = http.get(url, { tags: { name } });
  check(res, {
    [`${name}: status 200`]: (r) => r.status === 200,
  });
  return res;
}

function authedGet(url, name, authCookie) {
  const res = http.get(url, {
    headers: { Cookie: authCookie },
    tags: { name },
  });
  check(res, {
    [`${name}: status 200`]: (r) => r.status === 200,
  });
  return res;
}

// ---------------------------------------------------------------------------
// Default function – executed by each VU
// ---------------------------------------------------------------------------

export default function (data) {
  // Public routes
  group('public', () => {
    publicGet(`${BASE_URL}/api/content`, 'GET /api/content');
    publicGet(`${BASE_URL}/api/articles`, 'GET /api/articles');
  });

  // Authenticated routes (skip if auth failed)
  if (data.authCookie) {
    group('authenticated', () => {
      authedGet(`${BASE_URL}/api/products`, 'GET /api/products', data.authCookie);
      authedGet(`${BASE_URL}/api/usage`, 'GET /api/usage', data.authCookie);
      authedGet(`${BASE_URL}/api/chats`, 'GET /api/chats', data.authCookie);
    });
  }

  sleep(1);
}
