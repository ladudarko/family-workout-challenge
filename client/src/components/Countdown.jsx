import React, { useEffect, useState } from 'react';

const Countdown = ({ endDate }) => {
  const calculate = () => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
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
  }, [endDate]);

  return (
    <div style={{
      background: '#111',
      color: '#fff',
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '10px 14px',
      display: 'inline-block'
    }}>
      <strong>Challenge ends in:</strong>
      <span style={{ marginLeft: 8 }}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default Countdown;


