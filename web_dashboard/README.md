# AOPTool Web Dashboard

AI-Powered Autonomous Penetration Testing Platform - Web Interface

## Overview

The AOPTool Web Dashboard is a modern, responsive React/Next.js application that provides a complete web interface for managing penetration testing operations. It features AI-powered attack planning, real-time execution monitoring, and comprehensive evidence management.

## Features

### 🎯 Core Features

- **AI-Powered Attack Planning** - Natural language to attack sequence translation
- **Real-Time Monitoring** - Live execution tracking with auto-refresh
- **Target Management** - CRUD operations with scope validation
- **Attack Library** - Browse 30 pre-configured attack techniques
- **Evidence Browser** - View and download collected evidence
- **JWT Authentication** - Secure login with token-based auth

### 🎨 UI/UX

- Dark theme optimized for security operations
- Responsive design (mobile, tablet, desktop)
- Real-time updates with SWR polling
- Toast notifications for all actions
- Accessible (ARIA labels, keyboard navigation)

## Tech Stack

- **Framework:** Next.js 14 (Pages Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3
- **State Management:** SWR for server state, React Context for UI state
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Notifications:** React Hot Toast

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend services running (Control Plane on port 8000, Intelligence Plane on port 5000)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start:prod
```

The dashboard will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_CONTROL_API=http://localhost:8000
NEXT_PUBLIC_INTELLIGENCE_API=http://localhost:5000
```

## Project Structure

```
web_dashboard/
├── src/
│   ├── pages/              # Next.js pages (routes)
│   │   ├── index.tsx       # Dashboard
│   │   ├── login.tsx       # Login page
│   │   ├── targets/        # Target management
│   │   ├── attacks/        # Attack library
│   │   ├── plans/          # Attack planning
│   │   ├── executions/     # Execution monitoring
│   │   ├── evidence/       # Evidence browser
│   │   └── settings/       # Settings (whitelist)
│   │
│   ├── components/
│   │   ├── layout/         # Layout components
│   │   ├── common/         # Reusable UI components
│   │   ├── dashboard/      # Dashboard-specific components
│   │   ├── targets/        # Target components
│   │   ├── attacks/        # Attack components
│   │   ├── plans/          # Plan components
│   │   ├── executions/     # Execution components
│   │   └── evidence/       # Evidence components
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   ├── useTargets.ts   # Targets data fetching
│   │   ├── useAttacks.ts   # Attacks data fetching
│   │   ├── usePlans.ts     # Plans data fetching
│   │   ├── useExecutions.ts # Executions with real-time updates
│   │   └── useEvidence.ts  # Evidence data fetching
│   │
│   ├── lib/
│   │   ├── api.ts          # API client (Axios)
│   │   ├── auth.ts         # JWT token management
│   │   ├── utils.ts        # Helper functions
│   │   └── constants.ts    # Constants and config
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── target.ts
│   │   ├── attack.ts
│   │   ├── plan.ts
│   │   ├── execution.ts
│   │   ├── evidence.ts
│   │   ├── auth.ts
│   │   └── api.ts
│   │
│   └── styles/
│       └── globals.css     # Global styles + Tailwind
│
├── public/                 # Static assets
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Key Pages

### Dashboard (`/`)
- System health status (Control Plane, Intelligence Plane)
- Statistics overview (targets, plans, executions, evidence)
- Recent executions timeline
- Quick actions

### Targets (`/targets`)
- List all targets with filtering
- Create new targets with validation
- Edit/delete targets
- View target details with associated plans/executions

### Attack Library (`/attacks`)
- Browse 30 attack techniques
- Filter by category and risk level
- View attack details and execution history

### Attack Planning (`/plans/new`)
- **AI Mode:** Natural language input → attack sequence
- **Manual Mode:** Drag-and-drop attack selection
- View reasoning and estimated duration
- Create and approve plans

### Executions (`/executions`)
- List all executions with real-time updates
- Filter by status
- Live monitoring dashboard (`/executions/monitor`)
- View execution details with streaming logs

### Evidence (`/evidence`)
- Browse collected evidence files
- Filter by type
- View file details and download

## Authentication

Default credentials:
- **Username:** admin
- **Password:** Admin@2025!Secure

JWT tokens are stored in localStorage and automatically attached to API requests.

## Real-Time Updates

The dashboard uses SWR with polling for real-time updates:

- **Dashboard stats:** 10 seconds
- **Executions list:** 5 seconds
- **Running execution details:** 3 seconds
- **Evidence:** 30 seconds

## API Integration

All API calls are centralized in `src/lib/api.ts`:

### Control Plane (port 8000)
- Authentication (`/token`)
- Targets CRUD (`/targets`)
- Scope whitelist (`/scope/whitelist`)
- Attack plans (`/attack_plans`)
- Executions (`/attack_executions`)
- Evidence (`/evidence`)

### Intelligence Plane (port 5000)
- AI translation (`/translate`)
- Attack library (`/attacks`)
- Execution history (`/history/{attack_id}`)

## Development

### Adding a New Page

1. Create page file in `src/pages/`
2. Create TypeScript types in `src/types/`
3. Create API methods in `src/lib/api.ts`
4. Create custom hook in `src/hooks/`
5. Create components in `src/components/`
6. Add navigation link to `src/components/layout/Sidebar.tsx`

### Styling Guidelines

- Use Tailwind utility classes for styling
- Follow dark theme color scheme (defined in `tailwind.config.js`)
- Use custom classes from `globals.css` (e.g., `card`, `btn-primary`, `badge`)
- Ensure responsive design with Tailwind breakpoints

### Type Safety

All API responses are typed. Add new types to `src/types/` and import them:

```typescript
import type { Target } from '@/types/target'
```

## Building for Production

```bash
# Build
npm run build

# Start production server
npm run start:prod
```

For Docker deployment:
```bash
docker build -t aoptool-dashboard .
docker run -p 3000:3000 aoptool-dashboard
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Security Considerations

- **JWT Storage:** Tokens stored in localStorage (consider httpOnly cookies for production)
- **XSS Protection:** All user inputs are sanitized
- **CSRF:** SameSite cookie attribute recommended
- **CSP Headers:** Implemented in `_document.tsx`
- **Input Validation:** All forms use Zod schemas

## Performance Optimization

- Code splitting (automatic with Next.js)
- SWR caching and deduplication
- Memoization for expensive computations
- Image optimization (Next.js Image component)
- Lazy loading for heavy components

## Troubleshooting

### "Connection refused" errors
Check that backend services are running:
```bash
curl http://localhost:8000/health
curl http://localhost:5000/health
```

### "401 Unauthorized"
Token may have expired. Logout and login again.

### Real-time updates not working
Check SWR configuration in hooks. Ensure `refreshInterval` is set.

## Contributing

1. Follow TypeScript best practices
2. Use ESLint for code quality
3. Write meaningful commit messages
4. Test all changes locally before committing

## License

See main project LICENSE file.

## Support

For issues and questions, refer to the main AOPTool documentation or create an issue on GitHub.
