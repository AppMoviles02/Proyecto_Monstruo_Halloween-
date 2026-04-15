/**
 * TablerScreen.js
 * Pantalla principal del juego — tablero de batalla.
 *
 * Muestra los monstruos vivos con sus barras de HP, el inventario de armas
 * del jugador actual, la cuenta regresiva del turno (20 s), el marcador de
 * jugadores y el log de eventos de la partida.
 *
 * El sistema de turnos es circular: el servidor avanza automáticamente al
 * expirar el temporizador. El cliente solo actualiza la UI en base al
 * estado recibido por WebSocket (fuente única de verdad = servidor).
 *
 * Flujo de ataque:
 *   1. Jugador selecciona monstruo → selecciona arma → pulsa "Atacar"
 *   2. Se envía { tipo: 'atacar', monstruo_id, arma } al servidor
 *   3. Servidor aplica daño (±20% aleatorio) y hace broadcast del nuevo estado
 *   4. La animación de golpe se dispara en MonsterCard al detectar cambio de HP
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { useGame } from '../context/GameContext';
import { styles, colors } from '../styles/styles';
import HPBar from '../components/HPBar';
import GameButton from '../components/GameButton';
import MonsterCard from '../components/MonsterCard';

// Armas que reconoce el servidor (deben coincidir exactamente)
const ARMAS_INFO = {
  daga:     { emoji: '🗡️',  nombre: 'Daga',     dano: '3 dmg' },
  granada:  { emoji: '💣',  nombre: 'Granada',  dano: '8 dmg' },
  dinamita: { emoji: '🧨',  nombre: 'Dinamita', dano: '15 dmg' },
};

const TURNO_SEGUNDOS = 20;

const TablerScreen = ({ navigation }) => {
  const { jugadores, jugador, monstruos, turnoActual, fase, mensajes, ganador, atacar } = useGame();
  const [monstruoSel, setMonstruoSel] = useState(null);
  const [armaSel, setArmaSel]         = useState(null);
  const [cuenta, setCuenta]           = useState(TURNO_SEGUNDOS);
  const [lastHitId, setLastHitId]     = useState(null);
  const cuentaRef                     = useRef(null);
  const barAnim                       = useRef(new Animated.Value(1)).current;
  const prevMonstruosRef              = useRef([]);

  // Detecta qué monstruo recibió daño comparando HP anterior vs actual
  useEffect(() => {
    const prevMap = {};
    prevMonstruosRef.current.forEach(m => { prevMap[m.id] = m.hp_actual; });
    monstruos.forEach(m => {
      if (prevMap[m.id] !== undefined && m.hp_actual < prevMap[m.id]) {
        setLastHitId(m.id);
        setTimeout(() => setLastHitId(null), 1500);
      }
    });
    prevMonstruosRef.current = monstruos;
  }, [monstruos]);

  useEffect(() => {
    if (fase === 'fin') navigation.replace('FinJuego');
  }, [fase]);

  // Reinicia la cuenta regresiva cada vez que cambia el turno
  useEffect(() => {
    if (fase !== 'juego') return;
    setCuenta(TURNO_SEGUNDOS);

    // Anima la barra de tiempo de lleno a vacío
    barAnim.setValue(1);
    Animated.timing(barAnim, {
      toValue: 0,
      duration: TURNO_SEGUNDOS * 1000,
      useNativeDriver: false,
    }).start();

    // Contador numérico
    if (cuentaRef.current) clearInterval(cuentaRef.current);
    cuentaRef.current = setInterval(() => {
      setCuenta(prev => {
        if (prev <= 1) { clearInterval(cuentaRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cuentaRef.current);
  }, [turnoActual, fase]);

  const esMiTurno = turnoActual === jugador?.id;

  const handleAtacar = () => {
    if (!monstruoSel) { Alert.alert('Error', 'Selecciona un monstruo'); return; }
    if (!armaSel)     { Alert.alert('Error', 'Selecciona un arma');     return; }
    if (!esMiTurno)   { Alert.alert('Espera', 'No es tu turno');        return; }
    atacar(monstruoSel, armaSel);
    setMonstruoSel(null);
    setArmaSel(null);
  };

  // El servidor usa hp_actual (no hp) para los monstruos
  const monstruosVivos = monstruos.filter(m => m.hp_actual > 0);

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.titulo}>🎃 Tablero de Juego</Text>

      {/* Turno */}
      <View style={[styles.card, { borderColor: esMiTurno ? colors.gold : colors.border }]}>
        <Text style={[styles.textoGold, { textAlign: 'center' }]}>
          {esMiTurno ? '⭐ ¡ES TU TURNO!' : `⏳ Turno de: ${jugadores.find(j => j.id === turnoActual)?.nombre ?? '...'}`}
        </Text>

        {/* Barra de tiempo */}
        <View style={{ height: 6, backgroundColor: '#333', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
          <Animated.View style={{
            height: '100%',
            borderRadius: 3,
            width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            backgroundColor: cuenta > 10 ? colors.green : cuenta > 5 ? '#f0a500' : colors.accent,
          }} />
        </View>
        <Text style={[styles.textoMuted, { textAlign: 'center', marginTop: 4, fontSize: 12 }]}>
          {cuenta}s
        </Text>
      </View>

      {/* Monstruos */}
      <Text style={[styles.textoGold, { marginBottom: 8 }]}>👹 Monstruos ({monstruosVivos.length} vivos)</Text>
      {monstruosVivos.map(m => (
        <MonsterCard
          key={m.id}
          m={m}
          sel={monstruoSel === m.id}
          esMiTurno={esMiTurno}
          onPress={() => setMonstruoSel(monstruoSel === m.id ? null : m.id)}
          wasHit={lastHitId === m.id}
        />
      ))}

      {monstruosVivos.length === 0 && (
        <View style={styles.card}>
          <Text style={[styles.texto, { textAlign: 'center' }]}>💀 Todos los monstruos eliminados</Text>
        </View>
      )}

      {/* Armas — solo las que el jugador tiene según el servidor */}
      {esMiTurno && (
        <>
          <Text style={[styles.textoGold, { marginVertical: 8 }]}>🗡️ Elige tu arma</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {(jugador?.armas ?? []).map(armaId => {
              const info = ARMAS_INFO[armaId] ?? { emoji: '⚔️', nombre: armaId, dano: '?' };
              return (
                <TouchableOpacity
                  key={armaId}
                  style={[
                    styles.card,
                    { flex: 1, minWidth: '45%', alignItems: 'center' },
                    armaSel === armaId && { borderColor: colors.gold, borderWidth: 2 },
                  ]}
                  onPress={() => setArmaSel(armaSel === armaId ? null : armaId)}
                >
                  <Text style={{ fontSize: 28 }}>{info.emoji}</Text>
                  <Text style={styles.texto}>{info.nombre}</Text>
                  <Text style={styles.textoMuted}>{info.dano}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.boton, (!monstruoSel || !armaSel) && { opacity: 0.5 }]}
            onPress={handleAtacar}
          >
            <Text style={styles.botonTexto}>⚔️ ¡Atacar!</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Jugadores */}
      <Text style={[styles.textoGold, { marginVertical: 8 }]}>👥 Jugadores</Text>
      {jugadores.map(j => (
        <View key={j.id} style={[styles.fila, styles.card, { marginBottom: 6 }]}>
          <Text style={styles.texto}>
            {j.id === jugador?.id ? '⭐ ' : '👤 '}{j.nombre}
          </Text>
          <Text style={styles.textoGold}>{j.puntos} pts</Text>
        </View>
      ))}

      {/* Negociar */}
      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => navigation.navigate('Negociador')}
      >
        <Text style={styles.botonTexto}>💰 Negociar Puntos</Text>
      </TouchableOpacity>

      {/* Log */}
      <Text style={[styles.textoGold, { marginVertical: 8 }]}>📜 Registro</Text>
      <View style={styles.card}>
        {mensajes.slice(-8).reverse().map((m, i) => (
          <Text key={i} style={[styles.textoMuted, { marginBottom: 4 }]}>{m}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

export default TablerScreen;
