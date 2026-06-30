import React from 'react';
import CropPredictor from '../components/CropPredictor';
import MarketDashboard from '../components/MarketDashboard';
import { Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <span className="font-bold text-xl text-gray-900">Agri AI</span>
              <span className="ml-2 text-sm text-gray-500 font-medium hidden sm:inline-block border-l pl-2 border-gray-300">
                Command Center
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                System Online
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farm Intelligence</h1>
          <p className="mt-1 text-sm text-gray-500">
            Powered by Random Forest & ARIMA models.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Crop Predictor */}
          <div className="flex flex-col gap-8">
            <CropPredictor />
          </div>

          {/* Right Column - Market Analytics & Future Modules */}
          <div className="flex flex-col gap-8">
            <MarketDashboard />
            
            {/* Placeholder for future module like Computer Vision */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48 opacity-60">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Computer Vision Module</h3>
              <p className="mt-1 text-xs text-gray-500">Coming in Phase 3</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
