# Enterprise Assistant - Frontend

A Next.js-based multi-agent AI platform with workspace integrations for Jira, Asana, HubSpot, and Linear.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running backend server (Express) on port 3003

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with AuthProvider
│   ├── page.tsx             # Landing page
│   └── dashboard/           # Protected dashboard routes
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Main chat interface
│       ├── integrations/    # Workspace integrations
│       ├── agents/          # Agent management
│       ├── history/         # Conversation history
│       └── settings/        # User settings
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Navbar, Sidebar
│   ├── chat/               # Chat interface components
│   ├── agents/             # Agent-related components
│   └── integrations/       # Integration components
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication state
├── store/                  # Zustand stores
│   ├── chatStore.ts       # Chat state management
│   ├── agentStore.ts      # Agent state management
│   └── integrationStore.ts # Integration state
├── lib/                    # Utilities
│   ├── api.ts             # API client
│   └── utils.ts           # Helper functions
└── types/                  # TypeScript types
    └── index.ts           # Shared type definitions
```

## 🎨 Features

### 1. **Multi-Agent Chat System**
- Real-time conversation interface
- Multiple specialized AI agents (Project Manager, Sales Analyst, Data Scientist)
- Agent selection and management
- Message history with timestamps

### 2. **Workspace Integrations**
- Jira integration
- Asana integration
- HubSpot integration
- Linear integration
- Connection status and management

### 3. **Authentication**
- AWS Cognito integration via backend
- Session-based authentication
- Protected routes
- User profile management

### 4. **Agent Management**
- View all available agents
- Toggle agent activation
- View agent capabilities
- Configure agent settings

## 🔧 Technologies Used

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React
- **Authentication**: AWS Cognito (via backend)

## 📝 API Endpoints

The frontend communicates with the Express backend on port 3003:

- `GET /api/auth/status` - Check authentication status
- `GET /api/user` - Get current user info
- `GET /login` - Redirect to Cognito login
- `GET /logout` - Logout and clear session
- `POST /api/chat` - Send chat message to agents
- `GET /api/integrations` - Get available integrations

## 🎯 Development

### Adding New Components

Components are organized by feature:
- UI components: `components/ui/`
- Feature components: `components/[feature]/`
- Layout components: `components/layout/`

### Adding New Pages

Pages use the Next.js App Router:
- Public pages: `app/`
- Protected pages: `app/dashboard/`

### State Management

The app uses Zustand for state management:
- Chat state: `store/chatStore.ts`
- Agent state: `store/agentStore.ts`
- Integration state: `store/integrationStore.ts`

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

## 🚢 Building for Production

```bash
npm run build
npm start
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is part of the AWS Enterprise Assistant platform.
