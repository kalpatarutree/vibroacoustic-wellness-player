'use client';

import { BRAND } from '@/config/brand';

type Option = { label: string; sub: string; url: string; color: string };

export default function DonateModal({ onClose }: { onClose: () => void }) {
  const { support } = BRAND;

  const options: Option[] = [
    support.paypal  && { label: 'PayPal',   sub: 'paypal.me',       url: support.paypal,                                    color: '#003087' },
    support.venmo   && { label: 'Venmo',    sub: support.venmo,     url: `https://venmo.com/${support.venmo.replace('@','')}`, color: '#008CFF' },
    support.cashapp && { label: 'Cash App', sub: support.cashapp,   url: `https://cash.app/${support.cashapp}`,              color: '#00D64F' },
    support.website && { label: 'Website',  sub: 'Learn more',      url: support.website,                                    color: '#6366f1' },
    support.kofi    && { label: 'Ko-fi',    sub: 'Buy me a coffee', url: support.kofi,                                       color: '#FF5E5B' },
  ].filter(Boolean) as Option[];

  const hasOptions = options.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(14,14,14,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/80 transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="px-7 pt-8 pb-8 space-y-6">
          {/* header */}
          <div>
            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-white/30 mb-2">
              Support Our Work
            </p>
            <h2 className="font-display text-3xl font-light text-white" style={{ letterSpacing: '-0.01em' }}>
              {BRAND.name}
            </h2>
            {support.message && (
              <p className="font-sans text-sm text-white/40 mt-2 leading-relaxed">{support.message}</p>
            )}
          </div>

          {/* payment options */}
          {hasOptions ? (
            <div className="space-y-2">
              {options.map(opt => (
                <a
                  key={opt.label}
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-opacity hover:opacity-80 active:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: opt.color }}
                    />
                    <span className="font-sans text-sm text-white/80">{opt.label}</span>
                  </div>
                  <span className="font-sans text-[11px] text-white/30">{opt.sub}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-white/30 italic">
              Add payment links in config/artist.ts to enable donations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
