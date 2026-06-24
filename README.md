# Veertrons Backend - Google Sheets Integration

This backend service stores form submissions from the Veertrons website directly into Google Sheets.

## Quick Start

```bash
cd veertrons-backend
npm install
npm start
```

## Google Cloud Console Setup - Step by Step

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter a name (e.g., "Veertrons Forms")
4. Click **"Create"**

### Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and click **"Enable"**

### Step 3: Create a Service Account

1. Go to **"IAM & Admin"** → **"Service Accounts"**
2. Click **"+ CREATE SERVICE ACCOUNT"**
3. Fill in:
   - **Service account name**: `veertrons-sheets`
   - **Service account ID**: auto-generated
   - **Description**: `For storing form submissions in Google Sheets`
4. Click **"Continue"**
5. Under **"Grant this service account access to project"**:
   - Select role: **"Editor"** (or "Project > Editor")
6. Click **"Continue"**
7. Under **"Grant users access to this service account"**:
   - You can leave it empty for now
8. Click **"Done"**

### Step 4: Create and Download Credentials

1. In the Service Accounts list, find your new service account
2. Click on the **"Actions"** (three dots) → **"Manage keys"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **"JSON"** as the key type
5. Click **"Create"**
6. The JSON file will download automatically
7. **Save this file** as `credentials.json` in the `veertrons-backend` folder

### Step 5: Get Your Google Sheet ID

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Create two sheets/tabs with exact names:
   - `ContactUs`
   - `SalesServices`
3. Add column headers as shown below
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
   The ID is the part between `/d/` and `/edit`

### Step 6: Add Headers to Your Google Sheet

**ContactUs (A1:E1):**
```
Timestamp | Name | Email | Subject | Message
```

**SalesServices (A1:G1):**
```
Timestamp | Company Name | Contact Person | Email | Phone | Service Type | Requirements
```

### Step 7: Share Your Sheet with the Service Account

1. Open your Google Sheet
2. Click **"Share"** → **"Share with others"**
3. In the **"Add people and groups"** field, paste the `client_email` from your `credentials.json` file
4. Set as **"Editor"**
5. Click **"Send"**

### Step 8: Configure Environment Variables

Open [`veertrons-backend/.env`](veertrons-backend/.env) and add your Sheet ID:
```env
GOOGLE_SHEET_ID=your-google-sheet-id-here
```

## Run the Server

```bash
cd veertrons-backend
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/sales` | Submit sales inquiry |
| GET | `/api/health` | Health check |

## Troubleshooting

### "Google authentication not configured"
- Make sure `credentials.json` is in the `veertrons-backend` folder
- Check that the JSON file is valid and contains `client_email` and `private_key`

### "Google Sheet ID not configured"
- Add `GOOGLE_SHEET_ID` to your `.env` file
- Make sure you've shared the sheet with your service account email

### Permission Denied Errors
- Ensure the service account email has Editor access to your Google Sheet
- Verify Google Sheets API is enabled in Google Cloud Console

## Frontend Integration

All three forms are already configured to submit to the backend:

- [`ContactUs.jsx`](veertrons/src/pages/ContactUs.jsx)
- [`SalesServices.jsx`](veertrons/src/pages/SalesServices.jsx)
