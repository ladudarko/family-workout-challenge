import React, { useState } from 'react';
import axios from 'axios';
import { getCurrentDateEST } from '../utils/dateUtils';

const ActivityForm = ({ onActivityAdded }) => {
  const [formData, setFormData] = useState({
    activity_type: '',
    duration: '',
    notes: '',
    date: getCurrentDateEST()
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const activityTypes = [
    'Running',
    'Walking > 10 mins',
    'Cycling',
    'Swimming',
    'Weight Training',
    'Yoga',
    'Pilates',
    'Dancing',
    'Hiking',
    'Basketball',
    'Soccer',
    'Tennis',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/activities', {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : 0
      });

      setMessage('Activity added successfully! 🎉');
      onActivityAdded(response.data.activity);
      
      // Reset form
      setFormData({
        activity_type: '',
        duration: '',
        notes: '',
        date: getCurrentDateEST()
      });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error adding activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="activity-form">
      <h2>Log New Activity</h2>
      
      {message && (
        <div className={message.includes('successfully') ? 'success' : 'error'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="activity_type">Activity Type</label>
          <select
            id="activity_type"
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
            required
          >
            <option value="">Select an activity</option>
            {activityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="0"
            placeholder="Optional"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes about your workout..."
          />
        </div>

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Adding...' : 'Add Activity'}
        </button>
      </form>
    </div>
  );
};

export default ActivityForm;

