'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div) <{ $wide: boolean }>`
  background: white;
  padding: 3rem;
  border-radius: 32px;
  width: 96%;
  max-width: ${props => props.$wide ? '1200px' : '600px'};
  max-height: 94vh;
  overflow-y: auto;
  box-shadow: 0 40px 60px -15px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid rgba(0,0,0,0.05);

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    width: 100%;
    border-radius: 0;
    max-height: 100vh;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 2.5rem;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;

  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--secondary);
    background: #f1f5f9;
    padding: 0.4rem 1rem;
    border-radius: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary);
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--gray-100);
  outline: none;
  font-size: 1rem;
  transition: all 0.2s;
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--gray-100);
  outline: none;
  font-size: 1rem;
  background: white;
  transition: all 0.2s;
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--gray-100);
  outline: none;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  &:focus {
    border-color: var(--primary);
  }
`;

const TypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const TypeButton = styled.button<{ $active: boolean; $type: 'Entrada' | 'Salida' }>`
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${props => props.$active
    ? (props.$type === 'Entrada' ? '#34A853' : '#EA4335')
    : 'var(--gray-100)'};
  background: ${props => props.$active
    ? (props.$type === 'Entrada' ? '#E6F4EA' : '#FCE8E6')
    : 'white'};
  color: ${props => props.$active
    ? (props.$type === 'Entrada' ? '#137333' : '#C5221F')
    : 'var(--secondary)'};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$type === 'Entrada' ? '#34A853' : '#EA4335'};
  }
`;

const SaveButton = styled.button`
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  transition: all 0.2s;

  &:hover {
    background-color: #1e40af;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
    transform: none;
  }
`;

const ItemsPreviewList = styled.div`
  background-color: white;
  border: 1px solid var(--gray-100);
  border-radius: 16px;
  padding: 0;
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const PreviewTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 100px 140px 100px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background-color: var(--gray-50);
  border-bottom: 2px solid var(--gray-100);
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const PreviewItemRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 100px 140px 100px 120px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  align-items: center;
  border-bottom: 1px solid var(--gray-50);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    background-color: #f0f9ff;
    transform: scale(1.002);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 1000px) {
    grid-template-columns: 1fr 80px;
    gap: 0.5rem;
    
    & > :nth-child(3), & > :nth-child(4), & > :nth-child(5) {
      display: none;
    }
  }
`;

const PreviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const PreviewItemName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PreviewItemQty = styled.div<{ $error?: boolean }>`
  font-size: 0.9rem;
  color: ${props => props.$error ? '#ef4444' : 'var(--primary)'};
  font-weight: 700;
  display: flex;
  flex-direction: column;
  
  span {
    font-size: 0.65rem;
    font-weight: 400;
    color: var(--secondary);
  }
`;

const ReceiveAllButton = styled.button`
  background-color: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  width: fit-content;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #dcfce7;
    border-color: #86efac;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  &:hover {
    background-color: var(--gray-100);
  }
