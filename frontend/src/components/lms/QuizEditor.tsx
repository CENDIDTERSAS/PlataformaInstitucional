'use client';

import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Plus, Trash2, CheckSquare, Circle, CheckCircle,
  Link2, MoveVertical, GripVertical, AlertCircle, Star
} from 'lucide-react';

// ── Animations ──────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Shared Inputs ────────────────────────────────────────────
const BaseInput = styled.input`
  border: none;
  border-bottom: 1.5px solid #e0e0e0;
  padding: 0.4rem 0;
  font-family: inherit;
  font-size: 0.93rem;
  background: transparent;
  color: #202124;
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: var(--primary, #12A152); }
  &::placeholder { color: #bbb; }
`;

// ── Card ─────────────────────────────────────────────────────
const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  border-top: 4px solid var(--primary, #12A152);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 1.5rem;
  position: relative;
  animation: ${fadeIn} 0.2s ease;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`;

const QNum = styled.div`
  min-width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--primary, #12A152);
  color: white; font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-top: 0.55rem; flex-shrink: 0;
`;

const QInput = styled.textarea`
  flex: 1;
  border: none;
  border-bottom: 2px solid #e0e0e0;
  padding: 0.5rem 0;
  font-size: 1rem; font-weight: 600; color: #202124;
  resize: none; min-height: 42px;
  font-family: inherit; background: transparent;
  transition: border-color 0.2s;
  &:focus { outline: none; border-color: var(--primary, #12A152); }
  &::placeholder { color: #bbb; font-weight: 400; }
`;

// ── Type Selector ─────────────────────────────────────────────
const TypeSelector = styled.div`
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  margin-bottom: 1.25rem;
`;

const TypeChip = styled.button<{ $active: boolean }>`
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1.5px solid ${p => p.$active ? 'var(--primary, #12A152)' : '#e0e0e0'};
  background: ${p => p.$active ? '#f1fdf5' : 'white'};
  color: ${p => p.$active ? 'var(--primary, #12A152)' : '#5f6368'};
  font-size: 0.8rem; font-weight: ${p => p.$active ? 600 : 400};
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
  &:hover { border-color: var(--primary, #12A152); background: #f1fdf5; }
`;

// ── Option Row ────────────────────────────────────────────────
const OptionRow = styled.div<{ $correct?: boolean }>`
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  background: ${p => p.$correct ? '#f1fdf5' : 'transparent'};
  border: 1px solid ${p => p.$correct ? '#12A152' : 'transparent'};
  transition: all 0.15s;
  &:hover { background: ${p => p.$correct ? '#f1fdf5' : '#f9fafb'}; }
`;

const CorrectToggle = styled.button<{ $active: boolean }>`
  background: none; border: none; cursor: pointer; padding: 0;
  color: ${p => p.$active ? '#12A152' : '#ccc'};
  display: flex; flex-shrink: 0;
  transition: color 0.15s;
  &:hover { color: #12A152; }
`;

const RemoveBtn = styled.button`
  background: none; border: none; color: #ccc;
  cursor: pointer; display: flex; padding: 0;
  &:hover { color: #ea4335; }
`;

const DeleteCardBtn = styled.button`
  position: absolute; top: 1rem; right: 1rem;
  background: none; border: none; color: #ccc;
  cursor: pointer; padding: 0.35rem; border-radius: 6px;
  display: flex; transition: all 0.15s;
  &:hover { background: #fff5f5; color: #ea4335; }
`;

const SmallBtn = styled.button`
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.3rem 0.65rem;
  font-size: 0.78rem; cursor: pointer;
  color: #5f6368; font-family: inherit;
  display: flex; align-items: center; gap: 0.3rem;
  transition: all 0.15s;
  &:hover { background: #f1f8f4; border-color: var(--primary, #12A152); color: var(--primary, #12A152); }
`;

const CardFooter = styled.div`
  display: flex; justify-content: space-between;
  align-items: center; margin-top: 1rem;
  padding-top: 0.75rem; border-top: 1px solid #f0f0f0;
  flex-wrap: wrap; gap: 0.5rem;
`;

const Tip = styled.div<{ $ok: boolean }>`
  font-size: 0.73rem;
  color: ${p => p.$ok ? '#12A152' : '#80868b'};
  display: flex; align-items: center; gap: 0.3rem;
`;

// ── Matching ──────────────────────────────────────────────────
const MatchingGrid = styled.div`
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 0.5rem; align-items: center;
`;

// ── Ordering ─────────────────────────────────────────────────
const OrderItem = styled.div`
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px; background: #f9fafb;
  border: 1px solid #e0e0e0;
  transition: all 0.15s;
`;

// ── Add Question Button ───────────────────────────────────────
const AddBtn = styled.button`
  width: 100%; padding: 1rem;
  border: 2px dashed #d0d0d0; border-radius: 12px;
  background: white; color: var(--primary, #12A152);
  font-size: 0.95rem; font-weight: 600;
  cursor: pointer; display: flex;
  align-items: center; justify-content: center; gap: 0.5rem;
  transition: all 0.2s; font-family: inherit;
  &:hover { background: #f1fdf5; border-color: var(--primary, #12A152); transform: translateY(-1px); }
`;

const EmptyState = styled.div`
  text-align: center; padding: 2.5rem; color: #80868b;
  background: #f9f9f9; border-radius: 12px;
  border: 2px dashed #e0e0e0;
  p { margin: 0.75rem 0 0; font-size: 0.9rem; }
`;

// ── Types ────────────────────────────────────────────────────
export type QuestionType = 'single' | 'multiple' | 'matching' | 'ordering' | 'drag-drop' | 'rating';

export interface MatchPair {
  izquierda: string;
  derecha: string;
}

export interface QuizQuestion {
  tipo_pregunta: QuestionType;
  pregunta: string;
  // single / multiple
  opciones?: string[];
  respuesta_correcta?: number | string;       // single, drag-drop, rating
  respuestas_correctas?: number[];   // multiple
  // matching
  pares?: MatchPair[];
  // ordering
  items?: string[];  // in correct order
}

const TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: 'single', label: 'Una respuesta', icon: <Circle size={14} /> },
  { value: 'multiple', label: 'Múltiple', icon: <CheckSquare size={14} /> },
  { value: 'matching', label: 'Enlazar', icon: <Link2 size={14} /> },
  { value: 'ordering', label: 'Ordenar', icon: <MoveVertical size={14} /> },
  { value: 'drag-drop', label: 'Completar (Arrastrar)', icon: <MoveVertical size={14} /> },
  { value: 'rating', label: 'Escala (1-5)', icon: <Star size={14} /> },
];

const defaultQuestion = (tipo: QuestionType = 'single'): QuizQuestion => {
  if (tipo === 'matching') return { tipo_pregunta: 'matching', pregunta: '', pares: [{ izquierda: '', derecha: '' }, { izquierda: '', derecha: '' }] };
  if (tipo === 'ordering') return { tipo_pregunta: 'ordering', pregunta: '', items: ['', '', ''] };
  if (tipo === 'multiple') return { tipo_pregunta: 'multiple', pregunta: '', opciones: ['', '', '', ''], respuestas_correctas: [] };
  if (tipo === 'drag-drop') return { tipo_pregunta: 'drag-drop', pregunta: 'El sol es de color [blank]', opciones: ['Amarillo', 'Azul', 'Verde'], respuesta_correcta: 'Amarillo' };
  if (tipo === 'rating') return { tipo_pregunta: 'rating', pregunta: '¿Qué tan satisfecho estás con el contenido?', respuesta_correcta: '0' };
  return { tipo_pregunta: 'single', pregunta: '', opciones: ['', '', '', ''], respuesta_correcta: 0 };
};

// ── Sub-editors ───────────────────────────────────────────────
function SingleEditor({ q, qIdx, update }: any) {
  const toggle = (oIdx: number) => update('respuesta_correcta', oIdx);
  const setOpt = (oIdx: number, v: string) => {
    const o = [...(q.opciones || [])]; o[oIdx] = v; update('opciones', o);
  };
  const addOpt = () => { if ((q.opciones?.length || 0) < 6) update('opciones', [...(q.opciones || []), '']); };
  const remOpt = (oIdx: number) => {
    if ((q.opciones?.length || 0) <= 2) return;
    const o = (q.opciones || []).filter((_: any, i: number) => i !== oIdx);
    update('opciones', o);

    // Si borramos una opción que está ANTES de la correcta, la correcta debe bajar un índice
    if (oIdx < q.respuesta_correcta) {
      update('respuesta_correcta', Math.max(0, q.respuesta_correcta - 1));
    } else if (oIdx === q.respuesta_correcta) {
      // Si borramos la opción que era la correcta, pasamos la marca a la de arriba (o la 0)
      update('respuesta_correcta', Math.max(0, oIdx - 1));
    } else if (q.respuesta_correcta >= o.length) {
      update('respuesta_correcta', o.length - 1);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginLeft: '2.5rem' }}>
      {(q.opciones || []).map((opt: string, oIdx: number) => (
        <OptionRow key={oIdx} $correct={q.respuesta_correcta === oIdx}>
          <CorrectToggle $active={q.respuesta_correcta === oIdx} onClick={() => toggle(oIdx)} title="Respuesta correcta">
            {q.respuesta_correcta === oIdx ? <CheckCircle size={20} /> : <Circle size={20} />}
          </CorrectToggle>
          <BaseInput style={{ flex: 1 }} value={opt} onChange={e => setOpt(oIdx, e.target.value)} placeholder={`Opción ${oIdx + 1}`} />
          {(q.opciones?.length || 0) > 2 && <RemoveBtn onClick={() => remOpt(oIdx)}><Trash2 size={14} /></RemoveBtn>}
        </OptionRow>
      ))}
      {(q.opciones?.length || 0) < 6 && (
        <OptionRow $correct={false} style={{ cursor: 'pointer' }} onClick={addOpt}>
          <Circle size={20} color="#ccc" />
          <span style={{ color: '#80868b', fontSize: '0.88rem' }}>Añadir opción...</span>
        </OptionRow>
      )}
    </div>
  );
}

function MultipleEditor({ q, qIdx, update }: any) {
  const correctas: number[] = q.respuestas_correctas || [];
  const toggleCorrect = (oIdx: number) => {
    const next = correctas.includes(oIdx) ? correctas.filter(i => i !== oIdx) : [...correctas, oIdx];
    update('respuestas_correctas', next);
  };
  const setOpt = (oIdx: number, v: string) => {
    const o = [...(q.opciones || [])]; o[oIdx] = v; update('opciones', o);
  };
  const addOpt = () => { if ((q.opciones?.length || 0) < 6) update('opciones', [...(q.opciones || []), '']); };
  const remOpt = (oIdx: number) => {
    if ((q.opciones?.length || 0) <= 2) return;
    const o = (q.opciones || []).filter((_: any, i: number) => i !== oIdx);
    update('opciones', o);
    update('respuestas_correctas', correctas.filter(i => i < o.length));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginLeft: '2.5rem' }}>
      <p style={{ fontSize: '0.78rem', color: '#80868b', margin: '0 0 0.5rem' }}>Marca todas las respuestas correctas:</p>
      {(q.opciones || []).map((opt: string, oIdx: number) => {
        const isCorrect = correctas.includes(oIdx);
        return (
          <OptionRow key={oIdx} $correct={isCorrect}>
            <CorrectToggle $active={isCorrect} onClick={() => toggleCorrect(oIdx)} title="Marcar como correcta">
              {isCorrect
                ? <CheckSquare size={20} />
                : <div style={{ width: 20, height: 20, border: '2px solid #ccc', borderRadius: 4 }} />
              }
            </CorrectToggle>
            <BaseInput style={{ flex: 1 }} value={opt} onChange={e => setOpt(oIdx, e.target.value)} placeholder={`Opción ${oIdx + 1}`} />
            {(q.opciones?.length || 0) > 2 && <RemoveBtn onClick={() => remOpt(oIdx)}><Trash2 size={14} /></RemoveBtn>}
          </OptionRow>
        );
      })}
      {(q.opciones?.length || 0) < 6 && (
        <OptionRow $correct={false} style={{ cursor: 'pointer' }} onClick={addOpt}>
          <div style={{ width: 20, height: 20, border: '2px solid #ccc', borderRadius: 4 }} />
          <span style={{ color: '#80868b', fontSize: '0.88rem' }}>Añadir opción...</span>
        </OptionRow>
      )}
    </div>
  );
}

function MatchingEditor({ q, update }: any) {
  const pares: MatchPair[] = q.pares || [];
  const setPar = (idx: number, side: 'izquierda' | 'derecha', v: string) => {
    const next = pares.map((p, i) => i === idx ? { ...p, [side]: v } : p);
    update('pares', next);
  };
  const addPar = () => update('pares', [...pares, { izquierda: '', derecha: '' }]);
  const remPar = (idx: number) => {
    if (pares.length <= 2) return;
    update('pares', pares.filter((_, i) => i !== idx));
  };
  return (
    <div style={{ marginLeft: '2.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#80868b', fontWeight: 600 }}>Columna A</span>
        <span />
        <span style={{ fontSize: '0.78rem', color: '#80868b', fontWeight: 600 }}>Columna B</span>
      </div>
      {pares.map((par, idx) => (
        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <BaseInput value={par.izquierda} onChange={e => setPar(idx, 'izquierda', e.target.value)} placeholder={`Elemento ${idx + 1}`} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Link2 size={16} color="#12A152" />
          </div>
          <BaseInput value={par.derecha} onChange={e => setPar(idx, 'derecha', e.target.value)} placeholder={`Respuesta ${idx + 1}`} />
          {pares.length > 2 && <RemoveBtn onClick={() => remPar(idx)}><Trash2 size={14} /></RemoveBtn>}
        </div>
      ))}
      <SmallBtn onClick={addPar} style={{ marginTop: '0.5rem' }}><Plus size={13} /> Añadir par</SmallBtn>
    </div>
  );
}

function OrderingEditor({ q, update }: any) {
  const items: string[] = q.items || [];
  const setItem = (idx: number, v: string) => {
    const next = [...items]; next[idx] = v; update('items', next);
  };
  const addItem = () => update('items', [...items, '']);
  const remItem = (idx: number) => {
    if (items.length <= 2) return;
    update('items', items.filter((_, i) => i !== idx));
  };
  return (
    <div style={{ marginLeft: '2.5rem' }}>
      <p style={{ fontSize: '0.78rem', color: '#80868b', margin: '0 0 0.5rem' }}>
        Define los elementos <b>en el orden correcto</b>. El estudiante los verá mezclados y deberá ordenarlos:
      </p>
      {items.map((item, idx) => (
        <OrderItem key={idx} style={{ marginBottom: '0.4rem' }}>
          <span style={{ color: '#ccc', display: 'flex' }}><GripVertical size={16} /></span>
          <span style={{ background: '#12A152', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
          <BaseInput style={{ flex: 1 }} value={item} onChange={e => setItem(idx, e.target.value)} placeholder={`Elemento ${idx + 1}`} />
          {items.length > 2 && <RemoveBtn onClick={() => remItem(idx)}><Trash2 size={14} /></RemoveBtn>}
        </OrderItem>
      ))}
      <SmallBtn onClick={addItem} style={{ marginTop: '0.5rem' }}><Plus size={13} /> Añadir elemento</SmallBtn>
    </div>
  );
}

function DragDropEditor({ q, update }: any) {
  const opciones: string[] = q.opciones || [];
  const setOpt = (idx: number, v: string) => {
    const next = [...opciones]; next[idx] = v; update('opciones', next);
  };
  const addOpt = () => update('opciones', [...opciones, '']);
  const remOpt = (idx: number) => {
    if (opciones.length <= 2) return;
    update('opciones', opciones.filter((_, i) => i !== idx));
  };
  return (
    <div style={{ marginLeft: '2.5rem' }}>
      <p style={{ fontSize: '0.78rem', color: '#80868b', margin: '0 0 0.5rem' }}>
        Usa <b>[blank]</b> en la pregunta para indicar dónde va el espacio.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Respuesta Correcta:</span>
          <BaseInput
            value={q.respuesta_correcta}
            onChange={e => update('respuesta_correcta', e.target.value)}
            placeholder="Palabra exacta"
            style={{ flex: 1, borderBottom: '2px solid #12A152' }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#80868b', marginTop: '0.5rem' }}>Otras opciones (distractores):</p>
        {opciones.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Circle size={14} color="#ccc" />
            <BaseInput style={{ flex: 1 }} value={opt} onChange={e => setOpt(idx, e.target.value)} placeholder={`Opción ${idx + 1}`} />
            {opciones.length > 2 && <RemoveBtn onClick={() => remOpt(idx)}><Trash2 size={14} /></RemoveBtn>}
          </div>
        ))}
        <SmallBtn onClick={addOpt} style={{ marginTop: '0.5rem', width: 'fit-content' }}><Plus size={13} /> Añadir distractor</SmallBtn>
      </div>
    </div>
  );
}

function RatingEditor() {
  return (
    <div style={{ marginLeft: '2.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(v => <Star key={v} size={24} color="#ddd" />)}
      <span style={{ fontSize: '0.8rem', color: '#80868b' }}>Escala de 1 a 5 estrellas</span>
    </div>
  );
}

// ── Validation ───────────────────────────────────────────────
function isValid(q: QuizQuestion, isSurvey: boolean = false): boolean {
  if (!q.pregunta?.trim()) return false;
  if (isSurvey) {
    if (q.tipo_pregunta === 'rating') return true;
    if (q.tipo_pregunta === 'single' || q.tipo_pregunta === 'multiple')
      return (q.opciones || []).length >= 2 && (q.opciones || []).every(o => o.trim());
    return true; // matching, ordering also ok if they have content
  }
  if (q.tipo_pregunta === 'single')
    return (q.opciones || []).every(o => o.trim()) && q.respuesta_correcta !== undefined;
  if (q.tipo_pregunta === 'multiple')
    return (q.opciones || []).every(o => o.trim()) && (q.respuestas_correctas || []).length > 0;
  if (q.tipo_pregunta === 'matching')
    return (q.pares || []).every(p => p.izquierda.trim() && p.derecha.trim());
  if (q.tipo_pregunta === 'ordering')
    return (q.items || []).every(i => i.trim()) && (q.items || []).length >= 2;
  if (q.tipo_pregunta === 'drag-drop')
    return q.pregunta.includes('[blank]') && String(q.respuesta_correcta || '').trim() !== '' && (q.opciones || []).every(o => o.trim());
  if (q.tipo_pregunta === 'rating')
    return !!q.pregunta.trim();
  return false;
}

// ── Main Export ───────────────────────────────────────────────
interface QuizEditorProps {
  preguntas: QuizQuestion[];
  onChange: (preguntas: QuizQuestion[]) => void;
  isSurvey?: boolean;
}

export default function QuizEditor({ preguntas, onChange, isSurvey = false }: QuizEditorProps) {
  // Normalizar datos al recibirlos para asegurar tipos correctos (números para índices)
  const normalized = React.useMemo(() => (preguntas || []).map(q => {
    let newQ = { ...q };
    if (q.tipo_pregunta === 'single' && typeof q.respuesta_correcta === 'string' && !isNaN(Number(q.respuesta_correcta)) && q.respuesta_correcta !== '') {
      newQ.respuesta_correcta = Number(q.respuesta_correcta);
    }
    if (q.tipo_pregunta === 'multiple' && Array.isArray(q.respuestas_correctas)) {
      newQ.respuestas_correctas = q.respuestas_correctas.map(v => (typeof v === 'string' && !isNaN(Number(v)) && v !== '') ? Number(v) : v);
    }
    return newQ;
  }), [preguntas]);

  const [focused, setFocused] = useState<number | null>(null);

  const add = (tipo: QuestionType = 'single') => {
    const next = [...normalized, defaultQuestion(tipo)];
    onChange(next);
    setFocused(next.length - 1);
  };

  const remove = (idx: number) => {
    onChange(normalized.filter((_, i) => i !== idx));
    setFocused(null);
  };

  const duplicate = (idx: number) => {
    const copy = [...normalized];
    copy.splice(idx + 1, 0, JSON.parse(JSON.stringify(normalized[idx])));
    onChange(copy);
    setFocused(idx + 1);
  };

  const updateField = (idx: number, field: string, value: any) => {
    onChange(normalized.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const changeType = (idx: number, tipo: QuestionType) => {
    const q = normalized[idx];
    onChange(normalized.map((item, i) => i === idx ? { ...defaultQuestion(tipo), pregunta: q.pregunta } : item));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {normalized.length === 0 && (
        <EmptyState>
          <CheckCircle size={40} color="#ccc" />
          <p>Aún no hay preguntas. Usa los botones de abajo para añadir.</p>
        </EmptyState>
      )}

      {normalized.map((q, qIdx) => {
        const ok = isValid(q, isSurvey);
        return (
          <Card key={qIdx} onClick={() => setFocused(qIdx)}>
            <DeleteCardBtn onClick={e => { e.stopPropagation(); remove(qIdx); }}><Trash2 size={16} /></DeleteCardBtn>

            <CardHeader>
              <QNum>{qIdx + 1}</QNum>
              <QInput value={q.pregunta} onChange={e => updateField(qIdx, 'pregunta', e.target.value)} placeholder="Escribe la pregunta aquí..." rows={2} />
            </CardHeader>

            {/* Type selector */}
            <TypeSelector>
              {TYPES.map(t => (
                <TypeChip key={t.value} $active={q.tipo_pregunta === t.value} onClick={e => { e.stopPropagation(); changeType(qIdx, t.value); }}>
                  {t.icon}{t.label}
                </TypeChip>
              ))}
            </TypeSelector>

            {/* Sub-editor */}
            {q.tipo_pregunta === 'single' && <SingleEditor q={q} qIdx={qIdx} update={(f: string, v: any) => updateField(qIdx, f, v)} isSurvey={isSurvey} />}
            {q.tipo_pregunta === 'multiple' && <MultipleEditor q={q} qIdx={qIdx} update={(f: string, v: any) => updateField(qIdx, f, v)} isSurvey={isSurvey} />}
            {q.tipo_pregunta === 'matching' && <MatchingEditor q={q} update={(f: string, v: any) => updateField(qIdx, f, v)} />}
            {q.tipo_pregunta === 'ordering' && <OrderingEditor q={q} update={(f: string, v: any) => updateField(qIdx, f, v)} />}
            {q.tipo_pregunta === 'drag-drop' && <DragDropEditor q={q} update={(f: string, v: any) => updateField(qIdx, f, v)} />}
            {q.tipo_pregunta === 'rating' && <RatingEditor />}

            <CardFooter>
              <Tip $ok={ok}>
                {ok ? <><CheckCircle size={13} /> Completa</> : q.pregunta ? <><AlertCircle size={13} color="#ea4335" /> Incompleta</> : null}
              </Tip>
              <SmallBtn onClick={e => { e.stopPropagation(); duplicate(qIdx); }}>Duplicar</SmallBtn>
            </CardFooter>
          </Card>
        );
      })}

      {/* Add-question buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        {TYPES.map(t => (
          <AddBtn key={t.value} onClick={() => add(t.value)} style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> {t.label}
          </AddBtn>
        ))}
      </div>
    </div>
  );
}
