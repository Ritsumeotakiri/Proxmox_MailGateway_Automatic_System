const BASE_URL = 'http://localhost:3000/api/pmg';

// Generic API wrapper
async function apiRequest(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`[API ERROR] ${endpoint}:`, data);
    throw new Error(data.message || data.error || 'API request failed');
  }
  return data;
}

// Get all rules
export async function fetchRules() {
  const data = await apiRequest('/rules');
  return data.data || [];
}

// Create a new rule with raw condition as whatGroup
export async function createRule(data) {
  return apiRequest('/rules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}


// Delete a rule by ID
export async function deleteRule(id) {
  return apiRequest(`/rules/${id}`, { method: 'DELETE' });
}

// Update a rule by ID
export async function updateRule(id, payload) {
  return apiRequest(`/rules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// OPTIONAL: Fetch available action groups from backend
export async function fetchActionGroups() {
  const data = await apiRequest('/action/objects');
  return data.data || [];
}

// OPTIONAL: If you still want to support fetching what groups
export async function fetchWhatGroups() {
  const data = await apiRequest('/what');
  return data.data || [];
}

export async function fetchFromGroups() {
  return [
    { id: 1, name: "All Senders" },
    { id: 2, name: "Known Spammers" },
  ]; // PMG doesn't support GET for /from, so use static or preload
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
