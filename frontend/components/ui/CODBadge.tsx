import { Check } from 'lucide-react'

export default function CODBadge() {
  return (
    <span style={{
      background: 'var(--cod-green)', color: '#fff',
      borderRadius: 6, padding: '0.2rem 0.65rem',
      fontSize: '0.75rem', fontWeight: 700,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      letterSpacing: '0.02em'
    }}>
      <Check size={14} strokeWidth={3} /> Cash on Delivery
    </span>
  )
}
