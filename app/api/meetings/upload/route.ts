import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { processRecording } from '@/lib/ai/summarize';
import { insertFullMeeting, formatSecondsToTimestamp } from '@/lib/meetings/mutations';

export const dynamic = 'force-dynamic';
// Set max duration for serverless processing (Gemini audio call can take up to 60s)
export const maxDuration = 60;

const MAX_FILE_SIZE = 26214400; // 25MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customTitle = (formData.get('title') as string | null)?.trim();

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select an audio or video file.' },
        { status: 400 }
      );
    }

    // 1. Validate file type
    const mimeType = file.type || '';
    const isAudioOrVideo =
      mimeType.startsWith('audio/') ||
      mimeType.startsWith('video/') ||
      /\.(mp3|wav|m4a|aac|ogg|webm|mp4|mov)$/i.test(file.name);

    if (!isAudioOrVideo) {
      return NextResponse.json(
        {
          error:
            'Invalid file format. Please upload a supported audio or video recording (e.g., MP3, M4A, WAV, MP4, WebM).',
        },
        { status: 400 }
      );
    }

    // 2. Validate file size (cap at 25MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size (${(file.size / (1024 * 1024)).toFixed(
            1
          )}MB) exceeds the 25MB limit. Please upload a smaller recording.`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${Date.now()}-${sanitizedName}`;

    // 3. Upload raw recording to private Supabase Storage bucket
    const { error: storageError } = await supabaseAdmin.storage
      .from('recordings')
      .upload(storagePath, buffer, {
        contentType: mimeType || 'application/octet-stream',
        upsert: false,
      });

    if (storageError) {
      console.error('Storage upload error:', storageError.message);
      return NextResponse.json(
        { error: `Failed to upload file to storage: ${storageError.message}` },
        { status: 500 }
      );
    }

    // Generate signed URL (30 days validity)
    const { data: signedData } = await supabaseAdmin.storage
      .from('recordings')
      .createSignedUrl(storagePath, 60 * 60 * 24 * 30);

    const recordingUrl = signedData?.signedUrl || storagePath;

    // 4. Send audio to Gemini for transcription and intelligence extraction
    const fileBase64 = buffer.toString('base64');
    let processed = null;
    try {
      processed = await processRecording(fileBase64, mimeType || 'audio/mp4');
    } catch (aiErr: any) {
      console.warn('Gemini processing encountered error:', aiErr.message);
    }

    // 5. Compute metadata
    const cleanTitle =
      customTitle ||
      file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
      'Recorded Meeting';

    let durationStr = '10m';
    if (processed?.transcript && processed.transcript.length > 0) {
      const lastSec = processed.transcript[processed.transcript.length - 1].startSec;
      const minutes = Math.max(1, Math.ceil((lastSec + 15) / 60));
      durationStr = `${minutes}m`;
    }

    const participants = Array.from(
      new Set(processed?.transcript?.map((t) => t.speaker).filter(Boolean) || [])
    );
    if (participants.length === 0) {
      participants.push('Speaker 1');
    }

    const isAIFailure = !processed;

    // 6. Insert meeting row, transcript lines, and action items via shared helper
    const { meeting } = await insertFullMeeting(supabaseAdmin, {
      title: cleanTitle,
      date: new Date().toISOString(),
      duration: durationStr,
      status: 'past',
      participants,
      summary: processed
        ? processed.summary
        : 'Recording uploaded successfully. Automated AI transcription could not be completed for this recording; the raw file has been preserved.',
      decisions: processed?.decisions || [],
      recording_url: recordingUrl,
      transcript: (processed?.transcript || []).map((t) => ({
        speaker: t.speaker || 'Speaker',
        text: t.text,
        offset_seconds: t.startSec,
        timestamp: formatSecondsToTimestamp(t.startSec),
      })),
      actionItems: (processed?.actionItems || []).map((a) => ({
        text: a.title,
        owner: a.owner || null,
      })),
    });

    return NextResponse.json({
      id: meeting.id,
      success: true,
      processed: !isAIFailure,
    });
  } catch (err: any) {
    console.error('Unexpected error in POST /api/meetings/upload:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
