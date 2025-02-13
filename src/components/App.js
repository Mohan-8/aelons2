"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import Image from "next/image";
import {
  fetchUserData,
  fetchFarmStatus,
  startFarming,
  claimTokens,
  fetchUserDatas1,
} from "@/services/api"; // API integrations
import styles from "@/styles/Home.module.css";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { Header } from "@/components/Connectwallet";

// Toast Component
const Toast = ({ message, onClose }) => (
  <div className={styles["toast-overlay"]}>
    <div className={styles.toast}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  </div>
);

const Home = () => {
  const [First_name, setFN] = useState(null);
  const [tokens, setTokens] = useState(0); // Total tokens in DB
  const [timeElapsed, setTimeElapsed] = useState(0); // Time elapsed in farming session
  const [accumulatedTokens, setAccumulatedTokens] = useState(0); // Tokens accumulated during farming
  const [userId, setUserId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("08:00:00"); // Time remaining in hh:mm:ss format
  const [farmingCompleted, setFarmingCompleted] = useState(false); // Flag to check if farming is completed
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isFarming, setIsFarming] = useState(false);
  const [PT, setPT] = useState(0);
  const [s1Data, setS1Data] = useState(null);
  const [isS1OverlayVisible, setIsS1OverlayVisible] = useState(false);
  const [isheart, setIsheart] = useState(false);
  const [isfWelcomeOverlayVisible, setIsFWelcomeOverlayVisible] =
    useState(false); // for initial welcome overlay
  const [isWelcomeOverlayVisible, setIsWelcomeOverlayVisible] = useState(false); // for initial welcome overlay

  const showOverlay = () => setIsOverlayVisible(true);
  const closeOverlay = () => setIsOverlayVisible(false);

  const contractAddress = "E762M7pP5vBTfLBiqr1M7isvJYZ3moGZ7rxhgy93o5dS";

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(
        /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)
      );
    };
    checkMobile();
  }, []);

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const userIdFromQuery = queryParams.get("userId");
    if (userIdFromQuery) {
      setUserId(userIdFromQuery);
      fetchUserData(userIdFromQuery)
        .then((data) => {
          setFN(data.firstName);
          setUserId(data.id);
        })
        .catch((error) => console.error("Failed to fetch user data:", error));
    }
  }, []);

  useEffect(() => {
    // Fetch farming status whenever userId changes
    if (userId) {
      const fetchStatus = async () => {
        try {
          const data = await fetchFarmStatus(userId);
          // console.log(data);
          setTokens(data.tokens);
          setIsFarming(data.farming);
          setTimeElapsed(data.timeElapsed);

          // Add 0.0291 per second if farming is active
          const accumulated = data.timeElapsed * 0.0291;

          if (data.farming && data.timeElapsed < 28800) {
            setPT(data.timeElapsed);

            setAccumulatedTokens(accumulated); // Set accumulated tokens with the calculation
            updateRemainingTime(data.timeElapsed); // Assuming this function updates the remaining time
            setFarmingCompleted(false);
          } else if (data.timeElapsed >= 28800) {
            setFarmingCompleted(true);
            setIsFarming(false);
            setTimeRemaining("00:00:00");
            setPT(data.timeElapsed);

            setAccumulatedTokens(28800 * 0.0291); // Max tokens at 60 seconds (for farming completion)
          }
        } catch (error) {
          console.error("Failed to fetch and update status:", error);
        }
      };

      fetchStatus();
      const timer = setInterval(fetchStatus, 1000);
      return () => clearInterval(timer);
    }
  }, [userId]);
  const updateRemainingTime = (elapsedSeconds) => {
    const totalDuration = 28800; // 8 hours in seconds
    const remainingSeconds = totalDuration - elapsedSeconds;
    const hours = Math.floor(remainingSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((remainingSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (remainingSeconds % 60).toString().padStart(2, "0");
    setTimeRemaining(`${hours}:${minutes}:${seconds}`);
  };
  const handleStartFarming = async () => {
    try {
      await startFarming(userId);
      const data = await fetchFarmStatus(userId);
      setTokens(data.tokens);
      setIsFarming(data.farming);
      setTimeElapsed(data.timeElapsed);
      setPT(data.timeElapsed);
      if (data.timeElapsed >= 28800) {
        setFarmingCompleted(true);
        setIsFarming(false);
        setTimeRemaining("00:00:00");
        setAccumulatedTokens(28800);
        setPT(data.timeElapsed);
      } else {
        setAccumulatedTokens(data.timeElapsed);
        setPT(data.timeElapsed);
        updateRemainingTime(data.timeElapsed);
        setFarmingCompleted(false);
      }
    } catch (error) {
      console.error("Failed to start farming and update status:", error);
    }
  };

  // Claim tokens by calling backend endpoint
  const handleClaimTokens = async () => {
    if (isClaimed) {
      setToastMessage("Tokens have already been claimed.");
      setTokens(data.tokens);
      setIsFarming(data.farming);
      setTimeElapsed(data.timeElapsed);
      setPT(data.timeElapsed);
      setFarmingCompleted(false);
      return;
    }

    try {
      await claimTokens(userId);
      const data = await fetchFarmStatus(userId);
      setTokens(data.tokens);
      setIsFarming(data.farming);
      setTimeElapsed(data.timeElapsed);
      setPT(data.timeElapsed);
      setFarmingCompleted(false);
      setIsClaimed(true); // Mark as claimed
      setToastMessage("Claimed Successfully");
    } catch (error) {
      console.error("Failed to claim tokens and update status:", error);
      setToastMessage("Failed to claim. Please try again later.");
    }
  };

  const handleShowS1Data = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const userIdFromQuery = queryParams.get("userId");
      if (userIdFromQuery) {
        fetchUserDatas1(userIdFromQuery)
          .then((data) => {
            // console.log(data);
            setS1Data(data);
            setIsS1OverlayVisible(true);
          })
          .catch((error) => console.error("Failed to fetch user data:", error));
      }
    } catch (error) {
      console.error("Error fetching S1 data:", error);
    }
  };
  const closeS1Overlay = () => {
    setIsS1OverlayVisible(false); // Close overlay
    setS1Data(null); // Clear the data when overlay is closed
  };
  useEffect(() => {
    const showWelcomeMessage = () => {
      const queryParams = new URLSearchParams(window.location.search);
      const userIdFromQuery = queryParams.get("userId");

      if (userIdFromQuery) {
        fetchUserDatas1(userIdFromQuery)
          .then((data) => {
            // console.log(data.rewards);
            if (data.rewards <= 0) {
              setIsFWelcomeOverlayVisible(true);
            } else {
              setIsheart(true);
              setIsWelcomeOverlayVisible(true);
            }
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      }
    };

    showWelcomeMessage();
  }, []);

  const handleCloseWelcome = () => {
    setIsFWelcomeOverlayVisible(false);
    setIsWelcomeOverlayVisible(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }
  const openLink = (url) => {
    window.open(url, "_blank");
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setToastMessage("Address copied to clipboard!");
    });
  };

  return <h1>THANK YOU</h1>;
};

export default Home;
