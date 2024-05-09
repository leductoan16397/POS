import { UserRole } from './enum';

export interface LoggedUser {
  email: string;
  role: UserRole;
  id: string;
  tenantId: string | null;
}

export enum TokenType {
  access = 'access',
  refresh = 'refresh',
}

export interface TokenPayload {
  id: string;
  email: string;
  tenantId: string | null;
  role: UserRole;
  type: TokenType;
}
