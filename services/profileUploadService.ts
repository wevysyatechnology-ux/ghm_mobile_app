import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

const BUCKET = 'profile-photos';
const OUTPUT_SIZE = 400; // final square size in pixels

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/** Pick from library — returns raw asset for the crop UI to display */
export async function pickImageForCrop(): Promise<PickedImage | null> {
  const granted = await requestPermissions();
  if (!granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false, // we handle crop ourselves
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const { uri, width, height } = result.assets[0];
  return { uri, width, height };
}

/** Take from camera — returns raw asset for the crop UI to display */
export async function takeImageForCrop(): Promise<PickedImage | null> {
  const granted = await requestCameraPermissions();
  if (!granted) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled || !result.assets?.[0]) return null;
  const { uri, width, height } = result.assets[0];
  return { uri, width, height };
}

/**
 * Crop, resize, and upload a profile photo.
 * @param userId  Supabase user ID
 * @param uri     Local image URI
 * @param originX Crop origin X in original image pixels
 * @param originY Crop origin Y in original image pixels
 * @param size    Crop square size in original image pixels
 */
export async function cropResizeAndUpload(
  userId: string,
  uri: string,
  originX: number,
  originY: number,
  size: number
): Promise<UploadResult> {
  try {
    // Use the new v14 ImageManipulator API
    const context = ImageManipulator.manipulate(uri);
    context.crop({ originX, originY, width: size, height: size });
    context.resize({ width: OUTPUT_SIZE, height: OUTPUT_SIZE });
    const imageRef = await context.renderAsync();
    const saved = await imageRef.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    context.release();
    imageRef.release();

    // Convert to blob for upload
    const response = await fetch(saved.uri);
    const blob = await response.blob();

    const fileName = `${userId}/avatar_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ profile_photo: publicUrl })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, url: publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload failed' };
  }
}

