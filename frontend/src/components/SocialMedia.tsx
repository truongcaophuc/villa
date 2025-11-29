"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatwootWidget from "@/components/ChatwootWidget";

const SocialMedia = () => {
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [isChatwootOpen, setIsChatwootOpen] = useState(false);

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

  const handleMessengerClick = () => {
    // Replace with your Facebook page ID or messenger link
    window.open("https://www.messenger.com/t/450573774801640", "_blank");
  };

  const handleZaloClick = () => {
    // Replace with your Zalo number or Zalo OA link
    window.open("https://zalo.me/2163862657855887735", "_blank");
  };

  const handleChatwootClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    if (window.$chatwoot) {
      window.$chatwoot.toggle();
      setIsChatwootOpen((prev) => !prev); // cập nhật trạng thái ngay lập tức
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Lấy phần tử iframe của Chatwoot (widget thật)
      const chatwootIframe = document.querySelector("iframe[id^='chatwoot']");

      if (!chatwootIframe) return;

      // Nếu iframe tồn tại và click không nằm trong nó
      const clickedInsideWidget =
        chatwootIframe.contains(event.target as Node) ||
        chatwootIframe === (event.target as Node);

      // Nếu widget đang mở mà click ra ngoài thì đóng lại
      if (!clickedInsideWidget && window.$chatwoot?.isOpen) {
        window.$chatwoot.toggle();
        setIsChatwootOpen(false); // cập nhật trạng thái ngay lập tức
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="fixed right-4 bottom-10 z-40 flex flex-col space-y-3">
      {/* Messenger Button */}
      <ChatwootWidget />
      <button
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto"
        aria-label="Contact via Messenger"
      >
        <span className="ripple-circle"></span>
        <span className="ripple-circle ripple-2"></span>
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
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat qua Messenger
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>


      <button
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto"
        aria-label="Contact via Zalo"
      >
        <span className="ripple-circle"></span>
        <span className="ripple-circle ripple-2"></span>
        {/* <span className="ripple-circle ripple-3"></span> */}
        {/* Zalo Icon */}
        <img
          src="/icons/instagram.svg"
          alt="Instagram"
          width={50}
          height={50}
          className="w-12 h-12 peer"
          onClick={handleZaloClick}
        />

        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat qua Instagram
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
        </div>
      </button>
      <button
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center shake-phone ripple-auto"
        aria-label="Contact via Chatwoot"
      >
        <span className="ripple-circle"></span>
        <span className="ripple-circle ripple-2"></span>
        {/* <span className="ripple-circle ripple-3"></span> */}
        {isChatwootOpen ? (
          // Icon "X" khi widget đang mở
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-6 h-6 peer"
            onClick={handleChatwootClick}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // Icon Chatwoot khi widget đóng
          <img
            src="/icons/chatwoot.svg"
            alt="Chatwoot"
            width={50}
            height={50}
            className="w-12 h-12 peer"
            onClick={handleChatwootClick}
          />
        )}

        {/* Tooltip */}
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
