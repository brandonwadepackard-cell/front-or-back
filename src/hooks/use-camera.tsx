import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useState } from 'react';

export const useCamera = () => {
  const [image, setImage] = useState<string | null>(null);
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async () => {
    if (!isNative) {
      console.log('Camera only available on native platforms');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
      });

      const imageUrl = photo.webPath;
      setImage(imageUrl || null);
      return imageUrl;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  const selectFromGallery = async () => {
    if (!isNative) {
      console.log('Gallery only available on native platforms');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90,
      });

      const imageUrl = photo.webPath;
      setImage(imageUrl || null);
      return imageUrl;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  };

  return { takePicture, selectFromGallery, image, isNative };
};
