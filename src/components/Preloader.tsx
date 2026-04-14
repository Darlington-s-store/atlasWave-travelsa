import { motion } from "framer-motion";
import logo from "@/assets/logo.jpeg";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <motion.img
          src={logo}
          alt="AtlastWave Travel and Tour"
          className="h-20 w-20 rounded-2xl object-cover shadow-lg"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
        />
        <div className="w-32 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Preloader;
