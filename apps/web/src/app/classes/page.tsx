'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './classes.css';

interface Class {
  id: number;
  courseId: number;
  course: { name: string };
  shiftId: number;
  shift: { name: string };
  year: number;
  semester: number;
  currentStudents: number;
}

interface Course {
  id: number;
  name: string;
}

interface Shift {
  id: number;
  name: string;
}

interface ClassStats {
  total: number;
  totalStudents: number;
}

export default function ClassesPage() {
  const router = useRouter();
  const {
    get,
    put,
    delete: del,
  } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<ClassStats>({
    total: 0,
    totalStudents: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<number | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  const [formData, setFormData] = useState({
    courseId: '',
    shiftId: '',
    year: new Date().getFullYear().toString(),
    semester: '1',
    currentStudents: '0',
  });

  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    void loadClasses();
    void loadCourses();
    void loadShifts();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm]);

  async function loadClasses() {
    try {
      const response = await get<Class[]>('/api/classes');
      setClasses(response.data);
      calculateStats(response.data);
    } catch {
      showToast('error', 'Erro ao carregar turmas');
    }
  }

  async function loadCourses() {
    const response = await get<Course[]>('/api/courses');
    setCourses(response.data);
  }

  async function loadShifts() {
    const response = await get<Shift[]>('/api/shifts');
    setShifts(response.data);
  }

  const calculateStats = (list: Class[]) => {
    setStats({
      total: list.length,
      totalStudents: list.reduce((sum, c) => sum + (c.currentStudents || 0), 0),
    });
  };

  const filterClasses = () => {
    if (!searchTerm) return setFilteredClasses(classes);

    setFilteredClasses(
      classes.filter(
        (cls) =>
          cls.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.year.toString().includes(searchTerm),
      ),
    );
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleEdit = (id: number) => {
    const cls = classes.find((c) => c.id === id);
    if (!cls) return;

    setEditingClassId(id);
    setFormData({
      courseId: cls.courseId.toString(),
      shiftId: cls.shiftId.toString(),
      year: cls.year.toString(),
      semester: cls.semester.toString(),
      currentStudents: cls.currentStudents.toString(),
    });

    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const body = {
        courseId: Number(formData.courseId),
        shiftId: Number(formData.shiftId),
        year: Number(formData.year),
        semester: Number(formData.semester),
        currentStudents: Number(formData.currentStudents),
      };

      await put(`/api/classes/${editingClassId}`, body);

      showToast('success', 'Turma atualizada com sucesso!');
      setShowEditModal(false);
      setEditingClassId(null);

      await loadClasses();
    } catch {
      showToast('error', 'Erro ao atualizar turma');
    }
  };

  const handleDeleteClick = (cls: Class) => {
    setClassToDelete(cls);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;
    try {
      await del(`/api/classes/${classToDelete.id}`);
      showToast('success', 'Turma excluída com sucesso!');
      setShowConfirmModal(false);
      await loadClasses();
    } catch {
      showToast('error', 'Erro ao excluir turma');
    }
  };

  return (
    <div className="classes-page">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="classes" onPageChange={() => {}} />

      <h1>Gerenciamento de Turmas</h1>
      <p>Visualização e edição de turmas cadastradas</p>

      <div className="classes-stats-container">
        <div className="classes-stat-card">
          <div className="value">{stats.total}</div>
          <div className="label">Total de Turmas</div>
        </div>
        <div className="classes-stat-card">
          <div className="value">{stats.totalStudents}</div>
          <div className="label">Total de Alunos</div>
        </div>
      </div>

      <div className="classes-actions">
        <div className="filter-box">
          <label>Buscar turma:</label>
          <input
            className="classes-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o curso, turno ou ano..."
          />
        </div>
      </div>

      <div className="classes-table-container">
        <h2 className="section-title">Lista de Turmas</h2>

        {filteredClasses.length === 0 ? (
          <div className="no-results">Nenhuma turma encontrada</div>
        ) : (
          <table className="classes-table">
            <thead>
              <tr>
                <th>CURSO</th>
                <th>TURNO</th>
                <th>ANO</th>
                <th>SEMESTRE</th>
                <th>ALUNOS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) => (
                <tr key={cls.id}>
                  <td>{cls.course.name}</td>
                  <td>
                    <span className="shift-badge">{cls.shift.name}</span>
                  </td>
                  <td>{cls.year}</td>
                  <td>{cls.semester}º</td>
                  <td>{cls.currentStudents}</td>
                  <td>
                    <button
                      className="table-action-btn edit"
                      onClick={() => handleEdit(cls.id)}
                    >
                      EDITAR
                    </button>
                    <button
                      className="table-action-btn delete"
                      onClick={() => handleDeleteClick(cls)}
                    >
                      EXCLUIR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Editar */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Turma</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label>Curso *</label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Turno *</label>
                <select
                  name="shiftId"
                  value={formData.shiftId}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione...</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ano *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Semestre *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleFormChange}
                >
                  <option value="1">1º</option>
                  <option value="2">2º</option>
                </select>
              </div>

              <div className="form-group">
                <label>Alunos</label>
                <input
                  type="number"
                  name="currentStudents"
                  value={formData.currentStudents}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => void handleSaveEdit()}
              >
                Salvar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {showConfirmModal && classToDelete && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button
                className="close-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                ✕
              </button>
            </div>

            <p className="confirm-text">
              Tem certeza que deseja excluir a turma de
              <strong> {classToDelete.course.name}</strong> (
              {classToDelete.shift.name} - {classToDelete.year}/
              {classToDelete.semester}º)?
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => void confirmDelete()}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
