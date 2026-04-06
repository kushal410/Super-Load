import http from 'k6/http';
import { sleep, check } from 'k6';

const BASE_URL = 'https://api.2klips.com'; // replace with your actual API

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp-up 10 users
    { duration: '1m', target: 50 },   // ramp-up to 50 users
    { duration: '2m', target: 50 },   // hold at 50 users
    { duration: '30s', target: 0 },   // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests must complete under 500ms
    'http_req_failed': ['rate<0.01'], // less than 1% failed requests
  },
};

export default function () {
  // SuperAdmin login
  let loginRes = http.post(`${BASE_URL}/auth/superAdmin/login`, JSON.stringify({
    email: 'superadmin@example.com',
    password: 'yourpassword'
  }), { headers: { 'Content-Type': 'application/json' }});

  check(loginRes, {
    'login success': (r) => r.status === 200,
  });

  const token = loginRes.json('token'); // get auth token if needed

  // Load content endpoint
  let contentRes = http.get(`${BASE_URL}/superadmin/content`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  check(contentRes, {
    'content fetched': (r) => r.status === 200,
  });

  sleep(1); // pause between iterations
}
