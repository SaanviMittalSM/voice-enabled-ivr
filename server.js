require('dotenv').config();
const express = require('express');
const plivo = require('plivo');
const xml = require('./xml');

const app = express();
app.use(express.urlencoded({ extended: false }));

const client = new plivo.Client(process.env.PLIVO_AUTH_ID, process.env.PLIVO_AUTH_TOKEN);

app.post('/trigger-call', async (req, res) => {
  const to = req.body.to || process.env.TARGET_NUMBER;
  try {
    const call = await client.calls.create(
      process.env.PLIVO_FROM_NUMBER,
      to,
      `${process.env.PUBLIC_BASE_URL}/ivr/otp`,
      { answerMethod: 'POST' }
    );
    console.log('call triggered ->', to, call.requestUuid);
    res.json({ status: 'ok', requestUuid: call.requestUuid });
  } catch (err) {
    console.error('trigger-call failed:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/ivr/otp', (req, res) => {
  console.log('otp prompt sent');
  res.type('text/xml').send(xml.otpPrompt());
});

app.post('/ivr/otp/verify', (req, res) => {
  const digits = req.body.Digits;
  const correct = digits === process.env.OTP_DDMM;
  console.log('otp attempt:', digits, '->', correct ? 'correct' : 'wrong');
  res.type('text/xml').send(correct ? xml.redirect('/ivr/menu') : xml.otpPrompt());
});

app.post('/ivr/menu', (req, res) => {
  res.type('text/xml').send(xml.languageMenu());
});

app.post('/ivr/menu/language', (req, res) => {
  const digits = req.body.Digits;
  console.log('language choice:', digits);
  if (digits === '1' || digits === '2') {
    res.type('text/xml').send(xml.actionMenu(digits === '1' ? 'en' : 'es'));
  } else {
    res.type('text/xml').send(xml.languageMenu());
  }
});

app.post('/ivr/menu/level2', (req, res) => {
  const digits = req.body.Digits;
  const lang = req.query.lang === 'es' ? 'es' : 'en';
  console.log('level2 choice:', digits, 'lang:', lang);
  if (digits === '1') {
    res.type('text/xml').send(xml.playAudio());
  } else if (digits === '2') {
    res.type('text/xml').send(xml.forwardCall());
  } else {
    res.type('text/xml').send(xml.actionMenu(lang));
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on ${port}`));
