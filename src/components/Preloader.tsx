import { useState } from "react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.jpeg";
import preloaderVideo from "@/assets/admin-login-bg.mp4";
import preloaderPoster from "@/assets/GettyImages.webp";

const Preloader = () => {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#061a31]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,165,146,0.25),transparent_28%),linear-gradient(180deg,#0a223f_0%,#061a31_58%,#04101f_100%)]" />

      <motion.img
        src={preloaderPoster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0.18, scale: 1.04 }}
        animate={{ opacity: videoReady ? 0 : 0.22, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      <motion.video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={preloaderPoster}
        initial={{ opacity: 0 }}
        animate={{ opacity: videoReady ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onLoadedData={() => setVideoReady(true)}
      >
        <source src={preloaderVideo} type="video/mp4" />
      </motion.video>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,33,0.3)_0%,rgba(4,17,33,0.62)_65%,rgba(4,17,33,0.88)_100%)]" />

      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-white/12 bg-white/8 px-8 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
        >
          <motion.img
            src={logo}
            alt="AtlastWave Travel and Tour"
            className="h-24 w-24 rounded-[24px] object-cover shadow-card sm:h-28 sm:w-28"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: [1, 1.04, 1], opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.1 }}
          />

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Launching
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-[2rem]">
            AtlastWave
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/68">
            Preparing your travel experience.
          </p>

          <div className="mt-7 w-full overflow-hidden rounded-full bg-white/14">
            <motion.div
              className="h-1.5 rounded-full bg-accent"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Preloader;
