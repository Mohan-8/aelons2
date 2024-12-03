import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import styles from "@/styles/Earn.module.css";
import "@/app/globals.css";
import Image from "next/image";
import { fetchUserData, fetchStreakData, loginUser } from "@/services/api";

// Add the lock image import
import lockIcon from "/public/lock.png"; // Adjust the path as needed

const Toast = ({ message, onClose }) => (
  <div className={styles["toast-overlay"]}>
    <div className={styles.toast}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  </div>
);

const EarnPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [canClaim, setCanClaim] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);

  useEffect(() => {
    const fetchStreakDataFromAPI = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const userData = await fetchUserData(userId);
        const lastLoginTime = new Date(userData.lastlogin);
        setLastLogin(lastLoginTime);

        const now = new Date();
        const gmtToday = new Date(
          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
        );
        if (!userData.lastlogin) {
          await loginUser(userId);
          setStreak(0);
          setCanClaim(true);
        } else {
          setCanClaim(lastLoginTime < gmtToday);
          const streakData = await fetchStreakData(userId);
          setStreak(streakData.streakCount);
        }
      } catch (error) {
        console.error("Error fetching user or streak data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakDataFromAPI();
  }, [userId]);

  const handleClaim = async () => {
    if (!canClaim) return;
    setLoading(true);
    try {
      const response = await loginUser(userId);
      const { streakCount, pointsEarned } = response;

      setToastMessage(`You earned ${pointsEarned} Aelon!`);
      setStreak(streakCount);
      setCanClaim(false);
      setLastLogin(new Date());
    } catch (error) {
      console.error("Error claiming Aelon:", error);
      setToastMessage("Failed to claim Aelon.");
    } finally {
      setLoading(false);
    }
  };

  const handleCircleClick = (index) => {
    if (index === streak && canClaim) {
      handleClaim();
    }
  };

  const createStreakRepresentation = () => {
    const days = Array.from({ length: 21 }, (_, i) => (
      <div
        key={i}
        className={`${styles["streak-day"]} ${
          i < streak ? styles["filled"] : ""
        }`}
        style={{
          backgroundColor:
            i < streak || (i === streak && canClaim) ? "#c1ff00" : "#e0e0e0",
          color: i < streak || (i === streak && canClaim) ? "black" : "inherit",
        }}
        onClick={() => handleCircleClick(i)}
      >
        {i < streak || (i === streak && canClaim) ? (
          <div>
            <p>Day {i + 1}</p>
            <center>
              <p>{(i + 1) * 100}</p>
            </center>
          </div>
        ) : (
          <div>
            <Image src={lockIcon} alt="Locked" width={20} height={20} />
          </div>
        )}
      </div>
    ));
    return <div className={styles["streak-container"]}>{days}</div>;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={styles["earn-container"]}>
      <Image
        width={50}
        height={50}
        src="/back.png"
        alt="Back"
        className={styles["back-icon"]}
        onClick={() => router.push(`/?userId=${userId}`)} // Corrected back handler
      />
      <h2 className={styles["header"]}>Earn</h2>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <div className={styles["streak-section"]}>
        <h3>Daily Login Streak</h3>
        <p className={styles["streak-details"]}>
          Current Streak: {streak}/21.
          <br />
        </p>
        {/* {lastLogin && (
          <p className={styles["last-login"]}>
            Last Login: {lastLogin.toUTCString()}
          </p>
        )} */}
        {createStreakRepresentation()}
      </div>

      <Footer userId={userId} />
    </div>
  );
};

export default EarnPage;
