import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const WS_URL = 'wss://halloween-game-server-production.up.railway.app';

const GameContext = createContext(null);

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

  // Actualiza el estado del jugador propio a partir de una lista de jugadores
  const syncJugador = (lista) => {
    if (!jugadorIdRef.current) return;
    const yo = lista.find(j => j.id === jugadorIdRef.current);
    if (yo) setJugador(yo);
  };

  const agregarMensaje = (msg) => {
    setMensajes(prev => [...prev.slice(-50), msg]);
  };

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

      case 'ataque':
        agregarMensaje(`⚔️ Ataque a ${data.monstruo}: -${data.dano} HP (${data.hp_restante} restante)`);
        break;

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

  const enviar = (mensaje) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(mensaje));
    }
  };

  const iniciarJuego = () => enviar({ tipo: 'iniciar_juego' });

  const atacar = (monstruoId, arma) => enviar({ tipo: 'atacar', monstruo_id: monstruoId, arma });

  const formarAlianza = (alias, miembros) => enviar({ tipo: 'alianza', alias, miembros });

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
