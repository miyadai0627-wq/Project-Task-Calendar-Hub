import { google } from "googleapis";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

const TIME_ZONE = "Asia/Tokyo";

interface SyncRequestBody {
  title: string;
  description?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  googleEventId?: string;
}

function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as SyncRequestBody;
  const { title, description, scheduledDate, startTime, endTime, googleEventId } = body;

  if (!title || !scheduledDate || !startTime || !endTime) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const calendar = getCalendarClient(session.accessToken);
  const requestBody = {
    summary: title,
    description,
    start: { dateTime: `${scheduledDate}T${startTime}:00`, timeZone: TIME_ZONE },
    end: { dateTime: `${scheduledDate}T${endTime}:00`, timeZone: TIME_ZONE },
  };

  try {
    const { data } = googleEventId
      ? await calendar.events.update({
          calendarId: "primary",
          eventId: googleEventId,
          requestBody,
        })
      : await calendar.events.insert({
          calendarId: "primary",
          requestBody,
        });

    return NextResponse.json({ eventId: data.id, htmlLink: data.htmlLink });
  } catch (error) {
    console.error("Google Calendar sync failed", error);
    return NextResponse.json({ error: "google_api_error" }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const { googleEventId } = (await request.json()) as { googleEventId?: string };
  if (!googleEventId) {
    return NextResponse.json({ error: "missing_event_id" }, { status: 400 });
  }

  const calendar = getCalendarClient(session.accessToken);

  try {
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Google Calendar delete failed", error);
    return NextResponse.json({ error: "google_api_error" }, { status: 502 });
  }
}
