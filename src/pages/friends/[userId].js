import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import "@/app/globals.css";
import styles from "@/styles/Friends.module.css";
import Image from "next/image";
import { fetchReferredCount, claimReferralReward } from "@/services/api";

// Toast Component
const Toast = ({ message, onClose }) => (
  <div className={styles["toast-overlay"]}>
    <div className={styles.toast}>
      {message}
      <button onClick={onClose}>&times;</button>
    </div>
  </div>
);

const Friends = () => {
  const router = useRouter();
  const { userId } = router.query;

  const [referredCount, setReferredCount] = useState(0);
  const [rewards, setRewards] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);
  const [claimedStatus, setClaimedStatus] = useState([
    false,
    false,
    false,
    false,
    false,
  ]); // Claim status for each milestone
  const [toastMessage, setToastMessage] = useState(""); // State for toast message

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      fetchReferredCount(userId)
        .then((data) => {
          if (data) {
            setReferredCount(data.referredCount);
            const newRewards = calculateRewards(data.referredCount);
            setRewards(newRewards);
            setClaimedStatus(
              data.refRewardClaimed || [false, false, false, false, false]
            ); // Update from backend response
          }
        })
        .catch((err) => {
          console.error("Failed to fetch referral count:", err);
          alert("Failed to fetch referral count. Please try again later.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId]);

  const rewardsArray = [250, 1000, 2500, 6000, 21550];

  const calculateRewards = (count) => {
    const milestones = [1, 3, 5, 10, 25];
    return milestones.map((milestone, index) => {
      if (count >= milestone) {
        return rewardsArray[index];
      }
      return 0;
    });
  };

  const handleCopyReferralLink = () => {
    const referralLink = `https://t.me/aelon_bot?start=${userId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(referralLink)
        .then(() => {
          setToastMessage("Referral link copied to clipboard!"); // Show success toast
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          fallbackCopyTextToClipboard(referralLink);
        });
    } else {
      fallbackCopyTextToClipboard(referralLink);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setToastMessage("Referral link copied to clipboard!"); // Show success toast
    } catch (err) {
      console.error("Fallback: Oops, unable to copy", err);
    }

    document.body.removeChild(textArea);
  };

  const handleBack = () => {
    router.push(`/?userId=${userId}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const onClaimReward = async (index) => {
    try {
      const response = await claimReferralReward(userId, index);
      if (response && response.rewards !== undefined) {
        setClaimedStatus((prev) => {
          const newStatus = [...prev];
          newStatus[index] = true; // Lock the button for this milestone
          return newStatus;
        });
        setToastMessage(`Claimed ${rewardsArray[index]} Aelon!`); // Show success toast
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setToastMessage("Failed to claim reward. Please try again later."); // Show error toast
    }
  };

  return (
    <div>
      <Image
        width={30}
        height={30}
        src="/back.png"
        alt="Back"
        style={{ cursor: "pointer" }}
        onClick={handleBack}
      />
      <h2>Frens</h2>
      <div className={styles["referral-section"]}>
        <h3>Invite Your Friends</h3>
        <p>
          Share your referral link with friends and earn rewards when they sign
          up!
        </p>
        <div className={styles["referral-link-container"]}>
          <input
            type="text"
            value={`https://t.me/aelon_bot?start=${userId}`}
            readOnly
          />
          <button onClick={handleCopyReferralLink}>Copy Link</button>
        </div>
        <p>
          You&apos;ve referred <strong>{referredCount}</strong> friends so far!
        </p>
        <div className={styles["milestone-container"]}>
          {rewards.map((reward, index) => (
            <div key={index} className={styles["milestone-box"]}>
              <p>
                <strong>
                  Reward for{" "}
                  {index === 0
                    ? 1
                    : index === 1
                    ? 3
                    : index === 2
                    ? 5
                    : index === 3
                    ? 10
                    : 25}{" "}
                  referrals:
                </strong>{" "}
                {rewardsArray[index]}
              </p>
              {referredCount >= [1, 3, 5, 10, 25][index] ? (
                claimedStatus[index] ? (
                  <Image
                    src="/lock.png"
                    alt="Reward Claimed"
                    width={20}
                    height={20}
                  />
                ) : (
                  <button
                    onClick={() => {
                      if (!claimedStatus[index]) {
                        onClaimReward(index);
                      }
                    }}
                    className={styles["claim-button"]}
                    disabled={claimedStatus[index]} // Disable button after claiming
                  >
                    Claim
                  </button>
                )
              ) : (
                <Image src="/lock.png" alt="Locked" width={20} height={20} />
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer userId={userId} />

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
};

export default Friends;
