/**
 * MonsterCard.js
 * Tarjeta visual de un monstruo en el tablero de juego.
 *
 * Muestra la animación Lottie del monstruo (o sprite PNG como fallback),
 * su barra de HP, y reproduce un efecto de golpe al recibir daño.
 *
 * Props:
 *   m         {Object}  - Objeto monstruo { id, nombre, emoji, hp_actual, hp_max }
 *   sel       {boolean} - Si está seleccionado como objetivo de ataque
 *   esMiTurno {boolean} - Si el jugador actual puede atacar
 *   onPress   {Function}- Callback al presionar la tarjeta
 *   wasHit    {boolean} - true cuando acaba de recibir daño (dispara animación de golpe)
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import HPBar from './HPBar';
import { styles, colors } from '../styles/styles';

// URL de animación Lottie por monstruo (null = usar sprite/emoji)
const MONSTER_LOTTIE = {
  m1: null, // Drácula — sprite PNG local
  m2: 'https://lottie.host/ae7ffdc8-9d78-4895-9b9c-a10ec10a43f9/RIJL4OPfdP.lottie', // Frankenstein
  m3: 'https://lottie.host/c436a037-7e08-4e6c-b308-fee6661cbf49/IpuDEgNhNp.lottie', // Momia/Zombie
  m4: 'https://lottie.host/d2c0571e-9aab-421f-bcb1-b54244a49261/rGX7Qk8O88.lottie', // Fantasma
  m5: 'https://lottie.host/4962da59-f285-47be-a309-df2e3495f335/yFeg9AffqX.lottie', // Bruja
};

// Sprite PNG local para monstruos sin animación Lottie gratuita
const MONSTER_SPRITE = {
  m1: require('../assets/sprites/vampire.png'), // Drácula
};

const HIT_URL = 'https://lottie.host/91a13d80-7a9c-4d21-aec3-bcb4cf3b7d78/3vumrmVKXI.lottie';

const MonsterCard = ({ m, sel, esMiTurno, onPress, wasHit }) => {
  const hitRef              = useRef(null);
  const [hitKey, setHitKey] = useState(0); // fuerza re-mount para repetir animación

  useEffect(() => {
    if (wasHit) {
      setHitKey(k => k + 1); // re-monta el LottieView de golpe
    }
  }, [wasHit]);

  const lottieUrl   = MONSTER_LOTTIE[m.id];
  const spriteAsset = MONSTER_SPRITE[m.id];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { marginBottom: 10 },
        sel && { borderColor: colors.accent, borderWidth: 2 },
      ]}
      onPress={onPress}
      disabled={!esMiTurno}
      activeOpacity={0.8}
    >
      <View style={inner.fila}>

        {/* Personaje: animación Lottie > sprite PNG > emoji fallback */}
        <View style={inner.personaje}>
          {lottieUrl ? (
            <LottieView
              source={{ uri: lottieUrl }}
              autoPlay
              loop
              style={inner.lottie}
              resizeMode="contain"
            />
          ) : spriteAsset ? (
            <Image
              source={spriteAsset}
              style={inner.lottie}
              resizeMode="contain"
            />
          ) : (
            <Text style={inner.emoji}>{m.emoji ?? '👾'}</Text>
          )}

          {/* Efecto de golpe — se reproduce una vez al recibir daño */}
          {wasHit && (
            <LottieView
              key={hitKey}
              source={{ uri: HIT_URL }}
              autoPlay
              loop={false}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Info del monstruo */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.fila}>
            <Text style={[styles.texto, { fontWeight: '700' }]}>{m.nombre}</Text>
            <Text style={styles.textoGold}>{m.hp_actual}/{m.hp_max} HP</Text>
          </View>
          <HPBar hp={m.hp_actual} maxHp={m.hp_max} />
          {sel && (
            <Text style={[styles.textoMuted, { marginTop: 4, color: colors.accent }]}>
              ✓ Seleccionado
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const inner = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  personaje: {
    width:           80,
    height:          80,
    justifyContent:  'center',
    alignItems:      'center',
    position:        'relative',
  },
  lottie: {
    width:  80,
    height: 80,
  },
  emoji: {
    fontSize: 52,
  },
});

export default MonsterCard;
