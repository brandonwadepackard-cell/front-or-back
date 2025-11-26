import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Scan, Download, Share2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQRScanner } from '@/hooks/use-qr-scanner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Validation schema for custom text QR codes
const customTextSchema = z.string()
  .trim()
  .min(1, 'Content cannot be empty')
  .max(2000, 'Content must be less than 2000 characters');

const QRCodeShare = () => {
  const navigate = useNavigate();
  const { startScan, isScanning, isNative } = useQRScanner();
  
  const [selectedRoute, setSelectedRoute] = useState('/dashboard');
  const [customText, setCustomText] = useState('');
  const [validationError, setValidationError] = useState('');
  const [generatedQR, setGeneratedQR] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const deepLinkRoutes = [
    { path: '/dashboard', label: 'Dashboard', scheme: 'brandonhub://dashboard' },
    { path: '/content', label: 'Content Generator', scheme: 'brandonhub://content' },
    { path: '/calendar', label: 'Calendar', scheme: 'brandonhub://calendar' },
    { path: '/analytics', label: 'Analytics', scheme: 'brandonhub://analytics' },
    { path: '/library', label: 'Content Library', scheme: 'brandonhub://library' },
    { path: '/templates', label: 'Templates', scheme: 'brandonhub://templates' },
    { path: '/history', label: 'Content History', scheme: 'brandonhub://history' },
    { path: '/native-features', label: 'Native Features', scheme: 'brandonhub://native-features' },
  ];

  const handleGenerateDeepLink = () => {
    const route = deepLinkRoutes.find(r => r.path === selectedRoute);
    if (route) {
      setGeneratedQR(route.scheme);
      setValidationError('');
      toast.success('QR code generated!');
    }
  };

  const handleGenerateCustom = () => {
    setValidationError('');
    
    try {
      // Validate input
      const validated = customTextSchema.parse(customText);
      setGeneratedQR(validated);
      toast.success('QR code generated!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleScanQR = async () => {
    const result = await startScan();
    
    if (result) {
      toast.success('QR code scanned!');
      
      // Check if it's a deep link
      if (result.startsWith('brandonhub://')) {
        const path = result.replace('brandonhub://', '/');
        navigate(path);
      } else if (result.startsWith('http://') || result.startsWith('https://')) {
        // External URL
        toast.info('External link detected', {
          description: result,
          action: {
            label: 'Open',
            onClick: () => window.open(result, '_blank'),
          },
        });
      } else {
        // Custom text
        toast.info('Scanned content', {
          description: result.substring(0, 100) + (result.length > 100 ? '...' : ''),
        });
      }
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'brandonhub-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success('QR code downloaded!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <QrCode className="h-8 w-8" />
        <h1 className="text-3xl font-bold">QR Code Sharing</h1>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </TabsTrigger>
          <TabsTrigger value="scan">
            <Scan className="h-4 w-4 mr-2" />
            Scan QR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deep Link QR Code</CardTitle>
                <CardDescription>
                  Generate a QR code that opens a specific section of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="route-select">Select Section</Label>
                  <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                    <SelectTrigger id="route-select">
                      <SelectValue placeholder="Choose a section" />
                    </SelectTrigger>
                    <SelectContent>
                      {deepLinkRoutes.map((route) => (
                        <SelectItem key={route.path} value={route.path}>
                          {route.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleGenerateDeepLink} className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Deep Link QR
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Content QR</CardTitle>
                <CardDescription>
                  Generate a QR code with custom text or URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-text">Content</Label>
                  <Input
                    id="custom-text"
                    placeholder="Enter text or URL (max 2000 chars)"
                    value={customText}
                    onChange={(e) => {
                      setCustomText(e.target.value);
                      setValidationError('');
                    }}
                    maxLength={2000}
                  />
                  {validationError && (
                    <p className="text-sm text-destructive">{validationError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {customText.length} / 2000 characters
                  </p>
                </div>

                <Button 
                  onClick={handleGenerateCustom} 
                  className="w-full"
                  disabled={!customText.trim()}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate Custom QR
                </Button>
              </CardContent>
            </Card>
          </div>

          {generatedQR && (
            <Card>
              <CardHeader>
                <CardTitle>Generated QR Code</CardTitle>
                <CardDescription>
                  Scan this code to access the content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-6 bg-muted rounded-lg">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={generatedQR}
                    size={256}
                    level="H"
                    includeMargin
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs flex-1 truncate">{generatedQR}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedQR)}
                    >
                      {copiedText ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Brandon Hub QR Code',
                          text: generatedQR,
                        });
                      } else {
                        toast.info('Sharing not supported on this device');
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Point your camera at a QR code to scan it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isNative ? (
                <>
                  <div className="flex justify-center p-12 bg-muted rounded-lg">
                    <Scan className="h-32 w-32 text-muted-foreground" />
                  </div>

                  <Button 
                    onClick={handleScanQR} 
                    className="w-full"
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Scan className="h-4 w-4 mr-2 animate-pulse" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Scan className="h-4 w-4 mr-2" />
                        Start Scanning
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Point your camera at a QR code</p>
                    <p>• Make sure the QR code is well-lit</p>
                    <p>• Hold steady until the scan completes</p>
                  </div>
                </>
              ) : (
                <div className="p-6 bg-muted rounded-lg text-center space-y-2">
                  <Scan className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    QR code scanning is only available on native iOS/Android apps.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Build and run with Capacitor to use this feature.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Share App Sections</h4>
            <p className="text-sm text-muted-foreground">
              Generate QR codes for specific app sections and share them with team members for quick access.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Content Sharing</h4>
            <p className="text-sm text-muted-foreground">
              Create QR codes with custom URLs or text to share content between devices instantly.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Event Check-in</h4>
            <p className="text-sm text-muted-foreground">
              Generate unique QR codes for events and scan them for quick check-ins.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeShare;
