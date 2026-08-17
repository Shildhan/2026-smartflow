import {
  IRoad,
  IJunction,
  ITrafficDataPoint,
  ISimulationResult,
  IAlert,
  IRouteAlternative,
  IUser,
  IAIRecommendation,
  IPasswordResetToken,
  PeakHourType,
} from '../types';
import {
  initialUsers,
  initialRoads,
  initialJunctions,
  initialPeakHourData,
  initialAlerts,
  initialRouteAlternatives,
} from '../simulationEngine/seedData';
import { AIRecommendationEngine } from '../simulationEngine/aiRecommender';

class InMemStore {
  private users: IUser[] = [];
  private roads: IRoad[] = [];
  private junctions: IJunction[] = [];
  private peakHourData: Record<PeakHourType, ITrafficDataPoint[]> = { morning: [], evening: [] };
  private alerts: IAlert[] = [];
  private routeAlternatives: IRouteAlternative[] = [];
  private simulations: ISimulationResult[] = [];
  private recommendations: IAIRecommendation[] = [];
  private passwordResetTokens: IPasswordResetToken[] = [];

  constructor() {
    this.resetToSeedData();
  }

  public resetToSeedData() {
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.roads = JSON.parse(JSON.stringify(initialRoads));
    this.junctions = JSON.parse(JSON.stringify(initialJunctions));
    this.peakHourData = JSON.parse(JSON.stringify(initialPeakHourData));
    this.alerts = JSON.parse(JSON.stringify(initialAlerts));
    this.routeAlternatives = JSON.parse(JSON.stringify(initialRouteAlternatives));
    this.simulations = [];
    this.passwordResetTokens = [];
    this.refreshRecommendations();
    console.log('[SmartFlow DataStore] Seed data initialized: 24 roads, 12 junctions, 6 zones, official users.');
  }

