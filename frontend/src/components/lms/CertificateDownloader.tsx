'use client';

import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CertificatePDF } from './CertificatePDF';
import styled from 'styled-components';
import { Download } from 'lucide-react';

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #12A152;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #0e8543;
        transform: translateY(-1px);
    }

    &:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;

interface Props {
    studentName: string;
    courseName: string;
    date: string;
    verificationCode: string;
}

export default function CertificateDownloader({ studentName, courseName, date, verificationCode }: Props) {
    return (
        <PDFDownloadLink
            document={
                <CertificatePDF
                    studentName={studentName}
                    courseName={courseName}
                    date={date}
                    verificationCode={verificationCode}
                />
            }
            fileName={`Certificado-${courseName}.pdf`}
        >
            {({ loading }: any) => (
                <ActionButton disabled={loading}>
                    <Download size={18} /> {loading ? 'Preparando...' : 'Descargar Certificado'}
                </ActionButton>
            )}
        </PDFDownloadLink>
    );
}
