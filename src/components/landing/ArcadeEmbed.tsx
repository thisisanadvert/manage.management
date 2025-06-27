/**
 * Interactive Demo Embed Component
 * Embeds Arcade.software demo with gradient bordered frame
 */

import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export function ArcadeEmbed() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Demo Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-secondary-50 px-4 py-2 rounded-full border border-primary-200 mb-4">
          <Sparkles className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">Interactive Demo</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          See Manage.Management in Action
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our platform with this interactive walkthrough. No signup required – just click and discover how we simplify property management.
        </p>
      </div>

      {/* Gradient Bordered Frame */}
      <div className="relative">
        {/* Demo Container with Gradient Border */}
        <div
          className="relative bg-white rounded-2xl p-6"
          style={{
            boxShadow: 'inset 0 0 0 3px #3b82f6, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Demo Frame */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 shadow-inner">
            {/* Play Button Overlay (optional - can be removed if demo auto-plays) */}
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-xl flex items-center justify-center z-10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-white bg-opacity-90 rounded-full p-4 shadow-lg">
                <Play className="h-8 w-8 text-primary-600 ml-1" />
              </div>
            </div>
            
            {/* Arcade Demo Embed */}
            <div 
              className="relative rounded-lg overflow-hidden shadow-lg"
              style={{ 
                position: 'relative', 
                paddingBottom: 'calc(50.520833333333336% + 41px)', 
                height: 0, 
                width: '100%' 
              }}
            >
              <iframe
                src="https://demo.arcade.software/uPQMnXsBVP8lUlgbSsKH?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
                title="Manage your management: June 2025"
                frameBorder="0"
                loading="lazy"
                allowFullScreen
                allow="clipboard-write"
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  colorScheme: 'light',
                  borderRadius: '0.5rem'
                }}
                className="rounded-lg"
              />
            </div>
          </div>
          
          {/* Demo Features */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Explore Features</h4>
              <p className="text-xs text-gray-600 mt-1">Navigate through real platform features</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg border border-secondary-200">
              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">See Workflows</h4>
              <p className="text-xs text-gray-600 mt-1">Experience actual user journeys</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-accent-50 to-accent-100 rounded-lg border border-accent-200">
              <div className="w-8 h-8 bg-accent-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Try Interactions</h4>
              <p className="text-xs text-gray-600 mt-1">Click, explore, and discover</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-gray-600 mb-4">
          Ready to transform your property management?
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => window.location.href = '/signup'}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Your Free Trial
          </button>
          <button
            onClick={() => window.location.href = '/qualify'}
            className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-4"
          >
            Check if you qualify →
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArcadeEmbed;
