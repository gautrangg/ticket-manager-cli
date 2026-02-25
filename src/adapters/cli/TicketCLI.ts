import { Command } from 'commander';
import { ITicketUseCases } from '../../ports/primary/ITicketUseCases';
import { TicketStatus, TicketPriority } from '../../domain/entities/Ticket';
import { TicketNotFoundError } from '../../domain/exceptions/TicketNotFoundError';
import { InvalidTicketError } from '../../domain/exceptions/InvalidTicketError';
import { DomainError } from '../../domain/exceptions/DomainError';

const EXIT_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1,
  NOT_FOUND: 2,
  SYSTEM_ERROR: 3
};

export class TicketCLI {
  private program: Command;

  constructor(private useCases: ITicketUseCases) {
    this.program = new Command();
    this.setupCommands();
  }

  private validateEnum<T>(
    value: string,
    enumType: object,
    fieldName: string
  ): string {
    const upper = value.toUpperCase();
    if (!Object.values(enumType).includes(upper)) {
      console.error(`Invalid ${fieldName}: ${value}`);
      console.error(`Valid options: ${Object.values(enumType).join(', ')}`);
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }
    return upper;
  }

  private handleError(error: unknown): void {
    if (error instanceof TicketNotFoundError) {
      console.error('❌ Error:', error.message);
      process.exit(EXIT_CODES.NOT_FOUND);
    } else if (error instanceof InvalidTicketError || error instanceof DomainError) {
      console.error('❌ Error:', error.message);
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    } else if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      process.exit(EXIT_CODES.SYSTEM_ERROR);
    } else {
      console.error('❌ Unknown error occurred');
      process.exit(EXIT_CODES.SYSTEM_ERROR);
    }
  }

  private setupCommands(): void {
    this.program
      .name('tickets')
      .description('CLI tool to manage tickets')
      .version('1.0.0');

    // Create command
    this.program
      .command('create')
      .description('Create a new ticket')
      .requiredOption('-t, --title <title>', 'Ticket title')
      .requiredOption('-d, --description <description>', 'Ticket description')
      .requiredOption('-p, --priority <priority>', 'Priority (LOW, MEDIUM, HIGH, CRITICAL)')
      .option('--tags <tags>', 'Comma-separated tags', '')
      .action(async (options) => {
        try {
          const priority = this.validateEnum(
            options.priority,
            TicketPriority,
            'priority'
          ) as TicketPriority;

          const tags = options.tags
            ? options.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [];

          const ticket = await this.useCases.createTicket({
            title: options.title,
            description: options.description,
            priority,
            tags
          });

          console.log('\n✅ Ticket created successfully!');
          console.log(`ID: ${ticket.id}`);
          console.log(`Title: ${ticket.title}`);
          console.log(`Priority: ${ticket.priority}`);
          console.log(`Status: ${ticket.status}`);
          if (tags.length > 0) {
            console.log(`Tags: ${tags.join(', ')}`);
          }
        } catch (error) {
          this.handleError(error);
        }
      });

    // List command
    this.program
      .command('list')
      .description('List all tickets')
      .option('-s, --status <status>', 'Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)')
      .option('-p, --priority <priority>', 'Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)')
      .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
      .action(async (options) => {
        try {
          const filter: {
            status?: TicketStatus;
            priority?: TicketPriority;
            tags?: string[];
          } = {};

          if (options.status) {
            filter.status = this.validateEnum(
              options.status,
              TicketStatus,
              'status'
            ) as TicketStatus;
          }

          if (options.priority) {
            filter.priority = this.validateEnum(
              options.priority,
              TicketPriority,
              'priority'
            ) as TicketPriority;
          }

          if (options.tags) {
            filter.tags = options.tags.split(',').map((t: string) => t.trim());
          }

          const tickets = await this.useCases.listTickets(filter);

          if (tickets.length === 0) {
            console.log('\nNo tickets found.');
            return;
          }

          console.log(`\nFound ${tickets.length} ticket(s):\n`);
          tickets.forEach(ticket => {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`ID:          ${ticket.id}`);
            console.log(`Title:       ${ticket.title}`);
            console.log(`Status:      ${ticket.status}`);
            console.log(`Priority:    ${ticket.priority}`);
            if (ticket.tags.length > 0) {
              console.log(`Tags:        ${ticket.tags.join(', ')}`);
            }
            console.log(`Created:     ${ticket.createdAt.toLocaleString()}`);
            console.log('');
          });
        } catch (error) {
          this.handleError(error);
        }
      });

    // Show command
    this.program
      .command('show <id>')
      .description('Show ticket details')
      .action(async (id: string) => {
        try {
          const ticket = await this.useCases.getTicketById(id);

          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`ID:          ${ticket.id}`);
          console.log(`Title:       ${ticket.title}`);
          console.log(`Description: ${ticket.description}`);
          console.log(`Status:      ${ticket.status}`);
          console.log(`Priority:    ${ticket.priority}`);
          if (ticket.tags.length > 0) {
            console.log(`Tags:        ${ticket.tags.join(', ')}`);
          }
          console.log(`Created:     ${ticket.createdAt.toLocaleString()}`);
          console.log(`Updated:     ${ticket.updatedAt.toLocaleString()}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } catch (error) {
          this.handleError(error);
        }
      });

    // Update command
    this.program
      .command('update <id>')
      .description('Update ticket status')
      .requiredOption('-s, --status <status>', 'New status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)')
      .action(async (id: string, options) => {
        try {
          const status = this.validateEnum(
            options.status,
            TicketStatus,
            'status'
          ) as TicketStatus;

          const ticket = await this.useCases.updateTicketStatus(id, status);

          console.log('\n✅ Ticket updated successfully!');
          console.log(`ID: ${ticket.id}`);
          console.log(`Title: ${ticket.title}`);
          console.log(`Status: ${ticket.status}`);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  run(argv?: string[]): void {
    this.program.parse(argv);
  }
}
