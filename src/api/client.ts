const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export const apiClient = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Only set Content-Type for non-FormData bodies
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'API request failed');
    }

    return response.json();
  },
};

export const authApi = {
  register: (data: { email: string; password: string; name: string; phone: string }) =>
    apiClient.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  loginWithEmail: (email: string, password: string) =>
    apiClient.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  forgotPassword: (phone: string) =>
    apiClient.request<{ message: string; otp: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  resetPassword: (phone: string, otp: string, new_password: string) =>
    apiClient.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, new_password }),
    }),
  sendOtp: (phone: string) =>
    apiClient.request<{ message: string; otp: string; challenge: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (phone: string, otp: string, challenge?: string) =>
    apiClient.request<{ token: string; user: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, challenge }),
    }),
  updateProfile: (data: any) =>
    apiClient.request<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  giveConsent: () =>
    apiClient.request<any>('/auth/consent', {
      method: 'POST',
    }),
  getMe: () => apiClient.request<any>('/auth/me'),
};

export const medicineApi = {
  getAll: () => apiClient.request<any[]>('/medicines'),
  getById: (id: string | number) => apiClient.request<any>(`/medicines/${id}`),
  getAlternatives: (id: string | number) => apiClient.request<any[]>(`/medicines/${id}/alternatives`),
  search: (query: string) => apiClient.request<any[]>(`/medicines/search?q=${encodeURIComponent(query)}`),
};

export const scanApi = {
  submitScan: (data: { barcode_data: string; scan_method: string }) =>
    apiClient.request<any>('/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getHistory: () => apiClient.request<any[]>('/scan/history'),
  getScanById: (id: string) => apiClient.request<any>(`/scan/${id}`),
  scanImage: (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.request<any>('/scan/image', {
      method: 'POST',
      body: formData,
    });
  },
};

export const communityApi = {
  getPosts: (medicineId?: number) =>
    apiClient.request<any[]>(`/community/posts${medicineId ? `?medicine_id=${medicineId}` : ''}`),
  createPost: (data: { title: string; body: string; tags?: string[]; medicine_id?: number }) =>
    apiClient.request<any>('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPostWithComments: (postId: string) => apiClient.request<any>(`/community/posts/${postId}`),
  getComments: (postId: string) => apiClient.request<any[]>(`/community/posts/${postId}/comments`),
  addComment: (postId: string, body: string, parentCommentId?: string) =>
    apiClient.request<any>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body, parent_comment_id: parentCommentId }),
    }),
};

export const experienceApi = {
  getPosts: (medicineId?: number) =>
    apiClient.request<any[]>(`/experiences${medicineId ? `?medicine_id=${medicineId}` : ''}`),
  createPost: (formData: FormData) =>
    apiClient.request<any>('/experiences', {
      method: 'POST',
      body: formData,
    }),
};

export const sessionApi = {
  book: (data: { medicine_id: number; host_user_id: string; scheduled_at: string; duration_min: number }) =>
    apiClient.request<any>('/experiences/sessions/book', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: () => apiClient.request<any[]>('/experiences/sessions'),
};

export const chatApi = {
  sendMessage: (data: { medicine_id?: number; message: string; session_id?: string }) =>
    apiClient.request<any>('/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSessions: () => apiClient.request<any[]>('/chat/sessions'),
};
