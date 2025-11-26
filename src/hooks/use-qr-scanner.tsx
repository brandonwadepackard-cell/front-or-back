import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';
import { toast } from 'sonner';

export const useQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const checkPermission = async (): Promise<boolean> => {
    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      
      if (camera === 'granted') {
        return true;
      }
      
      const { camera: requestedPermission } = await BarcodeScanner.requestPermissions();
      
      if (requestedPermission === 'granted') {
        return true;
      }
      
      toast.error('Camera permission denied. Please enable it in settings.');
      return false;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      toast.error('Failed to check camera permission');
      return false;
    }
  };

  const startScan = async (): Promise<string | null> => {
    if (!isNative) {
      toast.info('QR scanning only works on native iOS/Android apps');
      return null;
    }

    const hasPermission = await checkPermission();
    if (!hasPermission) {
      return null;
    }

    try {
      setIsScanning(true);
      
      // Hide the app content while scanning
      document.querySelector('body')?.classList.add('scanner-active');
      
      const { barcodes } = await BarcodeScanner.scan();
      
      // Show the app content again
      document.querySelector('body')?.classList.remove('scanner-active');
      setIsScanning(false);

      if (barcodes && barcodes.length > 0) {
        return barcodes[0].rawValue || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      document.querySelector('body')?.classList.remove('scanner-active');
      setIsScanning(false);
      toast.error('Failed to scan QR code');
      return null;
    }
  };

  const stopScan = async () => {
    try {
      await BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('scanner-active');
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  };

  return {
    startScan,
    stopScan,
    isScanning,
    isNative,
  };
};
