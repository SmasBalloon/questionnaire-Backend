export interface Player {
  id: string;
  pseudo: string;
  score: number;
}

export interface Room {
  code: string;
  players: Player[];
  pendingAnswers?: PendingAnswer[];
}

export interface Answer {
  playerId: string;
  questionId: number;
  answerId?: number;
  answerIds?: number[];
  answerText?: string;
  responseTime: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface PendingAnswer {
  playerId: string;
  playerPseudo: string;
  questionId: number;
  answerText: string;
  responseTime: number;
  potentialPoints: number;
  validated: boolean;
}
