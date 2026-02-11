import { v4 as uuidv4 } from 'uuid';
import { Ticket, TicketStatus, TicketPriority } from '../entities/Ticket';
import { ITicketRepository, TicketFilter } from '../../ports/secondary/ITicketRepository';

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority: TicketPriority;
  tags?: string[];
}

export class TicketService {
  constructor(private readonly repository: ITicketRepository) {}

  async createTicket(dto: CreateTicketDTO): Promise<Ticket> {
    const ticket = new Ticket({
      id: uuidv4(),
      title: dto.title,
      description: dto.description,
      status: TicketStatus.OPEN,
      priority: dto.priority,
      tags: dto.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.repository.save(ticket);
    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new Error(`Ticket with id ${id} not found`);
    }
    return ticket;
  }

  async listTickets(filter?: TicketFilter): Promise<Ticket[]> {
    return this.repository.findAll(filter);
  }

  async updateTicketStatus(id: string, newStatus: TicketStatus): Promise<Ticket> {
    const ticket = await this.getTicketById(id);
    ticket.updateStatus(newStatus);
    await this.repository.update(ticket);
    return ticket;
  }

  async addTagToTicket(id: string, tag: string): Promise<Ticket> {
    const ticket = await this.getTicketById(id);
    ticket.addTag(tag);
    await this.repository.update(ticket);
    return ticket;
  }

  async removeTagFromTicket(id: string, tag: string): Promise<Ticket> {
    const ticket = await this.getTicketById(id);
    ticket.removeTag(tag);
    await this.repository.update(ticket);
    return ticket;
  }

  async deleteTicket(id: string): Promise<void> {
    await this.getTicketById(id); // Verify ticket exists
    await this.repository.delete(id);
  }
}
