-- ============================================================
-- BiblePlay — Migration SQL complète
-- Copier-coller TOUT ce SQL dans l'éditeur SQL de Supabase
-- Project URL : https://kthxsmcjcbzisgqjgivq.supabase.co
-- ============================================================

-- 1. TABLE DES SALLES
CREATE TABLE IF NOT EXISTS rooms (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT UNIQUE NOT NULL,
  host_id     TEXT NOT NULL,
  game        TEXT DEFAULT 'quiz',
  game_queue  JSONB DEFAULT '[]',
  status      TEXT DEFAULT 'waiting',
  max_players INT DEFAULT 8,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE DES JOUEURS
CREATE TABLE IF NOT EXISTS players (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code   TEXT REFERENCES rooms(code) ON DELETE CASCADE,
  pseudo      TEXT NOT NULL,
  avatar      TEXT DEFAULT '🙏',
  is_host     BOOLEAN DEFAULT FALSE,
  is_ready    BOOLEAN DEFAULT FALSE,
  session_id  TEXT NOT NULL,
  joined_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- 4. RLS — accès public
ALTER TABLE rooms   ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_rooms"   ON rooms   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_players" ON players FOR ALL USING (true) WITH CHECK (true);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_players_room_code ON players(room_code);
CREATE INDEX IF NOT EXISTS idx_players_session    ON players(session_id);
CREATE INDEX IF NOT EXISTS idx_rooms_code         ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_rooms_status       ON rooms(status);

-- 6. Nettoyage automatique des salles > 24h
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;
