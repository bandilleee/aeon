import { Search } from "lucide-react";

export function EventApprovalsFilters({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  sortBy,
  setSortBy,
}: {
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}) {
  return (
    <div className="bg-zinc-950 border border-white/5 rounded-xl p-6 mb-2">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by event name or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        {/* Filter by Status */}
        <div className="flex gap-2">
          {["all", "pending_approval", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
        {/* Filter by Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
        >
          <option value="all">All Categories</option>
          <option value="meeting">Meeting</option>
          <option value="workshop">Workshop</option>
          <option value="social">Social</option>
          <option value="training">Training</option>
          <option value="conference">Conference</option>
          <option value="other">Other</option>
        </select>
        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}