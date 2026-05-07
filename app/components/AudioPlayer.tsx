'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CATEGORIES, type Track } from '@/config/content';
import AboutModal  from './AboutModal';
import DonateModal from './DonateModal';

// ── utils ─────────────────────────────────────────────────────

function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// ── icons ─────────────────────────────────────────────────────

const IconPlay = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 translate-x-0.5"><path d="M8 5v14l11-7z" /></svg>
);
const IconPause = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);
const IconPrev = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
);
const IconNext = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
);
const IconVol = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
  </svg>
);
const IconMute = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);
const IconShuffle = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
  </svg>
);

// ── background layer ──────────────────────────────────────────

function BgLayer({ track, visible, shift }: { track: Track; visible: boolean; shift: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (track.isVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [track.visual, track.isVideo]);

  return (
    <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out" style={{ opacity: visible ? 1 : 0 }}>
      {track.isVideo ? (
        <video ref={videoRef} src={track.visual} autoPlay loop muted playsInline className="w-full h-full object-cover"
          style={{ transform: `scale(1.15) translateX(${shift * -20}px)`, filter: 'brightness(0.72)' }} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.visual} alt="" className="w-full h-full object-cover"
          style={{ transform: `scale(1.15) translateX(${shift * -20}px)`, filter: 'brightness(0.72)' }} />
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────

const SWIPE_PX   = 52;
const HIDE_AFTER = 4500;

const allCategories = CATEGORIES.filter(c => c.tracks.length > 0);
const hasContent    = allCategories.length > 0;
const placeholder: Track = { title: '', src: '', audioType: '', thumbnail: '', visual: '', isVideo: false };

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [catIdx,   setCatIdx]   = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume,  setVolume]  = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const [cachedTracks,  setCachedTracks]  = useState<Set<string>>(new Set());
  const [isCachingAll,  setIsCachingAll]  = useState(false);
  const [showAbout,  setShowAbout]  = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  // swipe
  const [dragX, setDragX]         = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const txStart   = useRef(0);
  const tyStart   = useRef(0);
  const tyCurrent = useRef(0);
  const isHoriz   = useRef<boolean | null>(null);

  // background A/B crossfade
  const firstTrack = hasContent ? allCategories[0].tracks[0] : placeholder;
  const [activeBg, setActiveBg] = useState<0 | 1>(0);
  const [bgSlots,  setBgSlots]  = useState<[Track, Track]>([firstTrack, firstTrack]);

  // controls visibility
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // gesture hint
  const [showHint, setShowHint] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShowHint(false), 3200); return () => clearTimeout(t); }, []);

  // thumbnail visibility — hides 5s after playback starts, reappears when paused or track changes
  const [showThumb, setShowThumb] = useState(true);
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    clearTimeout(thumbTimer.current);
    setShowThumb(true);
    if (isPlaying) {
      thumbTimer.current = setTimeout(() => setShowThumb(false), 5000);
    }
    return () => clearTimeout(thumbTimer.current);
  }, [isPlaying, trackIdx, catIdx]);

  // always-current refs
  const catIdxRef   = useRef(0);      catIdxRef.current   = catIdx;
  const trackIdxRef = useRef(0);      trackIdxRef.current = trackIdx;
  const activeBgRef = useRef<0|1>(0); activeBgRef.current = activeBg;
  const shuffleRef  = useRef(false);  shuffleRef.current  = shuffle;

  const bumpUI = useCallback(() => {
    setUiVisible(true);
    clearTimeout(hideTimer.current);
    if (isPlayingRef.current) hideTimer.current = setTimeout(() => setUiVisible(false), HIDE_AFTER);
  }, []);

  useEffect(() => {
    if (!isPlaying) { clearTimeout(hideTimer.current); setUiVisible(true); }
    else hideTimer.current = setTimeout(() => setUiVisible(false), HIDE_AFTER);
    return () => clearTimeout(hideTimer.current);
  }, [isPlaying]);

  // ── navigation ────────────────────────────────────────────

  const goTo = useCallback((cIdx: number, tIdx: number) => {
    if (!hasContent) return;
    const cat = allCategories[cIdx];
    if (!cat || tIdx < 0 || tIdx >= cat.tracks.length) return;
    const targetTrack = cat.tracks[tIdx];
    const curr = activeBgRef.current;
    setBgSlots(prev => { const next = [...prev] as [Track, Track]; next[curr === 0 ? 1 : 0] = targetTrack; return next; });
    setActiveBg(curr === 0 ? 1 : 0);
    setCatIdx(cIdx);
    setTrackIdx(tIdx);
    setDragX(0);
  }, []);

  // ── audio events ──────────────────────────────────────────

  const wasPlayingRef = useRef(false);
  wasPlayingRef.current = isPlaying;

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !hasContent) return;
    const onTime  = () => setCurrentTime(a.currentTime);
    const onDur   = () => setDuration(a.duration);
    const onEnd   = () => {
      const cIdx = catIdxRef.current;
      const tIdx = trackIdxRef.current;
      if (shuffleRef.current) {
        const all = allCategories.flatMap((c, ci) => c.tracks.map((_, ti) => [ci, ti] as [number, number]));
        const [rc, rt] = all[Math.floor(Math.random() * all.length)];
        goTo(rc, rt);
      } else if (tIdx < allCategories[cIdx].tracks.length - 1) {
        goTo(cIdx, tIdx + 1);
      } else if (cIdx < allCategories.length - 1) {
        goTo(cIdx + 1, 0);
      } else {
        goTo(0, 0);
      }
    };
    const onWait  = () => setIsBuffering(true);
    const onCan   = () => setIsBuffering(false);
    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    a.addEventListener('timeupdate',     onTime);
    a.addEventListener('durationchange', onDur);
    a.addEventListener('ended',          onEnd);
    a.addEventListener('waiting',        onWait);
    a.addEventListener('canplay',        onCan);
    a.addEventListener('play',           onPlay);
    a.addEventListener('pause',          onPause);
    return () => {
      a.removeEventListener('timeupdate',     onTime);
      a.removeEventListener('durationchange', onDur);
      a.removeEventListener('ended',          onEnd);
      a.removeEventListener('waiting',        onWait);
      a.removeEventListener('canplay',        onCan);
      a.removeEventListener('play',           onPlay);
      a.removeEventListener('pause',          onPause);
    };
  }, [trackIdx, catIdx, goTo]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !hasContent) return;
    a.load(); setCurrentTime(0); setDuration(0); setIsBuffering(true);
    if (wasPlayingRef.current) a.play().catch(() => setIsPlaying(false));
  }, [trackIdx, catIdx]);

  // ── touch ─────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    txStart.current = e.touches[0].clientX; tyStart.current = e.touches[0].clientY;
    tyCurrent.current = e.touches[0].clientY; isHoriz.current = null;
    setIsDragging(true); bumpUI();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - txStart.current;
    const dy = e.touches[0].clientY - tyStart.current;
    tyCurrent.current = e.touches[0].clientY;
    if (isHoriz.current === null) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      isHoriz.current = Math.abs(dx) > Math.abs(dy);
    }
    e.preventDefault();
    if (isHoriz.current) {
      const tCount = allCategories[catIdxRef.current]?.tracks.length ?? 1;
      const edge = (dx > 0 && trackIdxRef.current === 0) || (dx < 0 && trackIdxRef.current === tCount - 1);
      setDragX(edge ? dx * 0.12 : dx);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (isHoriz.current === true) {
      if      (dragX < -SWIPE_PX) goTo(catIdxRef.current, trackIdxRef.current + 1);
      else if (dragX >  SWIPE_PX) goTo(catIdxRef.current, trackIdxRef.current - 1);
      else setDragX(0);
    } else if (isHoriz.current === false) {
      const dy = tyCurrent.current - tyStart.current;
      if      (dy < -SWIPE_PX) goTo(catIdxRef.current + 1, 0);
      else if (dy >  SWIPE_PX) goTo(catIdxRef.current - 1, 0);
    }
    setDragX(0);
  };

  // ── playback ──────────────────────────────────────────────

  const togglePlay = async () => {
    const a = audioRef.current; if (!a) return;
    bumpUI();
    if (isPlaying) { a.pause(); return; }
    try { await a.play(); } catch { setIsPlaying(false); }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a || !isFinite(duration)) return;
    a.currentTime = parseFloat(e.target.value);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current; if (!a) return;
    const v = parseFloat(e.target.value);
    a.volume = v; setVolume(v); setIsMuted(v === 0);
  };

  const toggleMute = () => { const a = audioRef.current; if (!a) return; a.muted = !isMuted; setIsMuted(!isMuted); };

  // ── cache ─────────────────────────────────────────────────

  const allTracks = allCategories.flatMap(c => c.tracks);

  const checkCache = useCallback(async () => {
    if (!('caches' in window)) return;
    try {
      const cache = await caches.open('va-media-cache');
      const hits = new Set<string>();
      await Promise.all(allTracks.map(async t => { if (await cache.match(t.src)) hits.add(t.src); }));
      setCachedTracks(hits);
    } catch { /* quota */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { checkCache(); const id = setInterval(checkCache, 3000); return () => clearInterval(id); }, [checkCache]);

  const cacheAll = async () => {
    setIsCachingAll(true);
    try {
      const cache = await caches.open('va-media-cache');
      for (const t of allTracks)
        for (const url of [t.src, t.visual].filter(Boolean)) {
          if (await cache.match(url)) continue;
          const res = await fetch(url);
          if (res.ok) await cache.put(url, res);
        }
    } catch { /* quota */ }
    await checkCache(); setIsCachingAll(false);
  };

  // ── derived ───────────────────────────────────────────────

  const currentCat    = hasContent ? allCategories[catIdx] : null;
  const currentTracks = currentCat?.tracks ?? [];
  const currentTrack  = currentTracks[trackIdx] ?? placeholder;
  const allCached     = allTracks.length > 0 && allTracks.every(t => cachedTracks.has(t.src));
  const currentCached = cachedTracks.has(currentTrack.src);
  const progress      = duration > 0 ? (currentTime / duration) * 100 : 0;
  const vw            = typeof window !== 'undefined' ? window.innerWidth : 390;
  const dragRatio     = dragX / vw;
  const carouselVw    = -(trackIdx * 100) + dragRatio * 100;

  // ── render ────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: 'none' }}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={bumpUI}>

      {/* backgrounds */}
      {hasContent ? (
        <>
          <BgLayer track={bgSlots[0]} visible={activeBg === 0} shift={dragRatio} />
          <BgLayer track={bgSlots[1]} visible={activeBg === 1} shift={dragRatio} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(40,60,80,0.5) 0%, rgba(0,0,0,1) 70%)' }} />
      )}

      {/* gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)'
      }} />

      {/* gesture hint */}
      {hasContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 transition-opacity duration-1000"
          style={{ opacity: showHint ? 1 : 0 }}>
          <div className="text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <p className="font-sans text-[11px] tracking-[0.35em] uppercase mb-2">↕ categories</p>
            <p className="font-sans text-[11px] tracking-[0.35em] uppercase">↔ sessions</p>
          </div>
        </div>
      )}

      {/* logo */}
      <div className="absolute left-5 pointer-events-none z-10"
        style={{ top: 'max(env(safe-area-inset-top), 44px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Vibroacoustic Wellness" style={{ width: 180, opacity: 0.9 }} />
      </div>

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 flex items-start justify-between px-7 transition-all duration-700 ease-out"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 44px)', paddingBottom: 16,
          opacity: uiVisible ? 1 : 0, transform: uiVisible ? 'none' : 'translateY(-6px)', pointerEvents: uiVisible ? 'auto' : 'none' }}>
        <div className="flex flex-col gap-0.5">
          {hasContent && <>
            <span className="font-sans text-[9px] tracking-[0.22em] text-white/25 uppercase">
              {String(catIdx + 1).padStart(2,'0')} / {String(allCategories.length).padStart(2,'0')} categories
            </span>
            <span className="font-sans text-[11px] tracking-[0.22em] text-white/35 uppercase">
              {String(trackIdx + 1).padStart(2,'0')} — {String(currentTracks.length).padStart(2,'0')}
            </span>
          </>}
        </div>
        {hasContent && (
          <button onClick={e => { e.stopPropagation(); if (!allCached && !isCachingAll) cacheAll(); }}
            className="flex items-center gap-1.5 font-sans text-[11px] tracking-[0.18em] uppercase transition-colors"
            style={{ color: allCached ? 'rgba(110,231,183,0.7)' : 'rgba(255,255,255,0.4)' }}>
            {allCached ? <><IconCheck /><span>Offline</span></>
              : isCachingAll ? <><span className="w-3 h-3 rounded-full border border-white/25 border-t-white/60 animate-spin inline-block" /><span>Saving…</span></>
              : <><IconSave /><span>Save offline</span></>}
          </button>
        )}
      </div>

      {/* category dots + desktop arrows */}
      {hasContent && (
        <div className="absolute right-4 flex flex-col items-center gap-2 transition-all duration-700"
          style={{ top: '50%', transform: 'translateY(-50%)', opacity: uiVisible ? 1 : 0, pointerEvents: uiVisible ? 'auto' : 'none' }}>
          <button onClick={e => { e.stopPropagation(); goTo(catIdx - 1, 0); }} disabled={catIdx === 0}
            className="hidden md:flex items-center justify-center w-6 h-6 text-white/40 hover:text-white/80 disabled:opacity-10 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
          </button>
          {allCategories.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); goTo(i, 0); }}
              className="transition-all duration-300 rounded-full bg-white"
              style={{ width: 5, height: i === catIdx ? 22 : 5, opacity: i === catIdx ? 0.85 : 0.28 }} />
          ))}
          <button onClick={e => { e.stopPropagation(); goTo(catIdx + 1, 0); }} disabled={catIdx === allCategories.length - 1}
            className="hidden md:flex items-center justify-center w-6 h-6 text-white/40 hover:text-white/80 disabled:opacity-10 transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
          </button>
        </div>
      )}

      {/* three-column content area */}
      <div className="absolute inset-x-0 flex items-center justify-center gap-8 px-6"
        style={{ top: 'max(env(safe-area-inset-top), 44px)', bottom: 'calc(var(--panel-h, 200px) + 110px)' }}>


        {/* Center: artwork */}
        <div className="relative rounded-2xl overflow-hidden shrink-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
          style={{ width: 'min(52vw, min(44vh, 320px))', aspectRatio: '1/1', boxShadow: '0 12px 72px rgba(0,0,0,0.7)', opacity: showThumb ? 1 : 0 }}>
          {hasContent ? ([0, 1] as const).map(slot => (
            <div key={slot} className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: activeBg === slot ? 1 : 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgSlots[slot].thumbnail} alt="" className="w-full h-full object-cover" />
            </div>
          )) : (
            <div className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="font-sans text-[11px] text-white/20 text-center px-4">Add sessions in<br/>config/content.ts</p>
            </div>
          )}
        </div>

      </div>

      {/* carousel — session titles */}
      {hasContent && (
        <div className="absolute inset-x-0 pointer-events-none overflow-visible"
          style={{ bottom: 'calc(var(--panel-h, 200px) + 56px)' }}>
          <div className="flex" style={{
            width: `${currentTracks.length * 100}vw`,
            transform: `translateX(${carouselVw}vw)`,
            transition: isDragging ? 'none' : 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            {currentTracks.map((t, i) => {
              const dist = Math.abs(i - trackIdx - dragRatio);
              return (
                <div key={t.src || i} className="flex flex-col justify-end px-8" style={{ width: '100vw' }}>
                  <p className="font-sans text-[10px] tracking-[0.28em] uppercase mb-1.5 transition-all duration-500"
                    style={{ color: `rgba(255,255,255,${Math.max(0, 0.35 - dist * 0.25)})` }}>
                    {currentCat?.name}
                  </p>
                  <h1 className="font-display leading-[1.05] text-white"
                    style={{ fontSize: 'clamp(2.6rem, 11vw, 4.2rem)', fontWeight: 300,
                      opacity: Math.max(0, 1 - dist * 1.6), textShadow: '0 4px 48px rgba(0,0,0,0.5)', letterSpacing: '-0.01em' }}>
                    {t.title}
                  </h1>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* session dots */}
      {hasContent && (
        <div className="absolute inset-x-0 flex justify-center items-center gap-[7px] transition-all duration-700"
          style={{ bottom: 'calc(var(--panel-h, 200px) + 24px)', opacity: uiVisible ? 1 : 0, paddingRight: 24 }}>
          {currentTracks.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); goTo(catIdx, i); }}
              className="transition-all duration-300 rounded-full bg-white"
              style={{ width: i === trackIdx ? 22 : 5, height: 5, opacity: i === trackIdx ? 0.85 : 0.28 }} />
          ))}
        </div>
      )}

      {/* about / support buttons — always visible */}
      <div className="absolute left-6 flex items-center gap-3"
        style={{ bottom: 'calc(var(--panel-h, 200px) + 22px)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={() => setShowAbout(true)}
          className="font-sans text-[14px] font-semibold tracking-[0.15em] uppercase text-white/70 hover:text-white transition-colors">
          About
        </button>
        <span className="text-white/30 text-sm">·</span>
        <button onClick={() => setShowDonate(true)}
          className="font-sans text-[14px] font-semibold tracking-[0.15em] uppercase text-white/70 hover:text-white transition-colors">
          Support
        </button>
      </div>

      {/* glass control panel */}
      <div className="absolute inset-x-0 bottom-0 transition-all duration-700 ease-out"
        style={{ opacity: uiVisible ? 1 : 0, transform: uiVisible ? 'none' : 'translateY(12px)', pointerEvents: uiVisible ? 'auto' : 'none' }}
        onClick={e => e.stopPropagation()}>
        <div className="mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{ background: 'rgba(12,12,12,0.72)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="px-6 pt-5 pb-2">
            <div className="relative h-[3px] rounded-full bg-white/10 mb-1">
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/75"
                style={{ width: `${progress}%`, transition: 'width 0.25s linear' }} />
              <input type="range" min={0} max={isFinite(duration) ? duration : 0} step={0.5}
                value={currentTime} onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: '100%' }} />
            </div>
            <div className="flex justify-between font-sans text-[11px] text-white/30 tabular-nums mt-2">
              <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 pb-5">
            <div className="flex items-center gap-2.5 w-28">
              <button onClick={toggleMute} className="text-white/40 hover:text-white/80 transition-colors shrink-0">
                {isMuted ? <IconMute /> : <IconVol />}
              </button>
              <div className="relative flex-1 h-[2px] rounded-full bg-white/10">
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/50" style={{ width: `${isMuted ? 0 : volume * 100}%` }} />
                <input type="range" min={0} max={1} step={0.02} value={isMuted ? 0 : volume} onChange={handleVolume}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: '100%' }} />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => goTo(catIdx, trackIdx - 1)} disabled={!hasContent || trackIdx === 0}
                className="text-white/60 hover:text-white disabled:opacity-20 transition-colors active:scale-90"><IconPrev /></button>
              <button onClick={togglePlay} disabled={!hasContent}
                className="relative w-[60px] h-[60px] rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.95)', color: '#000', boxShadow: isPlaying ? '0 0 28px rgba(255,255,255,0.18)' : 'none' }}>
                {isBuffering && isPlaying
                  ? <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black/70 animate-spin" />
                  : isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button onClick={() => goTo(catIdx, trackIdx + 1)} disabled={!hasContent || trackIdx === currentTracks.length - 1}
                className="text-white/60 hover:text-white disabled:opacity-20 transition-colors active:scale-90"><IconNext /></button>
            </div>

            <div className="w-28 flex justify-end items-center gap-3">
              <button onClick={() => setShuffle(s => !s)} title="Shuffle" className="transition-colors"
                style={{ color: shuffle ? 'rgba(167,139,250,0.9)' : 'rgba(255,255,255,0.25)' }}>
                <IconShuffle />
              </button>
              {currentCached && (
                <span className="flex items-center gap-1 font-sans text-[11px] tracking-[0.15em] uppercase" style={{ color: 'rgba(110,231,183,0.6)' }}>
                  <IconCheck /><span>Offline</span>
                </span>
              )}
            </div>
          </div>

          <div style={{ height: 'max(env(safe-area-inset-bottom), 8px)' }} />
        </div>
      </div>

      {showAbout  && <AboutModal  onClose={() => setShowAbout(false)}  />}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}

      {hasContent && (
        <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
          <source src={currentTrack.src} type={currentTrack.audioType} />
        </audio>
      )}
    </div>
  );
}
