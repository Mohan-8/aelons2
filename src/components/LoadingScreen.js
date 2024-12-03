import React from "react";
import styles from "@/styles/LoadingScreen.module.css";
import Image from "next/image";

const LoadingScreen = () => {
  return (
    <div className={styles["loading-screen"]}>
      {/* <Image
        src="/aelo.png"
        alt="LOADING PIC"
        style={{
          marginRight: "10px",
          borderRadius: "50%",
        }}
        width={200}
        height={200}
      /> */}
      <br />
      <div className={styles.loader}></div>{" "}
    </div>
  );
};

export default LoadingScreen;
