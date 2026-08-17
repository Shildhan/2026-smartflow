import {
  IRoad,
  IJunction,
  ITrafficDataPoint,
  ISimulationConfig,
  ISimulationResult,
  IAlert,
  IRouteAlternative,
  IAIRecommendation,
  IZoneData,
  PeakHourType,
  IUser,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getHeaders = (extraHeaders?: Record<string, string>): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = localStorage.getItem('smartflow_token') || localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message?: string; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const res = await fetch(`${API_BASE}/auth/check-email?email=${encodeURIComponent(cleanEmail)}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: IUser; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }
    if (data.token) {
      localStorage.setItem('smartflow_token', data.token);
    }
    return data;
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    agency?: string;
  }): Promise<{ token: string; user: IUser; message: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    if (data.token) {
      localStorage.setItem('smartflow_token', data.token);
    }
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Unable to process request.');
    }
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reset password.');
    }
    return data;
  },

  async getCurrentUser(token?: string): Promise<{ user: IUser }> {
    const authToken = token || localStorage.getItem('smartflow_token') || localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Session expired.');
    }
    return data;
  },

  // Traffic
  async getDashboard(peak: PeakHourType = 'morning'): Promise<any> {
    const res = await fetch(`${API_BASE}/traffic/dashboard?peak=${peak}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  async getRoads(query?: { zone?: string; congestion?: string; minUtilization?: number }): Promise<{ roads: IRoad[]; total: number }> {
    const params = new URLSearchParams();
    if (query?.zone) params.append('zone', query.zone);
    if (query?.congestion) params.append('congestion', query.congestion);
    if (query?.minUtilization) params.append('minUtilization', query.minUtilization.toString());
    const res = await fetch(`${API_BASE}/traffic/roads?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch roads');
    return res.json();
  },

  async getRoadById(id: string): Promise<{ road: IRoad }> {
    const res = await fetch(`${API_BASE}/traffic/roads/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch road');
    return res.json();
  },

  async updateRoad(id: string, updates: Partial<IRoad>): Promise<{ road: IRoad; message: string }> {
    const res = await fetch(`${API_BASE}/traffic/roads/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update road');
    return res.json();
  },

  async getJunctions(): Promise<{ junctions: IJunction[]; total: number }> {
    const res = await fetch(`${API_BASE}/traffic/junctions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch junctions');
    return res.json();
  },

  async getJunctionById(id: string): Promise<{ junction: IJunction }> {
    const res = await fetch(`${API_BASE}/traffic/junctions/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch junction');
    return res.json();
  },

  async getPeakStats(peak: PeakHourType = 'morning'): Promise<{ peak: PeakHourType; timeSpan: string; dataPoints: ITrafficDataPoint[] }> {
    const res = await fetch(`${API_BASE}/traffic/peak-stats?peak=${peak}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch peak stats');
    return res.json();
  },

  async getZoneDistribution(): Promise<{
    zones: IZoneData[];
    congestedZones: IZoneData[];
    underutilizedZones: IZoneData[];
    giniCoefficient: number;
    imbalanceRating: string;
    recommendationSummary: string;
  }> {
    const res = await fetch(`${API_BASE}/traffic/zone-distribution`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch zone distribution');
    return res.json();
  },

  async resetDemoData(): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/traffic/reset-demo`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  // Simulation & Persistence
  async runSimulation(config: ISimulationConfig): Promise<{ message: string; result: ISimulationResult }> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  async getSimulationHistory(): Promise<{ simulations: any[]; total: number }> {
    const res = await fetch(`${API_BASE}/simulation/history`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch simulation history');
    return res.json();
  },

  async getSimulationById(id: string): Promise<{ simulation: ISimulationResult }> {
    const res = await fetch(`${API_BASE}/simulation/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch simulation');
    return res.json();
  },

  async deleteSimulation(id: string): Promise<{ message: string; success: boolean }> {
    const res = await fetch(`${API_BASE}/simulation/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete simulation');
    return res.json();
  },

  async applySimulation(simulationId: string): Promise<{ message: string; result: ISimulationResult }> {
    const res = await fetch(`${API_BASE}/simulation/apply/${simulationId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to apply simulation');
    return res.json();
  },

  // Junction Signal Timing
  async updateJunctionSignal(
    id: string,
    timings: { greenDurationSec: number; yellowDurationSec?: number; redDurationSec: number; isAdaptive?: boolean }
  ): Promise<{ junction: IJunction }> {
    const res = await fetch(`${API_BASE}/junctions/${id}/signal`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(timings),
    });
    if (!res.ok) throw new Error('Failed to update junction signal');
    return res.json();
  },

  async autoOptimizeJunction(id: string): Promise<{ junction: IJunction; improvement: any }> {
    const res = await fetch(`${API_BASE}/junctions/${id}/auto-optimize`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to optimize junction');
    return res.json();
  },

  // Route Optimization
  async getRouteAlternatives(): Promise<{ routes: IRouteAlternative[]; total: number }> {
    const res = await fetch(`${API_BASE}/routes/alternatives`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch routes');
    return res.json();
  },

  async applyRouteDiversion(id: string): Promise<{ message: string; route: IRouteAlternative }> {
    const res = await fetch(`${API_BASE}/routes/apply-diversion/${id}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to apply diversion');
    return res.json();
  },

  // AI Recommendations
  async getRecommendations(): Promise<{ recommendations: IAIRecommendation[]; total: number }> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  async applyRecommendation(id: string): Promise<{ message: string; recommendation: IAIRecommendation }> {
    const res = await fetch(`${API_BASE}/recommendations/apply/${id}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to apply recommendation');
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<{ alerts: IAlert[]; total: number; unreadCount: number }> {
    const res = await fetch(`${API_BASE}/alerts`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async markAlertRead(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark alert as read');
    return res.json();
  },

  // Reports
  async getReportData(peak: PeakHourType = 'morning', simulationId?: string): Promise<{ report: any }> {
    const params = new URLSearchParams({ peak });
    if (simulationId) params.append('simulationId', simulationId);
    const res = await fetch(`${API_BASE}/reports/generate?${params.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate report data');
    return res.json();
  },

  async getUserReports(): Promise<{ reports: any[]; total: number }> {
    const res = await fetch(`${API_BASE}/reports/user`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user reports');
    return res.json();
  },
};
