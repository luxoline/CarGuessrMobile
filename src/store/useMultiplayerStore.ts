import { create } from 'zustand';
import * as signalR from '@microsoft/signalr';
import { Platform } from 'react-native';

// Android emülatörü için 10.0.2.2, diğerleri için localhost
// Fiziksel cihazda kendi IP'ni yaz: http://192.168.1.X:5236
const HUB_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5236/gamehub'
  : 'http://localhost:5236/gamehub';


interface MultiplayerState {
  connection: signalR.HubConnection | null;
  lobbyCode: string | null;
  isMatchmaking: boolean;
  isGameStarted: boolean;
  gameFinished: boolean;
  
  hostName: string | null;
  guestName: string | null;
  
  currentQuestion: any | null;
  hostScore: number;
  guestScore: number;
  
  roundResult: any | null;
  gameResult: any | null;
  
  error: string | null;
  
  connect: (token: string) => Promise<void>;
  disconnect: () => Promise<void>;
  createLobby: () => Promise<void>;
  joinLobby: (code: string) => Promise<void>;
  findRandomMatch: () => Promise<void>;
  submitAnswer: (answerId: number) => Promise<void>;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  connection: null,
  lobbyCode: null,
  isMatchmaking: false,
  isGameStarted: false,
  gameFinished: false,
  hostName: null,
  guestName: null,
  currentQuestion: null,
  hostScore: 0,
  guestScore: 0,
  roundResult: null,
  gameResult: null,
  error: null,

  connect: async (token: string) => {
    try {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl(`${HUB_URL}?access_token=${token}`)
        .withAutomaticReconnect()
        .build();

      conn.on('Error', (err) => set({ error: err }));
      
      conn.on('LobbyCreated', (code) => {
        set({ lobbyCode: code });
      });

      conn.on('MatchmakingStarted', () => {
        set({ isMatchmaking: true });
      });

      conn.on('GameStarted', (data) => {
        set({
          isGameStarted: true,
          isMatchmaking: false, // Turn off loading when matched
          hostName: data.hostName,
          guestName: data.guestName,
          hostScore: 0,
          guestScore: 0
        });
      });

      conn.on('ReceiveQuestion', (question) => {
        set({ currentQuestion: question, roundResult: null });
      });

      conn.on('RoundResult', (result) => {
        set({ 
            hostScore: result.hostScore, 
            guestScore: result.guestScore,
            roundResult: result 
        });
      });

      conn.on('GameFinished', (result) => {
        set({ gameFinished: true, gameResult: result });
      });

      conn.on('OpponentDisconnected', () => {
        set({ error: "Rakip oyundan ayrıldı." });
        get().disconnect();
      });

      await conn.start();
      set({ connection: conn, error: null });
      console.log('SignalR Connected!');
    } catch (e) {
      console.log('SignalR Connection Error: ', e);
      set({ error: 'Bağlantı hatası' });
    }
  },

  disconnect: async () => {
    const { connection } = get();
    if (connection) {
      await connection.stop();
      set({ connection: null, lobbyCode: null, isMatchmaking: false, isGameStarted: false, hostName: null, guestName: null, currentQuestion: null, hostScore: 0, guestScore: 0, roundResult: null, gameResult: null, gameFinished: false });
    }
  },

  createLobby: async () => {
    const { connection } = get();
    if (connection) {
      set({ error: null });
      await connection.invoke('CreateLobby');
    }
  },

  joinLobby: async (code: string) => {
    const { connection } = get();
    if (connection) {
      set({ error: null });
      await connection.invoke('JoinLobby', code);
    }
  },

  findRandomMatch: async () => {
    const { connection } = get();
    if (connection) {
      set({ error: null });
      await connection.invoke('FindRandomMatch');
    }
  },
  
  submitAnswer: async (answerId: number) => {
      const { connection } = get();
      if (connection) {
          await connection.invoke('SubmitAnswer', answerId);
      }
  }
}));
