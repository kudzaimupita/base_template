# Simplified Slot ID System for Component Views

## Problem Solved

Previously, virtual slot IDs were unpredictable chains like:
- `main-layout-1754999160968-container-1754999160951-slot-1754999160953`

This made it impossible for AI to reliably target slots in component views.

## Solution

**Slots now keep their original IDs**, making them predictable and easy to reference.

## How It Works

### 1. Component View Definition
```json
{
  "id": "header-layout",
  "layout": [
    {
      "i": "logo-slot",
      "componentId": "slot",
      "name": "Logo Area"
    },
    {
      "i": "nav-slot", 
      "componentId": "slot",
      "name": "Navigation Area"
    }
  ]
}
```

### 2. Using Component View
```json
{
  "i": "page-header",
  "componentId": "header-layout",
  "isComponentView": true
}
```

### 3. Placing Elements in Slots ✅

**BEFORE (Complex):**
```json
{
  "i": "my-logo",
  "componentId": "text",
  "parent": "page-header-logo-slot",  // Hard to predict!
  "configuration": { "text": "My Company" }
}
```

**AFTER (Simple):**
```json
{
  "i": "my-logo",
  "componentId": "text", 
  "parent": "logo-slot",             // Use original slot ID!
  "configuration": { "text": "My Company" }
}
```

## AI Usage Guidelines

### ✅ DO: Use Original Slot IDs
```json
{
  "parent": "logo-slot"      // Simple, predictable
}
```

### ❌ DON'T: Try to Build Complex IDs  
```json
{
  "parent": "header-component-123-logo-slot"  // Don't do this!
}
```

## Conflict Resolution

If multiple component instances use the same view:
- **First instance**: Slots keep original IDs (`logo-slot`)
- **Subsequent instances**: Get prefixed IDs (`header-2-logo-slot`)

The system automatically handles conflicts and logs them:
```
[Virtual Slot] Slot ID conflict: logo-slot already used by header-1, using header-2-logo-slot for header-2
```

## Debug Utilities

Available in browser console:
- `window.getSlotId(componentId, slotId)` - Get actual slot ID to use
- `window.clearSlotRegistry()` - Clear slot registry
- `window.clearViewCaches()` - Clear all caches including slots

## Benefits

1. **Predictable**: AI can always use original slot IDs
2. **Simple**: No complex ID chaining
3. **Conflict-Safe**: Automatic handling of multiple instances  
4. **Debuggable**: Clear logging and utilities
5. **Backward Compatible**: Existing elements continue to work

## Real Example

```json
{
  "layout": [
    {
      "i": "main-layout-instance",
      "componentId": "main-layout", 
      "isComponentView": true
    },
    {
      "i": "cart-content",
      "componentId": "container",
      "parent": "content-slot",        // ← Uses original slot ID!
      "children": ["cart-header", "cart-items"]
    }
  ]
}
```

The `content-slot` from the `main-layout` view is now directly referenceable! 🎉 