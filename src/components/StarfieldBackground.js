import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, Easing } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const STAR_COUNT = 45;

const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 1.6,
  y: (Math.random() - 0.5) * 1.6,
  color: i % 6 === 0 ? '#ffd700' : i % 4 === 0 ? '#ff6b35' : '#e8e0ff',
}));

const Star = ({ id, x, y, color, time }) => {
  const z = id / STAR_COUNT;

  const translateX = time.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      W * (0.5 + x * (0.35 / (1.01 - z))),
      W * (0.5 + x * (0.35 / (1.01 - ((z + 1) % 1 || 0.001)))),
    ],
    extrapolate: 'clamp',
  });

  const depth = time.interpolate({
    inputRange:  [0, 1],
    outputRange: [z, z],
  });

  // Simpler approach: each star has its own animated value
  return (
    <Animated.View style={{
      position: 'absolute',
      width: 4, height: 4,
      borderRadius: 2,
      backgroundColor: color,
      left: W * (0.1 + (id / STAR_COUNT) * 0.8),
      top: H * (0.05 + ((id * 7) % 90) / 100),
      opacity: time.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.2 + (id % 5) * 0.15, 0.7 + (id % 3) * 0.1, 0.2 + (id % 5) * 0.15],
      }),
      transform: [{ scale: time.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.6 + (id % 4) * 0.1, 1.2 + (id % 3) * 0.2, 0.6 + (id % 4) * 0.1],
      })}],
    }} />
  );
};

const StarfieldBackground = () => {
  const time = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(time, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0d0118',
      overflow: 'hidden',
    }} pointerEvents="none">
      {stars.map(s => <Star key={s.id} time={time} {...s} />)}
    </View>
  );
};

export default StarfieldBackground;
