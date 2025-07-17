'use client';
import { useEffect, useState } from "react";

type Repo = {
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
};

export default function ProjectList() {

  const [repos, setRepos] = useState<Repo[]>([]);

  useEffect(() => {
    fetch('/api/github')
      .then(res => res.json())
      .then(setRepos);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-400">GitHub Projects</h2>
      {!repos && <p>Loading...</p>}
      {repos && repos.length && (
        <ul className="space-y-4">
          {repos.map(repo => (
            <li key={repo.name} className="border p-4 rounded hover:shadow transition">
              <a href={repo.html_url} target="_blank" className="text-blue-600 font-bold">
                {repo.name}
              </a>
              <p className="text-gray-700 text-sm">{repo.description || 'No description'}</p>
              <div className="text-xs text-gray-500 mt-1">
                {repo.language && <span>🛠 {repo.language} </span>}
                ⭐ {repo.stargazers_count}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
