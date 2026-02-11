import { Ticket, TicketStatus, TicketPriority } from '../../src/domain/entities/Ticket';

describe('Ticket Entity', () => {
  const validTicketProps = {
    id: '123',
    title: 'Test Ticket',
    description: 'This is a test ticket',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    tags: ['bug', 'urgent'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('Constructor and Validation', () => {
    it('should create a valid ticket', () => {
      const ticket = new Ticket(validTicketProps);
      
      expect(ticket.id).toBe(validTicketProps.id);
      expect(ticket.title).toBe(validTicketProps.title);
      expect(ticket.description).toBe(validTicketProps.description);
      expect(ticket.status).toBe(validTicketProps.status);
      expect(ticket.priority).toBe(validTicketProps.priority);
      expect(ticket.tags).toEqual(validTicketProps.tags);
    });

    it('should throw error if title is empty', () => {
      const invalidProps = { ...validTicketProps, title: '' };
      expect(() => new Ticket(invalidProps)).toThrow('Title cannot be empty');
    });

    it('should throw error if title exceeds 200 characters', () => {
      const invalidProps = { ...validTicketProps, title: 'a'.repeat(201) };
      expect(() => new Ticket(invalidProps)).toThrow('Title cannot exceed 200 characters');
    });

    it('should throw error if description is empty', () => {
      const invalidProps = { ...validTicketProps, description: '' };
      expect(() => new Ticket(invalidProps)).toThrow('Description cannot be empty');
    });

    it('should throw error for invalid status', () => {
      const invalidProps = { ...validTicketProps, status: 'INVALID' as TicketStatus };
      expect(() => new Ticket(invalidProps)).toThrow('Invalid status');
    });

    it('should throw error for invalid priority', () => {
      const invalidProps = { ...validTicketProps, priority: 'INVALID' as TicketPriority };
      expect(() => new Ticket(invalidProps)).toThrow('Invalid priority');
    });

    it('should throw error if tags is not an array', () => {
      const invalidProps = { ...validTicketProps, tags: 'not-an-array' as any };
      expect(() => new Ticket(invalidProps)).toThrow('Tags must be an array');
    });
  });

  describe('Business Methods', () => {
    it('should update status correctly', () => {
      const ticket = new Ticket(validTicketProps);
      const originalUpdatedAt = ticket.updatedAt;
      
      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        ticket.updateStatus(TicketStatus.IN_PROGRESS);
        
        expect(ticket.status).toBe(TicketStatus.IN_PROGRESS);
        expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 10);
    });

    it('should throw error when updating to invalid status', () => {
      const ticket = new Ticket(validTicketProps);
      expect(() => ticket.updateStatus('INVALID' as TicketStatus)).toThrow('Invalid status');
    });

    it('should add tag correctly', () => {
      const ticket = new Ticket({ ...validTicketProps, tags: [] });
      
      ticket.addTag('new-tag');
      
      expect(ticket.tags).toContain('new-tag');
      expect(ticket.tags.length).toBe(1);
    });

    it('should not add duplicate tags', () => {
      const ticket = new Ticket({ ...validTicketProps, tags: ['existing'] });
      
      ticket.addTag('existing');
      
      expect(ticket.tags.length).toBe(1);
    });

    it('should throw error when adding empty tag', () => {
      const ticket = new Ticket(validTicketProps);
      expect(() => ticket.addTag('')).toThrow('Tag cannot be empty');
    });

    it('should remove tag correctly', () => {
      const ticket = new Ticket({ ...validTicketProps, tags: ['tag1', 'tag2'] });
      
      ticket.removeTag('tag1');
      
      expect(ticket.tags).not.toContain('tag1');
      expect(ticket.tags).toContain('tag2');
      expect(ticket.tags.length).toBe(1);
    });

    it('should handle removing non-existent tag gracefully', () => {
      const ticket = new Ticket({ ...validTicketProps, tags: ['tag1'] });
      
      ticket.removeTag('non-existent');
      
      expect(ticket.tags).toEqual(['tag1']);
    });
  });

  describe('Serialization', () => {
    it('should convert to JSON correctly', () => {
      const ticket = new Ticket(validTicketProps);
      const json = ticket.toJSON();
      
      expect(json.id).toBe(validTicketProps.id);
      expect(json.title).toBe(validTicketProps.title);
      expect(json.tags).toEqual(validTicketProps.tags);
      // Tags should be a copy, not reference
      expect(json.tags).not.toBe(ticket.tags);
    });

    it('should create from JSON correctly', () => {
      const jsonData = { ...validTicketProps };
      const ticket = Ticket.fromJSON(jsonData);
      
      expect(ticket.id).toBe(jsonData.id);
      expect(ticket.title).toBe(jsonData.title);
      expect(ticket.status).toBe(jsonData.status);
      expect(ticket.createdAt).toBeInstanceOf(Date);
      expect(ticket.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Immutability', () => {
    it('should return copy of tags, not reference', () => {
      const ticket = new Ticket(validTicketProps);
      const tags = ticket.tags;
      
      tags.push('modified');
      
      expect(ticket.tags).not.toContain('modified');
    });
  });
});
