'use client';

import React from 'react';
import styled from 'styled-components';
import { HeartPulse } from 'lucide-react';

const ReportFrame = styled.div`
  background: white; padding: 0; width: 100%; max-width: 1024px;
  margin: 0 auto 2cm auto; border: 2px solid #000; font-family: Arial, Helvetica, sans-serif;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); color: #000;
  @media print { 
    margin: 0 0 1cm 0; 
    box-shadow: none; 
    border: 1px solid #000; 
    width: 100%; 
    max-width: none;
    page-break-after: always;
  }
  * { box-sizing: border-box; }
`;

const HFTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  
  td, th {
    border: 1px solid #000;
    padding: 2px 4px;
    vertical-align: middle;
    font-size: 0.62rem;
    overflow: hidden;
    height: 20px;
    text-align: left;
  }

  .label { font-weight: 900; text-transform: uppercase; font-size: 0.58rem; }
  .value { font-weight: normal; text-transform: uppercase; font-size: 0.6rem; }
  .banner { background: #00A651; color: white; text-align: center; font-weight: 900; text-transform: uppercase; font-size: 0.75rem; padding: 4px; }
  .bg-green-light { background: #e8f5e9; font-weight: 900; text-align: center; text-transform: uppercase; font-size: 0.6rem; }
  
  .check-box {
    border: 1px solid #000;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 0.85rem;
    margin: 0 auto;
    background: #fff;
  }

  .sub-label {
    font-size: 0.5rem;
    font-weight: 900;
    text-align: center;
    background: #fff;
  }
`;

const LogoBox = styled.div`
  display: flex; align-items: center; justify-content: center; height: 100%;
  img { max-width: 120px; height: auto; }
`;

interface Props {
    equipo: any;
    mantenimientos: any[];
    contrato?: any;
}

export default function HojaVidaReport({ equipo, mantenimientos, contrato }: Props) {
    const renderX = (val: boolean | undefined) => (
        <div className="check-box">{val ? 'X' : ''}</div>
    );

    const dAdq = equipo.fecha_adquisicion ? new Date(equipo.fecha_adquisicion) : null;
    const dInst = equipo.fecha_instalacion ? new Date(equipo.fecha_instalacion) : null;

    const sortedMantenimientos = [...mantenimientos].sort((a: any, b: any) =>
        new Date(b.fecha_ejecucion).getTime() - new Date(a.fecha_ejecucion).getTime()
    );

    return (
        <ReportFrame className="si-es-fr-03-report">
            <HFTable>
                <colgroup>
                    {[...Array(120)].map((_, i) => <col key={i} width={`${100 / 120}%`} />)}
                </colgroup>
                <tbody>
                    {/* HEADER */}
                    <tr>
                        <td colSpan={24} rowSpan={4} style={{ padding: '2px' }}>
                            <LogoBox><img src="https://static.wixstatic.com/media/5e490a_686259e8636e4f57a3fb96e8e815e9e0~mv2.png/v1/fill/w_130,h_100,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20Cendidter%20Final.png" alt="CENDIDTER" /></LogoBox>
                        </td>
                        <td colSpan={72} rowSpan={4} style={{ textAlign: 'center', padding: '10px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>DEPARTAMENTO DE INGENIERIA BIOMEDICA</h3>
                            <h2 style={{ margin: '6px 0', fontSize: '1.8rem', fontWeight: 900 }}>HOJA DE VIDA EQUIPO BIOMEDICOS</h2>
                        </td>
                        <td colSpan={24} className="label">VERSION: 01</td>
                    </tr>
                    <tr><td colSpan={24} className="label">CODIGO: SIES-FR-03</td></tr>
                    <tr><td colSpan={24} className="label">VIGENTE DESDE: 25-09-2018</td></tr>
                    <tr><td colSpan={24}></td></tr>

                    {/* SECTION I */}
                    <tr><td colSpan={120} className="banner">INFORMACIÓN BASICA DEL EQUIPO</td></tr>
                    <tr>
                        <td colSpan={30} className="label">NOMBRE</td>
                        <td colSpan={30} className="value" style={{ fontWeight: 'bold' }}>{equipo.nombre}</td>
                        <td colSpan={60} className="banner" style={{ borderBottom: 'none' }}>IMAGEN DEL EQUIPO</td>
                    </tr>
                    <tr>
                        <td colSpan={30} className="label">MARCA:</td>
                        <td colSpan={30} className="value">{equipo.marca}</td>
                        <td colSpan={60} rowSpan={8} style={{ textAlign: 'center', padding: '4px' }}>
                            <div style={{ height: '160px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HeartPulse size={80} strokeWidth={0.1} color="#eee" />
                            </div>
                        </td>
                    </tr>
                    <tr><td colSpan={30} className="label">MODELO:</td><td colSpan={30} className="value">{equipo.modelo}</td></tr>
                    <tr><td colSpan={30} className="label">SERIE:</td><td colSpan={30} className="value">{equipo.serie}</td></tr>
                    <tr><td colSpan={30} className="label">CODIGO INVENTARIO</td><td colSpan={30} className="value">{equipo.codigo_inventario}</td></tr>
                    <tr><td colSpan={30} className="label">CLASE DE RIESGO</td><td colSpan={30} className="value">{equipo.clase_riesgo}</td></tr>
                    <tr><td colSpan={30} className="label">UBICACIÓN</td><td colSpan={30} className="value">{equipo.bodegas?.nombre || 'AREA HOSPITALARIA'}</td></tr>
                    <tr><td colSpan={30} className="label">SEDE</td><td colSpan={30} className="value">{equipo.sede || '---'}</td></tr>
                    <tr><td colSpan={30} className="label">REGISTRO INVIMA</td><td colSpan={30} className="value">{equipo.registro_invima}</td></tr>

                    {/* ADQUISICION & TUBO RX */}
                    <tr>
                        <td colSpan={30} rowSpan={2} className="label">TIPO DE ADQUISICION</td>
                        <td colSpan={10} className="sub-label">PRESTAMO</td>
                        <td colSpan={10} className="sub-label">COMPRA</td>
                        <td colSpan={10} className="sub-label">DONACION</td>
                        <td colSpan={60} className="bg-green-light">INFORMACIÓN DETALLADA TUBO RX</td>
                    </tr>
                    <tr>
                        <td colSpan={10} style={{ textAlign: 'center' }}>{renderX(equipo.tipo_adquisicion === 'Préstamo')}</td>
                        <td colSpan={10} style={{ textAlign: 'center' }}>{renderX(equipo.tipo_adquisicion === 'Compra')}</td>
                        <td colSpan={10} style={{ textAlign: 'center' }}>{renderX(equipo.tipo_adquisicion === 'Donación')}</td>
                        <td colSpan={12} className="label">MARCA:</td><td colSpan={18} className="value">{equipo.tubo_marca || '---'}</td>
                        <td colSpan={15} className="label">AÑO FABRICA.:</td><td colSpan={15} className="value">{equipo.tubo_anio_fab || '---'}</td>
                    </tr>
                    <tr>
                        <td colSpan={30} className="label">FECHA ADQUISICION</td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dAdq ? 'bold' : 'normal', color: dAdq ? '#000' : '#888', fontSize: dAdq ? '0.65rem' : '0.55rem' }}>
                            {dAdq ? dAdq.getDate().toString().padStart(2, '0') : 'DIA'}
                        </td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dAdq ? 'bold' : 'normal', color: dAdq ? '#000' : '#888', fontSize: dAdq ? '0.65rem' : '0.55rem' }}>
                            {dAdq ? (dAdq.getMonth() + 1).toString().padStart(2, '0') : 'MES'}
                        </td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dAdq ? 'bold' : 'normal', color: dAdq ? '#000' : '#888', fontSize: dAdq ? '0.65rem' : '0.55rem' }}>
                            {dAdq ? dAdq.getFullYear() : 'AÑO'}
                        </td>
                        <td colSpan={12} className="label">MODELO TUBO:</td><td colSpan={18} className="value">{equipo.tubo_modelo || '---'}</td>
                        <td colSpan={30} className="value"></td>
                    </tr>
                    <tr>
                        <td colSpan={30} className="label">FECHA INGRESO</td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dInst ? 'bold' : 'normal', color: dInst ? '#000' : '#888', fontSize: dInst ? '0.65rem' : '0.55rem' }}>
                            {dInst ? dInst.getDate().toString().padStart(2, '0') : 'DIA'}
                        </td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dInst ? 'bold' : 'normal', color: dInst ? '#000' : '#888', fontSize: dInst ? '0.65rem' : '0.55rem' }}>
                            {dInst ? (dInst.getMonth() + 1).toString().padStart(2, '0') : 'MES'}
                        </td>
                        <td colSpan={10} style={{ textAlign: 'center', fontWeight: dInst ? 'bold' : 'normal', color: dInst ? '#000' : '#888', fontSize: dInst ? '0.65rem' : '0.55rem' }}>
                            {dInst ? dInst.getFullYear() : 'AÑO'}
                        </td>
                        <td colSpan={12} className="label">SERIE TUBO:</td><td colSpan={18} className="value">{equipo.tubo_serie || '---'}</td>
                        <td colSpan={30} className="value"></td>
                    </tr>

                    {/* ESPECIFICACIONES */}
                    <tr><td colSpan={120} className="banner">ESPECIFICACIONES DEL EQUIPO</td></tr>
                    <tr className="bg-green-light">
                        <td colSpan={24}>REQUERIMIENTOS FISICOS</td>
                        <td colSpan={24}>CLASIFICACION BIOMEDICA</td>
                        <td colSpan={24}>CLASE TECNOLOGIA</td>
                        <td colSpan={24}>FUENTE ALIMENTACION</td>
                        <td colSpan={24}>MANUALES</td>
                    </tr>
                    {[
                        { l1: 'VOLTAJE MÁXIMO', v1: equipo.voltaje_max, l2: 'EQUIPO FIJO', v2: equipo.clasificacion_biomedica?.fijo, l3: 'ELECTRÓNICO', v3: equipo.clase_tecnologia?.electronico, l4: 'AGUA', v4: equipo.fuente_alimentacion?.agua, l5: 'SERVICIO', v5: equipo.manuales_disponibles?.servicio },
                        { l1: 'VOLTAJE MÍNIMO', v1: equipo.voltaje_min, l2: 'EQUIPO TRANSPORTE', v2: equipo.clasificacion_biomedica?.transporte, l3: 'ELÉCTRICO', v3: equipo.clase_tecnologia?.electrico, l4: 'AIRE', v4: equipo.fuente_alimentacion?.aire, l5: 'USUARIO', v5: equipo.manuales_disponibles?.usuario },
                        { l1: 'CORRIENTE MÁXIMA', v1: equipo.corriente_max, l2: 'INVASIVO', v2: equipo.clasificacion_biomedica?.invasivo, l3: 'MECÁNICO', v3: equipo.clase_tecnologia?.mecanico, l4: 'ELECTRICIDAD', v4: equipo.fuente_alimentacion?.electricidad, l5: 'INSTALACIÓN', v5: equipo.manuales_disponibles?.instalacion },
                        { l1: 'CORRIENTE MÍNIMA', v1: equipo.corriente_min, l2: 'DIAGNÓSTICO', v2: equipo.clasificacion_biomedica?.diagnostico, l3: 'HIDRÁULICO', v3: equipo.clase_tecnologia?.hidraulico, l4: 'ENERGÍA SOLAR', v4: equipo.fuente_alimentacion?.solar, l5: '', v5: null },
                        { l1: 'POTENCIA CONSUMIDA', v1: equipo.potencia_consumida, l2: 'APOYO', v2: equipo.clasificacion_biomedica?.apoyo, l3: 'NEUMÁTICO', v3: equipo.clase_tecnologia?.neumatico, l4: 'OTROS', v4: false, l5: '', v5: null },
                        { l1: 'HUMEDAD RELATIVA %', v1: equipo.humedad_rango, l2: 'LABORATORIO', v2: equipo.clasificacion_biomedica?.lab, l3: '', v3: null, l4: '', v4: null, l5: '', v5: null },
                        { l1: 'PRESIÓN OP.', v1: equipo.presion_rango, l2: 'REHABILITACIÓN', v2: equipo.clasificacion_biomedica?.rehabilitacion, l3: '', v3: null, l4: '', v4: null, l5: '', v5: null },
                        { l1: 'TEMPERATURA ºC', v1: equipo.temperatura_rango, l2: 'TRATAMIENTO', v2: equipo.clasificacion_biomedica?.tratamiento, l3: '', v3: null, l4: '', v4: null, l5: '', v5: null }
                    ].map((row, idx) => (
                        <tr key={idx}>
                            <td colSpan={15} className="label" style={{ fontSize: '0.485rem' }}>{row.l1}</td><td colSpan={9} className="value">{row.v1}</td>
                            <td colSpan={18} className="label" style={{ fontSize: '0.485rem' }}>{row.l2}</td><td colSpan={6}>{row.v2 !== null && renderX(row.v2)}</td>
                            <td colSpan={18} className="label" style={{ fontSize: '0.485rem' }}>{row.l3}</td><td colSpan={6}>{row.v3 !== null && renderX(row.v3)}</td>
                            <td colSpan={18} className="label" style={{ fontSize: '0.485rem' }}>{row.l4}</td><td colSpan={6}>{row.v3 !== null && renderX(row.v4)}</td>
                            <td colSpan={18} className="label" style={{ fontSize: '0.485rem' }}>{row.l5}</td><td colSpan={6}>{row.v5 !== null && renderX(row.v5)}</td>
                        </tr>
                    ))}

                    {/* MANTENIMIENTO & GARANTIA */}
                    <tr><td colSpan={120} className="banner">DATOS DE MANTENIMIENTO Y GARANTIA</td></tr>
                    <tr className="bg-green-light"><td colSpan={40}>ENCARGADO</td><td colSpan={40}>PERIODO DE MANTENIMIENTO</td><td colSpan={40}>TIPO DE MANTENIMIENTO</td></tr>
                    {[
                        { b1: 'NOMBRE', v1: contrato?.proveedores?.nombre || 'PROPIO', b2: 'MENSUAL', v2: equipo.periodo_mantenimiento === 'Mensual', b3: 'PREVENTIVO', v3: true },
                        { b1: 'INGENIERO', v1: contrato?.proveedores?.contacto || '---', b2: 'TRIMESTRAL', v2: equipo.periodo_mantenimiento === 'Trimestral', b3: 'CORRECTIVO', v3: true },
                        { b1: 'TELEFONO', v1: contrato?.proveedores?.telefono || '---', b2: '4 MESES', v2: equipo.periodo_mantenimiento === '4 Meses', b3: 'CALIBRACIÓN', v3: false },
                        { b1: 'CELULAR', v1: '---', b2: 'SEMESTRAL', v2: equipo.periodo_mantenimiento === 'Semestral', b3: 'VALIDACIÓN', v3: false },
                        { b1: 'CIUDAD', v1: contrato?.proveedores?.ciudad || '---', b2: 'ANUAL', v2: equipo.periodo_mantenimiento === 'Anual', b3: '', v3: null }
                    ].map((row, idx) => (
                        <tr key={idx}>
                            <td colSpan={10} className="label">{row.b1}</td><td colSpan={30} className="value">{row.v1}</td>
                            <td colSpan={30} className="label">{row.b2}</td><td colSpan={10}>{row.v2 !== null && renderX(row.v2)}</td>
                            <td colSpan={30} className="label">{row.b3}</td><td colSpan={10}>{row.v3 !== null && renderX(row.v3)}</td>
                        </tr>
                    ))}

                    {/* INFORMACIÓN PARA MANTENIMIENTO */}
                    <tr><td colSpan={120} className="banner">INFORMACIÓN PARA MANTENIMIENTO</td></tr>
                    <tr>
                        <td colSpan={24} className="label">CONTACTO:</td>
                        <td colSpan={46} className="value">{contrato?.proveedores?.nombre || '---'}</td>
                        <td colSpan={25} className="label" style={{ textAlign: 'center', background: '#f8fafc' }}>CONTRATO</td>
                        <td colSpan={25} className="label" style={{ textAlign: 'center', background: '#f8fafc' }}>MTO POR AÑO</td>
                    </tr>
                    <tr>
                        <td colSpan={24} className="label">TELEFONO</td>
                        <td colSpan={46} className="value">{contrato?.proveedores?.telefono || '---'}</td>
                        <td colSpan={6} className="label" style={{ textAlign: 'right', borderRight: 'none' }}>SI</td>
                        <td colSpan={6} style={{ borderLeft: 'none', textAlign: 'center' }}>{renderX(!!contrato)}</td>
                        <td colSpan={7} className="label" style={{ textAlign: 'right', borderRight: 'none' }}>NO</td>
                        <td colSpan={6} style={{ borderLeft: 'none', textAlign: 'center' }}>{renderX(!contrato)}</td>
                        <td colSpan={25} style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 900 }}>{equipo.mantenimientos_por_anio || 2}</td>
                    </tr>

                    <tr><td colSpan={120} className="banner">PROTOCOLOS DE MANTENIMIENTO</td></tr>
                    {equipo.protocolos && equipo.protocolos.length > 0 ? (
                        equipo.protocolos.map((p: string, idx: number) => (
                            <tr key={`prot-${idx}`}>
                                <td colSpan={120} className="value" style={{ paddingLeft: '20px' }}>• {p}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={120} style={{ textAlign: 'center', height: '64px', color: '#000', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                SIN PROTOCOLOS REGISTRADOS
                            </td>
                        </tr>
                    )}

                    <tr><td colSpan={40} className="bg-green-light">RECOMENDACIONES</td><td colSpan={80}></td></tr>
                    {equipo.recomendaciones && equipo.recomendaciones.length > 0 ? (
                        equipo.recomendaciones.map((r: string, idx: number) => (
                            <tr key={`rec-${idx}`}>
                                <td colSpan={120} className="value" style={{ paddingLeft: '20px' }}>• {r}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={120} style={{ textAlign: 'center', height: '48px', color: '#000', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                SIN RECOMENDACIONES REGISTRADAS
                            </td>
                        </tr>
                    )}

                    {/* ACTIVIDADES REALIZADAS - CONDITIONAL DISPLAY */}
                    <tr><td colSpan={120} className="banner">ACTIVIDADES DE MANTENIMIENTO REALIZADAS</td></tr>
                    {sortedMantenimientos.length > 0 ? (
                        <>
                            <tr className="bg-green-light" style={{ textAlign: 'center' }}>
                                <td colSpan={30} rowSpan={2} style={{ textAlign: 'center' }}>FECHA DE MTTO</td>
                                <td colSpan={30} style={{ textAlign: 'center' }}>TIPO DE MTTO</td>
                                <td colSpan={60} rowSpan={2} style={{ textAlign: 'center' }}>RESPONSIBLE</td>
                            </tr>
                            <tr className="bg-green-light">
                                <td colSpan={15} style={{ textAlign: 'center' }}>PREV</td>
                                <td colSpan={15} style={{ textAlign: 'center' }}>CORREC</td>
                            </tr>
                            {sortedMantenimientos.slice(0, 1).map(m => (
                                <tr key={m.id}>
                                    <td colSpan={30} style={{ textAlign: 'center' }}>{new Date(m.fecha_ejecucion).toLocaleDateString()}</td>
                                    <td colSpan={15} style={{ textAlign: 'center' }}>{renderX(m.tipo === 'Preventivo')}</td>
                                    <td colSpan={15} style={{ textAlign: 'center' }}>{renderX(m.tipo === 'Correctivo')}</td>
                                    <td colSpan={60} className="value">{m.tecnico_responsable}</td>
                                </tr>
                            ))}
                        </>
                    ) : (
                        <tr>
                            <td colSpan={120} style={{ textAlign: 'center', height: '64px', color: '#000', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                SIN ACTIVIDADES REGISTRADAS
                            </td>
                        </tr>
                    )}
                </tbody>
            </HFTable>
        </ReportFrame>
    );
}
