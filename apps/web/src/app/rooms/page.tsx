'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import './rooms.css';

interface Room {
  id: number;
  block: string;
  number: number;
  size: string;
  classId: number | null;
  class?: {
    courseName: string;
    period: number;
  };
}

interface RoomStats {
  total: number;
  totalBySize: Record<string, number>;
  totalByBlock: Record<string, number>;
}

interface Course {
  id: number;
  name: string;
  knowledgeArea: string;
  vacancies: number;
  periodQuantities: number;
  openingYear: number;
}

interface ClassItem {
  id: number;
  courseId?: number; // se API fornecer
  courseName?: string; // fallback se não houver courseId
  period?: number;
}

function RoomsDataPanel() {
  const {
    get,
    post,
    put,
    delete: del,
  } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats>({
    total: 0,
    totalBySize: {},
    totalByBlock: {},
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    block: '',
    number: '',
    size: '',
    classId: '',
    courseName: '', // mantido para exibição durante edição
  });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  useEffect(() => {
    void Promise.all([loadRooms(), loadCourses(), loadClasses()]);
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm]);

  async function loadRooms() {
    try {
      const response = await get<Room[]>('/api/rooms');
      setRooms(response.data);
      calculateStats(response.data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    }
  }

  async function loadCourses() {
    try {
      const response = await get<Course[]>('/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Erro ao buscar cursos:', err);
    }
  }

  async function loadClasses() {
    try {
      const response = await get<ClassItem[]>('/api/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Erro ao buscar turmas (classes):', err);
    }
  }

  useEffect(() => {
    if (!selectedCourseId) {
      setFilteredClasses([]);
      return;
    }
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    if (!selectedCourse) {
      setFilteredClasses([]);
      return;
    }
    const fc = classes.filter((cl) => {
      if (cl.courseId) return cl.courseId === selectedCourseId;
      if (cl.courseName) return cl.courseName === selectedCourse.name;
      return false;
    });
    setFilteredClasses(fc);
  }, [selectedCourseId, classes, courses]);

  const calculateStats = (roomsList: Room[]) => {
    const stats: RoomStats = {
      total: roomsList.length,
      totalBySize: {},
      totalByBlock: {},
    };

    roomsList.forEach((room) => {
      // Count by size
      stats.totalBySize[room.size] = (stats.totalBySize[room.size] || 0) + 1;
      // Count by block
      stats.totalByBlock[room.block] =
        (stats.totalByBlock[room.block] || 0) + 1;
    });

    setStats(stats);
  };

  const filterRooms = () => {
    if (!searchTerm) {
      setFilteredRooms(rooms);
      return;
    }

    const filtered = rooms.filter(
      (room) =>
        room.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.number.toString().includes(searchTerm) ||
        room.size.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredRooms(filtered);
  };

  const formatClassName = (room: Room) => {
    if (!room.classId) return '-';
    const cls = classes.find((c) => c.id === room.classId);
    if (!cls) return '-';
    const course = courses.find((crs) => crs.id === cls.courseId);
    return course ? course.name : '-';
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // Seleção de curso: definir ID, nome e limpar turma
    if (name === 'courseName') {
      const courseId = value ? parseInt(value) : NaN;
      const selected = courses.find((c) => c.id === courseId) || null;
      setSelectedCourseId(selected ? selected.id : null);
      setFormData((prev) => ({
        ...prev,
        courseName: selected ? selected.name : '',
        classId: '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveRoom = async () => {
    if (!formData.block || !formData.number || !formData.size) {
      showToast('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Mapear tipos para código curto exigido pela API
    const sizeCodeMap: Record<string, string> = {
      PEQUENA: 'P',
      MÉDIA: 'M',
      GRANDE: 'G',
      LABORATÓRIO: 'L',
    };

    try {
      const roomData = {
        block: formData.block,
        number: parseInt(formData.number),
        size: sizeCodeMap[formData.size] || formData.size,
        classId: formData.classId ? parseInt(formData.classId) : null,
      };

      if (editingRoomId !== null) {
        await put(`/api/rooms/${editingRoomId}`, roomData);
        showToast('success', 'Sala atualizada com sucesso!');
      } else {
        await post('/api/rooms', roomData);
        showToast('success', 'Sala criada com sucesso!');
      }

      setShowNewRoomModal(false);
      setEditingRoomId(null);
      setFormData({
        block: '',
        number: '',
        size: '',
        classId: '',
        courseName: '',
      });
      await loadRooms();
    } catch (err) {
      console.error('Erro ao salvar sala:', err);
      let serverMessage = 'Erro ao salvar sala. Tente novamente.';
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

  const handleEdit = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    setEditingRoomId(room.id);
    setFormData({
      block: room.block,
      number: room.number.toString(),
      size: room.size,
      classId: room.classId?.toString() || '',
      courseName: '',
    });
    // Derivar curso pela turma
    if (room.classId) {
      const cls = classes.find((c) => c.id === room.classId);
      if (cls && cls.courseId) {
        setSelectedCourseId(cls.courseId);
        const crs = courses.find((c) => c.id === cls.courseId);
        setFormData((prev) => ({ ...prev, courseName: crs?.name ?? '' }));
      } else {
        setSelectedCourseId(null);
      }
    } else {
      setSelectedCourseId(null);
    }
    setShowNewRoomModal(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId) || null;
    setRoomToDelete(room);
    setShowConfirmModal(true);
  };

  const performDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await del(`/api/rooms/${roomToDelete.id}`);
      showToast('success', 'Sala deletada com sucesso!');
      setShowConfirmModal(false);
      setRoomToDelete(null);
      await loadRooms();
    } catch (err) {
      console.error('Erro ao deletar sala:', err);
      showToast('error', 'Erro ao deletar sala. Tente novamente.');
    }
  };

  // Simple in-component toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Gerenciamento de Salas</h1>
        <p className="subtitle">
          Visualização e edição de salas e suas configurações
        </p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total de Salas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Object.keys(stats.totalByBlock).length}
          </div>
          <div className="stat-label">Blocos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Object.keys(stats.totalBySize).length}
          </div>
          <div className="stat-label">Tipos de Salas</div>
        </div>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>Buscar sala:</label>
          <input
            type="text"
            placeholder="Digite o bloco, número ou tipo da sala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ width: '360px' }}
          />
        </div>
        <button
          className="btn-new-room"
          onClick={() => setShowNewRoomModal(true)}
        >
          <span className="btn-plus">+</span> Nova Sala
        </button>
      </div>

      <div className="rooms-table-container">
        <h2 className="table-title">Lista de Salas do Sistema</h2>

        {filteredRooms.length === 0 ? (
          <div className="no-results">Nenhuma sala encontrada</div>
        ) : (
          <table className="rooms-table">
            <thead>
              <tr>
                <th>BLOCO</th>
                <th>NÚMERO</th>
                <th>TIPO</th>
                <th>TURMA</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td>
                    <div className="room-cell">
                      <div className="room-block-cell">{room.block}</div>
                    </div>
                  </td>
                  <td className="room-number-cell">{room.number}</td>
                  <td className="room-size-cell">{room.size}</td>
                  <td className="room-class-cell">{formatClassName(room)}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(room.id)}
                      >
                        EDITAR
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteRoom(room.id)}
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

        {filteredRooms.length === 0 && rooms.length > 0 && (
          <div className="no-results">
            Nenhuma sala encontrada com os filtros aplicados
          </div>
        )}
      </div>

      {/* Modal Novo/Editar Sala */}
      {showNewRoomModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRoomId ? '✏️ Editar Sala' : '➕ Nova Sala'}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowNewRoomModal(false);
                  setEditingRoomId(null);
                  setFormData({
                    block: '',
                    number: '',
                    size: '',
                    classId: '',
                    courseName: '',
                  });
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-grid form-grid-rooms">
              <div className="form-group">
                <label>Bloco *</label>
                <input
                  type="text"
                  name="block"
                  placeholder="Ex: A, B, C"
                  value={formData.block}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Número *</label>
                <input
                  type="number"
                  name="number"
                  placeholder="Ex: 101, 205"
                  value={formData.number}
                  onChange={handleFormChange}
                />
              </div>
              <div className="form-group">
                <label>Tipo de Sala *</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="PEQUENA">Pequena</option>
                  <option value="MÉDIA">Média</option>
                  <option value="GRANDE">Grande</option>
                  <option value="LABORATÓRIO">Laboratório</option>
                </select>
              </div>
              <div className="form-group">
                <label>Curso</label>
                <select
                  name="courseName"
                  value={selectedCourseId ?? ''}
                  onChange={handleFormChange}
                >
                  <option value="">Selecione o curso (opcional)</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Turma</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleFormChange}
                  disabled={!selectedCourseId}
                >
                  <option value="">Selecione a turma</option>
                  {filteredClasses.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {`Turma ${cl.id}${cl.period ? ' - ' + cl.period + 'º período' : ''}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => void handleSaveRoom()}
              >
                💾 {editingRoomId ? 'Atualizar Sala' : 'Salvar Sala'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowNewRoomModal(false);
                  setEditingRoomId(null);
                  setFormData({
                    block: '',
                    number: '',
                    size: '',
                    classId: '',
                    courseName: '',
                  });
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
      {showConfirmModal && roomToDelete && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirmar exclusão</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setRoomToDelete(null);
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.5rem 0 1.25rem' }}>
              <p>
                Tem certeza que deseja excluir a sala{' '}
                <strong>
                  {roomToDelete.block}-{roomToDelete.number}
                </strong>
                ?
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowConfirmModal(false);
                  setRoomToDelete(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => void performDeleteRoom()}
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
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
    <div className="room-layout">
      <Header user={user} onLogout={handleLogout} />
      <Sidebar currentPage="salas" onPageChange={() => {}} />
      <main className="main-content">
        <RoomsDataPanel />
      </main>
    </div>
  );
}
