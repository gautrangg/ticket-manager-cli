#!/usr/bin/env node

import { TicketService } from './domain/services/TicketService';
import { JsonTicketRepository } from './adapters/persistence/JsonTicketRepository';
import { UuidIdGenerator } from './adapters/id-generation/UuidIdGenerator';
import { TicketCLI } from './adapters/cli/TicketCLI';

// Dependency Injection - Wire everything together
const repository = new JsonTicketRepository('./data');
const idGenerator = new UuidIdGenerator();
const ticketService = new TicketService(repository, idGenerator);
const cli = new TicketCLI(ticketService);

// Run CLI
cli.run(process.argv);
