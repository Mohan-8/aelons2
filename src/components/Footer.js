import React, { useEffect, useState } from "react";
import Link from "next/link"; // Import from next/link
import styles from "@/styles/Footer.module.css"; // Ensure this matches the module name
import Image from "next/image";
import { checkGameStatus } from "@/services/api"; // Assuming you have an API service to check game status

const Footer = ({ userId }) => {
  const [canStartGame, setCanStartGame] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0); // Store remaining time in seconds

  // Fetch game status on component mount
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const response = await checkGameStatus(userId);
        const data = await response; // Make sure response is parsed to JSON
        if (response) {
          setCanStartGame(data.canStartGame);
          setRemainingTime(data.remainingTime * 60); // Convert minutes to seconds
        } else {
          console.error("Error fetching game status:", data);
        }
      } catch (error) {
        console.error("Error fetching game status:", error);
      }
    };

    fetchGameStatus();
  }, [userId]);

  useEffect(() => {
    if (!canStartGame && remainingTime > 0) {
      // Set an interval to update the remaining time every 1 second
      const intervalId = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime > 1) {
            return prevTime - 1; // Decrease remaining time by 1 second
          } else {
            clearInterval(intervalId); // Stop the interval once time is up
            setCanStartGame(true); // Enable game when time is up
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [canStartGame, remainingTime]);

  // Convert remaining time (in seconds) to hours, minutes, and seconds
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${
      minutes > 0 ? `${minutes}m ` : ""
    }${remainingSeconds > 0 ? `${remainingSeconds}s` : ""}`;
  };

  return (
    <div className={styles.footer}>
      <Link
        href={`/?userId=${userId}`} // Home link with userId
        aria-label="Go to Home"
        className={styles.footerItem} // Use the updated class name
      >
        <Image src="/home.png" alt="Home" width={50} height={50} />
        <span>Home</span>
      </Link>
      <Link
        href={`/earn/${userId}`} // Dynamic route for Earn
        aria-label="Go to Earn"
        className={styles.footerItem} // Use the updated class name
      >
        <Image src="/earn.png" alt="Earn" width={50} height={50} />
        <span>Earn</span>
      </Link>
      <Link
        href={`/friends/${userId}`} // Assuming you want a dynamic route for Friends
        aria-label="Go to Friends"
        className={styles.footerItem} // Use the updated class name
      >
        <Image src="/frens.png" alt="Friends" width={50} height={50} />
        <span>Frens</span>
      </Link>
      <Link
        href={`/airdrop/${userId}`} // Assuming you want a dynamic route for Airdrop
        aria-label="Go to Airdrop"
        className={styles.footerItem} // Use the updated class name
      >
        <Image src="/airdrop.png" alt="Airdrop" width={50} height={50} />
        <span>Quest</span>
      </Link>

      {/* Conditionally render the Game link based on the game status */}
      <Link
        href={`/space-invaders/${userId}`} // Dynamic route for game
        aria-label="Go to Game"
        className={styles.footerItem} // Use the updated class name
        disabled={!canStartGame} // Disable the link if game cannot start
        style={{
          pointerEvents: canStartGame ? "auto" : "none", // Disable interaction if not ready
          opacity: canStartGame ? 1 : 0.5, // Make the link less visible if not ready
        }}
      >
        <span>
          {canStartGame
            ? "Game"
            : `Not Ready - Wait ${formatTime(remainingTime)}`}
        </span>
      </Link>
    </div>
  );
};

export default Footer;
