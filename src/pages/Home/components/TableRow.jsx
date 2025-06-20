export function TableRow({ sender, reason, action, time, size }) {
  const badgeColor = {
    'Quarantined': 'badge-yellow',
    'Delivered': 'badge-green',
    'Accepted': 'badge-blue',
    'Deferred': 'badge-gray',
    'Blocked': 'badge-red',
    'Rejected': 'badge-dark',
    'Bounced': 'badge-orange',
    'Accepted / Delivered': 'badge-green',
    'Accepted / Blocked': 'badge-red',
    'Accepted / Bounced': 'badge-orange',
    'Accepted / Rejected': 'badge-dark'
  }[action] || 'badge-default';

  return (
    <tr>
      <td>{sender}</td>
      <td>{reason}</td>
      <td><span className={`badge ${badgeColor}`}>{action}</span></td>
      <td>{time}</td>
      <td>{size}</td>
    </tr>
  );
}
