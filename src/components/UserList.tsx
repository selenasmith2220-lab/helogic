import React, { useState } from 'react';
import { Search, MessageCircle, MapPin, User as UserIcon, ShieldAlert } from 'lucide-react';
import { Gender, User } from '../types';

interface UserListProps {
  users: User[];
  currentUser: User;
  onStartPrivateChat: (user: User) => void;
  onReportUser: (user: User) => void;
  locationFilter?: string;
  onSelectLocation?: (loc: string) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUser,
  onStartPrivateChat,
  onReportUser,
  locationFilter = 'global',
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | Gender>('all');
  const [selectedUserModal, setSelectedUserModal] = useState<User | null>(null);

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (u.id === currentUser.id) return false;
    if (u.isBanned) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.nickname.toLowerCase().includes(q);
      const matchCountry = u.country.toLowerCase().includes(q);
      if (!matchName && !matchCountry) return false;
    }

    if (genderFilter !== 'all' && u.gender !== genderFilter) {
      return false;
    }

    if (locationFilter !== 'global') {
      const matchLoc =
        u.country.toLowerCase() === locationFilter.toLowerCase() ||
        u.countryCode.toLowerCase() === locationFilter.toLowerCase();
      if (!matchLoc) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header & User Count */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-700">
            <UserIcon className="w-3.5 h-3.5 text-sky-600" />
            <span>Online Visitors</span>
          </div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {filteredUsers.length}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search username or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Filters */}
        <div id="user-filters-bar" className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
          <button
            id="user-filter-all-btn"
            onClick={() => setGenderFilter('all')}
            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 cursor-pointer ${
              genderFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All
          </button>
          <button
            id="user-filter-female-btn"
            onClick={() => setGenderFilter('female')}
            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 cursor-pointer flex items-center gap-1 ${
              genderFilter === 'female'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span>👩</span> Girls
          </button>
          <button
            id="user-filter-male-btn"
            onClick={() => setGenderFilter('male')}
            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 cursor-pointer flex items-center gap-1 ${
              genderFilter === 'male'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            <span>👨</span> Boys
          </button>
          <button
            id="user-filter-country-btn"
            onClick={() => {
              if (onSelectLocation) {
                onSelectLocation(locationFilter === 'global' ? currentUser.country : 'global');
              }
            }}
            className={`px-2 py-0.5 rounded-md font-semibold shrink-0 cursor-pointer flex items-center gap-1 ${
              locationFilter !== 'global'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle between Anyone Worldwide (Global) and your country"
          >
            <span>{locationFilter !== 'global' ? currentUser.flag : '🌍'}</span>
            <span>{locationFilter !== 'global' ? currentUser.country : 'Global'}</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No active users match your filter. Try clearing your search.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isFemale = u.gender === 'female';
            return (
              <div
                key={u.id}
                onClick={() => setSelectedUserModal(u)}
                className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-2.5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={u.avatar}
                      alt={u.nickname}
                      className={`w-9 h-9 rounded-full object-cover border-2 ${
                        isFemale ? 'border-rose-400' : 'border-sky-400'
                      }`}
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {u.nickname}
                      </span>
                      <span className="text-xs">{u.flag}</span>
                      {u.isRealPeer && (
                        <span className="text-[9px] px-1 rounded bg-indigo-100 text-indigo-700 font-extrabold uppercase">
                          Live Peer
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <span
                        className={`font-semibold ${
                          isFemale ? 'text-rose-600' : 'text-sky-600'
                        }`}
                      >
                        {u.age} y/o &bull; {u.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                      {u.statusMessage && (
                        <>
                          <span>&bull;</span>
                          <span className="truncate max-w-[100px] text-slate-400">
                            {u.statusMessage}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartPrivateChat(u);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1 cursor-pointer"
                  title={`Start private 1-on-1 chat with ${u.nickname}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User Quick Modal Preview */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedUserModal.avatar}
                alt={selectedUserModal.nickname}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-base text-slate-900">
                    {selectedUserModal.nickname}
                  </h3>
                  <span className="text-base">{selectedUserModal.flag}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="font-semibold text-sky-600">
                    {selectedUserModal.age} years old
                  </span>
                  <span>&bull;</span>
                  <span>{selectedUserModal.gender}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{selectedUserModal.country}</span>
                </div>
              </div>
            </div>

            {selectedUserModal.bio && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed mb-4 border border-slate-100">
                &ldquo;{selectedUserModal.bio}&rdquo;
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onStartPrivateChat(selectedUserModal);
                  setSelectedUserModal(null);
                }}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start Private Chat</span>
              </button>

              <button
                onClick={() => {
                  onReportUser(selectedUserModal);
                  setSelectedUserModal(null);
                }}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Report inappropriate behavior to Admin"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSelectedUserModal(null)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
