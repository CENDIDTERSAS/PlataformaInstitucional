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

interface ImportUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (users: any[]) => Promise<void>;
}

export default function ImportUsersModal({ isOpen, onClose, onImport }: ImportUsersModalProps) {
    const [users, setUsers] = useState<any[]>([]);
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
                const processedUsers = jsonData.map((row: any, index) => {
                    const user = {
                        nombres: row.nombres || row.Nombres || '',
                        apellidos: row.apellidos || row.Apellidos || '',
                        email: row.email || row.Email || '',
                        identificacion: row.identificacion || row.Identificacion || '',
                        contacto: row.contacto || row.Contacto || '',
                        dependencia: row.dependencia || row.Dependencia || '',
                        cargo: row.cargo || row.Cargo || '',
                        rol: row.rol || row.Rol || 'Colaborador'
                    };

                    // Validaciones
                    if (!user.nombres || !user.apellidos) {
                        errors.push(`Fila ${index + 2}: Nombres y apellidos son requeridos`);
                    }
                    if (!user.email || !user.email.includes('@')) {
                        errors.push(`Fila ${index + 2}: Email inválido`);
                    }
                    if (!['Administrador', 'Supervisor', 'Colaborador'].includes(user.rol)) {
                        user.rol = 'Colaborador'; // Default
                    }

                    return user;
                });

                setUsers(processedUsers);
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
            await onImport(users);
            setUsers([]);
            setFileName('');
            onClose();
        } catch (error) {
            console.error('Error importing users:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                nombres: 'Juan',
                apellidos: 'Pérez',
                email: 'juan.perez@example.com',
                identificacion: '123456789',
                contacto: '555-0100',
                dependencia: 'IT',
                cargo: 'Desarrollador',
                rol: 'Colaborador'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
        XLSX.writeFile(wb, 'plantilla_usuarios.xlsx');
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
                        Importar Usuarios desde Excel
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

                    {users.length > 0 && (
                        <>
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                                Preview ({users.length} usuarios)
                            </h3>
                            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                <PreviewTable>
                                    <thead>
                                        <tr>
                                            <th>Nombre Completo</th>
                                            <th>Email</th>
                                            <th>Dependencia</th>
                                            <th>Rol</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 10).map((user, index) => (
                                            <tr key={index}>
                                                <td>{user.nombres} {user.apellidos}</td>
                                                <td>{user.email}</td>
                                                <td>{user.dependencia}</td>
                                                <td>{user.rol}</td>
                                                <td>
                                                    {user.nombres && user.email ? (
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
                            {users.length > 10 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
                                    Mostrando 10 de {users.length} usuarios
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <Button $variant="primary" onClick={handleImport} disabled={isProcessing || validationErrors.length > 0}>
                                    <Upload size={18} />
                                    {isProcessing ? 'Importando...' : `Importar ${users.length} Usuarios`}
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
