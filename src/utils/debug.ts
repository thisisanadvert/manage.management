export const debugAuth = async () => {
  try {
    const { data: session, error } = await supabase.auth.getSession();
    if (error) throw error;

    console.log('Current session:', session);
    
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    console.log('Current user:', user);
    
    const { data: roles, error: rolesError } = await supabase
      .from('building_users')
      .select('role')
      .eq('user_id', user?.user?.id);
      
    if (rolesError) throw rolesError;

    console.log('User roles:', roles);
  } catch (error) {
    console.error('Debug error:', error);
  }
};