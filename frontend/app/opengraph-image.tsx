import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Shopkarro — Premium Furniture Pakistan'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#783A3A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
        }}
      >
        {/* sk mark */}
        <span
          style={{
            color: 'white',
            fontSize: '180px',
            fontWeight: '900',
            fontFamily: 'sans-serif',
            letterSpacing: '-6px',
            lineHeight: 1,
          }}
        >
          sk
        </span>

        {/* Brand name */}
        <span
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '36px',
            fontWeight: '600',
            fontFamily: 'sans-serif',
            letterSpacing: '8px',
            textTransform: 'uppercase',
          }}
        >
          Shopkarro
        </span>

        {/* Tagline */}
        <span
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '22px',
            fontFamily: 'sans-serif',
            letterSpacing: '2px',
          }}
        >
          Premium Furniture · Pakistan
        </span>
      </div>
    ),
    { ...size }
  )
}