  // Users
  public getUsers(): IUser[] {
    return this.users;
  }
  public findUserByEmail(email: string): IUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  public findUserById(id: string): IUser | undefined {
    return this.users.find((u) => u.id === id);
  }
  public addUser(user: IUser): IUser {
    this.users.push(user);
    return user;
  }
  public updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    return true;
  }

  // Password Reset Tokens
  public addPasswordResetToken(tokenData: IPasswordResetToken): IPasswordResetToken {
    this.passwordResetTokens.push(tokenData);
    return tokenData;
  }
  public findPasswordResetToken(tokenHash: string): IPasswordResetToken | undefined {
    return this.passwordResetTokens.find((t) => t.tokenHash === tokenHash);
  }
  public invalidateResetTokensForUser(userId: string): void {
    const now = new Date();
    this.passwordResetTokens.forEach((t) => {
      if (t.userId === userId && !t.usedAt) {
        t.usedAt = now;
      }
    });
  }
  public markResetTokenUsed(tokenHash: string): boolean {
    const token = this.findPasswordResetToken(tokenHash);
    if (!token) return false;
    token.usedAt = new Date();
    return true;
  }

  // Roads
  public getRoads(): IRoad[] {
    return this.roads;
  }
  public getRoadById(id: string): IRoad | undefined {
    return this.roads.find((r) => r.id === id);
  }
  public updateRoad(id: string, updates: Partial<IRoad>): IRoad | undefined {
    const road = this.getRoadById(id);
    if (!road) return undefined;
    Object.assign(road, updates);
    this.refreshRecommendations();
    return road;
  }

  // Junctions
  public getJunctions(): IJunction[] {
    return this.junctions;
  }
  public getJunctionById(id: string): IJunction | undefined {
    return this.junctions.find((j) => j.id === id);
  }
  public updateJunction(id: string, updates: Partial<IJunction>): IJunction | undefined {
    const junction = this.getJunctionById(id);
    if (!junction) return undefined;
    Object.assign(junction, updates);
    this.refreshRecommendations();
    return junction;
  }

  // Peak Hour Data
  public getPeakHourData(peak: PeakHourType): ITrafficDataPoint[] {
    return this.peakHourData[peak] || this.peakHourData.morning;
  }

  // Alerts
  public getAlerts(): IAlert[] {
    return this.alerts;
  }
  public addAlert(alert: IAlert): IAlert {
    this.alerts.unshift(alert);
    return alert;
  }
  public markAlertRead(id: string): boolean {
    const alert = this.alerts.find((a) => a.id === id);
    if (alert) {
      alert.isRead = true;
      return true;
    }
    return false;
  }

  // Route Alternatives
  public getRouteAlternatives(): IRouteAlternative[] {
    return this.routeAlternatives;
  }
  public applyRouteDiversion(id: string): IRouteAlternative | undefined {
    const routeAlt = this.routeAlternatives.find((r) => r.id === id);
    if (!routeAlt) return undefined;
    routeAlt.strategyApplied = true;

    // Apply diversion effect on the specific road
    if (routeAlt.currentRoute.roadCodes.length > 0) {
      const code = routeAlt.currentRoute.roadCodes[0];
      const congestedRoad = this.roads.find((r) => r.code === code);
      if (congestedRoad) {
        congestedRoad.utilizationPct = Math.max(50, congestedRoad.utilizationPct - 25);
        congestedRoad.currentTrafficVeh = Math.round(congestedRoad.currentTrafficVeh * 0.75);
        congestedRoad.averageSpeedKmh = Math.round(congestedRoad.averageSpeedKmh * 1.35);
        congestedRoad.congestionLevel = congestedRoad.utilizationPct > 75 ? 'heavy' : 'moderate';
      }
    }

    this.addAlert({
      id: `alt-div-${Date.now()}`,
      type: 'success',
      title: `Diversion Strategy Applied: ${routeAlt.sourceName} → ${routeAlt.destinationName}`,
      message: `Reallocated ${routeAlt.diversionPercentage}% flow from congested corridor to recommended alternative. Estimated ${routeAlt.recommendedRoute.timeSavedMin} min travel time reduction.`,
      location: routeAlt.sourceName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    });

    this.refreshRecommendations();
    return routeAlt;
  }

  // Simulations
  public getSimulations(): ISimulationResult[] {
    return this.simulations;
  }
  public getSimulationById(id: string): ISimulationResult | undefined {
    return this.simulations.find((s) => s.simulationId === id);
  }
  public saveSimulation(result: ISimulationResult): ISimulationResult {
    this.simulations.unshift(result);
    return result;
  }
  public deleteSimulation(id: string): boolean {
    const initialLen = this.simulations.length;
    this.simulations = this.simulations.filter((s) => s.simulationId !== id);
    return this.simulations.length < initialLen;
  }

  // AI Recommendations
  public refreshRecommendations(): IAIRecommendation[] {
    this.recommendations = AIRecommendationEngine.generateRecommendations(this.roads, this.junctions);
    return this.recommendations;
  }
  public getRecommendations(): IAIRecommendation[] {
    if (this.recommendations.length === 0) {
      this.refreshRecommendations();
    }
    return this.recommendations;
  }
  public applyRecommendation(id: string): IAIRecommendation | undefined {
    const rec = this.recommendations.find((r) => r.id === id);
    if (!rec) return undefined;
    rec.applied = true;

    // Apply action
    if (rec.targetType === 'junction') {
      const junction = this.getJunctionById(rec.targetId);
      if (junction) {
        junction.greenDurationSec = Math.min(80, junction.greenDurationSec + 15);
        junction.redDurationSec = Math.max(30, junction.redDurationSec - 15);
        junction.queueLengthVeh = Math.round(junction.queueLengthVeh * 0.6);
        junction.averageWaitingTimeSec = Math.round(junction.averageWaitingTimeSec * 0.65);
        junction.isAdaptive = true;
      }
    } else if (rec.targetType === 'road') {
      const road = this.getRoadById(rec.targetId);
      if (road) {
        road.utilizationPct = Math.max(55, road.utilizationPct - 22);
        road.currentTrafficVeh = Math.round(road.currentTrafficVeh * 0.78);
        road.averageSpeedKmh = Math.round(road.averageSpeedKmh * 1.3);
        road.congestionLevel = 'moderate';
      }
    }

    this.addAlert({
      id: `alt-rec-${Date.now()}`,
      type: 'success',
      title: `AI Recommendation Executed: ${rec.title}`,
      message: `${rec.recommendedStrategy} activated on ${rec.targetName}. Projected outcome: ${rec.projectedImprovement}`,
      location: rec.targetName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    });

    return rec;
  }
}

export const dataStore = new InMemStore();
