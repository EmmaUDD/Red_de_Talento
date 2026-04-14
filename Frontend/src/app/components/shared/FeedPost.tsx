import { useState } from "react";
import {
  Heart, MessageSquare, Share2, Bookmark, MoreHorizontal,
  Briefcase, MapPin, CalendarDays, Building2,
  GraduationCap, BookOpen, Award, CheckCircle,
  Flag, Trash2,
} from "lucide-react";
import { ReportModal } from "./ReportModal";
import { apiRequest } from "../../../api/client";
 
export interface FeedPostData {
  id: number;
  type: "post" | "job" | "event" | "achievement";
  author: {
    name: string;
    role: "student" | "teacher" | "company";
    avatar: string | null;
    subtitle: string;
    verified?: boolean;
  };
  time: string;
  content: string;
  image?: string;
  jobDetails?: { title: string; type: string; salary: string; location: string; specialty?: string };
  eventDetails?: { date: string; time: string; location: string };
  achievementDetails?: { studentName: string; specialty: string };
  likes: number;
  comments: number;
  liked?: boolean;
  saved?: boolean;
}
 
const roleConfig = {
  student: { label: "Estudiante", icon: GraduationCap, bg: "bg-blue-50", text: "text-blue-700" },
  teacher: { label: "Docente", icon: BookOpen, bg: "bg-green-50", text: "text-green-700" },
  company: { label: "Empresa", icon: Building2, bg: "bg-amber-50", text: "text-amber-700" },
};
 
export function FeedPostCard({
  post,
  canModerate = false,
  onDeleted,
  postAutorId,
}: {
  post: FeedPostData;
  canModerate?: boolean;
  onDeleted?: () => void;
  postAutorId?: number;
}) {
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReport, setShowReport] = useState(false);
 
  const currentUserId = Number(localStorage.getItem("user_id"));
  const isOwner = postAutorId !== undefined && postAutorId === currentUserId;
 
  const toggleLike = () => {
    setLiked((p) => !p);
    setLikeCount((p) => (liked ? p - 1 : p + 1));
  };
 
  const handleDelete = async () => {
    try {
      await apiRequest(`/api/feed/${post.id}/`, { method: "DELETE" });
      onDeleted?.();
    } catch {
      // silencioso
    }
    setShowOptions(false);
  };
 
  const roleCfg = roleConfig[post.author.role];
  const RoleIcon = roleCfg.icon;
 
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
        {/* Author */}
        <div className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-lg object-cover border border-slate-100"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              )}
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${roleCfg.bg} ${roleCfg.text}`} style={{ fontWeight: 600 }}>
                <RoleIcon className="w-3 h-3" />
                {roleCfg.label}
              </span>
            </div>
            {post.author.subtitle && (
              <p className="text-slate-500 text-xs mt-0.5 truncate">{post.author.subtitle}</p>
            )}
            <p className="text-slate-400 text-xs">{post.time}</p>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 min-w-[160px]">
                <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  No me interesa
                </button>
                <button
                  onClick={() => { setShowOptions(false); setShowReport(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                  style={{ fontWeight: 500 }}
                >
                  <Flag className="w-3.5 h-3.5" />
                  Reportar publicación
                </button>
                {(canModerate || isOwner) && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
 
        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-slate-700 text-sm leading-relaxed">{post.content}</p>
        </div>
 
        {/* Image */}
        {post.image && (
          <div className="mx-4 mb-3 rounded-lg overflow-hidden border border-slate-100">
            <img src={post.image} alt="post image" className="w-full h-52 object-cover" />
          </div>
        )}
 
        {/* Job card */}
        {post.type === "job" && post.jobDetails && (
          <div className="mx-4 mb-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-slate-900 mb-2" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {post.jobDetails.title}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                <Briefcase className="w-3 h-3" /> {post.jobDetails.type}
              </span>
              {post.jobDetails.salary && (
                <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full" style={{ fontWeight: 600 }}>
                  💰 {post.jobDetails.salary}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3" /> {post.jobDetails.location}
              </span>
            </div>
          </div>
        )}
 
        {/* Event card */}
        {post.type === "event" && post.eventDetails && (
          <div className="mx-4 mb-3 border border-amber-200 rounded-xl p-4 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4" style={{ color: "#D4AF37" }} />
              <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>Evento</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                {post.eventDetails.date} · {post.eventDetails.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {post.eventDetails.location}
              </div>
            </div>
          </div>
        )}
 
        {/* Actions */}
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-500" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
              <span className="text-xs">{likeCount}</span>
            </button>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{post.comments}</span>
            </button>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className={`transition-colors ${saved ? "text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Bookmark className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
 
      {showReport && (
        <ReportModal
          targetName={post.author.name}
          targetType={post.author.role === "company" ? "empresa" : "usuario"}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}