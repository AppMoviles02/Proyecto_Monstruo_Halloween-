/**
 * NegociadorScreen.js
 * Pantalla de intercambio de puntos entre aliados.
 *
 * Solo los jugadores de la misma alianza pueden transferirse puntos.
 * El servidor valida la alianza y que el remitente tenga suficientes puntos
 * antes de aprobar la transacción. Útil para redistribuir puntos al final
 * de la partida o compensar a aliados que aportaron daño sin dar el kill.
 */
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { styles, colors } from '../styles/styles';

const NegociadorScreen = ({ navigation }) => {
  const { jugadores, jugador, intercambiar } = useGame();
  const [destinatario, setDestinatario]     = useState(null);
  const [cantidad, setCantidad]             = useState('');

  const handleIntercambiar = () => {
    if (!destinatario) { Alert.alert('Error', 'Selecciona un jugador'); return; }
    const pts = parseInt(cantidad, 10);
    if (isNaN(pts) || pts <= 0) { Alert.alert('Error', 'Ingresa una cantidad válida'); return; }
    if (pts > (jugador?.puntos ?? 0)) {
      Alert.alert('Error', 'No tienes suficientes puntos');
      return;
    }
    Alert.alert(
      'Confirmar',
      `¿Enviar ${pts} pts a ${jugadores.find(j => j.id === destinatario)?.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar', onPress: () => {
            intercambiar(destinatario, pts);
            setCantidad('');
            setDestinatario(null);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const otros = jugadores.filter(j => j.id !== jugador?.id);

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.titulo}>💰 Negociador</Text>
      <Text style={styles.subtitulo}>Transfiere puntos a un aliado</Text>

      <View style={styles.card}>
        <Text style={styles.textoGold}>Tus puntos: {jugador?.puntos ?? 0} pts</Text>
      </View>

      <Text style={[styles.textoGold, { marginBottom: 8 }]}>Selecciona destinatario:</Text>
      {otros.map(j => (
        <TouchableOpacity
          key={j.id}
          style={[
            styles.card,
            destinatario === j.id && { borderColor: colors.gold, borderWidth: 2 },
          ]}
          onPress={() => setDestinatario(destinatario === j.id ? null : j.id)}
        >
          <View style={styles.fila}>
            <Text style={styles.texto}>👤 {j.nombre}</Text>
            <Text style={styles.textoGold}>{j.puntos} pts</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.textoGold, { marginTop: 12, marginBottom: 6 }]}>Cantidad a enviar:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 10"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
      />

      <TouchableOpacity
        style={[styles.boton, (!destinatario || !cantidad) && { opacity: 0.5 }]}
        onPress={handleIntercambiar}
      >
        <Text style={styles.botonTexto}>💸 Enviar Puntos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.goBack()}>
        <Text style={styles.botonTexto}>← Volver al Tablero</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NegociadorScreen;
