/**
 * AlianzasScreen.js
 * Pantalla para formar alianzas entre jugadores.
 *
 * Una alianza agrupa hasta 3 jugadores bajo un nombre común. Los miembros
 * de la misma alianza pueden transferirse puntos entre sí (NegociadorScreen).
 * La estrategia central del juego es coordinar ataques dentro de la alianza
 * para que un aliado dé el golpe final y acumule todos los puntos del monstruo.
 */
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { styles, colors } from '../styles/styles';

const AlianzasScreen = ({ navigation }) => {
  const { jugadores, jugador, formarAlianza, alianzas, fase } = useGame();
  const [seleccionados, setSeleccionados] = useState([]);

  React.useEffect(() => {
    if (fase === 'juego' && Object.keys(alianzas).length > 0) {
      navigation.replace('Tablero');
    }
  }, [fase, alianzas]);

  const toggleSeleccion = (id) => {
    if (id === jugador?.id) return;
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(s => s !== id));
    } else if (seleccionados.length < 2) {
      setSeleccionados([...seleccionados, id]);
    }
  };

  const handleFormar = () => {
    if (seleccionados.length !== 2) {
      Alert.alert('Error', 'Selecciona exactamente 2 compañeros para formar tu alianza de 3');
      return;
    }
    const miembros = [jugador.id, ...seleccionados];
    const alias    = `Alianza_${jugador.nombre}`;
    formarAlianza(alias, miembros);
  };

  const irAlTablero = () => navigation.replace('Tablero');

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.titulo}>🤝 Formar Alianza</Text>
      <Text style={styles.subtitulo}>Selecciona 2 compañeros</Text>

      <View style={styles.card}>
        <Text style={[styles.textoGold, { marginBottom: 10 }]}>
          Seleccionados: {seleccionados.length}/2
        </Text>
        <FlatList
          data={jugadores}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const esSelf      = item.id === jugador?.id;
            const seleccionado = seleccionados.includes(item.id);
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  seleccionado && { borderColor: colors.gold, borderWidth: 2 },
                  esSelf       && { opacity: 0.5 },
                ]}
                onPress={() => toggleSeleccion(item.id)}
                disabled={esSelf}
              >
                <View style={styles.fila}>
                  <Text style={styles.texto}>
                    {esSelf ? '⭐ ' : seleccionado ? '✅ ' : '👤 '}{item.nombre}
                  </Text>
                  <Text style={styles.textoGold}>{item.puntos} pts</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {Object.keys(alianzas).length > 0 && (
        <View style={styles.card}>
          <Text style={[styles.textoGold, { marginBottom: 8 }]}>Alianzas formadas:</Text>
          {Object.entries(alianzas).map(([alias, miembros]) => (
            <Text key={alias} style={styles.texto}>
              🤝 {alias}: {miembros.length} miembros
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.boton} onPress={handleFormar}>
        <Text style={styles.botonTexto}>🤝 Formar Alianza</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonSecundario} onPress={irAlTablero}>
        <Text style={styles.botonTexto}>⚔️ Ir al Tablero</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AlianzasScreen;
