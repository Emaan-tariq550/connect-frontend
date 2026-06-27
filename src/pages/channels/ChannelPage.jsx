import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";
import ChannelSidebar from "../../components/channels/ChannelSidebar";
import ChannelChat from "../../components/channels/ChannelChat";
import { Users, Hash, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

const ChannelPage = () => {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);

  useEffect(() => {
    fetchCommunity();
  }, [communityId]);

  const fetchCommunity = async () => {
    try {
      const res = await axios.get(`/communities/${communityId}`);
      setCommunity(res.data.community);
    } catch {
      toast.error("Failed to load community");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F172A] text-white overflow-hidden">
      {/* Channel Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-60" : "w-0"
        } shrink-0 transition-all duration-300 overflow-hidden border-r border-white/10 bg-[#0a0f1e]`}
      >
        <ChannelSidebar
          community={community}
          onSelectChannel={(ch) => {
            setActiveChannel(ch);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
          activeChannelId={activeChannel?._id}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0F172A]/90 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Hash size={16} className="text-indigo-400" />
            <span className="text-white font-medium">{activeChannel?.name || "Select a channel"}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setMembersOpen((p) => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                membersOpen ? "bg-indigo-600/30 text-indigo-300" : "hover:bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <Users size={15} />
              <span className="hidden sm:inline">Members</span>
            </button>
          </div>
        </div>

        {/* Chat + Members panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChannelChat channel={activeChannel} community={community} />
          </div>

          {/* Members Panel */}
          {membersOpen && (
            <div className="w-56 shrink-0 border-l border-white/10 bg-[#0a0f1e] overflow-y-auto custom-scrollbar">
              <div className="p-3 border-b border-white/10">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Members — {community?.members?.length || 0}
                </p>
              </div>
              <div className="p-2 space-y-1">
                {community?.members?.map((m) => {
                  const u = m.user;
                  if (!u) return null;
                  return (
                    <div key={u._id || u} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="relative shrink-0">
                        <img
                          src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username || u}`}
                          alt={u.username}
                          className="w-7 h-7 rounded-full object-cover border border-white/10"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0f1e] ${
                            u.isOnline ? "bg-green-500" : "bg-slate-600"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-300 truncate">
                          {u.fullName || u.username}
                        </p>
                        {m.role === "admin" && (
                          <p className="text-[10px] text-indigo-400">Admin</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;