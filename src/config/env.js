/** pH safe range */
export const PH_MIN = 7.2;
export const PH_MAX = 7.8;

/** Chlorine safe range (ppm) */
export const CL_MIN = 0.5;
export const CL_MAX = 3.0;

/** Pool definitions (mutable at runtime by the service) */
export const pools = [
  { name: 'Piscina Principal', size: '25m', pH: 7.45, cl: 1.20, temp: 28.3, lastTime: '14:32', readings: 48 },
  { name: 'Piscina Infantil',  size: '10m', pH: 8.10, cl: 0.30, temp: 29.1, lastTime: '14:30', readings: 46 },
  { name: 'Piscina Olímpica',  size: '50m', pH: 7.62, cl: 1.80, temp: 27.5, lastTime: '14:35', readings: 48 },
];

/** Static alert log */
export const allAlerts = [
  {
    pool: 'Piscina Infantil',
    type: 'danger',
    title: 'pH Alcalino — 8.10',
    msg: 'pH acima do limite máximo de 7.8. Risco de irritação ocular e redução da eficácia do cloro.',
    time: 'Hoje 14:30',
  },
  {
    pool: 'Piscina Infantil',
    type: 'danger',
    title: 'Cloro Baixo — 0.30 ppm',
    msg: 'Cloro abaixo do mínimo de 0.5 ppm. Risco bacteriológico para os usuários.',
    time: 'Hoje 14:30',
  },
  {
    pool: 'Piscina Principal',
    type: 'ok',
    title: 'Parâmetros normalizados',
    msg: 'pH e cloro dentro dos limites após ajuste às 12:00.',
    time: 'Hoje 12:05',
  },
  {
    pool: 'Piscina Olímpica',
    type: 'warn',
    title: 'pH levemente alto — 7.83',
    msg: 'pH próximo ao limite superior. Monitorar nas próximas horas.',
    time: 'Ontem 18:40',
  },
];
