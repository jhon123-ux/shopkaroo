import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#783A3A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0',
        }}
      >
        <span style={{
          color: 'white',
          fontSize: '22px',
          fontWeight: '800',
          fontFamily: 'sans-serif'
        }}>
          S
        </span>
      </div>
    ),
    { ...size }
  )
}
