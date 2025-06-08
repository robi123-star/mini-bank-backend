import express from 'express';
import dotenv from 'dotenv';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Mount API routes
app.use('/api', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mini Bank Simpan-Pinjam API</title>
</head>
<body>
  <h1>Welcome to Mini Bank Simpan-Pinjam API</h1>
  <p>API for managing savings and loans.</p>
</body>
</html>`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
