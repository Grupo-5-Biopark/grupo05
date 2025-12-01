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

interface ClassItem {
  id: number;
  courseId: number;
  year: number;
  semester: number;
  currentStudents: number;
  isAssumed: boolean;
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

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    void loadClasses();
    void loadCourses();
  }, [user]);

  async function loadClasses() {
    try {
      const response = await get('/api/classes');

      console.log('Load Classes Response:', response);

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

  const getAssumedText = (isAssumed: boolean) => {
    return isAssumed ? 'PLANEJADA' : 'EXISTENTE';
  };

  const getAssumedBadgeClass = (isAssumed: boolean) => {
    return isAssumed ? 'badge-true' : 'badge-false';
  };

  const filteredClasses = useMemo(() => {
    if (!searchTerm) return classes;

    return classes.filter((c) => {
      const courseName = courses.find((x) => x.id === c.courseId)?.name || '';
      return courseName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [classes, courses, searchTerm]);

  const openModal = (classItem: ClassItem | null = null) => {
    setSelectedClass(
      classItem ?? {
        id: 0,
        courseId: courses.length > 0 ? courses[0].id : 0,
        year: new Date().getFullYear(),
        semester: 1,
        isAssumed: false,
        currentStudents: 0,
      },
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
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
    if (!selectedClass || selectedClass.courseId === 0) {
      showToast('error', 'Por favor, selecione um curso.');
      return;
    }

    const payload = {
      courseId: selectedClass.courseId,
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
      showToast('error', 'Erro ao salvar turma.');
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

          <div className="filters-container">
            <div className="filter-group">
              <label>Buscar por curso:</label>
              <input
                type="text"
                placeholder="Nome do curso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="users-table-container">
            <h2 className="table-title">Lista de Turmas</h2>

            {/* Lógica de exibição ajustada */}
            {classes.length === 0 ? (
              <div className="no-results">
                Nenhuma turma cadastrada (Lista Vazia).
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="no-results">
                Nenhuma turma encontrada com o termo de busca.
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>CURSO</th>
                    <th>ANO</th>
                    <th>SEMESTRE</th>
                    <th>ALUNOS</th>
                    <th>STATUS</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((c) => (
                    <tr key={c.id}>
                      <td>{getCourseName(c.courseId)}</td>
                      <td>{c.year}</td>
                      <td>{c.semester}</td>
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

          {/* Modais e Toast permanecem iguais... */}
          {isModalOpen && selectedClass && (
            <div className="modal active">
              <div className="modal-content">
                {/* Conteúdo do Modal (igual ao anterior) */}
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
                    <label>Curso:</label>
                    <select
                      value={selectedClass.courseId}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          courseId: Number(e.target.value),
                        })
                      }
                    >
                      <option value={0}>Selecione...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Ano:</label>
                    <input
                      type="number"
                      value={selectedClass.year}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          year: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Semestre:</label>
                    <input
                      type="number"
                      min="1"
                      max="2"
                      value={selectedClass.semester}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          semester: Number(e.target.value),
                        })
                      }
                    />
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
                      <option value="false">EXISTENTE (Status: False)</option>
                      <option value="true">PLANEJADA (Status: True)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Alunos atuais:</label>
                    <input
                      type="number"
                      value={selectedClass.currentStudents}
                      onChange={(e) =>
                        setSelectedClass({
                          ...selectedClass,
                          currentStudents: Number(e.target.value),
                        })
                      }
                    />
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
                    💾 Salvar
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
                    <strong>{getCourseName(selectedClass.courseId)}</strong>?
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
