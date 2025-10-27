import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeightTracker = ({ user }) => {
  const [weight, setWeight] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [weightHistory, setWeightHistory] = useState([]);
  const [initialWeight, setInitialWeight] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(null);

  useEffect(() => {
    fetchWeightHistory();
  }, []);

  useEffect(() => {
    fetchWeightForDate();
  }, [selectedDate]);

  const fetchWeightHistory = async () => {
    try {
      const response = await axios.get('/api/weight');
      setWeightHistory(response.data);
      
      // Find initial weight (first entry chronologically)
      if (response.data.length > 0) {
        const sortedWeights = [...response.data].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        setInitialWeight(sortedWeights[0].weight_lbs);
        setCurrentWeight(response.data[0].weight_lbs);
      }
    } catch (error) {
      console.error('Error fetching weight history:', error);
    }
  };

  const fetchWeightForDate = async () => {
    try {
      const response = await axios.get(`/api/weight/${selectedDate}`);
      if (response.data.weight_lbs) {
        setWeight(response.data.weight_lbs.toString());
      } else {
        setWeight('');
      }
    } catch (error) {
      setWeight('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weight || parseFloat(weight) <= 0) {
      setMessage('Please enter a valid weight');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/weight', {
        date: selectedDate,
        weight_lbs: parseFloat(weight)
      });

      setMessage('Weight logged successfully! 💪');
      fetchWeightHistory();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error logging weight');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeightLoss = () => {
    if (!initialWeight || !currentWeight) return null;
    
    const loss = initialWeight - currentWeight;
    const percentage = ((loss / initialWeight) * 100).toFixed(2);
    
    return { loss, percentage };
  };

  const weightLoss = calculateWeightLoss();

  return (
    <div className="card">
      <h3>⚖️ Daily Weight Tracker</h3>
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      {/* Weight Loss Summary */}
      {weightLoss && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '8px',
          border: '2px solid #2196F3'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976D2' }}>📊 Your Progress</h4>
          {weightLoss.loss > 0 ? (
            <>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                -{weightLoss.loss.toFixed(1)} lbs ({weightLoss.percentage}%)
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                Great progress! Keep it up! 🎉
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                {Math.abs(weightLoss.loss).toFixed(1)} lbs ({Math.abs(weightLoss.percentage)}%)
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                {weightLoss.loss < 0 ? 'Weight gain' : 'No change yet'}
              </p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="weight-date">Date</label>
          <input
            type="date"
            id="weight-date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (lbs)</label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            min="0"
            step="0.1"
            placeholder="Enter your weight"
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Saving...' : '💾 Save Weight'}
        </button>
      </form>

      {/* Weight History */}
      {weightHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Recent Entries</h4>
          <div className="activity-list" style={{ maxHeight: '200px' }}>
            {weightHistory.slice(0, 5).map((entry) => (
              <div key={entry.id} className="activity-item">
                <div className="activity-info">
                  <h4>{entry.weight_lbs.toFixed(1)} lbs</h4>
                  <p>{new Date(entry.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                </div>
                {entry.weight_lbs === initialWeight && (
                  <span style={{ color: '#2196F3', fontSize: '14px', fontWeight: 'bold' }}>
                    Initial
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightTracker;
