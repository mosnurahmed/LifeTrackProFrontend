/**
 * Axios API Client
 * 
 * Centralized HTTP client with base configuration
 */

import axios, { AxiosInstance } from 'axios';

import { API_BASE_URL } from '../utils/constants';
// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default client;