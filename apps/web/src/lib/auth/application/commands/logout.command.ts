export function logoutCommand(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem('cryptly.jwtToken');
}
