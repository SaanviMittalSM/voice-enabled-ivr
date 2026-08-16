const base = () => process.env.PUBLIC_BASE_URL;

function otpPrompt() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits action="${base()}/ivr/otp/verify" method="POST" numDigits="4" timeout="15" retries="3">
    <Speak>Please enter your 4 digit O T P.</Speak>
  </GetDigits>
  <Speak>We did not receive any input. Goodbye.</Speak>
</Response>`;
}

function redirect(path) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Redirect method="POST">${base()}${path}</Redirect>
</Response>`;
}

function languageMenu() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits action="${base()}/ivr/menu/language" method="POST" numDigits="1" timeout="15" retries="3">
    <Speak>Press 1 for English. Press 2 for Spanish.</Speak>
  </GetDigits>
  <Speak>We did not receive any input. Goodbye.</Speak>
</Response>`;
}

function actionMenu(lang) {
  const prompt = lang === 'es'
    ? 'Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado.'
    : 'Press 1 to hear a message. Press 2 to speak with an associate.';
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <GetDigits action="${base()}/ivr/menu/level2?lang=${lang}" method="POST" numDigits="1" timeout="15" retries="3">
    <Speak>${prompt}</Speak>
  </GetDigits>
  <Speak>We did not receive any input. Goodbye.</Speak>
</Response>`;
}

function playAudio() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${process.env.AUDIO_URL}</Play>
  <Hangup/>
</Response>`;
}

function forwardCall() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Number>${process.env.LIVE_ASSOCIATE_NUMBER}</Number>
  </Dial>
</Response>`;
}

module.exports = { otpPrompt, redirect, languageMenu, actionMenu, playAudio, forwardCall };
