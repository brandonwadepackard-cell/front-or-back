import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';

const DeepLinking = () => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const deepLinks = [
    {
      name: 'Dashboard',
      customScheme: 'brandonhub://dashboard',
      universal: 'https://yourdomain.com/dashboard',
      description: 'Open the main dashboard',
    },
    {
      name: 'Content Generator',
      customScheme: 'brandonhub://content',
      universal: 'https://yourdomain.com/content',
      description: 'Create new content',
    },
    {
      name: 'Calendar',
      customScheme: 'brandonhub://calendar',
      universal: 'https://yourdomain.com/calendar',
      description: 'View content calendar',
    },
    {
      name: 'Analytics',
      customScheme: 'brandonhub://analytics',
      universal: 'https://yourdomain.com/analytics',
      description: 'View analytics dashboard',
    },
    {
      name: 'Native Features',
      customScheme: 'brandonhub://native-features',
      universal: 'https://yourdomain.com/native-features',
      description: 'Test native iOS features',
    },
  ];

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(text);
      toast.success(`Copied ${name} link!`);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Deep Linking</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What are Deep Links?</CardTitle>
          <CardDescription>
            Deep links allow you to open specific sections of your app from URLs, notifications, emails, or other apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="outline">Custom Scheme</Badge>
              <span className="text-sm">brandonhub://</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Opens directly in your native app. Works on devices with the app installed.
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              brandonhub://dashboard
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Badge variant="outline">Universal Links</Badge>
              <span className="text-sm">https://yourdomain.com/</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Opens in your app if installed, otherwise opens in browser. Requires domain verification.
            </p>
            <code className="text-xs bg-muted p-2 rounded block">
              https://yourdomain.com/content
            </code>
          </div>

          {isNative ? (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Deep linking is active!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Running on native iOS/Android - deep links will work.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Deep linking requires running on a native iOS or Android app. Build and run with Capacitor to test.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {deepLinks.map((link) => (
          <Card key={link.name}>
            <CardHeader>
              <CardTitle className="text-lg">{link.name}</CardTitle>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-semibold mb-1 text-muted-foreground">Custom Scheme:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 truncate">
                    {link.customScheme}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(link.customScheme, link.name)}
                  >
                    {copiedLink === link.customScheme ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold mb-1 text-muted-foreground">Universal Link:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted p-2 rounded flex-1 truncate">
                    {link.universal}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(link.universal, link.name)}
                  >
                    {copiedLink === link.universal ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {isNative && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    window.open(link.customScheme, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Link
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Configure iOS (Info.plist)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add custom URL scheme to <code className="bg-muted px-1 rounded">ios/App/App/Info.plist</code>:
            </p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>brandonhub</string>
    </array>
  </dict>
</array>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Configure Universal Links (Optional)</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add associated domains in Xcode (Signing & Capabilities):
            </p>
            <pre className="text-xs bg-muted p-3 rounded">
{`applinks:yourdomain.com
applinks:www.yourdomain.com`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Requires hosting an apple-app-site-association file on your domain.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Test Deep Links</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Build and run on device/simulator</li>
              <li>Open Safari and enter a custom scheme URL</li>
              <li>Or send yourself a test notification with a deep link</li>
              <li>App should open to the specified section</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">4. Use in Push Notifications</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add deep links to notification payloads:
            </p>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "notification": {
    "title": "New Content Ready",
    "body": "Check your dashboard"
  },
  "data": {
    "deeplink": "brandonhub://dashboard"
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepLinking;
