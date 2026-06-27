import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallStore } from '../../store/callStore';
import { useSocketStore } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useNavigate } from 'react-router-dom';
import {
  PhoneIcon, PhoneXMarkIcon, VideoCameraIcon,
} from '@heroicons/react/24/solid';

export default function IncomingCall() {
  const { incomingCall, setIncomingCall, setActiveCall } = useCallStore();
  const socket = useSocketStore((s) => s.socket);
  const { answerCall } = useWebRTC();
  const navigate = useNavigate();
  const [pendingOffer, setPendingOffer] = useState(null);

  // Offer aane pe store karo
  useEffect(() => {
    if (!socket || !incomingCall) return;
    const handler = ({ offer }) => {
      console.log('[IncomingCall] webrtc_offer received, storing...');
      setPendingOffer(offer);
    };
    socket.on('webrtc_offer', handler);
    return () => socket.off('webrtc_offer', handler);
  }, [socket, incomingCall]);

  const handleAccept = async () => {
    try {
      const callId = incomingCall._id;
      const fromUserId = incomingCall.caller?._id || incomingCall.initiator;

      setActiveCall({
        _id: callId,
        type: incomingCall.type,
        caller: incomingCall.caller,
        receiver: null,
        isInitiator: false,
        fromUserId, // CallScreen ko chahiye
      });

      socket?.emit('accept_call', { callId });
      setIncomingCall(null);
      navigate(`/call/${callId}`);

      // Agar offer pehle aa chuka hai to seedha answer karo
      if (pendingOffer) {
        console.log('[IncomingCall] offer already here, answering immediately...');
        await answerCall(
          incomingCall.type === 'video',
          fromUserId,
          callId,
          pendingOffer
        );
      }
    } catch (err) {
      console.error('[IncomingCall] handleAccept error:', err);
      handleDecline();
    }
  };

  const handleDecline = () => {
    socket?.emit('reject_call', { callId: incomingCall?._id });
    setIncomingCall(null);
    setPendingOffer(null);
  };

  const caller = incomingCall?.caller;

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          initial={{ opacity: 0, y: -80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -80, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[340px]"
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/60"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 100%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-indigo-600"
              />
            </div>

            <div className="relative p-6">
              <div className="flex justify-center mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
                  {incomingCall.type === 'video'
                    ? <><VideoCameraIcon className="w-3.5 h-3.5" /> Incoming Video Call</>
                    : <><PhoneIcon className="w-3.5 h-3.5" /> Incoming Voice Call</>
                  }
                </span>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-3">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-500"
                  />
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-white/10 relative z-10">
                    {caller?.avatar ? (
                      <img src={caller.avatar} alt={caller.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {caller?.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg">{caller?.fullName}</h3>
                <p className="text-slate-400 text-sm">@{caller?.username}</p>
              </div>

              <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleDecline}
                    className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <PhoneXMarkIcon className="w-6 h-6" />
                  </motion.button>
                  <span className="text-xs text-slate-500">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleAccept}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg"
                  >
                    {incomingCall.type === 'video'
                      ? <VideoCameraIcon className="w-6 h-6" />
                      : <PhoneIcon className="w-6 h-6" />
                    }
                  </motion.button>
                  <span className="text-xs text-slate-500">Accept</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}