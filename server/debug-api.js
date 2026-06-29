const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8080,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log('Logging in...');
    const loginRes = await request('POST', '/auth/login', {
      email: 'tutor1@test.com',
      password: 'Test@123',
    });

    if (loginRes.status >= 300) {
      console.error('Login failed:', loginRes.status, loginRes.body);
      return;
    }

    const loginData = JSON.parse(loginRes.body);
    const token = loginData.data?.access_token || loginData.access_token;
    console.log('Login success.');

    console.log('Fetching /tutor/me...');
    const meRes = await request('GET', '/tutor/me', null, token);

    console.log('Status:', meRes.status);
    console.log('Body:', meRes.body);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
