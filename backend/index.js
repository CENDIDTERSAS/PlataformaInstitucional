const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: en producción el frontend de Vercel viene por FRONTEND_URL
const allowedOrigins = [
    process.env.FRONTEND_URL,      // ej. https://tu-app.vercel.app
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) callback(null, true);
        else callback(new Error(`CORS: origen no permitido → ${origin}`));
    },
    credentials: true,
}));

app.use(express.json());

// Logger de peticiones
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Importar rutas
const proveedoresRoutes = require('./routes/proveedores');
const usersRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const loginRoutes = require('./routes/login');
const inventoryRoutes = require('./routes/inventory');
const bodegasRoutes = require('./routes/bodegas');
const productsRoutes = require('./routes/products');
const movimientosRoutes = require('./routes/movimientos');
const pedidosRoutes = require('./routes/pedidos');
const requestsRoutes = require('./routes/requests');
const notificationsRoutes = require('./routes/notifications');
const auditoriaRoutes = require('./routes/auditoria');
const equiposRoutes = require('./routes/equipos');
const mantenimientosRoutes = require('./routes/mantenimientos');
// Las rutas base ya manejan objetos dinámicos de Supabase,
// por lo que los nuevos campos funcionarán automáticamente.
const contratosRoutes = require('./routes/contratos_equipos');
const repuestosRoutes = require('./routes/repuestos_equipos');
const equiposTiRoutes = require('./routes/equipos_ti');
const softwareTiRoutes = require('./routes/software_ti');
const mantenimientosTiRoutes = require('./routes/mantenimientos_ti');
const lmsRoutes = require('./routes/lms');

// Montar rutas
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/inventario', inventoryRoutes);
app.use('/api/bodegas', bodegasRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/pedidos-proveedor', pedidosRoutes);
app.use('/api/solicitudes', requestsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/auditoria', auditoriaRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/mantenimientos', mantenimientosRoutes);
app.use('/api/contratos-biomedicos', contratosRoutes);
app.use('/api/repuestos-equipos', repuestosRoutes);
app.use('/api/equipos-ti', equiposTiRoutes);
app.use('/api/software-ti', softwareTiRoutes);
app.use('/api/mantenimientos-ti', mantenimientosTiRoutes);
app.use('/api/lms', lmsRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend conectado y funcionando (Modularizado)' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('🔥 ERROR GLOBAL:', err);
    res.status(500).json({
        error: err.message || 'Error interno del servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
