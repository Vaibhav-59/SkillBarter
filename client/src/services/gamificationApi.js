// services/gamificationApi.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// GET /api/gamification
export const getGamification = async () => {
  const { data } = await axios.get(`${API_URL}/gamification`, getAuthHeaders());
  return data;
};

// POST /api/gamification/update
export const updateGamification = async (payload) => {
  const { data } = await axios.post(
    `${API_URL}/gamification/update`,
    payload,
    getAuthHeaders()
  );
  return data;
};

// GET /api/gamification/leaderboard
export const getLeaderboard = async () => {
  const { data } = await axios.get(
    `${API_URL}/gamification/leaderboard`,
    getAuthHeaders()
  );
  return data;
};

// POST /api/gamification/daily-checkin
export const dailyCheckIn = async () => {
  const { data } = await axios.post(
    `${API_URL}/gamification/daily-checkin`,
    {},
    getAuthHeaders()
  );
  return data;
};

// POST /api/gamification/redeem
export const redeemReward = async (rewardId) => {
  const { data } = await axios.post(
    `${API_URL}/gamification/redeem`,
    { rewardId },
    getAuthHeaders()
  );
  return data;
};
