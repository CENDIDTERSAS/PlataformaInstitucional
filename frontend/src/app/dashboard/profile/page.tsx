'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { User, Save, Eye, EyeOff, Mail, Building2, Briefcase, Shield, Camera, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

const Container = styled.div`
  padding: 2.5rem 1.5rem;
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 2.5rem;
  border: 1px solid var(--gray-100);
  position: relative;
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

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
`;

const PhotoContainer = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const PhotoPreview = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 24px;
  overflow: hidden;
  border: 4px solid var(--white);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background: var(--gray-100);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PhotoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--sidebar-dark) 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 700;
`;

const EditPhotoButton = styled.label`
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 40px;
  height: 40px;
  background: var(--primary);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(18, 161, 82, 0.3);
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: #0e8a45;
  }

  input { display: none; }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 0.5rem;
`;

const HeaderBadges = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`;

const Badge = styled.span<{ $type?: 'role' | 'status' | 'email' }>`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-size: 0.825rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.$type === 'role' && `
    background: rgba(18, 161, 82, 0.1);
    color: var(--primary);
  `}
  
  ${props => props.$type === 'status' && `
    background: rgba(18, 161, 82, 0.1);
    color: var(--primary);
  `}

  ${props => props.$type === 'email' && `
    background: var(--gray-100);
    color: var(--secondary);
  `}
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  border: 1px solid var(--gray-100);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-100);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text);
  }

  svg {
    color: var(--primary);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--secondary);
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 1rem;
    color: var(--secondary);
    opacity: 0.5;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 2.8rem;
  border-radius: 12px;
  border: 1.5px solid var(--gray-100);
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #fdfdfd;
  
  &:focus {
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 4px rgba(18, 161, 82, 0.05);
  }
  
  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SignatureBox = styled.div`
  background: #fafafa;
  border: 2px dashed var(--gray-100);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  transition: all 0.2s;

  &:hover {
    border-color: var(--primary);
    background: white;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'secondary' ? 'white' : 'var(--primary)'};
  color: ${props => props.$variant === 'secondary' ? 'var(--text)' : 'white'};
  border: ${props => props.$variant === 'secondary' ? '1.5px solid var(--gray-100)' : 'none'};
  padding: 0.85rem 1.75rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
    ${props => props.$variant !== 'secondary' && 'opacity: 0.95;'}
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyProfilePage() {
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        identificacion: '',
        dependencia: '',
        cargo: '',
        foto_url: '',
        firma_url: ''
    });

    // Obtener perfil del usuario actual
    const { data: profile, isLoading } = useQuery({
        queryKey: ['my-profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const res = await fetch(`${API_URL}/profile/${user.id}`);
            return res.json();
        }
    });

    // Actualizar formData cuando se cargue el perfil
    useEffect(() => {
        if (profile) {
            setFormData({
                nombres: profile.nombres || '',
                apellidos: profile.apellidos || '',
                identificacion: profile.identificacion || '',
                dependencia: profile.dependencia || '',
                cargo: profile.cargo || '',
                foto_url: profile.foto_url || '',
                firma_url: profile.firma_url || ''
            });
        }
    }, [profile]);

    // Función para subir foto
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño original (máximo 10MB antes de compresión)
        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen no debe superar los 10MB');
            return;
        }

        try {
            setUploadingPhoto(true);

            // Opciones de compresión
            const options = {
                maxSizeMB: 0.5, // Tamaño máximo 500KB
                maxWidthOrHeight: 800, // Resolución máxima 800px
                useWebWorker: true,
                fileType: 'image/jpeg' // Convertir a JPEG para mejor compresión
            };

            // Comprimir la imagen
            const compressedFile = await imageCompression(file, options);
            console.log('Tamaño original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('Tamaño comprimido:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            // Generar nombre único para el archivo
            const fileName = `${user.id}.jpg`; // Siempre .jpg porque convertimos a JPEG

            // Subir a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('FotosPersonal')
                .upload(fileName, compressedFile, { upsert: true });

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('FotosPersonal')
                .getPublicUrl(fileName);

            // Actualizar perfil con la URL usando el cliente de Supabase directamente (respeta RLS)
            const { error: dbError } = await supabase
                .from('perfiles')
                .update({
                    foto_url: `${publicUrl}?t=${Date.now()}`
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            // Refrescar datos
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            alert('✅ Foto actualizada correctamente\n📊 Reducción: ' +
                ((1 - compressedFile.size / file.size) * 100).toFixed(0) + '%');
        } catch (error: any) {
            alert(`Error al subir foto: ${error.message}`);
        } finally {
            setUploadingPhoto(false);
        }
    };

    // Función para subir firma
    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        try {
            setUploadingSignature(true);

            // Opciones de compresión para firmas (más agresiva, mantenemos transparencia)
            const options = {
                maxSizeMB: 0.2,
                maxWidthOrHeight: 600,
                useWebWorker: true,
                fileType: 'image/png'
            };

            const compressedFile = await imageCompression(file, options);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            // Nombre único para la firma
            const fileName = `signature_${user.id}.png`;

            // Subir a Supabase Storage (Bucket "FirmasPersonal" debe existir)
            const { error: uploadError } = await supabase.storage
                .from('FirmasPersonal')
                .upload(fileName, compressedFile, { upsert: true });

            if (uploadError) throw uploadError;

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('FirmasPersonal')
                .getPublicUrl(fileName);

            // Actualizar perfil con la URL de la firma usando Supabase directamente
            const { error: dbError } = await supabase
                .from('perfiles')
                .update({
                    firma_url: `${publicUrl}?t=${Date.now()}`
                })
                .eq('id', user.id);

            if (dbError) throw dbError;

            // Refrescar datos
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            alert('✅ Firma actualizada correctamente');
        } catch (error: any) {
            alert(`Error al subir firma: ${error.message}`);
        } finally {
            setUploadingSignature(false);
        }
    };

    // Mutation para actualizar perfil propio
    const updateProfileMutation = useMutation({
        mutationFn: async (data: any) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { password, ...profileData } = data;

            // Actualizar perfil usando Supabase directamente (respeta RLS y es más seguro)
            const { error: profileError } = await supabase
                .from('perfiles')
                .update(profileData)
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Si hay cambio de contraseña, seguimos usando el backend
            // (Nota: el backend requerirá el SERVICE_ROLE_KEY si falla)

            // Si hay cambio de contraseña
            if (password) {
                const passRes = await fetch(`${API_URL}/users/${user.id}/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                if (!passRes.ok) throw new Error('Error al cambiar contraseña');
            }

            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            // Forzar actualización inmediata del sidebar y otros componentes
            queryClient.refetchQueries({ queryKey: ['my-profile'] });
            alert('Perfil actualizado correctamente');
            setChangePassword(false);
            setNewPassword('');
        },
        onError: (error: any) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({
            ...formData,
            rol: profile?.rol, // Mantener rol actual
            estado: profile?.estado, // Mantener estado actual
            ...(changePassword && newPassword ? { password: newPassword } : {})
        });
    };

    if (isLoading) {
        return (
            <Container>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner">Cargando perfil...</div>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <ProfileHeader>
                <PhotoContainer>
                    <PhotoPreview>
                        {profile?.foto_url ? (
                            <img src={profile.foto_url} alt="Foto de perfil" />
                        ) : (
                            <PhotoPlaceholder>
                                {profile?.nombres?.charAt(0)}{profile?.apellidos?.charAt(0)}
                            </PhotoPlaceholder>
                        )}
                    </PhotoPreview>
                    <EditPhotoButton>
                        {uploadingPhoto ? <div style={{ fontSize: '10px' }}>...</div> : <Camera size={20} />}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                        />
                    </EditPhotoButton>
                </PhotoContainer>

                <HeaderInfo>
                    <Title>{profile?.nombres} {profile?.apellidos}</Title>
                    <HeaderBadges>
                        <Badge $type="role">
                            <Shield size={14} />
                            {profile?.rol || 'Usuario'}
                        </Badge>
                        <Badge $type="status">
                            {profile?.estado || 'Activo'}
                        </Badge>
                        <Badge $type="email">
                            <Mail size={14} />
                            {profile?.email}
                        </Badge>
                    </HeaderBadges>
                </HeaderInfo>
            </ProfileHeader>

            <form onSubmit={handleSubmit}>
                <Grid>
                    <Card>
                        <SectionHeader>
                            <User size={22} />
                            <h2>Datos Personales</h2>
                        </SectionHeader>

                        <FormGrid>
                            <FormGroup>
                                <Label>Nombres</Label>
                                <InputWrapper>
                                    <User size={18} />
                                    <Input
                                        value={formData.nombres}
                                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                                        required
                                        placeholder="Tus nombres"
                                    />
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup>
                                <Label>Apellidos</Label>
                                <InputWrapper>
                                    <User size={18} />
                                    <Input
                                        value={formData.apellidos}
                                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                                        required
                                        placeholder="Tus apellidos"
                                    />
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup>
                                <Label>Número de Identificación</Label>
                                <InputWrapper>
                                    <Shield size={18} />
                                    <Input
                                        value={formData.identificacion}
                                        onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                                        placeholder="C.C. / T.I. / NIT"
                                        required
                                    />
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    Dependencia
                                </Label>
                                <InputWrapper>
                                    <Building2 size={18} />
                                    <Input
                                        value={formData.dependencia}
                                        onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                                        required
                                        placeholder="Tu departamento"
                                    />
                                </InputWrapper>
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    Cargo / Puesto
                                </Label>
                                <InputWrapper>
                                    <Briefcase size={18} />
                                    <Input
                                        value={formData.cargo}
                                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                                        required
                                        placeholder="Nombre de tu cargo"
                                    />
                                </InputWrapper>
                            </FormGroup>
                        </FormGrid>
                    </Card>

                    <Card>
                        <SectionHeader>
                            <Save size={22} />
                            <h2>Firma Digital e Institucional</h2>
                        </SectionHeader>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '2rem', alignItems: 'center' }}>
                            <SignatureBox>
                                {profile?.firma_url ? (
                                    <img src={profile.firma_url} alt="Firma digital" style={{ maxWidth: '100%', height: 'auto', maxHeight: '120px', objectFit: 'contain' }} />
                                ) : (
                                    <div style={{ textAlign: 'center', opacity: 0.5 }}>
                                        <Upload size={32} />
                                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No hay firma cargada</p>
                                    </div>
                                )}

                                <ActionButton type="button" $variant="secondary" as="label" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                                    <Upload size={14} />
                                    {uploadingSignature ? 'Subiendo...' : 'Subir Nueva'}
                                    <input type="file" accept="image/*" onChange={handleSignatureUpload} style={{ display: 'none' }} disabled={uploadingSignature} />
                                </ActionButton>
                            </SignatureBox>

                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Instrucciones de Firma</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: '1.5' }}>
                                    Carga una imagen clara de tu firma sobre fondo blanco o transparente. Esta se utilizará para generar certificados y documentos oficiales.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <SectionHeader>
                            <Shield size={22} />
                            <h2>Seguridad de la Cuenta</h2>
                        </SectionHeader>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500' }}>
                                <input
                                    type="checkbox"
                                    checked={changePassword}
                                    onChange={(e) => setChangePassword(e.target.checked)}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                                />
                                Deseo cambiar mi contraseña de acceso
                            </label>
                        </div>

                        {changePassword && (
                            <FormGroup style={{ maxWidth: '400px' }}>
                                <Label>Nueva Contraseña</Label>
                                <div style={{ position: 'relative' }}>
                                    <Input
                                        style={{ paddingLeft: '1rem' }}
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required={changePassword}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </FormGroup>
                        )}
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                        <ActionButton type="submit" disabled={updateProfileMutation.isPending} style={{ minWidth: '200px' }}>
                            <Save size={20} />
                            {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Perfil Ejecutivo'}
                        </ActionButton>
                    </div>
                </Grid>
            </form>
        </Container>
    );
}
