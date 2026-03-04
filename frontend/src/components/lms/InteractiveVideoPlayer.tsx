'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { CheckCircle, XCircle, Play, Pause, Clock } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
export interface VideoMarker {
    tiempo: number;        // seconds from start
    pregunta: string;
    respuesta_correcta: boolean;  // true = Verdadero, false = Falso
}

interface MarkerResult {
    tiempo: number;
    correcta: boolean;
    respondida: boolean;
}

interface Props {
    videoUrl: string;
    marcadores?: VideoMarker[];
    savedProgress?: { maxReached: number; completed: boolean }; // from DB
    onProgressUpdate?: (maxReached: number, completed: boolean) => void; // save to DB
    onVideoComplete?: () => void;
    onComplete?: (results: MarkerResult[]) => void;
}

// ── Utils ─────────────────────────────────────────────────────
function extractYoutubeId(url: string): string | null {
    const input = String(url || '').trim();
    if (!input) return null;
    try {
        const parsed = new URL(input);
        const host = parsed.hostname.replace(/^www\./, '');
        let id = '';
        if (host === 'youtu.be') id = parsed.pathname.slice(1).split('/')[0];
        else if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
            if (parsed.pathname === '/watch') id = parsed.searchParams.get('v') || '';
            if (parsed.pathname.startsWith('/embed/')) id = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
            if (parsed.pathname.startsWith('/v/')) id = parsed.pathname.split('/v/')[1]?.split('/')[0] || '';
            if (parsed.pathname.startsWith('/shorts/')) id = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
            if (parsed.pathname.startsWith('/live/')) id = parsed.pathname.split('/live/')[1]?.split('/')[0] || '';
        }
        if (id && id.length >= 11) return id.slice(0, 11);
    } catch { /* fallback below */ }
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) { const m = input.match(p); if (m) return m[1]; }
    return null;
}

function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}


// ── Styles ─────────────────────────────────────────────────── 
const fadeIn = keyframes`from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}`;
const pulse = keyframes`0%,100%{transform:scale(1)}50%{transform:scale(1.04)}`;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  background: #000;
`;

const VideoFrame = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: black;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  iframe, .yt-placeholder {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%; border: none;
  }
`;

const TimelineContainer = styled.div`
  margin-top: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-100);
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #5f6368;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ProgressBar = styled.div`
  position: relative;
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  overflow: visible;
  transition: all 0.2s;
  &:hover { background: #d0d0d0; }
`;

const Overlay = styled.div<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  opacity: ${p => p.$visible ? 1 : 0};
  pointer-events: ${p => p.$visible ? 'all' : 'none'};
  transition: opacity 0.3s;
`;

const QuestionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 460px;
  width: 90%;
  animation: ${fadeIn} 0.35s ease;
  text-align: center;
`;

const TimeBadge = styled.div`
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #fef3c7; color: #b45309;
  border-radius: 20px; font-size: 0.78rem; font-weight: 700;
  padding: 0.25rem 0.75rem; margin-bottom: 1rem;
`;

const QText = styled.p`
  font-size: 1.1rem; font-weight: 700; color: #202124;
  margin-bottom: 1.5rem; line-height: 1.45;
`;

const TFRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
`;

const TFBtn = styled.button<{ $variant: 'true' | 'false'; $state?: 'idle' | 'correct' | 'wrong' }>`
  padding: 1rem; border-radius: 12px;
  font-size: 1.1rem; font-weight: 700; cursor: pointer;
  border: 2px solid; font-family: inherit; transition: all 0.2s;
  animation: ${p => p.$state === 'idle' ? 'none' : pulse} 0.4s ease;
  ${p => {
        if (p.$state === 'correct') return `background: #12A152; color: white; border-color: #12A152;`;
        if (p.$state === 'wrong') return `background: #ea4335; color: white; border-color: #ea4335;`;
        if (p.$variant === 'true') return `background: #f1fdf5; color: #12A152; border-color: #12A152; &:hover{background:#12A152;color:white;}`;
        return `background: #fff5f5; color: #ea4335; border-color: #ea4335; &:hover{background:#ea4335;color:white;}`;
    }}
