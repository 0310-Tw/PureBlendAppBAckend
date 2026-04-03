ALTER TABLE users
ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;

UPDATE users
SET is_admin = 1
WHERE email = 'tarick@gamil.com';