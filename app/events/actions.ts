"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create an event" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const eventDate = formData.get("eventDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string)?.trim();
  const peakId = (formData.get("peakId") as string) || null;
  const maxAttendeesStr = formData.get("maxAttendees") as string;
  const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr, 10) : null;

  // Validation
  if (!title || title.length < 1 || title.length > 200) {
    return { error: "Title must be between 1 and 200 characters" };
  }

  if (description && description.length > 2000) {
    return { error: "Description must be 2000 characters or less" };
  }

  if (!eventDate) {
    return { error: "Event date is required" };
  }

  const eventDateObj = new Date(eventDate);
  if (eventDateObj <= new Date()) {
    return { error: "Event date must be in the future" };
  }

  if (!location) {
    return { error: "Location is required" };
  }

  if (maxAttendees !== null && (isNaN(maxAttendees) || maxAttendees <= 0)) {
    return { error: "Max attendees must be a positive number" };
  }

  // Insert event
  const { data: eventData, error: eventError } = await supabase
    .from("community_events")
    .insert({
      created_by: user.id,
      title,
      description,
      event_date: eventDateObj.toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      location,
      peak_id: peakId || null,
      max_attendees: maxAttendees,
    })
    .select("id")
    .single();

  if (eventError || !eventData) {
    console.error("Error creating event:", eventError);
    return { error: "Failed to create event" };
  }

  const eventId = (eventData as { id: string }).id;

  // Auto-create community post
  const dateStr = eventDateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const descSnippet = description ? `\n${description.slice(0, 200)}${description.length > 200 ? "..." : ""}` : "";
  const postContent = `\u{1F4C5} ${title}\n${dateStr} \u{2022} ${location}${descSnippet}`;

  const { data: postData } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      content: postContent,
      peak_id: peakId || null,
      is_condition_report: false,
    })
    .select("id")
    .single();

  // Link the post to the event
  if (postData) {
    const postId = (postData as { id: string }).id;
    await supabase
      .from("community_events")
      .update({ community_post_id: postId })
      .eq("id", eventId);
  }

  // Auto-RSVP the creator
  await supabase.from("event_attendees").insert({
    event_id: eventId,
    user_id: user.id,
  });

  revalidatePath("/events");
  revalidatePath("/community");
  return { success: true, event: { id: eventId } };
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from("community_events")
    .select("id, created_by, community_post_id")
    .eq("id", eventId)
    .single();

  if (!existing || existing.created_by !== user.id) {
    return { error: "You can only edit your own events" };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const eventDate = formData.get("eventDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string)?.trim();
  const peakId = (formData.get("peakId") as string) || null;
  const maxAttendeesStr = formData.get("maxAttendees") as string;
  const maxAttendees = maxAttendeesStr ? parseInt(maxAttendeesStr, 10) : null;

  if (!title || title.length < 1 || title.length > 200) {
    return { error: "Title must be between 1 and 200 characters" };
  }

  if (description && description.length > 2000) {
    return { error: "Description must be 2000 characters or less" };
  }

  if (!eventDate) {
    return { error: "Event date is required" };
  }

  if (!location) {
    return { error: "Location is required" };
  }

  if (maxAttendees !== null && (isNaN(maxAttendees) || maxAttendees <= 0)) {
    return { error: "Max attendees must be a positive number" };
  }

  const eventDateObj = new Date(eventDate);

  const { error: updateError } = await supabase
    .from("community_events")
    .update({
      title,
      description,
      event_date: eventDateObj.toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      location,
      peak_id: peakId || null,
      max_attendees: maxAttendees,
    })
    .eq("id", eventId);

  if (updateError) {
    console.error("Error updating event:", updateError);
    return { error: "Failed to update event" };
  }

  // Update linked community post
  if (existing.community_post_id) {
    const dateStr = eventDateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const descSnippet = description ? `\n${description.slice(0, 200)}${description.length > 200 ? "..." : ""}` : "";
    const postContent = `\u{1F4C5} ${title}\n${dateStr} \u{2022} ${location}${descSnippet}`;

    await supabase
      .from("community_posts")
      .update({ content: postContent, peak_id: peakId || null })
      .eq("id", existing.community_post_id);
  }

  revalidatePath("/events");
  revalidatePath("/community");
  return { success: true };
}

export async function cancelEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { data: existing } = await supabase
    .from("community_events")
    .select("id, created_by, community_post_id, title")
    .eq("id", eventId)
    .single();

  if (!existing || existing.created_by !== user.id) {
    return { error: "You can only cancel your own events" };
  }

  const { error } = await supabase
    .from("community_events")
    .update({ status: "cancelled" })
    .eq("id", eventId);

  if (error) {
    console.error("Error cancelling event:", error);
    return { error: "Failed to cancel event" };
  }

  // Update linked community post with cancellation note
  if (existing.community_post_id) {
    await supabase
      .from("community_posts")
      .update({ content: `\u{274C} [CANCELLED] ${existing.title}\nThis event has been cancelled.` })
      .eq("id", existing.community_post_id);
  }

  revalidatePath("/events");
  revalidatePath("/community");
  return { success: true };
}

export async function toggleEventAttendance(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to RSVP" };
  }

  // Check event status and capacity
  const { data: event } = await supabase
    .from("community_events")
    .select("id, status, max_attendees")
    .eq("id", eventId)
    .single();

  if (!event || event.status !== "active") {
    return { error: "This event is not accepting RSVPs" };
  }

  // Check if already RSVP'd
  const { data: existing } = await supabase
    .from("event_attendees")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // Remove RSVP
    const { error } = await supabase
      .from("event_attendees")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error removing RSVP:", error);
      return { error: "Failed to remove RSVP" };
    }
    return { success: true, attending: false };
  } else {
    // Check capacity
    if (event.max_attendees) {
      const { count } = await supabase
        .from("event_attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if ((count ?? 0) >= event.max_attendees) {
        return { error: "This event is full" };
      }
    }

    // Add RSVP
    const { error } = await supabase.from("event_attendees").insert({
      event_id: eventId,
      user_id: user.id,
    });

    if (error) {
      console.error("Error adding RSVP:", error);
      return { error: "Failed to RSVP" };
    }
    return { success: true, attending: true };
  }
}
