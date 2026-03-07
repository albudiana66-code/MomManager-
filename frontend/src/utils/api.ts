const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

class ApiClient {
  private baseUrl: string;
  private sessionToken: string | null = null;

  constructor() {
    this.baseUrl = BACKEND_URL;
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (this.sessionToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async exchangeSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Session exchange failed');
    return response.json();
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Meetings
  async getMeetings() {
    return this.request<any[]>('/meetings');
  }

  async createMeeting(data: any) {
    return this.request('/meetings', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMeeting(id: string, data: any) {
    return this.request(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMeeting(id: string) {
    return this.request(`/meetings/${id}`, { method: 'DELETE' });
  }

  // Checklists
  async getChecklists(date?: string) {
    const query = date ? `?date=${date}` : '';
    return this.request<any[]>(`/checklists${query}`);
  }

  async saveChecklist(data: any) {
    return this.request('/checklists', { method: 'POST', body: JSON.stringify(data) });
  }

  // Budgets
  async getBudgets(month?: string) {
    const query = month ? `?month=${month}` : '';
    return this.request<any[]>(`/budgets${query}`);
  }

  async saveBudget(data: any) {
    return this.request('/budgets', { method: 'POST', body: JSON.stringify(data) });
  }

  // Receipts
  async getReceipts() {
    return this.request<any[]>('/receipts');
  }

  async scanReceipt(imageBase64: string) {
    return this.request('/receipts/scan', {
      method: 'POST',
      body: JSON.stringify({ image_base64: imageBase64 }),
    });
  }

  async deleteReceipt(id: string) {
    return this.request(`/receipts/${id}`, { method: 'DELETE' });
  }

  // Meal Plans
  async getMealPlans() {
    return this.request<any[]>('/mealplans');
  }

  async generateMealPlan(preferences: any) {
    return this.request('/mealplans/generate', {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    });
  }

  async updateMealPlan(id: string, data: any) {
    return this.request(`/mealplans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMealPlan(id: string) {
    return this.request(`/mealplans/${id}`, { method: 'DELETE' });
  }

  // Kids
  async getKids() {
    return this.request<any[]>('/kids');
  }

  async createKid(data: any) {
    return this.request('/kids', { method: 'POST', body: JSON.stringify(data) });
  }

  async addActivity(kidId: string, data: any) {
    return this.request(`/kids/${kidId}/activities`, { method: 'POST', body: JSON.stringify(data) });
  }

  async addMilestone(kidId: string, data: any) {
    return this.request(`/kids/${kidId}/milestones`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMilestone(kidId: string, milestoneId: string, data: any) {
    return this.request(`/kids/${kidId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteKid(id: string) {
    return this.request(`/kids/${id}`, { method: 'DELETE' });
  }

  // Self-Care
  async getSelfCare() {
    return this.request<any>('/selfcare');
  }

  async generateNutritionPlan(data: any) {
    return this.request('/selfcare/nutrition/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateWorkout(data: any) {
    return this.request('/selfcare/workout/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkout(id: string) {
    return this.request(`/selfcare/workout/${id}`, { method: 'DELETE' });
  }

  // Stories
  async getStories() {
    return this.request<any[]>('/stories');
  }

  async generateStory(data: any) {
    return this.request('/stories/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteStory(id: string) {
    return this.request(`/stories/${id}`, { method: 'DELETE' });
  }

  // AI Workout (location-based)
  async generateWorkoutAI(data: any) {
    return this.request('/selfcare/workout-ai/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Physical Profile
  async savePhysicalProfile(profile: any) {
    return this.request('/selfcare/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Strength Meals AI
  async generateStrengthMeals(data: any) {
    return this.request('/selfcare/strength-meals/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Kitchen AI - Generate meals from image
  async generateMealsFromImage(imageBase64: string, language: string = 'ro') {
    return this.request('/kitchen/generate-meals-from-image', {
      method: 'POST',
      body: JSON.stringify({ image_base64: imageBase64, language }),
    });
  }

  // Kids - School Lunch Box
  async generateLunchBox(data: { kid_name: string; age_group: string; preferences?: string; allergies?: string; language?: string; days?: number }) {
    return this.request('/kids/lunchbox/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Calendar - AI Me-Time Suggestions
  async getMeTimeSuggestions(data: { date: string; meetings: any[]; language: string }) {
    return this.request('/calendar/me-time-suggestions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Chat
  async sendChatMessage(message: string, language: string, history: any[] = []) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history }),
    });
  }

  // Checklist helper
  async getChecklist(date: string) {
    const checklists = await this.getChecklists(date);
    return checklists.length > 0 ? checklists[0] : null;
  }
}

export const api = new ApiClient();
