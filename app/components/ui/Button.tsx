// components/ui/Button.tsx
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getHeight = () => {
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 56;
      default: return 48;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return TYPOGRAPHY.sizes.sm;
      case 'lg': return TYPOGRAPHY.sizes.lg;
      default: return TYPOGRAPHY.sizes.md;
    }
  };

  const getBackground = () => {
    if (disabled) return COLORS.gray[300];
    switch (variant) {
      case 'primary':
        return (
          <LinearGradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { height: getHeight() }]}
          />
        );
      case 'danger':
        return null;
      default:
        return null;
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: getHeight(),
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.lg,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: COLORS.blue[500],
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: COLORS.risk.red,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.gray[500];
    switch (variant) {
      case 'outline':
      case 'ghost':
        return COLORS.blue[500];
      case 'danger':
        return COLORS.white;
      default:
        return COLORS.white;
    }
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getButtonStyle(), style]}
        activeOpacity={0.8}
      >
        {getBackground()}
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text
            style={[
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                fontFamily: TYPOGRAPHY.fonts.semibold,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontFamily: TYPOGRAPHY.fonts.semibold,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 12,
  },
});