import { supabase } from './supabase';
import { Session } from '@supabase/supabase-js';

/**
 * Fetch all teams (for join flow, leaderboard, etc.)
 */
export async function fetchTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

/**
 * Fetch the user's current team membership (active for this month)
 */
export async function fetchUserTeamMembership(userId: string) {
  const { data, error } = await supabase
    .from('team_memberships')
    .select('*, teams(*)')
    .eq('user_id', userId)
    .eq('active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // Not found is ok
  return data;
}

/**
 * Join a team (creates or updates membership for this month)
 */
export async function joinTeam(userId: string, teamId: string, joinedMonth: string) {
  // joinedMonth: 'YYYY-MM-01' (first of month)
  const { data, error } = await supabase
    .from('team_memberships')
    .upsert([
      {
        user_id: userId,
        team_id: teamId,
        joined_month: joinedMonth,
        active: true,
        switch_pending: false,
        requested_team_id: null,
        created_at: new Date().toISOString(),
      },
    ], { onConflict: 'user_id,joined_month' })
    .select();
  if (error) throw error;
  return data;
}

/**
 * Request a team switch (takes effect next month)
 */
export async function requestTeamSwitch(userId: string, requestedTeamId: string, currentMonth: string) {
  const { data, error } = await supabase
    .from('team_memberships')
    .update({ switch_pending: true, requested_team_id: requestedTeamId })
    .eq('user_id', userId)
    .eq('joined_month', currentMonth)
    .select();
  if (error) throw error;
  return data;
}

/**
 * Record a session (journal or meditation)
 */
export async function recordSession(userId: string, sessionType: 'journal' | 'meditation', sessionDate: string) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ user_id: userId, session_type: sessionType, session_date: sessionDate });
  if (error) throw error;
  return data;
}

/**
 * Fetch leaderboard for the current month (top N teams, include all teams with at least 1 session for testing)
 */
export async function fetchLeaderboard(month: string, limit = 50) {
  // Fetch all teams and left join with leaderboard
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, image_url');
  if (teamsError) throw teamsError;

  const { data: leaderboard, error: leaderboardError } = await supabase
    .from('team_leaderboard')
    .select('team_id, total_points')
    .eq('month', month);
  if (leaderboardError) throw leaderboardError;

  // Merge: every team gets its points, or 1 if missing
  const merged = teams.map(team => {
    const entry = leaderboard.find(l => l.team_id === team.id);
    return {
      ...team,
      total_points: entry ? Math.max(1, entry.total_points) : 1,
    };
  });

  // Sort by points descending, then name
  merged.sort((a, b) => b.total_points - a.total_points || a.name.localeCompare(b.name));

  return merged.slice(0, limit);
} 