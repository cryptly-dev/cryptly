import { authService } from '../../infrastructure/auth.service';

export async function getAuthHealthQuery(): Promise<boolean> {
  return authService.loadSessionHealth();
}
