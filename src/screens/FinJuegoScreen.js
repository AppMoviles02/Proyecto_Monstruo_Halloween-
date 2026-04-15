/**
 * FinJuegoScreen.js
 * Pantalla de resultados al terminar la partida.
 *
 * Muestra al ganador con corona, la clasificación final ordenada por puntos
 * y una animación de confeti Lottie de fondo. Permite volver al Login para
 * iniciar una nueva partida.
 *
 * Se navega aquí automáticamente cuando el servidor emite { tipo: 'fin_juego' }
 * (todos los monstruos eliminados, o queda un solo jugador vivo).
 */
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { useGame } from '../context/GameContext';
import { styles, colors } from '../styles/styles';

const CONFETTI_URL = 'https://lottie.host/9900ba00-91d2-4f98-9e5e-2775f1b54555/7alQebfesD.lottie';

const FinJuegoScreen = ({ navigation }) => {
  const { jugadores, ganador } = useGame();

  const clasificacion = [...jugadores].sort((a, b) => b.puntos - a.puntos);
  const medallas = ['🥇', '🥈', '🥉'];

  return (
    <View style={{ flex: 1 }}>
      {/* Confetti de fondo */}
      <LottieView
        source={{ uri: CONFETTI_URL }}
        autoPlay
        loop
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        pointerEvents="none"
      />

    <ScrollView style={styles.screen} contentContainerStyle={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 60, marginTop: 20 }}>🏆</Text>
      <Text style={styles.titulo}>¡Juego Terminado!</Text>

      {ganador && (
        <View style={[styles.card, { borderColor: colors.gold, borderWidth: 2, width: '100%', alignItems: 'center', marginBottom: 16 }]}>
          <Text style={{ fontSize: 40 }}>👑</Text>
          <Text style={[styles.textoGold, { fontSize: 22 }]}>Ganador</Text>
          <Text style={[styles.titulo, { fontSize: 24 }]}>{ganador}</Text>
        </View>
      )}

      <Text style={[styles.textoGold, { alignSelf: 'flex-start', marginBottom: 8 }]}>📊 Clasificación Final</Text>
      <View style={[styles.card, { width: '100%' }]}>
        {clasificacion.map((j, i) => (
          <View key={j.id} style={[styles.fila, { paddingVertical: 10, borderBottomWidth: i < clasificacion.length - 1 ? 1 : 0, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 22 }}>{medallas[i] ?? `${i + 1}.`}</Text>
              <Text style={styles.texto}>{j.nombre}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{j.puntos} pts</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.textoMuted, { textAlign: 'center', marginTop: 8, marginBottom: 20 }]}>
        🎃 Monstruos de Halloween — El Plan del Diablo T2 E05
      </Text>

      <TouchableOpacity
        style={[styles.boton, { width: '100%' }]}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.botonTexto}>🔄 Jugar de Nuevo</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

export default FinJuegoScreen;
