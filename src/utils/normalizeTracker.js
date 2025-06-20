export function normalizeTrackerData(rawData) {
  return rawData.data.map(item => ({
    id: item.id || null,
    qid: item.qid || null,
    from: item.from || '',
    to: item.to || '',
    client: item.client || '',
    relay: item.relay || null,
    msgid: item.msgid || null,
    size: item.size ? parseInt(item.size) : null,
    time: item.time || 0,
    dstatus: item.dstatus || '',
    rstatus: item.rstatus || null
  }));
}
