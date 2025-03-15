// components/feed/CollectionSection.jsx
import React from "react";
import CollectionCard from "./CollectionCard";

export default function CollectionSection({
  collections,
  onCreateCollection,
  onCollectionClick,
}) {
  // Group collections by category
  const categorizedCollections = {
    featured: collections.filter((c) => c.featured),
    personal: collections.filter((c) => !c.featured),
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">
          <span className="text-green-400">Collections</span> for Intentional
          Viewing
        </h3>
        <button
          onClick={onCreateCollection}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-md flex items-center"
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
          New Collection
        </button>
      </div>

      {/* Introduction to collections */}
      <div className="bg-gray-900 p-4 rounded-lg mb-6 border-l-4 border-green-500">
        <p className="text-gray-300">
          Collections help you organize videos for specific moods and purposes.
          Use curated collections when you need motivation, inspiration, or
          learning - or create your own for content you want to revisit.
        </p>
      </div>

      {/* Featured collections */}
      {categorizedCollections.featured.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3 text-gray-300">
            Curated Collections
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedCollections.featured.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => onCollectionClick(collection.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Personal collections */}
      {categorizedCollections.personal.length > 0 ? (
        <div>
          <h4 className="text-lg font-medium mb-3 text-gray-300">
            Your Collections
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorizedCollections.personal.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => onCollectionClick(collection.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">
            You haven't created any personal collections yet.
          </p>
          <button
            onClick={onCreateCollection}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-md inline-flex items-center"
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
            Create Your First Collection
          </button>
        </div>
      )}
    </div>
  );
}
