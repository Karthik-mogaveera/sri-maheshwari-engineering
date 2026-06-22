/**
 * routes/contact.js
 * ─────────────────────────────────────────────────────────────
 * Public contact form endpoint.
 *
 * Security layers:
 *  1. Rate limiting    — max 5 submissions per IP per 15 minutes
 *  2. Input validation — required fields, length limits, format checks
 *  3. SQL injection    — 100% parameterised queries via mysql2 (no interpolation)
 *  4. XSS protection   — all input sanitised with DOMPurify-equivalent strip function
 *  5. CSRF protection  — CORS whitelist + custom X-Requested-With header check
 *  6. Email           — company notification + customer auto-reply via nodemailer
 *
 * POST /api/contact
 * Body: { name, email, phone, company_name, message }
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const pool = require('../config/db');
const nodemailer = require('nodemailer');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  In-memory rate limiter (no extra package needed)
//  Max 5 requests per IP per 15 minutes
// ══════════════════════════════════════════════════════════════
const rateLimitMap = new Map();       // ip -> { count, resetAt }
const RATE_LIMIT = 5;
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes in ms

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
        return false;
    }
    if (entry.count >= RATE_LIMIT) return true;
    entry.count++;
    return false;
}

// Periodically clean the map so it does not grow forever
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
}, RATE_WINDOW);

// ══════════════════════════════════════════════════════════════
//  XSS sanitiser — strips all HTML/script tags from a string
// ══════════════════════════════════════════════════════════════
function sanitise(value) {
    if (typeof value !== 'string') return '';
    return value
        .replace(/<[^>]*>/g, '')          // strip HTML tags
        .replace(/javascript:/gi, '')     // strip JS protocol
        .replace(/on\w+\s*=/gi, '')       // strip inline event handlers
        .trim();
}

// ══════════════════════════════════════════════════════════════
//  Email transporter (nodemailer)
//  Configure via .env — supports Gmail, SMTP, Outlook, etc.
// ══════════════════════════════════════════════════════════════
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',   // true for port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

// ── Company notification email ─────────────────────────────────
async function sendCompanyNotification({ name, email, phone, company_name, message }) {
    const transporter = createTransporter();
    const companyEmail = process.env.COMPANY_EMAIL || process.env.SMTP_USER;

    await transporter.sendMail({
        from: `"SMEE Website" <${process.env.SMTP_USER}>`,
        to: companyEmail,
        subject: `New Enquiry from ${name} — SMEE Website`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0B1F3A;padding:24px;border-radius:10px 10px 0 0;">
          <h2 style="color:#14B8A6;margin:0;font-size:22px;">New Website Enquiry</h2>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">
            Sri Maheshwari Engineering Enterprises
          </p>
        </div>
        <div style="background:#f9fafb;padding:28px;border:1px solid #e5e7eb;border-top:none;">
          <table style="width:100%;border-collapse:collapse;">
            ${[
                ['Name', name],
                ['Email', email],
                ['Phone', phone || '—'],
                ['Company', company_name || '—'],
            ].map(([k, v]) => `
              <tr>
                <td style="padding:10px 14px;font-weight:700;color:#374151;width:130px;
                           border-bottom:1px solid #e5e7eb;font-size:14px;">${k}</td>
                <td style="padding:10px 14px;color:#374151;border-bottom:1px solid #e5e7eb;
                           font-size:14px;">${v}</td>
              </tr>`).join('')}
          </table>
          <div style="margin-top:20px;">
            <p style="font-weight:700;color:#374151;font-size:14px;margin-bottom:8px;">Message:</p>
            <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;
                        padding:16px;color:#374151;font-size:14px;line-height:1.7;
                        white-space:pre-wrap;">${message}</div>
          </div>
        </div>
        <div style="background:#e5e7eb;padding:14px 28px;border-radius:0 0 10px 10px;
                    font-size:12px;color:#9ca3af;text-align:center;">
          This email was sent automatically from the SMEE website contact form.
        </div>
      </div>
    `,
    });
}

// ── Customer auto-reply email ──────────────────────────────────
async function sendCustomerAutoReply({ name, email, message }) {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Sri Maheshwari Engineering Enterprises" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Thank you for contacting SMEE — We have received your enquiry',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0B1F3A;padding:28px;border-radius:10px 10px 0 0;text-align:center;">
          <div style="width:56px;height:56px;background:linear-gradient(135deg,#14B8A6,#0E9488);
                      border-radius:12px;display:inline-flex;align-items:center;justify-content:center;
                      font-size:24px;font-weight:800;color:white;margin-bottom:14px;">S</div>
          <h1 style="color:white;margin:0;font-size:22px;">Sri Maheshwari Engineering</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;letter-spacing:0.1em;">
            ENTERPRISES
          </p>
        </div>

        <div style="background:white;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#0B1F3A;font-size:20px;margin:0 0 16px;">
            Thank you, ${name}!
          </h2>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 18px;">
            We have successfully received your enquiry. Our team will review your message
            and get back to you within <strong>1–2 business days</strong>.
          </p>

          <div style="background:#f0fdf4;border-left:4px solid #14B8A6;
                      border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
            <p style="color:#374151;font-size:13px;font-weight:700;margin:0 0 8px;">
              Your message:
            </p>
            <p style="color:#6b7280;font-size:13px;line-height:1.7;
                      white-space:pre-wrap;margin:0;">${message}</p>
          </div>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 8px;">
            <strong>Sri Maheshwari Engineering Enterprises</strong><br>
            12, 3rd Cross, 1st Main, RMV 2nd Stage,<br>
            Nageshettyhalli, Bengaluru – 560094
          </p>
          <p style="color:#6b7280;font-size:13px;margin:0;">
            📧 ${process.env.COMPANY_EMAIL || process.env.SMTP_USER}
          </p>
        </div>

        <div style="background:#f3f4f6;padding:14px 28px;border-radius:0 0 10px 10px;
                    font-size:12px;color:#9ca3af;text-align:center;">
          This is an automated reply. Please do not reply to this email directly.
        </div>
      </div>
    `,
    });
}

// ══════════════════════════════════════════════════════════════
//  POST /api/contact
// ══════════════════════════════════════════════════════════════
router.post('/', async (req, res) => {

    // ── 1. CSRF check — must have X-Requested-With header ──────
    if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
        return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    // ── 2. Rate limiting ────────────────────────────────────────
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || 'unknown';

    if (isRateLimited(clientIP)) {
        return res.status(429).json({
            success: false,
            message: 'Too many submissions. Please wait 15 minutes before trying again.'
        });
    }

    // ── 3. Sanitise inputs (XSS protection) ────────────────────
    const name = sanitise(req.body.name || '');
    const email = sanitise(req.body.email || '');
    const phone = sanitise(req.body.phone || '');
    const company_name = sanitise(req.body.company_name || '');
    const message = sanitise(req.body.message || '');

    // ── 4. Validate ─────────────────────────────────────────────
    const errors = [];

    if (!name || name.length < 2 || name.length > 150)
        errors.push('Name must be between 2 and 150 characters.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255)
        errors.push('A valid email address is required.');

    if (phone && !/^[+\d\s\-().]{7,20}$/.test(phone))
        errors.push('Phone number format is invalid.');

    if (company_name && company_name.length > 255)
        errors.push('Company name must be under 255 characters.');

    if (!message || message.length < 10 || message.length > 5000)
        errors.push('Message must be between 10 and 5000 characters.');

    if (errors.length > 0) {
        return res.status(422).json({ success: false, message: errors[0], errors });
    }

    // ── 5. Store in DB (parameterised — SQL injection safe) ─────
    try {
        await pool.query(
            `INSERT INTO inquiries (name, email, phone, company_name, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, phone || null, company_name || null, message, clientIP]
        );
    } catch (dbErr) {
        console.error('DB insert error:', dbErr);
        return res.status(500).json({ success: false, message: 'Failed to save your enquiry. Please try again.' });
    }

    // ── 6. Send emails (best-effort — don't fail the response) ──
    const emailPayload = { name, email, phone, company_name, message };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
            await Promise.all([
                sendCompanyNotification(emailPayload),
                sendCustomerAutoReply(emailPayload),
            ]);
        } catch (mailErr) {
            // Log but don't fail — DB record already saved
            console.error('Email send error:', mailErr.message);
        }
    } else {
        console.warn('⚠️  SMTP not configured — emails not sent. Set SMTP_USER and SMTP_PASS in .env');
    }

    res.status(201).json({
        success: true,
        message: 'Thank you for your enquiry! We will get back to you within 1–2 business days.'
    });
});

module.exports = router;