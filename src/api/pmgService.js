async function request(path, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });


  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Unknown error');
  return data;
}

/**
 * Fetch all quarantined emails
 */
export async function fetchQuarantineData() {
  const res = await request('/pmg/quarantine/all');
  return res.data.map(item => ({
    id: item.id,
    sender: item.from,
    receiver: item.receiver,
    reason: item.reason,
    time: item.time,
    size: item.bytes || item.size || 0,
  }));
}

/**
 * Perform an action on a quarantined email
 * @param {string} id 
 * @param {'deliver' | 'delete'} type 
 */
export async function quarantineAction(id, type) {
  return request(`/pmg/quarantine/${id}/${type}`, {
    method: 'POST',
  });
}
