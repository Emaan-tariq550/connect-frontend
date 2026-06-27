import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Hash, Volume2, Lock, Plus, ChevronDown, ChevronRight, Settings } from "lucide-react";
import axios from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const ChannelSidebar = ({ community, onSelectChannel, activeChannelId }) => {
  const { user } = useAuthStore();
  const [channels, setChannels] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newChannel, setNewChannel] = useState({ name: "", type: "text", category: "General" });

  useEffect(() => {
    if (!community?._id) return;
    fetchChannels();
  }, [community?._id]);

  const fetchChannels = async () => {
    try {
      const res = await axios.get(`/channels/community/${community._id}`);
      const list = res.data.channels || [];
      setChannels(list);
      const groups = {};
      list.forEach((ch) => {
        const cat = ch.category || "General";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(ch);
      });
      setGrouped(groups);
    } catch {
      toast.error("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const createChannel = async () => {
    if (!newChannel.name.trim()) return toast.error("Channel name required");
    try {
      await axios.post(`/channels/community/${community._id}`, newChannel);
      toast.success("Channel created");
      setShowCreate(false);
      setNewChannel({ name: "", type: "text", category: "General" });
      fetchChannels();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create channel");
    }
  };

  const isAdmin = community?.members?.find(
    (m) => m.user?._id === user?._id || m.user === user?._id
  )?.role === "admin";

  const channelIcon = (ch) => {
    if (ch.isPrivate) return <Lock size={14} className="text-indigo-400" />;
    if (ch.type === "voice") return <Volume2 size={14} className="text-cyan-400" />;
    return <Hash size={14} className="text-slate-400" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-white/5 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Community Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-sm truncate">{community?.name}</h2>
          <p className="text-xs text-slate-500 truncate">{community?.description}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Create Channel"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreate && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">New Channel</p>
          <input
            value={newChannel.name}
            onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
            placeholder="channel-name"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <input
            value={newChannel.category}
            onChange={(e) => setNewChannel({ ...newChannel, category: e.target.value })}
            placeholder="Category (e.g. General)"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newChannel.type}
            onChange={(e) => setNewChannel({ ...newChannel, type: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[#0F172A] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="text">Text Channel</option>
            <option value="voice">Voice Channel</option>
            <option value="announcement">Announcement</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={newChannel.isPrivate || false}
              onChange={(e) => setNewChannel({ ...newChannel, isPrivate: e.target.checked })}
              className="accent-indigo-500"
            />
            Private Channel
          </label>
          <div className="flex gap-2">
            <button
              onClick={createChannel}
              className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Channels grouped by category */}
      <div className="flex-1 py-2 space-y-1">
        {Object.keys(grouped).length === 0 && (
          <p className="text-center text-sm text-slate-600 py-8">No channels yet</p>
        )}
        {Object.entries(grouped).map(([cat, chs]) => (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors"
            >
              {collapsed[cat] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              {cat}
            </button>
            {!collapsed[cat] && (
              <div className="space-y-0.5">
                {chs.map((ch) => (
                  <button
                    key={ch._id}
                    onClick={() => onSelectChannel(ch)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-sm transition-all duration-150 group ${
                      activeChannelId === ch._id
                        ? "bg-indigo-600/30 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                    style={{ width: "calc(100% - 16px)" }}
                  >
                    {channelIcon(ch)}
                    <span className="truncate flex-1 text-left">{ch.name}</span>
                    {ch.unreadCount > 0 && (
                      <span className="ml-auto text-xs bg-indigo-600 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {ch.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChannelSidebar;