import { Ticket, TicketStatus, TicketPriority } from '../../domain/entities/Ticket';
import { TicketFilter } from '../secondary/ITicketRepository';

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority: TicketPriority;
  tags?: string[];
}

export interface ITicketUseCases {
  /**
   * Create a new ticket
   */
  createTicket(dto: CreateTicketDTO): Promise<Ticket>;

  /**
   * Get a ticket by ID
   */
  getTicketById(id: string): Promise<Ticket>;

  /**
   * List all tickets with optional filters
   */
  listTickets(filter?: TicketFilter): Promise<Ticket[]>;

  /**
   * Update a ticket's status
   */
  updateTicketStatus(id: string, newStatus: TicketStatus): Promise<Ticket>;

  /**
   * Add a tag to a ticket
   */
  addTagToTicket(id: string, tag: string): Promise<Ticket>;

  /**
   * Remove a tag from a ticket
   */
  removeTagFromTicket(id: string, tag: string): Promise<Ticket>;

  /**
   * Delete a ticket
   */
  deleteTicket(id: string): Promise<void>;
}
