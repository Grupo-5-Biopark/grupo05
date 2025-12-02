'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear: number;
  defaultSemester: number;
}

export default function ExportModal({
  isOpen,
  onClose,
  defaultYear,
  defaultSemester,
}: Readonly<ExportModalProps>) {
  const { get } = useApi({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  });
  const [year, setYear] = useState<number>(defaultYear);
  const [semester, setSemester] = useState<number>(defaultSemester);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Fetch necessary data
      const [coursesRes, classesRes, roomsRes, roomCalcRes] = await Promise.all(
        [
          get('/api/courses'),
          get('/api/classes'),
          get('/api/rooms'),
          get(`/api/room-calculation?year=${year}&semester=${semester}`),
        ],
      );

      const courses = coursesRes.data || [];
      const classes = classesRes.data || [];
      const rooms = roomsRes.data || [];
      const roomCalculation = roomCalcRes.data || null;

      // Prepare workbook
      const wb = XLSX.utils.book_new();

      // Stats sheet: minimal computed stats
      type ClassType = { isAssumed?: boolean; currentStudents?: number };
      const totalStudents = (classes as ClassType[])
        .filter((c) => !c.isAssumed)
        .reduce<number>((s, c) => s + (c.currentStudents || 0), 0);

      const roomsBySize = { small: 0, medium: 0, big: 0 } as any;
      const roomsByBlock: Record<string, number> = {};
      for (const r of rooms as any[]) {
        if (r.size === 'P') roomsBySize.small++;
        else if (r.size === 'M') roomsBySize.medium++;
        else if (r.size === 'G') roomsBySize.big++;
        roomsByBlock[r.block] = (roomsByBlock[r.block] || 0) + 1;
      }

      const statsRows = [
        { key: 'requestedYear', value: year },
        { key: 'requestedSemester', value: semester },
        { key: 'totalRooms', value: (rooms as any[]).length },
        { key: 'totalStudents', value: totalStudents },
        { key: 'totalCourses', value: (courses as any[]).length },
      ];

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(statsRows, { header: ['key', 'value'] }),
        'Stats',
      );

      // Append Courses, Classes, Rooms sheets
      if ((courses as any[]).length > 0) {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(courses as any[]),
          'Courses',
        );
      }

      if ((classes as any[]).length > 0) {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(classes as any[]),
          'Classes',
        );
      }

      if ((rooms as any[]).length > 0) {
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(rooms as any[]),
          'Rooms',
        );
      }

      if (roomCalculation) {
        // Room calculation may contain nested structures; handle details.classes if present
        if (roomCalculation.details?.classes) {
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(roomCalculation.details.classes),
            'RoomCalculation_Details',
          );
        }

        // exceededLimits
        if (roomCalculation.exceededLimits) {
          XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.json_to_sheet(roomCalculation.exceededLimits),
            'ExceededLimits',
          );
        }
      }

      const filename = `dashboard-export-${year}-${semester}.xlsx`;
      XLSX.writeFile(wb, filename);
      onClose();
    } catch (err: any) {
      console.error('Export error', err);
      setError(err?.message || 'Erro ao exportar');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Exportar dados do Dashboard</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Ano</label>
            <input
              type="number"
              name="year"
              placeholder="Ex: 2025"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              min={2000}
              max={2100}
              className="search-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Semestre</label>
            <select
              name="semester"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="filter-select"
            >
              <option value={1}>1º Semestre</option>
              <option value={2}>2º Semestre</option>
            </select>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            ✕ Cancelar
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              handleExport();
            }}
            disabled={isExporting}
          >
            {isExporting ? 'Exportando...' : 'Exportar (.xlsx)'}
          </button>
        </div>
      </div>
      <style jsx>{`
        .modal {
          position: fixed;
          z-index: 1100;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
          max-width: 520px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background-color: #f3f4f6;
          color: #374151;
          transform: scale(1.1);
        }

        .close-btn:active {
          transform: scale(0.95);
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.25rem;
        }

        .search-input,
        .filter-select {
          padding: 0.875rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          min-width: 200px;
          background-color: #f8fafc;
          color: #1e293b;
          transition: all 0.2s ease-in-out;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .search-input:hover,
        .filter-select:hover {
          border-color: #cbd5e1;
          background-color: #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        .search-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          background-color: #ffffff;
          box-shadow:
            0 0 0 3px rgba(59, 130, 246, 0.1),
            0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .form-error {
          color: #b00020;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
