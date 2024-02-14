// /api/sheet.js
const {google} = require('googleapis');
const express = require('express');
const app = express();

app.use(express.json());

const sheets = google.sheets({version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY});

app.get('/api/sheet', async (req, res) => {
    try {
        const range = 'Test!A:C'; // 适当调整以匹配你的Google Sheets数据范围
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range,
        });

        const rows = response.data.values;
        if (rows.length) {
            // 处理数据或直接返回
            res.status(200).json({data: rows});
        } else {
            res.status(404).send('No data found.');
        }
    } catch (err) {
        console.error('The API returned an error: ' + err);
        res.status(500).send('Error retrieving data');
    }
});

module.exports = app;
