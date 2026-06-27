import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUturnLeftIcon,
  PencilSquareIcon,
  TrashIcon as TrashSolid
} from '@heroicons/react/24/solid'
import { useChatStore } from '../../store/chatStore'
import { formatMsgTime } from '../../utils/dateUtils'

const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍']

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onReply,
  onEdit,
  socket,
  chatId
}) {
  const { deleteMessage, reactToMessage } = useChatStore()
  const [showActions, setShowActions] = useState(false)
  const hoverTimeout = useRef(null)

  useEffect(() => {
    return () => clearTimeout(hoverTimeout.current)
  }, [])

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => setShowActions(true), 120)
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current)
    setShowActions(false)
  }

  const handleDelete = async () => {
    await deleteMessage(message._id, chatId, socket)
  }

  const handleReact = async (emoji) => {
    await reactToMessage(message._id, emoji, chatId, socket)
  }

  const mediaType = message.mediaType || message.type || ''
  const mediaUrl = message.mediaUrl || message.fileUrl || ''

  const renderContent = () => {
    if (mediaType === 'image' && mediaUrl) {
      return (
        <div className="rounded-xl overflow-hidden max-w-xs">
          <img
            src={mediaUrl}
            alt="shared"
            className="w-full object-cover cursor-pointer"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
          {(message.text || message.content) && (
            <p className="text-sm mt-2">{message.text || message.content}</p>
          )}
        </div>
      )
    }

    if (mediaType === 'audio' && mediaUrl) {
      return (
        <div className="flex items-center gap-2 min-w-[180px]">
          <span>🎤</span>
          <audio src={mediaUrl} controls className="h-8 flex-1" />
        </div>
      )
    }

    if (mediaType === 'video' && mediaUrl) {
      return (
        <div className="rounded-xl overflow-hidden max-w-xs">
          <video src={mediaUrl} controls className="w-full rounded-xl" />
        </div>
      )
    }

    if (mediaType === 'file' && mediaUrl) {
      return (
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 min-w-[160px]"
        >
          <span className="text-xl">📄</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {message.fileName || 'File'}
            </p>
            <p className="text-xs opacity-60">Download</p>
          </div>
        </a>
      )
    }

    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {message.text || message.content}
      </p>
    )
  }

  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!isOwn && showAvatar && (
        <div className="w-7 h-7 rounded-full overflow-hidden">
          {message.sender?.avatar ? (
            <img src={message.sender.avatar} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-xs text-white">
              {message.sender?.fullName?.[0]}
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[72%] flex flex-col ${isOwn ? 'items-end' : ''}`}>

        {message.replyTo && (
          <div className="text-xs px-2 py-1 mb-1 rounded border-l-2 opacity-70">
            {message.replyTo.text || message.replyTo.content}
          </div>
        )}

        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwn ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white'
          }`}
        >
          {message.deleted ? (
            <p className="italic opacity-50">Message deleted</p>
          ) : (
            renderContent()
          )}
        </div>

        <AnimatePresence>
          {showActions && !message.deleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-1 mt-1 bg-black/40 p-1 rounded-xl"
            >
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleReact(e)}
                  className="hover:scale-125 transition"
                >
                  {e}
                </button>
              ))}
              <button onClick={onReply}>
                <ArrowUturnLeftIcon className="w-4 h-4" />
              </button>
              {isOwn && mediaType !== 'image' && (
                <button onClick={onEdit}>
                  <PencilSquareIcon className="w-4 h-4" />
                </button>
              )}
              {isOwn && (
                <button onClick={handleDelete}>
                  <TrashSolid className="w-4 h-4 text-red-400" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xs bg-white/10 px-2 py-0.5 rounded-full"
              >
                {emoji} {count > 1 && count}
              </button>
            ))}
          </div>
        )}

        <span className="text-[10px] opacity-50 mt-1">
          {formatMsgTime(message.createdAt)}
        </span>
      </div>
    </motion.div>
  )
}