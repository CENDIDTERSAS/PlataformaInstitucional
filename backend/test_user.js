const fetch = require('node-fetch');

async function testUserCreation() {
    try {
        const response = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombres: 'Test',
                apellidos: 'User',
                identificacion: '123456789',
                dependencia: 'IT',
                cargo: 'Tester',
                rol: 'Colaborador',
                estado: 'Activo'
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
testUserCreation();
