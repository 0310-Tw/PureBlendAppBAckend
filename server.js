const dotenv = require('dotenv');
const app = require('./app');
const pool = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL:', error.message);
    process.exit(1);
  }
};

startServer();