import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { COLORS } from '../types';

interface RoomSizeData {
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly [key: string]: string | number;
}

interface CourseAreaData {
  readonly name: string;
  readonly fullName: string;
  readonly cursos: number;
  readonly [key: string]: string | number;
}

interface RoomBlockData {
  readonly name: string;
  readonly salas: number;
  readonly [key: string]: string | number;
}

interface ChartsProps {
  readonly roomSizeData: readonly RoomSizeData[];
  readonly coursesByAreaData: readonly CourseAreaData[];
  readonly roomsByBlockData: readonly RoomBlockData[];
}

interface RoomSizeChartProps {
  readonly data: readonly RoomSizeData[];
}

function RoomSizeChart({ data }: Readonly<RoomSizeChartProps>) {
  if (data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Nenhuma sala cadastrada</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[...data]}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) =>
              `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RoomBlockChartProps {
  readonly data: readonly RoomBlockData[];
}

function RoomBlockChart({ data }: Readonly<RoomBlockChartProps>) {
  if (data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>Nenhuma sala cadastrada</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={[...data]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="salas" name="Salas" fill={COLORS.accent} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CourseAreaChartProps {
  readonly data: readonly CourseAreaData[];
}

function CourseAreaChart({ data }: Readonly<CourseAreaChartProps>) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="charts-section single">
      <div className="chart-card wide">
        <h3 className="chart-title">Cursos por Área de Conhecimento</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[...data]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value, _name, props) => {
                  const payload = props.payload as { fullName: string };
                  return [value, payload.fullName];
                }}
              />
              <Bar dataKey="cursos" name="Cursos" fill={COLORS.secondary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function DashboardCharts({
  roomSizeData,
  coursesByAreaData,
  roomsByBlockData,
}: Readonly<ChartsProps>) {
  return (
    <>
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">Distribuição de Salas por Tamanho</h3>
          <RoomSizeChart data={roomSizeData} />
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Salas por Bloco</h3>
          <RoomBlockChart data={roomsByBlockData} />
        </div>
      </div>

      <CourseAreaChart data={coursesByAreaData} />
    </>
  );
}
