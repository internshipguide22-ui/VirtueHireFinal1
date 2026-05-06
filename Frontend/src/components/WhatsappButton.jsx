import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsappButton = () => {
  const phoneNumber = "9876543210"; // Placeholder number
  const message = "Hello! I'm interested in Virtue Hire.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "60px",
        height: "60px",
        backgroundColor: "#25d366",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        zIndex: 9999,
        color: "white",
        textDecoration: "none",
      }}
      title="Chat on WhatsApp"
    >
      <MessageCircle size={32} fill="white" />
    </motion.a>
  );
};

export default WhatsappButton;
