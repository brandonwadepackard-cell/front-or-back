import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCamera } from '@/hooks/use-camera';
import { useHaptics } from '@/hooks/use-haptics';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Camera, Bell, Vibrate, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const NativeFeatures = () => {
  const { takePicture, selectFromGallery, image, isNative: cameraAvailable } = useCamera();
  const { triggerHaptic, isNative: hapticsAvailable } = useHaptics();
  const { isRegistered, token, sendTestNotification, isNative: pushAvailable } = usePushNotifications();

  const handleTakePicture = async () => {
    await triggerHaptic('medium');
    const result = await takePicture();
    if (result) {
      toast.success('Picture taken!');
    } else if (!cameraAvailable) {
      toast.info('Camera is only available on native iOS/Android apps');
    }
  };

  const handleSelectFromGallery = async () => {
    await triggerHaptic('light');
    const result = await selectFromGallery();
    if (result) {
      toast.success('Image selected!');
    } else if (!cameraAvailable) {
      toast.info('Gallery is only available on native iOS/Android apps');
    }
  };

  const handleHaptic = (type: 'light' | 'medium' | 'heavy') => {
    triggerHaptic(type);
    toast.success(`${type} haptic feedback triggered!`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Smartphone className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Native iOS Features</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Haptic Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vibrate className="h-5 w-5" />
              Haptic Feedback
            </CardTitle>
            <CardDescription>
              Feel the difference with native haptic feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => handleHaptic('light')} variant="outline" className="w-full">
              Light Haptic
            </Button>
            <Button onClick={() => handleHaptic('medium')} variant="outline" className="w-full">
              Medium Haptic
            </Button>
            <Button onClick={() => handleHaptic('heavy')} variant="outline" className="w-full">
              Heavy Haptic
            </Button>
            {!hapticsAvailable && (
              <p className="text-sm text-muted-foreground">
                Haptics work on native iOS/Android apps
              </p>
            )}
          </CardContent>
        </Card>

        {/* Camera Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Access
            </CardTitle>
            <CardDescription>
              Take photos or select from gallery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleTakePicture} variant="outline" className="w-full">
              Take Picture
            </Button>
            <Button onClick={handleSelectFromGallery} variant="outline" className="w-full">
              Select from Gallery
            </Button>
            {image && (
              <div className="mt-4">
                <img src={image} alt="Selected" className="w-full rounded-lg" />
              </div>
            )}
            {!cameraAvailable && (
              <p className="text-sm text-muted-foreground">
                Camera works on native iOS/Android apps
              </p>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Receive push notifications on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">Registration Status:</span>
              <span className={`text-sm ${isRegistered ? 'text-green-600' : 'text-muted-foreground'}`}>
                {isRegistered ? 'Registered ✓' : 'Not registered'}
              </span>
            </div>
            {token && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Device Token:</p>
                <p className="text-xs text-muted-foreground font-mono break-all">{token}</p>
              </div>
            )}
            <Button onClick={sendTestNotification} variant="outline" className="w-full">
              View Token Info
            </Button>
            {!pushAvailable && (
              <p className="text-sm text-muted-foreground">
                Push notifications work on native iOS/Android apps. Configure in your app's backend.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>To use these features on iOS:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Build and sync your app: <code className="bg-muted px-2 py-1 rounded">npx cap sync</code></li>
            <li>Run on iOS: <code className="bg-muted px-2 py-1 rounded">npx cap run ios</code></li>
            <li>For camera: Add camera permissions to Info.plist</li>
            <li>For push: Configure APNs in Apple Developer Portal</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default NativeFeatures;
