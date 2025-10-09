import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../services/api';
import Sidebar from '../components/Sidebar';

const Recommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getRecommendations();
        // Support both { recommendations: [...] } and [...] response
        const data = Array.isArray(res.data) ? res.data : res.data.recommendations || [];
        setRecs(data);
      } catch (err) {
        setError('Failed to load recommendations.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-10 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white rounded shadow p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Recommendations</h2>
          {loading && <div>Loading recommendations...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && recs.length === 0 && (
            <div>No recommendations found.</div>
          )}
          {!loading && !error && recs.length > 0 && (
            <ul className="space-y-4">
              {recs.map((rec, idx) => (
                <li key={idx} className="border rounded p-4 bg-gray-50">
                  <div className="font-semibold">Skill: {rec.skill || rec.title || 'N/A'}</div>
                  {rec.resource && (
                    <div>
                      Resource: <a href={rec.resource} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{rec.resource}</a>
                    </div>
                  )}
                  {rec.description && <div>Description: {rec.description}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
