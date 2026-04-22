/**
 * Route map: page name → metadata
 *
 * module: which page module owns this route
 *   'home'     = src/pages/home
 *   'selecoes' = src/pages/selecoes  (graficos, historico, alertas, config)
 */
export const routes = {
  dashboard: { module: 'home',     label: 'Dashboard'      },
  graficos:  { module: 'selecoes', label: 'Gráficos'       },
  historico: { module: 'selecoes', label: 'Histórico'      },
  alertas:   { module: 'selecoes', label: 'Alertas'        },
  config:    { module: 'selecoes', label: 'Configurações'  },
};

/** Returns which page module owns a given route */
export function getModule(page) {
  return routes[page]?.module ?? null;
}
