export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event('session-expired'))
    const error = new Error(data.error || 'Error de comunicación con la API'); error.status = response.status; throw error
  }
  return data
}
export const getSession = () => api('/auth/session')
export const login = (email, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
export const register = data => api('/auth/register', { method: 'POST', body: JSON.stringify(data) })
export const logout = () => api('/auth/logout', { method: 'POST' })
export const getDocuments = async (projectId, query = '') => (await api(`/projects/${projectId}/documents${query ? `?q=${encodeURIComponent(query)}` : ''}`)).map(doc => ({ ...doc, updated: String(doc.updatedAt).slice(0, 10), order: doc.sortOrder }))
export const getDocument = (projectId, slug) => api(`/projects/${projectId}/documents/${encodeURIComponent(slug)}`)
export const createDocument = (projectId, data) => api(`/projects/${projectId}/documents`, { method: 'POST', body: JSON.stringify(data) })
export const updateDocument = (projectId, id, data) => api(`/projects/${projectId}/documents/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteDocument = (projectId, id) => api(`/projects/${projectId}/documents/${id}`, { method: 'DELETE' })
export const getMembers = projectId => api(`/projects/${projectId}/members`)
export const saveMember = (projectId, data) => api(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify(data) })
export const updateMember = (projectId, userId, role) => api(`/projects/${projectId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify({ role }) })
export const deleteMember = (projectId, userId) => api(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
export const createProject = data => api('/projects', { method: 'POST', body: JSON.stringify(data) })
export const getAdminUsers = () => api('/admin/users')
export const updateAdminUser = (id, data) => api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const resetUserPassword = id => api(`/admin/users/${id}/reset-password`, { method: 'POST' })
export const getAdminProjects = () => api('/admin/projects')
export const updateAdminProject = (id, data) => api(`/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
