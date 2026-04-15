/**
 * LoginScreen.js
 * Pantalla de entrada al juego.
 *
 * El jugador ingresa su nombre y se conecta al servidor WebSocket en Railway.
 * Al conectarse exitosamente, el servidor asigna un ID único y redirige al Lobby.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, ScrollView, Alert,
  ActivityIndicator, Pressable, Animated, Easing,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { styles, colors, glow } from '../styles/styles';
import StarfieldBackground from '../components/StarfieldBackground';
import GameButton from '../components/GameButton';

const LoginScreen = ({ navigation }) => {
  const [nombre, setNombre]     = useState('');
  const [cargando, setCargando] = useState(false);
  const [focused, setFocused]   = useState(false);
  const { conectar } = useGame();

  // Animaciones
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(50)).current;
  const pumpkinAnim = useRef(new Animated.Value(1)).current;
  const glowAnim    = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Entrada de pantalla
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
    ]).start();

    // Calabaza latiendo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pumpkinAnim, { toValue: 1.14, duration: 500, useNativeDriver: true }),
        Animated.timing(pumpkinAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        Animated.timing(pumpkinAnim, { toValue: 1.07, duration: 300, useNativeDriver: true }),
        Animated.timing(pumpkinAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Glow pulsante del título
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1400, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1400, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleUnirse = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre de jugador');
      return;
    }
    setCargando(true);
    let conectado = false;
    const timeout = setTimeout(() => {
      if (!conectado) {
        setCargando(false);
        Alert.alert('Error de conexión', 'No se pudo conectar al servidor. Verifica que la VM esté encendida.');
      }
    }, 8000);
    conectar(nombre.trim(), () => {
      conectado = true;
      clearTimeout(timeout);
      setCargando(false);
      navigation.replace('Lobby');
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <StarfieldBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.screen, { justifyContent: 'center', flexGrow: 1, backgroundColor: 'transparent' }]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Calabaza pulsando */}
            <Animated.Text style={{ fontSize: 80, textAlign: 'center', marginBottom: 8, transform: [{ scale: pumpkinAnim }] }}>
              🎃
            </Animated.Text>

            {/* Título con glow animado */}
            <Animated.Text style={[styles.titulo, {
              textShadowRadius: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 22] }),
            }]}>
              Monstruos de Halloween
            </Animated.Text>

            <Text style={[styles.subtitulo, { marginBottom: 32 }]}>
              El Plan del Diablo · T2 E05
            </Text>

            {/* Card con borde morado al enfocar */}
            <View style={[styles.card, {
              borderColor: focused ? colors.purple : colors.border,
              borderWidth: focused ? 2 : 1,
            }]}>
              <Text style={[styles.textoMuted, { marginBottom: 8 }]}>Tu nombre de jugador:</Text>
              <TextInput
                style={[styles.input, { borderColor: focused ? colors.purple : colors.border }]}
                placeholder="Ej: Drácula, Bruja, Frankenstein..."
                placeholderTextColor="#44336a"
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleUnirse}
              />
              {cargando
                ? <View style={[styles.boton, { opacity: 0.6 }]}><ActivityIndicator color={colors.text} /></View>
                : <GameButton title="⚔️  Unirse al Juego" onPress={handleUnirse} />
              }
            </View>

            <Text style={[styles.textoMuted, { textAlign: 'center', marginTop: 12, fontSize: 11 }]}>
              🔌 ws://192.168.40.33:5000
            </Text>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
