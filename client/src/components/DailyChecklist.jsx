import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentDateEST, formatDateEST } from '../utils/dateUtils';

const DailyChecklist = ({ onChecklistUpdated }) => {
  const [checklist, setChecklist] = useState({
    workout_30min: false,
    workout_extra_15min: false,
    family_group_workout: false,
    water_82oz: false,
    sleep_6hours: false,
    personal_goal_hit: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(getCurrentDateEST());
  const [isCompleted, setIsCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetchChecklist();
  }, [selectedDate]);

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(`/api/daily-checklist?date=${selectedDate}`);
      setChecklist(response.data);
      setIsCompleted(response.data.is_completed || false);
      setTotalPoints(response.data.total_points || 0);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    }
  };

  const handleCheckboxChange = async (field) => {
    if (isCompleted) return; // Don't allow changes if completed
    
    const newChecklist = {
      ...checklist,
      [field]: !checklist[field]
    };
    
    setChecklist(newChecklist);
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/daily-checklist', {
        date: selectedDate,
        ...newChecklist
      });

      setMessage('Checklist updated! 🎉');
      onChecklistUpdated(response.data.checklist);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating checklist');
      // Revert the change on error
      setChecklist(checklist);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/daily-checklist/complete', {
        date: selectedDate,
        ...checklist
      });

      setIsCompleted(true);
      setTotalPoints(response.data.total_points);
      setMessage('Daily checklist completed! 🎉');
      onChecklistUpdated(response.data.checklist);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error completing checklist');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = () => {
    return (
      (checklist.workout_30min ? 10 : 0) +
      (checklist.workout_extra_15min ? 5 : 0) +
      (checklist.family_group_workout ? 10 : 0) +
      (checklist.water_82oz ? 5 : 0) +
      (checklist.sleep_6hours ? 5 : 0) +
      (checklist.personal_goal_hit ? 10 : 0)
    );
  };

  const checklistItems = [
    {
      key: 'workout_30min',
      label: '30+ min workout',
      points: 10,
      emoji: '💪'
    },
    {
      key: 'workout_extra_15min',
      label: 'Extra 15 min workout',
      points: 5,
      emoji: '⚡'
    },
    {
      key: 'family_group_workout',
      label: 'Family group workout',
      points: 10,
      emoji: '👨‍👩‍👧‍👦'
    },
    {
      key: 'water_82oz',
      label: 'Drink 82-100oz water',
      points: 5,
      emoji: '💧'
    },
    {
      key: 'sleep_6hours',
      label: '6+ hours sleep',
      points: 5,
      emoji: '😴'
    },
    {
      key: 'personal_goal_hit',
      label: 'Hit a personal goal (PR, extra reps, etc.)',
      points: 10,
      emoji: '🎯'
    }
  ];

  return (
    <div className="card">
      <h3>📋 Daily Checklist</h3>
      
      <div className="form-group">
        <label htmlFor="checklist-date">Date</label>
        <input
          type="date"
          id="checklist-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      </div>

      {message && (
        <div className={message.includes('updated') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      {/* Points Display Box */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '12px',
        border: '2px solid #667eea',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#667eea', margin: '0 0 10px 0' }}>
          🏆 Your Points
        </h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
          {isCompleted ? (checklist.total_points || 0) : calculatePoints()}
        </div>
        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
          {isCompleted ? 'Daily checklist completed!' : 'Complete items to earn points'}
        </p>
      </div>

      <div className="checklist-container">
        {checklistItems.map((item) => (
          <div key={item.key} className="checklist-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={() => handleCheckboxChange(item.key)}
                disabled={loading || isCompleted}
                className="checkbox-input"
              />
              <span className="checkbox-custom">
                {checklist[item.key] && <span className="checkmark">✓</span>}
              </span>
              <span className="checkbox-text">
                <span className="checkbox-emoji">{item.emoji}</span>
                <span className="checkbox-label-text">{item.label}</span>
                <span className="checkbox-points">+{item.points} pts</span>
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      {!isCompleted && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="btn"
            style={{ 
              width: '100%', 
              fontSize: '18px',
              padding: '15px',
              backgroundColor: '#28a745'
            }}
          >
            {loading ? 'Completing...' : '✅ Complete Daily Checklist'}
          </button>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
            Lock in your points for today! 🎯
          </p>
        </div>
      )}

      {isCompleted && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          <strong style={{ color: '#155724' }}>✅ Daily Checklist Completed!</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#155724' }}>
            Great job! You earned {checklist.total_points || 0} points today! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyChecklist;
