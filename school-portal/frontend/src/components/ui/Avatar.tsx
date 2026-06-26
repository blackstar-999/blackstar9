import { cn } from '@/utils/cn'

const sizes = { xs: 'h-6 w-6 text-xs', sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-16 w-16 text-lg' }

interface Props {
  src?: string | null
  name?: string
  size?: keyof typeof sizes
  className?: string
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: Props) {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
  const color  = colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  return src
    ? <img src={src} alt={name} className={cn('rounded-full object-cover', sizes[size], className)} />
    : <div className={cn('rounded-full flex items-center justify-center text-white font-semibold', color, sizes[size], className)}>
        {initials(name)}
      </div>
}
