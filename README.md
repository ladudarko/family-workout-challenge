# Family Workout Challenge App

A simple web application for families to track daily workout activities and compete with each other.

## Features

- 👤 **User Authentication**: Simple username/password system
- 📝 **Activity Logging**: Track various workout activities with duration and notes
- 📋 **Daily Checklist**: Complete daily health goals with points system
- 🏆 **Points-Based Leaderboard**: Compete with family using a fun points system
- 📊 **Progress Tracking**: View your activity history and daily achievements
- 📱 **Responsive Design**: Works on desktop and mobile devices

### 🎯 Points System

The app uses a competitive points system to keep everyone motivated:

**Daily Checklist Points:**
| Activity | Points |
|----------|--------|
| 30+ min workout | 10 points |
| Extra 15 min workout | +5 points |
| Family group workout | +10 points |
| Drink 82-100oz water | +5 points |
| 6+ hours sleep | +5 points |
| Hit a personal goal (PR, extra reps, etc.) | +10 points |

**Activity Logging:**
- Any logged activity = **10 points** (regardless of duration)

**Maximum daily points: 45 points** (checklist) + **10 points** (per activity) 🚀

### 🔐 Admin Access

The app includes a pre-configured admin account:
- **Username**: `admin`
- **Password**: `Summer12!`
- **Privileges**: Can view all family members' weight data
- **Display**: Shows a 👑 crown icon next to the admin's name

The admin dashboard shows:
- All family members' weight loss progress
- Percentage-based rankings (fair for different body sizes)
- #1 weight loss leader badge
- Initial vs current weight for each member

**Privacy**: Regular users can only see their own weight data.

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Authentication**: JWT tokens
- **Deployment**: Azure App Service

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Local Development

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cd server
   cp env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Production Deployment

See the complete deployment guide: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

### Quick Start

1. **Install Azure CLI and login**:
   ```bash
   az login
   ```

2. **Create Resource Group and Web App**:
   ```bash
   az group create --name workout-app-rg --location eastus
   az appservice plan create --name workout-app-plan --resource-group workout-app-rg --sku P0V3 --is-linux
   az webapp create --name family-workout-challenge --resource-group workout-app-rg --plan workout-app-plan --runtime "NODE:18-lts"
   ```
   
   **Note:** P0V3 = Premium V3 tier (~$50/month). Modern tier recommended for production.

3. **Set environment variables**:
   ```bash
   az webapp config appsettings set --name family-workout-challenge --resource-group workout-app-rg --settings JWT_SECRET="your-super-secret-key"
   ```

4. **Configure custom domain**: `workout.big6cloud.com`
   - Add CNAME record: `workout` → `family-workout-challenge.azurewebsites.net`
   - Enable SSL in Azure Portal

5. **Deploy your app** (see DEPLOYMENT_GUIDE.md for options)

#### Option 2: Docker Deployment

1. **Build and run with Docker**:
   ```bash
   docker build -t family-workout-app .
   docker run -p 3001:3001 -e JWT_SECRET="your-secret-key" family-workout-app
   ```

2. **Deploy to Azure Container Instances**:
   ```bash
   az container create --resource-group myResourceGroup --name workout-app --image family-workout-app --ports 3001
   ```

## Usage

1. **Login**: Use your credentials to access the dashboard
   - **Admin Account**: username: `admin`, password: `Summer12!`
   - **Regular Users**: Register new accounts or use existing credentials
2. **Daily Checklist**: Check off your daily health goals for points
3. **Weight Tracking**: Log your daily weight (private, only you and admin can see)
4. **Log Activities**: Add your workouts with type, duration, and notes
5. **View Progress**: Check your activity history and daily achievements
6. **Compete**: See how you rank against other family members on the points leaderboard!
7. **Sign Out**: Click the "Sign Out" button in the top right corner

### Daily Routine Example:
- ✅ Complete 30+ minute workout (+10 pts)
- ✅ Drink 82+ oz of water (+5 pts)
- ✅ Get 6+ hours of sleep (+5 pts)
- ✅ Hit a personal goal (+10 pts)
- **Total: 30 points for the day!** 🎉

## API Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/activities` - Add new activity
- `GET /api/activities` - Get user's activities
- `GET /api/daily-checklist` - Get daily checklist for a date
- `POST /api/daily-checklist` - Update daily checklist
- `GET /api/leaderboard` - Get family leaderboard with points
- `GET /api/profile` - Get user profile

## Customization

### Adding New Activity Types
Edit `client/src/components/ActivityForm.jsx` and add new options to the `activityTypes` array.

### Styling
All styles are in `client/src/index.css`. The app uses a modern gradient design that's easy to customize.

### Database
The app uses SQLite for simplicity. For larger deployments, consider migrating to Azure SQL Database or Cosmos DB.

## Security Notes

- Change the JWT_SECRET in production
- Consider adding HTTPS redirect
- Add rate limiting for production use
- For enterprise use, consider Azure AD B2C integration

## Support

This is a simple family app designed for personal use. For issues or questions, check the code comments or create an issue in your repository.

## License

MIT License - Feel free to modify and use for your family!

