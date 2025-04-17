// server/server.js
import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables from .env file in parent directory
dotenv.config({ path: './.env' });

const app = express();
app.use(express.json());

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SPREADSHEET_ID = '1RzL3ZwWFK-9f-uKn6S-bfBLzzv1H0qD0AqVl7d6tn_U';
const SHEET_NAME = 'Responses';

app.options('/api/submit-form', (req, res) => {
  res.set(corsHeaders);
  res.status(204).send();
});

app.post('/api/submit-form', async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
    console.log(process.env.GOOGLE_CLIENT_EMAIL,process.env.GOOGLE_PRIVATE_KEY);
    
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
  
      const sheets = google.sheets({ version: 'v4', auth });
  
      const values = [
        [new Date().toISOString(), name, email, phone, message],
      ];
  
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:E`,
        valueInputOption: 'RAW',
        requestBody: { values },
      });
  
      res.set(corsHeaders);
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao enviar:', error);
      res.set(corsHeaders);
      res.status(500).json({ error: 'Erro ao enviar dados' });
    }
  });
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});