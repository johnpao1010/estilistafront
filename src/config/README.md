# Environment Configuration

This directory contains the configuration files for different environments (development and production).

## Files Overview

- `environments.ts`: Main configuration file with environment settings
- `.env.development`: Development environment variables
- `.env.production`: Production environment variables

## How to Use

### Development Mode (Default)
When running locally (localhost), the app will automatically use the development configuration:

```bash
npm start
```

This will connect to: `http://localhost:3001/api/v1`

### Production Mode
To use the production backend, you have several options:

#### Option 1: Environment Variables
Create or modify `.env.production`:
```
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://salon-belleza-app-backend.onrender.com/api/v1
```

#### Option 2: Build for Production
```bash
npm run build
```

#### Option 3: Force Production Mode
You can temporarily force production mode by modifying the hostname detection or by setting a global variable in the browser console:
```javascript
window.__ENVIRONMENT__ = 'production'
```

## Configuration Details

### Development Environment
- **API URL**: `http://localhost:3001/api/v1`
- **Use Case**: Local development with local backend
- **Auto-detection**: localhost or 127.0.0.1

### Production Environment
- **API URL**: `https://salon-belleza-app-backend.onrender.com/api/v1`
- **Use Case**: Production deployment or testing with live backend
- **Auto-detection**: Any non-localhost hostname

## Switching Between Environments

### Quick Switch
The app automatically detects the environment based on the hostname:
- Localhost → Development
- Other domains → Production

### Manual Override
To manually override the environment detection:

1. **Via Environment Variable** (most reliable):
   ```bash
   REACT_APP_ENVIRONMENT=production npm start
   ```

2. **Via Browser Console** (temporary):
   ```javascript
   // Before page load
   window.__ENVIRONMENT__ = 'production'
   ```

## API Configuration

The API configuration is automatically loaded in `src/api/axios.ts`:

```typescript
import { config } from '../config/environments';
const API_BASE_URL = config.apiUrl;
```

## Environment Variables Available

- `REACT_APP_ENVIRONMENT`: 'development' | 'production'
- `REACT_APP_API_URL`: Full API base URL

## Troubleshooting

### Issues with Environment Detection
If the environment is not being detected correctly:

1. Check the browser console for environment logs
2. Verify the hostname in the URL bar
3. Try manual override using environment variables

### API Connection Issues
1. Ensure the backend is running (for development)
2. Check CORS settings on the backend
3. Verify the API URL is correct in the current environment

### Building for Production
When building for production deployment:

```bash
# This will use .env.production automatically
npm run build
```

The build will be optimized and will use the production API URL.
