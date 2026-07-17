const KEY = 'fh-chat-session';

export function getSessionId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function resetSessionId() {
  const id = crypto.randomUUID();
  localStorage.setItem(KEY, id);
  return id;
}
