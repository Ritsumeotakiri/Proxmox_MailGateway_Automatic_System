import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.post('/webhook', (req, res) => {
  const { event, message } = req.body;
  console.log('Webhook received:', req.body);

  // Send alert only if message contains 'quarantine'
  if (!message.toLowerCase().includes('quarantine')) {
    return res.status(200).json({ status: 'ignored non-quarantine alert' });
  }

  // Emit to React clients
  io.emit('mailAlert', { event, message });

  res.status(200).json({ status: 'alert sent' });
});

io.on('connection', (socket) => {
  console.log('React client connected:', socket.id);
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});
