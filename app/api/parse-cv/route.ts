import { NextResponse } from 'next/server';

// הנתונים שלך ישירות בקוד
const CV_DATA = {
  "personalInfo": {
    "name": "Erez Azariya",
    "title": "Full Stack Developer",
    "email": "erezazariya@gmail.com",
    "phone": "052-2668502",
    "github": "https://github.com/erezazariya",
    "linkedin": "https://linkedin.com/in/erezazariya",
    "summary": "Full Stack Developer with over two years of hands-on experience building scalable web applications using React.js, Node.js, and Meteor.js. Currently seeking a role where I can leverage my skills in Full Stack/Front End development and contribute to impactful products."
  },
  "skills": {
    "languages": ["TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3"],
    "frontend": ["React.js", "Redux / Redux Toolkit", "TanStack Query", "Ant Design", "WebSocket / Socket.io"],
    "backend": ["Node.js", "Meteor.js", "Express.js", "JWT / OAuth", "RESTful APIs", "Microservices architecture"],
    "databases": ["MongoDB", "MySQL"],
    "devops": ["Docker", "AWS (EC2, S3)", "Linux", "Git", "Bitbucket", "Jira"]
  },
  "experience": [
    {
      "company": "PlasBit",
      "title": "Full Stack Developer",
      "period": "Dec 2022 - Mar 2025",
      "current": false,
      "description": "Working on a crypto trading platform",
      "achievements": [
        "Led the front-end for a crypto trading platform, reducing initial load time by 30% using Meteor.js",
        "Developed scalable and accessible UI components with React.js and Ant-Design, including full-site Dark Mode for improved UX across devices",
        "Built and maintained RESTful APIs and live data synchronization using Meteor's DDP protocol, ensuring high-performance real-time features",
        "Delivered new end-to-end features based on business and user requirements, directly impacting client satisfaction and user engagement",
        "Collaborated closely with product managers and the QA team in Agile Scrum workflows using Jira and BitBucket, ensuring fast iteration cycles and clean codebase"
      ],
      "techStack": ["React.js", "Meteor.js", "Redux", "MongoDB", "Ant Design", "REST APIs", "Jira", "BitBucket"]
    }
  ],
  "education": [
    {
      "institution": "John-Bryce",
      "degree": "Full Stack Development",
      "period": "May 2021 - Mar 2022",
      "description": "Intensive 335-Hour Course",
      "technologies": {
        "programmingLanguages": ["TypeScript", "JavaScript"],
        "serverSide": ["Node.js"],
        "clientSide": ["React.js", "Angular"],
        "databases": ["MySQL", "MongoDB"]
      }
    }
  ],
  "militaryService": {
    "unit": "Shirion",
    "role": "Fighter",
    "period": "2016 - 2019"
  },
  "languages": [
    {
      "name": "Hebrew",
      "level": "Native"
    },
    {
      "name": "English",
      "level": "Fluent"
    }
  ],
  "projects": [],
  "additionalInfo": {
    "availability": "Immediate",
    "preferredRoles": ["Full Stack Developer", "Front End Developer", "React Developer"],
    "willingToLearn": true,
    "workType": ["Full-time", "Hybrid", "Remote"]
  }
};

export async function GET() {
  try {
    return NextResponse.json({ 
      success: true, 
      data: CV_DATA,
      cached: false 
    });
  } catch (error) {
    console.error('CV data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load CV data' },
      { status: 500 }
    );
  }
}