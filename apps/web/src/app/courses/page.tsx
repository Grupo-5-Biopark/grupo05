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

  // Load courses on mount
  useEffect(() => {
    void loadCourses();
  }, []);

  // Filter courses when search term changes
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
      alert('Por favor, preencha todos os campos obrigatórios.');
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

      if (editingCourseId) {
        // Editar curso existente
        await put(`/api/courses/${editingCourseId}`, courseData);
        alert('Curso atualizado com sucesso!');
      } else {
        // Criar novo curso
        await post('/api/courses', courseData);
        alert('Curso criado com sucesso!');
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
      alert('Erro ao salvar curso. Tente novamente.');
    }
  };

  const handleViewDetails = (courseId: number) => {
    console.log('Visualizando detalhes do curso:', courseId);
    // TODO: Implementar visualização de detalhes em modal
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await del(`/api/courses/${courseId}`);
        alert('Curso deletado com sucesso!');
        await loadCourses();
      } catch (err) {
        console.error('Erro ao deletar curso:', err);
        alert('Erro ao deletar curso. Tente novamente.');
      }
    }
  };

  return (
    <div className="courses-page">
      <div className="page-header">
        <h1 className="page-title">Gerenciamento de Cursos</h1>
        <p className="page-subtitle">
          Visualização e edição de cursos e suas turmas
        </p>
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

      <div className="courses-list">
        {filteredCourses.length === 0 ? (
          <div className="no-results">Nenhum curso encontrado</div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3 className="course-name">{course.name}</h3>
              </div>
              <div className="course-body">
                <div className="course-code">Área: {course.knowledgeArea}</div>
                <div className="course-stats">
                  <div className="course-stat">
                    <div className="course-stat-value">{course.vacancies}</div>
                    <div className="course-stat-label">Vagas</div>
                  </div>
                  <div className="course-stat">
                    <div className="course-stat-value">
                      {course.periodQuantities}
                    </div>
                    <div className="course-stat-label">Períodos</div>
                  </div>
                  <div className="course-stat">
                    <div className="course-stat-value">
                      {course.openingYear}
                    </div>
                    <div className="course-stat-label">Ano Abertura</div>
                  </div>
                </div>
              </div>
              <div className="course-footer">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => handleViewDetails(course.id)}
                >
                  Detalhes
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => void handleDeleteCourse(course.id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
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
