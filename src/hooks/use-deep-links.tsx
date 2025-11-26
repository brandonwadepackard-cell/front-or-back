import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useDeepLinks = () => {
  const navigate = useNavigate();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Handle deep links when app is opened
    const handleAppUrlOpen = (event: URLOpenListenerEvent) => {
      const url = event.url;
      console.log('Deep link received:', url);

      // Parse the URL to extract the route
      // Example: brandonhub://dashboard or https://yourdomain.com/content
      const route = parseDeepLink(url);
      
      if (route) {
        navigate(route.path, { state: route.params });
        toast.success(`Opened ${route.name || route.path}`);
      }
    };

    // Listen for URL open events
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Check if app was opened with a URL
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('App launched with URL:', result.url);
        const route = parseDeepLink(result.url);
        if (route) {
          navigate(route.path, { state: route.params });
        }
      }
    });

    return () => {
      App.removeAllListeners();
    };
  }, [navigate, isNative]);

  return { isNative };
};

interface DeepLinkRoute {
  path: string;
  name?: string;
  params?: Record<string, any>;
}

const parseDeepLink = (url: string): DeepLinkRoute | null => {
  try {
    // Handle custom scheme (brandonhub://)
    if (url.startsWith('brandonhub://')) {
      const path = url.replace('brandonhub://', '/');
      return mapPathToRoute(path);
    }

    // Handle universal links (https://yourdomain.com/)
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams);
    
    return {
      ...mapPathToRoute(path),
      params: Object.keys(params).length > 0 ? params : undefined,
    };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

const mapPathToRoute = (path: string): DeepLinkRoute => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Map common routes
  const routeMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/content': 'Content Generator',
    '/history': 'Content History',
    '/templates': 'Templates',
    '/calendar': 'Calendar',
    '/analytics': 'Analytics',
    '/library': 'Content Library',
    '/scraper': 'Web Scraper',
    '/native-features': 'Native Features',
    '/admin': 'Admin Dashboard',
  };

  return {
    path: cleanPath,
    name: routeMap[cleanPath] || cleanPath,
  };
};
