import React from 'react';

const ActivityList = ({ activities }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (activities.length === 0) {
    return (
      <div className="card">
        <h3>Your Activities</h3>
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          No activities logged yet. Start your fitness journey! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Your Recent Activities</h3>
      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-info">
              <h4>{activity.activity_type}</h4>
              <p>{formatDate(activity.date)}</p>
              {activity.notes && (
                <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                  {activity.notes}
                </p>
              )}
            </div>
            <div className="stats">
              {activity.duration > 0 && (
                <span className="stat-value">{formatDuration(activity.duration)}</span>
              )}
              {activity.points > 0 && (
                <span className="stat-value" style={{ color: '#28a745', marginLeft: '8px' }}>
                  +{activity.points} pts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityList;

