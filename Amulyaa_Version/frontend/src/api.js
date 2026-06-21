const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed: ${response.status}`);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  dashboard: () => request('/dashboard'),
  recommendations: () => request('/recommendations'),
  recommendation: (id) => request(`/recommendations/${id}`),
  explanation: (id) => request(`/recommendations/${id}/explanation`),
  alternatives: (id) => request(`/recommendations/${id}/alternatives`),
  simulate: (id) => request(`/recommendations/${id}/simulate`),
  agentFlow: (id) => request(`/recommendations/${id}/agent-flow`),
  decide: (id, payload) => request(`/recommendations/${id}/decision`, { method: 'POST', body: JSON.stringify(payload) }),
  escalate: (id, payload) => request(`/recommendations/${id}/escalate`, { method: 'POST', body: JSON.stringify(payload) }),
  audit: () => request('/audit'),
  autonomy: () => request('/settings/autonomy'),
  setAutonomy: (payload) => request('/settings/autonomy', { method: 'POST', body: JSON.stringify(payload) }),
  incidents: () => request('/incidents'),
  usability: () => request('/usability'),
};
