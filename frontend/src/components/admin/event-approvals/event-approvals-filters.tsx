"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button, Select, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FiltersProps {
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending_approval", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "meeting", label: "Meeting" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
  { value: "training", label: "Training" },
  { value: "conference", label: "Conference" },
  { value: "other", label: "Other" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title", label: "Title (A-Z)" },
  { value: "startDate", label: "Event Date" },
];

export function EventApprovalsFilters({
  filterStatus,
  setFilterStatus,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = filterStatus !== "all" || filterCategory !== "all" || searchQuery !== "";
  const activeFilterCount =
    (filterStatus !== "all" ? 1 : 0) +
    (filterCategory !== "all" ? 1 : 0) +
    (searchQuery !== "" ? 1 : 0);

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search events by title, description, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/50 border border-white/5 text-sm text-zinc-300 rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all placeholder:text-zinc-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && "bg-white/10")}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
      {/* Expanded Filters */}
      {showFilters && (
        <Card className="animate-slide-up">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Select
                label="Status"
                placeholder="Select status"
                options={statusOptions}
                value={filterStatus}
                onChange={setFilterStatus}
              />
              <Select
                label="Category"
                placeholder="Select category"
                options={categoryOptions}
                value={filterCategory}
                onChange={setFilterCategory}
              />
              <Select
                label="Sort By"
                placeholder="Sort by"
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
              />
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-zinc-500"
                  disabled={!hasActiveFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Active filters: </span>
          {filterStatus !== "all" && (
            <button
              onClick={() => setFilterStatus("all")}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              {statusOptions.find((s) => s.value === filterStatus)?.label}
              <X className="h-3 w-3" />
            </button>
          )}
          {filterCategory !== "all" && (
            <button
              onClick={() => setFilterCategory("all")}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              {categoryOptions.find((c) => c.value === filterCategory)?.label}
              <X className="h-3 w-3" />
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400 hover:bg-white/10 transition-colors"
            >
              Search: "{searchQuery.slice(0, 20)}{searchQuery.length > 20 ? "..." : ""}"
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}