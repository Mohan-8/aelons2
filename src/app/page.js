"use client";
import React, { useEffect } from "react";
import App from "@/components/App";
import "./globals.css";

const Home = () => {
  const warnUser = () => {
    alert("It's not allowed.");
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Block the Ctrl + C, Ctrl + U, Ctrl + I, and F12 keys
      if (
        event.ctrlKey &&
        (event.key === "c" ||
          event.key === "u" ||
          event.key === "i" ||
          event.key === "I" ||
          (event.key === "t" && event.shiftKey))
      ) {
        event.preventDefault(); // Prevent the default action
        warnUser();
      }

      // Also block the F12 key without Ctrl
      if (event.key === "F12") {
        event.preventDefault();
        warnUser();
      }

      // Block Shift + Ctrl + T
      if (event.ctrlKey && event.shiftKey && event.key === "T") {
        event.preventDefault();
        warnUser();
      }
    };

    const handleContextMenu = (event) => {
      event.preventDefault();
      warnUser();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div>
      <App />
    </div>
  );
};

export default Home;
