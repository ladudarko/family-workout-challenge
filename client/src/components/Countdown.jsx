import React, { useEffect, useState } from 'react';

const Countdown = ({ endDate, startDate, label }) => {
  const calculate = () => {
    const now = new Date(); // Current time in UTC
    const dateString = endDate || startDate;
    
    if (!dateString) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    // Parse target date - if it includes timezone offset, it will be correctly converted to UTC
    // If no timezone, assume it's in EST/EDT and add the offset
    let targetDate;
    if (dateString.includes('-05:00') || dateString.includes('-04:00') || dateString.includes('+')) {
      // Has timezone, parse directly
      targetDate = new Date(dateString);
    } else {
      // No timezone specified - assume EST/EDT
      // November 2025: Daylight saving ends Nov 2, 2025, so Nov 26-28 will be EST (-05:00)
      const estOffset = '-05:00'; // EST for November
      targetDate = new Date(dateString + estOffset);
    }
    
    const diff = targetDate.getTime() - now.getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculate());

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(t);
  }, [endDate, startDate]);

  const displayLabel = label || (endDate ? 'Challenge ends in:' : 'Starts in:');
  
  return (
    <div style={{
      background: '#111',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '10px 14px',
      display: 'inline-block'
    }}>
      <strong>{displayLabel}</strong>
      <span style={{ marginLeft: 8 }}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default Countdown;


