import express from 'express'
import cors from 'cors'
import http from "http";
import { Server, Socket } from "socket.io";
import type { Player, Room, PendingAnswer } from "./utils/type.js";
import prisma from "./utils/prisma.js";

const app = express();
const port = 5000;

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));


















const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Autoriser toutes les origines pour tester
    methods: ["GET", "POST"],
    credentials: false,
  },
});


// Stockage en mémoire (simple pour l'exemple)
const rooms: Record<string, Room> = {};

io.on("connection", (socket: Socket) => {
  console.log(`✅ Nouvelle connexion : ${socket.id}`);

  // Créer une room (pour l'hôte)
  socket.on("create_room", ({ roomCode, quizId }: { roomCode: string; quizId: string }) => {
    console.log(`🆕 Création de room: ${roomCode} pour le quiz ${quizId}`);

    if (!rooms[roomCode]) {
      rooms[roomCode] = { code: roomCode, players: [], pendingAnswers: [] };
      socket.join(roomCode);
      console.log(`✅ Room ${roomCode} créée et hôte ${socket.id} a rejoint`);
    }
  });

  socket.on("join_room", ({ pseudo, roomCode }: { pseudo: string; roomCode: string }) => {
    console.log(`📥 Reçu join_room:`, { pseudo, roomCode, socketId: socket.id });

    if (!pseudo || !roomCode) {
      console.log("❌ Pseudo ou roomCode manquant");
      return;
    }

    // Vérifier si la room existe
    if (!rooms[roomCode]) {
      console.log(`❌ Room ${roomCode} n'existe pas`);
      socket.emit("room_not_found");
      return;
    }

    // Ajouter le joueur
    const newPlayer: Player = { id: socket.id, pseudo, score: 0 };
    rooms[roomCode].players.push(newPlayer);
    socket.join(roomCode);

    console.log(`✅ ${pseudo} a rejoint la salle ${roomCode}`);
    console.log(`👥 Joueurs dans ${roomCode}:`, rooms[roomCode].players);

    // Envoyer la nouvelle liste des joueurs
    console.log(`📤 Émission room_update à la salle ${roomCode} avec ${rooms[roomCode].players.length} joueur(s)`);
    io.to(roomCode).emit("room_update", rooms[roomCode].players);
  });

  // Démarrer le jeu
  socket.on("start_game", ({ roomCode, questions }: { roomCode: string; questions: any[] }) => {
    console.log(`🚀 Démarrage du jeu pour la room ${roomCode} avec ${questions.length} questions`);

    // Envoyer le signal de démarrage avec les questions
    io.to(roomCode).emit("game_started", { questions });

    // Démarrer la première question après 2 secondes
    setTimeout(() => {
      if (questions && questions.length > 0) {
        console.log(`📤 Envoi de la question 1/${questions.length}`);
        io.to(roomCode).emit("question_start", {
          questionIndex: 0,
          question: questions[0],
          totalQuestions: questions.length
        });
      }
    }, 2000);
  });

  // Passer à la question suivante
  socket.on("next_question", ({ roomCode, questionIndex, questions }: { roomCode: string; questionIndex: number; questions: any[] }) => {
    console.log(`➡️  Question suivante pour la room ${roomCode}: ${questionIndex + 1}/${questions.length}`);

    if (questionIndex < questions.length) {
      io.to(roomCode).emit("question_start", {
        questionIndex,
        question: questions[questionIndex],
        totalQuestions: questions.length
      });
    } else {
      // Fin du quiz
      console.log(`🏁 Fin du quiz pour la room ${roomCode}`);
      io.to(roomCode).emit("game_ended");
    }
  });

  // Fonction pour calculer les points
  const calculatePoints = (questionPoints: number, responseTime: number, timeLimit: number): number => {
    // Points maximum = points de la question
    // Réduction en fonction du temps de réponse
    // Plus on répond vite, plus on gagne de points

    // Formule : points = questionPoints * (1 - (responseTime / timeLimit) * 0.5)
    // 0s = 100% des points
    // timeLimit = 50% des points
    const timeRatio = Math.min(responseTime / timeLimit, 1);
    const points = Math.round(questionPoints * (1 - timeRatio * 0.5));

    return Math.max(points, 0);
  };

  // Réception d'une réponse d'un joueur
  socket.on("submit_answer", async ({ roomCode, questionId, answerId, answerIds, answerText, responseTime }: {
    roomCode: string;
    questionId: number;
    answerId?: number;
    answerIds?: number[];
    answerText?: string;
    responseTime: number
  }) => {
    console.log(`📝 Réponse reçue de ${socket.id} pour la question ${questionId}`);
    console.log(`⏱️  Temps de réponse: ${responseTime} secondes`);

    try {
      // Récupérer la question avec ses réponses
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { answers: true }
      });

      if (!question) {
        socket.emit("answer_submitted", { success: false, error: "Question non trouvée" });
        return;
      }

      let isCorrect = false;
      let pointsEarned = 0;

      // Vérifier si la réponse est correcte
      if (answerId) {
        // Réponse unique (TRUE_FALSE, MULTIPLE_CHOICE)
        const answer = question.answers.find(a => a.id === answerId);
        isCorrect = answer?.isCorrect || false;
      } else if (answerIds) {
        // Réponses multiples (MULTIPLE_SELECT)
        const correctAnswers = question.answers.filter(a => a.isCorrect);
        const correctIds = correctAnswers.map(a => a.id).sort();
        const selectedIds = answerIds.sort();
        isCorrect = JSON.stringify(correctIds) === JSON.stringify(selectedIds);
      } else if (answerText) {
        // Réponse textuelle (SHORT_ANSWER) - validation manuelle requise
        const potentialPoints = calculatePoints(question.points, responseTime, question.timeLimit);

        const room = rooms[roomCode];
        if (room) {
          const player = room.players.find(p => p.id === socket.id);
          if (player) {
            // Initialiser pendingAnswers si nécessaire
            if (!room.pendingAnswers) {
              room.pendingAnswers = [];
            }

            // Ajouter la réponse en attente de validation
            room.pendingAnswers.push({
              playerId: socket.id,
              playerPseudo: player.pseudo,
              questionId: questionId,
              answerText: answerText,
              responseTime: responseTime,
              potentialPoints: potentialPoints,
              validated: false
            });

            console.log(`📝 Réponse SHORT_ANSWER en attente de validation: ${player.pseudo} - "${answerText}"`);

            // Envoyer les réponses en attente à l'hôte
            io.to(roomCode).emit("pending_answers_update", room.pendingAnswers.filter(a => a.questionId === questionId));
          }
        }

        // Ne pas calculer les points maintenant, l'hôte validera
        socket.emit("answer_submitted", {
          success: true,
          pending: true,
          message: "Réponse en attente de validation par l'hôte"
        });
        return;
      }

      // Calculer les points si la réponse est correcte
      if (isCorrect) {
        pointsEarned = calculatePoints(question.points, responseTime, question.timeLimit);

        // Mettre à jour le score du joueur
        const room = rooms[roomCode];
        if (room) {
          const player = room.players.find(p => p.id === socket.id);
          if (player) {
            player.score += pointsEarned;
            console.log(`✅ ${player.pseudo} a gagné ${pointsEarned} points ! Score total: ${player.score}`);

            // Envoyer la mise à jour des scores à toute la room
            io.to(roomCode).emit("scores_update", room.players);
          }
        }
      } else {
        console.log(`❌ Réponse incorrecte de ${socket.id}`);
      }

      socket.emit("answer_submitted", {
        success: true,
        isCorrect,
        pointsEarned,
        totalScore: rooms[roomCode]?.players.find(p => p.id === socket.id)?.score || 0
      });

    } catch (error) {
      console.error("Erreur lors du traitement de la réponse:", error);
      socket.emit("answer_submitted", { success: false, error: "Erreur serveur" });
    }
  });

  // Validation manuelle des réponses SHORT_ANSWER par l'hôte
  socket.on("validate_answer", ({ roomCode, playerId, questionId, isCorrect }: {
    roomCode: string;
    playerId: string;
    questionId: number;
    isCorrect: boolean;
  }) => {
    console.log(`🔍 Validation de réponse: ${playerId} - ${isCorrect ? "Correcte" : "Incorrecte"}`);

    const room = rooms[roomCode];
    if (!room || !room.pendingAnswers) return;

    // Trouver la réponse en attente
    const pendingAnswerIndex = room.pendingAnswers.findIndex(
      a => a.playerId === playerId && a.questionId === questionId && !a.validated
    );

    if (pendingAnswerIndex === -1) {
      console.log(`❌ Réponse en attente non trouvée`);
      return;
    }

    const pendingAnswer = room.pendingAnswers[pendingAnswerIndex];
    if (!pendingAnswer) {
      console.log(`❌ Réponse en attente introuvable après index trouvé`);
      return;
    }
    pendingAnswer.validated = true;

    // Si la réponse est validée comme correcte, attribuer les points
    if (isCorrect) {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.score += pendingAnswer.potentialPoints;
        console.log(`✅ ${player.pseudo} a gagné ${pendingAnswer.potentialPoints} points ! Score total: ${player.score}`);

        // Envoyer la mise à jour des scores à toute la room
        io.to(roomCode).emit("scores_update", room.players);

        // Notifier le joueur
        io.to(playerId).emit("answer_validated", {
          isCorrect: true,
          pointsEarned: pendingAnswer.potentialPoints,
          totalScore: player.score
        });
      }
    } else {
      // Notifier le joueur que sa réponse est incorrecte
      io.to(playerId).emit("answer_validated", {
        isCorrect: false,
        pointsEarned: 0,
        totalScore: room.players.find(p => p.id === playerId)?.score || 0
      });
    }

    // Mettre à jour la liste des réponses en attente
    io.to(roomCode).emit("pending_answers_update",
      room.pendingAnswers.filter(a => a.questionId === questionId && !a.validated)
    );
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(`❌ Joueur déconnecté : ${socket.id}`);
    for (const [code, room] of Object.entries(rooms)) {
      const updatedPlayers = room.players.filter((p) => p.id !== socket.id);
      room.players = updatedPlayers;
      io.to(code).emit("room_update", updatedPlayers);
    }
  });
});









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

import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);

import quizRoutes from './routes/quiz.routes.js';
app.use('/api/quiz', quizRoutes)

import questionRoutes from './routes/question.routes.js';
app.use('/api/question', questionRoutes)

import answer from './routes/answer.routes.js'
app.use('/api/answer', answer)

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
  console.log(`Socket.IO is ready`);
}); 