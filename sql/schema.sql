DROP DATABASE IF EXISTS pure_blend_smoothie_app;
CREATE DATABASE pure_blend_smoothie_app;
USE pure_blend_smoothie_app;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_fulfillment ENUM('delivery', 'pickup') NOT NULL DEFAULT 'delivery',
    profile_image_url VARCHAR(255) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE smoothies (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    category ENUM('Berry', 'Tropical', 'Green', 'Energy', 'Protein') NOT NULL,
    image_url VARCHAR(255) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE smoothie_sizes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    smoothie_id INT UNSIGNED NOT NULL,
    size_name ENUM('small', 'large') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_smoothie_size (smoothie_id, size_name),
    CONSTRAINT fk_smoothie_sizes_smoothie
        FOREIGN KEY (smoothie_id) REFERENCES smoothies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_smoothie_size_price CHECK (price >= 0)
) ENGINE=InnoDB;

CREATE TABLE favorites (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    smoothie_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_favorite (user_id, smoothie_id),
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_favorites_smoothie
        FOREIGN KEY (smoothie_id) REFERENCES smoothies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE addresses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    label VARCHAR(50) NOT NULL,
    recipient_name VARCHAR(100) NULL,
    recipient_phone VARCHAR(20) NULL,
    street_address VARCHAR(150) NOT NULL,
    town VARCHAR(100) NOT NULL,
    parish VARCHAR(100) NOT NULL,
    delivery_notes TEXT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_addresses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

CREATE TABLE cart_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    smoothie_id INT UNSIGNED NOT NULL,
    size_name ENUM('small', 'large') NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_smoothie
        FOREIGN KEY (smoothie_id) REFERENCES smoothies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_cart_items_unit_price CHECK (unit_price >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

CREATE TABLE orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT UNSIGNED NOT NULL,
    address_id INT UNSIGNED NULL,
    fulfillment_type ENUM('delivery', 'pickup') NOT NULL,
    payment_method ENUM('cash_on_delivery', 'pay_at_pickup', 'card') NOT NULL,
    order_notes TEXT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_orders_address
        FOREIGN KEY (address_id) REFERENCES addresses(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_orders_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_orders_delivery_fee CHECK (delivery_fee >= 0),
    CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED NOT NULL,
    smoothie_id INT UNSIGNED NOT NULL,
    smoothie_name VARCHAR(100) NOT NULL,
    size_name ENUM('small', 'large') NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_smoothie
        FOREIGN KEY (smoothie_id) REFERENCES smoothies(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_order_items_line_total CHECK (line_total >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_order_id ON order_items(order_id);