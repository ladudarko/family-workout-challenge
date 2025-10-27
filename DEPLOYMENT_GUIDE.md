# Azure Deployment Guide - Family Workout Challenge

This guide will help you deploy your Family Workout Challenge app to Azure with custom domain support.

## Prerequisites

- Azure account (free tier works)
- Azure CLI installed
- Domain: `big6cloud.com` with subdomain `workout.big6cloud.com`

## Deployment Steps

### 1. Install Azure CLI (if not already installed)

**For macOS:**
```bash
brew install azure-cli
```

**For Windows:**
Download from: https://aka.ms/installazurecliwindows

**For Linux:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### 2. Login to Azure

```bash
az login
```

This will open a browser window for authentication.

### 2.5. Register Required Providers

If you get a "subscription is not registered" error, register the Microsoft.Web provider:

```bash
az provider register --namespace Microsoft.Web
```

Wait for registration to complete (can take a few minutes):
```bash
az provider show -n Microsoft.Web --query "registrationState"
```

Wait until it shows `"Registered"` instead of `"Registering"`.

### 3. Create a Resource Group

```bash
az group create --name workout-app-rg --location eastus
```

### 4. Create an App Service Plan

```bash
az appservice plan create \
  --name workout-app-plan \
  --resource-group workout-app-rg \
  --sku P0V3 \
  --is-linux
```

**Note:** **IMPORTANT**: Premium V3 tiers (P0V3, P1V3, etc.) require a quota increase request. If you get a quota error, use Basic tier instead.

P0V3 is Premium V3 tier (~$50/month). For production, this tier provides:
- Modern infrastructure (not legacy)
- Better performance and reliability
- Auto-scaling capabilities
- Staging slots for deployments
- Daily backups
- SSL certificates
- Better CPU and memory performance than legacy tiers

**Alternative options:**
- `P0V3` = Premium V3 (~$50/month) - Modern, recommended for production
- `P1V3` = Premium V3 (~$146/month) - For higher traffic
- `B1` = Basic tier (~$13/month) - Legacy, good for testing only

### 5. Create Web App

```bash
az webapp create \
  --name family-workout-challenge \
  --resource-group workout-app-rg \
  --plan workout-app-plan \
  --runtime "NODE:18-lts"
```

### 6. Configure Environment Variables

```bash
# Set JWT secret (IMPORTANT: Change this to a strong random string)
az webapp config appsettings set \
  --name family-workout-challenge \
  --resource-group workout-app-rg \
  --settings JWT_SECRET="your-super-secure-jwt-secret-key-change-this" \
              NODE_ENV="production"
```

### 7. Deploy Your App

**Option A: Using GitHub Actions (Recommended)**

1. Push your code to a GitHub repository
2. In Azure Portal, go to your Web App → Deployment Center
3. Select GitHub as source
4. Authorize and select your repository
5. Azure will automatically deploy on every push

**Option B: Using Azure CLI**

```bash
# From your project root directory
cd server
npm install --production
cd ../client
npm install
npm run build

# Deploy the built files
az webapp up bs\
  --name family-workout-challenge \
  --resource-group workout-app-rg \
  --location eastus
```

**Option C: Using zip deployment**

```bash
# Build the app
cd client
npm install
npm run build

cd ../server
npm install --production

# Create deployment package
cd ..
zip -r deploy.zip . -x "node_modules/*" -x ".git/*"

# Deploy
az webapp deployment source config-zip \
  --resource-group workout-app-rg \
  --name family-workout-challenge \
  --src deploy.zip
```

### 8. Configure Custom Domain

#### A. Add Custom Domain in Azure Portal

1. Go to Azure Portal → Your Web App
2. Click on "Custom domains"
3. Click "Add custom domain"
4. Enter: `workout.big6cloud.com`
5. Click "Validate"

#### B. Configure DNS Records

Add a CNAME record in your DNS provider (where you manage big6cloud.com):

```
Type: CNAME
Name: workout
Value: family-workout-challenge.azurewebsites.net
TTL: 3600
```

**Important:** The value should be your Azure Web App hostname (check it in Azure Portal).

#### C. Verify SSL Certificate

Azure provides free SSL certificates for your custom domain:

1. In Custom Domains section, click on your domain
2. Click "Add binding"
3. Select "SNI SSL" (free)
4. Click "Add"
5. Wait for SSL certificate provisioning (can take a few minutes)

### 9. Configure Node.js Startup Command

In Azure Portal → Your Web App → Configuration → General settings:

Add startup command:
```bash
node server/index.js
```

Or create a `web.config` file in the server directory:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="index.js" verb="*" modules="iisnode"/>
    </hand habituels>
    <rewrite>
      <rules>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="index.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode watchedFiles="*.js;node_modules\*;views\*"/>
  </system.webServer>
</configuration>
```

### 10. Test Your Deployment

Visit your custom domain:
```
https://workout.big6cloud.com
```

## Post-Deployment Checklist

- [ ] App loads correctly on custom domain
- [ ] SSL certificate is active (HTTPS works)
- [ ] Admin login works (admin / Summer12!)
- [ ] Users can register and log in
- [ ] Activities can be logged
- [ ] Weight tracking works
- [ ] Leaderboard displays correctly
- [ ] Database persists data

## Database Management

The app uses SQLite which is stored on the server. For production, consider:

1. **Azure SQL Database** - Managed SQL Server
2. **Cosmos DB** - NoSQL database
3. **Azure Database for PostgreSQL**

For now, SQLite works fine for a small family app.

## Backup and Monitoring

1. Set up automated backups in Azure Portal
2. Enable Application Insights for monitoring
3. Configure alerts for downtime

## Troubleshooting

### App not loading
- Check Application Insights logs
- Verify environment variables
- Ensure startup command is set

### Database errors
- Check file permissions for SQLite database
- Verify database file is being created

### Custom domain not working
- Verify DNS CNAME record points to correct Azure hostname
- Wait up to 48 hours for DNS propagation
- Check SSL certificate status

## Cost Estimation

- **Premium V3 P0V3 Plan**: ~$50/month
- **Custom Domain SSL**: Free (managed by Azure)
- **Data Transfer**: Free for first 5GB/month
- **Estimated Total**: ~$50-60/month

**Note:** P0V3 is the modern Premium tier with better performance than legacy tiers. It's actually cheaper than the old Standard S1 tier!

## Support Resources

- Azure Portal: https://portal.azure.com
- Azure CLI Docs: https://docs.microsoft.com/cli/azure
- App Service Docs: https://docs.microsoft.com/azure/app-service

## Quick Command Reference

```bash
# Check deployment status
az webapp deployment list-publishing-profiles --name family-workout-challenge --resource-group workout-app-rg

# View logs
az webapp log tail --name family-workout-challenge --resource-group workout-app-rg

# Stop app
az webapp stop --name family-workout-challenge --resource-group workout-app-rg

# Start app
az webapp start --name family-workout-challenge --resource-group workout-app-rg

# Delete everything (careful!)
az group delete --name workout-app-rg --yes
```
