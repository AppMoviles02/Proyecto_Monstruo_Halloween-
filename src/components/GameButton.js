import React, { useRef } from 'react';
import { Pressable, Text, Animated } from 'react-native';
import { styles, colors } from '../styles/styles';

const GameButton = ({ title, onPress, disabled = false, secondary = false, style }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const baseStyle = secondary ? styles.botonSecundario : styles.boton;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View style={[
        baseStyle,
        { transform: [{ scale }] },
        disabled && { opacity: 0.5 },
        style,
      ]}>
        <Text style={styles.botonTexto}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default GameButton;
