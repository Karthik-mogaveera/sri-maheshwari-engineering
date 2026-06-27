const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const slideshowRoutes = require('./routes/slideshow');
const whoWeAreRoutes = require('./routes/whoweare');
const servicesRoutes  = require('./routes/services');
const clientsRoutes   = require('./routes/clients');
const supplyVendorsRoutes   = require('./routes/supplyVendors');
const deliverablesRoutes = require('./routes/deliverables');
const aboutPeopleRoutes = require('./routes/aboutPeople');
const aboutCompanyRoutes = require('./routes/aboutCompany');
const businessPerformanceRoutes = require('./routes/businessPerformance');
const projects = require('./routes/projects');
const contact = require('./routes/contact');
const inquiries = require('./routes/inquiries');
const information = require('./routes/settings/information');
const socialMedia = require('./routes/settings/socialMedia');
const seo = require('./routes/settings/seo');
const security = require('./routes/settings/security');

const app = express();

// const cors = require('cors');

// app.use(cors());

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static: serve uploaded images ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health Check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Sri Maheshwari Engineering API Running', version: '1.0.0' });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/admin/slideshow', slideshowRoutes);   // ← slideshow module
app.use('/api/admin/whoweare', whoWeAreRoutes);   // ← who we are module
app.use('/api/admin/services',   servicesRoutes);    // ← services module
app.use('/api/admin/clients',    clientsRoutes);     // ← clients module
app.use('/api/admin/supply-vendors', supplyVendorsRoutes);
app.use('/api/admin/deliverables', deliverablesRoutes);
app.use('/api/admin/about-people', aboutPeopleRoutes);
app.use('/api/admin/about-company', aboutCompanyRoutes);
app.use('/api/admin/business-performance', businessPerformanceRoutes);
app.use('/api/admin/projects', projects);
app.use('/api/contact', contact);
app.use('/api/admin/inquiries', inquiries);
app.use('/api/admin/settings/information', information);
app.use('/api/admin/settings/social-media', socialMedia);
app.use('/api/admin/settings/seo', seo);
app.use('/api/admin/settings/security', security);



// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

module.exports = app;
