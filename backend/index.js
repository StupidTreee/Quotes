import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import quotesRoutes from './routes/quotes.js';

const app = express();
app.use(express.json());
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use(cors());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/quotes', quotesRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`✅ API listening at http://localhost:${PORT}`);
  console.log(`☑️ Swagger UI at http://localhost:${PORT}/api/docs`);
});
