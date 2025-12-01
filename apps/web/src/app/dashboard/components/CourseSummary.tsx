import { Course } from '../types';

interface CourseSummaryProps {
  readonly courses: readonly Course[];
}

export function CourseSummary({ courses }: Readonly<CourseSummaryProps>) {
  if (courses.length === 0) {
    return null;
  }

  const displayedCourses = courses.slice(0, 5);
  const remainingCount = courses.length - 5;

  return (
    <div className="summary-section">
      <div className="summary-card">
        <h3 className="summary-title">Resumo dos Cursos</h3>
        <div className="summary-table-container">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Área</th>
                <th>Vagas</th>
                <th>Períodos</th>
              </tr>
            </thead>
            <tbody>
              {displayedCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.knowledgeArea}</td>
                  <td>{course.vacancies}</td>
                  <td>{course.periodQuantities}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {remainingCount > 0 && (
            <p className="summary-footer">
              E mais {remainingCount} cursos...{' '}
              <a href="/courses" className="summary-link">
                Ver todos
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
