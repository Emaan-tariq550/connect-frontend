import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', linkTo = '/' }) {
  const sizes = {
    sm: { icon: 'w-8 h-8 text-base', title: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10 text-xl', title: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-14 h-14 text-2xl', title: 'text-3xl', sub: 'text-sm' },
  }
  const s = sizes[size]

  return (
    <Link to={linkTo} className="flex items-center gap-2.5 group">
      <div className={`${s.icon} rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-300`}>
        <span className="text-white font-heading font-bold">C</span>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-heading font-bold ${s.title} text-slate-900 dark:text-white tracking-tight`}>
          CONNECT
        </span>
        <span className={`${s.sub} text-primary font-body font-medium`}>by Emaan</span>
      </div>
    </Link>
  )
}