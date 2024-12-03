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
  const [isS2OverlayVisible, setIsS2OverlayVisible] = useState(false); //

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

  const handleCloseS2Overlay = () => {
    setIsS2OverlayVisible(false);
  };
  if (loading) {
    return <LoadingScreen />;
  }
  const openLink = (url) => {
    window.open(url, "_blank");
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // alert("Address copied to clipboard!");
    });
  };

  return (
    <div className={!isMobile ? "mobile-class" : "desktop-class"}>
      {!isMobile ? (
        <div style={{ textAlign: "center" }}>
          <p>Please scan the QR code to continue:</p>
          <Image src="/qr-image.png" alt="QR Code" width={200} height={200} />
        </div>
      ) : (
        userId && (
          <>
            {/* Overlay for S2 Information have to comment after 3 days*/}
            {isfWelcomeOverlayVisible && (
              <div className={styles.overlay}>
                <div className={styles.overlayContent}>
                  <h2>Welcome {First_name} to AELON Farming!!!!</h2>
                  <p>
                    have to write about the preplay and this official release
                  </p>
                  <button
                    className={styles.closeButton}
                    onClick={handleCloseWelcome}
                  >
                    <Image
                      src="/close.png"
                      alt="close"
                      width={25}
                      height={25}
                    />
                  </button>
                </div>
              </div>
            )}
            {/* Overlay for S2 Information have to comment after 3 days*/}
            {isWelcomeOverlayVisible && (
              <div className={styles.overlay}>
                <div className={styles.overlayContent}>
                  <h2>Welcome back {First_name}!!!</h2>
                  <p>
                    have to write about the preplay and this official release
                  </p>
                  <button
                    className={styles.closeButton}
                    onClick={handleCloseWelcome}
                  >
                    <Image
                      src="/close.png"
                      alt="close"
                      width={25}
                      height={25}
                    />
                  </button>
                </div>
              </div>
            )}
            {/* Overlay for S2 Information */}

            <p
              className={styles.user_name}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Image
                src="/user.png"
                alt="User Profile"
                style={{
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
                width={40}
                height={40}
              />
              {First_name}
              {isheart && (
                <button
                  onClick={handleShowS1Data}
                  className={styles.claimButton}
                >
                  <Image
                    src="/heart.png"
                    alt="memories"
                    width={25}
                    height={25}
                  />
                </button>
              )}

              {isS1OverlayVisible && s1Data && (
                <div className={styles.overlay}>
                  <div className={styles.overlayContent}>
                    <button
                      className={styles.closeButton}
                      onClick={closeS1Overlay}
                    >
                      <Image
                        src="/close.png"
                        alt="close"
                        width={25}
                        height={25}
                      />
                    </button>
                    <div className={styles.s1Details}>
                      <h2>Pre Play $Aelon & Eligibility</h2>
                      <p>$Aelon: {s1Data.rewards}</p>
                      <p>Eligibility: Yet to shout</p>
                    </div>
                  </div>
                </div>
              )}
            </p>

            <p
              className={styles.user_name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c1ff00",
              }}
            >
              <Image
                src="/coin.png"
                alt="Coin"
                style={{
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
                width={40}
                height={40}
              />
              {tokens}
            </p>
            <br />
            <p
              className={styles.user_name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "black",
                marginBottom: "50px",
              }}
            >
              <button
                className={`${styles.claimButton}`}
                onClick={() => {
                  openLink(
                    "https://raydium.io/swap/?inputMint=sol&outputMint=E762M7pP5vBTfLBiqr1M7isvJYZ3moGZ7rxhgy93o5dS"
                  );
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M34.3297 15.8661V28.7492L20 37.021L5.66234 28.7492V12.1978L20 3.91808L31.013 10.2797L32.6753 9.32068L20 2L4 11.2388V29.7083L20 38.947L36 29.7083V14.9071L34.3297 15.8661Z"
                    fill="url(#a)"
                  ></path>
                  <path
                    d="M15.988 28.7572H13.5904V20.7173H21.5824C22.3385 20.7089 23.061 20.4031 23.5934 19.8662C24.1259 19.3293 24.4255 18.6043 24.4276 17.8481C24.4319 17.4742 24.3597 17.1034 24.2154 16.7584C24.0711 16.4134 23.8577 16.1016 23.5884 15.8421C23.3278 15.5743 23.0158 15.362 22.6711 15.2178C22.3264 15.0736 21.9561 15.0005 21.5824 15.003H13.5904V12.5574H21.5904C22.991 12.5658 24.3319 13.1259 25.3222 14.1163C26.3126 15.1067 26.8727 16.4475 26.8811 17.8481C26.8897 18.9202 26.5627 19.9681 25.9461 20.8451C25.3785 21.6842 24.5786 22.3397 23.6444 22.7313C22.7193 23.0246 21.7537 23.1703 20.7832 23.1628H15.988V28.7572Z"
                    fill="url(#b)"
                  ></path>
                  <path
                    d="M26.8252 28.5574H24.028L21.8701 24.7932C22.7238 24.741 23.5659 24.5688 24.3716 24.2817L26.8252 28.5574Z"
                    fill="url(#c)"
                  ></path>
                  <path
                    d="M32.6593 13.1888L34.3137 14.1079L35.968 13.1888V11.2467L34.3137 10.2877L32.6593 11.2467V13.1888Z"
                    fill="url(#d)"
                  ></path>
                  <defs>
                    <linearGradient
                      id="a"
                      x1="35.9717"
                      y1="11.2489"
                      x2="2.04291"
                      y2="24.817"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#C200FB"></stop>
                      <stop offset="0.489658" stopColor="#3772FF"></stop>
                      <stop offset="1" stopColor="#5AC4BE"></stop>
                    </linearGradient>
                    <linearGradient
                      id="b"
                      x1="35.9717"
                      y1="11.2489"
                      x2="2.04291"
                      y2="24.817"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#C200FB"></stop>
                      <stop offset="0.489658" stopColor="#3772FF"></stop>
                      <stop offset="1" stopColor="#5AC4BE"></stop>
                    </linearGradient>
                    <linearGradient
                      id="c"
                      x1="35.9717"
                      y1="11.2489"
                      x2="2.04291"
                      y2="24.817"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#C200FB"></stop>
                      <stop offset="0.489658" stopColor="#3772FF"></stop>
                      <stop offset="1" stopColor="#5AC4BE"></stop>
                    </linearGradient>
                    <linearGradient
                      id="d"
                      x1="35.9717"
                      y1="11.2489"
                      x2="2.04291"
                      y2="24.817"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#C200FB"></stop>
                      <stop offset="0.489658" stopColor="#3772FF"></stop>
                      <stop offset="1" stopColor="#5AC4BE"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </button>

              <Image
                src="/white.png"
                alt="AELON"
                style={{
                  marginRight: "10px",
                  borderRadius: "50%",
                }}
                width={230}
                height={230}
              />
              <div className={`${styles.TElButtons}`}>
                <button className={styles.claimButton} onClick={showOverlay}>
                  <Image src="/htb.png" alt="HTB" width={20} height={20} />
                </button>
                {isOverlayVisible && (
                  <div className={styles.overlay}>
                    <div className={styles.overlayContent}>
                      <button
                        className={styles.closeButton}
                        onClick={closeOverlay}
                      >
                        <Image
                          src="/close.png"
                          alt="close"
                          width={25}
                          height={25}
                        />
                      </button>
                      <div className={styles.instructions}>
                        <h2>Follow these instructions:</h2>
                        <ol>
                          <li>Type /start</li>
                          <li>Click Buy button</li>
                          <li>Enter Aelon contract address</li>
                          <li>
                            E762M7pP5vBTfLBiqr1M
                            <br />
                            7isvJYZ3moGZ7rxhgy93o5dS
                            <button
                              className={styles.claimButton}
                              onClick={() => copyToClipboard(contractAddress)}
                            >
                              Copy
                            </button>
                          </li>
                          <li>Select Swap</li>
                          <li>Select/Enter the sol amount you want to buy</li>
                          <li>Check the slippage</li>
                          <li>Click BUY button</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  className={`${styles.claimButton}`}
                  onClick={() => {
                    openLink("https://t.me/solana_trojanbot");
                  }}
                >
                  <Image
                    width={20}
                    height={20}
                    src="/tel_b.png"
                    alt="Telegram"
                  />
                </button>
              </div>
            </p>

            {!isFarming && !farmingCompleted ? (
              // Show "Start Farming" button if farming is not started and not completed
              <button
                onClick={handleStartFarming}
                className={styles.claimButton}
              >
                Start Farming
              </button>
            ) : isFarming && !farmingCompleted ? (
              // Show farming progress if farming is in progress but not completed
              <div className={styles.progressContainer}>
                <div className={styles.progressText}>
                  <p>
                    $AELON Farming: {accumulatedTokens.toFixed(4)}
                    <br />
                    {timeRemaining}
                  </p>
                </div>
                <progress
                  value={PT}
                  max="28800" // Set this max value as per the farming session duration in seconds
                  className={styles.progressBar}
                />
              </div>
            ) : farmingCompleted ? (
              // Show "Claim" button if farming is completed
              <div className={styles.buttonContainer}>
                <button
                  onClick={handleClaimTokens}
                  className={styles.claimButton}
                >
                  Claim ({accumulatedTokens} Tokens)
                </button>
              </div>
            ) : null}

            <p
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                marginBottom: "50px",
              }}
            >
              Farm a Token that actually has value
            </p>

            {toastMessage && (
              <Toast
                message={toastMessage}
                onClose={() => setToastMessage("")}
              />
            )}

            <Footer userId={userId} />
          </>
        )
      )}
    </div>
  );
};

export default Home;
