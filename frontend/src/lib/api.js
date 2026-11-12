const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal API fetch client with automatic Bearer token injection
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, token = null, params = null } = {}) {
  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  const storedToken = token || localStorage.getItem('medicore_auth_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.details = data;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`[API Error: ${method} ${endpoint}]`, error);
    throw error;
  }
}

// Grouped API Services
export const doctorApi = {
  list: (params) => apiRequest('/doctors', { params }),
  getById: (id) => apiRequest(`/doctors/${id}`),
  updateSchedule: (id, schedule) => apiRequest(`/doctors/${id}/schedule`, { method: 'PUT', body: { schedule } })
};

export const appointmentApi = {
  list: () => apiRequest('/appointments'),
  create: (data) => apiRequest('/appointments', { method: 'POST', body: data }),
  updateStatus: (id, status, notes = '') =>
    apiRequest(`/appointments/${id}/status`, { method: 'PATCH', body: { status, notes } })
};

export const prescriptionApi = {
  list: () => apiRequest('/prescriptions'),
  create: (data) => apiRequest('/prescriptions', { method: 'POST', body: data })
};

export const documentApi = {
  list: (patientId = null) => apiRequest('/documents', { params: patientId ? { patient_id: patientId } : {} }),
  requestUploadUrl: (data) => apiRequest('/documents/upload', { method: 'POST', body: data })
};

export const adminApi = {
  getStats: () => apiRequest('/admin/stats'),
  verifyDoctor: (id, is_verified) => apiRequest(`/admin/doctors/${id}/verify`, { method: 'PATCH', body: { is_verified } }),
  getAuditLogs: () => apiRequest('/admin/audit-logs')
};

export const authApi = {
  sync: (profileData) => apiRequest('/auth/sync', { method: 'POST', body: profileData }),
  getMe: () => apiRequest('/auth/me')
};
