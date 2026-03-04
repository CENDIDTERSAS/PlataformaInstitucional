'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  &:hover {
    background: var(--gray-100);
  }
`;

const UploadZone = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  border: 2px dashed var(--primary);
  border-radius: 12px;
  background: var(--gray-50);
  cursor: pointer;
  transition: all 0.3s;
  margin: 1.5rem 0;
  
  &:hover {
    background: var(--primary-light);
    border-color: var(--primary);
  }
  
  input {
    display: none;
  }
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--gray-100);
  }
  
  th {
    background: var(--gray-50);
    font-weight: 600;
    color: var(--secondary);
  }
  
  tr:hover {
    background: var(--gray-50);
  }
`;

const StatusBadge = styled.span<{ $type: 'success' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => props.$type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$type === 'success' ? '#155724' : '#721c24'};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: var(--primary);
    color: white;
    &:hover { opacity: 0.9; }
  ` : `
    background: var(--gray-100);
    color: var(--secondary);
    &:hover { background: var(--gray-200); }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (products: any[]) => Promise<void>;
}

export default function ImportProductsModal({ isOpen, onClose, onImport }: ImportProductsModalProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Validar y normalizar datos
                const errors: string[] = [];
                const processedProducts = jsonData.map((row: any, index) => {
                    const product = {
                        nombre: row.nombre || row.Nombre || '',
                        categoria: row.categoria || row.Categoria || '',
                        cantidad: parseFloat(row.cantidad || row.Cantidad || 0),
                        precio_unitario: parseFloat(row.precio_unitario || row['Precio Unitario'] || row.precio || 0),
                        bodega: row.bodega || row.Bodega || 'Principal',
                        ubicacion: row.ubicacion || row.Ubicacion || '',
                        descripcion: row.descripcion || row.Descripcion || ''
                    };

                    // Validaciones
                    if (!product.nombre) {
                        errors.push(`Fila ${index + 2}: Nombre es requerido`);
                    }
                    if (isNaN(product.cantidad) || product.cantidad < 0) {
                        errors.push(`Fila ${index + 2}: Cantidad inválida`);
                    }
                    if (isNaN(product.precio_unitario) || product.precio_unitario < 0) {
                        errors.push(`Fila ${index + 2}: Precio inválido`);
                    }

                    return product;
                });

                setProducts(processedProducts);
                setValidationErrors(errors);
            } catch (error) {
                alert('Error al leer el archivo. Asegúrate de que sea un archivo Excel válido.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (validationErrors.length > 0) {
            alert('Por favor corrige los errores antes de importar');
            return;
        }

        setIsProcessing(true);
        try {
            await onImport(products);
            setProducts([]);
            setFileName('');
            onClose();
        } catch (error) {
            console.error('Error importing products:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                nombre: 'Laptop HP Pavilion',
                categoria: 'Electrónica',
                cantidad: 10,
                precio_unitario: 899.99,
                bodega: 'Principal',
                ubicacion: 'A-1',
                descripcion: 'Laptop para oficina'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');
        XLSX.writeFile(wb, 'plantilla_productos.xlsx');
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
                <ModalContent
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <CloseButton onClick={onClose}><X size={24} /></CloseButton>

                    <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileSpreadsheet size={28} />
                        Importar Productos desde Excel
                    </h2>

                    <Button $variant="secondary" onClick={downloadTemplate} style={{ marginBottom: '1rem' }}>
                        <Download size={18} />
                        Descargar Plantilla
                    </Button>

                    <UploadZone>
                        <Upload size={48} color="var(--primary)" />
                        <p style={{ marginTop: '1rem', fontWeight: 600 }}>
                            {fileName || 'Click para seleccionar archivo Excel'}
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                            Formatos: .xlsx, .xls
                        </p>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                        />
                    </UploadZone>

                    {validationErrors.length > 0 && (
                        <div style={{ background: '#f8d7da', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <h4 style={{ color: '#721c24', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle size={18} />
                                Errores de Validación:
                            </h4>
                            <ul style={{ marginLeft: '1.5rem', color: '#721c24' }}>
                                {validationErrors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {products.length > 0 && (
                        <>
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                Preview ({products.length} productos)
                            </h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                <PreviewTable>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Categoría</th>
                                            <th>Cantidad</th>
                                            <th>Precio</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.slice(0, 10).map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.nombre}</td>
                                                <td>{product.categoria}</td>
                                                <td>{product.cantidad}</td>
                                                <td>${product.precio_unitario.toFixed(2)}</td>
                                                <td>
                                                    {product.nombre && !isNaN(product.cantidad) && !isNaN(product.precio_unitario) ? (
                                                        <StatusBadge $type="success">
                                                            <CheckCircle size={14} />
                                                            Válido
                                                        </StatusBadge>
                                                    ) : (
                                                        <StatusBadge $type="error">
                                                            <AlertCircle size={14} />
                                                            Error
                                                        </StatusBadge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </PreviewTable>
                            </div>
                            {products.length > 10 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                                    Mostrando 10 de {products.length} productos
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <Button $variant="primary" onClick={handleImport} disabled={isProcessing || validationErrors.length > 0}>
                                    <Upload size={18} />
                                    {isProcessing ? 'Importando...' : `Importar ${products.length} Productos`}
                                </Button>
                                <Button $variant="secondary" onClick={onClose}>
                                    Cancelar
                                </Button>
                            </div>
                        </>
                    )}
                </ModalContent>
            </Overlay>
        </AnimatePresence>
    );
}
