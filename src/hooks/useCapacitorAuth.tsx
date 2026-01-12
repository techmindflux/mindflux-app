import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle OAuth deep link callbacks in Capacitor apps
 * This catches the OAuth redirect and extracts tokens from the URL
 */
export function useCapacitorAuth() {
  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleDeepLink = async (url: string) => {
      // Check if this is an auth callback
      if (url.includes("auth/v1/callback") || url.includes("access_token")) {
        try {
          const urlObj = new URL(url);
          
          // Tokens can be in hash fragment or query params
          let params: URLSearchParams;
          
          if (urlObj.hash && urlObj.hash.length > 1) {
            // Remove the leading '#'
            params = new URLSearchParams(urlObj.hash.substring(1));
          } else {
            params = urlObj.searchParams;
          }

          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error("Error setting session from deep link:", error.message);
            } else {
              console.log("Successfully authenticated via deep link");
            }
          }
        } catch (error) {
          console.error("Error handling auth deep link:", error);
        }
      }
    };

    // Listen for app URL open events (deep links)
    let listenerHandle: { remove: () => void } | null = null;
    
    App.addListener("appUrlOpen", async (event) => {
      console.log("App URL opened:", event.url);
      await handleDeepLink(event.url);
    }).then((handle) => {
      listenerHandle = handle;
    });

    // Check if app was opened via deep link
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log("App launched with URL:", result.url);
        handleDeepLink(result.url);
      }
    });

    return () => {
      listenerHandle?.remove();
    };
  }, []);
}
