export default async function request({ method, data }) {
  const payload = { ...data, format: 'json' };

  const url = 'https://ws.audioscrobbler.com/2.0/';

  const options = {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (method === 'GET') {
    const qs = new URLSearchParams(payload).toString();
    const res = await fetch(`${url}?${qs}`, options);
    return res.json();
  } else if (method === 'POST') {
    options.body = new URLSearchParams(payload);
    const res = await fetch(url, options);
    return res.json();
  }
}
