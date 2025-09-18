import { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Spin, 
  Alert,
  Table,
  Tag,
  Space
} from 'antd';
import { 
  UserOutlined, 
  ProfileOutlined, 
  SettingOutlined,
  TrophyOutlined,
  FireOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '@/services/dashboardService';
import { userService } from '@/services/userService';
import { profileService } from '@/services/profileService';
import { DashboardStats, User, Profile } from '@/types';
import { formatNumber, formatRelativeTime } from '@/utils/helpers';

const { Title, Text } = Typography;

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [activeProfiles, setActiveProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        dashboardStats,
        userActivity,
        profileUsage,
        users,
        profiles
      ] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getUserActivityData(),
        dashboardService.getProfileUsageData(),
        userService.getUsers(),
        profileService.getActiveProfiles()
      ]);

      setStats(dashboardStats);
      setActivityData(userActivity);
      setProfileData(profileUsage);
      
      // Get recent users (last 5 active users)
      const sortedUsers = users
        .filter(user => user.isActive)
        .sort((a, b) => new Date(b.lastLogin || b.createdAt).getTime() - new Date(a.lastLogin || a.createdAt).getTime())
        .slice(0, 5);
      
      setRecentUsers(sortedUsers);
      setActiveProfiles(profiles.slice(0, 5));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <button onClick={loadDashboardData}>
            Reintentar
          </button>
        }
      />
    );
  }

  const userColumns = [
    {
      title: 'Usuario',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <Space>
          <Text strong>{text}</Text>
          <Tag color="blue">{record.profileName}</Tag>
        </Space>
      )
    },
    {
      title: 'Último Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? formatRelativeTime(date) : 'Nunca'
    }
  ];

  const profileColumns = [
    {
      title: 'Perfil',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Proveedor LLM',
      dataIndex: 'llmProvider',
      key: 'llmProvider',
      render: (provider: string) => {
        const colors = { openai: 'green', anthropic: 'blue', local: 'orange' };
        return <Tag color={colors[provider as keyof typeof colors]}>{provider.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Tokens',
      dataIndex: 'tokensAllowed',
      key: 'tokensAllowed',
      render: (tokens: number) => formatNumber(tokens)
    }
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Usuarios"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
            <Text type="secondary">
              +{stats?.recentActivity.users || 0} esta semana
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Perfiles Activos"
              value={stats?.totalProfiles || 0}
              prefix={<ProfileOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Text type="secondary">
              +{stats?.recentActivity.profiles || 0} este mes
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Configuraciones MCP"
              value={stats?.totalMCPs || 0}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <Text type="secondary">
              +{stats?.recentActivity.mcps || 0} nuevas
            </Text>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Más Conectado"
              value={stats?.mostConnectedUser.connections || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              suffix="sesiones"
            />
            <Text type="secondary">
              {stats?.mostConnectedUser.name}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Top User Tokens */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <FireOutlined style={{ fontSize: 20, color: '#ff4d4f', marginRight: 8 }} />
              <Title level={4} style={{ margin: 0 }}>
                Usuario con Más Tokens Utilizados
              </Title>
            </div>
            <Row>
              <Col span={12}>
                <Statistic
                  title={stats?.topTokenUser.name}
                  value={stats?.topTokenUser.tokens || 0}
                  suffix="tokens"
                  valueStyle={{ color: '#ff4d4f', fontSize: 32 }}
                />
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary">Esta semana</Text>
                  <br />
                  <Text style={{ fontSize: 16, color: '#52c41a' }}>
                    <RiseOutlined /> +12.5% vs semana anterior
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card title="Actividad de Usuarios y Tokens (Última Semana)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="users" orientation="left" />
                <YAxis yAxisId="tokens" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'users' ? `${value} usuarios` : `${formatNumber(value)} tokens`,
                    name === 'users' ? 'Usuarios Activos' : 'Tokens Utilizados'
                  ]}
                />
                <Line 
                  yAxisId="users"
                  type="monotone" 
                  dataKey="users" 
                  stroke="#1677ff" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="tokens"
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Uso por Perfiles">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={profileData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {profileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Uso']}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Usuarios Recientes" 
            extra={
              <Text type="secondary">
                Últimos usuarios activos
              </Text>
            }
          >
            <Table
              dataSource={recentUsers}
              columns={userColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="Perfiles Activos"
            extra={
              <Text type="secondary">
                Configuraciones principales
              </Text>
            }
          >
            <Table
              dataSource={activeProfiles}
              columns={profileColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
