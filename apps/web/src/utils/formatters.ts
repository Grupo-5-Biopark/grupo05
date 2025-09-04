/**
 * Formata um número para o formato brasileiro
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('pt-BR', options).format(value)
}

/**
 * Formata um valor monetário para Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data para o formato brasileiro
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(dateObj)
}

/**
 * Formata uma data e hora para o formato brasileiro
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se uma data está no passado
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Obtém o nome do mês em português
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[monthIndex] || ''
}

/**
 * Obtém o nome do dia da semana em português
 */
export function getDayName(dayIndex: number): string {
  const days = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ]
  return days[dayIndex] || ''
}
