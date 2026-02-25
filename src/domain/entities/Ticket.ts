import { InvalidTicketError } from '../exceptions/InvalidTicketError';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TicketProps {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Ticket {
  private props: TicketProps;

  constructor(props: TicketProps) {
    this.validate(props);
    this.props = { ...props };
  }

  private validate(props: TicketProps): void {
    if (!props.title || props.title.trim().length === 0) {
      throw new InvalidTicketError('Title cannot be empty');
    }

    if (props.title.length > 200) {
      throw new InvalidTicketError('Title cannot exceed 200 characters');
    }

    if (!props.description || props.description.trim().length === 0) {
      throw new InvalidTicketError('Description cannot be empty');
    }

    if (props.description.length > 5000) {
      throw new InvalidTicketError('Description cannot exceed 5000 characters');
    }

    if (!Object.values(TicketStatus).includes(props.status)) {
      throw new InvalidTicketError(`Invalid status: ${props.status}`);
    }

    if (!Object.values(TicketPriority).includes(props.priority)) {
      throw new InvalidTicketError(`Invalid priority: ${props.priority}`);
    }

    if (!Array.isArray(props.tags)) {
      throw new InvalidTicketError('Tags must be an array');
    }

    for (const tag of props.tags) {
      if (!/^[a-z0-9-]+$/.test(tag)) {
        throw new InvalidTicketError(`Invalid tag format: ${tag}`);
      }
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get status(): TicketStatus {
    return this.props.status;
  }

  get priority(): TicketPriority {
    return this.props.priority;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods
  updateStatus(newStatus: TicketStatus): void {
    if (!Object.values(TicketStatus).includes(newStatus)) {
      throw new InvalidTicketError(`Invalid status: ${newStatus}`);
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    if (!tag || tag.trim().length === 0) {
      throw new InvalidTicketError('Tag cannot be empty');
    }
    if (!/^[a-z0-9-]+$/.test(tag)) {
      throw new InvalidTicketError(`Invalid tag format: ${tag}`);
    }
    if (!this.props.tags.includes(tag)) {
      this.props.tags.push(tag);
      this.props.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    const index = this.props.tags.indexOf(tag);
    if (index > -1) {
      this.props.tags.splice(index, 1);
      this.props.updatedAt = new Date();
    }
  }

  // Convert to plain object for persistence
  toJSON(): TicketProps {
    return {
      ...this.props,
      tags: [...this.props.tags]
    };
  }

  // Factory method to create from plain object
  static fromJSON(data: TicketProps): Ticket {
    return new Ticket({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    });
  }
}
