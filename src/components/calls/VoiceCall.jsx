import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCallStore } from '../../store/callStore';
import {
  MicrophoneIcon, SpeakerWaveIcon,
  PhoneXMarkIcon, ArrowsPointingOutIcon,
} from '@heroicons/react/24/solid';
import { MicrophoneIcon as MicOff } from '@heroicons/react/24/outline';

const formatDuration = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export default function VoiceCall({ onEnd }) {
  const { activeCall, isMuted, toggleMute, callDuration, remoteStream } = useCallStore();
  const other = activeCall?.receiver || activeCall?.caller;

  useEffect(() => {
    if (remoteStream) {
      const audio = document.getElementById('remote-audio');
      if (audio) audio.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center justify-between h-full bg-[#070B14] px-6 py-12"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(99,102,241,0.12) 0%, #070B14 70%)',
      }}
    >
      <audio id="remote-audio" autoPlay />

      {/* Top info */}
      <div className="text-center">
        <p className="text-slate-400 text-sm mb-1">Voice Call</p>
        <p className="text-slate-500 text-xs">{formatDuration(callDuration)}</p>
      </div>

      {/* Avatar with rings */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1 + i * 0.15, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              className="absolute inset-0 rounded-full border border-indigo-500"
            />
          ))}
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 relative z-10">
            {other?.avatar ? (
              <img src={other.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {other?.fullName?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white font-poppins">{other?.fullName}</h2>
          <p className="text-slate-400 mt-1">@{other?.username}</p>
        </div>

        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-indigo-400 text-sm"
        >
          {remoteStream ? 'Connected' : 'Connecting...'}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <CallButton
          icon={isMuted ? <MicOff className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={toggleMute}
          active={isMuted}
          variant="default"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-900/50 hover:bg-red-600 transition-colors"
        >
          <PhoneXMarkIcon className="w-7 h-7" />
        </motion.button>

        <CallButton
          icon={<SpeakerWaveIcon className="w-6 h-6" />}
          label="Speaker"
          onClick={() => {}}
          variant="default"
        />
      </div>
    </div>
  );
}

function CallButton({ icon, label, onClick, active, variant }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`w-13 h-13 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-all ${
          active
            ? 'bg-indigo-600 text-white'
            : 'bg-white/8 text-slate-300 border border-white/10 hover:bg-white/12'
        }`}
      >
        {icon}
      </motion.button>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}