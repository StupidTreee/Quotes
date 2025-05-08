import express from 'express';
import cors from 'cors';
import swaggerUi, { setup } from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import schuelerRoutes from './routes/schueler.js';
import lehrerRoutes from './routes/lehrer.js';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use(cors());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/quotes/schueler', schuelerRoutes);
app.use('/api/quotes/lehrer', lehrerRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.listen(PORT, () => {
  console.log(`✅ API listening at http://localhost:${PORT}`);
  console.log(`☑️ Swagger UI at http://localhost:${PORT}/api/docs`);
});
