import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState({
    collegeName: '',
    collegeId: '',
    keywords: '',
    tags: '',
  });
  const [stats, setStats] = useState({
    articlesFetchedToday: 0,
    articlesUploaded: 0,
    articlesRemaining: 0,
  });

  const fetchArticles = async () => {
    try {
      const params = {};
      if (search.collegeName) params.collegeName = search.collegeName;
      if (search.collegeId) params.collegeId = search.collegeId;
      if (search.keywords) params.keywords = search.keywords;
      if (search.tags) params.tags = search.tags;

      const response = await axios.get('http://localhost:5000/api/articles', { params });
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, []);

  const handleSearchChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">News Monitor Dashboard</h1>

      <form onSubmit={handleSearchSubmit} className="mb-4 space-x-2">
        <input
          type="text"
          name="collegeName"
          placeholder="College Name"
          value={search.collegeName}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="collegeId"
          placeholder="College ID"
          value={search.collegeId}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="keywords"
          placeholder="Keywords"
          value={search.keywords}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags"
          value={search.tags}
          onChange={handleSearchChange}
          className="p-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Articles Fetched Today</h2>
          <p>{stats.articlesFetchedToday}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Articles Uploaded</h2>
          <p>{stats.articlesUploaded}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Articles Remaining</h2>
          <p>{stats.articlesRemaining}</p>
        </div>
      </div>

      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Headline</th>
            <th className="py-2 px-4 border-b">Summary</th>
            <th className="py-2 px-4 border-b">Published At</th>
            <th className="py-2 px-4 border-b">Tags</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-gray-100">
              <td className="py-2 px-4 border-b font-semibold">{article.headline}</td>
              <td className="py-2 px-4 border-b">{article.summary}</td>
              <td className="py-2 px-4 border-b">{article.published_at}</td>
              <td className="py-2 px-4 border-b">{article.tags}</td>
              <td className="py-2 px-4 border-b space-x-2">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={() => alert('Upload functionality to be implemented')}
                >
                  Upload
                </button>
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => alert(article.summary)}
                >
                  View
                </button>
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={fetchArticles}
                >
                  Refresh
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
