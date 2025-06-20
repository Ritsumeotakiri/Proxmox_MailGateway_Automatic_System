export function formatReadableTime(unix) {
  if (!unix) return '-';
  const d = new Date(unix * 1000);
  return `${d.toLocaleDateString('en-GB')} at ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function formatSize(bytes) {
  return bytes?.toLocaleString() || '-';
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A';
}
