import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { parseDateEST } from '../utils/dateUtils';

const AdminWeights = () => {
  const [allWeights, setAllWeights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllWeights();
  }, []);

  const fetchAllWeights = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/weights');
      
      // Organize by user
      const userWeights = {};
      response.data.forEach(entry => {
        if (!userWeights[entry.user_id]) {
          userWeights[entry.user_id] = {
            name: entry.name,
            username: entry.username,
            weights: []
          };
        }
        userWeights[entry.user_id].weights.push(entry);
      });

      // Calculate weight loss percentage for each user
      Object.keys(userWeights).forEach(userId => {
        const user = userWeights[userId];
        const sortedWeights = [...user.weights].sort((a, b) => 
          parseDateEST(a.date) - parseDateEST(b.date)
        );
        
        if (sortedWeights.length > 0) {
          user.initialWeight = sortedWeights[0].weight_lbs;
          user.currentWeight = sortedWeights[sortedWeights.length - 1].weight_lbs;
          user.weightLoss = user.initialWeight - user.currentWeight;
          user.percentageLoss = ((user.weightLoss / user.initialWeight) * 100).toFixed(2);
        }
      });

      setAllWeights(Object.values(userWeights));
    } catch (error) {
      console.error('Error fetching weights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h3>Loading weight data...</h3>
      </div>
    );
  }

  if (allWeights.length === 0) {
    return null;
  }

  // Sort by percentage loss (descending)
  const sortedUsers = [...allWeights].sort((a, b) => 
    (b.percentageLoss || 0) - (a.percentageLoss || 0)
  );

  return (
    <div className="card">
      <h3>👑 Admin Dashboard: Weight Progress</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        See all family members' weight loss percentage
      </p>

      <div style={{ display: 'grid', gap: '15px' }}>
        {sortedUsers.map((user, index) => (
          <div 
            key={user.username}
            style={{ 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '2px solid #667eea'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0' }}>{user.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>@{user.username}</p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                {user.weightLoss !== undefined && (
                  <>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: user.weightLoss >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {user.weightLoss >= 0 ? '-' : '+'}{Math.abs(user.weightLoss).toFixed(1)} lbs
                    </div>
                    <div style={{ 
                      fontSize: '1.2rem',
                      color: user.weightLoss >= 0 ? '#28a745' : '#dc3545'
                    }}>
                      {user.percentageLoss}%
                    </div>
                  </>
                )}
              </div>
            </div>

            {user.initialWeight && user.currentWeight && (
              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px solid #dee2e6',
                fontSize: '14px',
                color: '#666'
              }}>
                <span>Initial: {user.initialWeight.toFixed(1)} lbs</span>
                <span style={{ margin: '0 10px' }}>→</span>
                <span>Current: {user.currentWeight.toFixed(1)} lbs</span>
              </div>
            )}

            {/* Rank badge */}
            {index === 0 && user.weightLoss > 0 && (
              <div style={{
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#ffd700',
                color: '#333',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                🥇 #1 Weight Loss Leader!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminWeights;
