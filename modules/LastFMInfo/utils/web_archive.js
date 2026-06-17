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

export async function fetchWebArchive(url, options = {}){
    const {
      timestamp,
      ...fetchOptions
    } = options || {};

    const ts =
      typeof timestamp === "string"
        ? timestamp
        : timestamp instanceof Date
          ? getWaybackTimestamp(timestamp)
          : getWaybackTimestamp();

    const cleanUrl = encodeURI(url);

    const finalUrl = `https://web.archive.org/web/${ts}oe_/${cleanUrl}`;

    return fetch(finalUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        accept: "text/html",
        //...(fetchOptions?.['headers'] || {})
      }
    });
  }

