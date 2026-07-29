INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true) 
ON CONFLICT (id) DO NOTHING;
