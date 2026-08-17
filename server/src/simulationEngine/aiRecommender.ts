import { IRoad, IJunction, IAIRecommendation } from '../types';

export class AIRecommendationEngine {
  public static generateRecommendations(roads: IRoad[], junctions: IJunction[]): IAIRecommendation[] {
    const recommendations: IAIRecommendation[] = [];

    // 1. Identify critically congested arterial roads
    const severeRoads = roads.filter((r) => r.utilizationPct >= 88);
    const underutilizedBypasses = roads.filter((r) => r.utilizationPct <= 42);

    severeRoads.forEach((road) => {
      // Find suitable bypass candidate
      const bypass = underutilizedBypasses.find((b) => b.zone !== road.zone || b.lanes >= 4) || underutilizedBypasses[0];

      if (bypass) {
        recommendations.push({
          id: `rec-div-${road.id}`,
          priority: 'critical',
          title: `Dynamic Route Diversion: ${road.name}`,
          description: `${road.name} (${road.code}) is operating at ${road.utilizationPct}% capacity with average speed ${road.averageSpeedKmh} km/h. Divert approximately 25%–35% of traffic toward ${bypass.name} (${bypass.code}), which currently operates at only ${bypass.utilizationPct}% utilization.`,
          targetType: 'road',
          targetId: road.id,
          targetName: road.name,
          recommendedStrategy: 'Dynamic Traffic Diversion',
          projectedImprovement: 'Estimated +38% speed increase and 6.5 min delay reduction.',
          confidencePct: 94,
          applied: false,
        });
      }
    });

    // 2. Identify severely congested junctions with high waiting times
    const bottleneckJunctions = junctions.filter((j) => j.queueLengthVeh > 60 || j.averageWaitingTimeSec > 60);

    bottleneckJunctions.forEach((junction) => {
      const extraSec = Math.min(25, Math.max(10, Math.round(junction.queueLengthVeh * 0.25)));
      recommendations.push({
        id: `rec-junc-${junction.id}`,
        priority: junction.queueLengthVeh > 80 ? 'critical' : 'high',
        title: `Adaptive Signal Cycle Optimization at ${junction.name}`,
        description: `${junction.name} (${junction.code}) has a queue backlog of ${junction.queueLengthVeh} vehicles with average waiting time of ${junction.averageWaitingTimeSec}s. Increase green-light split by +${extraSec} seconds on peak influx corridors and synchronize upstream clearance.`,
        targetType: 'junction',
        targetId: junction.id,
        targetName: junction.name,
        recommendedStrategy: 'Adaptive Traffic Signals',
        projectedImprovement: `Projected queue reduction by 42% and delay drop from ${junction.averageWaitingTimeSec}s to ${Math.round(junction.averageWaitingTimeSec * 0.58)}s.`,
        confidencePct: 91,
        applied: false,
      });
    });

    // 3. Zone Level recommendations for underutilized corridors
    underutilizedBypasses.forEach((road) => {
      recommendations.push({
        id: `rec-under-${road.id}`,
        priority: 'medium',
        title: `Corridor Utilization Advisory: ${road.name}`,
        description: `${road.name} in ${road.zoneName} has low utilization (${road.utilizationPct}%, ${road.currentTrafficVeh} veh/hr). Activate Variable Message Signs (VMS) on adjacent arterial entries to channel excess commuter flow into this high-capacity corridor.`,
        targetType: 'corridor',
        targetId: road.id,
        targetName: road.name,
        recommendedStrategy: 'Alternate Route Assignment',
        projectedImprovement: 'Can absorb up to 1,400 additional vehicles/hr without degrading level of service.',
        confidencePct: 88,
        applied: false,
      });
    });

    // 4. Public Transit Priority recommendations
    const heavyTransitCorridors = roads.filter((r) => r.utilizationPct > 80 && (r.zone === 'Zone A' || r.zone === 'Zone B'));
    if (heavyTransitCorridors.length > 0) {
      recommendations.push({
        id: 'rec-transit-priority',
        priority: 'high',
        title: 'Public Transit Dedicated Signal Corridor',
        description: 'Heavy commuter density detected between Central Business District (Zone A) and Tech Park Corridor (Zone B). Prioritize transit signal preemption for BRTS/City buses to increase overall passenger throughput by 30%.',
        targetType: 'zone',
        targetId: 'Zone A-B',
        targetName: 'CBD - Tech Park Transit Link',
        recommendedStrategy: 'Public Transport Priority',
        projectedImprovement: 'Anticipated 12% shift from private vehicles to public transit, reducing peak load.',
        confidencePct: 86,
        applied: false,
      });
    }

    return recommendations;
  }
}
