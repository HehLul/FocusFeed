// components/feed/CreatePlaylistModal.jsx
import React, { useState } from "react";

const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrls, setVideoUrls] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Process video URLs - parse them to extract video IDs if needed
      const urls = videoUrls.split("\n").filter((url) => url.trim() !== "");

      await onSubmit({
        name,
        description,
        videoUrls: urls,
      });

      // Reset form after submission
      setName("");
      setDescription("");
      setVideoUrls("");
      onClose();
    } catch (error) {
      console.error("Error creating playlist:", error);
      // You could add error handling/display here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 relative border border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-xl font-bold mb-4">
          Create New <span className="text-green-400">Playlist</span>
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="playlist-name"
              className="block text-sm font-medium mb-1"
            >
              Playlist Name
            </label>
            <input
              id="playlist-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white"
              placeholder="e.g., Study Music"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="playlist-description"
              className="block text-sm font-medium mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white h-20"
              placeholder="What is this playlist for?"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="video-urls"
              className="block text-sm font-medium mb-1"
            >
              Video URLs (one per line)
            </label>
            <textarea
              id="video-urls"
              value={videoUrls}
              onChange={(e) => setVideoUrls(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white h-32"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste YouTube video URLs, one per line
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 text-sm bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                isSubmitting
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;
