# Ticket Manager CLI

A command-line tool to manage tickets, built with **Hexagonal Architecture** (Ports & Adapters pattern) using TypeScript.

## 🎯 Project Overview

This project demonstrates the application of Hexagonal Architecture principles to build a maintainable and testable CLI application. Tickets are stored locally in JSON files.

### Features
- Create tickets with title, description, priority, and tags
- List tickets with filters (status, priority, tags)
- Show detailed ticket information
- Update ticket status
- Add/remove tags from tickets
- Delete tickets

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (also known as Ports & Adapters):

```
┌─────────────────────────────────────────────────┐
│              Primary Adapters                   │
│         (CLI - Commander.js)                    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              Primary Ports                      │
│         (Use Case Interfaces)                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Domain Layer (Core)                   │
│  • Ticket Entity (business rules)               │
│  • TicketService (business logic)               │
│  • No dependencies on infrastructure            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            Secondary Ports                      │
│       (Repository Interfaces)                   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Secondary Adapters                    │
│      (JsonTicketRepository)                     │
└─────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── domain/              # Core business logic (framework-independent)
│   ├── entities/        # Domain models (Ticket)
│   └── services/        # Business logic (TicketService)
├── ports/               # Interfaces (contracts)
│   ├── primary/         # Input ports (use cases)
│   └── secondary/       # Output ports (repositories)
└── adapters/            # Infrastructure implementations
    ├── cli/             # CLI adapter (Commander.js)
    └── persistence/     # JSON file storage adapter

tests/
└── domain/              # Unit tests for domain logic
```

### Key Principles Applied

1. **Dependency Inversion**: Domain defines interfaces, adapters implement them
2. **Separation of Concerns**: Business logic separate from infrastructure
3. **Testability**: Domain can be tested without real adapters (using mocks)
4. **Flexibility**: Easy to swap adapters (e.g., JSON → Database)

## 📋 Prerequisites

- Node.js >= 16.x
- npm >= 8.x

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ticket-manager-cli.git
cd ticket-manager-cli
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the project

```bash
npm run build
```

### 4. (Optional) Link for global usage

```bash
npm link
```

After linking, you can use `tickets` command anywhere.

## 💻 Usage

### Create a ticket

```bash
# Basic usage
npm run dev create -- -t "Fix login bug" -d "Users cannot login with email" -p HIGH

# With tags
npm run dev create -- -t "Add dark mode" -d "Implement dark theme" -p MEDIUM --tags "feature,ui"

# After npm link
tickets create -t "Fix login bug" -d "Users cannot login" -p HIGH
```

**Options:**
- `-t, --title <title>`: Ticket title (required)
- `-d, --description <description>`: Ticket description (required)
- `-p, --priority <priority>`: Priority - LOW, MEDIUM, HIGH, CRITICAL (required)
- `--tags <tags>`: Comma-separated tags (optional)

### List tickets

```bash
# List all tickets
npm run dev list

# Filter by status
npm run dev list -- --status OPEN

# Filter by priority
npm run dev list -- --priority HIGH

# Filter by tags
npm run dev list -- --tags bug,urgent

# Combine filters
npm run dev list -- --status IN_PROGRESS --priority CRITICAL
```

**Filter options:**
- `-s, --status <status>`: OPEN, IN_PROGRESS, RESOLVED, CLOSED
- `-p, --priority <priority>`: LOW, MEDIUM, HIGH, CRITICAL
- `-t, --tags <tags>`: Comma-separated tags

### Show ticket details

```bash
npm run dev show <ticket-id>

# Example
npm run dev show 123e4567-e89b-12d3-a456-426614174000
```

### Update ticket status

```bash
npm run dev update <ticket-id> -- --status IN_PROGRESS

# Example
npm run dev update 123e4567-e89b-12d3-a456-426614174000 -- --status RESOLVED
```

**Available statuses:**
- `OPEN`: Ticket is open
- `IN_PROGRESS`: Work in progress
- `RESOLVED`: Issue resolved
- `CLOSED`: Ticket closed

