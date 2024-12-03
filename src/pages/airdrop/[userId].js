import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "@/app/globals.css";
import Footer from "@/components/Footer";
import Image from "next/image";
import styles from "@/styles/airdrop.module.css";
import {
  handleAirdropAction as apiHandleAirdropAction,
  fetchAirdropStatus,
  submitSolanaAddress,
  fetchSolanaInfo,
} from "@/services/api";

const Toast = ({ message, onClose }) => (
  <div className={styles["toast-overlay"]}>
    <div className={styles.toast}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  </div>
);

const Airdrop = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [solanaClaimed, setSolanaClaimed] = useState(false);
  const [toast, setToast] = useState({ message: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [solanaAddress, setSolanaAddress] = useState("");
  const [userData, setUserData] = useState({
    rewards: 0,
    airdropClaimed: [false, false, false, false, false],
    solanaAddress: "",
  });

  useEffect(() => {
    fetchSolanaInfo(userId)
      .then((data) => {
        // console.log(data);
        const { solanaAddress, solanaClaimed } = data;
        setSolanaAddress(solanaAddress || "");
        setSolanaClaimed(solanaClaimed);
      })
      .catch((error) => console.error("Error fetching Solana info:", error));
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const data = await fetchAirdropStatus(userId);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  const handleBack = () => {
    router.push(`/?userId=${userId}`);
  };

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  const handleAirdropAction = async (action) => {
    if (loading) return; // Prevent further actions if already loading

    setLoading(true); // Set loading to true
    try {
      const data = await apiHandleAirdropAction(userId, action); // Call the imported function
      const actionIndex = {
        buyRaydium: 0,
        buyTelegram: 1,
        followTwitter: 2,
        joinTelegram: 3,
        visitWebsite: 4,
        LikeTwitter:5,
      }[action];

      // Update userData state
      setUserData((prevData) => ({
        ...prevData,
        rewards: prevData.rewards + data.rewards,
        airdropClaimed: prevData.airdropClaimed.map((claimed, index) =>
          actionIndex === index ? true : claimed
        ),
      }));
      // Show a success message or toast
      setToast({
        message: `Success! You now have ${data.rewards} Aelon.`,
        visible: true,
      });
    } catch (error) {
      console.error("Error claiming action:", error);
      setToast({
        message: "Error claiming Aelon. Please try again.",
        visible: true,
      });
    } finally {
      setLoading(false); // Reset loading status
    }
  };

  const handleSolanaAddressSubmit = async () => {
    if (loading || !solanaAddress) return;

    setLoading(true);
    try {
      const data = await submitSolanaAddress(userId, solanaAddress);
      setUserData((prevData) => ({
        ...prevData,
        rewards: prevData.rewards + 2000,
        solanaAddress: solanaAddress,
      }));
      setToast({
        message: `Solana address submitted successfully! You received 2000 Aelon.`,
        visible: true,
      });
    } catch (error) {
      console.error("Error submitting Solana address:", error);
      setToast({
        message: "Error submitting Solana address. Please try again.",
        visible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.airdropContainer}>
      {toast.visible && (
        <Toast
          message={toast.message}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Image
        width={50}
        height={50}
        src="/back.png"
        alt="Back"
        className={styles.backIcon}
        onClick={handleBack}
      />
      <h2>Quest</h2>
      <br />
      <br />
      <div className={styles.buttonContainer}>
        <div className={styles.buttonBox}>
          <span className={styles.label}>Buy from Raydium: 5000</span>
          <button
            className={`${styles.walletButton} ${styles.raydiumButton}`}
            onClick={() => {
              openLink(
                "https://raydium.io/swap/?inputMint=sol&outputMint=E762M7pP5vBTfLBiqr1M7isvJYZ3moGZ7rxhgy93o5dS"
              );
              if (!userData.airdropClaimed[0]) {
                handleAirdropAction("buyRaydium");
              }
            }}
            disabled={loading}
          >
            {userData.airdropClaimed[0] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
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
            )}
          </button>
        </div>

        <div className={styles.buttonBox}>
          <span className={styles.label}>Buy from Telegram: 5000</span>
          <button
            className={`${styles.walletButton} ${styles.telegramButton}`}
            onClick={() => {
              openLink("https://t.me/solana_trojanbot");
              if (!userData.airdropClaimed[1]) {
                handleAirdropAction("buyTelegram");
              }
            }}
            disabled={loading}
          >
            {userData.airdropClaimed[1] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
              <Image width={20} height={20} src="/tel.png" alt="Telegram" />
            )}
          </button>
        </div>

        <div className={styles.buttonBox}>
          <span className={styles.label}>Follow us on Twitter: 2500</span>
          <button
            className={`${styles.walletButton} ${styles.twitterButton}`}
            onClick={() => {
              openLink("https://x.com/AELON177");
              if (!userData.airdropClaimed[2]) {
                handleAirdropAction("followTwitter");
              }
            }}
            disabled={loading}
          >
            {userData.airdropClaimed[2] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
              <Image width={20} height={20} src="/x.png" alt="Twitter" />
            )}
          </button>
        </div>
        <div className={styles.buttonBox}>
          <span className={styles.label}>
            Like and Retweet on Twitter: 2000
          </span>
          <button
            className={`${styles.walletButton} ${styles.twitterButton}`}
            onClick={() => {
              openLink(
                "https://x.com/aelon177/status/1855543958614462920?s=48&t=NRs4jqHTvFL05iric2G06Q"
              );
              if (!userData.airdropClaimed[5]) {
                handleAirdropAction("LikeTwitter");
              }
            }}
          >
            {userData.airdropClaimed[5] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
              <Image width={20} height={20} src="/x.png" alt="Twitter" />
            )}
          </button>
        </div>
        <div className={styles.buttonBox}>
          <span className={styles.label}>Join us on Telegram: 2500</span>
          <button
            className={`${styles.walletButton} ${styles.telegramButton}`}
            onClick={() => {
              openLink("https://t.me/+C4ZoojjuTfUyMTFk");
              if (!userData.airdropClaimed[3]) {
                handleAirdropAction("joinTelegram");
              }
            }}
            disabled={loading}
          >
            {userData.airdropClaimed[3] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
              <Image width={20} height={20} src="/tel.png" alt="Telegram" />
            )}
          </button>
        </div>

        <div className={styles.buttonBox}>
          <span className={styles.label}>Visit our website: 2500</span>
          <button
            className={`${styles.walletButton} ${styles.websiteButton}`}
            onClick={() => {
              openLink("https://aelonx.com/");
              if (!userData.airdropClaimed[4]) {
                handleAirdropAction("visitWebsite");
              }
            }}
            disabled={loading}
          >
            {userData.airdropClaimed[4] ? (
              <Image width={20} height={20} src="/lock_y.png" alt="Claimed" />
            ) : (
              <Image width={20} height={20} src="/website.png" alt="Website" />
            )}
          </button>
        </div>

        <div className={styles.inputBox}>
          {!userData.solanaAddress && !solanaClaimed ? (
            <>
              <input
                type="text"
                placeholder="Enter the Solana address for airdrop"
                value={solanaAddress}
                onChange={(e) => setSolanaAddress(e.target.value)}
                required
              />
              <button onClick={handleSolanaAddressSubmit}>↵</button>
            </>
          ) : (
            <span className={styles.solanaAddress}>
              {solanaAddress ? (
                <>
                  <span>{solanaAddress.slice(0, 22)}</span>
                  <br />
                  <span>{solanaAddress.slice(22, 44)}</span>
                </>
              ) : (
                "No Solana address found"
              )}
            </span>
          )}
        </div>
      </div>
      <Footer userId={userId} />
    </div>
  );
};

export default Airdrop;
