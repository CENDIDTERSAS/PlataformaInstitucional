import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1a73e8',
        paddingBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a73e8',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        color: '#5f6368',
    },
    table: {
        display: 'flex',
        width: 'auto',
        marginTop: 20,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 5,
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        fontWeight: 'bold',
    },
    col: {
        flex: 1,
        paddingHorizontal: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#bdc1c6',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    }
});

export const InventoryPDF = ({ data }: { data: any[] }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>Reporte de Inventario Institucional</Text>
                <Text style={styles.subtitle}>Estado actual del stock - {new Date().toLocaleDateString()}</Text>
            </View>

            <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.col, { flex: 2 }]}>Producto</Text>
                    <Text style={styles.col}>SKU</Text>
                    <Text style={styles.col}>Categoría</Text>
                    <Text style={styles.col}>Stock</Text>
                    <Text style={styles.col}>Precio</Text>
                </View>

                {data.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.col, { flex: 2 }]}>{item.nombre || item.name}</Text>
                        <Text style={styles.col}>{item.sku}</Text>
                        <Text style={styles.col}>{item.categoria || item.category}</Text>
                        <Text style={styles.col}>{item.stock}</Text>
                        <Text style={styles.col}>${item.precio || item.price}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>Documento generado automáticamente por el Sistema Institucional</Text>
        </Page>
    </Document>
);
