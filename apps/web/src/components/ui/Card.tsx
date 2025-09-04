import { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  title?: string
  className?: string
  hover?: boolean
}

export default function Card({ children, title, className = '', hover = false }: CardProps) {
  return (
    <div className={`${styles.card} ${hover ? styles.hover : ''} ${className}`}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
