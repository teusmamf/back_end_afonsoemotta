import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ path: './.env' });

const app = express();
app.use(cors()); // Habilita CORS para qualquer origem
app.use(express.json());

const SPREADSHEET_ID = '1pTjoMomAJDEtCoVgn4AUcbsH5eYiVt2tGsEG6p8QY3I';
const SHEET_NAME = 'Responses';

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API está rodando' });
});

app.post('/api/submit-form', async (req, res) => {
  try {
    const { name, email, phone, leads, appointments, attendance, sales, rates } = req.body;
    
    console.log("LOGGING .ENV VARIABLES", 
      process.env.GOOGLE_CLIENT_EMAIL, 
      process.env.GOOGLE_PRIVATE_KEY ? 'PRIVATE_KEY_LOADED' : 'PRIVATE_KEY_MISSING'
    );

    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ error: 'Credenciais do Google não configuradas corretamente' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
      [
        new Date().toISOString(),
        name,
        email,
        phone,
        leads,
        appointments,
        attendance,
        sales,
        rates.leadsToAppointments,
        rates.appointmentsToAttendance,
        rates.attendanceToSales,
        rates.leadsToSales,
      ],
    ];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:L`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Falha ao enviar o formulário' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});
