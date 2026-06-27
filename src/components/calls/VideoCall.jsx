import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallStore } from '../../store/callStore';
import {
  MicrophoneIcon, VideoCameraIcon, PhoneXMarkIcon,
  ComputerDesktopIcon, HandRaisedIcon,
} from '@heroicons/react/24/solid';
import {
  MicrophoneIcon as MicOff,
  VideoCameraSlashIcon,
} from '@heroicons/react/24/outline';

const formatDuration = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function VideoCall({ onEnd }) {
  const {
    activeCall, localStream, remoteStream,
    isMuted, isCameraOff, isScreenSharing, callDuration,
    toggleMute, toggleCamera, startScreenShare, stopScreenShare,
  } = useCallStore();

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream)
      localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream)
      remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const other = activeCall?.receiver || activeCall?.caller;

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Remote video (full screen) */}
      <div className="flex-1 relative bg-[#070B14]">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.1) 0%, #070B14 70%)' }}
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/30 mb-4">
              {other?.avatar ? (
                <img src={other.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {other?.fullName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-white text-xl font-bold">{other?.fullName}</p>
            <motion.p
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-indigo-400 text-sm mt-2"
            >
              Connecting...
            </motion.p>
          </div>
        )}

        {/* Top bar overlay */}
        <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)' }}
        >
          <div>
            <p className="text-white font-semibold">{other?.fullName}</p>
            <p className="text-slate-300 text-xs">{formatDuration(callDuration)}</p>
          </div>
          {isScreenSharing && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-600/80 text-white text-xs font-medium border border-indigo-400/30">
              Screen Sharing
            </span>
          )}
        </div>
      </div>

      {/* Local video (PiP) */}
      <motion.div
        drag
        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
        className="absolute top-4 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl z-20 cursor-move"
      >
        {localStream && !isCameraOff ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <VideoCameraSlashIcon className="w-8 h-8 text-slate-500" />
          </div>
        )}
      </motion.div>

      {/* Controls */}
      <div
        className="flex items-center justify-center gap-4 py-6 px-6"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      >
        {/* Mute */}
        <VideoCallBtn
          icon={isMuted ? <MicOff className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
          active={isMuted}
        />

        {/* Camera */}
        <VideoCallBtn
          icon={isCameraOff ? <VideoCameraSlashIcon className="w-5 h-5" /> : <VideoCameraIcon className="w-5 h-5" />}
          label={isCameraOff ? 'Camera On' : 'Camera Off'}
          onClick={toggleCamera}
          active={isCameraOff}
        />

        {/* End call */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onEnd}
          className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-900/50 hover:bg-red-600 transition-colors"
        >
          <PhoneXMarkIcon className="w-6 h-6" />
        </motion.button>

        {/* Screen Share */}
        <VideoCallBtn
          icon={<ComputerDesktopIcon className="w-5 h-5" />}
          label={isScreenSharing ? 'Stop Share' : 'Share'}
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          active={isScreenSharing}
        />

        {/* Raise hand */}
        <VideoCallBtn
          icon={<HandRaisedIcon className="w-5 h-5" />}
          label="Raise Hand"
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

function VideoCallBtn({ icon, label, onClick, active }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-white/10 text-slate-200 border border-white/10 hover:bg-white/20'
        }`}
      >
        {icon}
      </motion.button>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}