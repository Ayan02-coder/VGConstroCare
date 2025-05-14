const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const XLSX = require('xlsx');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();



const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to handle contact form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  const newEntry = {
    Name: name,
    Email: email,
    Subject: subject,
    Message: message,
    Date: new Date().toLocaleString()
  };

  const filePath = 'messages.xlsx';
  let data = [];

  // Read existing Excel file if it exists
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    data = XLSX.utils.sheet_to_json(worksheet);
  }

  // Append new entry
  data.push(newEntry);

  // Write to Excel file
  const newWorkbook = XLSX.utils.book_new();
  const newWorksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Messages');
  XLSX.writeFile(newWorkbook, filePath);

  // Send email to admin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"VG Constro Care" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Message from ${name}`,
    text: `
You received a new message from the website:

Name: ${name}
Email: ${email}
Subject: ${subject}
Message: ${message}
Date: ${new Date().toLocaleString()}
`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });

  res.status(200).json({ message: 'Message saved successfully!' });
});

// Route to fetch messages (for admin panel)
//app.get('/api/messages', (req, res) => {
  //const filePath = 'messages.xlsx';
  //if (!fs.existsSync(filePath)) return res.json([]);

  //const workbook = XLSX.readFile(filePath);
  //const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  //const data = XLSX.utils.sheet_to_json(worksheet);
  //res.json(data);
//});

// Route to fetch messages
app.get('/api/messages', (req, res) => {
  const filePath = 'messages.xlsx';
  if (!fs.existsSync(filePath)) return res.json([]);
  
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  res.json(data);
});


// Route to download messages.xlsx
app.get('/api/download', (req, res) => {
  const filePath = 'messages.xlsx';
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'messages.xlsx');
  } else {
    res.status(404).send('File not found');
  }
});

app.get('/api/analytics', (req, res) => {
  const filePath = 'analytics.xlsx';
  if (!fs.existsSync(filePath)) return res.json([]);

  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  res.json(data);
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
