require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load credentials from JSON file or environment variables
let auth;
let spreadsheetId = process.env.GOOGLE_SHEET_ID;

try {
  // Try to load from credentials.json
  const credentialsPath = path.join(__dirname, 'credentials.json');
  if (fs.existsSync(credentialsPath)) {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    
    if (credentials.client_email && credentials.private_key) {
      auth = new google.auth.JWT(
        credentials.client_email,
        null,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      console.log('✓ Loaded credentials from credentials.json');
    }
  }
  
  // Fallback to environment variables
  if (!auth && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    console.log('✓ Loaded credentials from environment variables');
  }
  
  if (!auth) {
    console.warn('⚠ No Google credentials found. API calls will fail.');
    console.warn('  Please add credentials.json or set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env');
  }
} catch (error) {
  console.error('Error loading credentials:', error.message);
}

const sheets = google.sheets({ version: 'v4', auth });

// Helper function to append data to a sheet
async function appendToSheet(range, values) {
  if (!auth) {
    throw new Error('Google authentication not configured');
  }
  if (!spreadsheetId) {
    throw new Error('Google Sheet ID not configured');
  }
  
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error appending to sheet:', error.message);
    throw error;
  }
}

// API Routes

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const values = [
      new Date().toISOString(),
      name,
      email,
      subject,
      message
    ];

    await appendToSheet(`${process.env.CONTACT_SHEET_NAME || 'ContactUs'}!A:E`, values);

    res.status(200).json({ success: true, message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Contact form error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

// Sales Services Form Submission
app.post('/api/sales', async (req, res) => {
  try {
    const { companyName, contactPerson, email, phone, serviceType, requirements } = req.body;
    
    if (!companyName || !contactPerson || !email || !serviceType) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }
    
    const values = [
      new Date().toISOString(),
      companyName,
      contactPerson,
      email,
      phone || '',
      serviceType,
      requirements || ''
    ];

    await appendToSheet(`${process.env.SALES_SHEET_NAME || 'SalesServices'}!A:G`, values);

    res.status(200).json({ success: true, message: 'Sales inquiry submitted successfully' });
  } catch (error) {
    console.error('Sales form error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit sales inquiry' });
  }
});

// Feedback Form Submission
app.post('/api/feedback', async (req, res) => {
  try {
    const { name, email, rating, feedback } = req.body;
    
    if (!name || !email || !feedback) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const values = [
      new Date().toISOString(),
      name,
      email,
      rating,
      feedback
    ];

    await appendToSheet(`${process.env.FEEDBACK_SHEET_NAME || 'Feedback'}!A:E`, values);

    res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback form error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    authConfigured: !!auth,
    sheetIdConfigured: !!spreadsheetId
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════════════════════╗`);
  console.log(`║           Veertrons Backend Server Started              ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║  Server:    http://localhost:${PORT}                       ║`);
  console.log(`╠════════════════════════════════════════════════════════╣`);
  console.log(`║  Endpoints:                                              ║`);
  console.log(`║    POST /api/contact    - Contact form                 ║`);
  console.log(`║    POST /api/sales      - Sales inquiry                 ║`);
  console.log(`║    GET  /api/health     - Health check                 ║`);
  console.log(`╚════════════════════════════════════════════════════════╝\n`);
  
  if (!auth) {
    console.log('⚠️  WARNING: Google credentials not configured!');
    console.log('   Please add your credentials.json file with:');
    console.log('   - client_email: your-service-account@project.iam.gserviceaccount.com');
    console.log('   - private_key: your-private-key');
    console.log('   And set GOOGLE_SHEET_ID in .env file\n');
  }
});
