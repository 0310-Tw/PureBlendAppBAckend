CREATE DATABASE IF NOT EXISTS pure_blend_smoothie_app;
USE pure_blend_smoothie_app;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_fulfillment ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
    profile_image_url VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_admin TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

USE pure_blend_smoothie_app;
DESCRIBE users;

USE pure_blend_smoothie_app;

SELECT id, full_name, email, is_active, is_admin
FROM users;

USE pure_blend_smoothie_app;

SELECT COUNT(*) AS total_users FROM users;

SELECT id, full_name, email, is_active, is_admin
FROM users;

USE pure_blend_smoothie_app;

UPDATE users
SET is_admin = 1
WHERE email = 'tarick@gmail.com';

SELECT id, full_name, email, is_active, is_admin
FROM users
WHERE email = 'tarick@gmail.com';

USE pure_blend_smoothie_app;

INSERT INTO users (
    full_name,
    email,
    phone,
    password_hash,
    preferred_fulfillment,
    profile_image_url,
    is_active,
    is_admin
) VALUES (
    'Tarick Admin',
    'tarick@gmail.com',
    '8768447038',
    '$2a$10$HJqXCB5GHUGrSHjLek3LzeZFQK4yLDJ.xItOKadLXhS6TwkRYheQO',
    'delivery',
    NULL,
    1,
    1
);

USE pure_blend_smoothie_app;

SELECT id, full_name, email, is_active, is_admin
FROM users;


SELECT id, full_name, email, is_admin
FROM users
WHERE email = 'tarick@gmail.com';

UPDATE users
SET password_hash = '$2a$10$y3DFhdxbc.8Og1Yp4Hr0z.BhdpxvqJXvRPtwpZJLA7LyNyqhVNGWi'
WHERE email = 'tarick@gmail.com';

SELECT id, email, is_admin
FROM users
WHERE email = 'tarick@gmail.com';
USE pure_blend_smoothie_app;
DESCRIBE smoothies;

USE pure_blend_smoothie_app;
CREATE TABLE IF NOT EXISTS smoothies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category ENUM('Berry', 'Tropical', 'Green', 'Energy', 'Protein') NOT NULL,
    image_url VARCHAR(255) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_available TINYINT(1) NOT NULL DEFAULT 1,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS smoothie_sizes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    smoothie_id INT UNSIGNED NOT NULL,
    size_name ENUM('small', 'large') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_smoothie_size (smoothie_id, size_name),
    CONSTRAINT fk_smoothie_sizes_smoothie
        FOREIGN KEY (smoothie_id) REFERENCES smoothies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO smoothies (name, description, price, category, image_url, is_featured, is_available, is_active)
VALUES
('Tru Blue', 'Blueberry banana smoothie', 850.00, 'Berry', '', 1, 1, 1),
('Island Vibez', 'Tropical fruit smoothie', 900.00, 'Tropical', '', 1, 1, 1),
('Mango Rich', 'Mango smoothie', 875.00, 'Tropical', '', 0, 1, 1);

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', price FROM smoothies
WHERE name IN ('Tru Blue', 'Island Vibez', 'Mango Rich')
ON DUPLICATE KEY UPDATE price = VALUES(price);

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', price + 200 FROM smoothies
WHERE name IN ('Tru Blue', 'Island Vibez', 'Mango Rich')
ON DUPLICATE KEY UPDATE price = VALUES(price);

SHOW TABLES;

SELECT * FROM smoothies;
SELECT * FROM smoothie_sizes;

USE pure_blend_smoothie_app;
SHOW TABLES;
SELECT COUNT(*) AS total FROM smoothies;

USE pure_blend_smoothie_app;
INSERT INTO smoothies (name, description, price, category, image_url, is_featured, is_available, is_active)
VALUES
('Tru Blue', 'Blueberry banana smoothie', 850.00, 'Berry', '', 1, 1, 1),
('Island Vibez', 'Tropical fruit smoothie', 900.00, 'Tropical', '', 1, 1, 1),
('Mango Rich', 'Rich mango smoothie', 875.00, 'Tropical', '', 0, 1, 1),
('Green Machine', 'Spinach and fruit green smoothie', 825.00, 'Green', '', 0, 1, 1),
('Peanut Power', 'Protein smoothie with peanut flavor', 950.00, 'Protein', '', 0, 1, 1);
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', price
FROM smoothies;
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', price + 200
FROM smoothies;
SELECT COUNT(*) AS total FROM smoothies;
SELECT COUNT(*) AS total FROM smoothie_sizes;
SELECT * FROM smoothies;
SELECT * FROM smoothie_sizes;

SELECT id, name, category, price FROM smoothies ORDER BY id;
USE pure_blend_smoothie_app;
DESCRIBE users;