'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './settings.css';

interface CalculationParameters {
  id: number;
  dropoutPercentage: number;
  studentsPerSmallRoom: number;
  studentsPerMediumRoom: number;
  studentsPerBigRoom: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const { get, put, error } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [parameters, setParameters] = useState<CalculationParameters | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state - using strings to allow empty input fields
  const [formData, setFormData] = useState({
    dropoutPercentage: '',
    studentsPerSmallRoom: '',
    studentsPerMediumRoom: '',
    studentsPerBigRoom: '',
  });

  useEffect(() => {
    void loadParameters();
  }, []);

  async function loadParameters() {
    setIsLoading(true);
    try {
      const response = await get<CalculationParameters[]>(
        '/api/calculationParameters',
      );

      // Get the first (and should be only) parameter set
      if (response.data && response.data.length > 0) {
        const params = response.data[0];
        setParameters(params);
        setFormData({
          dropoutPercentage: String(params.dropoutPercentage),
          studentsPerSmallRoom: String(params.studentsPerSmallRoom),
          studentsPerMediumRoom: String(params.studentsPerMediumRoom),
          studentsPerBigRoom: String(params.studentsPerBigRoom),
        });
      }
    } catch (err) {
      console.error('Erro ao buscar parâmetros:', err);
      setErrorMessage('Erro ao carregar os parâmetros de configuração');
    } finally {
      setIsLoading(false);
    }
  }

