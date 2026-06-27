import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full mx-4",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  closeOnBackdrop = true,
  footer,
  className = "",
}) => {
  const contentRef = useRef(null);

  // close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative z-10 w-full ${sizeMap[size]}
              bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl
              flex flex-col max-h-[90vh] ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient top bar */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent rounded-t-2xl" />

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                {title && (
                  <h2 className="text-white font-semibold text-base">{title}</h2>
                )}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 py-4 border-t border-white/10 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ── Confirm Dialog ──────────────────────────────────────────────────────────
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-slate-400 text-sm leading-relaxed mb-5">{message}</p>
    <div className="flex gap-3 justify-end">
      <button
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors disabled:opacity-40"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2 ${
          danger
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-indigo-600 hover:bg-indigo-500 text-white"
        }`}
      >
        {loading && (
          <motion.div
            className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
        )}
        {confirmText}
      </button>
    </div>
  </Modal>
);

export default Modal;