# Project Glossary

This document maps the Ubiquitous Language (PT-BR) of the business domain to the official English terms used in the codebase. It serves as the single source of truth for terminology to ensure consistency across the entire monorepo.

| PT-BR (Linguagem Ubíqua) | English (Termo no Código) | Notas de Implementação                                                               |
| :----------------------- | :------------------------ | :----------------------------------------------------------------------------------- |
| Bloco                    | `Block`                   | An Entity that groups Rooms.                                                         |
| Sala                     | `Room`                    | An Entity that belongs to a `Block`.                                                 |
| Tipo de Sala             | `RoomType`                | Likely an `Enum` in the code (e.g., `CLASSROOM`, `LABORATORY`).                      |
| Tamanho da Sala          | `RoomSize`                | A **Value Object** with properties like `label`, `minCapacity`, and `maxCapacity`.   |
| Laboratório              | `LabRequirement`          | A Value Object or Entity describing the demand of a `Course`.                        |
| Curso                    | `Course`                  | The Root of our main **Aggregate**. Contains the `AuthorizedSlots`.                  |
| Vagas Autorizadas        | `AuthorizedSlots`         | A property of the `Course` aggregate. An integer that acts as a validation rule.     |
| Alunos Matriculados      | `EnrolledStudents`        | A property of the `Cohort` entity. The actual starting number of students.           |
| Período                  | `Term`                    | A Value Object representing a semester (e.g., `{ year: 2026, semester: 1 }`).        |
| Turno                    | `Shift`                   | Likely an `Enum` (e.g., `MORNING`, `AFTERNOON`, `NIGHT`).                            |
| Turma                    | `Cohort`                  | An Entity that lives inside the `Course` aggregate. Contains the `EnrolledStudents`. |
| Alocação de Sala         | `RoomAllocation`          | An Entity representing the link between a `Cohort`, `Room`, and `Shift`.             |
| Parâmetro de Cálculo     | `CalculationParameter`    | An Entity or Value Object for configurable system-wide values (like `EvasionRate`).  |
| Projeção de Salas        | `RoomForecast`            | A Value Object or DTO that stores the results of a forecast calculation.             |
