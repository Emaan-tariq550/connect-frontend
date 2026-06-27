import { motion } from "framer-motion";

const variants = {
  spinner: null,
  dots: null,
  pulse: null,
  bar: null,
};

const Loader = ({ type = "spinner", size = "md", text = "", fullScreen = false }) => {
  const sizes = {
    sm: "w-5 h-5",
    md: "w-9 h-9",
    lg: "w-14 h-14",
  };

  const Spinner = () => (
    <div className={`${sizes[size]} relative`}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-1 rounded-full border-2 border-transparent border-t-purple-400"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );

  const Dots = () => (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-indigo-500"
          animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </div>
  );

  const Pulse = () => (
    <div className={`${sizes[size]} relative flex items-center justify-center`}>
      <motion.div
        className="absolute inset-0 rounded-full bg-indigo-500/30"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="w-3 h-3 rounded-full bg-indigo-500" />
    </div>
  );

  const Bar = () => (
    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
        animate={{ x: ["-100%", "400%"] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  const loaderMap = { spinner: Spinner, dots: Dots, pulse: Pulse, bar: Bar };
  const LoaderComponent = loaderMap[type] || Spinner;

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <LoaderComponent />
      {text && (
        <motion.p
          className="text-sm text-slate-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CONNECT
            </h1>
            <p className="text-xs text-slate-600 mt-1">by Emaan</p>
          </motion.div>
          <LoaderComponent />
          {text && <p className="text-sm text-slate-500">{text}</p>}
        </div>
      </motion.div>
    );
  }

  return content;
};

export default Loader;