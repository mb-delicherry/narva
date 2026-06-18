exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ECOMAIL_API_KEY;
  const listId = 6;

  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Chýba ECOMAIL_API_KEY v nastaveniach Netlify.' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Neplatné dáta.' }) };
  }

  const { name, surname, company, email, phone, ico, kategorie } = data;

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Chýba e-mail.' }) };
  }

  const payload = {
    subscriber_data: {
      email,
      name,
      surname,
      company,
      phone,
      ICO: ico,
      KATEGORIE: kategorie
    },
    trigger_autoresponders: true,
    trigger_notification: true,
    update_existing: true,
    resubscribe: true
  };

  try {
    const res = await fetch(`https://api2.ecomailapp.cz/lists/${listId}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const resultText = await res.text();

    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: 'Ecomail error', details: resultText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
};
