import { motion } from "framer-motion";
import logo from "@/assets/logo.jpeg";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <motion.img
        src={logo}
        alt="AtlastWave Travel and Tour"
        className="h-24 w-24 rounded-2xl object-cover shadow-lg"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
      />
    </div>
  );
};

export default Preloader;
