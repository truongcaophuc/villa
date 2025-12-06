"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatwootWidget from "@/components/ChatwootWidget";

const SocialMedia = () => {
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [isChatwootOpen, setIsChatwootOpen] = useState(false);
  const chatwootBtnRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const toggleScrollVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollVisible(true);
      } else {
        setIsScrollVisible(false);
      }
    };

    window.addEventListener("scroll", toggleScrollVisibility);
    return () => window.removeEventListener("scroll", toggleScrollVisibility);
  }, []);

  const handleMessengerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      "https://www.facebook.com/profile.php?id=61558045738607",
      "_blank"
    );
  };

  const handleInstagramClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Replace with your Zalo number or Zalo OA link
    window.open("https://www.instagram.com/danangvilla05/", "_blank");
  };

  const handleChatwootClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.$chatwoot) {
      window.$chatwoot.toggle();
      setIsChatwootOpen((prev) => !prev);
      return;
    }
    let elapsed = 0;
    const interval = 100;
    const max = 3000;
    const timer = setInterval(() => {
      elapsed += interval;
      if (window.$chatwoot) {
        window.$chatwoot.toggle();
        setIsChatwootOpen((prev) => !prev);
        clearInterval(timer);
      } else if (elapsed >= max) {
        clearInterval(timer);
      }
    }, interval);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatwootBtnRef.current &&
        chatwootBtnRef.current.contains(event.target as Node)
      ) {
        return;
      }

      const targets: Element[] = [];
      const iframe = document.querySelector("iframe[id^='chatwoot']");
      if (iframe) targets.push(iframe);
      const widgetContainer = document.querySelector("#woot-widget-container");
      if (widgetContainer) targets.push(widgetContainer);
      const chatContainer = document.querySelector("#woot-chat-container");
      if (chatContainer) targets.push(chatContainer);
      const holders = Array.from(
        document.querySelectorAll(".woot-widget-holder, [id^='chatwoot']")
      );
      targets.push(...(holders as Element[]));

      const clickedInside = targets.some(
        (t) => t.contains(event.target as Node) || t === (event.target as Node)
      );

      if (!clickedInside && isChatwootOpen && window.$chatwoot) {
        window.$chatwoot.toggle();
        setIsChatwootOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isChatwootOpen]);

  return (
    <div className="fixed right-4 bottom-10 z-40 flex flex-col space-y-3">
      {/* Messenger Button */}
      <ChatwootWidget />
      <button
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto"
        aria-label="Contact via Messenger"
      >
        <span className="ripple-circle pointer-events-none"></span>
        <span className="ripple-circle ripple-2 pointer-events-none"></span>
        {/* <span className="ripple-circle ripple-3"></span> */}
        {/* Messenger Icon */}
        <img
          src="/icons/messenger.svg"
          alt="Messenger"
          width={50}
          height={50}
          className="w-12 h-12 peer"
          onClick={handleMessengerClick}
        />

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Chat qua Messenger
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>

      <button
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto"
        aria-label="Contact via Instagram"
      >
        <span className="ripple-circle pointer-events-none"></span>
        <span className="ripple-circle ripple-2 pointer-events-none"></span>
        {/* <span className="ripple-circle ripple-3"></span> */}
        {/* Instagram Icon */}
        <img
          src="/icons/instagram.svg"
          alt="Instagram"
          width={50}
          height={50}
          className="w-12 h-12 peer"
          onClick={handleInstagramClick}
        />

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat qua Instagram
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>
      <button
        ref={chatwootBtnRef}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto bg-white"
        aria-label="Contact via Chatwoot"
      >
        <span className="ripple-circle pointer-events-none"></span>
        <span className="ripple-circle ripple-2 pointer-events-none"></span>

        {isChatwootOpen ? (
          // Icon X
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="black"
            className="w-8 h-8 peer"
            onClick={handleChatwootClick}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Logo Chatwoot
          <img
            src="/icons/chatwoot.svg"
            alt="Chatwoot"
            width={50}
            height={50}
            className="w-12 h-12 peer"
            onClick={handleChatwootClick}
          />
        )}

        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat qua Chatwoot
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {isScrollVisible && (
          <motion.button
            onClick={scrollToTop}
            className="group relative w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
            aria-label="Scroll to top"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Arrow Up Icon */}
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>

            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Lên đầu trang
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialMedia;
