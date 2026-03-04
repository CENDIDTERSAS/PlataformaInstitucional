import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        paddingTop: 110,
        paddingBottom: 90,
        paddingHorizontal: 45,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    // Header Styles
    headerContainer: {
        position: 'absolute',
        top: 25,
        left: 45,
        right: 45,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottom: 0,
        paddingBottom: 10,
    },
    logoBox: {
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#4CAF50', // Verde institucional aproximado
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoSubtext: {
        fontSize: 6,
        color: '#666',
        textAlign: 'center',
    },
    divider: {
        width: 1.5,
        height: 70,
        backgroundColor: '#94b8d9', // Azul claro de la imagen
        marginHorizontal: 15,
    },
    headerInfo: {
        width: '65%',
        flexDirection: 'column',
        gap: 2,
    },
    locationTitle: {
        fontSize: 8,
        color: '#94b8d9',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    serviceText: {
        fontSize: 7,
        color: '#7ba7d1',
        lineHeight: 1.2,
    },
    nitHeader: {
        fontSize: 8,
        color: '#94b8d9',
        marginTop: 2,
    },

    // Body Styles
    docNumber: {
        textAlign: 'right',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 10,
    },
    dateLine: {
        marginBottom: 20,
    },
    addressSection: {
        marginBottom: 15,
    },
    bold: {
        fontWeight: 'bold',
        color: '#000',
    },
    subjectSection: {
        marginBottom: 15,
    },
    greeting: {
        marginBottom: 10,
    },
    introText: {
        marginBottom: 15,
        lineHeight: 1.4,
        textAlign: 'justify',
    },
    table: {
        display: 'table' as any,
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#000',
        marginBottom: 15,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        minHeight: 22,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#fff',
    },
    tableCol: {
        padding: 4,
        borderRightWidth: 1,
        borderColor: '#000',
    },
    col1: { width: '10%', textAlign: 'center' }, // ITEM
    col2: { width: '70%', paddingLeft: 8 }, // ELEMENTOS
    col3: { width: '20%', textAlign: 'center', borderRightWidth: 0 }, // CANTIDAD

    signatureContainer: {
        marginTop: 30,
    },
    signatureImage: {
        width: 140,
        height: 60,
        marginBottom: 2,
        objectFit: 'contain',
    },
    signatureLine: {
        width: 220,
        borderTopWidth: 1,
        borderColor: '#000',
        marginTop: 2,
    },
    signatureName: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },

    // Footer Styles
    footerContainer: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    footerLine: {
        width: '100%',
        height: 0.5,
        backgroundColor: '#eee',
        marginBottom: 5,
    },
    footerText: {
        fontSize: 6.5,
        color: '#666',
        textAlign: 'center',
        lineHeight: 1.3,
    },
    linkText: {
        color: '#1a73e8',
        textDecoration: 'underline',
    }
});

interface OrderItem {
    id: string;
    nombre: string;
    codigo: string;
    cantidadPedida: number;
}

interface Personnel {
    nombres: string;
    apellidos: string;
    identificacion?: string;
    dependencia?: string;
    cargo?: string;
    firma_url?: string;
    rol?: string;
}

interface ProveedorOficioPdfProps {
    items: OrderItem[];
    user: Personnel;
    adminPersonnel?: Personnel;
    proveedor?: {
        nombre: string;
        nit?: string;
        direccion?: string;
        email?: string;
        telefono?: string;
        departamento?: string;
        ciudad?: string;
    };
}

