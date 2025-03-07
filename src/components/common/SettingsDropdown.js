// components/common/SettingsDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showRemoveChannelModal, setShowRemoveChannelModal] = useState(false);
  const [showEditPlaylistModal, setShowEditPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [userFeeds, setUserFeeds] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch user playlists and feed data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Fetch playlists
        const { data: playlistData } = await supabase
          .from("playlists")
          .select("*")
          .eq("user_id", session.user.id);

        if (playlistData) {
          setPlaylists(playlistData);
        }

        // Fetch user feed (channels)
        const { data: feedData } = await supabase
          .from("user_feeds")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (feedData) {
          setUserFeeds(feedData);
        }
      }
    };

    fetchUserData();
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleAddChannel = () => {
    setIsOpen(false);
    router.push("/setup?edit=true");
  };

  const handleRemoveChannel = () => {
    setIsOpen(false);
    setShowRemoveChannelModal(true);
  };

  const handleEditPlaylists = () => {
    setIsOpen(false);
    setShowEditPlaylistModal(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Settings Icon */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-settings"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 border border-gray-700 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              onClick={handleAddChannel}
              role="menuitem"
            >
              Add Channel
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              onClick={handleRemoveChannel}
              role="menuitem"
            >
              Remove Channel
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              onClick={handleEditPlaylists}
              role="menuitem"
            >
              Manage Playlists
            </button>
          </div>
        </div>
      )}

      {/* Remove Channel Modal */}
      {showRemoveChannelModal && (
        <RemoveChannelModal
          channels={userFeeds?.channels || []}
          onClose={() => setShowRemoveChannelModal(false)}
        />
      )}

      {/* Edit Playlist Modal */}
      {showEditPlaylistModal && (
        <ManagePlaylistsModal
          playlists={playlists}
          onClose={() => setShowEditPlaylistModal(false)}
        />
      )}
    </div>
  );
}

// Modal component for removing channels
function RemoveChannelModal({ channels, onClose }) {
  const [selectedChannels, setSelectedChannels] = useState([]);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCheckboxChange = (channelId) => {
    if (selectedChannels.includes(channelId)) {
      setSelectedChannels(selectedChannels.filter((id) => id !== channelId));
    } else {
      setSelectedChannels([...selectedChannels, channelId]);
    }
  };

  const handleRemove = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session");
        return;
      }

      // Fetch current channels
      const { data: feedData } = await supabase
        .from("user_feeds")
        .select("channels")
        .eq("user_id", session.user.id)
        .single();

      if (!feedData) {
        console.error("No feed data found");
        return;
      }

      // Filter out the selected channels
      const updatedChannels = feedData.channels.filter(
        (channel) => !selectedChannels.includes(channel.id)
      );

      // Update the user_feeds table
      const { error } = await supabase
        .from("user_feeds")
        .update({ channels: updatedChannels })
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error updating channels:", error);
        return;
      }

      onClose();
      // Refresh the page to show updated feed
      router.refresh();
    } catch (error) {
      console.error("Error in removing channels:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4 text-white">Remove Channels</h3>

        {channels.length > 0 ? (
          <div className="max-h-60 overflow-y-auto mb-4">
            {channels.map((channel) => (
              <div key={channel.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={channel.id}
                  checked={selectedChannels.includes(channel.id)}
                  onChange={() => handleCheckboxChange(channel.id)}
                  className="mr-2"
                />
                <label htmlFor={channel.id} className="flex items-center">
                  {channel.snippet?.thumbnails?.default?.url && (
                    <img
                      src={channel.snippet.thumbnails.default.url}
                      alt={channel.snippet.title}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <span>{channel.snippet?.title}</span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-gray-300">No channels found in your feed.</p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 rounded-md text-gray-200 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            disabled={selectedChannels.length === 0}
            className={`px-4 py-2 rounded-md text-white ${
              selectedChannels.length === 0
                ? "bg-red-900 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Remove Selected
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal component for managing playlists
function ManagePlaylistsModal({ playlists, onClose }) {
  const [selectedPlaylists, setSelectedPlaylists] = useState([]);
  const [editPlaylistId, setEditPlaylistId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCheckboxChange = (playlistId) => {
    if (selectedPlaylists.includes(playlistId)) {
      setSelectedPlaylists(selectedPlaylists.filter((id) => id !== playlistId));
    } else {
      setSelectedPlaylists([...selectedPlaylists, playlistId]);
    }
  };

  const handleRemovePlaylists = async () => {
    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .in("id", selectedPlaylists);

      if (error) {
        console.error("Error removing playlists:", error);
        return;
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.error("Error in removing playlists:", error);
    }
  };

  const startEditPlaylist = (playlist) => {
    setEditPlaylistId(playlist.id);
    setEditTitle(playlist.title);
    setEditDescription(playlist.description || "");
  };

  const cancelEdit = () => {
    setEditPlaylistId(null);
    setEditTitle("");
    setEditDescription("");
  };

  const savePlaylistEdit = async () => {
    try {
      const { error } = await supabase
        .from("playlists")
        .update({
          title: editTitle,
          description: editDescription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editPlaylistId);

      if (error) {
        console.error("Error updating playlist:", error);
        return;
      }

      cancelEdit();
      router.refresh();
    } catch (error) {
      console.error("Error in updating playlist:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4 text-white">
          Manage Playlists
        </h3>

        {playlists.length > 0 ? (
          <div className="max-h-60 overflow-y-auto mb-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="mb-3 p-2 border border-gray-700 rounded-md bg-gray-800"
              >
                {editPlaylistId === playlist.id ? (
                  // Edit form
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full mb-2 p-2 border border-gray-600 rounded bg-gray-700 text-white"
                      placeholder="Playlist title"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full mb-2 p-2 border border-gray-600 rounded bg-gray-700 text-white"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-600 rounded-md text-sm text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={savePlaylistEdit}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display playlist with edit/remove options
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`playlist-${playlist.id}`}
                          checked={selectedPlaylists.includes(playlist.id)}
                          onChange={() => handleCheckboxChange(playlist.id)}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`playlist-${playlist.id}`}
                          className="font-medium text-white"
                        >
                          {playlist.title}
                        </label>
                      </div>
                      <button
                        onClick={() => startEditPlaylist(playlist)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                    {playlist.description && (
                      <p className="text-sm text-gray-400 ml-6 mt-1">
                        {playlist.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-gray-300">No playlists found.</p>
        )}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 rounded-md text-gray-200 hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={handleRemovePlaylists}
            disabled={selectedPlaylists.length === 0}
            className={`px-4 py-2 rounded-md text-white ${
              selectedPlaylists.length === 0
                ? "bg-red-900 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
}