## 🧪 Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

Coverage threshold is set to 80% for:
- Branches
- Functions
- Lines
- Statements

## 🏛️ Hexagonal Architecture Explained

### Why Hexagonal Architecture?

1. **Business Logic Protection**: Domain layer is pure, no framework dependencies
2. **Easy Testing**: Can test business logic without infrastructure
3. **Flexibility**: Easy to change adapters (CLI → Web API, JSON → Database)
4. **Maintainability**: Clear boundaries between layers

### Example: Dependency Flow

```typescript
// ❌ WRONG: Domain depends on infrastructure
class TicketService {
  private repo = new JsonTicketRepository(); // Direct dependency!
}

// ✅ CORRECT: Domain depends on interface (port)
class TicketService {
  constructor(private repo: ITicketRepository) {} // Interface dependency
}

// Adapter implements the interface
class JsonTicketRepository implements ITicketRepository {
  // Implementation details
}
```

### Testing with Mocks

```typescript
// Domain can be tested without real file I/O
class MockRepository implements ITicketRepository {
  private tickets = new Map();
  async save(ticket: Ticket) { this.tickets.set(ticket.id, ticket); }
  // ... other methods
}

const mockRepo = new MockRepository();
const service = new TicketService(mockRepo); // No file system needed!
```

## 📁 Data Storage

Tickets are stored in `data/tickets.json` as a JSON array. The file is created automatically on first use.

Example data structure:
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Fix login bug",
    "description": "Users cannot login with email",
    "status": "OPEN",
    "priority": "HIGH",
    "tags": ["bug", "urgent"],
    "createdAt": "2026-02-11T10:30:00.000Z",
    "updatedAt": "2026-02-11T10:30:00.000Z"
  }
]
```

## 🔧 Development

### Project structure

```
ticket-manager-cli/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Ticket.ts          # Ticket entity with validation
│   │   └── services/
│   │       └── TicketService.ts   # Business logic
│   ├── ports/
│   │   ├── primary/               # Use case interfaces (future)
│   │   └── secondary/
│   │       └── ITicketRepository.ts  # Repository contract
│   ├── adapters/
│   │   ├── cli/
│   │   │   └── TicketCLI.ts       # Commander.js CLI
│   │   └── persistence/
│   │       └── JsonTicketRepository.ts  # JSON storage
│   └── index.ts                   # Entry point & DI setup
├── tests/
│   └── domain/
│       ├── Ticket.test.ts         # Entity tests
│       └── TicketService.test.ts  # Service tests with mocks
├── data/                          # JSON storage
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Adding a new adapter

Want to use PostgreSQL instead of JSON? Easy!

1. Create `PostgresTicketRepository.ts` implementing `ITicketRepository`
2. Update `src/index.ts`:
   ```typescript
   const repository = new PostgresTicketRepository(config);
   // No changes needed in domain or CLI!
   ```

## 🎓 Learning Resources

- [Hexagonal Architecture by Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Ports & Adapters Pattern](https://herbertograca.com/2017/09/14/ports-adapters-architecture/)

## 📝 Week 2 Assignment

This project fulfills the Week 2 requirements:

- ✅ Hexagonal Architecture applied correctly
  - Domain layer is independent
  - Ports (interfaces) defined clearly
  - Adapters implement ports
  - Dependency injection used
  
- ✅ CLI functions working
  - `tickets create` ✓
  - `tickets list` with filters ✓
  - `tickets show <id>` ✓
  - `tickets update <id>` ✓
  
- ✅ Core domain testable without real adapters
  - Mock repository used in tests ✓
  - No file I/O in domain tests ✓
  
- ✅ Unit tests for domain logic
  - Ticket entity tests ✓
  - TicketService tests ✓
  - 80%+ coverage ✓
  
- ✅ Documentation
  - Setup instructions ✓
  - Usage examples ✓
  - Architecture explained ✓

## 📄 License

MIT

## 👤 Author

Le Thanh Cong