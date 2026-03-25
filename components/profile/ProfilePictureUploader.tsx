import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  Modal,
} from 'react-native';
import { Camera, Image as ImageIcon, User as UserIcon } from 'lucide-react-native';
import { colors, spacing } from '@/constants/theme';
import {
  pickImageForCrop,
  takeImageForCrop,
  cropResizeAndUpload,
  PickedImage,
} from '@/services/profileUploadService';
import ImageCropModal from './ImageCropModal';

interface ProfilePictureUploaderProps {
  userId: string;
  currentPhotoUrl?: string | null;
  size?: number;
  onUploadSuccess: (url: string) => void;
}

export default function ProfilePictureUploader({
  userId,
  currentPhotoUrl,
  size = 100,
  onUploadSuccess,
}: ProfilePictureUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null | undefined>(currentPhotoUrl);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);

  const handlePick = async (source: 'library' | 'camera') => {
    setSourceMenuVisible(false);
    const image = source === 'library'
      ? await pickImageForCrop()
      : await takeImageForCrop();

    if (image) {
      setPickedImage(image);
    }
  };

  const handleCropConfirm = async (originX: number, originY: number, cropSize: number) => {
    if (!pickedImage) return;
    setPickedImage(null);
    setUploading(true);
    try {
      const result = await cropResizeAndUpload(userId, pickedImage.uri, originX, originY, cropSize);
      if (result.success && result.url) {
        setPhotoUrl(result.url);
        onUploadSuccess(result.url);
      } else if (result.error) {
        Alert.alert('Upload Failed', result.error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => setPickedImage(null);

  const showPicker = () => {
    if (Platform.OS === 'web') {
      handlePick('library');
      return;
    }
    setSourceMenuVisible(true);
  };

  const avatarSize = size;
  const badgeSize = Math.round(size * 0.32);
  const badgeOffset = Math.round(size * 0.04);

  return (
    <>
      <TouchableOpacity
        onPress={showPicker}
        disabled={uploading}
        activeOpacity={0.8}
        style={[styles.wrapper, { width: avatarSize, height: avatarSize }]}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          >
            <UserIcon size={avatarSize * 0.46} color={colors.text_secondary} />
          </View>
        )}

        {/* Edit badge */}
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: badgeOffset,
              right: badgeOffset,
            },
          ]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.bg_primary} />
          ) : (
            <Camera size={badgeSize * 0.55} color={colors.bg_primary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Source picker modal (native only) */}
      <Modal
        visible={sourceMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSourceMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSourceMenuVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Update Profile Photo</Text>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => handlePick('library')}
            >
              <ImageIcon size={22} color={colors.accent_green_bright} />
              <Text style={styles.sheetOptionText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => handlePick('camera')}
            >
              <Camera size={22} color={colors.accent_green_bright} />
              <Text style={styles.sheetOptionText}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetOption, styles.cancelOption]}
              onPress={() => setSourceMenuVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Crop modal — shown after picking any image */}
      {pickedImage && (
        <ImageCropModal
          visible={!!pickedImage}
          uri={pickedImage.uri}
          imageWidth={pickedImage.width}
          imageHeight={pickedImage.height}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  avatar: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#1a2e22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.2)',
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.accent_green_bright,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg_primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a2e22',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: spacing.xl + 16,
  },
  sheetTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(52, 211, 153, 0.1)',
  },
  sheetOptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: colors.text_primary,
  },
  cancelOption: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: spacing.sm,
  },
  cancelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: colors.text_secondary,
  },
});
