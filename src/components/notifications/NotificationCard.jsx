// src/components/notifications/NotificationCard.jsx
import { formatDistanceToNow } from 'date-fns';
import { UserPlus, MessageCircle, Users, Bell, Trash2, Check } from 'lucide-react';

const iconMap = {
  friend_request: { icon: UserPlus, color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
  message: { icon: MessageCircle, color: '#00D4AA', bg: 'rgba(0,212,170,0.12)' },
  community: { icon: Users, color: '#FF6B6B', bg: 'rgba(255,107,107,0.12)' },
  default: { icon: Bell, color: '#888', bg: 'rgba(136,136,136,0.12)' },
};

const labelMap = {
  friend_request: 'Friend Request',
  message: 'New Message',
  community: 'Community',
};

export default function NotificationCard({ notification, onMarkRead, onDelete }) {
  const type = notification.type || 'default';
  const { icon: Icon, color, bg } = iconMap[type] || iconMap.default;
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px 18px',
        borderRadius: '14px',
        background: notification.isRead
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(108,99,255,0.07)',
        border: notification.isRead
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(108,99,255,0.2)',
        marginBottom: '10px',
        transition: 'all 0.2s ease',
        cursor: 'default',
        position: 'relative',
      }}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#6C63FF',
            boxShadow: '0 0 6px #6C63FF',
          }}
        />
      )}

      {/* Icon */}
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: bg,
              padding: '2px 8px',
              borderRadius: '20px',
            }}
          >
            {labelMap[type] || 'Notification'}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: notification.isRead ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.88)',
            lineHeight: 1.5,
            fontWeight: notification.isRead ? 400 : 500,
          }}
        >
          {notification.message}
        </p>

        <span
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '5px',
            display: 'block',
          }}
        >
          {timeAgo}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
        {!notification.isRead && (
          <button
            onClick={() => onMarkRead(notification._id)}
            title="Mark as read"
            style={{
              background: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6C63FF',
              transition: 'all 0.2s',
            }}
          >
            <Check size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(notification._id)}
          title="Delete"
          style={{
            background: 'rgba(255,107,107,0.1)',
            border: '1px solid rgba(255,107,107,0.2)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6B6B',
            transition: 'all 0.2s',
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}