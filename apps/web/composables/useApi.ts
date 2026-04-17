export const useApi = () => {
  const config = useRuntimeConfig();
  const supabase = useSupabaseClient();

  const apiFetch = async <T>(url: string, options: any = {}): Promise<T> => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: any = { ...options.headers };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    return $fetch<T>(`${config.public.apiBase}${url}`, { ...options, headers });
  };

  return { apiFetch };
};
