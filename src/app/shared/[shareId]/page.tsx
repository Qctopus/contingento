'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface SharedPlanData {
  businessName: string;
  planData: any;
  createdAt: string;
}

export default function SharedPlanPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [planData, setPlanData] = useState<SharedPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedPlan = async () => {
      try {
        const response = await fetch(`/api/shared/${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Shared plan not found or has expired.');
          } else {
            setError('Failed to load shared plan.');
          }
          return;
        }

        const data = await response.json();
        setPlanData(data);
      } catch (error) {
        console.error('Error loading shared plan:', error);
        setError('An error occurred while loading the plan.');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      loadSharedPlan();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared plan...</p>
        </div>
      </div>
    );
  }

  if (error || !planData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Plan Not Available
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'This shared plan could not be found.'}
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your Own Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Business Continuity Plan - {planData.businessName}
              </h1>
              <p className="text-sm text-gray-500">
                Shared plan (read-only) • Created {new Date(planData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Link 
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              📋 Plan Overview
            </h2>
            <p className="text-gray-600">
              This is a read-only view of a business continuity plan. You can review all sections but cannot make changes.
            </p>
          </div>

          {/* Render plan sections */}
          {Object.entries(planData.planData).map(([sectionKey, sectionData]) => (
            <div key={sectionKey} className="mb-8">
              <h3 className="text-md font-medium text-gray-800 mb-4 border-b pb-2">
                {sectionKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              
              <div className="grid gap-4">
                {Object.entries(sectionData as any).map(([fieldKey, fieldValue]) => (
                  <div key={fieldKey} className="border-l-4 border-blue-200 pl-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fieldKey}
                    </label>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded border">
                      {Array.isArray(fieldValue) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {fieldValue.map((item, index) => (
                            <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                          ))}
                        </ul>
                      ) : typeof fieldValue === 'object' ? (
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(fieldValue, null, 2)}
                        </pre>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {String(fieldValue || '')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="mt-8 pt-6 border-t flex gap-4">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              🖨️ Print Plan
            </button>
            
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏗️ Create Your Own Plan
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            This is a shared business continuity plan. It is provided for review purposes only.
            <br />
            Create your own plan at{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Business Continuity Plan Tool
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
} 