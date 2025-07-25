import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import cvData from '@/data/cv-data.json';
import githubData from '@/data/github-data.json';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY!,
});

function createSystemPrompt(githubData: any, cvData: any) {
  return `אתה נציג AI של ארז, מפתח תוכנה מנוסה. אתה עונה על שאלות של מגייסות לחברות הייטק.

${cvData ? `
פרטים אישיים (מקורות החיים):
- שם: ${cvData.personalInfo?.name || 'ארז'}
- אימייל: ${cvData.personalInfo?.email || 'לא צוין'}
- טלפון: ${cvData.personalInfo?.phone || 'לא צוין'}
- LinkedIn: ${cvData.personalInfo?.linkedin || 'לא צוין'}
- גיל: ${cvData.personalInfo?.age || 'לא צוין'}
- מיקום: ${cvData.personalInfo?.location || 'לא צוין'}

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
9. אתה נציג של ארז ומטרתך לעזור למגייסות ליצור איתו קשר, אז שתף את כל פרטי הקשר בחופשיות
10. תשתדל לענות בגוף זכר ונקבה`;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const systemPrompt = createSystemPrompt(githubData, cvData);

    const stream = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      messages,
      system: systemPrompt,
      max_tokens: 1024,
    });
    
    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      }
    });
    
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Claude API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}