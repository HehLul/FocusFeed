// components/LoadingFeedAnimation.jsx
export default function LoadingFeedAnimation() {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-t-4 border-white rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white">Curating Your Feed</h2>
        <p className="text-gray-400 mt-2">This will just take a moment...</p>
      </div>
    );
  }