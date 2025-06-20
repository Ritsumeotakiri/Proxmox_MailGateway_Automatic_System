export function processChartData(normalized) {
  const monthsOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartByMonth = {};

  monthsOrder.forEach(month => {
    chartByMonth[month] = {
      name: month,
      sent: 0,
      virus: 0,
      quarantine: 0,
      spam: 0  // <-- You can keep this if another source will inject it later
    };
  });

  normalized.forEach(log => {
    const date = new Date(log.time * 1000);
    const month = date.toLocaleString('default', { month: 'short' });
    if (!chartByMonth[month]) return;

    chartByMonth[month].sent += 1;

    const subject = log.subject?.toLowerCase() || '';
    if (subject.includes('virus')) {
      chartByMonth[month].virus += 1;
    }

    if (log.dstatus === 'Q') {
      chartByMonth[month].quarantine += 1;
    }
  });

  return Object.values(chartByMonth);
}
