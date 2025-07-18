import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../supabase';
import { fetchUserTeamMembership } from '../supabaseTeams';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

function useProvideAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [teamMembership, setTeamMembership] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null);
      if (data?.session?.user) {
        fetchProfile(data.session.user.id);
        fetchTeam(data.session.user.id);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchTeam(session.user.id);
      } else {
        setProfile(null);
        setTeamMembership(null);
      }
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
    if (!error && data) {
      setProfile({
        id: data.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        avatar: data.avatar,
        quiz_completed: data.quiz_completed,
        position: data.position,
        short_term_goal: data.short_term_goal,
        sport: data.sport,
        level: data.level,
        birthday: data.birthday,
      });
    }
  };

  const fetchTeam = async (id: string) => {
    try {
      const membership = await fetchUserTeamMembership(id);
      setTeamMembership(membership);
    } catch (e) {
      setTeamMembership(null);
    }
  };

  const refreshProfile = async () => {
    if (user && user.id) {
      await fetchProfile(user.id);
    }
  };

  const refreshTeamMembership = async () => {
    if (user && user.id) {
      await fetchTeam(user.id);
    }
  };

  const signUp = async ({ email, password, first_name, last_name }: { email: string; password: string; first_name: string; last_name: string }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error || new Error('No user returned');
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      first_name,
      last_name,
      quiz_completed: false, // New users start with quiz not completed
    });
    await fetchProfile(data.user.id);
    return { data, error };
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw error || new Error('No user returned');
    await fetchProfile(data.user.id);
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, signUp, signIn, signOut, refreshProfile, teamMembership, refreshTeamMembership };
} 