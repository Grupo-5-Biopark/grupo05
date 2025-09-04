'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
<<<<<<< HEAD
=======

>>>>>>> origin/development
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
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
<<<<<<< HEAD
      
=======
>>>>>>> origin/development
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      
      particlesContainer.appendChild(particle);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        showSuccessAnimation();
      } else {
        setError('Credenciais inválidas. Tente novamente.');
        setIsLoading(false);
        
        // Fazer o card "balançar"
        const card = document.querySelector(`.${styles.loginCard}`);
        if (card) {
          (card as HTMLElement).style.animation = `${styles.shake} 0.5s ease-in-out`;
          setTimeout(() => {
            (card as HTMLElement).style.animation = '';
          }, 500);
        }
      }
    } catch (err) {
      setError('Erro ao fazer login');
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  // Mostrar loading se ainda estiver verificando a autenticação
=======
>>>>>>> origin/development
  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2rem', color: '#233444', marginBottom: '1rem' }}>🔄</div>
              <p style={{ color: '#666' }}>Verificando autenticação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
=======
    setTimeout(async () => {
      try {
        if (email === 'admin@biopark.com' && password === '123456') {
          showSuccessAnimation();
        } else {
          setError('Credenciais inválidas. Tente novamente.');
          setIsLoading(false);
          
          const card = document.querySelector(`.${styles.loginCard}`);
          if (card) {
            (card as HTMLElement).style.animation = `${styles.shake} 0.5s ease-in-out`;
            setTimeout(() => {
              (card as HTMLElement).style.animation = '';
            }, 500);
          }
        }
      } catch (err) {
        setError('Erro ao fazer login');
        setIsLoading(false);
      }
    }, 2000);
  };

>>>>>>> origin/development
  if (showSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem', animation: `${styles.pulse} 1s ease-in-out infinite` }}>✅</div>
              <h3 style={{ color: '#233444', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Login realizado com sucesso!</h3>
              <p style={{ color: '#666' }}>Redirecionando para o dashboard...</p>
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

      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>🏫</div>
              BIOPARK
            </div>
            <p className={styles.loginSubtitle}>Sistema de Controle de Salas</p>
          </div>

          {error && (
            <div className={`${styles.errorMessage} ${error ? styles.show : ''}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                placeholder=" "
                required
              />
              <div className={styles.formIcon}>👤</div>
              <label className={styles.formLabel}>E-mail</label>
            </div>

            <div className={styles.formGroup}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.formInput}
                placeholder=" "
                required
              />
              <div className={styles.formIcon}>🔒</div>
              <label className={styles.formLabel}>Senha</label>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" className={styles.rememberCheckbox} />
                <span>Lembrar-me</span>
              </label>
<<<<<<< HEAD
              <a href="/forgot-password" className={styles.forgotPassword}>Esqueceu a senha?</a>
=======

              <a href="/forgot-password" className={styles.forgotPassword}>Esqueceu a senha?</a>
              
>>>>>>> origin/development
            </div>

            <button 
              type="submit" 
              className={`${styles.loginBtn} ${isLoading ? styles.loading : ''}`} 
              disabled={isLoading}
            >
              {isLoading ? '' : 'Entrar no Sistema'}
            </button>
          </form>

          <div className={styles.loginFooter}>
            <div className={styles.helpText}>
              Sistema de Controle de Salas BIOPARK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
