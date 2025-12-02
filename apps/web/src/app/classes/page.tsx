'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './classes.css';

interface Course {
  id: number;
  name: string;
}

interface Shift {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  courseId: number;
  shiftId: number;
  year: number;
  semester: number;
  currentStudents: number;
  isAssumed: boolean;
}

interface ClassStats {
  total: number;
  totalStudents: number;
  existingClasses: number;
  plannedClasses: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const {
    get,
    post,
    put,
    delete: del,
  } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState<ClassStats>({
    total: 0,
    totalStudents: 0,
    existingClasses: 0,
    plannedClasses: 0,
  });

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'existing' | 'planned'
  >('all');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    void loadClasses();
    void loadCourses();
    void loadShifts();
  }, [user]);

  useEffect(() => {
    calculateStats(classes);
  }, [classes]);

  async function loadClasses() {
    try {
      const response = await get('/api/classes');

      if (response && Array.isArray(response.data)) {
        setClasses(response.data);
      } else if (Array.isArray(response)) {
        setClasses(response);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      showToast('error', 'Erro ao carregar lista de turmas.');
    }
  }

  async function loadCourses() {
    try {
      const response = await get('/api/courses');

      if (response && Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (Array.isArray(response)) {
        setCourses(response);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  }

  async function loadShifts() {
    try {
      const response = await get('/api/shifts');

      if (response && Array.isArray(response.data)) {
        setShifts(response.data);
      } else if (Array.isArray(response)) {
        setShifts(response);
      }
    } catch (error) {
      console.error('Erro ao carregar turnos:', error);
    }
  }

  // Get current year and semester
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentSemester = currentMonth <= 6 ? 1 : 2;

  const calculateStats = (classesList: ClassItem[]) => {
    // Turmas existentes do semestre atual para contagem de alunos
    const currentExistingClasses = classesList.filter(
      (c) =>
        !c.isAssumed &&
        c.year === currentYear &&
        c.semester === currentSemester,
    );

    const newStats = {
      total: classesList.length,
      totalStudents: currentExistingClasses.reduce(
        (sum, c) => sum + (c.currentStudents || 0),
        0,
      ),
      existingClasses: classesList.filter((c) => !c.isAssumed).length,
      plannedClasses: classesList.filter((c) => c.isAssumed).length,
    };
    setStats(newStats);
  };

  const getAssumedText = (isAssumed: boolean) => {
    return isAssumed ? 'PLANEJADA' : 'EXISTENTE';
  };

  const getAssumedBadgeClass = (isAssumed: boolean) => {
    return isAssumed ? 'badge-true' : 'badge-false';
  };

  const filteredClasses = useMemo(() => {
    // 1. FILTRAGEM por busca
    let filtered = classes.filter((c) => {
      if (!searchTerm) return true;

      const courseName = courses.find((x) => x.id === c.courseId)?.name || '';
      const shiftName = shifts.find((x) => x.id === c.shiftId)?.name || '';
      const searchLower = searchTerm.toLowerCase();

      return (
        courseName.toLowerCase().includes(searchLower) ||
        shiftName.toLowerCase().includes(searchLower) ||
        c.year.toString().includes(searchLower)
      );
    });

    // 2. FILTRAGEM por status
    if (filterStatus === 'existing') {
      filtered = filtered.filter((c) => !c.isAssumed);
    } else if (filterStatus === 'planned') {
      filtered = filtered.filter((c) => c.isAssumed);
    }

    // 3. ORDENAÇÃO MELHORADA
    // Prioridade:
    // 1. Ano e semestre atual primeiro
    // 2. Dentro do mesmo ano/semestre: "Existente" antes de "Planejada"
    // 3. Depois: ordem crescente por ano/semestre
    // 4. Dentro do mesmo ano/semestre: "Existente" antes de "Planejada"
    return filtered.slice().sort((a, b) => {
      const aIsCurrentPeriod =
        a.year === currentYear && a.semester === currentSemester;
      const bIsCurrentPeriod =
        b.year === currentYear && b.semester === currentSemester;

      // Classes do período atual vêm primeiro
      if (aIsCurrentPeriod && !bIsCurrentPeriod) return -1;
      if (!aIsCurrentPeriod && bIsCurrentPeriod) return 1;

      // Se ambos são do mesmo período (atual ou não), ordenar por ano e semestre
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      if (a.semester !== b.semester) {
        return a.semester - b.semester;
      }

      // No mesmo ano e semestre: "Existente" (isAssumed=false) vem antes de "Planejada" (isAssumed=true)
      if (a.isAssumed !== b.isAssumed) {
        return a.isAssumed ? 1 : -1;
      }

      // Por último, ordenar por nome do curso
      const courseA = courses.find((x) => x.id === a.courseId)?.name || '';
      const courseB = courses.find((x) => x.id === b.courseId)?.name || '';
      return courseA.localeCompare(courseB);
    });
  }, [
    classes,
    courses,
    shifts,
    searchTerm,
    filterStatus,
    currentYear,
    currentSemester,
  ]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedClass) return false;

    if (!selectedClass.courseId || selectedClass.courseId === 0) {
      errors.courseId = 'Selecione um curso';
    }

    if (!selectedClass.shiftId || selectedClass.shiftId === 0) {
      errors.shiftId = 'Selecione um turno';
    }

    if (!selectedClass.year || selectedClass.year < 2000) {
      errors.year = 'Ano deve ser maior ou igual a 2000';
    }

    if (
      !selectedClass.semester ||
      selectedClass.semester < 1 ||
      selectedClass.semester > 2
    ) {
      errors.semester = 'Semestre deve ser 1 ou 2';
    }

    if (selectedClass.currentStudents < 0) {
      errors.currentStudents = 'Número de alunos não pode ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openModal = (classItem: ClassItem | null = null) => {
    setFormErrors({});
    setSelectedClass(
      classItem ?? {
        id: 0,
        courseId: courses.length > 0 ? courses[0].id : 0,
        shiftId: shifts.length > 0 ? shifts[0].id : 0,
        year: currentYear,
        semester: currentSemester,
        isAssumed: false,
        currentStudents: 0,
      },
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
    setFormErrors({});
  };

  const openDeleteModal = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedClass(null);
  };

  const saveClass = async () => {
    if (!selectedClass || !validateForm()) {
      if (!selectedClass) {
        showToast('error', 'Erro interno. Tente novamente.');
      }
      return;
    }

    const payload = {
      courseId: selectedClass.courseId,
      shiftId: selectedClass.shiftId,
      year: selectedClass.year,
      semester: selectedClass.semester,
      isAssumed: selectedClass.isAssumed,
      currentStudents: selectedClass.currentStudents,
    };

    try {
      let response;
      if (selectedClass.id === 0) {
        response = await post('/api/classes', payload);
        if (response) showToast('success', 'Turma criada com sucesso!');
      } else {
        response = await put(`/api/classes/${selectedClass.id}`, payload);
        if (response) showToast('success', 'Turma atualizada com sucesso!');
      }

      if (response) {
        closeModal();
        await loadClasses();
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      let serverMessage = 'Erro ao salvar turma. Tente novamente.';
      if (error instanceof Error) serverMessage = error.message;
      else if (error && typeof error === 'object') {
        const anyErr = error as {
          response?: { data?: { message?: string } | string };
        };
        if (
          typeof anyErr.response?.data === 'object' &&
          anyErr.response?.data?.message
        )
          serverMessage = anyErr.response.data.message;
        else if (typeof anyErr.response?.data === 'string')
          serverMessage = anyErr.response.data;
      }
      showToast('error', serverMessage);
    }
  };

  const deleteClass = async () => {
    if (!selectedClass) return;
    try {
      const response = await del(`/api/classes/${selectedClass.id}`);
      if (response) {
        showToast('success', 'Turma excluída com sucesso!');
        closeDeleteModal();
        await loadClasses();
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      showToast('error', 'Erro ao excluir turma.');
    }
  };

  const getCourseName = (courseId: number) => {
    return courses.find((x) => x.id === courseId)?.name || 'Curso Desconhecido';
  };

  // Mapa de tradução de turnos (inglês -> português)
  const shiftTranslations: Record<string, string> = {
    Morning: 'Matutino',
    Afternoon: 'Vespertino',
    Night: 'Noturno',
    Matutino: 'Matutino',
    Vespertino: 'Vespertino',
    Noturno: 'Noturno',
  };

  const getShiftName = (shiftId: number) => {
    const shift = shifts.find((x) => x.id === shiftId);
    if (!shift) return 'Turno Desconhecido';
    return shiftTranslations[shift.name] || shift.name;
  };

  // Helper to highlight current period rows
  const isCurrentPeriod = (classItem: ClassItem) => {
    return (
      classItem.year === currentYear && classItem.semester === currentSemester
    );
  };

  return (
    <div className="user-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="turmas" onPageChange={() => {}} />
      <main className="main-content">
        <div className="users-page">
          <div className="users-header">
            <h1>Gerenciamento de Turmas</h1>
            <p className="subtitle">
              Edição e visualização de turmas por curso.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total de Turmas</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">
                Alunos ({currentYear}/{currentSemester}º)
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.existingClasses}</div>
              <div className="stat-label">Turmas Existentes</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.plannedClasses}</div>
              <div className="stat-label">Turmas Planejadas</div>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label>Buscar:</label>
              <input
                type="text"
                placeholder="Curso, turno ou ano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as 'all' | 'existing' | 'planned',
                  )
                }
                className="filter-select"
              >
                <option value="all">Todos</option>
                <option value="existing">Existentes</option>
                <option value="planned">Planejadas</option>
              </select>
            </div>
            <button className="btn-new-user" onClick={() => openModal(null)}>
              <span className="btn-plus">+</span> Nova Turma
            </button>
          </div>

          <div className="users-table-container">
            <h2 className="table-title">
              Lista de Turmas
              {filteredClasses.length > 0 && (
                <span className="table-subtitle">
                  {' '}
                  — Período atual: {currentYear}/{currentSemester}º semestre
                </span>
              )}
            </h2>

            {/* Lógica de exibição ajustada */}
            {classes.length === 0 ? (
              <div className="no-results">
                Nenhuma turma cadastrada. Clique em &quot;Nova Turma&quot; para
                adicionar.
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="no-results">
                Nenhuma turma encontrada com os filtros aplicados.
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>CURSO</th>
                    <th>TURNO</th>
                    <th>ANO</th>
                    <th>SEMESTRE</th>
                    <th>ALUNOS</th>
                    <th>STATUS</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((c) => (
                    <tr
                      key={c.id}
                      className={isCurrentPeriod(c) ? 'current-period-row' : ''}
                    >
                      <td>
                        <span className="class-id-badge">#{c.id}</span>
                      </td>
                      <td>
                        <div className="course-cell">
                          <span className="course-name">
                            {getCourseName(c.courseId)}
                          </span>
                          {isCurrentPeriod(c) && (
                            <span className="current-badge">ATUAL</span>
                          )}
                        </div>
                      </td>
                      <td>{getShiftName(c.shiftId)}</td>
                      <td>{c.year}</td>
                      <td>{c.semester}º</td>
                      <td>{c.currentStudents}</td>
                      <td>
                        <span
                          className={`status-badge ${getAssumedBadgeClass(c.isAssumed)}`}
                        >
                          {getAssumedText(c.isAssumed)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-edit"
                            onClick={() => openModal(c)}
                          >
                            EDITAR
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => openDeleteModal(c)}
                          >
                            EXCLUIR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal Nova/Editar Turma */}
          {isModalOpen && selectedClass && (
            <div className="modal active">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">
                    {selectedClass.id === 0
                      ? '➕ Nova Turma'
                      : '✏️ Editar Turma'}
                  </h3>
                  <button className="close-btn" onClick={closeModal}>
                    ✕
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Curso: *</label>
                    <select
                      value={selectedClass.courseId}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          courseId: Number(e.target.value),
                        })
                      }
                      className={formErrors.courseId ? 'input-error' : ''}
                    >
                      <option value={0}>Selecione...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.courseId && (
                      <span className="error-text">{formErrors.courseId}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Turno: *</label>
                    <select
                      value={selectedClass.shiftId}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          shiftId: Number(e.target.value),
                        })
                      }
                      className={formErrors.shiftId ? 'input-error' : ''}
                    >
                      <option value={0}>Selecione...</option>
                      {shifts.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.shiftId && (
                      <span className="error-text">{formErrors.shiftId}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Ano: *</label>
                    <input
                      type="number"
                      min="2000"
                      value={selectedClass.year}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          year: Number(e.target.value),
                        })
                      }
                      className={formErrors.year ? 'input-error' : ''}
                    />
                    {formErrors.year && (
                      <span className="error-text">{formErrors.year}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Semestre: *</label>
                    <select
                      value={selectedClass.semester}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          semester: Number(e.target.value),
                        })
                      }
                      className={formErrors.semester ? 'input-error' : ''}
                    >
                      <option value={1}>1º Semestre</option>
                      <option value={2}>2º Semestre</option>
                    </select>
                    {formErrors.semester && (
                      <span className="error-text">{formErrors.semester}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Alunos atuais: *</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedClass.currentStudents}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          currentStudents: Number(e.target.value),
                        })
                      }
                      className={
                        formErrors.currentStudents ? 'input-error' : ''
                      }
                    />
                    {formErrors.currentStudents && (
                      <span className="error-text">
                        {formErrors.currentStudents}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Status da Turma:</label>
                    <select
                      value={selectedClass.isAssumed ? 'true' : 'false'}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          isAssumed: e.target.value === 'true',
                        })
                      }
                    >
                      <option value="false">EXISTENTE</option>
                      <option value="true">PLANEJADA</option>
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={closeModal}>
                    ✕ Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => void saveClass()}
                  >
                    💾{' '}
                    {selectedClass.id === 0
                      ? 'Criar Turma'
                      : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeleteModalOpen && selectedClass && (
            <div className="modal active">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Confirmar exclusão</h3>
                  <button className="close-btn" onClick={closeDeleteModal}>
                    ✕
                  </button>
                </div>
                <div style={{ padding: '0.5rem 0 1.25rem' }}>
                  <p>
                    Tem certeza que deseja excluir a turma do curso{' '}
                    <strong>{getCourseName(selectedClass.courseId)}</strong> (
                    {selectedClass.year}/{selectedClass.semester}º)?
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={closeDeleteModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => void deleteClass()}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}

          {toast && (
            <div className={`toast ${toast.type}`} role="status">
              <div className="toast-icon">
                {toast.type === 'success' ? '✓' : '!'}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
