const fs = require('fs');
const path = require('path');

const apiDir = path.join('app', 'api', 'faculty');
const files = [
  'courses/route.ts',
  'degree/candidates/route.ts',
  'grades/route.ts',
  'research/route.ts',
  'transcripts/route.ts',
  'transfers/route.ts',
  'validators/route.ts'
];

files.forEach(file => {
  const p = path.join(apiDir, file);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  if (!content.includes('getSessionClaimsFromRequest')) {
    content = content.replace('import { NextRequest, NextResponse } from "next/server"', 
      'import { NextRequest, NextResponse } from "next/server"\nimport { getSessionClaimsFromRequest } from "@/lib/auth/session"');
  }

  content = content.replace(
    /const facultyId = request\.nextUrl\.searchParams\.get\("facultyId"\)( \|\| undefined)?/,
    'const claims = await getSessionClaimsFromRequest(request)\n  const facultyId = claims?.sub'
  );
  
  fs.writeFileSync(p, content);
  console.log('Updated ' + file);
});
