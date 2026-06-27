import { useCallback } from 'react';
import { useCallStore } from '../store/callStore';
import { useSocketStore } from './useSocket';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC() {
  const socket = useSocketStore((s) => s.socket);
  const {
    setLocalStream, setRemoteStream, setPeer,
  } = useCallStore();

  const getMedia = useCallback(async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video,
      });
      console.log('[getMedia] stream got:', stream);
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('[getMedia] ERROR:', err.name, err.message);
      throw err;
    }
  }, [setLocalStream]);

  const startCall = useCallback(async (video = true, toUserId, callId) => {
    console.log('[startCall] called — video:', video, 'toUserId:', toUserId, 'callId:', callId);
    console.log('[startCall] socket:', socket?.id, 'connected:', socket?.connected);
    try {
      console.log('[startCall] getting media...');
      const stream = await getMedia(video);
      console.log('[startCall] got stream ✅');

      const pc = new RTCPeerConnection(ICE_SERVERS);
      setPeer(pc);
      console.log('[startCall] peer created ✅');

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        console.log('[startCall] remote track received ✅');
        setRemoteStream(e.streams[0]);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('[startCall] sending ICE candidate');
          socket?.emit('webrtc_ice', {
            to: toUserId,
            candidate: e.candidate,
            callId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('[startCall] connection state:', pc.connectionState);
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[startCall] offer created, emitting webrtc_offer to:', toUserId);

      socket?.emit('webrtc_offer', { to: toUserId, offer, callId });

      socket?.once('webrtc_answer', async ({ answer }) => {
        console.log('[startCall] got webrtc_answer ✅');
        if (pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log('[startCall] remote description set ✅');
        }
      });

      socket?.on('webrtc_ice', async ({ candidate }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[startCall] ICE candidate added ✅');
        } catch {}
      });

    } catch (err) {
      console.error('[startCall] ERROR:', err.name, err.message);
    }
  }, [socket, getMedia, setPeer, setRemoteStream]);

  const answerCall = useCallback(async (video = true, fromUserId, callId, offer) => {
    console.log('[answerCall] called — video:', video, 'fromUserId:', fromUserId, 'callId:', callId);
    console.log('[answerCall] socket:', socket?.id, 'connected:', socket?.connected);
    try {
      console.log('[answerCall] getting media...');
      const stream = await getMedia(video);
      console.log('[answerCall] got stream ✅');

      const pc = new RTCPeerConnection(ICE_SERVERS);
      setPeer(pc);
      console.log('[answerCall] peer created ✅');

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        console.log('[answerCall] remote track received ✅');
        setRemoteStream(e.streams[0]);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('[answerCall] sending ICE candidate');
          socket?.emit('webrtc_ice', {
            to: fromUserId,
            candidate: e.candidate,
            callId,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('[answerCall] connection state:', pc.connectionState);
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[answerCall] remote description set ✅');

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('[answerCall] answer created, emitting webrtc_answer to:', fromUserId);

      socket?.emit('webrtc_answer', { to: fromUserId, answer, callId });

      socket?.on('webrtc_ice', async ({ candidate }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[answerCall] ICE candidate added ✅');
        } catch {}
      });

    } catch (err) {
      console.error('[answerCall] ERROR:', err.name, err.message);
    }
  }, [socket, getMedia, setPeer, setRemoteStream]);

  return { getMedia, startCall, answerCall };
}