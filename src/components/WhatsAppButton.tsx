import { motion } from "framer-motion";

const WhatsAppButton = () => {
  const phoneNumber = "233123456789";
  const message = encodeURIComponent("Hello AtlasWave! I'd like to inquire about your services.");

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.502 1.14 6.742 3.072 9.362L1.06 31.336l6.194-1.98A15.914 15.914 0 0016.004 32C24.826 32 32 24.822 32 16.004 32 7.176 24.826 0 16.004 0zm9.302 22.602c-.39 1.1-1.932 2.014-3.16 2.28-.838.18-1.932.322-5.618-1.208-4.714-1.954-7.744-6.738-7.98-7.05-.226-.312-1.9-2.532-1.9-4.83s1.2-3.428 1.628-3.896c.39-.428.852-.536 1.136-.536.286 0 .572.002.822.016.264.012.618-.1.966.738.39.892 1.322 3.226 1.438 3.462.116.234.196.508.04.82-.156.312-.234.508-.468.782-.234.274-.492.612-.702.822-.234.234-.478.488-.206.958.274.468 1.214 2.002 2.606 3.244 1.79 1.596 3.3 2.09 3.768 2.324.468.234.742.196 1.016-.118.274-.312 1.176-1.37 1.488-1.838.312-.468.624-.39 1.054-.234.43.156 2.762 1.302 3.234 1.538.468.234.782.352.898.546.116.196.116 1.12-.274 2.22z" />
      </svg>
    </motion.a>
  );
};

export default WhatsAppButton;
