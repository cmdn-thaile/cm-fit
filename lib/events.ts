// Simple event bus for cross-component communication
type Listener = () => void;

const listeners: Set<Listener> = new Set();

export function onProfileUpdate(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitProfileUpdate() {
  listeners.forEach((fn) => fn());
}
