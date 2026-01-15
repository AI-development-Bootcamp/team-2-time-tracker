# Tech Stack

## Backend

### Core
| Library | Purpose |
|---------|---------|
| Node.js | Runtime |
| TypeScript | Type safety |
| Express.js | Web framework |

### Database
| Library | Purpose |
|---------|---------|
| PostgreSQL | Database |
| Prisma | ORM & migrations |

### Authentication
| Library | Purpose |
|---------|---------|
| jsonwebtoken | JWT tokens |
| bcrypt | Password hashing |
| cookie-parser | HTTP-only cookies |

### Security
| Library | Purpose |
|---------|---------|
| helmet | Secure headers |
| express-rate-limit | Rate limiting |
| cors | Cross-origin requests |

### Utilities
| Library | Purpose |
|---------|---------|
| Zod | Validation |
| axios | HTTP client |
| multer | File uploads |
| dotenv | Environment variables |
| Winston / Pino | Logging |
| swagger-ui-express | API docs UI |
| swagger-jsdoc | API docs generation |
| uuid | Unique ID generation |
| date-fns | Date calculations |

### Testing
| Library | Purpose |
|---------|---------|
|  Vitest | Test runner |

---

## Frontend

### Core
| Library | Purpose |
|---------|---------|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |

### UI
| Library | Purpose |
|---------|---------|
| Radix UI | Component primitives |
| lucide-react | Icons |
| Native CSS (BEM) | Styling |

### State & Data
| Library | Purpose |
|---------|---------|
| Zustand | Global state |
| TanStack Query | Server state & caching |
| TanStack Table | Data tables |

### Forms
| Library | Purpose |
|---------|---------|
| react-hook-form | Form management |
| @hookform/resolvers | Zod integration |
| Zod | Validation |

### Utilities
| Library | Purpose |
|---------|---------|
| React Router | Routing |
| axios | HTTP client |
| date-fns | Date handling (Hebrew locale) |
| react-dropzone | File uploads |
| react-day-picker | Date picker component |

### Testing
| Library | Purpose |
|---------|---------|
| vitest | Test runner |
| React Testing Library | Component tests |

---

## Shared

| Library | Purpose |
|---------|---------|
| DTOs (shared folder) | Type definitions |
| Zod | Shared schemas |

---

## Infrastructure

| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI |
| Render  | CD |
