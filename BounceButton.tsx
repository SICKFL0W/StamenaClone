import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleProp, ViewStyle } from 'react-native';

interface BounceButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  // TADY JE ZMĚNA: StyleProp<ViewStyle> dovolí i pole, null a false
  style?: StyleProp<ViewStyle>;
  scaleTo?: number; 
}

export const BounceButton: React.FC<BounceButtonProps> = ({ 
  onPress, 
  children, 
  style,
  scaleTo = 0.95 
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableWithoutFeedback 
      onPressIn={onPressIn} 
      onPressOut={onPressOut} 
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};