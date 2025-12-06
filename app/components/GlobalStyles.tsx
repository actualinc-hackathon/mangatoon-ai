"use client";

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      @import url("https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&family=Noto+Sans+JP:wght@400;700;900&display=swap");

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Noto Sans JP", sans-serif;
        background: #0a0a0a;
        min-height: 100vh;
        color: #ffffff;
        overflow-x: hidden;
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-10px) rotate(2deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes speedLines {
        0% {
          background-position: 0% 50%;
        }
        100% {
          background-position: 100% 50%;
        }
      }

      .manga-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .manga-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s;
      }

      .manga-btn:hover::before {
        left: 100%;
      }

      .feature-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      .feature-card:hover {
        transform: translateY(-8px) scale(1.02);
      }

      .halftone {
        background-image: radial-gradient(
          circle,
          #ff2d2d 1px,
          transparent 1px
        );
        background-size: 8px 8px;
      }

      .speed-lines {
        background: repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(255, 45, 45, 0.1) 2px,
          rgba(255, 45, 45, 0.1) 4px
        );
      }
    `}</style>
  );
}

