async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`/api/pmg${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error(`[API ERROR] ${path}:`, data);
    throw new Error(data.message || data.error || 'Unknown error');
  }

  return data;
}

// ───── CRUD RULES ─────

export async function fetchRules() {
  const res = await request('/rules');
  return res.data || [];
}

export async function createRule(data) {
  return request('/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRule(id, payload) {
  return request(`/rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteRule(id) {
  return request(`/rules/${id}`, {
    method: 'DELETE',
  });
}

// ───── OPTIONAL STATIC FETCHERS ─────

export async function fetchActionGroups() {
  const res = await request('/action/objects');
  return res.data || [];
}

export async function fetchWhatGroups() {
  const res = await request('/what');
  return res.data || [];
}

export async function fetchFromGroups() {
  return [
    { id: 1, name: "All Senders" },
    { id: 2, name: "Known Spammers" },
  ];
}

export async function fetchToGroups() {
  return [
    { id: 1, name: "All Recipients" },
    { id: 2, name: "Internal Staff" },
  ];
}

export async function fetchWhenGroups() {
  return [
    { id: 1, name: "Always" },
    { id: 2, name: "Work Hours" },
  ];
}
