import { NextResponse } from 'next/server';
import { parseResumeBuffer } from '@/lib/resume-parser';


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetRole = (formData.get('targetRole') as string) || 'Software Engineer';

    if (!file) {
      return NextResponse.json({ error: 'No resume file was uploaded.' }, { status: 400 });
    }

    // Validate size (max 6MB)
    const MAX_SIZE = 6 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowable limit of 6MB.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'resume.pdf';
    const lowerName = fileName.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a PDF (.pdf), Word Document (.docx), or plain text (.txt) file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedResume = await parseResumeBuffer(buffer, fileName, file.size, targetRole);

    return NextResponse.json({
      success: true,
      resume: parsedResume
    });
  } catch (error: any) {
    console.error('API parse-resume error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process resume file on server.' },
      { status: 500 }
    );
  }
}
