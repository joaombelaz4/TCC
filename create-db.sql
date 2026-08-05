CREATE DATABASE IF NOT EXISTS tcc
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE tcc;

-- Pool atual e último estado conhecido.
CREATE TABLE pools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  size VARCHAR(30) DEFAULT NULL,
  current_ph DECIMAL(4,2) NOT NULL,
  current_cl DECIMAL(4,2) NOT NULL,
  temp DECIMAL(4,1) NOT NULL,
  last_reading_at DATETIME DEFAULT NULL,
  readings INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Histórico de leituras que alimenta a página de histórico e os gráficos.
CREATE TABLE pool_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pool_id INT NOT NULL,
  recorded_at DATETIME NOT NULL,
  ph DECIMAL(4,2) NOT NULL,
  cl DECIMAL(4,2) NOT NULL,
  temp DECIMAL(4,1) NOT NULL,
  status ENUM('ok','warn','danger') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pool_id) REFERENCES pools(id)
);

-- Alertas históricos do sistema.
CREATE TABLE pool_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pool_id INT NOT NULL,
  type ENUM('ok','warn','danger') NOT NULL,
  title VARCHAR(255) NOT NULL,
  msg TEXT NOT NULL,
  occurred_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pool_id) REFERENCES pools(id)
);

-- Parâmetros de configuração do aplicativo.
CREATE TABLE app_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exemplo de carga inicial com os valores atuais do site.
INSERT INTO pools (name, size, current_ph, current_cl, temp, last_reading_at, readings) VALUES
  ('Piscina Principal', '25m', 7.45, 1.20, 28.3, '2026-08-05 14:32:00', 48),
  ('Piscina Infantil',  '10m', 8.10, 0.30, 29.1, '2026-08-05 14:30:00', 46),
  ('Piscina Olímpica',  '50m', 7.62, 1.80, 27.5, '2026-08-05 14:35:00', 48);

INSERT INTO pool_alerts (pool_id, type, title, msg, occurred_at) VALUES
  (2, 'danger', 'pH Alcalino — 8.10', 'pH acima do limite máximo de 7.8. Risco de irritação ocular e redução da eficácia do cloro.', '2026-08-05 14:30:00'),
  (2, 'danger', 'Cloro Baixo — 0.30 ppm', 'Cloro abaixo do mínimo de 0.5 ppm. Risco bacteriológico para os usuários.', '2026-08-05 14:30:00'),
  (1, 'ok', 'Parâmetros normalizados', 'pH e cloro dentro dos limites após ajuste às 12:00.', '2026-08-05 12:05:00'),
  (3, 'warn', 'pH levemente alto — 7.83', 'pH próximo ao limite superior. Monitorar nas próximas horas.', '2026-08-04 18:40:00');

INSERT INTO app_settings (setting_key, setting_value, description) VALUES
  ('ph_min', '7.2', 'Limite mínimo de pH para condição normal'),
  ('ph_max', '7.8', 'Limite máximo de pH para condição normal'),
  ('cl_min', '0.5', 'Limite mínimo de cloro para condição normal'),
  ('cl_max', '3.0', 'Limite máximo de cloro para condição normal'),
  ('sensor_frequency', '30m', 'Frequência de leitura do sensor em minutos');
