import { Ticket, TicketStatus, TicketPriority } from '../../domain/entities/Ticket';

export interface TicketFilter {
  status?: TicketStatus;
  priority?: TicketPriority;
  tags?: string[];
}

export interface ITicketRepository {
  /**
   * Save a ticket to storage
   */
  save(ticket: Ticket): Promise<void>;

  /**
   * Find a ticket by ID
   */
  findById(id: string): Promise<Ticket | null>;

  /**
   * Find all tickets with optional filters
   */
  findAll(filter?: TicketFilter): Promise<Ticket[]>;

  /**
   * Update an existing ticket
   */
  update(ticket: Ticket): Promise<void>;

  /**
   * Delete a ticket by ID
   */
  delete(id: string): Promise<void>;
}
