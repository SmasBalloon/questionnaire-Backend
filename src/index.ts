import express from 'express'
import cors from 'cors'

const app = express();
const port = 5000;

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(3)} ms`);
  });
  
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

import quizRoutes from './routes/quiz.routes';
app.use('/api/quiz', quizRoutes)

import questionRoutes from './routes/question.routes';
app.use('/api/question', questionRoutes)

import answer from './routes/answer.routes'
app.use('/api/answer', answer)

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
}); 