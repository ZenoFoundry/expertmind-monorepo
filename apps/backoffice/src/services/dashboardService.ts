import { DashboardStats } from '@/types';

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock dashboard statistics
    const stats: DashboardStats = {
      totalUsers: 245,
      totalProfiles: 12,
      totalMCPs: 8,
      mostConnectedUser: {
        name: 'Ana García',
        connections: 1547
      },
      topTokenUser: {
        name: 'Carlos Rodríguez',
        tokens: 89420
      },
      recentActivity: {
        users: 23,
        profiles: 3,
        mcps: 1
      }
    };

    return stats;
  }

  async getUserActivityData() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return [
      { name: 'Lun', users: 120, tokens: 15000 },
      { name: 'Mar', users: 132, tokens: 18000 },
      { name: 'Mié', users: 98, tokens: 12000 },
      { name: 'Jue', users: 145, tokens: 22000 },
      { name: 'Vie', users: 167, tokens: 28000 },
      { name: 'Sáb', users: 89, tokens: 8000 },
      { name: 'Dom', users: 76, tokens: 6000 },
    ];
  }

  async getProfileUsageData() {
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      { name: 'Chat Assistant', value: 45, color: '#8884d8' },
      { name: 'Code Helper', value: 25, color: '#82ca9d' },
      { name: 'Content Writer', value: 15, color: '#ffc658' },
      { name: 'Data Analyst', value: 10, color: '#ff7300' },
      { name: 'Others', value: 5, color: '#00ff00' },
    ];
  }
}

export const dashboardService = new DashboardService();
