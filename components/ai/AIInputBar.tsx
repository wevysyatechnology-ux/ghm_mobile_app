import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';
import { Mic, Keyboard as KeyboardIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius } from '@/constants/theme';
import PressableScale from '@/components/shared/PressableScale';

interface AIInputBarProps {
  onMicPress: () => void;
  onTextSubmit?: (text: string) => void;
}

export default function AIInputBar({ onMicPress, onTextSubmit }: AIInputBarProps) {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleMicPress = () => {
    setShowKeyboard(false);
    onMicPress();
  };

  const handleKeyboardPress = () => {
    setShowKeyboard(true);
  };

  const handleSubmit = () => {
    if (inputText.trim()) {
      onTextSubmit?.(inputText);
      setInputText('');
      setShowKeyboard(false);
    }
  };

  return (
    <View style={styles.container}>
      {showKeyboard ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="What do you want to do today?"
            placeholderTextColor={colors.text_secondary}
            autoFocus
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
          />
          <PressableScale onPress={handleMicPress} scaleValue={0.9}>
            <LinearGradient
              colors={[colors.accent_green_glow, colors.accent_green_bright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.micButton}>
              <Mic size={20} color={colors.bg_primary} />
            </LinearGradient>
          </PressableScale>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <PressableScale onPress={handleMicPress} style={{ flex: 1 }} scaleValue={0.98}>
            <LinearGradient
              colors={[colors.accent_green_glow, colors.accent_green_bright]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}>
              <Mic size={22} color={colors.bg_primary} />
              <Text style={styles.primaryButtonText}>
                Hey, what do you want to do today?
              </Text>
            </LinearGradient>
          </PressableScale>

          <PressableScale onPress={handleKeyboardPress} scaleValue={0.9}>
            <View style={styles.iconButton}>
              <KeyboardIcon size={22} color={colors.accent_green_bright} />
            </View>
          </PressableScale>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button + 4,
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.bg_primary,
    flex: 1,
    letterSpacing: 0.2,
  },
  iconButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.button + 4,
    backgroundColor: colors.bg_card,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg_card,
    borderRadius: borderRadius.button + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  textInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text_primary,
    paddingVertical: spacing.sm,
    fontWeight: '500',
  },
  micButton: {
    padding: spacing.md,
    borderRadius: borderRadius.button,
    shadowColor: colors.accent_green_bright,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});
