import { useEffect, useRef, useState } from "react";
import {
  Hash,
  Lock,
  Send,
  Paperclip,
  Smile,
  X,
  Trash2,
  Edit2,
  CornerUpLeft,
  Check,
} from "lucide-react";
import axios from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import { useSocket } from "../../contexts/SocketContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import { ConfirmModal } from "../common/Modal";

const ChannelChat = ({ channel, community }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const bottomRef     = useRef(null);
  const fileRef       = useRef(null);
  const textareaRef   = useRef(null);
  const typingTimeout = useRef(null);
  const typingTimers  = useRef({});

  const [messages,      setMessages]      = useState([]);
  const [text,          setText]          = useState("");
  const [sending,       setSending]       = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [showEmoji,     setShowEmoji]     = useState(false);
  const [replyTo,       setReplyTo]       = useState(null);
  const [editingMsg,    setEditingMsg]    = useState(null);
  const [editText,      setEditText]      = useState("");
  const [hoveredMsg,    setHoveredMsg]    = useState(null);
  const [typingUsers,   setTypingUsers]   = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/channels/${channel._id}/messages?page=1&limit=40`);
      setMessages(res.data.messages || []);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!channel?._id) return;
    setMessages([]);
    setLoading(true);
    fetchMessages();
  }, [channel?._id]);

  useEffect(() => {
    if (!socket || !channel?._id) return;

    socket.emit("join_channel", channel._id);

    const onMessage  = (msg) => setMessages((prev) => [...prev, msg]);

    const onEdited   = ({ messageId, content }) =>
      setMessages((prev) =>
        prev.map((m) => m._id === messageId ? { ...m, content, isEdited: true } : m)
      );

    const onDeleted  = ({ messageId }) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId));

    const onTyping   = ({ userId, username }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) => {
        const exists = prev.find((u) => u.userId === userId);
        if (exists) return prev.map((u) => u.userId === userId ? { ...u, username } : u);
        return [...prev, { userId, username }];
      });
      clearTimeout(typingTimers.current[userId]);
      typingTimers.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }, 3000);
    };

    socket.on("channel_message",         onMessage);
    socket.on("channel_message_edited",  onEdited);
    socket.on("channel_message_deleted", onDeleted);
    socket.on("channel_typing",          onTyping);

    return () => {
      socket.emit("leave_channel", channel._id);
      socket.off("channel_message",         onMessage);
      socket.off("channel_message_edited",  onEdited);
      socket.off("channel_message_deleted", onDeleted);
      socket.off("channel_typing",          onTyping);
      clearTimeout(typingTimeout.current);
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [socket, channel?._id, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [text]);

  const handleTyping = () => {
    if (!socket || !channel?._id) return;
    socket.emit("channel_typing", { channelId: channel._id, username: user.username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 1000);
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    try {
      setSending(true);
      const body = { content: text.trim() };
      if (replyTo) body.replyTo = replyTo._id;
      await axios.post(`/channels/${channel._id}/messages`, body);
      setText("");
      setReplyTo(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      await axios.delete(`/channels/${channel._id}/messages/${msgId}`);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const submitEdit = async (msgId) => {
    if (!editText.trim()) return;
    try {
      await axios.patch(`/channels/${channel._id}/messages/${msgId}`, { content: editText });
      setEditingMsg(null);
      setEditText("");
    } catch {
      toast.error("Failed to edit");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (replyTo) formData.append("replyTo", replyTo._id);
    try {
      setSending(true);
      await axios.post(`/channels/${channel._id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReplyTo(null);
    } catch {
      toast.error("Upload failed");
    } finally {
      setSending(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isOwn     = (msg) => msg.sender?._id === user._id || msg.sender === user._id;
  const isAdmin   = community?.members?.find(
    (m) => (m.user?._id || m.user) === user?._id
  )?.role === "admin";
  const canDelete = (msg) => isOwn(msg) || isAdmin;

  const renderMedia = (msg) => {
    if (!msg.fileUrl) return null;

    if (msg.fileType?.startsWith("image/")) {
      return (
        <img
          src={msg.fileUrl}
          alt="attachment"
          className="mt-2 max-w-[260px] rounded-xl border border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(msg.fileUrl, "_blank")}
        />
      );
    }

    if (msg.fileType?.startsWith("video/")) {
      return (
        <video
          src={msg.fileUrl}
          controls
          className="mt-2 max-w-[260px] rounded-xl border border-white/10"
        />
      );
    }

    const url = msg.fileUrl;
    const name = msg.fileName || "Attachment";
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400 text-sm border border-white/10 transition-colors">
        <Paperclip size={14} />
        {name}
      </a>
    );
  };
    const renderReply = (msg) => {
    if (!msg.replyTo) return null;
    return (
      <div className="mb-1 pl-3 border-l-2 border-indigo-500/50 text-xs text-slate-500 truncate">
        <span className="text-indigo-400 font-medium">
          @{msg.replyTo?.sender?.username || "user"}
        </span>{" "}
        {msg.replyTo?.content || "[attachment]"}
      </div>
    );
  };

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
        <Hash size={48} className="opacity-20" />
        <p className="text-sm">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0F172A]">

      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3 bg-[#0F172A]/80 backdrop-blur-sm shrink-0">
        {channel.isPrivate
          ? <Lock size={18} className="text-indigo-400 shrink-0" />
          : <Hash size={18} className="text-indigo-400 shrink-0" />
        }
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{channel.name}</h3>
          {channel.description && (
            <p className="text-xs text-slate-500 truncate">{channel.description}</p>
          )}
        </div>
        {channel.type === "announcement" && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium shrink-0">
            Announcement
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-1">

        {loading && (
          <div className="flex flex-col gap-3 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
                <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
                <div className="h-10 w-52 bg-white/5 rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 pt-24">
            <Hash size={44} className="opacity-20" />
            <p className="text-sm">No messages yet — be the first!</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const own      = isOwn(msg);
          const showMeta = idx === 0 || messages[idx - 1]?.sender?._id !== msg.sender?._id;

          return (
            <div
              key={msg._id}
              className={`flex gap-2.5 ${own ? "flex-row-reverse" : ""}`}
              onMouseEnter={() => setHoveredMsg(msg._id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              <div className="w-8 shrink-0">
                {showMeta && (
                  <img
                    src={
                      msg.sender?.profilePicture ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.username}`
                    }
                    alt={msg.sender?.username}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                )}
              </div>

              <div className={`flex flex-col max-w-[65%] ${own ? "items-end" : "items-start"}`}>

                {showMeta && (
                  <div className={`flex items-center gap-2 mb-0.5 ${own ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold text-slate-300">
                      {msg.sender?.fullName || msg.sender?.username}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {renderReply(msg)}

                {editingMsg === msg._id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")  submitEdit(msg._id);
                        if (e.key === "Escape") setEditingMsg(null);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 border border-indigo-500 text-white text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => submitEdit(msg._id)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingMsg(null)}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      own
                        ? "bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-sm"
                        : "text-slate-200 rounded-tl-sm border border-white/10"
                    }`}
                    style={own ? {} : { background: "rgba(255,255,255,0.06)" }}
                  >
                    {msg.content && (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    )}
                    {renderMedia(msg)}
                    {msg.isEdited && (
                      <span className="text-[10px] opacity-40 ml-1">(edited)</span>
                    )}
                  </div>
                )}

                {hoveredMsg === msg._id && !editingMsg && (
                  <div className={`flex items-center gap-1 mt-1 ${own ? "flex-row-reverse" : ""}`}>
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Reply"
                    >
                      <CornerUpLeft size={12} />
                    </button>
                    {own && (
                      <button
                        onClick={() => { setEditingMsg(msg._id); setEditText(msg.content || ""); }}
                        className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                    {canDelete(msg) && (
                      <button
                        onClick={() => setDeleteConfirm(msg._id)}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 pl-11">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            {typingUsers.map((u) => u.username).join(", ")} typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Reply Banner */}
      {replyTo && (
        <div className="px-4 py-2 flex items-center justify-between bg-indigo-500/10 border-t border-indigo-500/20 shrink-0">
          <div className="flex items-center gap-2 text-sm min-w-0">
            <CornerUpLeft size={14} className="text-indigo-400 shrink-0" />
            <span className="text-indigo-400 font-medium shrink-0">
              @{replyTo.sender?.username}
            </span>
            <span className="text-slate-500 truncate">{replyTo.content}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-3 text-slate-500 hover:text-white transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input */}
      {channel.type !== "announcement" || isAdmin ? (
        <div className="px-4 py-3 border-t border-white/10 bg-[#0F172A]/60 backdrop-blur-sm relative shrink-0">

          {showEmoji && (
            <div className="absolute bottom-20 left-4 z-50">
              <EmojiPicker
                theme="dark"
                onEmojiClick={(emojiData) => {
                  setText((prev) => prev + emojiData.emoji);
                  setShowEmoji(false);
                  textareaRef.current?.focus();
                }}
                height={360}
              />
            </div>
          )}

          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,application/pdf,.doc,.docx,.zip,.mp3,.wav"
            />

            <button
              onClick={() => fileRef.current?.click()}
              className="p-1.5 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
              title="Attach file"
              disabled={sending}
            >
              <Paperclip size={18} />
            </button>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => { setText(e.target.value); handleTyping(); }}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${channel.name}`}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-slate-600 focus:outline-none resize-none max-h-32 custom-scrollbar"
              style={{ lineHeight: "1.6" }}
            />

            <button
              onClick={() => setShowEmoji((p) => !p)}
              className="p-1.5 text-slate-500 hover:text-yellow-400 transition-colors shrink-0"
              title="Emoji"
            >
              <Smile size={18} />
            </button>

            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-white/10 text-center text-xs text-slate-600 shrink-0">
          Only admins can post in announcement channels.
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          deleteMessage(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Delete Message?"
        message="This message will be permanently deleted."
        confirmText="Delete"
        danger
      />

    </div>
  );
};

export default ChannelChat;