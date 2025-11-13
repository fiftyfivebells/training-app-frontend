let onLogout: (() => void) | null = null;

export function registerLogoutHandler(handler: () => void) {
  onLogout = handler;
}

export function notifyLogout() {
  if (onLogout) onLogout();
}