const ProveedorOficioPdf: React.FC<ProveedorOficioPdfProps> = ({ items, user, adminPersonnel, proveedor }) => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const now = new Date();
    const dateStr = `Mocoa, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;

    // Formato solicitado: OFE-PP-TI-AÑO-MES-DIA
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const opNumber = `OFE-PP-TI-${year}-${month}-${day}`;

    // Persona que autoriza (Admin)
    const authorizer = adminPersonnel || {
        nombres: 'RAFAEL RICARDO',
        apellidos: 'DAZA SOLARTE',
        identificacion: '1124863799',
        dependencia: 'GERENCIA',
        cargo: 'ADMINISTRADOR',
        rol: 'Administrador'
    };

    // ¿Es el usuario actual el mismo administrador?
    const isUserAdmin = user.rol === 'Administrador' || (user.nombres === authorizer.nombres && user.apellidos === authorizer.apellidos);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* ENCABEZADO CONSTRUIDO */}
                <View style={styles.headerContainer} fixed>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoText}>CENDIDTER</Text>
                        <Text style={styles.logoSubtext}>Centro de imágenes Diagnósticas tercer Milenio</Text>
                        <Text style={styles.logoSubtext}>NIT. 900055393-0</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.headerInfo}>
                        <Text style={styles.locationTitle}>MOCOA - PUTUMAYO:</Text>
                        <Text style={styles.serviceText}>
                            TOMOGRAFÍA - RESONANCIA MAGNÉTICA NUCLEAR - ECOGRAFIA COLOR - DOPPLER - RAYOS X
                            CONVENCIONAL Y EXAMENES ESPECIALES - MAMOGRAFIA – MONITORIA FETAL –
                            ELECTROCARDIOGRAMA – HOLTER – MONITOREO ARTERIAL
                        </Text>
                        <Text style={styles.nitHeader}>NIT. 900055393-0</Text>

                        <View style={{ marginTop: 4 }}>
                            <Text style={styles.locationTitle}>ARMENIA – QUINDÍO:</Text>
                            <Text style={styles.serviceText}>
                                TOMOGRAFÍA - ECOGRAFÍA COLOR - DOPPLER - RAYOS X CONVENCIONAL Y EXÁMENES
                                ESPECIALES - MAMOGRAFÍA
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CUERPO DEL DOCUMENTO */}
                <Text style={styles.docNumber}>{opNumber}</Text>

                <View style={styles.dateLine}>
                    <Text>{dateStr}</Text>
                </View>

                <View style={styles.addressSection}>
                    <Text style={styles.bold}>Señores:</Text>
                    <Text style={styles.bold}>{proveedor?.nombre || 'PAPELERIA POR DEFINIR'}</Text>
                    {proveedor?.nit && <Text>NIT. {proveedor.nit}</Text>}
                    {proveedor?.direccion && <Text>{proveedor.direccion}</Text>}
                    {(proveedor?.ciudad || proveedor?.departamento) && (
                        <Text>
                            {proveedor.ciudad}{proveedor.ciudad && proveedor.departamento ? ', ' : ''}{proveedor.departamento}
                        </Text>
                    )}
                </View>

                <View style={styles.subjectSection}>
                    <Text style={styles.bold}>Asunto: <Text style={{ fontWeight: 'normal' }}>SOLICITUD DE PAPELERIA</Text></Text>
                </View>

                <Text style={styles.greeting}>Cordial saludo,</Text>

                <Text style={styles.introText}>
                    De manera respetuosa nos dirigimos a ustedes con el fin de solicitar los siguientes elementos de papelería.
                </Text>

                {/* Tabla */}
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={[styles.tableCol, styles.col1]}><Text style={styles.bold}>ITEM</Text></View>
                        <View style={[styles.tableCol, styles.col2]}><Text style={styles.bold}>ELEMENTOS</Text></View>
                        <View style={[styles.tableCol, styles.col3]}><Text style={styles.bold}>CANTIDAD</Text></View>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={[styles.tableCol, styles.col1]}><Text>{index + 1}</Text></View>
                            <View style={[styles.tableCol, styles.col2]}><Text>{item.nombre.toUpperCase()}</Text></View>
                            <View style={[styles.tableCol, styles.col3]}><Text>{item.cantidadPedida}</Text></View>
                        </View>
                    ))}
                </View>

                <Text style={styles.introText}>
                    Los elementos mencionados fueron solicitados a través de correo electrónico utilizando la plantilla de solicitud designada por el área de SISTEMAS, la cual está a cargo de gestionar el suministro de papelería para CENDIDTER S.A.S
                </Text>

                {/* SECCIÓN DE FIRMAS */}
                <View style={[styles.signatureContainer, { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }]}>

                    {/* Columna Solicitante (Si no es el admin) */}
                    {!isUserAdmin ? (
                        <View style={{ width: '45%' }}>
                            <Text style={styles.bold}>Solicitante,</Text>
                            <View style={{ marginTop: 25 }}>
                                {user.firma_url && (
                                    <Image src={user.firma_url} style={styles.signatureImage} />
                                )}
                                <View style={styles.signatureLine} />
                                <Text style={styles.signatureName}>{(user.nombres || '').toUpperCase()} {(user.apellidos || '').toUpperCase()}</Text>
                                <Text>C.C {user.identificacion || ''}</Text>
                                <Text style={styles.bold}>CENDIDTER S.A.S</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={{ width: '45%' }} /> // Espacio vacío si el solicitante es el mismo admin
                    )}

                    {/* Columna Autorizado (Admin) */}
                    <View style={{ width: '45%' }}>
                        <Text style={styles.bold}>Autorizado por,</Text>
                        <View style={{ marginTop: 25 }}>
                            {authorizer.firma_url && (
                                <Image src={authorizer.firma_url} style={styles.signatureImage} />
                            )}
                            <View style={styles.signatureLine} />
                            <Text style={styles.signatureName}>{(authorizer.nombres || '').toUpperCase()} {(authorizer.apellidos || '').toUpperCase()}</Text>
                            <Text>C.C {authorizer.identificacion || ''}</Text>
                            {authorizer.dependencia && <Text>{authorizer.dependencia.toUpperCase()}</Text>}
                            <Text style={styles.bold}>CENDIDTER S.A.S</Text>
                        </View>
                    </View>
                </View>

                {/* PIE DE PÁGINA CONSTRUIDO */}
                <View style={styles.footerContainer} fixed>
                    <View style={styles.footerLine} />
                    <Text style={styles.footerText}>
                        Mocoa Putumayo - Calle 14 No 12-81 Tel: (8) 420 43 38 – 420 4506 Ext 101 -102{"\n"}
                        Cel. 320 305 4568 WhatsApp Información Administrativa Tel 420 09 95 ext: 104{"\n"}
                        Correo Electrónico: gerencia@cendidter.com asistente@cendidter.com{"\n"}
                        Armenia - Quindío Calle 1 N° 12 – 17, 2° PISO, Consultorio 217 Complejo empresarial Luxor{"\n"}
                        Información Administrativa: 7375855 - 3182393229 – 3115101764{"\n"}
                        Correo Electrónico: administrativo@cendidter.com gerencia@cendidter.com asistente@cendidter.com
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ProveedorOficioPdf;
