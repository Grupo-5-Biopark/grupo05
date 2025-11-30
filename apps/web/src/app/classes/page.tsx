'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './classes.css'; // Usa estilos que devem ser definidos em users.css/classes.css

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
}

export default function ClassesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const api = useApi();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]); // NOVO: Estado para a lista filtrada

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToast] = useState<{
    // NOVO: Estado de Toast (como UsersPage)
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    // NOVO: Função para mostrar Toast
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!user) router.push('/login');
    void loadClasses(); // Usando void para async call no useEffect
    void loadCourses();
  }, [user]);

  // NOVO: useEffect para filtragem (como UsersPage)
  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm]);

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes');
      if (response && (response as any).success) {
        setClasses((response as any).data);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      showToast('error', 'Erro ao carregar lista de turmas.');
    }
  };

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      if (response && (response as any).success) {
        setCourses((response as any).data);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  // NOVO: Função de filtragem
  const filterClasses = () => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter((c) => {
        const courseName = courses.find((x) => x.id === c.courseId)?.name || '';
        return courseName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredClasses(filtered);
  };

  const openModal = (classItem: ClassItem | null = null) => {
    setSelectedClass(
      classItem ?? {
        id: 0,
        courseId: courses.length > 0 ? courses[0].id : 0, // Pre-seleciona o primeiro curso se houver
        year: new Date().getFullYear(),
        semester: 1,
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
      currentStudents: selectedClass.currentStudents,
    };

    try {
      let response;
      if (selectedClass.id === 0) {
        response = await api.post('/classes', payload);
        if (response && response.success) {
          showToast('success', 'Turma criada com sucesso!');
        }
      } else {
        response = await api.put(`/classes/${selectedClass.id}`, payload);
        if (response && response.success) {
          showToast('success', 'Turma atualizada com sucesso!');
        }
      }

      if (response && response.success) {
        closeModal();
        await loadClasses();
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      showToast('error', 'Erro ao salvar turma. Verifique os dados.');
    }
  };

  const deleteClass = async () => {
    if (!selectedClass) return;

    try {
      const response = await api.delete(`/classes/${selectedClass.id}`);

      if (response && (response as any).success) {
        showToast('success', 'Turma excluída com sucesso!');
        closeDeleteModal();
        await loadClasses();
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      showToast('error', 'Erro ao excluir turma.');
    }
  };

  // Função auxiliar para obter o nome do curso
  const getCourseName = (courseId: number) => {
    return courses.find((x) => x.id === courseId)?.name || 'Curso Desconhecido';
  };

  return (
    <div className="user-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="classes" onPageChange={() => {}} />
      <main className="main-content">
        <div className="users-page">
          <div className="users-header">
            {' '}
            {/* Adicionado para seguir o padrão da UsersPage */}
            <h1>Gerenciamento de Turmas</h1>
            <p className="subtitle">
              Cadastro, edição e visualização de turmas por curso.
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
            <button className="btn-new-user" onClick={() => openModal()}>
              + NOVA TURMA
            </button>
          </div>

          <div className="users-table-container">
            {' '}
            {/* Adicionado container da UsersPage */}
            <h2 className="table-title">Lista de Turmas</h2>
            {classes.length === 0 ? (
              <div className="no-results">Nenhuma turma cadastrada.</div>
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
                    <th>ALUNOS</th>
                    <th>AÇÕES</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredClasses.map(
                    (
                      c, // CORRIGIDO: Usando filteredClasses
                    ) => (
                      <tr key={c.id}>
                        <td>{getCourseName(c.courseId)}</td>{' '}
                        {/* Usa função auxiliar */}
                        <td>{c.year}</td>
                        <td>{c.currentStudents}</td>
                        <td>
                          <div className="actions-cell">
                            <button
                              className="btn-edit" // CORRIGIDO: Usando classe da UsersPage
                              onClick={() => openModal(c)}
                            >
                              EDITAR
                            </button>
                            <button
                              className="btn-delete" // CORRIGIDO: Usando classe da UsersPage
                              onClick={() => openDeleteModal(c)}
                            >
                              EXCLUIR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal Novo/Editar Turma */}
          {isModalOpen && selectedClass && (
            <div className="modal active">
              {' '}
              {/* Usando 'modal active' para o CSS */}
              <div className="modal-content">
                <div className="modal-header">
                  {' '}
                  {/* Adicionado header do modal */}
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
                  {' '}
                  {/* Usando form-grid */}
                  <div className="form-group">
                    {' '}
                    {/* Usando form-group */}
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
                      min={1}
                      max={2}
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
                    Cancelar
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

          {/* Modal de Confirmação de Exclusão */}
          {isDeleteModalOpen && selectedClass && (
            <div className="modal active">
              {' '}
              {/* Usando 'modal active' para o CSS */}
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title">Confirmar exclusão</h3>
                  <button className="close-btn" onClick={closeDeleteModal}>
                    ✕
                  </button>
                </div>

                <div style={{ padding: '0.5rem 0 1.25rem' }}>
                  <p>
                    Tem certeza que deseja excluir a turma do curso **
                    {getCourseName(selectedClass.courseId)}** (
                    {selectedClass.year}/{selectedClass.semester})?
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

          {/* Toast container (como UsersPage) */}
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
