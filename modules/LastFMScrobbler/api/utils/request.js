import generateSignature from './generate-signature';

export default async function request({ method, sk, data }) {
  const url = 'https://ws.audioscrobbler.com/2.0/';

  if (sk) {
    data.sk = sk;
  }

  const payload = {
    ...data,
    format: 'json',
    api_sig: generateSignature(data),
  };

  const options = {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  try {
    let res;
    if (method === 'GET') {
      const qs = new URLSearchParams(payload).toString();
      res = await fetch(`${url}?${qs}`, options);
    } else if (method === 'POST') {
      options.body = new URLSearchParams(payload);
      res = await fetch(url, options);
    } else {
      throw new Error(`Unsupported method: ${method}`);
    }

    const body = await res.json();

    if (!res.ok) {
      if (body?.error === 9) {
        throw { error: new Error('Unauthorized'), response: body, isUnauthorized: true };
      } else {
        throw { error: new Error(res.statusText), response: body };
      }
    }

    return body;
  } catch (err) {
    if (err.response?.error === 9) {
      throw { ...err, isUnauthorized: true };
    }
    throw err;
  }
}
