'use client';

import React from 'react';
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
    Font
} from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#ffffff',
        borderWidth: 8,
        borderStyle: 'solid',
        borderColor: '#12A152',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#eeeeee',
    },
    title: {
        fontSize: 34,
        color: '#12A152',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    text: {
        fontSize: 18,
        color: '#333333',
        marginBottom: 12,
        textAlign: 'center',
    },
    footer: {
        fontSize: 10,
        color: '#999999',
        marginTop: 50,
        textAlign: 'center',
    }
});

export const CertificatePDF = ({ studentName, courseName, date, verificationCode }: any) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.container}>
                <Text style={styles.title}>
                    CERTIFICADO DE PRUEBA
                </Text>
                <Text style={styles.text}>
                    Aqui estaria el diseño del certificado real.
                </Text>
                <Text style={styles.text}>
                    Estudiante: {studentName}
                </Text>
                <Text style={styles.text}>
                    Curso: {courseName}
                </Text>
                <Text style={styles.text}>
                    Fecha: {date}
                </Text>
                <Text style={styles.footer}>
                    Codigo de verificacion: {verificationCode || 'TEST-CODE'} | Sistema de Acreditacion Cendidter
                </Text>
            </View>
        </Page>
    </Document>
);
