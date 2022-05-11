import axios from 'axios';
import axiosRetry from 'axios-retry';
import rateLimit from 'axios-rate-limit';

const client = axios.create();

axiosRetry(client, {
  retries: 3,
  retryCondition: (error) => {
    return !error.response;
  },
  retryDelay: axiosRetry.exponentialDelay,
});

export const requester = rateLimit(client, {
  maxRPS: 25,
});
