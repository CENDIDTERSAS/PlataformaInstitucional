const http = require('http');

const data = JSON.stringify({
    nombres: 'Tester',
    apellidos: 'API',
    identificacion: '999999',
    dependencia: 'IT',
    cargo: 'Engineer',
    rol: 'Colaborador',
    estado: 'Activo',
    email: 'tester_api@prueba.com'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
