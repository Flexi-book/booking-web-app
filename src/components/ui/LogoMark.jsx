import { useId } from 'react'
import { useTheme } from '../../hooks/useTheme'

const VARIANTS = {
  dark: {
    stroke: '#0D213D',
    supportLeft: '#2B77D3',
    supportRight: '#8A4DFF',
    check: '#0D213D',
  },
  light: {
    stroke: '#1EC9FF',
    supportLeft: '#4DB2FF',
    supportRight: '#C92DDB',
    check: '#EAF6FF',
  },
}

export default function LogoMark({ className = '' }) {
  const { isDark } = useTheme()
  const theme = isDark ? VARIANTS.light : VARIANTS.dark
  const gradientId = useId().replace(/:/g, '')

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="90" y1="72" x2="420" y2="430" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={theme.stroke} />
          <stop offset="0.55" stopColor={theme.supportLeft} />
          <stop offset="1" stopColor={theme.supportRight} />
        </linearGradient>
      </defs>

      <rect x="112" y="112" width="288" height="288" rx="72" stroke={`url(#${gradientId})`} strokeWidth="34" />
      <rect x="164" y="66" width="30" height="56" rx="15" fill={theme.supportLeft} />
      <rect x="318" y="66" width="30" height="56" rx="15" fill={theme.supportRight} />
      <path d="M180 262 L238 320 L338 220" stroke={theme.check} strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
