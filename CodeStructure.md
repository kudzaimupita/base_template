# React TypeScript Code Style Guide

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Organization](#component-organization)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [Naming Conventions](#naming-conventions)
5. [Props and State](#props-and-state)
6. [Styling](#styling)
7. [Testing](#testing)
8. [Performance](#performance)

## Project Structure

```
src/
├── assets/          # Static files like images, fonts
├── components/      # Reusable components
│   ├── common/     # Shared components across features
│   └── features/   # Feature-specific components
├── config/         # Configuration files
├── constants/      # Constants and enums
├── hooks/          # Custom React hooks
├── layouts/        # Layout components
├── pages/          # Page components
├── services/       # API services
├── store/          # State management
├── styles/         # Global styles
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Component Organization

### File Structure

- One component per file
- File name should match component name
- Use `.tsx` extension for components
- Use `.ts` extension for non-component files

```typescript
// Button.tsx
import React from 'react';
import { ButtonProps } from './Button.types';
import { useButtonLogic } from './useButtonLogic';
import { StyledButton } from './Button.styles';

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  // Component logic
};
```

### Component Structure Order

1. Imports
2. Types/Interfaces
3. Constants
4. Component
5. Styles (if co-located)
6. Export

## TypeScript Guidelines

### Type Definitions

- Use interfaces for public API definitions
- Use type for unions, intersections, and mapped types
- Always define return types for functions

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Bad
type ButtonProps = {
  variant: string;
  size?: string;
  onClick: Function;
};
```

### Generic Types

- Use meaningful generic type names
- Constrain generic types when possible

```typescript
// Good
function getFirstElement<T>(array: T[]): T | undefined {
  return array[0];
}

// Bad
function getFirstElement<X>(array: X[]): X | undefined {
  return array[0];
}
```

## Naming Conventions

### Components

- Use PascalCase for component names
- Use camelCase for instance names
- Use PascalCase for interface names
- Use camelCase for function names

```typescript
// Components
const UserProfile: React.FC = () => {};

// Interfaces
interface UserProfileProps {}

// Functions
const handleClick = () => {};

// Variables
const userData = {};
```

## Props and State

### Props

- Use interface for props definition
- Make props readonly
- Use optional props sparingly

```typescript
interface CardProps {
  readonly title: string;
  readonly description?: string;
  readonly onAction: () => void;
}
```

### State

- Use appropriate state management
- Prefer local state when possible
- Document complex state logic

```typescript
const [isLoading, setIsLoading] = useState<boolean>(false);
const [data, setData] = useState<Data | null>(null);
```

## Styling

### CSS-in-JS

- Use styled-components or emotion
- Keep styles colocated with components
- Use theme tokens for consistency

```typescript
const StyledButton = styled.button<ButtonProps>`
  padding: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.primary};
`;
```

## Testing

### Test Structure

- One test file per component
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('Button', () => {
  it('should render with default props', () => {
    // Arrange
    const props = { onClick: jest.fn() };

    // Act
    render(<Button {...props} />);

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Performance

### Optimization Techniques

- Use React.memo for pure components
- Implement useMemo and useCallback appropriately
- Lazy load components when possible

```typescript
// Good
const MemoizedComponent = React.memo(({ prop1, prop2 }) => {
  return (
    <div>
      {prop1} {prop2}
    </div>
  );
});

// Lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));
```

## ESLint Configuration

```json
{
  "extends": ["airbnb", "airbnb-typescript", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "react/jsx-filename-extension": ["error", { "extensions": [".tsx"] }],
    "import/prefer-default-export": "off"
  }
}
```

Remember:

- This guide is meant to be a living document
- Team members can propose changes through pull requests
- Regular reviews ensure the guide stays current with best practices
- Automated tools should enforce these standards where possible

## Role-Based Responsibilities

### Developers

- Follow the established coding standards
- Write self-documenting code with appropriate comments
- Maintain component documentation
- Perform code reviews following these guidelines

### Tech Leads

- Enforce coding standards through review process
- Update guidelines as needed
- Provide guidance on architectural decisions
- Ensure proper implementation of performance optimizations

### QA Engineers

- Verify component behavior matches documentation
- Ensure test coverage meets standards
- Report inconsistencies in implementation

### DevOps

- Maintain ESLint and Prettier configurations
- Set up and maintain CI/CD pipelines
- Monitor performance metrics

This guide serves as a foundation for maintaining consistent, high-quality code across the project. All team members are expected to follow these guidelines and contribute to their improvement over time.
