export function formatTime(unixTime) {
  if (!unixTime) return '-';
  return new Date(unixTime * 1000).toLocaleString();
}

export function mapStatus(dstatus, rstatus) {
  const map = {
    Q: 'Quarantined',
    N: 'Deferred',
    A: 'Accepted',
    '2': 'Delivered',
    '4': 'Blocked',
    '5': 'Bounced',
    R: 'Rejected'
  };
  const d = map[dstatus] || 'Unknown';
  const r = map[rstatus];
  if (dstatus && rstatus && d !== r) return `${d} / ${r}`;
  return d;
}
