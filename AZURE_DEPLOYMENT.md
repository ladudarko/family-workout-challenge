# Azure App Service Configuration

# This file contains Azure-specific configuration for deploying the Family Workout Challenge app

## Deployment Options

### Option 1: Azure App Service (Recommended)
1. Create a new Web App in Azure Portal
2. Choose Node.js runtime stack
3. Deploy using GitHub Actions or Azure CLI

### Option 2: Azure Container Instances
1. Build Docker image
2. Push to Azure Container Registry
3. Deploy container instance

### Option 3: Azure Static Web Apps (Frontend only)
1. Deploy React frontend to Static Web Apps
2. Use Azure Functions for backend API

## Environment Variables for Production
- JWT_SECRET: Generate a strong secret key
- NODE_ENV: production
- PORT: 3001 (or let Azure set this)

## Database Considerations
- Current setup uses SQLite (file-based)
- For production, consider Azure SQL Database or Cosmos DB
- SQLite works fine for small family apps

## Security Notes
- Change JWT_SECRET in production
- Consider adding HTTPS redirect
- Add rate limiting for API endpoints
- Consider Azure AD B2C for authentication

