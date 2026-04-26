import type { ProjectSummary } from '../../domain/project-summary';

export async function createProjectCommand(name: string): Promise<ProjectSummary> {
  return {
    id: crypto.randomUUID(),
    name,
    updatedAt: new Date().toISOString()
  };
}
