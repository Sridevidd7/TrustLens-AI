const API_BASE = import.meta.env.VITE_API_BASE || ''

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {
  getHealth: () => request('/health'),
  getDashboard: () => request('/dashboard'),
  getRecommendations: () => request('/recommendations'),
  getRecommendation: (id) => request(`/recommendations/${id}`),
  getExplanation: (id) => request(`/recommendations/${id}/explanation`),
  getAlternatives: (id) => request(`/recommendations/${id}/alternatives`),
  getSimulate: (id) => request(`/recommendations/${id}/simulate`),
  getAgentFlow: (id) => request(`/recommendations/${id}/agent-flow`),
  postDecision: (id, payload) => request(`/recommendations/${id}/decision`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  postEscalate: (id, payload) => request(`/recommendations/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getAudit: () => request('/audit'),
  getAutonomy: () => request('/settings/autonomy'),
  setAutonomy: (autonomy) => request('/settings/autonomy', {
    method: 'POST',
    body: JSON.stringify({ autonomy }),
  }),
  getIncidents: () => request('/incidents'),
  getUsability: () => request('/usability'),
}
