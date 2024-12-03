import axios from "axios";

const API_BASE_URL_s1 = "https://n-tele-backend.onrender.com/api/user";
const API_BASE_URL = "https://aelons2.onrender.com/api/user";
// const API_BASE_URL = "http://localhost:5000/api/user";
export const fetchUserDatas1 = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL_s1}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Rethrow the error so it can be handled in the component
  }
};

export const fetchUserData = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Rethrow the error so it can be handled in the component
  }
};

export const fetchStreakData = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}/streak`);
    return response.data;
  } catch (error) {
    console.error("Error fetching streak data:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

export const loginUser = async (userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${userId}/login`);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error; // Rethrow the error for handling in the component
  }
};

export const fetchReferredCount = async (userId) => {
  try {
    // console.log(`Fetching referral count for userId: ${userId}`); // Log userId
    const response = await axios.get(`${API_BASE_URL}/referrals/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching referral count:",
      error.response ? error.response.data : error.message
    );
    throw error; // Rethrow the error for handling in the component
  }
};

export const claimReferralReward = async (userId, index) => {
  // Add index parameter
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${userId}/claimReferralReward`,
      {
        index, // Send the index to the API
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error claiming referral reward:", error);
    throw error; // Rethrow the error for handling in the component
  }
};
export const handleAirdropAction = async (userId, action) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL_s1}/${userId}/airdropAction`,
      {
        action,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error handling airdrop action:", error);
    throw error; // Rethrow the error for handling in the component
  }
};
export const fetchAirdropStatus = async (userId) => {
  const response = await fetch(`${API_BASE_URL_s1}/${userId}/airdropStatus`);
  if (!response.ok) {
    throw new Error("Failed to fetch airdrop status");
  }
  return response.json();
};
export const fetchSolanaInfo = (userId) => {
  return axios
    .get(`${API_BASE_URL_s1}/${userId}/solanaInfo`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching Solana info:", error);
      throw error;
    });
};
export const submitSolanaAddress = async (userId, solanaAddress) => {
  const response = await axios.post(
    `${API_BASE_URL_s1}/${userId}/submitSolanaAddress`,
    {
      userId,
      solanaAddress,
    }
  );
  return response.data;
};

export const startFarming = async (userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${userId}/start-farming`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error("Error starting farming:", error);
    throw error;
  }
};
export const claimTokens = async (userId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/${userId}/claim-tokens`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error("Error claiming tokens:", error);
    throw error;
  }
};
export const fetchFarmStatus = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}/get-status`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user status:", error);
    throw error;
  }
};
export const checkGameStatus = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${userId}/game-status`);
    return response.data;
  } catch (error) {
    console.error("Error checking game status:", error);
    throw new Error("Failed to check game status");
  }
};
export const storeScore = async (score, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${userId}/save-score`, {
      score: score,
      userId: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error saving score:", error);
    throw error;
  }
};
