import { motion } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import preloaderVideo from "@/assets/admin-login-bg.mp4";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-primary">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={preloaderVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-primary/25" />
      <motion.img
        src={logo}
        alt="AtlasWave"
        className="relative z-10 h-36 w-36 rounded-full object-cover shadow-card sm:h-44 sm:w-44"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: [1, 1.08, 1] }}
        transition={{ duration: 1.15, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.08 }}
      />
    </div>
  );
};

export default Preloader;
