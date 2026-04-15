/**
 * LobbyScreen.js
 * Sala de espera antes de iniciar la partida.
 *
 * Muestra los jugadores conectados en tiempo real. Cualquier jugador puede
 * pulsar "Iniciar Juego" cuando hay 2 o más participantes. También permite
 * navegar a la pantalla de Alianzas para formar equipos antes de empezar.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Animated, Easing } from 'react-native';
import { useGame } from '../context/GameContext';
import { styles, colors } from '../styles/styles';
import StarfieldBackground from '../components/StarfieldBackground';
import GameButton from '../components/GameButton';

// Fila de jugador con slide-in al aparecer
const PlayerRow = ({ item, jugador, index }) => {
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const esSelf    = item.id === jugador?.id;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay: index * 60,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();

    if (esSelf) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateX: slideAnim }, { scale: pulseAnim }],
    }}>
      <View style={[styles.card, { marginBottom: 8 }, esSelf && {
        borderColor: colors.gold,
        borderWidth: 2,
      }]}>
        <View style={styles.fila}>
          <Text style={[styles.texto, esSelf && { color: colors.gold, fontWeight: '700' }]}>
            {esSelf ? '⭐ ' : '👤 '}{item.nombre}
            {esSelf && <Text style={[styles.textoMuted, { fontSize: 11 }]}> (tú)</Text>}
          </Text>
          <View style={[styles.badge, esSelf && { backgroundColor: colors.gold }]}>
            <Text style={[styles.badgeTexto, esSelf && { color: '#000' }]}>
              {item.puntos} pts
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Puntos "..." animados
const WaitingDots = () => {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <Text style={[styles.textoMuted, { textAlign: 'center', fontSize: 14, marginBottom: 16 }]}>
      Esperando jugadores{dots}
    </Text>
  );
};

const LobbyScreen = ({ navigation }) => {
  const { jugadores, jugador, fase, iniciarJuego } = useGame();
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const puedeIniciar = jugadores.length >= 2;

  const handleIniciar = () => {
    if (!puedeIniciar) return;
    iniciarJuego();
    navigation.replace('Alianzas');
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (fase === 'juego') navigation.replace('Tablero');
  }, [fase]);

  return (
    <View style={{ flex: 1 }}>
      <StarfieldBackground />
      <ScrollView
        style={[styles.screen, { backgroundColor: 'transparent' }]}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          <Text style={[styles.titulo, { marginTop: 8 }]}>🏰 Sala de Espera</Text>
          <WaitingDots />

          {/* Contador */}
          <View style={[styles.card, {
            borderColor: puedeIniciar ? colors.green : colors.border,
            marginBottom: 16,
          }]}>
            <View style={styles.fila}>
              <Text style={styles.textoGold}>👥 Jugadores conectados</Text>
              <View style={[styles.badge, { backgroundColor: puedeIniciar ? colors.green : colors.accent }]}>
                <Text style={[styles.badgeTexto, puedeIniciar && { color: '#000' }]}>
                  {jugadores.length} / 10
                </Text>
              </View>
            </View>
          </View>

          {/* Lista de jugadores con animación */}
          {jugadores.map((item, index) => (
            <PlayerRow key={item.id} item={item} jugador={jugador} index={index} />
          ))}

          {/* Reglas */}
          <View style={[styles.card, { marginTop: 4 }]}>
            <Text style={[styles.textoGold, { marginBottom: 8 }]}>📋 Reglas del juego</Text>
            <Text style={styles.textoMuted}>🧟 5 a 10 jugadores por partida</Text>
            <Text style={styles.textoMuted}>🤝 Se forman alianzas de 3</Text>
            <Text style={styles.textoMuted}>⚔️  Elimina monstruos para ganar puntos</Text>
            <Text style={styles.textoMuted}>🏆 Gana el jugador con más puntos</Text>
            <Text style={styles.textoMuted}>🗡️  Desbloquea armas al ganar combates</Text>
          </View>

          {/* Botón iniciar */}
          <View style={{ marginTop: 8 }}>
            {puedeIniciar
              ? <GameButton title="🎮  Iniciar Juego" onPress={handleIniciar} />
              : <View style={[styles.card, { alignItems: 'center' }]}>
                  <Text style={styles.textoMuted}>Necesitas al menos 2 jugadores para iniciar</Text>
                </View>
            }
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default LobbyScreen;
