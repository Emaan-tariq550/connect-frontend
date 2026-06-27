import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useCallStore = create((set, get) => ({
  activeCall:       null,
  incomingCall:     null,
  callHistory:      [],
  localStream:      null,
  remoteStream:     null,
  peerConnection:   null,
  isMuted:          false,
  isCameraOff:      false,
  isScreenSharing:  false,
  callDuration:     0,
  durationInterval: null,

  setIncomingCall: (call) => set({ incomingCall: call }),
  setActiveCall:   (call) => set({ activeCall: call }),
  setLocalStream:  (s)    => set({ localStream: s }),
  setRemoteStream: (s)    => set({ remoteStream: s }),
  setPeer:         (pc)   => set({ peerConnection: pc }),

  startDurationTimer: () => {
    const interval = setInterval(() =>
      set((s) => ({ callDuration: s.callDuration + 1 })), 1000);
    set({ durationInterval: interval, callDuration: 0 });
  },

  stopDurationTimer: () => {
    const { durationInterval } = get();
    if (durationInterval) clearInterval(durationInterval);
    set({ durationInterval: null, callDuration: 0 });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    localStream?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    set({ isMuted: !isMuted });
  },

  toggleCamera: () => {
    const { localStream, isCameraOff } = get();
    localStream?.getVideoTracks().forEach((t) => { t.enabled = isCameraOff; });
    set({ isCameraOff: !isCameraOff });
  },

  startScreenShare: async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const { peerConnection, localStream } = get();
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(videoTrack);
      videoTrack.onended = () => get().stopScreenShare();
      set({ isScreenSharing: true });
    } catch {
      toast.error('Screen share denied');
    }
  },

  stopScreenShare: async () => {
    const { peerConnection, localStream } = get();
    const videoTrack = localStream?.getVideoTracks()[0];
    const sender = peerConnection?.getSenders().find((s) => s.track?.kind === 'video');
    if (sender && videoTrack) sender.replaceTrack(videoTrack);
    set({ isScreenSharing: false });
  },

  initiateCall: async (receiverId, receiverInfo, type, socket) => {
  try {
    return new Promise((resolve) => {
      console.log('[initiateCall] emitting initiate_call:', receiverId, type);

      // ✅ FIX: 'once' ki jagah seedha emit karo
      // aur call_initiated useSocket mein already sun raha hai
      // toh hum khud bhi sunein ge — lekin PEHLE listener lagao, phir emit
      
      const handler = ({ callId }) => {
        console.log('[initiateCall] call_initiated received:', callId);
        const call = {
          _id: callId,
          type,
          receiver: receiverInfo,
          caller: null,
          isInitiator: true,
        };
        set({ activeCall: call });
        resolve(call);
      };

      // ✅ pehle listener lagao
      socket?.once('call_initiated', handler);
      
      // phir emit karo
      socket?.emit('initiate_call', { toUserId: receiverId, type });

      // timeout pe cleanup bhi karo
      setTimeout(() => {
        socket?.off('call_initiated', handler);
        console.log('[initiateCall] TIMEOUT');
        resolve(null);
      }, 5000);
    });
  } catch {
    toast.error('Failed to start call');
    return null;
  }
},

  endCall: (socket) => {
    const { activeCall, localStream, peerConnection, stopDurationTimer } = get();
    try {
      localStream?.getTracks().forEach((t) => t.stop());
      peerConnection?.close();
      stopDurationTimer();
      if (activeCall?._id) {
        socket?.emit('end_call', { callId: activeCall._id });
      }
    } catch {}
    set({
      activeCall:      null,
      incomingCall:    null,
      localStream:     null,
      remoteStream:    null,
      peerConnection:  null,
      isMuted:         false,
      isCameraOff:     false,
      isScreenSharing: false,
    });
  },

  fetchCallHistory: async () => {},
}));