-- Update team logos based on files in public/logos folder

-- Update each team with their logo path
UPDATE teams SET logo = '/logos/aoili-logo.png' WHERE name = 'Aioli/Spirit Mas';
UPDATE teams SET logo = '/logos/wam-logo-square.svg' WHERE name = 'WAM';
UPDATE teams SET logo = '/logos/bliss-logo.png' WHERE name = 'Bliss';
UPDATE teams SET logo = '/logos/food-drop-logo.png' WHERE name = 'FoodDrop';
UPDATE teams SET logo = '/logos/full-barrel-logo.jpeg' WHERE name = 'Full Barrel';
UPDATE teams SET logo = '/logos/mini-bar-logo.webp' WHERE name = 'Mini Bar';

-- Verify the updates
SELECT 'Team logos updated:' as status;
SELECT 
  name,
  logo,
  active
FROM teams
WHERE active = true
ORDER BY name;

-- Show teams without logos (if any)
SELECT 'Teams without logos:' as status;
SELECT name 
FROM teams 
WHERE active = true 
  AND (logo IS NULL OR logo = '' OR logo = '/logos/README.md');