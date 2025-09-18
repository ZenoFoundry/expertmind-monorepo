import { useEffect, useState } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tooltip,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { User, Profile } from '@/types';
import { userService } from '@/services/userService';
import { profileService } from '@/services/profileService';
import { formatDate, formatRelativeTime, getStatusColor, getStatusText } from '@/utils/helpers';

const { Title, Text } = Typography;

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, profilesData] = await Promise.all([
        userService.getUsers(),
        profileService.getProfiles()
      ]);
      setUsers(usersData);
      setProfiles(profilesData);
    } catch (error) {
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      profileId: user.profileId,
      isActive: user.isActive
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.deleteUser(id);
      message.success('Usuario eliminado correctamente');
      await loadData();
    } catch (error) {
      message.error('Error al eliminar el usuario');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userService.toggleUserStatus(user.id);
      message.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
      await loadData();
    } catch (error) {
      message.error('Error al cambiar el estado del usuario');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const selectedProfile = profiles.find(p => p.id === values.profileId);
      const userData = {
        ...values,
        profileName: selectedProfile?.name || ''
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        message.success('Usuario actualizado correctamente');
      } else {
        await userService.createUser({
          ...userData,
          lastLogin: undefined
        });
        message.success('Usuario creado correctamente');
      }

      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Error al guardar el usuario');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase()) ||
    user.profileName.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Usuario',
      key: 'user',
      render: (record: User) => (
        <Space>
          <UserOutlined style={{ color: '#1677ff' }} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Perfil',
      dataIndex: 'profileName',
      key: 'profileName',
      render: (profileName: string) => (
        <Tag color="blue">{profileName}</Tag>
      )
    },
    {
      title: 'Último Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (
        <Tooltip title={date ? formatDate(date) : 'Nunca se ha conectado'}>
          <Text type="secondary">
            {date ? formatRelativeTime(date) : 'Nunca'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Tooltip title={formatDate(date)}>
          <Text type="secondary">
            {formatRelativeTime(date)}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Estado',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={getStatusColor(isActive)}>
          {getStatusText(isActive)}
        </Tag>
      )
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (record: User) => (
        <Space size="small">
          <Tooltip title="Editar usuario">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.isActive ? 'Desactivar' : 'Activar'}>
            <Popconfirm
              title={`¿Está seguro de ${record.isActive ? 'desactivar' : 'activar'} este usuario?`}
              onConfirm={() => handleToggleStatus(record)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                size="small"
                type={record.isActive ? 'default' : 'primary'}
              >
                {record.isActive ? 'Desactivar' : 'Activar'}
              </Button>
            </Popconfirm>
          </Tooltip>

          <Tooltip title="Eliminar usuario">
            <Popconfirm
              title="¿Está seguro de eliminar este usuario?"
              description="Esta acción no se puede deshacer."
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Gestión de Usuarios
            </Title>
            <Text type="secondary">
              Administra los usuarios del sistema
            </Text>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar usuarios..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
              >
                Actualizar
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Nuevo Usuario
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} usuarios`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre completo"
                rules={[
                  { required: true, message: 'Por favor ingrese el nombre' }
                ]}
              >
                <Input placeholder="Juan Pérez" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Correo electrónico"
                rules={[
                  { required: true, message: 'Por favor ingrese el email' },
                  { type: 'email', message: 'Email inválido' }
                ]}
              >
                <Input placeholder="juan.perez@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="profileId"
            label="Perfil"
            rules={[
              { required: true, message: 'Por favor seleccione un perfil' }
            ]}
          >
            <Select
              placeholder="Seleccionar perfil"
              options={profiles
                .filter(profile => profile.isActive)
                .map(profile => ({
                  value: profile.id,
                  label: (
                    <div>
                      <Text strong>{profile.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {profile.llmProvider.toUpperCase()} - {profile.tokensAllowed.toLocaleString()} tokens
                      </Text>
                    </div>
                  )
                }))}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Estado"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Actualizar' : 'Crear'} Usuario
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
