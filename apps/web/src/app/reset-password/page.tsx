'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import styles from './reset-password.module.css';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Se já estiver autenticado, redirecionar para o dashboard
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Verificar se o token é válido
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      // Simular validação do token
      setTimeout(() => {
        setIsValidToken(true);
        setIsCheckingToken(false);
        createParticles();
      }, 1000);
    } else {
      setIsValidToken(false);
      setIsCheckingToken(false);
    }
  }, [searchParams]);

  const createParticles = () => {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (10 + Math.random() * 15) + 's';
      
      particlesContainer.appendChild(particle);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    return true;
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      const card = document.querySelector(`.${styles.resetCard}`);
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
      // Simular reset de senha
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Senha redefinida com sucesso');
      showSuccessAnimation();
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.');
      setIsLoading(false);
    }
  };

  if (authLoading || isCheckingToken) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.resetContainer}>
          <div className={styles.resetCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2rem', color: '#233444', marginBottom: '1rem' }}>🔄</div>
              <p style={{ color: '#666' }}>
                {authLoading ? 'Verificando autenticação...' : 'Verificando token...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.resetContainer}>
          <div className={styles.resetCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', color: '#dc3545', marginBottom: '1rem' }}>❌</div>
              <h3 style={{ color: '#233444', fontSize: '1.5rem', marginBottom: '1rem' }}>Link inválido</h3>
              <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.4' }}>
                O link de recuperação é inválido ou expirou. 
                Solicite um novo link de recuperação.
              </p>
              <button 
                onClick={() => router.push('/forgot-password')}
                className={styles.backBtn}
              >
                Solicitar Novo Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.bgDecoration}></div>
        <div className={styles.particles} id="particles"></div>
        <div className={styles.resetContainer}>
          <div className={styles.resetCard}>
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '1rem', animation: `${styles.pulse} 1s ease-in-out infinite` }}>✅</div>
              <h3 style={{ color: '#233444', fontSize: '1.5rem', marginBottom: '1rem' }}>Senha redefinida!</h3>
              <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.4' }}>
                Sua senha foi redefinida com sucesso. 
                Você será redirecionado para a página de login.
              </p>
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

      <div className={styles.resetContainer}>
        <div className={styles.resetCard}>
          <div className={styles.resetHeader}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>🏫</div>
              BIOPARK
            </div>
            <p className={styles.resetSubtitle}>Redefinir Senha</p>
            <p className={styles.resetDescription}>
              Digite sua nova senha
            </p>
          </div>

          {error && (
            <div className={`${styles.errorMessage} ${error ? styles.show : ''}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.resetForm}>
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder=" "
                required
              />
              <div className={styles.formIcon}>🔒</div>
              <label className={styles.formLabel}>Nova Senha</label>
            </div>

            <div className={styles.formGroup}>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={styles.formInput}
                placeholder=" "
                required
              />
              <div className={styles.formIcon}>🔐</div>
              <label className={styles.formLabel}>Confirmar Nova Senha</label>
            </div>

            <button 
              type="submit" 
              className={`${styles.resetBtn} ${isLoading ? styles.loading : ''}`} 
              disabled={isLoading}
            >
              {isLoading ? '' : 'Redefinir Senha'}
            </button>
          </form>

          <div className={styles.resetFooter}>
            <button 
              onClick={() => router.push('/login')}
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
