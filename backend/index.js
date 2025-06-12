import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import quotesRoutes from './routes/quotes.js';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is running!');
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Setze die Socket.io-Instanz im App-Objekt ablegbar
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*"
  }
});
app.set('socketio', io);

app.use('/api/quotes', quotesRoutes);
app.get('/favicon.ico', (req, res) => res.status(204).end());

server.listen(3000, () => {
  console.log(`✅ API listening at http://localhost:3000`);
  console.log(`☑️ Swagger UI at http://localhost:3000/api/docs`);
});

// Verbindung herstellen
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
});
