"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a post" };
  }

  const content = formData.get("content") as string;
  const peakId = formData.get("peakId") as string | null;
  const isConditionReport = formData.get("isConditionReport") === "true";
  const groupId = formData.get("groupId") as string | null;

  if (!content || content.trim().length === 0) {
    return { error: "Post content is required" };
  }

  if (content.length > 2000) {
    return { error: "Post content must be 2000 characters or less" };
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      content: content.trim(),
      peak_id: peakId || null,
      is_condition_report: isConditionReport,
      group_id: groupId || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return { error: "Failed to create post" };
  }

  revalidatePath("/community");
  return { success: true, post: data };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete a post" };
  }

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id); // RLS ensures users can only delete their own

  if (error) {
    console.error("Error deleting post:", error);
    return { error: "Failed to delete post" };
  }

  revalidatePath("/community");
  return { success: true };
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to like a post" };
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error unliking post:", error);
      return { error: "Failed to unlike post" };
    }
    return { success: true, liked: false };
  } else {
    // Like
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      console.error("Error liking post:", error);
      return { error: "Failed to like post" };
    }
    return { success: true, liked: true };
  }
}

export async function toggleSave(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to save a post" };
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from("post_saves")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from("post_saves")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Error unsaving post:", error);
      return { error: "Failed to unsave post" };
    }
    return { success: true, saved: false };
  } else {
    // Save
    const { error } = await supabase.from("post_saves").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      console.error("Error saving post:", error);
      return { error: "Failed to save post" };
    }
    return { success: true, saved: true };
  }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to comment" };
  }

  if (!content || content.trim().length === 0) {
    return { error: "Comment content is required" };
  }

  if (content.length > 1000) {
    return { error: "Comment must be 1000 characters or less" };
  }

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select(
      `
      *,
      profiles:user_id (
        screen_name,
        full_name,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    console.error("Error adding comment:", error);
    return { error: "Failed to add comment" };
  }

  revalidatePath("/community");
  return { success: true, comment: data };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete a comment" };
  }

  const { error } = await supabase
    .from("post_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting comment:", error);
    return { error: "Failed to delete comment" };
  }

  revalidatePath("/community");
  return { success: true };
}
