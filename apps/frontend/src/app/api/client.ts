// src/api/client.ts
import { Exercise } from '@/types';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api'; // Adjust the port if needed

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchExercises = async (): Promise<Exercise[]> => {
  const response = await apiClient.get('/exercises');
  return response.data;
};
