import { motion } from "framer-motion";

const shimmer = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: "linear",
  },
};

const SkeletonBox = ({ className = "" }) => (
  <motion.div
    className={`rounded-lg ${className}`}
    animate={shimmer.animate}
    transition={shimmer.transition}
    style={{
      background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)",
      backgroundSize: "400% 100%",
    }}
  />
);

// ── Individual skeletons ────────────────────────────────────────────────────

export const MessageSkeleton = ({ count = 5 }) => (
  <div className="flex flex-col gap-4 p-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
        <SkeletonBox className="w-8 h-8 rounded-full shrink-0" />
        <div className={`flex flex-col gap-1.5 ${i % 2 === 0 ? "items-start" : "items-end"}`}>
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className={`h-10 rounded-2xl ${i % 3 === 0 ? "w-52" : i % 3 === 1 ? "w-36" : "w-64"}`} />
        </div>
      </div>
    ))}
  </div>
);

export const UserCardSkeleton = ({ count = 4 }) => (
  <div className="flex flex-col gap-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBox className="h-3 w-28" />
          <SkeletonBox className="h-2.5 w-40" />
        </div>
        <SkeletonBox className="h-7 w-16 rounded-lg" />
      </div>
    ))}
  </div>
);

export const PostSkeleton = ({ count = 3 }) => (
  <div className="flex flex-col gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/3 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-10 h-10 rounded-full" />
          <div className="flex flex-col gap-1.5 flex-1">
            <SkeletonBox className="h-3 w-32" />
            <SkeletonBox className="h-2.5 w-20" />
          </div>
        </div>
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-3/4" />
        {i % 2 === 0 && <SkeletonBox className="h-48 w-full rounded-xl" />}
        <div className="flex gap-4 pt-1">
          {[...Array(3)].map((_, j) => (
            <SkeletonBox key={j} className="h-3 w-12" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="flex flex-col">
    <SkeletonBox className="h-40 w-full rounded-none" />
    <div className="px-5 pb-5">
      <div className="flex items-end justify-between -mt-10 mb-4">
        <SkeletonBox className="w-20 h-20 rounded-full border-4 border-[#0F172A]" />
        <SkeletonBox className="h-9 w-24 rounded-xl" />
      </div>
      <SkeletonBox className="h-5 w-40 mb-2" />
      <SkeletonBox className="h-3 w-24 mb-3" />
      <SkeletonBox className="h-3 w-full mb-1.5" />
      <SkeletonBox className="h-3 w-3/4 mb-4" />
      <div className="flex gap-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonBox key={i} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const NotificationSkeleton = ({ count = 5 }) => (
  <div className="flex flex-col gap-2 p-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-start gap-3 p-3">
        <SkeletonBox className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-2.5 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const ChannelSkeleton = ({ count = 6 }) => (
  <div className="flex flex-col gap-1 p-3">
    <SkeletonBox className="h-3 w-20 mb-2" />
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-2 px-2 py-2">
        <SkeletonBox className="w-4 h-4 rounded" />
        <SkeletonBox className={`h-3 ${i % 3 === 0 ? "w-24" : i % 3 === 1 ? "w-16" : "w-20"}`} />
      </div>
    ))}
  </div>
);

export const CommunityCardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="rounded-2xl border border-white/5 overflow-hidden">
        <SkeletonBox className="h-28 w-full rounded-none" />
        <div className="p-4 flex flex-col gap-2">
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-2/3" />
          <div className="flex gap-2 mt-1">
            <SkeletonBox className="h-7 w-20 rounded-lg" />
            <SkeletonBox className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ── Default export wraps all variants ──────────────────────────────────────
const Skeleton = ({ type = "post", count, ...props }) => {
  const map = {
    message: MessageSkeleton,
    user: UserCardSkeleton,
    post: PostSkeleton,
    profile: ProfileSkeleton,
    notification: NotificationSkeleton,
    channel: ChannelSkeleton,
    community: CommunityCardSkeleton,
  };
  const Component = map[type] || PostSkeleton;
  return <Component count={count} {...props} />;
};

export default Skeleton;