`;

const ResultMsg = styled.div<{ $correct: boolean }>`
  margin-top: 1.25rem; padding: 0.75rem 1rem;
  border-radius: 8px; font-weight: 600; font-size: 0.9rem;
  background: ${p => p.$correct ? '#f1fdf5' : '#fff5f5'};
  color: ${p => p.$correct ? '#12A152' : '#ea4335'};
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
`;

const ContinueBtn = styled.button`
  margin-top: 1rem; width: 100%; padding: 0.75rem;
  background: var(--primary, #12A152); color: white;
  border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  &:hover { background: #0d8a45; }
`;

const MarkerDot = styled.div<{ $pct: number; $done: boolean; $correct?: boolean }>`
  position: absolute; top: 50%;
  left: ${p => p.$pct}%;
  transform: translate(-50%, -50%);
  width: 16px; height: 16px; border-radius: 50%;
  background: ${p => p.$done ? (p.$correct ? '#12A152' : '#ea4335') : '#fbbf24'};
  border: 2px solid white; cursor: pointer; transition: all 0.2s;
  z-index: 6; box-shadow: 0 0 10px rgba(0,0,0,0.3);
  &:hover { transform: translate(-50%, -50%) scale(1.4); }
`;

// Mini-preview tooltip on marker hover/click
const MarkerTooltip = styled.div<{ $pct: number; $visible: boolean }>`
  position: absolute;
  bottom: 22px;
  left: ${p => Math.min(Math.max(p.$pct, 5), 95)}%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 500;
  color: #3c4043;
  max-width: 220px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  pointer-events: none;
  z-index: 20;
  opacity: ${p => p.$visible ? 1 : 0};
  transition: opacity 0.18s;
  white-space: normal;
  line-height: 1.35;
  &::after {
    content: '';
    position: absolute;
    top: 100%; left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: white;
  }
`;

// ── Declarations ─────────────────────────────────────────────
declare global {
    interface Window { YT: any; onYouTubeIframeAPIReady?: () => void; }
}

export default function InteractiveVideoPlayer({ videoUrl, marcadores = [], savedProgress, onProgressUpdate, onVideoComplete, onComplete }: Props) {
    const playerRef = useRef<any>(null);
    const iframeRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<any>(null);
    const maxReachedRef = useRef<number>(savedProgress?.maxReached || 0);
    const lastSavedRef = useRef<number>(0); // throttle: last time we called onProgressUpdate

    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [videoEnded, setVideoEnded] = useState(false);
    const [activeMarker, setActiveMarker] = useState<VideoMarker | null>(null);
    const [answered, setAnswered] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [results, setResults] = useState<Map<number, MarkerResult>>(new Map());
    const resultsRef = useRef(new Map<number, MarkerResult>());
    const firedMarkersRef = useRef<Set<number>>(new Set());
    const [apiReady, setApiReady] = useState(false);
    // Tooltip state: which marker is being hovered/previewed
    const [tooltipMarker, setTooltipMarker] = useState<VideoMarker | null>(null);

    // ── Restore saved progress on mount ─────────────────────────
    useEffect(() => {
        if (savedProgress?.maxReached) maxReachedRef.current = savedProgress.maxReached;
        if (savedProgress?.completed) {
            setVideoEnded(true);
            onVideoComplete?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on initial mount

    useEffect(() => { resultsRef.current = results; }, [results]);

    const videoId = extractYoutubeId(videoUrl);

    // ── Load YouTube IFrame API ──────────────────────────────────
    useEffect(() => {
        if (window.YT?.Player) { setApiReady(true); return; }
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => setApiReady(true);
        return () => { if (window.onYouTubeIframeAPIReady) delete window.onYouTubeIframeAPIReady; };
    }, []);

    // ── Create Player ────────────────────────────────────────────
    useEffect(() => {
        if (!apiReady || !videoId || !iframeRef.current) return;

        playerRef.current = new window.YT.Player(iframeRef.current, {
            videoId,
            playerVars: { rel: 0, modestbranding: 1, playsinline: 1, autoplay: 0, controls: 0, disablekb: 1 },
            events: {
                onReady: (e: any) => {
                    const d = e.target.getDuration();
                    setDuration(d);
                    // Restore saved position from DB
                    const mr = maxReachedRef.current;
                    if (mr > 0 && d > 0) {
                        const seekTo = Math.min(mr, d);
                        e.target.seekTo(seekTo, true);
                        e.target.pauseVideo();
                        setCurrentTime(seekTo);
                    }
                },
                onStateChange: (e: any) => {
                    const state = e.data;
                    if (state === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        startPolling();
                        const d = e.target.getDuration();
                        if (d > 0) setDuration(d);
                    } else {
                        setIsPlaying(false);
                        stopPolling();
                    }
                    // 0 = ENDED
                    if (state === window.YT.PlayerState.ENDED) {
                        const d = e.target.getDuration();
                        setVideoEnded(true);
                        setCurrentTime(d);
                        onProgressUpdate?.(d, true); // save to DB: completed
                        onVideoComplete?.();
                        if (onComplete) onComplete(Array.from(resultsRef.current.values()));
                    }
                }
            }
        });

        const durInterval = setInterval(() => {
            if (playerRef.current?.getDuration) {
                const d = playerRef.current.getDuration();
                if (d > 0) { setDuration(d); clearInterval(durInterval); }
            }
        }, 1000);

        return () => { playerRef.current?.destroy?.(); stopPolling(); clearInterval(durInterval); };
    }, [apiReady, videoId]);

    // ── Time polling ─────────────────────────────────────────────
    const startPolling = useCallback(() => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            if (!playerRef.current) return;
            const t = playerRef.current.getCurrentTime?.() || 0;
            setCurrentTime(t);

            // Track max reached (prevent seeking forward)
            if (t > maxReachedRef.current) {
                maxReachedRef.current = t;
                // Throttle DB saves: every 5 seconds of new progress
                const now = Date.now();
                if (now - lastSavedRef.current > 5000) {
                    lastSavedRef.current = now;
                    onProgressUpdate?.(maxReachedRef.current, false);
                }
            }

            // Trigger markers
            for (const m of marcadores) {
                const key = m.tiempo;
                if (resultsRef.current.has(key)) continue;
                if (firedMarkersRef.current.has(key)) continue;
                if (Math.abs(t - m.tiempo) < 1.0) {
                    firedMarkersRef.current.add(key);
                    playerRef.current.pauseVideo();
                    setActiveMarker(m);
                    setAnswered('idle');
                    stopPolling();
                    break;
                }
            }
        }, 500);
    }, [marcadores]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    // ── Seek handler — only allows rewind ───────────────────────
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration || !playerRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        const targetTime = pct * duration;

        // Only allow seeking to a time <= max reached (no forwarding)
        const allowed = Math.min(targetTime, maxReachedRef.current);
        playerRef.current.seekTo(allowed, true);
        setCurrentTime(allowed);
    };

    // ── Play/Pause ───────────────────────────────────────────────
    const togglePlay = () => {
        if (!playerRef.current) return;
        const state = playerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    // ── Answer handler ────────────────────────────────────────────
    const handleAnswer = (selected: boolean) => {
        if (!activeMarker || answered !== 'idle') return;
        const correct = selected === activeMarker.respuesta_correcta;
        setAnswered(correct ? 'correct' : 'wrong');
        setResults(prev => {
            const next = new Map(prev);
            next.set(activeMarker.tiempo, { tiempo: activeMarker.tiempo, correcta: correct, respondida: true });
            return next;
        });
    };

    const handleContinue = () => {
        setActiveMarker(null);
        setAnswered('idle');
        playerRef.current?.playVideo?.();
        setTimeout(() => startPolling(), 800);
    };

    // ── Marker click: preview tooltip without pausing ────────────
    const handleMarkerClick = (e: React.MouseEvent, m: VideoMarker) => {
        e.stopPropagation(); // don't trigger the progress bar seek
        // Toggle tooltip: clicking the same marker again hides it
        setTooltipMarker(prev => prev?.tiempo === m.tiempo ? null : m);
        // Auto-hide after 4 seconds
        setTimeout(() => setTooltipMarker(prev => (prev?.tiempo === m.tiempo ? null : prev)), 4000);
    };

    // ── Render ───────────────────────────────────────────────────
    if (!videoId) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: 12, color: '#888' }}>
                URL de video no válida. Usa un enlace de YouTube.
            </div>
        );
    }

    const sortedMarkers = [...marcadores].sort((a, b) => a.tiempo - b.tiempo);

    return (
        <Wrapper>
            <VideoFrame>
                <div ref={iframeRef} />
            </VideoFrame>

            <TimelineContainer>
                <TimelineHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Play/Pause button — icon driven by isPlaying state */}
                        <button
                            onClick={togglePlay}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            title={isPlaying ? 'Pausar' : 'Reproducir'}
                        >
                            {isPlaying
                                ? <Pause size={18} fill="currentColor" strokeWidth={0} />
                                : <Play size={18} fill="currentColor" strokeWidth={0} />
                            }
                        </button>
                        <span>Línea de tiempo interactiva</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {videoEnded && (
                            <span style={{ fontSize: '0.7rem', background: '#12A152', color: 'white', borderRadius: 20, padding: '0.2rem 0.6rem', fontWeight: 700 }}>
                                ✓ Completado
                            </span>
                        )}
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                </TimelineHeader>
                {duration > 0 && (
                    <ProgressBar onClick={handleSeek}>
                        {/* Max-reached zone (lighter to show how far they've been) */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${(maxReachedRef.current / duration) * 100}%`,
                            background: '#b2dfdb', borderRadius: 'inherit',
                        }} />

                        {/* Actual current position */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, height: '100%',
                            width: `${(currentTime / duration) * 100}%`,
                            background: 'var(--primary)', borderRadius: 'inherit',
                            transition: 'width 0.3s linear'
                        }} />

                        {/* Marker dots + tooltips */}
                        {sortedMarkers.map(m => {
                            const r = results.get(m.tiempo);
                            const pct = (m.tiempo / duration) * 100;
                            return (
                                <React.Fragment key={m.tiempo}>
                                    <MarkerDot
                                        $pct={pct}
                                        $done={!!r}
                                        $correct={r?.correcta}
                                        title=""
                                        onClick={e => handleMarkerClick(e, m)}
                                        onMouseEnter={() => setTooltipMarker(m)}
                                        onMouseLeave={() => setTooltipMarker(prev => prev?.tiempo === m.tiempo ? null : prev)}
                                    />
                                    <MarkerTooltip $pct={pct} $visible={tooltipMarker?.tiempo === m.tiempo}>
                                        <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#b45309', marginBottom: '0.2rem' }}>
                                            📍 {formatTime(m.tiempo)}
                                        </span>
                                        {m.pregunta}
                                        {r && (
                                            <span style={{ display: 'block', marginTop: '0.3rem', fontWeight: 700, color: r.correcta ? '#12A152' : '#ea4335' }}>
                                                {r.correcta ? '✓ Correcto' : '✗ Incorrecto'}
                                            </span>
                                        )}
                                    </MarkerTooltip>
                                </React.Fragment>
                            );
                        })}
                    </ProgressBar>
                )}
            </TimelineContainer>

            {/* Question Overlay — pauses video and shows True/False */}
            <Overlay $visible={!!activeMarker}>
                {activeMarker && (
                    <QuestionCard>
                        <TimeBadge><Clock size={12} /> {formatTime(activeMarker.tiempo)}</TimeBadge>
                        <QText>"{activeMarker.pregunta}"</QText>
                        <TFRow>
                            <TFBtn
                                $variant="true"
                                $state={answered !== 'idle' && activeMarker.respuesta_correcta === true
                                    ? answered === 'correct' ? 'correct' : 'idle'
                                    : answered !== 'idle' && !activeMarker.respuesta_correcta ? 'idle'
                                        : answered === 'wrong' && activeMarker.respuesta_correcta === false ? 'wrong' : 'idle'}
                                onClick={() => handleAnswer(true)}
                                disabled={answered !== 'idle'}
                            >
                                ✓ Verdadero
                            </TFBtn>
                            <TFBtn
                                $variant="false"
                                $state={answered !== 'idle' && activeMarker.respuesta_correcta === false
                                    ? answered === 'correct' ? 'correct' : 'idle'
                                    : answered !== 'idle' && activeMarker.respuesta_correcta === true ? 'idle'
                                        : answered === 'wrong' && activeMarker.respuesta_correcta === true ? 'wrong' : 'idle'}
                                onClick={() => handleAnswer(false)}
                                disabled={answered !== 'idle'}
                            >
                                ✗ Falso
                            </TFBtn>
                        </TFRow>
                        {answered !== 'idle' && (
                            <>
                                <ResultMsg $correct={answered === 'correct'}>
                                    {answered === 'correct'
                                        ? <><CheckCircle size={18} /> ¡Correcto! Muy bien.</>
                                        : <><XCircle size={18} /> Incorrecto. La respuesta era {activeMarker.respuesta_correcta ? 'Verdadero' : 'Falso'}.</>
                                    }
                                </ResultMsg>
                                <ContinueBtn onClick={handleContinue}>
                                    <Play size={16} /> Continuar video
                                </ContinueBtn>
                            </>
                        )}
                    </QuestionCard>
                )}
            </Overlay>
        </Wrapper>
    );
}
