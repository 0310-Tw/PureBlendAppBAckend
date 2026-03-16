USE pure_blend_smoothie_app;

INSERT INTO users (
    full_name,
    email,
    phone,
    password_hash,
    preferred_fulfillment,
    profile_image_url,
    is_active
) VALUES (
    'Demo User',
    'demo@pureblend.com',
    '876-555-0101',
    '$2b$10$REPLACE_WITH_REAL_BCRYPT_HASH',
    'delivery',
    NULL,
    1
);

INSERT INTO smoothies (name, description, category, image_url, is_featured, is_active)
VALUES
    ('Very Berry', NULL, 'Berry', 'assets/images/smoothies/very_berry.png', 1, 1),
    ('Tru Blue', NULL, 'Berry', 'assets/images/smoothies/tru_blue.png', 1, 1),
    ('Island Vibez', NULL, 'Tropical', 'assets/images/smoothies/island_vibez.png', 1, 1),
    ('Machine Green', NULL, 'Green', 'assets/images/smoothies/machine_green.png', 1, 1),
    ('Granola Punch', NULL, 'Protein', 'assets/images/smoothies/granola_punch.png', 0, 1),
    ('Rich Mango', NULL, 'Tropical', 'assets/images/smoothies/rich_mango.png', 1, 1),
    ('Energy Gaad', NULL, 'Energy', 'assets/images/smoothies/energy_gaad.png', 0, 1),
    ('Power Punch', NULL, 'Protein', 'assets/images/smoothies/power_punch.png', 0, 1);

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 700.00 FROM smoothies WHERE name = 'Very Berry';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 900.00 FROM smoothies WHERE name = 'Very Berry';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 700.00 FROM smoothies WHERE name = 'Tru Blue';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 900.00 FROM smoothies WHERE name = 'Tru Blue';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 700.00 FROM smoothies WHERE name = 'Island Vibez';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 900.00 FROM smoothies WHERE name = 'Island Vibez';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 800.00 FROM smoothies WHERE name = 'Machine Green';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 1000.00 FROM smoothies WHERE name = 'Machine Green';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 800.00 FROM smoothies WHERE name = 'Granola Punch';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 1000.00 FROM smoothies WHERE name = 'Granola Punch';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 700.00 FROM smoothies WHERE name = 'Rich Mango';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 900.00 FROM smoothies WHERE name = 'Rich Mango';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 800.00 FROM smoothies WHERE name = 'Energy Gaad';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 1000.00 FROM smoothies WHERE name = 'Energy Gaad';

INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'small', 800.00 FROM smoothies WHERE name = 'Power Punch';
INSERT INTO smoothie_sizes (smoothie_id, size_name, price)
SELECT id, 'large', 1000.00 FROM smoothies WHERE name = 'Power Punch';