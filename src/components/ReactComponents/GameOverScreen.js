import React, { useState, useEffect } from "react";
import { storeScore } from "@/services/api"; // Import the storeScore function
import { useRouter } from "next/router";

const GameOverScreen = ({ score }) => {
  const [userScore, setUserScore] = useState(score); // Store score in state
  const [loading, setLoading] = useState(true); // Track loading state
  const router = useRouter(); // Using useRouter in a functional component
  const { userId } = router.query; // Extract userId from query params

  // Function to handle storing the score and redirecting
  const handleGameOver = async () => {
    try {
      // Store the score and userId in the backend
      const response = await storeScore(userScore, userId);
      console.log("Score saved:", response);

      // Redirect to home page after saving the score
      redirectToHome();
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  // Function to redirect to home
  const redirectToHome = () => {
    router.push(`/?userId=${userId}`); // Redirect to the home page (update route as needed)
  };

  // Effect to handle the process of saving the score on component mount
  useEffect(() => {
    handleGameOver(); // Start the process when the component mounts
  }, []); // Empty dependency array to run it once when the component mounts

  return (
    <div>
      {loading ? (
        <div className="loadingScreen">
          <span className="centerScreen title">GameOver!</span>
          <span className="centerScreen score">Score: {userScore}</span>
          <span className="centerScreen">Saving your score...</span>
        </div>
      ) : (
        <div>
          <span className="centerScreen title">GameOver!</span>
          <span className="centerScreen score">Score: {userScore}</span>
          <span className="centerScreen pressEnter">
            Redirecting to home...
          </span>
        </div>
      )}
    </div>
  );
};

export default GameOverScreen;
