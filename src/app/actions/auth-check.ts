'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Checks whether an English full name already exists in the profiles database (case-insensitive).
 */
export async function checkEnglishNameCollision(name: string): Promise<boolean> {
  const trimmed = name.trim();
  if (!trimmed) return false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('english_full_name', trimmed)
      .limit(1);

    if (error) {
      // If table doesn't exist yet or query fails, treat as no collision
      return false;
    }

    return (data && data.length > 0) || false;
  } catch {
    return false;
  }
}