`;

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  products: any[];
  warehouses: any[];
  pedidos?: any[];
  providers?: any[];
  users?: any[];
}

import { supabase } from '@/lib/supabase';

const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products,
  warehouses,
  pedidos,
  providers = [],
  users = []
}) => {
  const [formData, setFormData] = useState({
    item_id: '',
    bodega_id: '',
    tipo: 'Entrada' as 'Entrada' | 'Salida',
    cantidad: 1,
    responsable: '',
    notas: '',
    pedido_id: '',
    proveedor_id: '',
    destinatario_id: '',
    valor_unitario: 0,
    subtotal: 0,
    iva_porcentaje: 19, // IVA por defecto
    valor_total: 0
  });

  const [entradaModo, setEntradaModo] = useState<'Manual' | 'Oficio'>('Manual');
  const [bulkPrices, setBulkPrices] = useState<{ [key: string]: number }>({});
  const [bulkIVA, setBulkIVA] = useState<{ [key: string]: number }>({});

  // Función utilitaria para extraer cantidad de cualquier variante de campo
  const getQtyFromItem = (item: any) => {
    // Buscar en todas las variantes posibles
    const val = item.cantidadPedida ?? item.cantidad ?? item.cant ?? item.cantidadSolicitada ?? item.cantidad_pedida ?? item.qty ?? item.count;

    // Si el valor es 0, es sospechoso (el usuario dice que no se "halan")
    if (val === 0) return 0; // Lo devolvemos pero lo marcaremos como error en el UI

    // Si no se encuentra en campos conocidos, buscar el primer valor numérico que no sea un ID
    if (val === undefined || val === null) {
      const numericField = Object.entries(item).find(([key, value]) =>
        typeof value === 'number' && !key.toLowerCase().includes('id') && !key.toLowerCase().includes('price') && !key.toLowerCase().includes('valor')
      );
      return numericField ? Number(numericField[1]) : null;
    }

    return (val !== undefined && val !== null) ? Number(val) : null;
  };

  const handleSelectItemFromList = (item: any) => {
    const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchName = normalize(item.nombre || '');

    const realProduct = products.find(p =>
      normalize(p.nombre) === searchName ||
      normalize(p.codigo || '') === normalize(item.codigo || '')
    );

    if (realProduct) {
      const qty = getQtyFromItem(item);
      setFormData(prev => ({
        ...prev,
        item_id: realProduct.id,
        bodega_id: realProduct.bodega_id || prev.bodega_id,
        cantidad: qty !== null ? qty : prev.cantidad
      }));
      setEntradaModo('Manual');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (isOpen) {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Intentar obtener el nombre completo desde la tabla perfiles
          const { data: profile } = await supabase
            .from('perfiles')
            .select('nombres, apellidos')
            .eq('id', user.id)
            .single();

          let userIdent = '';
          if (profile && (profile.nombres || profile.apellidos)) {
            userIdent = `${profile.nombres || ''} ${profile.apellidos || ''}`.trim();
          } else {
            userIdent = user?.user_metadata?.full_name || user?.email || 'Sistema';
          }

          setFormData({
            item_id: products[0]?.id || '',
            bodega_id: warehouses[0]?.id || '',
            tipo: 'Entrada',
            cantidad: 1,
            responsable: userIdent,
            notas: '',
            pedido_id: '',
            proveedor_id: '',
            destinatario_id: '',
            valor_unitario: 0,
            subtotal: 0,
            iva_porcentaje: 19,
            valor_total: 0
          });
        }
      }
    };

    fetchUser();
  }, [isOpen, products, warehouses]);

  // Cálculo automático del total y subtotal
  useEffect(() => {
    const cant = parseFloat(formData.cantidad.toString()) || 0;
    const valUnit = parseFloat(formData.valor_unitario.toString()) || 0;
    const sub = cant * valUnit;
    const iva = parseFloat(formData.iva_porcentaje.toString()) || 0;
    const total = sub + (sub * (iva / 100));

    setFormData(prev => ({
      ...prev,
      subtotal: Number(sub.toFixed(2)),
      valor_total: Number(total.toFixed(2))
    }));
  }, [formData.cantidad, formData.valor_unitario, formData.iva_porcentaje]);

  const handleReceiveAll = async (pedido: any) => {
    try {
      if (!confirm('¿Deseas registrar la entrada de TODOS los productos de este oficio automáticamente?')) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const movimientosBulk = pedido.items.map((item: any) => {
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const searchName = normalize(item.nombre || '');

        const realProduct = products.find(p =>
          normalize(p.nombre) === searchName ||
          normalize(p.codigo || '') === normalize(item.codigo || '')
        );

        const individualPrice = bulkPrices[item.nombre] || 0;
        const ivaPercent = bulkIVA[item.nombre] ?? formData.iva_porcentaje ?? 19;
        const qty = getQtyFromItem(item);
        if (qty === null) {
          console.warn(`Producto ${item.nombre} no tiene cantidad definida en el oficio.`);
        }
        const sub = (qty || 0) * individualPrice;
        const total = sub + (sub * (ivaPercent / 100));

        return {
          item_id: realProduct?.id || null,
          nombre_item: realProduct?.nombre || item.nombre, // Para la notificación consolidada
          bodega_id: formData.bodega_id,
          tipo: 'Entrada',
          cantidad: getQtyFromItem(item) || 0,
          responsable: formData.responsable,
          pedido_id: pedido.id,
          proveedor_id: pedido.proveedor_id,
          valor_unitario: individualPrice,
          subtotal: Number(sub.toFixed(2)),
          iva_porcentaje: ivaPercent,
          valor_total: Number(total.toFixed(2)),
          notas: `Recepción Masiva - Oficio ${pedido.codigo}`
        };
      }).filter((m: any) => m.item_id !== null); // Solo productos que existan en inventario

      console.log('📦 Preparando movimientos bulk:', {
        totalItemsEnOficio: pedido.items?.length,
        movimientosFiltrados: movimientosBulk.length,
        itemsEviados: movimientosBulk
      });

      if (movimientosBulk.length === 0) {
        alert('⚠️ No se registraron movimientos: No hubo coincidencias exactas entre los nombres del oficio y tu inventario.');
        return;
      }

      console.log('🚀 Enviando a API:', `${API_URL}/movimientos/bulk`);

      const res = await fetch(`${API_URL}/movimientos/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movimientos: movimientosBulk,
          pedido_id: pedido.id,
          proveedor_id: pedido.proveedor_id
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error en la carga masiva');
      }

      const result = await res.json();
      alert(`✅ Éxito: Se registraron ${movimientosBulk.length} entradas correctamente.`);

      // En lugar de onSave(null), usamos una señal clara para refrescar sin ejecutar el POST manual
      onSave({ _refreshOnly: true });
      onClose();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          $wide={formData.tipo === 'Entrada' && entradaModo === 'Oficio'}
        >
          <ModalHeader>
            <ModalTitle>Registrar Movimiento <span>{entradaModo === 'Oficio' ? 'Modo Oficio' : 'Manual'}</span></ModalTitle>
            <CloseButton onClick={onClose} style={{ position: 'absolute', right: '2rem', top: '2.5rem' }}><X size={24} /></CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Tipo de Movimiento</Label>
              <TypeSelector>
                <TypeButton
                  type="button"
                  $type="Entrada"
                  $active={formData.tipo === 'Entrada'}
                  onClick={() => setFormData({ ...formData, tipo: 'Entrada' })}
                >
                  <ArrowDownCircle size={20} />
                  Entrada
                </TypeButton>
                <TypeButton
                  type="button"
                  $type="Salida"
                  $active={formData.tipo === 'Salida'}
                  onClick={() => setFormData({ ...formData, tipo: 'Salida' })}
                >
                  <ArrowUpCircle size={20} />
                  Salida
                </TypeButton>
              </TypeSelector>
            </FormGroup>

            {formData.tipo === 'Entrada' && (
              <FormGroup>
                <Label>Modo de Entrada</Label>
                <TypeSelector>
                  <TypeButton
                    type="button"
                    $type="Entrada"
                    $active={entradaModo === 'Manual'}
                    onClick={() => setEntradaModo('Manual')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Manual
                  </TypeButton>
                  <TypeButton
                    type="button"
                    $type="Entrada"
                    $active={entradaModo === 'Oficio'}
                    onClick={() => setEntradaModo('Oficio')}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Desde Oficio
                  </TypeButton>
                </TypeSelector>
              </FormGroup>
            )}

            {(formData.tipo === 'Salida' || entradaModo === 'Manual') && (
              <>
                <FormGroup>
                  <Label>Producto</Label>
                  <Select
                    value={formData.item_id || ''}
                    onChange={(e) => {
                      const item = products.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        item_id: e.target.value,
                        bodega_id: item?.bodega_id || formData.bodega_id
                      });
                    }}
                    required
                  >
                    <option value="">Seleccione un producto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                    ))}
                  </Select>
                </FormGroup>

                {formData.tipo === 'Salida' && (
                  <FormGroup>
                    <Label>Destinatario / Usuario Interno (Obligatorio)</Label>
                    <Select
                      value={formData.destinatario_id || ''}
                      onChange={(e) => setFormData({ ...formData, destinatario_id: e.target.value })}
                      required={formData.tipo === 'Salida'}
                    >
                      <option value="">Seleccione el destinatario...</option>
                      {users.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.nombres} {u.apellidos}</option>
                      ))}
                    </Select>
                  </FormGroup>
                )}

                {formData.tipo === 'Entrada' && (
                  <FormGroup>
                    <Label>Proveedor</Label>
                    <Select
                      value={formData.proveedor_id || ''}
                      onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccione un proveedor...</option>
                      {providers.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </Select>
                  </FormGroup>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup>
                    <Label>Bodega</Label>
                    <Select
                      value={formData.bodega_id || ''}
                      onChange={(e) => setFormData({ ...formData, bodega_id: e.target.value })}
                      required
                    >
                      <option value="">Seleccione una bodega...</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.nombre}</option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.cantidad ?? 1}
                      onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </FormGroup>
                </div>
              </>
            )}

            {formData.tipo === 'Entrada' && entradaModo === 'Oficio' && (
              <>
                <FormGroup>
                  <Label>Bodega de Recepción</Label>
                  <Select
                    value={formData.bodega_id || ''}
                    onChange={(e) => setFormData({ ...formData, bodega_id: e.target.value })}
                    required
                  >
                    <option value="">Seleccione una bodega...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.nombre}</option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Seleccionar Oficio de Referencia</Label>
                  <Select
                    value={formData.pedido_id || ''}
                    onChange={(e) => {
                      const pedido = pedidos?.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        pedido_id: e.target.value,
                        proveedor_id: pedido?.proveedor_id || ''
                      });
                    }}
                  >
                    <option value="">Ninguno</option>
                    {pedidos?.map(p => (
                      <option key={p.id} value={p.id}>{p.codigo} - {new Date(p.creado_at).toLocaleDateString()}</option>
                    ))}
                  </Select>

                  {formData.pedido_id && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <ReceiveAllButton
                        type="button"
                        onClick={() => handleReceiveAll(pedidos?.find(p => p.id === formData.pedido_id))}
                      >
                        📥 Recibir Todo el Pedido (Carga Masiva)
                      </ReceiveAllButton>

                      <ItemsPreviewList>
                        <PreviewTableHeader>
                          <div>Producto</div>
                          <div>Cantidad</div>
                          <div>Precio Unit.</div>
                          <div>IVA (%)</div>
                          <div style={{ textAlign: 'right' }}>Total</div>
                        </PreviewTableHeader>

                        {pedidos?.find(p => p.id === formData.pedido_id)?.items?.map((item: any, idx: number) => {
                          const qty = getQtyFromItem(item);
                          const price = bulkPrices[item.nombre] || 0;
                          const iva = bulkIVA[item.nombre] ?? formData.iva_porcentaje ?? 19;
                          const rowSubtotal = (qty || 0) * price;
                          const rowTotal = rowSubtotal * (1 + (iva / 100));

                          return (
                            <PreviewItemRow
                              key={idx}
                              onClick={() => handleSelectItemFromList(item)}
                              title="Haz clic para cargar este producto individualmente"
                              style={{ borderLeft: qty === 0 ? '4px solid #ef4444' : 'none' }}
                            >
                              <PreviewItemName title={item.nombre}>{item.nombre}</PreviewItemName>
                              <PreviewItemQty $error={qty === null || qty === 0}>
                                {qty !== null ? `${qty} ${item.unidad || 'und'}` : 'Sin Dato'}
                                <span style={{ color: (qty === null || qty === 0) ? '#ef4444' : '#10b981' }}>
                                  {qty === 0 ? '⚠️ Cantidad 0 en Oficio' : (qty === null ? '⚠️ No detectada' : '✅ Detectada')}
                                </span>
                              </PreviewItemQty>
                              <Input
                                type="number"
                                placeholder="$ 0.00"
                                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                value={bulkPrices[item.nombre] ?? ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setBulkPrices({
                                  ...bulkPrices,
                                  [item.nombre]: parseFloat(e.target.value) || 0
                                })}
                              />
                              <Input
                                type="number"
                                placeholder="19%"
                                style={{ padding: '0.5rem', fontSize: '0.85rem' }}
                                value={bulkIVA[item.nombre] ?? (formData.iva_porcentaje || 19)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => setBulkIVA({
                                  ...bulkIVA,
                                  [item.nombre]: parseFloat(e.target.value) || 0
                                })}
                              />
                              <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>
                                ${rowTotal.toLocaleString()}
                              </div>
                            </PreviewItemRow>
                          );
                        })}
                      </ItemsPreviewList>
                    </div>
                  )}
                </FormGroup>
              </>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: entradaModo === 'Oficio' ? '1fr 1fr' : '1fr 1fr 1fr',
              gap: '1.5rem',
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              marginTop: '1rem'
            }}>
              {entradaModo === 'Manual' && (
                <FormGroup>
                  <Label>Valor Unitario ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_unitario ?? 0}
                    onChange={(e) => setFormData({ ...formData, valor_unitario: parseFloat(e.target.value) || 0 })}
                  />
                </FormGroup>
              )}

              {entradaModo === 'Oficio' ? (
                <FormGroup>
                  <Label>Subtotal Base (Sin IVA)</Label>
                  <Input
                    type="text"
                    value={`$ ${(pedidos?.find(p => p.id === formData.pedido_id)?.items?.reduce((acc: number, item: any) => {
                      const price = bulkPrices[item.nombre] || 0;
                      const qty = getQtyFromItem(item) || 0;
                      return acc + (price * qty);
                    }, 0) ?? 0).toLocaleString()}`}
                    readOnly
                    style={{ backgroundColor: '#f8fafc', fontWeight: '700', color: '#64748b' }}
                  />
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label>IVA (%)</Label>
                  <Input
                    type="number"
                    value={formData.iva_porcentaje ?? 0}
                    onChange={(e) => setFormData({ ...formData, iva_porcentaje: parseFloat(e.target.value) || 0 })}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label>{entradaModo === 'Oficio' ? 'Total con IVA ($)' : 'Valor Total (Calculado)'}</Label>
                <Input
                  type="text"
                  value={`$ ${(entradaModo === 'Oficio'
                    ? (pedidos?.find(p => p.id === formData.pedido_id)?.items?.reduce((acc: number, item: any) => {
                      const price = bulkPrices[item.nombre] || 0;
                      const qty = getQtyFromItem(item) || 0;
                      const iva = bulkIVA[item.nombre] ?? formData.iva_porcentaje ?? 19;
                      const subTotal = price * qty;
                      return acc + (subTotal * (1 + (iva / 100)));
                    }, 0) ?? 0)
                    : (formData.valor_total ?? 0)
                  ).toLocaleString()}`}
                  readOnly
                  style={{
                    backgroundColor: '#f0fdf4',
                    fontWeight: '800',
                    color: '#166534',
                    fontSize: '1.25rem',
                    height: 'auto',
                    padding: '0.75rem 1rem',
                    border: '2px solid #bbf7d0'
                  }}
                />
              </FormGroup>
            </div>

            {(formData.tipo === 'Salida' || entradaModo === 'Manual') && (
              <SaveButton type="submit">
                <Save size={20} />
                Guardar Movimiento
              </SaveButton>
            )}

            <FormGroup style={{ marginTop: '1rem' }}>
              <Label>Responsable (Usuario Logueado)</Label>
              <Input
                type="text"
                value={formData.responsable ?? ''}
                readOnly
                style={{ backgroundColor: 'var(--gray-100)', cursor: 'not-allowed' }}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Notas / Referencia</Label>
              <TextArea
                placeholder="Ej: Factura #123, Devolución cliente, etc."
                value={formData.notas || ''}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              />
            </FormGroup>
          </Form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default MovementModal;
