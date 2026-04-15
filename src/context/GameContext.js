/**
 * GameContext.js
 * Contexto global del juego Halloween Monsters.
 *
 * Gestiona la conexión WebSocket con el servidor Railway y distribuye
 * el estado del juego (jugadores, monstruos, turno, fase) a todos los
 * componentes de la app mediante React Context.
 *
 * Uso:
 *   import { useGame } from '../context/GameContext';
 *   const { jugadores, atacar } = useGame();
 */
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

/** URL del servidor WebSocket en Railway (reemplaza servidor Rust local) */
const WS_URL = 'wss://halloween-game-server-production.up.railway.app';

const GameContext = createContext(null);

/**
 * Proveedor del contexto del juego.
 * Debe envolver toda la navegación de la app (ver App.js).
 */
export const GameProvider = ({ children }) => {
  const ws           = useRef(null);
  const jugadorIdRef = useRef(null); // ID estable del jugador actual (ip:port asignado por servidor)
  const [conectado, setConectado]     = useState(false);
  const [jugador, setJugador]         = useState(null);
  const [jugadores, setJugadores]     = useState([]);
  const [monstruos, setMonstruos]     = useState([]);
  const [alianzas, setAlianzas]       = useState({});
  const [turnoActual, setTurnoActual] = useState('');
  const [fase, setFase]               = useState('espera');
  const [mensajes, setMensajes]       = useState([]);
  const [ganador, setGanador]         = useState(null);

  /**
   * Sincroniza el estado del jugador propio buscando su ID en la lista recibida del servidor.
   * @param {Array} lista - Lista de jugadores enviada por el servidor
   */
  const syncJugador = (lista) => {
    if (!jugadorIdRef.current) return;
    const yo = lista.find(j => j.id === jugadorIdRef.current);
    if (yo) setJugador(yo);
  };

  /** Agrega un mensaje al log de eventos. Mantiene los últimos 50. */
  const agregarMensaje = (msg) => {
    setMensajes(prev => [...prev.slice(-50), msg]);
  };

  /**
   * Abre la conexión WebSocket y envía el mensaje 'unirse' con el nombre del jugador.
   * @param {string} nombre - Nombre visible del jugador
   * @param {Function} [onConectado] - Callback opcional al establecer conexión
   */
  const conectar = (nombre, onConectado) => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setConectado(true);
      ws.current.send(JSON.stringify({ tipo: 'unirse', nombre }));
      onConectado?.();
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        procesarMensaje(data, nombre);
      } catch (err) {
        console.log('Error parsing:', e.data);
      }
    };

    ws.current.onerror = (e) => {
      console.log('WS Error:', e.message);
      agregarMensaje('❌ Error de conexión');
    };

    ws.current.onclose = () => {
      setConectado(false);
      agregarMensaje('🔌 Desconectado del servidor');
    };
  };

  const procesarMensaje = (data, nombrePropio) => {
    switch (data.tipo) {
      case 'jugador_unido':
        setJugadores(data.jugadores);
        if (data.jugador.nombre === nombrePropio) {
          setJugador(data.jugador);
          jugadorIdRef.current = data.jugador.id; // guarda el ID asignado por el servidor
        }
        agregarMensaje(`👤 ${data.jugador.nombre} se unió`);
        break;

      case 'alianza_formada':
        setAlianzas(data.alianzas);
        agregarMensaje(`🤝 Alianza formada`);
        break;

      case 'juego_iniciado':
        setMonstruos(data.monstruos);
        setJugadores(data.jugadores);
        setTurnoActual(data.turno_actual);
        setFase('juego');
        syncJugador(data.jugadores);
        agregarMensaje('🎮 ¡El juego comenzó!');
        break;

      case 'ataque': {
        const criticoLabel = data.critico ? ' 💥 ¡CRÍTICO!' : '';
        agregarMensaje(`⚔️ ${data.atacante} → ${data.monstruo}: -${data.dano} HP${criticoLabel} (${data.hp_restante} restante)`);
        break;
      }

      case 'monstruo_eliminado':
        agregarMensaje(`💀 ${data.monstruo} eliminado! +${data.puntos_ganados} pts`);
        break;

      case 'estado_juego':
        setMonstruos(data.monstruos);
        setJugadores(data.jugadores);
        setTurnoActual(data.turno_actual);
        setFase(data.fase);
        syncJugador(data.jugadores); // mantiene armas, puntos y HP del jugador propio actualizados
        break;

      case 'jugador_desconectado':
        agregarMensaje(`📵 ${data.nombre} se desconectó — esperando ${data.gracia}s...`);
        break;

      case 'jugador_reconectado':
        agregarMensaje(`🔁 ${data.nombre} reconectó`);
        break;

      case 'intercambio':
        setJugadores(data.jugadores);
        syncJugador(data.jugadores);
        agregarMensaje(data.exitoso ? '💰 Intercambio exitoso' : '❌ Intercambio fallido');
        break;

      case 'fin_juego':
        setGanador(data.ganador);
        setJugadores(data.jugadores);
        setFase('fin');
        agregarMensaje(`🏆 ¡Ganador: ${data.ganador}!`);
        break;

      case 'error':
        agregarMensaje(`❌ ${data.mensaje}`);
        break;
    }
  };

  /**
   * Envía un mensaje JSON al servidor WebSocket si la conexión está abierta.
   * @param {Object} mensaje - Objeto con campo 'tipo' y parámetros del mensaje
   */
  const enviar = (mensaje) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(mensaje));
    }
  };

  /** Envía solicitud para iniciar la partida (requiere mínimo 2 jugadores en el lobby). */
  const iniciarJuego = () => enviar({ tipo: 'iniciar_juego' });

  /**
   * Envía un ataque al servidor. Solo funciona si es el turno del jugador.
   * @param {string} monstruoId - ID del monstruo objetivo (ej. 'm1')
   * @param {string} arma - Arma a usar: 'daga' | 'granada' | 'dinamita'
   */
  const atacar = (monstruoId, arma) => enviar({ tipo: 'atacar', monstruo_id: monstruoId, arma });

  /**
   * Forma una alianza entre jugadores.
   * @param {string} alias - Nombre de la alianza
   * @param {string[]} miembros - Array de IDs de jugadores aliados
   */
  const formarAlianza = (alias, miembros) => enviar({ tipo: 'alianza', alias, miembros });

  /**
   * Transfiere puntos a otro jugador de la misma alianza.
   * @param {string} paraId - ID del jugador receptor
   * @param {number} cantidad - Cantidad de puntos a transferir
   */
  const intercambiar = (paraId, cantidad) => enviar({ tipo: 'intercambiar', para: paraId, cantidad });

  return (
    <GameContext.Provider value={{
      conectado, jugador, jugadores, monstruos,
      alianzas, turnoActual, fase, mensajes, ganador,
      conectar, iniciarJuego, atacar, formarAlianza, intercambiar,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
