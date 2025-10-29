-- Reset Leo's daily checklist points to correct values
UPDATE daily_checklist 
SET total_points = 35 
WHERE user_id = (SELECT id FROM users WHERE name = 'Leo') 
AND date = '2025-10-27' 
AND is_completed = 1;

UPDATE daily_checklist 
SET total_points = 15 
WHERE user_id = (SELECT id FROM users WHERE name = 'Leo') 
AND date = '2025-10-28' 
AND is_completed = 1;

-- Verify the changes
SELECT u.name, dc.date, dc.total_points, dc.is_completed 
FROM daily_checklist dc 
JOIN users u ON dc.user_id = u.id 
WHERE u.name = 'Leo' 
ORDER BY dc.date DESC;
