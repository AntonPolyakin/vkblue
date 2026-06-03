export function getWaybackTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');

  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds())
  );
}

export async function fetchWebArchive(url, timestamp){
  timestamp = timestamp || getWaybackTimestamp();

  return fetch(`https://web.archive.org/web/${timestamp}/${url}`, {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "ru,en;q=0.9",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=0, i",
    },
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
  });
}

