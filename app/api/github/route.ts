// app/api/github/route.ts
import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = process.env.GITHUB_USERNAME;

export async function GET(request: Request) {
  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const repos = await reposResponse.json();

    const reposWithDetails = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          // Get README
          const readmeResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/readme`,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.raw',
              },
            }
          );

          const readme = readmeResponse.ok ? await readmeResponse.text() : null;

          // Get languages
          const languagesResponse = await fetch(
            repo.languages_url,
            {
              headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
              },
            }
          );

          const languages = languagesResponse.ok ? await languagesResponse.json() : {};

          return {
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            languages: Object.keys(languages),
            topics: repo.topics,
            readme: readme,
            updated_at: repo.updated_at,
          };
        } catch (error) {
          console.error(`Error fetching details for ${repo.name}:`, error);
          return {
            name: repo.name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            languages: [],
            topics: repo.topics,
            readme: null,
            updated_at: repo.updated_at,
          };
        }
      })
    );

    return NextResponse.json({ 
      success: true, 
      data: reposWithDetails 
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
}