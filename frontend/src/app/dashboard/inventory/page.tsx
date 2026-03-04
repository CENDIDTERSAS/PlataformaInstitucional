'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false });
import ProveedorOficioPdf from '@/components/inventory/ProveedorOficioPdf';
import { Download } from 'lucide-react';

import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Power,
  EyeOff,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import ImportProductsModal from '@/components/inventory/ImportProductsModal';
import ItemModal from '@/components/inventory/ItemModal';
import WarehouseModal from '@/components/inventory/WarehouseModal';
import MovementModal from '@/components/inventory/MovementModal';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const InventoryContainer = styled.div`
  padding: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--gray-100);
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--secondary)'};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 2px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--primary);
  }
`;

const ModuleHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 1.5rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gray-100);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background: var(--primary);
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const HeaderIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(18, 161, 82, 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(18, 161, 82, 0.1);
`;

const Title = styled.div`
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text);
    margin: 0;
    letter-spacing: -0.02em;
  }
  p {
    font-size: 0.95rem;
    color: var(--secondary);
    margin: 0.2rem 0 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const SecondaryButton = styled.button`
  background-color: white;
  color: var(--text);
  border: 1px solid var(--gray-100);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--gray-100);
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  background-color: white;
  border: 1px solid var(--gray-100);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--primary);
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary);
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Consultar proveedores
  const { data: providers = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/proveedores`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Perfil del usuario actual
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const res = await fetch(`${API_URL}/profile/${user.id}`);
      return res.json();
    }
  });

  // Obtener permisos del usuario
  const { data: permissions = [] } = useQuery({
    queryKey: ['my-permissions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${profile.id}/permissions`);
      return res.json();
    },
    enabled: !!profile?.id
  });

  const isPermitted = (modulo: string, accion: string = 'acceso') => {
    if (profile?.rol === 'Administrador') return true;
    return permissions.some((p: any) => p.modulo === modulo && p.accion === accion);
  };

  const [activeTab, setActiveTab] = useState('stock');
  const [searchTerm, setSearchTerm] = useState('');
  // Fetch Inventory
  const { data: inventory = [], isLoading: loadingInv } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/inventario`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Warehouses
  const { data: warehouses = [], isLoading: loadingWH } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/bodegas`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Movements
  const { data: movements = [], isLoading: loadingMovements } = useQuery({
    queryKey: ['movements'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/movimientos`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Usuarios (para asignación de bodegas)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Pedidos Proveedor
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-proveedor'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/pedidos-proveedor`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch Auditoría
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditoria'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/auditoria`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: userAssignmentsRaw = [] } = useQuery({
    queryKey: ['user-assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const res = await fetch(`${API_URL}/users/${profile.id}/assignments`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!profile?.id
  });

  // Asegurar que todas las variables de datos sean arreglos
  const inventoryArr = Array.isArray(inventory) ? inventory : [];
  const warehousesArr = Array.isArray(warehouses) ? warehouses : [];
  const movementsArr = Array.isArray(movements) ? movements : [];
  const userAssignmentsArr = Array.isArray(userAssignmentsRaw) ? userAssignmentsRaw : [];
  const providersArr = Array.isArray(providers) ? providers : [];
  const usersArr = Array.isArray(users) ? users : [];
  const pedidosArr = Array.isArray(pedidos) ? pedidos : [];
  const auditLogsArr = Array.isArray(auditLogs) ? auditLogs : [];

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [orderQuantities, setOrderQuantities] = useState<{ [key: string]: number }>({});
  const [isMounted, setIsMounted] = useState(false);

  // Sincronizar data para el PDF y otras funciones que dependen del estado local
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Configuración de Realtime para actualizaciones automáticas
  React.useEffect(() => {
    const channel = supabase
      .channel('inventory-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventario' },
        () => queryClient.invalidateQueries({ queryKey: ['inventory'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bodegas' },
        () => queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimientos' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['movements'] });
          queryClient.invalidateQueries({ queryKey: ['inventory'] }); // Para refrescar stocks calculados
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos_proveedor' },
        () => queryClient.invalidateQueries({ queryKey: ['pedidos-proveedor'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auditoria' },
        () => queryClient.invalidateQueries({ queryKey: ['auditoria'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'perfiles_bodegas' },
        () => queryClient.invalidateQueries({ queryKey: ['user-assignments'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);


  const handleNewItem = () => {
    switch (activeTab) {
      case 'bodegas':
        setSelectedWarehouse(null);
        setIsWarehouseModalOpen(true);
        break;
      case 'movimientos':
        setIsMovementModalOpen(true);
        break;
      case 'productos':
      default:
        setSelectedItem(null);
        setIsProductModalOpen(true);
    }
  };

  const getButtonConfig = () => {
    switch (activeTab) {
      case 'bodegas': return { text: 'Nueva Bodega', icon: <Plus size={20} /> };
      case 'productos': return { text: 'Nuevo Producto', icon: <Plus size={20} /> };
      case 'movimientos': return { text: 'Nuevo Movimiento', icon: <Plus size={20} /> };
      default: return { text: 'Nuevo Producto', icon: <Plus size={20} /> };
    }
  };

  const handleEditProduct = (item: any) => {
    setSelectedItem(item);
    setIsProductModalOpen(true);
  };

  const handleImportProducts = async (products: any[]) => {
    try {
      const res = await fetch(`${API_URL}/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      });

      const results = await res.json();

      alert(`✅ Importación completada!
${results.success.length} productos creados exitosamente
${results.errors.length} errores`);

      // Refrescar lista
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    } catch (error: any) {
      alert(`Error en la importación: ${error.message}`);
    }
  };

  const handleEditWarehouse = (wh: any) => {
    setSelectedWarehouse(wh);
    setIsWarehouseModalOpen(true);
  };

  // Mutation para crear/actualizar producto
  const productMutation = useMutation({
    mutationFn: async (productData: any) => {
      const url = selectedItem
        ? `${API_URL}/inventario/${selectedItem.id}`
        : `${API_URL}/inventario`;
      const method = selectedItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Error al guardar producto');
      }
      return res.json();
    },
    onError: (error: any) => {
      alert(`❌ Error al guardar producto: ${error.message}`);
    }
  });

  const handleSaveProduct = (itemData: any) => {
    console.log('Intentando guardar producto:', itemData);
    console.log('API_URL:', API_URL);
    productMutation.mutate(itemData);
  };

  // Mutation para crear/actualizar bodega
  const warehouseMutation = useMutation({
    mutationFn: async (whData: any) => {
      const url = selectedWarehouse
        ? `${API_URL}/bodegas/${selectedWarehouse.id}`
        : `${API_URL}/bodegas`;
      const method = selectedWarehouse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whData)
      });

      if (!res.ok) throw new Error('Error al guardar bodega');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsWarehouseModalOpen(false);
      setSelectedWarehouse(null);
    }
  });

  // Mutation para eliminar bodega
  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/bodegas/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al eliminar bodega');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      alert('✅ Bodega eliminada correctamente');
    },
    onError: (error: any) => {
      alert(`❌ Error al eliminar bodega: ${error.message}`);
    }
  });

  // Mutation para guardar asignaciones
  const assignmentsMutation = useMutation({
    mutationFn: async ({ id, users }: { id: string, users: string[] }) => {
      const res = await fetch(`${API_URL}/bodegas/${id}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarios_ids: users })
      });
      if (!res.ok) throw new Error('Error al guardar asignaciones');
      return res.json();
    }
  });

  const handleSaveWarehouse = (whData: any, assignedUsers?: string[]) => {
    warehouseMutation.mutate(whData, {
      onSuccess: (data) => {
        if (assignedUsers && data?.id) {
          assignmentsMutation.mutate({ id: data.id, users: assignedUsers });
        }
      }
    });
  };

  // Mutation para eliminar producto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/inventario/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Error al eliminar producto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  const handleDeleteProduct = (id: any) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  // Mutation para crear movimiento
  const movementMutation = useMutation({
    mutationFn: async (mvData: any) => {
      const res = await fetch(`${API_URL}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mvData)
      });
      if (!res.ok) throw new Error('Error al registrar movimiento');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      setIsMovementModalOpen(false);
    }
  });

  const getLastMovementDate = (itemId: string) => {
    const itemMovements = movementsArr.filter((m: any) => m.item_id === itemId);
    if (itemMovements.length === 0) return '-';
    const last = [...itemMovements].sort((a: any, b: any) =>
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0];
    return new Date(last.fecha).toLocaleDateString();
  };

  // Mutation para registrar pedido a proveedor
  const pedidoMutation = useMutation({
    mutationFn: async (pedidoData: any) => {
      console.log('Enviando datos de pedido:', pedidoData);
      const res = await fetch(`${API_URL}/pedidos-proveedor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedidoData)
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('Error del servidor al crear pedido:', err);
        throw new Error(err.error || 'Error al registrar pedido');
      }
      return res.json();
    },
    onSuccess: (data) => {
      console.log('Pedido registrado exitosamente:', data);
      queryClient.invalidateQueries({ queryKey: ['pedidos-proveedor'] });
    },
    onError: (error) => {
      console.error('Error en la mutación de pedido:', error);
    }
  });

  const isAdmin = profile?.rol === 'Administrador';

  // Filtrar data según asignaciones (si no es admin)
  const filteredWarehouses = isAdmin
    ? warehousesArr
    : warehousesArr.filter((w: any) => userAssignmentsArr.includes(w.id));

  const filteredInventory = isAdmin
    ? inventoryArr
    : inventoryArr.filter((item: any) => userAssignmentsArr.includes(item.bodega_id));

  const filteredMovements = isAdmin
    ? movementsArr
    : movementsArr.filter((m: any) => userAssignmentsArr.includes(m.bodega_id));

  const dataToDisplay = filteredInventory.filter((item: any) => {
    const matchesSearch =
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const movementsToDisplay = filteredMovements.filter((m: any) => {
    const matchesSearch =
      m.inventario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.inventario?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.responsable?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleGeneratePedido = (items: any[]) => {
    if (!selectedProvider) {
      alert('Por favor selecciona un proveedor antes de generar el PDF');
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const codigo = `OFE-PP-TI-${year}-${month}-${day}`;

    // Validación de cantidades antes de proceder
    const invalidItems = items.filter(i => (parseFloat(i.cantidadPedida) || 0) <= 0);
    if (invalidItems.length > 0) {
      alert(`⚠️ Error: El producto "${invalidItems[0].nombre}" tiene cantidad 0 o inválida. Todos los ítems deben tener una cantidad mayor a 0 para generar el oficio.`);
      return;
    }

    const itemsWithUnit = items.map(item => {
      // Intentar encontrar el producto en el inventario para obtener su unidad
      const prod = inventory.find((p: any) => p.nombre === item.nombre);
      return {
        ...item,
        unidad: prod?.unidad || 'und'
      };
    });

    pedidoMutation.mutate({
      codigo,
      items: itemsWithUnit,
      usuario_id: profile?.id,
      proveedor_id: selectedProvider.id
    });
    return codigo;
  };

  const handleSaveMovement = (mvData: any) => {
    if (mvData?._refreshOnly) {
      console.log('🔄 Refrescando datos del inventario tras carga masiva...');
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-proveedor'] });
      return;
    }
    movementMutation.mutate(mvData);
  };

  const handleExportExcel = () => {
    try {
      const { utils, writeFile } = require('xlsx');

      let dataToExport: any[] = [];
      let filename = 'reporte.xlsx';

      if (activeTab === 'movimientos') {
        filename = `MOVIMIENTOS_${new Date().toLocaleDateString()}.xlsx`;
        dataToExport = filteredMovements.map((m: any) => ({
          'Fecha': new Date(m.fecha).toLocaleString(),
          'Producto': m.inventario?.nombre,
          'Código': m.inventario?.codigo,
          'Tipo': m.tipo,
          'Cantidad': m.cantidad,
          'Costo Unitario': m.valor_unitario || 0,
          'IVA (%)': m.iva_porcentaje || 0,
          'Costo Total': m.valor_total || 0,
          'Bodega': m.bodegas?.nombre || '-',
          'Proveedor': m.tipo === 'Entrada' ? (m.proveedores?.nombre || '-') : '-',
          'Destinatario': m.tipo === 'Salida' ? (m.perfiles ? `${m.perfiles.nombres} ${m.perfiles.apellidos}` : '-') : '-',
          'Oficio Ref.': m.pedidos_proveedor?.codigo || '-',
          'Responsable': m.responsable,
          'Notas': m.notas
        }));
      } else if (activeTab === 'stock') {
        filename = `DETALLE_STOCK_${new Date().toLocaleDateString()}.xlsx`;
        dataToExport = filteredInventory.map((item: any) => ({
          'Código': item.codigo,
          'Producto': item.nombre,
          'Categoría': item.categoria,
          'Bodega': item.bodegas?.nombre || item.bodega,
          'Stock Actual': calculateStock(item.id),
          'Último Movimiento': getLastMovementDate(item.id)
        }));
      } else {
        filename = `INVENTARIO_GENERAL_${new Date().toLocaleDateString()}.xlsx`;
        dataToExport = filteredInventory.map((item: any) => ({
          'Código': item.codigo,
          'Nombre': item.nombre,
          'Descripción': item.descripcion,
          'Categoría': item.categoria,
          'Bodega': item.bodegas?.nombre || item.bodega
        }));
      }

      const ws = utils.json_to_sheet(dataToExport);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Reporte');
      writeFile(wb, filename);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  const calculateStock = (itemId: string) => {
    return movementsArr
      .filter((m: any) => m.item_id === itemId)
      .reduce((acc: number, m: any) => {
        return m.tipo === 'Entrada' ? acc + m.cantidad : acc - m.cantidad;
      }, 0);
  };

  const handleDeleteWarehouse = (id: any) => {
    if (confirm('¿Estás seguro de eliminar esta bodega? Solo se podrá eliminar si no tiene productos asociados.')) {
      deleteWarehouseMutation.mutate(id);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'bodegas':
        return (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>ID BODEGA</th>
                  <th>Nombre</th>
                  <th>Creado</th>
                  <th>Fecha de Creación</th>
                  <th>Hora de Creación</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouses.map((wh) => (
                  <tr key={wh.id} style={{ opacity: wh.estado === 'Inactiva' ? 0.6 : 1 }}>
                    <td>{wh.codigo || `#${wh.id.substring(0, 8)}...`}</td>
                    <td><div style={{ fontWeight: 600 }}>{wh.nombre}</div></td>
                    <td>{wh.creado}</td>
                    <td>{wh.fecha}</td>
                    <td>{wh.hora}</td>
                    <td>
                      <StatusBadge $status={wh.estado === 'Activa' ? 'In Stock' : wh.estado === 'Inactiva' ? 'Out of Stock' : 'Low Stock'}>
                        {wh.estado}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <IconButton title="Editar" onClick={() => handleEditWarehouse(wh)}><Edit size={16} /></IconButton>
                        <IconButton
                          title={wh.estado === 'Activa' ? 'Deshabilitar' : 'Habilitar'}
                          onClick={() => handleSaveWarehouse({ ...wh, estado: wh.estado === 'Activa' ? 'Inactiva' : 'Activa' })}
                          style={{ color: wh.estado === 'Activa' ? '#f4b400' : '#0f9d58' }}
                        >
                          <Power size={16} />
                        </IconButton>
                        <IconButton title="Eliminar" onClick={() => handleDeleteWarehouse(wh.id)} style={{ color: '#ea4335' }}><Trash2 size={16} /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
        );
      case 'movimientos':
        return (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Costo Unit.</th>
                  <th>IVA</th>
                  <th>Costo Total</th>
                  <th>Bodega</th>
                  <th>Proveedor / Destinatario</th>
                  <th>Oficio Ref.</th>
                  <th>Responsable</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {movementsToDisplay.map((m: any) => (
                  <tr key={m.id}>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                    <td title={m.notas}><strong>{m.inventario?.nombre}</strong> ({m.inventario?.codigo})</td>
                    <td>
                      <StatusBadge $status={m.tipo === 'Entrada' ? 'In Stock' : 'Out of Stock'}>
                        {m.tipo}
                      </StatusBadge>
                    </td>
                    <td><strong style={{ color: m.tipo === 'Entrada' ? '#34A853' : '#EA4335' }}>
                      {m.tipo === 'Entrada' ? '+' : '-'}{m.cantidad}
                    </strong></td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {m.valor_unitario ? `$${Number(m.valor_unitario).toLocaleString()}` : '-'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {m.iva_porcentaje ? `${m.iva_porcentaje}%` : '0%'}
                    </td>
                    <td><strong style={{ color: '#1e293b' }}>
                      {m.valor_total ? `$${Number(m.valor_total).toLocaleString()}` : '-'}
                    </strong></td>
                    <td>{m.bodegas?.nombre || 'N/A'}</td>
                    <td>
                      {m.tipo === 'Salida' ? (
                        <span style={{ color: '#1a73e8', fontWeight: 500 }}>
                          {m.perfiles ? `${m.perfiles.nombres} ${m.perfiles.apellidos}` : (m.requests ? 'Solicitud Papelería' : '-')}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b' }}>
                          {m.proveedores?.nombre || '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {m.pedidos_proveedor?.codigo ? (
                        <span style={{
                          backgroundColor: '#f0f9ff',
                          color: '#0369a1',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: '1px solid #bae6fd'
                        }}>
                          {m.pedidos_proveedor.codigo}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{m.responsable}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.notas}>
                      {m.notas || '-'}
                    </td>
                  </tr>
                ))}
                {movementsToDisplay.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary)' }}>
                      No hay movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </StyledTable>
          </TableContainer>
        );
      case 'stock':
        return (
          <>
            <ControlsSection>
              <SearchWrapper>
                <SearchIconWrapper>
                  <Search size={20} />
                </SearchIconWrapper>
                <SearchInput placeholder="Buscar por código o nombre de producto..." />
              </SearchWrapper>
              <SecondaryButton>
                <Filter size={18} />
                Filtros
              </SecondaryButton>
            </ControlsSection>

            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            const newQs = { ...orderQuantities };
                            dataToDisplay.forEach((item: any) => {
                              if (!newQs[item.id]) newQs[item.id] = 1; // Default a 1 al seleccionar masivamente
                            });
                            setOrderQuantities(newQs);
                          } else {
                            setOrderQuantities({});
                          }
                        }}
                        checked={dataToDisplay.length > 0 && Object.keys(orderQuantities).length === dataToDisplay.length}
                      />
                    </th>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Bodega</th>
                    <th>Stock Actual</th>
                    <th style={{ width: '150px' }}>Cant. a Pedir</th>
                    <th>Último Movimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {dataToDisplay.map((item: any) => {
                    const stock = calculateStock(item.id);
                    const isSelected = orderQuantities.hasOwnProperty(item.id);
                    return (
                      <tr key={item.id} style={{ background: isSelected ? '#f8fafc' : 'transparent' }}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const newQs = { ...orderQuantities };
                              if (isSelected) delete newQs[item.id];
                              else newQs[item.id] = 1; // Default a 1 al seleccionar individualmente
                              setOrderQuantities(newQs);
                            }}
                          />
                        </td>
                        <td><strong>{item.codigo || 'N/A'}</strong></td>
                        <td><div style={{ fontWeight: 600 }}>{item.nombre}</div></td>
                        <td>{item.categoria || 'General'}</td>
                        <td>{item.bodegas?.nombre || item.bodega || 'N/A'}</td>
                        <td><strong style={{ color: stock > 10 ? '#34A853' : '#EA4335' }}>{stock}</strong></td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={orderQuantities[item.id] || ''}
                            onChange={(e) => {
                              setOrderQuantities({
                                ...orderQuantities,
                                [item.id]: parseInt(e.target.value) || 0
                              });
                            }}
                            placeholder="0"
                            style={{
                              width: '80px',
                              padding: '0.4rem',
                              borderRadius: '6px',
                              border: '1px solid var(--gray-200)',
                              textAlign: 'center'
                            }}
                            disabled={!isSelected}
                          />
                        </td>
                        <td>{getLastMovementDate(item.id)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </StyledTable>
            </TableContainer>

            {Object.keys(orderQuantities).length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                  position: 'fixed',
                  bottom: '2rem',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  zIndex: 100,
                  border: '1px solid var(--primary)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ fontWeight: 600 }}>
                    {Object.keys(orderQuantities).length} productos seleccionados
                  </div>
                  <select
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gray-200)',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                    value={selectedProvider?.id || ''}
                    onChange={(e) => {
                      const prov = providers.find((p: any) => p.id === e.target.value);
                      setSelectedProvider(prov);
                    }}
                  >
                    <option value="">Seleccionar Proveedor...</option>
                    {providersArr.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                {isMounted && selectedProvider && isPermitted('inventarios', 'descargar_pdf_oficio') && (
                  <PDFDownloadLink
                    document={
                      <ProveedorOficioPdf
                        items={Object.entries(orderQuantities).map(([id, qty]) => {
                          const item = inventory.find((i: any) => i.id === id);
                          return { ...item, cantidadPedida: qty };
                        })}
                        user={profile}
                        adminPersonnel={users.find((u: any) => u.rol === 'Administrador')}
                        proveedor={selectedProvider}
                      />
                    }
                    fileName={`Pedido_${selectedProvider.nombre.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.pdf`}
                  >
                    {({ loading }) => (
                      <PrimaryButton
                        disabled={loading}
                        onClick={() => handleGeneratePedido(
                          Object.entries(orderQuantities).map(([id, qty]) => {
                            const item = inventory.find((i: any) => i.id === id);
                            return { ...item, cantidadPedida: qty };
                          })
                        )}
                      >
                        <Download size={20} />
                        {loading ? 'Generando...' : 'Generar Oficio'}
                      </PrimaryButton>
                    )}
                  </PDFDownloadLink>
                )}
                <button
                  onClick={() => setOrderQuantities({})}
                  style={{ background: 'none', border: 'none', color: '#ea4335', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancelar
                </button>
              </motion.div>
            )}
          </>
        );
      case 'pedidos':
        return (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Código</th>
                  <th>Proveedor</th>
                  <th>Ítems</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosArr.map((p: any) => (
                  <tr key={p.id}>
                    <td>{new Date(p.creado_at).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        backgroundColor: '#e8f0fe',
                        color: '#1a73e8',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {p.codigo}
                      </span>
                    </td>
                    <td>{p.proveedores?.nombre || 'N/A'}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>
                        {p.items?.length || 0} productos solicitados
                      </div>
                    </td>
                    <td>
                      <StatusBadge $status={p.estado === 'Generado' ? 'In Stock' : 'Low Stock'}>
                        {p.estado}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No se han generado solicitudes de papelería aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </StyledTable>
          </TableContainer>
        );
      case 'auditoria':
        return (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Acción</th>
                  <th>Tabla</th>
                  <th>Registro ID</th>
                  <th>Responsable</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {auditLogsArr.map((log: any) => (
                  <tr key={log.id}>
                    <td>{new Date(log.fecha).toLocaleString()}</td>
                    <td>
                      <StatusBadge $status={
                        log.accion === 'CREACIÓN' ? 'In Stock' :
                          log.accion === 'ELIMINACIÓN' ? 'Out of Stock' : 'Low Stock'
                      }>
                        {log.accion}
                      </StatusBadge>
                    </td>
                    <td><code>{log.tabla}</code></td>
                    <td><small>{log.registro_id.substring(0, 8)}...</small></td>
                    <td>{log.responsable_nombre || 'Sistema'}</td>
                    <td>
                      <IconButton onClick={() => alert(JSON.stringify(log.valor_nuevo || log.valor_anterior, null, 2))}>
                        🔍 Ver Data
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      No hay registros en la bitácora.
                    </td>
                  </tr>
                )}
              </tbody>
            </StyledTable>
          </TableContainer>
        );
      default:
        return (
          <>
            <ControlsSection>
              <SearchWrapper>
                <SearchIconWrapper>
                  <Search size={20} />
                </SearchIconWrapper>
                <SearchInput placeholder="Buscar por nombre, SKU o categoría..." />
              </SearchWrapper>
              <SecondaryButton>
                <Filter size={18} />
                Filtros
              </SecondaryButton>
            </ControlsSection>

            <TableContainer>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Bodega</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {dataToDisplay.map((item: any) => (
                    <tr key={item.id}>
                      <td><strong>{item.codigo || 'N/A'}</strong></td>
                      <td><div style={{ fontWeight: 600 }}>{item.nombre}</div></td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.descripcion || '-'}
                      </td>
                      <td>{item.categoria || 'General'}</td>
                      <td>{item.bodegas?.nombre || item.bodega || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {isPermitted('inventarios', 'gestionar') ? (
                            <>
                              <IconButton onClick={() => handleEditProduct(item)}><Edit size={16} /></IconButton>
                              <IconButton onClick={() => handleDeleteProduct(item.id)} style={{ color: '#ea4335' }}><Trash2 size={16} /></IconButton>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Lectura</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableContainer>
          </>
        );
    }
  };

  return (
    <InventoryContainer>
      <ModuleHeader>
        <TitleSection>
          <HeaderIconWrapper>
            <Package size={28} />
          </HeaderIconWrapper>
          <Title>
            <h1>Gestión de Inventarios</h1>
            <p>Control de Existencias, Bodegas y Movimientos Institucionales</p>
          </Title>
        </TitleSection>
        <ActionButtons>
          {activeTab === 'productos' && isPermitted('inventarios', 'gestionar') && (
            <PrimaryButton onClick={() => setIsImportModalOpen(true)}>
              <FileSpreadsheet size={20} />
              Importar Excel
            </PrimaryButton>
          )}
          {(activeTab === 'movimientos' || activeTab === 'stock' || activeTab === 'productos') && isPermitted('inventarios', 'exportar_excel') && (
            <PrimaryButton onClick={handleExportExcel} style={{ backgroundColor: '#1d6f42' }}>
              <FileSpreadsheet size={20} />
              Exportar Excel
            </PrimaryButton>
          )}
          {(activeTab === 'bodegas' || activeTab === 'productos' || activeTab === 'movimientos') && isPermitted('inventarios', 'gestionar') && (
            <PrimaryButton onClick={() => handleNewItem()}>
              {getButtonConfig().icon}
              {getButtonConfig().text}
            </PrimaryButton>
          )}
        </ActionButtons>
      </ModuleHeader>

      <TabContainer>
        {isPermitted('inventarios', 'ver_bodegas') && <Tab $active={activeTab === 'bodegas'} onClick={() => setActiveTab('bodegas')}>🏢 Bodegas</Tab>}
        <Tab $active={activeTab === 'productos'} onClick={() => setActiveTab('productos')}>📦 Productos</Tab>
        {isPermitted('inventarios', 'ver_stock') && <Tab $active={activeTab === 'stock'} onClick={() => setActiveTab('stock')}>📊 Stock</Tab>}
        {isPermitted('inventarios', 'solicitudes') && <Tab $active={activeTab === 'pedidos'} onClick={() => setActiveTab('pedidos')}>📝 Solicitudes</Tab>}
        {isPermitted('inventarios', 'movimientos') && <Tab $active={activeTab === 'movimientos'} onClick={() => setActiveTab('movimientos')}>📋 Movimientos</Tab>}
        {isPermitted('inventarios', 'auditoria') && <Tab $active={activeTab === 'auditoria'} onClick={() => setActiveTab('auditoria')}>🔍 Auditoría</Tab>}
      </TabContainer>

      {renderContent()}

      <ItemModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        initialData={selectedItem}
        onSave={handleSaveProduct}
      />

      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        initialData={selectedWarehouse}
        onSave={handleSaveWarehouse}
        users={usersArr}
      />

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportProducts}
      />

      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSave={handleSaveMovement}
        products={filteredInventory}
        warehouses={filteredWarehouses}
        pedidos={pedidos}
        providers={providers}
        users={usersArr}
      />
    </InventoryContainer>
  );
}

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-100);
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  th {
    padding: 1rem 1.5rem;
    background-color: var(--gray-100);
    color: var(--secondary);
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--gray-100);
    font-size: 0.95rem;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background-color: #fafafa;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    switch (props.$status) {
      case 'In Stock':
        return `background-color: #e6f4ea; color: #1e8e3e;`;
      case 'Low Stock':
        return `background-color: #fef7e0; color: #b06000;`;
      case 'Out of Stock':
        return `background-color: #fce8e6; color: #d93025;`;
      default:
        return `background-color: var(--gray-100); color: var(--secondary);`;
    }
  }}
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: var(--gray-100);
    color: var(--primary);
  }
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
`;


