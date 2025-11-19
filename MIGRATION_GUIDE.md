# 🔄 Migration Guide: From Basic to Enterprise

This guide will help you migrate your existing RFP application to use the new enterprise architecture.

---

## 📋 Migration Checklist

- [ ] Update main.jsx to TypeScript
- [ ] Migrate App.jsx to use new layout system
- [ ] Convert components to TypeScript
- [ ] Integrate Zustand state management
- [ ] Add error boundaries
- [ ] Implement React Router
- [ ] Use new design system components
- [ ] Add proper typing to all files

---

## Step 1: Rename and Convert Entry Point

### Before: `src/main.jsx`
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### After: `src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Action**: Rename `src/main.jsx` to `src/main.tsx` and update the code.

---

## Step 2: Migrate App Component

### Create new `src/App.tsx`:
```tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { RealRFPProcess } from './RealRFPProcess';
import { ROUTES } from './config/routes';

// Import other page components as they're created
// import { Dashboard } from './pages/Dashboard';
// import { RFPList } from './pages/RFPList';
// import { RFPDetail } from './pages/RFPDetail';

const App: React.FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path={ROUTES.DASHBOARD} element={<RealRFPProcess rfpId="RFP-2025-001" />} />

        {/* Add more routes as needed */}
        {/* <Route path={ROUTES.RFP.LIST} element={<RFPList />} /> */}
        {/* <Route path={ROUTES.RFP.DETAIL} element={<RFPDetail />} /> */}

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </AppLayout>
  );
};

export default App;
```

**Action**: Replace your existing `src/App.jsx` with the new structure.

---

## Step 3: Convert RealRFPProcess Component

### Migrate to TypeScript:

1. Rename `src/RealRFPProcess.jsx` to `src/RealRFPProcess.tsx`

2. Add type imports:
```tsx
import React, { useState, useEffect } from 'react';
import type { RFP } from './types';
import { Card, CardHeader, CardBody } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
```

3. Add prop types:
```tsx
interface RealRFPProcessProps {
  rfpId: string;
}

export const RealRFPProcess: React.FC<RealRFPProcessProps> = ({ rfpId }) => {
  // Component logic
};
```

4. Replace inline components with design system components:
```tsx
// Before:
<button className="bg-blue-600 text-white px-4 py-2 rounded-md">
  Approve
</button>

// After:
<Button variant="primary">
  Approve
</Button>
```

---

## Step 4: Integrate State Management

### Replace Firebase Context with Zustand:

#### Before (Firebase Context):
```jsx
const { db, userId } = useFirebase();
const [rfpData, setRfpData] = useState(null);
```

#### After (Zustand):
```tsx
import { useAppStore } from './store';
import { useRFP } from './hooks/useRFP';

const { currentRFP, setCurrentRFP } = useRFP();
const setIsLoading = useAppStore((state) => state.setIsLoading);
const setError = useAppStore((state) => state.setError);
```

---

## Step 5: Convert Service Files to TypeScript

### Migrate `src/services/AuthService.js` to `src/services/AuthService.ts`:

```typescript
import type { User } from '../types';

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';

  static async login(email: string, password: string): Promise<User> {
    // Implementation
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
```

---

## Step 6: Create Page Components

### Example: Dashboard Page

Create `src/pages/Dashboard.tsx`:
```tsx
import React from 'react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useRFP } from '../hooks/useRFP';
import { formatCurrency, formatDate } from '../utils/format';

export const Dashboard: React.FC = () => {
  const { rfps } = useRFP();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your RFP management platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Total RFPs" />
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">{rfps.length}</p>
          </CardBody>
        </Card>

        {/* Add more dashboard cards */}
      </div>
    </div>
  );
};
```

---

## Step 7: Update Vite Configuration

### Modify `vite.config.js` to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@config': path.resolve(__dirname, './src/config'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          state: ['zustand'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
});
```

---

## Step 8: Add Index File for UI Components

Create `src/components/ui/index.ts`:
```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card, CardHeader, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';
```

This allows for cleaner imports:
```tsx
import { Button, Card, Input } from '@components/ui';
```

---

## Step 9: Progressive Migration Strategy

You don't have to migrate everything at once. Follow this order:

### Phase 1 (Week 1): Foundation
- [x] Set up TypeScript configuration
- [x] Create type definitions
- [x] Set up Zustand store
- [x] Create design system components
- [x] Add error boundaries
- [x] Set up routing

### Phase 2 (Week 2): Core Components
- [ ] Migrate main App component
- [ ] Convert RealRFPProcess to TypeScript
- [ ] Create Dashboard page
- [ ] Migrate service files

### Phase 3 (Week 3): Features
- [ ] Convert all remaining components
- [ ] Implement forms with react-hook-form
- [ ] Add API integration with axios
- [ ] Implement authentication flow

### Phase 4 (Week 4): Testing & Polish
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Performance optimization
- [ ] Documentation

---

## Common Migration Patterns

### Pattern 1: Component Props
```tsx
// Before (JavaScript)
export function MyComponent({ title, onSave }) {
  // ...
}

// After (TypeScript)
interface MyComponentProps {
  title: string;
  onSave: (data: SomeType) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // ...
};
```

### Pattern 2: State with Types
```tsx
// Before
const [data, setData] = useState(null);

// After
const [data, setData] = useState<RFP | null>(null);
```

### Pattern 3: Event Handlers
```tsx
// Before
const handleClick = (e) => {
  // ...
};

// After
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};
```

### Pattern 4: API Calls
```tsx
// Before
const fetchData = async () => {
  const response = await fetch('/api/rfps');
  const data = await response.json();
  return data;
};

// After
const fetchData = async (): Promise<RFP[]> => {
  const response = await fetch('/api/rfps');
  const data: RFP[] = await response.json();
  return data;
};
```

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Check your `tsconfig.json` path mappings and ensure all imports use the correct paths.

### Issue: Type errors in existing JavaScript files
**Solution**: Migrate one file at a time. You can use `// @ts-nocheck` at the top of files you haven't migrated yet.

### Issue: Tailwind classes not working
**Solution**: Ensure you're importing `./index.css` in your main.tsx and that Tailwind is properly configured.

### Issue: State not persisting
**Solution**: Check that you've wrapped your app with the correct providers and that Zustand persist is configured.

---

## Testing Your Migration

### 1. Type Safety
```bash
npm run type-check
```
Should complete with no errors.

### 2. Linting
```bash
npm run lint
```
Should pass with no errors or warnings.

### 3. Build
```bash
npm run build
```
Should create an optimized production build.

### 4. Development Server
```bash
npm run dev
```
Application should run without errors.

---

## Next Steps After Migration

1. **Add Unit Tests**: Test individual components and utilities
2. **Add Integration Tests**: Test feature workflows
3. **Add E2E Tests**: Test complete user journeys
4. **Performance Monitoring**: Add analytics and monitoring
5. **Documentation**: Create user and developer documentation
6. **CI/CD**: Set up automated testing and deployment

---

## Questions or Issues?

Refer to:
- [ENTERPRISE_UPGRADE_SUMMARY.md](ENTERPRISE_UPGRADE_SUMMARY.md) - Overview of all upgrades
- [ARCHITECTURE_SUMMARY.md](ARCHITECTURE_SUMMARY.md) - System architecture details
- [ENTERPRISE_DEPLOYMENT_GUIDE.md](ENTERPRISE_DEPLOYMENT_GUIDE.md) - Deployment instructions

---

**Good luck with your migration! 🚀**
