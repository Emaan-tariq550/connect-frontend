import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import EmojiPicker from 'emoji-picker-react';
import { useChatStore } from '../../store/chatStore';

export default function MessageInput({
  onSend,
  onTyping,
  replyTo,
  editMsg,
  onCancelReply,
  onCancelEdit,
  chatId,
}) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [sending, setSending] = useState(false);

  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const mediaRef = useRef(null);
  const typingTimeout = useRef(null);
  const recorderRef = useRef(null);
  const recordInterval = useRef(null);
  const chunksRef = useRef([]);

  // Populate input for editing
  useEffect(() => {
    if (editMsg) {
  setText(editMsg.text || editMsg.content || '');
      textareaRef.current?.focus();
    }
  }, [editMsg]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleTyping = (val) => {
    setText(val);
    onTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/') || f.type.startsWith('video/')) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !file) || sending) return;
    setSending(true);
    const type = file
      ? file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : file.type.startsWith('audio/')
        ? 'audio'
        : 'file'
      : 'text';

    await onSend(text.trim(), file, type);
    setText('');
    setFile(null);
    setFilePreview(null);
    setSending(false);
    onTyping(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
        setFile(audioFile);
        setFilePreview(null);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);
      recordInterval.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      alert('Microphone permission denied');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    clearInterval(recordInterval.current);
    setIsRecording(false);
  };

  const formatRecordTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const canSend = text.trim() || file;

  return (
    <div className="px-4 pb-4 pt-2 bg-[#0F172A] border-t border-white/5">
      {/* Reply Banner */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-indigo-900/20 border border-indigo-500/20"
          >
            <div className="w-0.5 h-8 bg-indigo-500 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-indigo-400">
                Reply to {replyTo.sender?.fullName?.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-400 truncate">{replyTo.text || replyTo.content || '📎 Media'}</p>
            </div>
            <button onClick={onCancelReply} className="text-slate-500 hover:text-white">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {editMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-amber-900/20 border border-amber-500/20"
          >
            <div className="w-0.5 h-8 bg-amber-500 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-400">Editing message</p>
              <p className="text-xs text-slate-400 truncate">{editMsg.content}</p>
            </div>
            <button onClick={onCancelEdit} className="text-slate-500 hover:text-white">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 p-2 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3"
          >
            {filePreview ? (
              <img src={filePreview} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-white/8 flex items-center justify-center">
                <span className="text-xl">{file.type.startsWith('audio') ? '🎤' : '📄'}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={() => { setFile(null); setFilePreview(null); }} className="text-slate-500 hover:text-red-400">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-2 flex items-center gap-3 px-4 py-2 rounded-xl bg-red-900/20 border border-red-500/20"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400 font-medium">Recording {formatRecordTime(recordSeconds)}</span>
            <button onClick={stopRecording} className="ml-auto text-xs text-slate-400 hover:text-white border border-white/10 rounded-lg px-2 py-1">
              Stop & Send
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar */}
      <div className="flex items-end gap-2">
        {/* Attachment */}
        <div className="flex items-center gap-1 flex-shrink-0 pb-1">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <input ref={mediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFile} />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => fileRef.current?.click()}
            className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <PaperClipIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => mediaRef.current?.click()}
            className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Text Input */}
        <div className="flex-1 relative flex items-end bg-white/6 border border-white/10 rounded-2xl focus-within:border-indigo-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 resize-none py-3 pl-4 pr-2 focus:outline-none leading-5 max-h-[120px] custom-scrollbar"
          />

          {/* Emoji */}
          <div className="relative pb-1 pr-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEmoji((v) => !v)}
              className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-yellow-400 transition-colors"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-12 right-0 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    width={300}
                    height={350}
                    previewConfig={{ showPreview: false }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Send / Mic */}
        <div className="flex-shrink-0 pb-1">
          <AnimatePresence mode="wait">
            {canSend ? (
              <motion.button
                key="send"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={sending}
                className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60 transition-shadow disabled:opacity-60"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.9 }}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-2.5 rounded-xl transition-colors ${
                  isRecording
                    ? 'bg-red-600 text-white'
                    : 'bg-white/8 text-slate-400 hover:bg-white/12 hover:text-white'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}