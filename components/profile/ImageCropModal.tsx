import React, { useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing } from '@/constants/theme';

const CROP_SIZE = Math.min(Dimensions.get('window').width - 48, 340);
const CORNER = 24;

interface Props {
  visible: boolean;
  uri: string;
  imageWidth: number;
  imageHeight: number;
  onConfirm: (originX: number, originY: number, size: number) => void;
  onCancel: () => void;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function ImageCropModal({
  visible,
  uri,
  imageWidth,
  imageHeight,
  onConfirm,
  onCancel,
}: Props) {
  // Scale image so its shorter dimension fills CROP_SIZE (no empty space)
  const scale = Math.max(CROP_SIZE / imageWidth, CROP_SIZE / imageHeight);
  const dispW = imageWidth * scale;
  const dispH = imageHeight * scale;

  // Maximum pan offsets (how far the image can slide)
  const maxPanX = Math.max(0, (dispW - CROP_SIZE) / 2);
  const maxPanY = Math.max(0, (dispH - CROP_SIZE) / 2);

  const panRef = useRef({ x: 0, y: 0 });
  const gestureStartRef = useRef({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const maxPanRef = useRef({ x: maxPanX, y: maxPanY });

  useEffect(() => {
    maxPanRef.current = { x: maxPanX, y: maxPanY };
  }, [maxPanX, maxPanY]);

  // Reset when a new image is loaded
  useEffect(() => {
    if (visible) {
      panRef.current = { x: 0, y: 0 };
      setPan({ x: 0, y: 0 });
    }
  }, [visible, uri]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        gestureStartRef.current = { ...panRef.current };
      },
      onPanResponderMove: (_, gs) => {
        const nx = clamp(gestureStartRef.current.x + gs.dx, -maxPanRef.current.x, maxPanRef.current.x);
        const ny = clamp(gestureStartRef.current.y + gs.dy, -maxPanRef.current.y, maxPanRef.current.y);
        panRef.current = { x: nx, y: ny };
        setPan({ x: nx, y: ny });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleConfirm = () => {
    // Map current pan back to crop origin in original image pixels
    // pan moves the image; when pan.x > 0 the image shifts right → we see more of the left side
    const originX = Math.max(0, Math.round(((dispW - CROP_SIZE) / 2 - pan.x) / scale));
    const originY = Math.max(0, Math.round(((dispH - CROP_SIZE) / 2 - pan.y) / scale));
    const cropSize = Math.round(CROP_SIZE / scale);
    onConfirm(originX, originY, cropSize);
  };

  // Position image within the crop box
  const imgLeft = (CROP_SIZE - dispW) / 2 + pan.x;
  const imgTop = (CROP_SIZE - dispH) / 2 + pan.y;

  // Outer overlay dimensions for the 4-panel dark mask
  const screenW = Dimensions.get('window').width;
  const sideW = (screenW - CROP_SIZE) / 2;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Move & Crop</Text>
          <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.useText}>Use Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Crop row: dark-left | crop box | dark-right */}
        <View style={styles.cropRow}>
          <View style={[styles.darkPanel, { width: sideW, height: CROP_SIZE }]} />

          {/* The crop box – overflow hidden clips the image to the square */}
          <View
            style={[styles.cropBox, { width: CROP_SIZE, height: CROP_SIZE }]}
            {...panResponder.panHandlers}
          >
            <Image
              source={{ uri }}
              style={{
                position: 'absolute',
                width: dispW,
                height: dispH,
                left: imgLeft,
                top: imgTop,
              }}
              resizeMode="cover"
            />
            {/* Corner marks */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            {/* Border */}
            <View style={styles.cropBorder} pointerEvents="none" />
          </View>

          <View style={[styles.darkPanel, { width: sideW, height: CROP_SIZE }]} />
        </View>

        {/* Dark panel below */}
        <View style={[styles.darkPanel, { width: screenW, flex: 1 }]} />

        {/* Hint */}
        <Text style={styles.hint}>Drag to reposition</Text>

        <View style={{ height: Platform.OS === 'ios' ? 40 : 24 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: spacing.md,
    backgroundColor: '#000',
  },
  cancelText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    color: colors.text_secondary,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.text_primary,
  },
  useText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    color: colors.accent_green_bright,
  },
  cropRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkPanel: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  cropBox: {
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  cropBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.accent_green_bright,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.accent_green_bright,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.accent_green_bright,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.accent_green_bright,
  },
  hint: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: spacing.lg,
    backgroundColor: '#000',
    paddingBottom: spacing.sm,
  },
});
