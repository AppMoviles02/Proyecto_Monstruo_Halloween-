import { StyleSheet } from 'react-native';

export const colors = {
  bg:          '#0d0118',
  bgDeep:      '#080010',
  card:        '#1e0d38',
  card2:       '#271245',
  accent:      '#ff6b35',
  accentDark:  '#cc4a1a',
  gold:        '#ffd700',
  gold2:       '#ffec6e',
  green:       '#39ff14',
  red:         '#ff073a',
  blue:        '#00d4ff',
  purple:      '#9d4edd',
  text:        '#f0e6ff',
  textMuted:   '#9a80c0',
  border:      '#3d1f6b',
};

export const glow = {
  gold:   { textShadowColor: '#ffd700', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14 },
  orange: { textShadowColor: '#ff6b35', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  purple: { textShadowColor: '#9d4edd', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    ...glow.gold,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: '#1e1035',
    color: colors.text,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  boton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  botonTexto: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  botonSecundario: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  texto: {
    color: colors.text,
    fontSize: 15,
  },
  textoMuted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  textoGold: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 15,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTexto: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
  },
  hpBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a0a2e',
    marginTop: 6,
    overflow: 'hidden',
  },
  hpFill: {
    height: 8,
    borderRadius: 4,
  },
});
