import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCallStore } from '../../store/callStore';
import { useSocketStore } from '../../hooks/useSocket';
import { useWebRTC } from '../../hooks/useWebRTC';
import VideoCall from '../../components/calls/VideoCall';
import VoiceCall from '../../components/calls/VoiceCall';
import { motion } from 'framer-motion';

export default function CallScreen() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const { activeCall, endCall: endCallStore } = useCallStore();
  const socket = useSocketStore((s) => s.socket);
  const { startCall, answerCall } = useWebRTC();
  const startedRef = useRef(false); // ✅ double call rokne ke liye

  useEffect(() => {
    if (!activeCall) {
      navigate(-1);
      return;
    }

    // ✅ Sirf ek baar chalega
    if (startedRef.current) return;
    startedRef.current = true;

    if (activeCall.isInitiator && activeCall.receiver?._id) {
      console.log('[CallScreen] Initiator — starting call...');
      startCall(
        activeCall.type === 'video',
        activeCall.receiver._id,
        callId
      );
    }
  }, []);

  useEffect(() => {
    if (!socket || !activeCall || activeCall.isInitiator) return;

    const fromUserId = activeCall.fromUserId || activeCall.caller?._id;
    console.log('[CallScreen] Receiver — waiting for webrtc_offer...');

    const handleOffer = async ({ from, offer, callId: offerCallId }) => {
      if (offerCallId !== callId) return;
      console.log('[CallScreen] webrtc_offer received, answering...');
      await answerCall(
        activeCall.type === 'video',
        from || fromUserId,
        callId,
        offer
      );
    };

    socket.on('webrtc_offer', handleOffer);
    return () => socket.off('webrtc_offer', handleOffer);
  }, [socket, activeCall]);

  useEffect(() => {
    if (!socket) return;

    const handleEnded = () => {
      console.log('[CallScreen] call_ended received');
      endCallStore(socket);
      navigate(-1);
    };

    const handleRejected = () => {
      console.log('[CallScreen] call_rejected received');
      endCallStore(socket);
      navigate(-1);
    };

    socket.on('call_ended', handleEnded);
    socket.on('call_rejected', handleRejected);

    return () => {
      socket.off('call_ended', handleEnded);
      socket.off('call_rejected', handleRejected);
    };
  }, [socket]);

  if (!activeCall) return null;

  const handleEnd = () => {
    endCallStore(socket);
    navigate(-1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#070B14]"
    >
      {activeCall.type === 'video' ? (
        <VideoCall onEnd={handleEnd} />
      ) : (
        <VoiceCall onEnd={handleEnd} />
      )}
    </motion.div>
  );
}