---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear and concise description of what you expected to happen.

## Actual Behavior

A clear and concise description of what actually happened.

## Environment

- **Library Version**: [e.g. 1.0.0]
- **Angular Version**: [e.g. 18.0.0]
- **Browser**: [e.g. Chrome 120, Firefox 118]
- **OS**: [e.g. Windows 11, macOS 14, Ubuntu 22.04]
- **Node.js Version**: [e.g. 18.17.0]

## Configuration

```typescript
// Your idle detection configuration
const config = {
  idleTimeout: 15 * 60 * 1000,
  warningTimeout: 2 * 60 * 1000,
  // ... other config
};
```

## Code Sample

```typescript
// Minimal code sample that reproduces the issue
import { IdleOAuthService } from '@idle-detection/angular-oauth-integration';

// Your code here
```

## Error Messages

```
// Paste any error messages, stack traces, or console output here
```

## Screenshots

If applicable, add screenshots to help explain your problem.

## Additional Context

Add any other context about the problem here.

## Possible Solution

If you have ideas on how to fix the issue, please describe them here.

## Checklist

- [ ] I have searched for similar issues before creating this one
- [ ] I have provided all the required information above
- [ ] I have tested this with the latest version of the library
- [ ] I am willing to work on a fix for this issue