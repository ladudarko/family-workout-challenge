import React from 'react';

const Leaderboard = ({ leaderboard }) => {
  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (leaderboard.length === 0) {
    return (
      <div className="leaderboard">
        <h3>Family Leaderboard</h3>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No activities yet. Be the first to log an activity! 🏃‍♀️
        </p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h3>Family Leaderboard</h3>
      <div>
        {leaderboard.map((member, index) => (
          <div key={member.username} className="leaderboard-item">
            <div className="rank">
              {getRankIcon(index)}
            </div>
            <div className="user-info">
              <h4>{member.name}</h4>
              <p>@{member.username}</p>
            </div>
            <div className="stats">
              <span className="stat">
                <span className="stat-value">{member.total_points || 0}</span> total points
              </span>
              <span className="stat">
                <span className="stat-value">{member.total_activities}</span> activities
              </span>
              <span className="stat">
                <span className="stat-value">{member.active_days}</span> active days
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;

