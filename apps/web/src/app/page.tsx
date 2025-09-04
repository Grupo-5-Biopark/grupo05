export default function HomePage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      background: 'linear-gradient(135deg, #233444 0%, #1a2935 50%, #0f1419 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>BIOPARK</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>Sistema de Controle de Salas</p>
      <p style={{ fontSize: '1rem', opacity: 0.6 }}>Em desenvolvimento...</p>
    </div>
  )
}
