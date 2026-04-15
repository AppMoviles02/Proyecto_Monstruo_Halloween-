/**
 * HPBar.js
 * Barra de vida animada para jugadores y monstruos.
 *
 * Cambia de color según el porcentaje de HP restante:
 *   - Verde neón  (>55%) — saludable
 *   - Dorado      (25–55%) — daño moderado
 *   - Rojo neón   (<25%) — crítico
 *
 * Props:
 *   hp    {number} - HP actual
 *   maxHp {number} - HP máximo
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/** Barra de vida con transición animada y color dinámico por porcentaje de HP. */
const HPBar = ({ hp, maxHp }) => {
  const pct     = Math.max(0, Math.min(1, hp / maxHp));
  const widthAnim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.max(0, Math.min(1, hp / maxHp)),
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [hp, maxHp]);

  const barColor = pct > 0.55 ? '#39ff14' : pct > 0.25 ? '#ffd700' : '#ff073a';

  return (
    <View style={s.track}>
      <Animated.View style={[s.fill, {
        width: widthAnim.interpolate({
          inputRange:  [0, 1],
          outputRange: ['0%', '100%'],
        }),
        backgroundColor: barColor,
      }]} />
    </View>
  );
};

const s = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a0a2e',
    marginTop: 6,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});

export default HPBar;
