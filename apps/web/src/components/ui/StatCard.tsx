import styles from './StatCard.module.css'

interface StatCardProps {
  value: string | number
  label: string
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatCard({ value, label, icon, trend }: StatCardProps) {
  return (
    <div className={styles.card}>
      {icon && (
        <div className={styles.icon}>
          {icon}
        </div>
      )}
      
      <div className={styles.content}>
        <div className={styles.value}>
          {value}
        </div>
        
        <div className={styles.label}>
          {label}
        </div>
        
        {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            <span className={styles.trendIcon}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}
