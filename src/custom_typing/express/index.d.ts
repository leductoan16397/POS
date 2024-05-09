declare namespace Express {
  interface LoggedUser {
    username: string;
    role: UserRole;
    id: string;
    permissions?: string[];
  }
  interface Request {
    tenantId?: string;
    user?: LoggedUser;
  }
}
