import { useQuery } from "@tanstack/react-query";
import { fetchSetting } from "@/lib/site-settings";
import logoAsset from "@/assets/logo.jpg.asset.json";

export function useSiteLogo() {
  const q = useQuery({
    queryKey: ["site-settings", "logo_url"],
    queryFn: () => fetchSetting("logo_url"),
    staleTime: 60_000,
  });
  return {
    url: q.data || logoAsset.url,
    isCustom: !!q.data,
    isLoading: q.isLoading,
  };
}