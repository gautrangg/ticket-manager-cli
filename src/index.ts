#!/usr/bin/env node

import { TicketService } from './domain/services/TicketService';
import { JsonTicketRepository } from './adapters/persistence/JsonTicketRepository';
import { TicketCLI } from './adapters/cli/TicketCLI';

// Dependency Injection - Wire everything together
const repository = new JsonTicketRepository('./data');
const ticketService = new TicketService(repository);
const cli = new TicketCLI(ticketService);

// Run CLI
cli.run(process.argv);
