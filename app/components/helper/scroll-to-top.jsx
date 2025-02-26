"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa6";

const SCROLL_THRESHOLD = 50;

const ScrollToTop = () => {
  const [btnVisible, setBtnVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // Ensure the component only renders on the client

    const handleScroll = () => {
      setBtnVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!hasMounted) return null; // Prevent SSR rendering mismatch

  return (
    <button
      className={`fixed bottom-8 right-6 z-50 flex items-center rounded-full bg-[#046a38] p-4 hover:text-xl transition-all duration-300 ease-out ${
        btnVisible ? "block" : "hidden"
      }`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTop;