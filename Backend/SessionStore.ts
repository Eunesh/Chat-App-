abstract class SessionStore {
  findSession(id: String) {}
  saveSession(id: String, session: session) {}
  findallSessions() {}
}

interface session {
  userID: String;
  username: String;
  connected: Boolean;
}
// storing all session id on map()
export class InMemorySessionStore extends SessionStore {
  private sessions;
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id: String) {
    return this.sessions.get(id);
  }

  saveSession(id: String, session: session): void {
    this.sessions.set(id, session);
  }

  findallSessions() {
    return [...this.sessions.values()];
  }
}
