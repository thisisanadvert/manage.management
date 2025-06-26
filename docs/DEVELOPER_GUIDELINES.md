# Developer Guidelines - Manage.Management

**Last Updated:** 26 June 2025  
**Next Review:** 10 July 2025  
**Version:** 1.0

## Overview

This document provides essential guidelines for developing the Manage.Management platform. It covers coding standards, common patterns, and lessons learned from production issues.

## Technology Stack

### Core Technologies
- **Frontend:** React 18 with TypeScript
- **Build Tool:** Vite (NOT Create React App)
- **Styling:** Tailwind CSS
- **Backend:** Supabase
- **Deployment:** Netlify (auto-deploy from GitHub)
- **Icons:** Lucide React

### Key Dependencies
- React Router DOM for routing
- React Helmet Async for SEO
- Lucide React for icons
- Tailwind CSS for styling

## Environment Variables

### ⚠️ CRITICAL: Use Vite Syntax, NOT Create React App

```typescript
// ❌ WRONG - Create React App syntax
const apiUrl = process.env.REACT_APP_API_URL;
const nodeEnv = process.env.NODE_ENV;

// ✅ CORRECT - Vite syntax
const apiUrl = import.meta.env.VITE_API_URL;
const nodeEnv = import.meta.env.MODE;
```

### Environment Variable Naming
- Use `VITE_` prefix for custom variables (not `REACT_APP_`)
- Built-in Vite variables: `import.meta.env.MODE`, `import.meta.env.DEV`, `import.meta.env.PROD`

## Import/Export Standards

### Icon Imports
Always import ALL icons you use from lucide-react:

```typescript
// ✅ CORRECT - Import all icons used
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  User
} from 'lucide-react';

// ❌ WRONG - Missing imports will cause runtime errors
// Using CheckCircle2 without importing it
```

### Component Imports
Use consistent import patterns:

```typescript
// ✅ CORRECT - Absolute imports from src
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

// Prefer named exports for utilities
import { formatDate, calculateDays } from '../../utils/dateUtils';
```

## Code Quality Standards

### TypeScript Configuration
- Use strict mode enabled
- No implicit any types
- Prefer interfaces over types for object shapes
- Use proper typing for all props and state

### Component Structure
```typescript
// ✅ CORRECT component structure
interface ComponentProps {
  title: string;
  isVisible?: boolean;
  onClose: () => void;
}

const MyComponent: React.FC<ComponentProps> = ({ 
  title, 
  isVisible = false, 
  onClose 
}) => {
  // Component logic here
  return (
    <div>
      {/* JSX here */}
    </div>
  );
};

export default MyComponent;
```

## User Experience Standards

### British English
- Use British spelling throughout: "realise", "colour", "centre", "organisation"
- Apply to all user-facing text, comments, and documentation

### Number Inputs
- Default to zero
- Do not increment by 1 with arrows, allow for free text entry but ask for numbers
- Do not display with leading zeros (e.g., display '1' when user enters 1)

### Accessibility
- High contrast mode support
- Keyboard navigation
- Screen reader compatibility
- Focus management

## Authentication & User Management

### User Types
- RTM/RMC Director (combined)
- Homeowner (with Leaseholder and Share of Freeholders)
- Management Company
- Block Freeholders

### Super User Features
- frankie@manage.management has dev tools access
- Can switch between user types without reauthentication
- Has access to DevPanel component

## Common Patterns

### Error Handling
```typescript
// ✅ CORRECT - Proper error boundaries
try {
  await apiCall();
} catch (error) {
  console.error('Specific operation failed:', error);
  // Handle error appropriately
}
```

### State Management
```typescript
// ✅ CORRECT - Use proper state typing
const [isLoading, setIsLoading] = useState<boolean>(false);
const [user, setUser] = useState<User | null>(null);
```

## Deployment & Git Workflow

### Automatic Deployment
- All commits to `main` branch auto-deploy via Netlify
- Production app: app.manage.management
- Always push changes immediately after making them

### Commit Messages
Use descriptive commit messages:
```bash
# ✅ GOOD
git commit -m "Fix DevPanel environment variables for Vite compatibility"
git commit -m "Add CheckCircle2 import to RTMDashboard component"

# ❌ BAD
git commit -m "fix bug"
git commit -m "updates"
```

## Testing Guidelines

### Component Testing
- Test all user interactions
- Test error states
- Test loading states
- Mock external dependencies

### Integration Testing
- Test complete user workflows
- Test authentication flows
- Test data persistence

## Performance Guidelines

### Bundle Size
- Import only what you need from libraries
- Use dynamic imports for large components
- Optimise images and assets

### Runtime Performance
- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement proper loading states

## Security Guidelines

### Data Handling
- Never expose sensitive data in client-side code
- Use proper authentication checks
- Validate all user inputs
- Follow GDPR compliance requirements

### Environment Security
- Never commit environment files
- Use Supabase RLS (Row Level Security)
- Implement proper user permissions

## Common Pitfalls & Solutions

### Issue: `process is not defined`
**Cause:** Using Create React App syntax in Vite project  
**Solution:** Use `import.meta.env` instead of `process.env`

### Issue: `[Icon] is not defined`
**Cause:** Missing import from lucide-react  
**Solution:** Add icon to import statement

### Issue: TypeScript errors in production
**Cause:** Loose TypeScript configuration  
**Solution:** Enable strict mode and fix all type errors

## Resources

### Documentation
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Internal Resources
- Component Library: `src/components/ui/`
- Utility Functions: `src/utils/`
- Type Definitions: `src/types/`

## Review Schedule

This document is reviewed every 2 weeks to ensure it stays current with:
- New technology adoptions
- Lessons learned from production issues
- Team feedback and suggestions
- Industry best practices

**Next scheduled review:** 10 July 2025

---

*For questions or suggestions about these guidelines, please discuss with the development team.*
