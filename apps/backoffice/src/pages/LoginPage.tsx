import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '@/types';

const { Title, Text } = Typography;

export const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      await login(values);
      message.success('¡Bienvenido al backoffice de ExpertMind!');
      // Forzar navegación al dashboard
      navigate('/', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            background: '#1677ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 24,
            color: 'white'
          }}>
            <LoginOutlined />
          </div>
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            ExpertMind
          </Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Backoffice Administration
          </Text>
        </div>

        {error && (
          <Alert
            message="Error de autenticación"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Usuario"
            rules={[
              { required: true, message: 'Por favor ingresa tu usuario' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nombre de usuario"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: true, message: 'Por favor ingresa tu contraseña' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48, fontSize: 16 }}
              icon={<LoginOutlined />}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          marginTop: 24, 
          padding: 16, 
          background: '#f5f5f5', 
          borderRadius: 8,
          fontSize: 12
        }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Credenciales de prueba:
          </Text>
          <Text code>admin / admin123</Text>
          <br />
          <Text code>operator / operator123</Text>
        </div>
      </Card>
    </div>
  );
};
