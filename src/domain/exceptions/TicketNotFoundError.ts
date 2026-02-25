import { DomainError } from './DomainError';

export class TicketNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Ticket with id ${id} not found`);
    Object.setPrototypeOf(this, TicketNotFoundError.prototype);
  }
}
