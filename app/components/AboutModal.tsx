'use client';

import { BRAND } from '@/config/brand';

export default function AboutModal({ onClose }: { onClose: () => void }) {
  const hasLinks  = Object.values(BRAND.links).some(v => v);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden overflow-y-auto"
        style={{
          maxHeight: '85vh',
          background: 'rgba(14,14,14,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors z-10"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="px-8 pt-8 pb-10 space-y-8">
          {/* header */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-white/30 mb-2">
              About
            </p>
            <h2 className="font-display text-4xl font-light text-white" style={{ letterSpacing: '-0.01em' }}>
              {BRAND.name}
            </h2>
            {BRAND.tagline && (
              <p className="font-sans text-sm text-white/45 mt-2">{BRAND.tagline}</p>
            )}
          </div>


          {/* bio */}
          <div className="space-y-4">
            {BRAND.about.split('\n\n').map((para, i) => (
              <p key={i} className="font-sans text-sm leading-relaxed text-white/55">
                {para}
              </p>
            ))}
          </div>


          {/* links */}
          {hasLinks && (
            <div>
              <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-white/30 mb-4">
                Find Us
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BRAND.links).map(([key, url]) => url ? (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[11px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full transition-colors"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {key}
                  </a>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
