import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export const formatChatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM/yy');
};

export const formatMsgTime = (dateStr) => {
  if (!dateStr) return '';
  return format(new Date(dateStr), 'HH:mm');
};

export const formatLastSeen = (dateStr) => {
  if (!dateStr) return 'Offline';
  return `Last seen ${formatDistanceToNow(new Date(dateStr), { addSuffix: true })}`;
};