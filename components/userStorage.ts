import { supabase } from '../supabase';

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error || !data) return null;
  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    avatar: data.avatar,
  };
};

export const setUser = async (user: any) => {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return;
  await supabase.from('profiles').upsert({
    id: authUser.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    avatar: user.avatar,
  });
};

export const clearUser = async () => {
  await supabase.auth.signOut();
};

export const ensureProfileRowExists = async (extraFields: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const mapped: { [key: string]: any } = {
    id: user.id,
    email: user.email,
  };
  if (extraFields) {
    if (extraFields.firstName) mapped.first_name = extraFields.firstName;
    if (extraFields.lastName) mapped.last_name = extraFields.lastName;
    if (extraFields.avatar) mapped.avatar = extraFields.avatar;
  }
  await supabase.from('profiles').upsert(mapped);
}; 