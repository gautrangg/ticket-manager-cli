import * as fs from 'fs/promises';
import * as path from 'path';
import { Ticket, TicketProps } from '../../domain/entities/Ticket';
import { ITicketRepository, TicketFilter } from '../../ports/secondary/ITicketRepository';

export class JsonTicketRepository implements ITicketRepository {
  private readonly filePath: string;

  constructor(dataDir: string = './data') {
    this.filePath = path.join(dataDir, 'tickets.json');
  }

  private async ensureFileExists(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
    }
  }

  private async readTickets(): Promise<Ticket[]> {
    await this.ensureFileExists();
    const data = await fs.readFile(this.filePath, 'utf-8');
    const ticketsData: TicketProps[] = JSON.parse(data);
    return ticketsData.map(ticketData => Ticket.fromJSON(ticketData));
  }

  private async writeTickets(tickets: Ticket[]): Promise<void> {
    const ticketsData = tickets.map(ticket => ticket.toJSON());
    await fs.writeFile(this.filePath, JSON.stringify(ticketsData, null, 2));
  }

  async save(ticket: Ticket): Promise<void> {
    const tickets = await this.readTickets();
    tickets.push(ticket);
    await this.writeTickets(tickets);
  }

  async findById(id: string): Promise<Ticket | null> {
    const tickets = await this.readTickets();
    const ticket = tickets.find(t => t.id === id);
    return ticket || null;
  }

  async findAll(filter?: TicketFilter): Promise<Ticket[]> {
    let tickets = await this.readTickets();

    if (!filter) {
      return tickets;
    }

    if (filter.status) {
      tickets = tickets.filter(t => t.status === filter.status);
    }

    if (filter.priority) {
      tickets = tickets.filter(t => t.priority === filter.priority);
    }

    if (filter.tags && filter.tags.length > 0) {
      tickets = tickets.filter(t => 
        filter.tags!.some(tag => t.tags.includes(tag))
      );
    }

    return tickets;
  }

  async update(ticket: Ticket): Promise<void> {
    const tickets = await this.readTickets();
    const index = tickets.findIndex(t => t.id === ticket.id);
    
    if (index === -1) {
      throw new Error(`Ticket with id ${ticket.id} not found`);
    }

    tickets[index] = ticket;
    await this.writeTickets(tickets);
  }

  async delete(id: string): Promise<void> {
    const tickets = await this.readTickets();
    const filteredTickets = tickets.filter(t => t.id !== id);
    
    if (tickets.length === filteredTickets.length) {
      throw new Error(`Ticket with id ${id} not found`);
    }

    await this.writeTickets(filteredTickets);
  }
}
