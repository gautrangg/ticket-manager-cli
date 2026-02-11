import { Command } from 'commander';
import { TicketService } from '../../domain/services/TicketService';
import { TicketStatus, TicketPriority } from '../../domain/entities/Ticket';

export class TicketCLI {
  private program: Command;

  constructor(private ticketService: TicketService) {
    this.program = new Command();
    this.setupCommands();
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
          const priority = options.priority.toUpperCase() as TicketPriority;
          
          if (!Object.values(TicketPriority).includes(priority)) {
            console.error(`Invalid priority: ${options.priority}`);
            console.error(`Valid options: ${Object.values(TicketPriority).join(', ')}`);
            process.exit(1);
          }

          const tags = options.tags
            ? options.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [];

          const ticket = await this.ticketService.createTicket({
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
          console.error('❌ Error:', (error as Error).message);
          process.exit(1);
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
          const filter: any = {};

          if (options.status) {
            const status = options.status.toUpperCase() as TicketStatus;
            if (!Object.values(TicketStatus).includes(status)) {
              console.error(`Invalid status: ${options.status}`);
              process.exit(1);
            }
            filter.status = status;
          }

          if (options.priority) {
            const priority = options.priority.toUpperCase() as TicketPriority;
            if (!Object.values(TicketPriority).includes(priority)) {
              console.error(`Invalid priority: ${options.priority}`);
              process.exit(1);
            }
            filter.priority = priority;
          }

          if (options.tags) {
            filter.tags = options.tags.split(',').map((t: string) => t.trim());
          }

          const tickets = await this.ticketService.listTickets(filter);

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
          console.error('❌ Error:', (error as Error).message);
          process.exit(1);
        }
      });

    // Show command
    this.program
      .command('show <id>')
      .description('Show ticket details')
      .action(async (id: string) => {
        try {
          const ticket = await this.ticketService.getTicketById(id);

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
          console.error('❌ Error:', (error as Error).message);
          process.exit(1);
        }
      });

    // Update command
    this.program
      .command('update <id>')
      .description('Update ticket status')
      .requiredOption('-s, --status <status>', 'New status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)')
      .action(async (id: string, options) => {
        try {
          const status = options.status.toUpperCase() as TicketStatus;
          
          if (!Object.values(TicketStatus).includes(status)) {
            console.error(`Invalid status: ${options.status}`);
            console.error(`Valid options: ${Object.values(TicketStatus).join(', ')}`);
            process.exit(1);
          }

          const ticket = await this.ticketService.updateTicketStatus(id, status);

          console.log('\n✅ Ticket updated successfully!');
          console.log(`ID: ${ticket.id}`);
          console.log(`Title: ${ticket.title}`);
          console.log(`Status: ${ticket.status}`);
        } catch (error) {
          console.error('❌ Error:', (error as Error).message);
          process.exit(1);
        }
      });
  }

  run(argv?: string[]): void {
    this.program.parse(argv);
  }
}
