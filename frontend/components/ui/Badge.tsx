interface BadgeProps {
  children: React.ReactNode
  color?: string
  bg?: string
}

export default function Badge({ children, color = '#fff', bg = 'var(--primary)' }: BadgeProps) {
  return (
    <span style={{
      background: bg, color, borderRadius: 6,
      padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 700,
      display: 'inline-block', letterSpacing: '0.02em'
    }}>
      {children}
    </span>
  )
}
