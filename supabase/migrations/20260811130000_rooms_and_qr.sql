-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  room_name text,
  floor text,
  wing text,
  room_type text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_rooms_select" ON rooms;
CREATE POLICY "auth_rooms_select" ON rooms FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_rooms_insert" ON rooms;
CREATE POLICY "auth_rooms_insert" ON rooms FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_rooms_update" ON rooms;
CREATE POLICY "auth_rooms_update" ON rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_rooms_delete" ON rooms;
CREATE POLICY "auth_rooms_delete" ON rooms FOR DELETE TO authenticated USING (true);


-- QR Templates table
CREATE TABLE IF NOT EXISTS qr_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'table' CHECK (type IN ('table', 'room')),
  layout_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE qr_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_qr_templates_select" ON qr_templates;
CREATE POLICY "auth_qr_templates_select" ON qr_templates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_qr_templates_insert" ON qr_templates;
CREATE POLICY "auth_qr_templates_insert" ON qr_templates FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_qr_templates_update" ON qr_templates;
CREATE POLICY "auth_qr_templates_update" ON qr_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_qr_templates_delete" ON qr_templates;
CREATE POLICY "auth_qr_templates_delete" ON qr_templates FOR DELETE TO authenticated USING (true);


-- WiFi Settings table
CREATE TABLE IF NOT EXISTS wifi_settings (
  restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
  ssid text NOT NULL,
  password text,
  security_type text NOT NULL DEFAULT 'WPA2/WPA3 Personal',
  show_name boolean NOT NULL DEFAULT true,
  show_password boolean NOT NULL DEFAULT false,
  show_qr boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wifi_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_wifi_settings_select" ON wifi_settings;
CREATE POLICY "auth_wifi_settings_select" ON wifi_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_wifi_settings_insert" ON wifi_settings;
CREATE POLICY "auth_wifi_settings_insert" ON wifi_settings FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_wifi_settings_update" ON wifi_settings;
CREATE POLICY "auth_wifi_settings_update" ON wifi_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_wifi_settings_delete" ON wifi_settings;
CREATE POLICY "auth_wifi_settings_delete" ON wifi_settings FOR DELETE TO authenticated USING (true);
