// components/feed/CreateCollectionModal.jsx
import React, { useState } from "react";

export default function CreateCollectionModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  const [videoUrls, setVideoUrls] = useState([""]); // Start with one empty URL field
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purposeOptions = [
    { id: "", label: "Choose a purpose (optional)" },
    { id: "motivation", label: "Motivation - When you need a boost" },
    { id: "inspiration", label: "Inspiration - For creative thinking" },
    { id: "learning", label: "Learning - Educational content" },
    { id: "relaxation", label: "Relaxation - Wind down and de-stress" },
    { id: "rut", label: "Get out of a rut - Break through barriers" },
    { id: "business", label: "Business - Professional development" },
  ];

  const handleAddVideoUrl = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const handleVideoUrlChange = (index, value) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const handleRemoveVideoUrl = (index) => {
    const newUrls = [...videoUrls];
    newUrls.splice(index, 1);
    setVideoUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    // Filter out empty URL fields
    const filteredUrls = videoUrls.filter((url) => url.trim() !== "");

    const result = await onSubmit({
      name,
      description,
      purpose,
      purposeDescription: purpose
        ? purposeOptions
            .find((opt) => opt.id === purpose)
            ?.label.split(" - ")[1]
        : "",
      videoUrls: filteredUrls,
    });

    if (result) {
      // Reset form state on successful submission
      setName("");
      setDescription("");
      setPurpose("");
      setVideoUrls([""]);
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">
              Create New Collection
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
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
          </div>

          {/* Info box */}
          <div className="bg-gray-800 p-4 rounded-md mb-6 border-l-4 border-green-500">
            <p className="text-gray-300 text-sm">
              Collections help you organize videos for specific purposes. Add a
              purpose to your collection to help you remember when to use it,
              and add videos to watch later.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="collection-name"
                className="block text-gray-300 mb-2 font-medium"
              >
                Collection Name*
              </label>
              <input
                id="collection-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name for your collection"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="collection-purpose"
                className="block text-gray-300 mb-2 font-medium"
              >
                Collection Purpose
              </label>
              <select
                id="collection-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              >
                {purposeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-gray-400 text-xs mt-1">
                Adding a purpose helps you remember when to use this collection.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="collection-description"
                className="block text-gray-300 mb-2 font-medium"
              >
                Description
              </label>
              <textarea
                id="collection-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description to remember what this collection is for"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Video URLs (Optional)
              </label>
              <p className="text-gray-400 text-xs mb-3">
                Add YouTube video URLs to your collection. You can add more
                videos later.
              </p>

              {videoUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) =>
                      handleVideoUrlChange(index, e.target.value)
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVideoUrl(index)}
                    className="p-3 bg-gray-800 border border-gray-700 text-gray-400 hover:text-white rounded-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddVideoUrl}
                className="mt-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Another Video
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-green-700 disabled:opacity-70"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Collection"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
