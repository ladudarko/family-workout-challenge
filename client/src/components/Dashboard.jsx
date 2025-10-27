import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityForm from './ActivityForm';
import ActivityList from './ActivityList';
import Leaderboard from './Leaderboard';
import DailyChecklist from './DailyChecklist';
import WeightTracker from './WeightTracker';
import AdminWeights from './AdminWeights';

const Dashboard = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, leaderboardRes] = await Promise.all([
        axios.get('/api/activities'),
        axios.get('/api/leaderboard')
      ]);
      
      setActivities(activitiesRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdded = (newActivity) => {
    setActivities(prev => [newActivity, ...prev]);
    fetchData(); // Refresh leaderboard
  };

  const handleChecklistUpdated = () => {
    fetchData(); // Refresh leaderboard when checklist is updated
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-grid">
        <div>
          <DailyChecklist onChecklistUpdated={handleChecklistUpdated} />
          <WeightTracker user={user} />
        </div>

        <div>
          <ActivityForm onActivityAdded={handleActivityAdded} />
          <ActivityList activities={activities} />
        </div>

        <div>
          <Leaderboard leaderboard={leaderboard} />
        </div>
      </div>

      {user.is_admin && (
        <div style={{ marginTop: '30px' }}>
          <AdminWeights />
        </div>
      )}
    </div>
  );
};

export default Dashboard;

