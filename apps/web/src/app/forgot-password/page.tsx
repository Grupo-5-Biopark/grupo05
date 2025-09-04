'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1 = email input, 2 = success message
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, forgotPassword } = useAuth();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para o dashboard
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    createParticles();
  }, []);

  const createParticles = () => {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      
      // Posição aleatória
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (10 + Math.random() * 15) + 's';
      
      particlesContainer.appendChild(particle);
    }
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const showSuccessStep = () => {
    setShowSuccess(true);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('E-mail é obrigatório');
      const card = document.querySelector(`.${styles.forgotCard}`);
      if (card) {
        (card as HTMLElement).style.animation = `${styles.shake} 0.5s ease-in-out`;
        setTimeout(() => {
          (card as HTMLElement).style.animation = '';
        }, 500);
      }
      return;
    }

    if (!validateEmail(email)) {
      setError('E-mail inválido');
      const card = document.querySelector(`.${styles.forgotCard}`);
      if (card) {
        (card as HTMLElement).style.animation = `${styles.shake} 0.5s ease-in-out`;
        setTimeout(() => {
          (card as HTMLElement).style.animation = '';
        }, 500);
      }
      return;
    }

    setIsLoading(true);

    try {
      // Usar o hook de recuperação de senha
      const success = await forgotPassword(email);
      
      if (success) {
        showSuccessStep();
      } else {
        setError('Erro ao enviar email de recuperação. Tente novamente.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.');
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  // Mostrar loading se ainda estiver verificando a autenticação
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.forgotContainer}>
          <div className={styles.forgotCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2rem', color: '#233444', marginBottom: '1rem' }}>🔄</div>
              <p style={{ color: '#666' }}>Verificando autenticação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess && step === 2) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.forgotContainer}>
          <div className={styles.forgotCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem', animation: `${styles.pulse} 1s ease-in-out infinite` }}>✉️</div>
              <h3 style={{ color: '#233444', fontSize: '1.5rem', marginBottom: '1rem' }}>E-mail enviado com sucesso!</h3>
              <p style={{ color: '#666', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                Enviamos um link de recuperação para:
              </p>
              <p style={{ color: '#EB0644', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {email}
              </p>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                Verifique sua caixa de entrada e clique no link para redefinir sua senha.
                Não se esqueça de verificar a pasta de spam!
              </p>
              <button 
                onClick={handleBackToLogin}
                className={styles.backBtn}
              >
                Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.bgDecoration}></div>
      <div className={styles.particles} id="particles"></div>

      <div className={styles.forgotContainer}>
        <div className={styles.forgotCard}>
          <div className={styles.forgotHeader}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>🏫</div>
              BIOPARK
            </div>
            <p className={styles.forgotSubtitle}>Recuperar Senha</p>
            <p className={styles.forgotDescription}>
              Digite seu e-mail para receber um link de recuperação de senha
            </p>
          </div>

          {error && (
            <div className={`${styles.errorMessage} ${error ? styles.show : ''}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.forgotForm}>
            <div className={styles.formGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                placeholder=" "
                required
              />
              <div className={styles.formIcon}>✉️</div>
              <label className={styles.formLabel}>E-mail</label>
            </div>

            <button 
              type="submit" 
              className={`${styles.forgotBtn} ${isLoading ? styles.loading : ''}`} 
              disabled={isLoading}
            >
              {isLoading ? '' : 'Enviar Link de Recuperação'}
            </button>
          </form>

          <div className={styles.forgotFooter}>
            <button 
              onClick={handleBackToLogin}
              className={styles.backToLoginBtn}
            >
              ← Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
