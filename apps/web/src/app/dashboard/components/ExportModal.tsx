'use client';

import React, { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import ExcelJS from 'exceljs';

// Tipos para o retorno do room-calculation
interface ClassDetail {
  classId: number;
  courseName: string | null;
  studentCount: number;
  roomSize: 'P' | 'M' | 'G' | 'EXCEDIDO' | null;
  isAssumed: boolean;
  startYear: number;
  semester: number;
}

interface ExceededLimit {
  type: string;
  name: string;
  studentCount: number;
  maxLimit: number;
  isProjected?: boolean;
}

interface RoomCalculationData {
  totalRoomsRequired: {
    small: number;
    medium: number;
    big: number;
  };
  details: {
    classes: ClassDetail[];
  };
  exceededLimits: ExceededLimit[];
  metadata: {
    requestedYear: number;
    requestedSemester: number;
    isProjection: boolean;
    simulatedClassesCount: number;
  };
}

// Tipos para dados gerais
interface Course {
  id: number;
  name: string;
  knowledgeArea: string;
  vacancies: number;
  periodQuantities: number;
  openingYear: number;
}

interface ClassData {
  id: number;
  courseId: number;
  shiftId: number;
  year: number;
  semester: number;
  currentStudents: number;
  isAssumed?: boolean;
  course?: { name: string };
  shift?: { name: string };
}

interface Room {
  id: number;
  block: string;
  number: number;
  size: string;
  classId?: number;
}

interface CalculationParams {
  id: number;
  dropoutPercentage: number;
  studentsPerSmallRoom: number;
  studentsPerMediumRoom: number;
  studentsPerBigRoom: number;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear: number;
  defaultSemester: number;
}

// Tradução de turnos (EN → PT-BR)
const translateShift = (shiftName: string | undefined): string => {
  if (!shiftName) return 'N/A';
  const translations: Record<string, string> = {
    Morning: 'Matutino',
    Afternoon: 'Vespertino',
    Night: 'Noturno',
    Evening: 'Noturno',
  };
  return translations[shiftName] ?? shiftName;
};

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
      // Fetch todos os dados necessários
      const [coursesRes, classesRes, roomsRes, roomCalcRes, calcParamsRes] =
        await Promise.all([
          get<Course[]>('/api/courses'),
          get<ClassData[]>('/api/classes'),
          get<Room[]>('/api/rooms'),
          get<RoomCalculationData>(
            `/api/room-calculation?year=${year}&semester=${semester}`,
          ),
          get<CalculationParams[]>('/api/calculation-parameters'),
        ]);

      const courses = coursesRes.data ?? [];
      const classes = classesRes.data ?? [];
      const rooms = roomsRes.data ?? [];
      const roomCalculation = roomCalcRes.data;
      const calcParams = calcParamsRes.data?.[0];

      if (!roomCalculation) {
        throw new Error('Não foi possível obter os dados de cálculo de salas');
      }

      // Capacidades das salas (do parâmetro ou valores padrão)
      const smallCap = calcParams?.studentsPerSmallRoom ?? 30;
      const medCap = calcParams?.studentsPerMediumRoom ?? 50;
      const bigCap = calcParams?.studentsPerBigRoom ?? 70;

      // Prepare workbook
      const wb = new ExcelJS.Workbook();
      wb.creator = 'Sistema de Gestão de Salas';
      wb.created = new Date();

      // === ESTILOS COMUNS ===
      const headerStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' },
        },
        alignment: { horizontal: 'center', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FF1E40AF' } },
          bottom: { style: 'thin', color: { argb: 'FF1E40AF' } },
          left: { style: 'thin', color: { argb: 'FF1E40AF' } },
          right: { style: 'thin', color: { argb: 'FF1E40AF' } },
        },
      };

      const sectionHeaderStyle: Partial<ExcelJS.Style> = {
        font: { bold: true, color: { argb: 'FF1E40AF' }, size: 12 },
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBEAFE' },
        },
        alignment: { horizontal: 'left', vertical: 'middle' },
        border: {
          top: { style: 'thin', color: { argb: 'FF93C5FD' } },
          bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
          left: { style: 'thin', color: { argb: 'FF93C5FD' } },
          right: { style: 'thin', color: { argb: 'FF93C5FD' } },
        },
      };

      const cellBorder: Partial<ExcelJS.Borders> = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
      };

      const zebraLight: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' },
      };

      const zebraDark: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' },
      };

      const alertFill: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF2F2' },
      };

      const successFill: ExcelJS.FillPattern = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0FDF4' },
      };

      // Função auxiliar para aplicar estilos de tabela
      const applyTableStyles = (
        sheet: ExcelJS.Worksheet,
        dataStartRow: number,
        columnCount: number,
      ) => {
        // Estilizar header (primeira linha)
        const headerRow = sheet.getRow(1);
        headerRow.height = 24;
        for (let col = 1; col <= columnCount; col++) {
          const cell = headerRow.getCell(col);
          cell.style = headerStyle;
        }

        // Aplicar zebra striping e bordas nas linhas de dados
        const rowCount = sheet.rowCount;
        for (let row = dataStartRow; row <= rowCount; row++) {
          const currentRow = sheet.getRow(row);
          const isEven = (row - dataStartRow) % 2 === 0;
          for (let col = 1; col <= columnCount; col++) {
            const cell = currentRow.getCell(col);
            cell.border = cellBorder;
            cell.fill = isEven ? zebraLight : zebraDark;
            cell.alignment = { vertical: 'middle' };
          }
        }

        // Congelar primeira linha
        sheet.views = [{ state: 'frozen', ySplit: 1 }];
      };

      // ============================================
      // 1. RESUMO DA PREVISÃO
      // ============================================
      const resumoSheet = wb.addWorksheet('📊 Resumo');

      const classesAtivas = roomCalculation.details?.classes ?? [];
      const totalAlunosPrevisao = classesAtivas.reduce(
        (s, c) => s + (c.studentCount ?? 0),
        0,
      );
      const totalTurmasAtivas = classesAtivas.length;
      const turmasProjetadas = classesAtivas.filter((c) => c.isAssumed).length;
      const turmasReais = totalTurmasAtivas - turmasProjetadas;
      const totalSalasNecessarias =
        (roomCalculation.totalRoomsRequired?.small ?? 0) +
        (roomCalculation.totalRoomsRequired?.medium ?? 0) +
        (roomCalculation.totalRoomsRequired?.big ?? 0);

      // Título principal
      resumoSheet.mergeCells('A1:C1');
      const titleCell = resumoSheet.getCell('A1');
      titleCell.value = `RELATÓRIO DE PREVISÃO DE SALAS - ${year}/${semester}º Semestre`;
      titleCell.style = {
        font: { bold: true, size: 16, color: { argb: 'FF1E40AF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
      };
      resumoSheet.getRow(1).height = 30;

      // Subtítulo
      resumoSheet.mergeCells('A2:C2');
      const subtitleCell = resumoSheet.getCell('A2');
      subtitleCell.value = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
      subtitleCell.style = {
        font: { italic: true, size: 10, color: { argb: 'FF6B7280' } },
        alignment: { horizontal: 'center' },
      };

      // Configurar colunas
      resumoSheet.columns = [{ width: 42 }, { width: 20 }, { width: 20 }];

      let currentRow = 4;

      // Seção: Período
      resumoSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const periodoHeader = resumoSheet.getCell(`A${currentRow}`);
      periodoHeader.value = '📅 PERÍODO SELECIONADO';
      periodoHeader.style = sectionHeaderStyle;
      resumoSheet.getRow(currentRow).height = 22;
      currentRow++;

      const periodoData = [
        ['Ano', roomCalculation.metadata?.requestedYear ?? year, ''],
        [
          'Semestre',
          `${roomCalculation.metadata?.requestedSemester ?? semester}º`,
          '',
        ],
        [
          'Tipo',
          roomCalculation.metadata?.isProjection
            ? '🔮 Projeção Futura'
            : '✅ Dados Reais',
          '',
        ],
      ];
      for (const [label, value] of periodoData) {
        const row = resumoSheet.getRow(currentRow);
        row.getCell(1).value = label;
        row.getCell(2).value = value;
        row.getCell(1).border = cellBorder;
        row.getCell(2).border = cellBorder;
        row.getCell(1).font = { bold: true };
        currentRow++;
      }

      currentRow++;

      // Seção: Turmas
      resumoSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const turmasHeader = resumoSheet.getCell(`A${currentRow}`);
      turmasHeader.value = '👥 TURMAS ATIVAS NO PERÍODO';
      turmasHeader.style = sectionHeaderStyle;
      resumoSheet.getRow(currentRow).height = 22;
      currentRow++;

      const turmasData = [
        ['Total de Turmas', totalTurmasAtivas, ''],
        ['Turmas Reais', turmasReais, ''],
        ['Turmas Projetadas', turmasProjetadas, ''],
        ['Total de Alunos (com evasão)', totalAlunosPrevisao, ''],
      ];
      for (const [label, value] of turmasData) {
        const row = resumoSheet.getRow(currentRow);
        row.getCell(1).value = label;
        row.getCell(2).value = value;
        row.getCell(1).border = cellBorder;
        row.getCell(2).border = cellBorder;
        row.getCell(2).alignment = { horizontal: 'right' };
        row.getCell(1).font = { bold: true };
        currentRow++;
      }

      currentRow++;

      // Seção: Salas Necessárias
      resumoSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const salasHeader = resumoSheet.getCell(`A${currentRow}`);
      salasHeader.value = '🏫 SALAS NECESSÁRIAS';
      salasHeader.style = sectionHeaderStyle;
      resumoSheet.getRow(currentRow).height = 22;
      currentRow++;

      // Cabeçalho da tabela de salas
      const salasTableHeader = resumoSheet.getRow(currentRow);
      salasTableHeader.getCell(1).value = 'Tamanho';
      salasTableHeader.getCell(2).value = 'Quantidade';
      salasTableHeader.getCell(3).value = 'Capacidade';
      for (let i = 1; i <= 3; i++) {
        salasTableHeader.getCell(i).style = headerStyle;
      }
      currentRow++;

      const salasReqData = [
        [
          'Pequena (P)',
          roomCalculation.totalRoomsRequired?.small ?? 0,
          `Até ${smallCap} alunos`,
        ],
        [
          'Média (M)',
          roomCalculation.totalRoomsRequired?.medium ?? 0,
          `${smallCap + 1}-${medCap} alunos`,
        ],
        [
          'Grande (G)',
          roomCalculation.totalRoomsRequired?.big ?? 0,
          `${medCap + 1}-${bigCap} alunos`,
        ],
      ];
      for (let i = 0; i < salasReqData.length; i++) {
        const [tamanho, qtd, cap] = salasReqData[i];
        const row = resumoSheet.getRow(currentRow);
        row.getCell(1).value = tamanho;
        row.getCell(2).value = qtd;
        row.getCell(3).value = cap;
        for (let j = 1; j <= 3; j++) {
          row.getCell(j).border = cellBorder;
          row.getCell(j).fill = i % 2 === 0 ? zebraLight : zebraDark;
        }
        row.getCell(2).alignment = { horizontal: 'center' };
        currentRow++;
      }

      // Total de salas
      const totalRow = resumoSheet.getRow(currentRow);
      totalRow.getCell(1).value = 'TOTAL';
      totalRow.getCell(2).value = totalSalasNecessarias;
      totalRow.getCell(3).value = '';
      for (let i = 1; i <= 3; i++) {
        totalRow.getCell(i).font = { bold: true };
        totalRow.getCell(i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBEAFE' },
        };
        totalRow.getCell(i).border = cellBorder;
      }
      currentRow += 2;

      // Seção: Alertas
      const alertCount = roomCalculation.exceededLimits?.length ?? 0;
      resumoSheet.mergeCells(`A${currentRow}:C${currentRow}`);
      const alertasHeader = resumoSheet.getCell(`A${currentRow}`);
      alertasHeader.value = alertCount > 0 ? '⚠️ ALERTAS' : '✅ SEM ALERTAS';
      alertasHeader.style = {
        ...sectionHeaderStyle,
        fill: {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: alertCount > 0 ? 'FFFEF3C7' : 'FFD1FAE5' },
        },
        font: {
          bold: true,
          color: { argb: alertCount > 0 ? 'FF92400E' : 'FF065F46' },
          size: 12,
        },
      };
      resumoSheet.getRow(currentRow).height = 22;
      currentRow++;

      const alertRow = resumoSheet.getRow(currentRow);
      alertRow.getCell(1).value = 'Turmas que excedem capacidade máxima';
      alertRow.getCell(2).value = alertCount;
      alertRow.getCell(1).border = cellBorder;
      alertRow.getCell(2).border = cellBorder;
      alertRow.getCell(1).font = { bold: true };
      if (alertCount > 0) {
        alertRow.getCell(2).font = { bold: true, color: { argb: 'FFDC2626' } };
      }

      // ============================================
      // 2. TURMAS ATIVAS
      // ============================================
      if (classesAtivas.length > 0) {
        const turmasAtivasSheet = wb.addWorksheet('📚 Turmas Ativas');
        turmasAtivasSheet.columns = [
          { header: 'ID', key: 'classId', width: 8 },
          { header: 'Curso', key: 'courseName', width: 40 },
          { header: 'Ano Início', key: 'startYear', width: 12 },
          { header: 'Período', key: 'semester', width: 10 },
          { header: 'Alunos', key: 'studentCount', width: 12 },
          { header: 'Sala', key: 'roomSize', width: 10 },
          { header: 'Status', key: 'tipo', width: 12 },
        ];

        for (const c of classesAtivas) {
          const row = turmasAtivasSheet.addRow({
            classId: c.classId,
            courseName: c.courseName ?? 'N/A',
            startYear: c.startYear,
            semester: `${c.semester}º`,
            studentCount: c.studentCount,
            roomSize: c.roomSize ?? 'N/A',
            tipo: c.isAssumed ? 'Projetada' : 'Real',
          });

          // Destacar turmas projetadas
          if (c.isAssumed) {
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
            row.getCell(7).font = { color: { argb: 'FF92400E' } };
          } else {
            row.getCell(7).fill = successFill;
            row.getCell(7).font = { color: { argb: 'FF065F46' } };
          }
        }

        applyTableStyles(turmasAtivasSheet, 2, 7);

        // Adicionar totalizador
        const totalRowNum = turmasAtivasSheet.rowCount + 2;
        turmasAtivasSheet.getCell(`D${totalRowNum}`).value = 'Total:';
        turmasAtivasSheet.getCell(`D${totalRowNum}`).font = { bold: true };
        turmasAtivasSheet.getCell(`E${totalRowNum}`).value =
          totalAlunosPrevisao;
        turmasAtivasSheet.getCell(`E${totalRowNum}`).font = { bold: true };
        turmasAtivasSheet.getCell(`E${totalRowNum}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDBEAFE' },
        };
      }

      // ============================================
      // 3. ALERTAS
      // ============================================
      const exceededLimits = roomCalculation.exceededLimits ?? [];
      if (exceededLimits.length > 0) {
        const alertasSheet = wb.addWorksheet('⚠️ Alertas');
        alertasSheet.columns = [
          { header: 'Tipo', key: 'type', width: 12 },
          { header: 'Identificação', key: 'name', width: 45 },
          { header: 'Alunos', key: 'studentCount', width: 12 },
          { header: 'Limite Máx', key: 'maxLimit', width: 12 },
          { header: 'Projeção?', key: 'isProjected', width: 12 },
        ];

        for (const e of exceededLimits) {
          const row = alertasSheet.addRow({
            type: e.type,
            name: e.name,
            studentCount: e.studentCount,
            maxLimit: e.maxLimit,
            isProjected: e.isProjected ? 'Sim' : 'Não',
          });

          // Destacar células com problema
          row.getCell(3).fill = alertFill;
          row.getCell(3).font = { bold: true, color: { argb: 'FFDC2626' } };
        }

        // Estilizar header com cor de alerta
        const alertHeaderStyle: Partial<ExcelJS.Style> = {
          ...headerStyle,
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDC2626' },
          },
        };

        const headerRowAlert = alertasSheet.getRow(1);
        headerRowAlert.height = 24;
        for (let col = 1; col <= 5; col++) {
          headerRowAlert.getCell(col).style = alertHeaderStyle;
        }

        alertasSheet.views = [{ state: 'frozen', ySplit: 1 }];
      }

      // ============================================
      // 4. ESTATÍSTICAS GERAIS
      // ============================================
      const statsSheet = wb.addWorksheet('📈 Estatísticas');

      // Calcular estatísticas
      const salasPorTamanho = { P: 0, M: 0, G: 0 };
      const salasPorBloco: Record<string, number> = {};
      for (const r of rooms) {
        if (r.size === 'P') salasPorTamanho.P++;
        else if (r.size === 'M') salasPorTamanho.M++;
        else if (r.size === 'G') salasPorTamanho.G++;
        salasPorBloco[r.block] = (salasPorBloco[r.block] ?? 0) + 1;
      }

      const turmasReaisCadastradas = classes.filter((c) => !c.isAssumed);

      statsSheet.columns = [{ width: 35 }, { width: 20 }];

      // Título
      statsSheet.mergeCells('A1:B1');
      const statsTitle = statsSheet.getCell('A1');
      statsTitle.value = 'ESTATÍSTICAS GERAIS DO SISTEMA';
      statsTitle.style = {
        font: { bold: true, size: 14, color: { argb: 'FF1E40AF' } },
        alignment: { horizontal: 'center', vertical: 'middle' },
      };
      statsSheet.getRow(1).height = 28;

      let statsRow = 3;

      // Cursos
      statsSheet.mergeCells(`A${statsRow}:B${statsRow}`);
      statsSheet.getCell(`A${statsRow}`).value = '📚 CURSOS';
      statsSheet.getCell(`A${statsRow}`).style = sectionHeaderStyle;
      statsRow++;
      statsSheet.getCell(`A${statsRow}`).value = 'Total de Cursos';
      statsSheet.getCell(`B${statsRow}`).value = courses.length;
      statsSheet.getCell(`A${statsRow}`).font = { bold: true };
      statsSheet.getCell(`A${statsRow}`).border = cellBorder;
      statsSheet.getCell(`B${statsRow}`).border = cellBorder;
      statsRow += 2;

      // Turmas
      statsSheet.mergeCells(`A${statsRow}:B${statsRow}`);
      statsSheet.getCell(`A${statsRow}`).value = '👥 TURMAS';
      statsSheet.getCell(`A${statsRow}`).style = sectionHeaderStyle;
      statsRow++;

      const turmaStats = [
        ['Total Cadastradas', classes.length],
        ['Turmas Reais', turmasReaisCadastradas.length],
        ['Turmas Projetadas', classes.filter((c) => c.isAssumed).length],
      ];

      for (let i = 0; i < turmaStats.length; i++) {
        const [label, value] = turmaStats[i];
        statsSheet.getCell(`A${statsRow}`).value = label;
        statsSheet.getCell(`B${statsRow}`).value = value;
        statsSheet.getCell(`A${statsRow}`).font = { bold: true };
        statsSheet.getCell(`A${statsRow}`).border = cellBorder;
        statsSheet.getCell(`B${statsRow}`).border = cellBorder;
        statsSheet.getCell(`A${statsRow}`).fill =
          i % 2 === 0 ? zebraLight : zebraDark;
        statsSheet.getCell(`B${statsRow}`).fill =
          i % 2 === 0 ? zebraLight : zebraDark;
        statsRow++;
      }
      statsRow++;

      // Salas por Tamanho
      statsSheet.mergeCells(`A${statsRow}:B${statsRow}`);
      statsSheet.getCell(`A${statsRow}`).value = '🏫 SALAS CADASTRADAS';
      statsSheet.getCell(`A${statsRow}`).style = sectionHeaderStyle;
      statsRow++;

      const salaStats = [
        ['Total de Salas', rooms.length],
        ['Pequenas (P)', salasPorTamanho.P],
        ['Médias (M)', salasPorTamanho.M],
        ['Grandes (G)', salasPorTamanho.G],
      ];

      for (let i = 0; i < salaStats.length; i++) {
        const [label, value] = salaStats[i];
        statsSheet.getCell(`A${statsRow}`).value = label;
        statsSheet.getCell(`B${statsRow}`).value = value;
        statsSheet.getCell(`A${statsRow}`).font = { bold: true };
        statsSheet.getCell(`A${statsRow}`).border = cellBorder;
        statsSheet.getCell(`B${statsRow}`).border = cellBorder;
        statsSheet.getCell(`A${statsRow}`).fill =
          i % 2 === 0 ? zebraLight : zebraDark;
        statsSheet.getCell(`B${statsRow}`).fill =
          i % 2 === 0 ? zebraLight : zebraDark;
        statsRow++;
      }
      statsRow++;

      // Salas por Bloco
      statsSheet.mergeCells(`A${statsRow}:B${statsRow}`);
      statsSheet.getCell(`A${statsRow}`).value = '🏢 SALAS POR BLOCO';
      statsSheet.getCell(`A${statsRow}`).style = sectionHeaderStyle;
      statsRow++;

      let blocoIndex = 0;
      for (const [bloco, quantidade] of Object.entries(salasPorBloco).sort()) {
        statsSheet.getCell(`A${statsRow}`).value = `Bloco ${bloco}`;
        statsSheet.getCell(`B${statsRow}`).value = quantidade;
        statsSheet.getCell(`A${statsRow}`).font = { bold: true };
        statsSheet.getCell(`A${statsRow}`).border = cellBorder;
        statsSheet.getCell(`B${statsRow}`).border = cellBorder;
        statsSheet.getCell(`A${statsRow}`).fill =
          blocoIndex % 2 === 0 ? zebraLight : zebraDark;
        statsSheet.getCell(`B${statsRow}`).fill =
          blocoIndex % 2 === 0 ? zebraLight : zebraDark;
        statsRow++;
        blocoIndex++;
      }

      // ============================================
      // 5. LISTA DE CURSOS
      // ============================================
      if (courses.length > 0) {
        const cursosSheet = wb.addWorksheet('🎓 Cursos');
        cursosSheet.columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Nome do Curso', key: 'name', width: 45 },
          { header: 'Área', key: 'knowledgeArea', width: 25 },
          { header: 'Vagas', key: 'vacancies', width: 10 },
          { header: 'Períodos', key: 'periodQuantities', width: 10 },
          { header: 'Ano Abertura', key: 'openingYear', width: 14 },
        ];

        for (const c of courses) {
          cursosSheet.addRow({
            id: c.id,
            name: c.name,
            knowledgeArea: c.knowledgeArea,
            vacancies: c.vacancies,
            periodQuantities: c.periodQuantities,
            openingYear: c.openingYear,
          });
        }

        applyTableStyles(cursosSheet, 2, 6);
      }

      // ============================================
      // 6. TODAS AS TURMAS
      // ============================================
      if (classes.length > 0) {
        const turmasSheet = wb.addWorksheet('📋 Todas Turmas');
        turmasSheet.columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Curso', key: 'courseName', width: 40 },
          { header: 'Turno', key: 'shiftName', width: 15 },
          { header: 'Ano', key: 'year', width: 10 },
          { header: 'Sem.', key: 'semester', width: 8 },
          { header: 'Alunos', key: 'currentStudents', width: 10 },
          { header: 'Status', key: 'status', width: 12 },
        ];

        for (const c of classes) {
          const row = turmasSheet.addRow({
            id: c.id,
            courseName: c.course?.name ?? `Curso ID ${c.courseId}`,
            shiftName: translateShift(c.shift?.name),
            year: c.year,
            semester: `${c.semester}º`,
            currentStudents: c.currentStudents,
            status: c.isAssumed ? 'Projetada' : 'Real',
          });

          if (c.isAssumed) {
            row.getCell(7).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFEF3C7' },
            };
          }
        }

        applyTableStyles(turmasSheet, 2, 7);
      }

      // ============================================
      // 7. LISTA DE SALAS
      // ============================================
      if (rooms.length > 0) {
        const salasSheet = wb.addWorksheet('🚪 Salas');
        salasSheet.columns = [
          { header: 'ID', key: 'id', width: 8 },
          { header: 'Bloco', key: 'block', width: 12 },
          { header: 'Número', key: 'number', width: 12 },
          { header: 'Tamanho', key: 'size', width: 14 },
          { header: 'Ocupada', key: 'occupied', width: 12 },
        ];

        const getSizeLabel = (size: string) => {
          if (size === 'P') return 'Pequena';
          if (size === 'M') return 'Média';
          return 'Grande';
        };

        for (const r of rooms) {
          const row = salasSheet.addRow({
            id: r.id,
            block: r.block,
            number: r.number,
            size: getSizeLabel(r.size),
            occupied: r.classId ? 'Sim' : 'Não',
          });

          // Destacar salas ocupadas
          if (r.classId) {
            row.getCell(5).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFDBEAFE' },
            };
          }
        }

        applyTableStyles(salasSheet, 2, 5);
      }

      // Gerar e baixar o arquivo
      const filename = `relatorio-salas-${year}-S${semester}.xlsx`;
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      globalThis.URL.revokeObjectURL(url);
      onClose();
    } catch (err) {
      console.error('Export error', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao exportar';
      setError(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Exportar Relatório</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          O relatório incluirá a previsão de salas para o período selecionado e
          as estatísticas gerais do sistema.
        </p>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="export-year">
              Ano
            </label>
            <input
              id="export-year"
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
            <label className="form-label" htmlFor="export-semester">
              Semestre
            </label>
            <select
              id="export-semester"
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
              void handleExport();
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
