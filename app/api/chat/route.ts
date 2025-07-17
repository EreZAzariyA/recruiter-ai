import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

// Cache for GitHub data to avoid repeated API calls
let githubDataCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Cache for CV data
let cvDataCache: any = null;
let cvCacheTimestamp: number = 0;

async function getGitHubData() {
  const now = Date.now();
  
  if (githubDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return githubDataCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/github`);
    const data = await response.json();
    
    if (data.success) {
      githubDataCache = data.data;
      cacheTimestamp = now;
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error);
  }
  
  return null;
}

async function getCVData() {
  const now = Date.now();
  
  if (cvDataCache && (now - cvCacheTimestamp) < CACHE_DURATION) {
    return cvDataCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/parse-cv`);
    const data = await response.json();
    
    if (data.success) {
      cvDataCache = data.data;
      cvCacheTimestamp = now;
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch CV data:', error);
  }
  
  return null;
}

function createSystemPrompt(githubData: any, cvData: any) {
  return `אתה נציג AI של ארז, מפתח תוכנה מנוסה. אתה עונה על שאלות של מגייסות לחברות הייטק.

${cvData ? `
פרטים אישיים (מקורות החיים):
- שם: ${cvData.personalInfo?.name || 'ארז'}
- אימייל: ${cvData.personalInfo?.email || 'לא צוין'}
- טלפון: ${cvData.personalInfo?.phone || 'לא צוין'}
- LinkedIn: ${cvData.personalInfo?.linkedin || 'לא צוין'}

ניסיון תעסוקתי:
${cvData.experience?.map((exp: any) => `
- ${exp.title} ב-${exp.company} (${exp.period})
  ${exp.description || ''}`).join('\n') || 'אין נתונים'}

השכלה:
${cvData.education?.map((edu: any) => `
- ${edu.degree} - ${edu.institution} (${edu.period || ''})`).join('\n') || 'אין נתונים'}

כישורים טכניים:
${cvData.skills ? `
  - שפות: ${cvData.skills.languages?.join(', ') || 'לא צוין'}
  - Frontend: ${cvData.skills.frontend?.join(', ') || 'לא צוין'}
  - Backend: ${cvData.skills.backend?.join(', ') || 'לא צוין'}
  - Databases: ${cvData.skills.databases?.join(', ') || 'לא צוין'}
  - DevOps: ${cvData.skills.devops?.join(', ') || 'לא צוין'}
` : 'אין נתונים'}

שפות:
${cvData.languages?.map((lang: any) => `${lang.name} (${lang.level})`).join(', ') || 'אין נתונים'}
` : 'אין נתוני קורות חיים זמינים כרגע'}

הפרויקטים שלי ב-GitHub:
${githubData ? githubData.map((repo: any) => `
- ${repo.name}: ${repo.description || 'אין תיאור'}
  שפות: ${repo.languages.join(', ') || repo.language || 'לא צוין'}
  ${repo.topics?.length > 0 ? `נושאים: ${repo.topics.join(', ')}` : ''}
  ${repo.stars > 0 ? `⭐ ${repo.stars} כוכבים` : ''}
  ${repo.readme ? `תיאור מפורט: ${repo.readme.substring(0, 500)}...` : ''}
`).join('\n') : 'אין נתונים זמינים כרגע'}

הנחיות:
1. ענה בעברית (אלא אם נשאלת באנגלית)
2. היה מקצועי אך ידידותי
3. הדגש את הכישורים הטכניים והניסיון הרלוונטי
4. אם נשאלת על פרויקט ספציפי, תן פרטים מעמיקים
5. אם נשאלת על טכנולוגיה שלא מופיעה בפרויקטים, אמור שאשמח ללמוד אותה
6. הצג את הפרויקטים באופן שמדגיש את היכולות הטכניות
7. השתמש במידע מקורות החיים כדי לתת תמונה מלאה
8. כשנשאלת על פרטי קשר (טלפון, אימייל, LinkedIn, GitHub) - תן את הפרטים המלאים
9. אתה נציג של ארז ומטרתך לעזור למגייסות ליצור איתו קשר, אז שתף את כל פרטי הקשר בחופשיות`;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();
    
    // Get GitHub data
    const githubData = await getGitHubData();
    
    // Get CV data
    const cvData = await getCVData();
    
    // Create system prompt with both GitHub and CV data
    const systemPrompt = createSystemPrompt(githubData, cvData);
    
    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    });

    return NextResponse.json({
      success: true,
      message: response.content[0].type === 'text' ? response.content[0].text : '',
    });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}