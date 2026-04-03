'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function SwaggerPage() {
  if (process.env.NODE_ENV === 'production') {
    return <div>Not available in production</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <SwaggerUI url={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api-docs/json`} />
    </div>
  )
}