  // Validates and filters input to only allow valid number characters
  const handleInputChange = (
    field: string,
    value: string,
    allowDecimals: boolean = false,
  ) => {
    // Allow empty string for clearing the field
    if (value === '') {
      setFormData((prev) => ({ ...prev, [field]: '' }));
      setSuccessMessage('');
      setErrorMessage('');
      return;
    }

    // Regex pattern: integers only or decimals (with . or , as separator)
    const pattern = allowDecimals ? /^-?\d*[.,]?\d*$/ : /^-?\d*$/;

    if (pattern.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  // Helper to parse form values to numbers (handles both . and , as decimal separator)
  const parseFormData = () => ({
    dropoutPercentage:
      Number.parseFloat(formData.dropoutPercentage.replace(',', '.')) || 0,
    studentsPerSmallRoom:
      Number.parseInt(formData.studentsPerSmallRoom, 10) || 0,
    studentsPerMediumRoom:
      Number.parseInt(formData.studentsPerMediumRoom, 10) || 0,
    studentsPerBigRoom: Number.parseInt(formData.studentsPerBigRoom, 10) || 0,
  });

  const handleSave = async () => {
    const {
      dropoutPercentage,
      studentsPerSmallRoom,
      studentsPerMediumRoom,
      studentsPerBigRoom,
    } = parseFormData();

    // Validation
    if (dropoutPercentage < 0 || dropoutPercentage > 100) {
      setErrorMessage('A porcentagem de evasão deve estar entre 0 e 100');
      return;
    }

    if (
      studentsPerSmallRoom <= 0 ||
      studentsPerMediumRoom <= 0 ||
      studentsPerBigRoom <= 0
    ) {
      setErrorMessage('O número de alunos por sala deve ser maior que zero');
      return;
    }

    if (
      studentsPerSmallRoom >= studentsPerMediumRoom ||
      studentsPerMediumRoom >= studentsPerBigRoom
    ) {
      setErrorMessage('O número de alunos deve ser: Pequena < Média < Grande');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const dataToSend = {
        dropoutPercentage,
        studentsPerSmallRoom,
        studentsPerMediumRoom,
        studentsPerBigRoom,
      };
      await put('/api/calculationParameters', dataToSend);
      setSuccessMessage('Parâmetros salvos com sucesso! ✅');
      await loadParameters(); // Reload to confirm changes
    } catch (err) {
      console.error('Erro ao salvar parâmetros:', err);
      setErrorMessage('Erro ao salvar os parâmetros. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (parameters) {
      setFormData({
        dropoutPercentage: String(parameters.dropoutPercentage),
        studentsPerSmallRoom: String(parameters.studentsPerSmallRoom),
        studentsPerMediumRoom: String(parameters.studentsPerMediumRoom),
        studentsPerBigRoom: String(parameters.studentsPerBigRoom),
      });
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  if (isLoading) {
    return (
      <div className="settings-layout">
        <Header user={user} onLogout={handleLogout} />
        <Sidebar currentPage="configuracoes" onPageChange={() => {}} />
        <main className="main-content">
          <div className="loading">🔄 Carregando configurações...</div>
        </main>
      </div>
    );
  }

  if (error && !parameters) {
    return (
      <div className="settings-layout">
        <Header user={user} onLogout={handleLogout} />
        <Sidebar currentPage="configuracoes" onPageChange={() => {}} />
        <main className="main-content">
          <div className="error-message">
            ❌ Erro ao carregar configurações: {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="configuracoes" onPageChange={() => {}} />
      <main className="main-content">
        <div className="settings-page">
          <div className="settings-header">
            <h1>Configurações do Sistema</h1>
            <p className="subtitle">
              Parâmetros de cálculo para alocação de salas e turmas
            </p>
          </div>

          <div className="settings-content">
            <div className="settings-card">
              <div className="card-header">
                <h2 className="card-title">⚙️ Parâmetros de Cálculo</h2>
                <p className="card-description">
                  Configure os parâmetros utilizados nos cálculos de alocação de
                  salas e estimativa de alunos.
                </p>
              </div>

              <div className="card-body">
                {/* Dropout Percentage */}
                <div className="form-group">
                  <label htmlFor="dropoutPercentage" className="form-label">
                    <span className="label-icon">📉</span> Porcentagem de Evasão
                  </label>
                  <div className="input-group">
                    <input
                      id="dropoutPercentage"
                      type="text"
                      inputMode="decimal"
                      value={formData.dropoutPercentage}
                      onChange={(e) =>
                        handleInputChange(
                          'dropoutPercentage',
                          e.target.value,
                          true,
                        )
                      }
                      className="form-input"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                  <p className="form-help">
                    Porcentagem estimada de alunos que podem evadir durante o
                    curso (0-100%)
                  </p>
                </div>

                {/* Small Room */}
                <div className="form-group">
                  <label htmlFor="studentsPerSmallRoom" className="form-label">
                    <span className="label-icon">🏫</span> Alunos por Sala
                    Pequena
                  </label>
                  <div className="input-group">
                    <input
                      id="studentsPerSmallRoom"
                      type="text"
                      inputMode="numeric"
                      value={formData.studentsPerSmallRoom}
                      onChange={(e) =>
                        handleInputChange(
                          'studentsPerSmallRoom',
                          e.target.value,
                        )
                      }
                      className="form-input"
                    />
                    <span className="input-suffix">alunos</span>
                  </div>
                  <p className="form-help">
                    Capacidade máxima de alunos para salas classificadas como
                    pequenas
                  </p>
                </div>

                {/* Medium Room */}
                <div className="form-group">
                  <label htmlFor="studentsPerMediumRoom" className="form-label">
                    <span className="label-icon">🏬</span> Alunos por Sala Média
                  </label>
                  <div className="input-group">
                    <input
                      id="studentsPerMediumRoom"
                      type="text"
                      inputMode="numeric"
                      value={formData.studentsPerMediumRoom}
                      onChange={(e) =>
                        handleInputChange(
                          'studentsPerMediumRoom',
                          e.target.value,
                        )
                      }
                      className="form-input"
                    />
                    <span className="input-suffix">alunos</span>
                  </div>
                  <p className="form-help">
                    Capacidade máxima de alunos para salas classificadas como
                    médias
                  </p>
                </div>

                {/* Big Room */}
                <div className="form-group">
                  <label htmlFor="studentsPerBigRoom" className="form-label">
                    <span className="label-icon">🏢</span> Alunos por Sala
                    Grande
                  </label>
                  <div className="input-group">
                    <input
                      id="studentsPerBigRoom"
                      type="text"
                      inputMode="numeric"
                      value={formData.studentsPerBigRoom}
                      onChange={(e) =>
                        handleInputChange('studentsPerBigRoom', e.target.value)
                      }
                      className="form-input"
                    />
                    <span className="input-suffix">alunos</span>
                  </div>
                  <p className="form-help">
                    Capacidade máxima de alunos para salas classificadas como
                    grandes
                  </p>
                </div>
              </div>

              {/* Messages */}
              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}
              {errorMessage && (
                <div className="alert alert-error">{errorMessage}</div>
              )}

              {/* Actions */}
              <div className="card-footer">
                <button
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? '💾 Salvando...' : '💾 Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="info-card">
              <div className="info-header">
                <h3 className="info-title">ℹ️ Sobre os Parâmetros</h3>
              </div>
              <div className="info-body">
                <div className="info-item">
                  <h4>Porcentagem de Evasão</h4>
                  <p>
                    Este valor é usado para calcular o número ajustado de
                    alunos, considerando a possibilidade de evasão durante o
                    curso.
                  </p>
                </div>
                <div className="info-item">
                  <h4>Capacidade das Salas</h4>
                  <p>
                    Define quantos alunos cada tipo de sala pode comportar.
                    Estes valores são usados para determinar a melhor alocação
                    de turmas.
                  </p>
                </div>
                <div className="info-item">
                  <h4>⚠️ Importante</h4>
                  <p>
                    Certifique-se de que os valores seguem a ordem lógica:
                    Pequena &lt; Média &lt; Grande
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
