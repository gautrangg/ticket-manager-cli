import { TicketService } from '../../src/domain/services/TicketService';
import { Ticket, TicketStatus, TicketPriority } from '../../src/domain/entities/Ticket';
import { ITicketRepository } from '../../src/ports/secondary/ITicketRepository';

// Mock Repository
class MockTicketRepository implements ITicketRepository {
  private tickets: Map<string, Ticket> = new Map();

  async save(ticket: Ticket): Promise<void> {
    this.tickets.set(ticket.id, ticket);
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.get(id) || null;
  }

  async findAll(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async update(ticket: Ticket): Promise<void> {
    if (!this.tickets.has(ticket.id)) {
      throw new Error(`Ticket with id ${ticket.id} not found`);
    }
    this.tickets.set(ticket.id, ticket);
  }

  async delete(id: string): Promise<void> {
    this.tickets.delete(id);
  }

  // Helper for testing
  clear(): void {
    this.tickets.clear();
  }
}

describe('TicketService', () => {
  let service: TicketService;
  let mockRepository: MockTicketRepository;

  beforeEach(() => {
    mockRepository = new MockTicketRepository();
    service = new TicketService(mockRepository);
  });

  afterEach(() => {
    mockRepository.clear();
  });

  describe('createTicket', () => {
    it('should create a ticket with valid data', async () => {
      const dto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.HIGH,
        tags: ['bug']
      };

      const ticket = await service.createTicket(dto);

      expect(ticket.title).toBe(dto.title);
      expect(ticket.description).toBe(dto.description);
      expect(ticket.priority).toBe(dto.priority);
      expect(ticket.tags).toEqual(dto.tags);
      expect(ticket.status).toBe(TicketStatus.OPEN);
      expect(ticket.id).toBeDefined();
    });

    it('should create ticket without tags if not provided', async () => {
      const dto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.LOW
      };

      const ticket = await service.createTicket(dto);

      expect(ticket.tags).toEqual([]);
    });

    it('should save ticket to repository', async () => {
      const dto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM
      };

      const ticket = await service.createTicket(dto);
      const savedTicket = await mockRepository.findById(ticket.id);

      expect(savedTicket).not.toBeNull();
      expect(savedTicket?.id).toBe(ticket.id);
    });
  });

  describe('getTicketById', () => {
    it('should return ticket when found', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.LOW
      });

      const found = await service.getTicketById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.title).toBe(created.title);
    });

    it('should throw error when ticket not found', async () => {
      await expect(service.getTicketById('non-existent'))
        .rejects
        .toThrow('Ticket with id non-existent not found');
    });
  });

  describe('listTickets', () => {
    it('should return all tickets', async () => {
      await service.createTicket({
        title: 'Ticket 1',
        description: 'Desc 1',
        priority: TicketPriority.LOW
      });

      await service.createTicket({
        title: 'Ticket 2',
        description: 'Desc 2',
        priority: TicketPriority.HIGH
      });

      const tickets = await service.listTickets();

      expect(tickets.length).toBe(2);
    });

    it('should return empty array when no tickets exist', async () => {
      const tickets = await service.listTickets();

      expect(tickets).toEqual([]);
    });
  });

  describe('updateTicketStatus', () => {
    it('should update ticket status successfully', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.MEDIUM
      });

      const updated = await service.updateTicketStatus(created.id, TicketStatus.IN_PROGRESS);

      expect(updated.status).toBe(TicketStatus.IN_PROGRESS);
      expect(updated.id).toBe(created.id);
    });

    it('should throw error when updating non-existent ticket', async () => {
      await expect(service.updateTicketStatus('non-existent', TicketStatus.CLOSED))
        .rejects
        .toThrow('Ticket with id non-existent not found');
    });

    it('should persist status update to repository', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.MEDIUM
      });

      await service.updateTicketStatus(created.id, TicketStatus.RESOLVED);
      const found = await mockRepository.findById(created.id);

      expect(found?.status).toBe(TicketStatus.RESOLVED);
    });
  });

  describe('addTagToTicket', () => {
    it('should add tag to ticket', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.LOW,
        tags: []
      });

      const updated = await service.addTagToTicket(created.id, 'urgent');

      expect(updated.tags).toContain('urgent');
    });

    it('should throw error when adding tag to non-existent ticket', async () => {
      await expect(service.addTagToTicket('non-existent', 'tag'))
        .rejects
        .toThrow('Ticket with id non-existent not found');
    });
  });

  describe('removeTagFromTicket', () => {
    it('should remove tag from ticket', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.LOW,
        tags: ['tag1', 'tag2']
      });

      const updated = await service.removeTagFromTicket(created.id, 'tag1');

      expect(updated.tags).not.toContain('tag1');
      expect(updated.tags).toContain('tag2');
    });
  });

  describe('deleteTicket', () => {
    it('should delete ticket successfully', async () => {
      const created = await service.createTicket({
        title: 'Test',
        description: 'Test',
        priority: TicketPriority.LOW
      });

      await service.deleteTicket(created.id);
      const found = await mockRepository.findById(created.id);

      expect(found).toBeNull();
    });

    it('should throw error when deleting non-existent ticket', async () => {
      await expect(service.deleteTicket('non-existent'))
        .rejects
        .toThrow('Ticket with id non-existent not found');
    });
  });
});
