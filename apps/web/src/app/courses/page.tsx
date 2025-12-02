'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './courses.css';

interface Course {
  id: number;
  name: string;
  knowledgeArea: string;
  vacancies: number;
  periodQuantities: number;
  openingYear: number;
}

interface CourseStats {
  total: number;
  totalVacancies: number;
  totalPeriods: number;
}

function CoursesDataPanel() {
  const {
    get,
    post,
    put,
    delete: del,
  } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    total: 0,
    totalVacancies: 0,
    totalPeriods: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    knowledgeArea: '',
    vacancies: '',
    periodQuantities: '',
    openingYear: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    void loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm]);

  async function loadCourses() {
    try {
      const response = await get<Course[]>('/api/courses');
      setCourses(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
    }
  }

  const calculateStats = (coursesList: Course[]) => {
    const stats = {
      total: coursesList.length,
      totalVacancies: coursesList.reduce(
        (sum, c) => sum + (c.vacancies || 0),
        0,
      ),
      totalPeriods: coursesList.reduce(
        (sum, c) => sum + (c.periodQuantities || 0),
        0,
      ),
    };
    setStats(stats);
  };

  const filterCourses = () => {
    if (!searchTerm) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.knowledgeArea.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredCourses(filtered);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveCourse = async () => {
    if (!formData.name || !formData.knowledgeArea) {
      showToast('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const courseData = {
        name: formData.name,
        knowledgeArea: formData.knowledgeArea,
        vacancies: parseInt(formData.vacancies) || 0,
        periodQuantities: parseInt(formData.periodQuantities) || 0,
        openingYear: parseInt(formData.openingYear),
      };

      if (editingCourseId !== null) {
        await put(`/api/courses/${editingCourseId}`, courseData);
        showToast('success', 'Curso atualizado com sucesso!');
      } else {
        await post('/api/courses', courseData);
        showToast('success', 'Curso criado com sucesso!');
      }

      setShowNewCourseModal(false);
      setEditingCourseId(null);
      setFormData({
        name: '',
        knowledgeArea: '',
        vacancies: '',
        periodQuantities: '',
        openingYear: new Date().getFullYear().toString(),
      });
      await loadCourses();
    } catch (err) {
      console.error('Erro ao salvar curso:', err);
      let serverMessage = 'Erro ao salvar curso. Tente novamente.';
      if (err instanceof Error) serverMessage = err.message;
      else if (err && typeof err === 'object') {
        const anyErr = err as {
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

  const handleEdit = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    setEditingCourseId(course.id);
    setFormData({
      name: course.name,
      knowledgeArea: course.knowledgeArea,
      vacancies: course.vacancies.toString(),
      periodQuantities: course.periodQuantities.toString(),
      openingYear: course.openingYear.toString(),
    });
    setShowNewCourseModal(true);
  };

  const handleDeleteCourse = (courseId: number) => {
    // open confirm modal instead of native confirm()
    const course = courses.find((c) => c.id === courseId) || null;
    setCourseToDelete(course);
    setShowConfirmModal(true);
  };

  const performDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await del(`/api/courses/${courseToDelete.id}`);
      showToast('success', 'Curso deletado com sucesso!');
      setShowConfirmModal(false);
      setCourseToDelete(null);
      await loadCourses();
    } catch (err) {
      console.error('Erro ao deletar curso:', err);
      showToast('error', 'Erro ao deletar curso. Tente novamente.');
    }
  };

  // Simple in-component toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1 className="page-title">Gerenciamento de Cursos</h1>
        <p className="page-subtitle">Visualização e edição de cursos</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total de Cursos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalVacancies}</div>
          <div className="stat-label">Total de Vagas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalPeriods}</div>
          <div className="stat-label">Total de Períodos</div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="filter-group">
          <label>Buscar curso:</label>
          <input
            type="text"
            placeholder="Digite o nome ou código do curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="button-group">
          <button
            className="btn btn-primary btn-new-course"
            onClick={() => setShowNewCourseModal(true)}
          >
            <span className="btn-plus">+</span> Novo Curso
          </button>
        </div>
      </div>

      <div className="courses-table-container">
        <h2 className="table-title">Lista de Cursos</h2>

        {filteredCourses.length === 0 ? (
          <div className="no-results">Nenhum curso encontrado</div>
        ) : (
          <table className="courses-table">
            <thead>
              <tr>
                <th>CURSO</th>
                <th>ÁREA</th>
                <th>VAGAS</th>
                <th>PERÍODOS</th>
                <th>ANO ABERTURA</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-cell">
                      <div className="course-name-cell">{course.name}</div>
                    </div>
                  </td>
                  <td className="area-cell">{course.knowledgeArea}</td>
                  <td className="numeric-cell">{course.vacancies}</td>
                  <td className="numeric-cell">{course.periodQuantities}</td>
                  <td className="numeric-cell">{course.openingYear}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(course.id)}
                      >
                        EDITAR
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCourse(course.id)}
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

      {/* Modal Novo/Editar Curso */}
      {showNewCourseModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCourseId ? '✏️ Editar Curso' : '➕ Novo Curso'}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowNewCourseModal(false);
                  setEditingCourseId(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Curso *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                  value={formData.name}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Área de Conhecimento *</label>
                <input
                  type="text"
                  name="knowledgeArea"
                  placeholder="Ex: Computação"
                  value={formData.knowledgeArea}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Vagas</label>
                <input
                  type="number"
                  name="vacancies"
                  placeholder="Ex: 40"
                  value={formData.vacancies}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Quantidades de Períodos</label>
                <input
                  type="number"
                  name="periodQuantities"
                  placeholder="Ex: 4"
                  value={formData.periodQuantities}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Ano de Abertura</label>
                <input
                  type="number"
                  name="openingYear"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={formData.openingYear}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => void handleSaveCourse()}
              >
                💾 {editingCourseId ? 'Atualizar Curso' : 'Salvar Curso'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNewCourseModal(false);
                  setEditingCourseId(null);
                }}
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      {toast && (
        <div className={`toast ${toast.type}`} role="status">
          <div className="toast-icon">
            {toast.type === 'success' ? '✓' : '!'}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Confirm Deletion Modal */}
      {showConfirmModal && courseToDelete && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirmar exclusão</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setCourseToDelete(null);
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.5rem 0 1.25rem' }}>
              <p>
                Tem certeza que deseja excluir o curso{' '}
                <strong>{courseToDelete.name}</strong>?
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  setCourseToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => void performDeleteCourse()}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="cursos" onPageChange={() => {}} />
      <main className="main-content">
        <CoursesDataPanel />
      </main>
    </div>
  );
}
