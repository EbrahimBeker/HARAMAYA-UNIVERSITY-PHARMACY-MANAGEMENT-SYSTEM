-- Sales table to track all sales transactions
CREATE TABLE IF NOT EXISTS sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    customer_address TEXT,
    payment_method ENUM('cash', 'card', 'mobile_money', 'bank_transfer') NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) DEFAULT 0,
    processed_by INT NOT NULL,
    sale_date DATETIME NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_sale_date (sale_date),
    INDEX idx_processed_by (processed_by),
    INDEX idx_status (status)
);

-- Sale items table to track individual items in each sale
CREATE TABLE IF NOT EXISTS sale_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    INDEX idx_sale_id (sale_id),
    INDEX idx_medicine_id (medicine_id)
);

-- Update stock_out table to include sales reference
ALTER TABLE stock_out 
ADD COLUMN IF NOT EXISTS sale_id INT,
ADD INDEX IF NOT EXISTS idx_sale_id (sale_id);