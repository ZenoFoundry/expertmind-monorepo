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
  Tabs,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { MCPConfig } from '@/types';
import { mcpService } from '@/services/mcpService';
import { 
  formatDate, 
  formatRelativeTime, 
  getStatusColor, 
  getStatusText, 
  getMCPTypeLabel,
  getMCPTypeColor
} from '@/utils/helpers';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const MCPPage = () => {
  const [mcpConfigs, setMcpConfigs] = useState<MCPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingMCP, setEditingMCP] = useState<MCPConfig | null>(null);
  const [viewingMCP, setViewingMCP] = useState<MCPConfig | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const mcpData = await mcpService.getMCPConfigs();
      setMcpConfigs(mcpData);
    } catch (error) {
      message.error('Error al cargar las configuraciones MCP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMCP(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'api',
      isPopular: false,
      isActive: true
    });
    setModalVisible(true);
  };

  const handleEdit = (mcp: MCPConfig) => {
    setEditingMCP(mcp);
    form.setFieldsValue({
      name: mcp.name,
      description: mcp.description,
      type: mcp.type,
      configuration: JSON.stringify(mcp.configuration, null, 2),
      isPopular: mcp.isPopular,
      isActive: mcp.isActive
    });
    setModalVisible(true);
  };

  const handleView = (mcp: MCPConfig) => {
    setViewingMCP(mcp);
    setViewModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await mcpService.deleteMCPConfig(id);
      message.success('Configuración MCP eliminada correctamente');
      await loadData();
    } catch (error) {
      message.error('Error al eliminar la configuración MCP');
    }
  };

  const handleToggleStatus = async (mcp: MCPConfig) => {
    try {
      await mcpService.toggleMCPStatus(mcp.id);
      message.success(`MCP ${mcp.isActive ? 'desactivado' : 'activado'} correctamente`);
      await loadData();
    } catch (error) {
      message.error('Error al cambiar el estado del MCP');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const configData = {
        ...values,
        configuration: JSON.parse(values.configuration)
      };

      if (editingMCP) {
        await mcpService.updateMCPConfig(editingMCP.id, configData);
        message.success('Configuración MCP actualizada correctamente');
      } else {
        await mcpService.createMCPConfig(configData);
        message.success('Configuración MCP creada correctamente');
      }

      setModalVisible(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Error al guardar la configuración MCP');
    }
  };

  const getFilteredMCPs = () => {
    let filtered = mcpConfigs.filter(mcp =>
      mcp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      mcp.description.toLowerCase().includes(searchText.toLowerCase()) ||
      mcp.type.toLowerCase().includes(searchText.toLowerCase())
    );

    switch (activeTab) {
      case 'popular':
        return filtered.filter(mcp => mcp.isPopular);
      case 'active':
        return filtered.filter(mcp => mcp.isActive);
      case 'inactive':
        return filtered.filter(mcp => !mcp.isActive);
      default:
        return filtered;
    }
  };

  const columns = [
    {
      title: 'Configuración MCP',
      key: 'mcp',
      render: (record: MCPConfig) => (
        <Space>
          <SettingOutlined style={{ color: '#1677ff' }} />
          <div>
            <Space>
              <Text strong>{record.name}</Text>
              {record.isPopular && (
                <StarFilled style={{ color: '#faad14', fontSize: 16 }} />
              )}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description.substring(0, 80)}...
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={getMCPTypeColor(type)}>
          {getMCPTypeLabel(type)}
        </Tag>
      )
    },
    {
      title: 'Popular',
      dataIndex: 'isPopular',
      key: 'isPopular',
      render: (isPopular: boolean) => (
        isPopular ? (
          <StarFilled style={{ color: '#faad14', fontSize: 16 }} />
        ) : (
          <StarOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
        )
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
      render: (record: MCPConfig) => (
        <Space size="small">
          <Tooltip title="Ver configuración">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>

          <Tooltip title="Editar configuración">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.isActive ? 'Desactivar' : 'Activar'}>
            <Popconfirm
              title={`¿Está seguro de ${record.isActive ? 'desactivar' : 'activar'} esta configuración?`}
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

          <Tooltip title="Eliminar configuración">
            <Popconfirm
              title="¿Está seguro de eliminar esta configuración?"
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

  const tabItems = [
    {
      key: 'all',
      label: (
        <Badge count={mcpConfigs.length} showZero>
          <span>Todas</span>
        </Badge>
      )
    },
    {
      key: 'popular',
      label: (
        <Badge count={mcpConfigs.filter(mcp => mcp.isPopular).length} showZero>
          <span>Populares</span>
        </Badge>
      )
    },
    {
      key: 'active',
      label: (
        <Badge count={mcpConfigs.filter(mcp => mcp.isActive).length} showZero>
          <span>Activas</span>
        </Badge>
      )
    },
    {
      key: 'inactive',
      label: (
        <Badge count={mcpConfigs.filter(mcp => !mcp.isActive).length} showZero>
          <span>Inactivas</span>
        </Badge>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Configuraciones MCP
            </Title>
            <Text type="secondary">
              Model Context Protocol - Gestión de integraciones
            </Text>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Buscar configuraciones..."
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
                Nueva Configuración
              </Button>
            </Space>
          </Col>
        </Row>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={getFilteredMCPs()}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} configuraciones`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingMCP ? 'Editar Configuración MCP' : 'Nueva Configuración MCP'}
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
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nombre de la Configuración"
                rules={[
                  { required: true, message: 'Por favor ingrese el nombre' }
                ]}
              >
                <Input placeholder="Filesystem Browser" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Tipo de MCP"
                rules={[
                  { required: true, message: 'Por favor seleccione un tipo' }
                ]}
              >
                <Select
                  placeholder="Seleccionar tipo"
                  options={[
                    { value: 'filesystem', label: 'Sistema de Archivos' },
                    { value: 'database', label: 'Base de Datos' },
                    { value: 'api', label: 'API Externa' },
                    { value: 'tools', label: 'Herramientas' }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción"
            rules={[
              { required: true, message: 'Por favor ingrese la descripción' }
            ]}
          >
            <TextArea
              rows={2}
              placeholder="Descripción detallada de la funcionalidad..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="configuration"
            label="Configuración (JSON)"
            rules={[
              { required: true, message: 'Por favor ingrese la configuración' },
              {
                validator: async (_, value) => {
                  if (value) {
                    try {
                      JSON.parse(value);
                    } catch (error) {
                      throw new Error('Formato JSON inválido');
                    }
                  }
                }
              }
            ]}
          >
            <TextArea
              rows={8}
              placeholder={`{
  "apiKey": "your-api-key",
  "baseUrl": "https://api.example.com",
  "timeout": 30000,
  "retries": 3
}`}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isPopular"
                label="Marcado como Popular"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Sí"
                  unCheckedChildren="No"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

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
                {editingMCP ? 'Actualizar' : 'Crear'} Configuración
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Configuración MCP: ${viewingMCP?.name}`}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Cerrar
          </Button>
        ]}
        width={700}
      >
        {viewingMCP && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Nombre:</Text>
                <br />
                <Space>
                  <Text>{viewingMCP.name}</Text>
                  {viewingMCP.isPopular && (
                    <StarFilled style={{ color: '#faad14' }} />
                  )}
                </Space>
              </Col>
              <Col span={12}>
                <Text strong>Tipo:</Text>
                <br />
                <Tag color={getMCPTypeColor(viewingMCP.type)}>
                  {getMCPTypeLabel(viewingMCP.type)}
                </Tag>
              </Col>
            </Row>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text strong>Descripción:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6
              }}>
                {viewingMCP.description}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Configuración:</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                background: '#f5f5f5', 
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap'
              }}>
                {JSON.stringify(viewingMCP.configuration, null, 2)}
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Popular:</Text>
                <br />
                {viewingMCP.isPopular ? (
                  <Tag color="gold">Sí</Tag>
                ) : (
                  <Tag>No</Tag>
                )}
              </Col>
              <Col span={8}>
                <Text strong>Estado:</Text>
                <br />
                <Tag color={getStatusColor(viewingMCP.isActive)}>
                  {getStatusText(viewingMCP.isActive)}
                </Tag>
              </Col>
              <Col span={8}>
                <Text strong>Fecha de Creación:</Text>
                <br />
                <Text type="secondary">{formatDate(viewingMCP.createdAt)}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};
