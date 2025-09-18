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
  Col,
  InputNumber,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ProfileOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { Profile, MCPConfig } from '@/types';
import { profileService } from '@/services/profileService';
import { mcpService } from '@/services/mcpService';
import { 
  formatDate, 
  formatRelativeTime, 
  getStatusColor, 
  getStatusText, 
  getLLMProviderName,
  formatNumber 
} from '@/utils/helpers';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ProfilesPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mcpConfigs, setMcpConfigs] = useState<MCPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profilesData, mcpData] = await Promise.all([
        profileService.getProfiles(),
        mcpService.getMCPConfigs()
      ]);
      setProfiles(profilesData);
      setMcpConfigs(mcpData);
    } catch (error) {
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProfile(null);
    form.resetFields();
    form.setFieldsValue({
      llmProvider: 'openai',
      tokensAllowed: 100000,
      isActive: true
    });
    setModalVisible(true);
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    form.setFieldsValue({
      name: profile.name,
      systemPrompt: profile.systemPrompt,
      contextData: profile.contextData,
      apiKey: profile.apiKey,
      llmProvider: profile.llmProvider,
      tokensAllowed: profile.tokensAllowed,
      mcpConfigs: profile.mcpConfigs,
      isActive: profile.isActive
    });
    setModalVisible(true);
  };

  const handleView = (profile: Profile) => {
    setViewingProfile(profile);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await profileService.deleteProfile(id);
      message.success('Perfil eliminado correctamente');
      await loadData();
    } catch (error) {
      message.error('Error al eliminar el perfil');
    }
  };

  const handleToggleStatus = async (profile: Profile) => {
    try {
      await profileService.toggleProfileStatus(profile.id);
      message.success(`Perfil ${profile.isActive ? 'desactivado' : 'activado'} correctamente`);
      await loadData();
    } catch (error) {
      message.error('Error al cambiar el estado del perfil');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProfile) {
        await profileService.updateProfile(editingProfile.id, values);
        message.success('Perfil actualizado correctamente');
      } else {
        await profileService.createProfile(values);
        message.success('Perfil creado correctamente');
      }

      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Error al guardar el perfil');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchText.toLowerCase()) ||
    profile.llmProvider.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Perfil',
      key: 'profile',
      render: (record: Profile) => (
        <Space>
          <ProfileOutlined style={{ color: '#1677ff' }} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.systemPrompt.substring(0, 60)}...
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Proveedor LLM',
      dataIndex: 'llmProvider',
      key: 'llmProvider',
      render: (provider: string) => {
        const colors = { openai: 'green', anthropic: 'blue', local: 'orange' };
        return (
          <Tag color={colors[provider as keyof typeof colors]}>
            {getLLMProviderName(provider)}
          </Tag>
        );
      }
    },
    {
      title: 'Tokens Permitidos',
      dataIndex: 'tokensAllowed',
      key: 'tokensAllowed',
      render: (tokens: number) => (
        <Text>{formatNumber(tokens)}</Text>
      ),
      sorter: (a: Profile, b: Profile) => a.tokensAllowed - b.tokensAllowed
    },
    {
      title: 'MCPs Configurados',
      dataIndex: 'mcpConfigs',
      key: 'mcpConfigs',
      render: (mcps: string[]) => (
        <Text>{mcps.length} configuraciones</Text>
      )
    },
    {
      title: 'Fecha de Creación',
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
      render: (record: Profile) => (
        <Space size="small">
          <Tooltip title="Ver detalles">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>

          <Tooltip title="Editar perfil">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.isActive ? 'Desactivar' : 'Activar'}>
            <Popconfirm
              title={`¿Está seguro de ${record.isActive ? 'desactivar' : 'activar'} este perfil?`}
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

          <Tooltip title="Eliminar perfil">
            <Popconfirm
              title="¿Está seguro de eliminar este perfil?"
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
              Gestión de Perfiles
            </Title>
            <Text type="secondary">
              Configura los perfiles de IA y sus parámetros
            </Text>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar perfiles..."
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
                Nuevo Perfil
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          dataSource={filteredProfiles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} perfiles`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProfile ? 'Editar Perfil' : 'Nuevo Perfil'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
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
                label="Nombre del Perfil"
                rules={[
                  { required: true, message: 'Por favor ingrese el nombre' }
                ]}
              >
                <Input placeholder="Chat Assistant" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="llmProvider"
                label="Proveedor LLM"
                rules={[
                  { required: true, message: 'Por favor seleccione un proveedor' }
                ]}
              >
                <Select
                  placeholder="Seleccionar proveedor"
                  options={[
                    { value: 'openai', label: 'OpenAI' },
                    { value: 'anthropic', label: 'Anthropic' },
                    { value: 'local', label: 'Local (Ollama)' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="systemPrompt"
            label="Prompt del Sistema"
            rules={[
              { required: true, message: 'Por favor ingrese el prompt del sistema' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Eres un asistente especializado en..."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item
            name="contextData"
            label="Datos de Contexto"
            rules={[
              { required: true, message: 'Por favor ingrese los datos de contexto' }
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Información adicional, preferencias del usuario, configuraciones específicas..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="apiKey"
                label="API Key"
                rules={[
                  { required: true, message: 'Por favor ingrese la API Key' }
                ]}
              >
                <Input.Password placeholder="sk-*********************" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tokensAllowed"
                label="Tokens Permitidos"
                rules={[
                  { required: true, message: 'Por favor ingrese el límite de tokens' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1000}
                  max={1000000}
                  step={1000}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="mcpConfigs"
            label="Configuraciones MCP"
          >
            <Select
              mode="multiple"
              placeholder="Seleccionar configuraciones MCP"
              options={mcpConfigs
                .filter(mcp => mcp.isActive)
                .map(mcp => ({
                  value: mcp.id,
                  label: (
                    <div>
                      <Text strong>{mcp.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {mcp.description}
                      </Text>
                    </div>
                  )
                }))}
            />
          </Form.Item>

          <Divider />

          <Form.Item
            name="isActive"
            label="Estado"
            valuePropName="checked"
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
                {editingProfile ? 'Actualizar' : 'Crear'} Perfil
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Detalles del Perfil: ${viewingProfile?.name}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {viewingProfile && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Nombre:</Text>
                <br />
                <Text>{viewingProfile.name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Proveedor LLM:</Text>
                <br />
                <Tag color="blue">{getLLMProviderName(viewingProfile.llmProvider)}</Tag>
              </Col>
            </Row>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Prompt del Sistema:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {viewingProfile.systemPrompt}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Datos de Contexto:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6,
                whiteSpace: 'pre-wrap'
              }}>
                {viewingProfile.contextData}
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Tokens Permitidos:</Text>
                <br />
                <Text>{formatNumber(viewingProfile.tokensAllowed)}</Text>
              </Col>
              <Col span={8}>
                <Text strong>MCPs Configurados:</Text>
                <br />
                <Text>{viewingProfile.mcpConfigs.length} configuraciones</Text>
              </Col>
              <Col span={8}>
                <Text strong>Estado:</Text>
                <br />
                <Tag color={getStatusColor(viewingProfile.isActive)}>
                  {getStatusText(viewingProfile.isActive)}
                </Tag>
              </Col>
            </Row>

            <Divider />

            <div>
              <Text strong>Configuraciones MCP Asociadas:</Text>
              <div style={{ marginTop: 8 }}>
                {viewingProfile.mcpConfigs.map(mcpId => {
                  const mcp = mcpConfigs.find(m => m.id === mcpId);
                  return mcp ? (
                    <Tag key={mcpId} color="blue" style={{ marginBottom: 4 }}>
                      {mcp.name}
                    </Tag>
                  ) : null;
                })}
                {viewingProfile.mcpConfigs.length === 0 && (
                  <Text type="secondary">No hay configuraciones MCP asignadas</Text>
                )}
              </div>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Fecha de Creación:</Text>
                <br />
                <Text type="secondary">{formatDate(viewingProfile.createdAt)}</Text>
              </Col>
              <Col span={12}>
                <Text strong>API Key:</Text>
                <br />
                <Text code>
                  {viewingProfile.apiKey.substring(0, 10)}...
                  {viewingProfile.apiKey.substring(viewingProfile.apiKey.length - 4)}
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};
