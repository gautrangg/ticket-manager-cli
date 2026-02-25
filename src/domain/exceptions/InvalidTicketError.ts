import { DomainError } from './DomainError';

export class InvalidTicketError extends DomainError {
  constructor(message: string) {
    super(`Invalid ticket: ${message}`);
    Object.setPrototypeOf(this, InvalidTicketError.prototype);
  }
}
