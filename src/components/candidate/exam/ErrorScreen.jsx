"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorScreen({ message, onBack }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Load Exam</h2>
        <p className="text-gray-500 mb-6">{message}</p>
        <button
          onClick={onBack}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-indigo-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
