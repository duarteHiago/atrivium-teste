-- Adds support for featured collections carousel
ALTER TABLE collections ADD COLUMN IF NOT EXISTS featured_order SMALLINT;
-- Optional: speed up queries
CREATE INDEX IF NOT EXISTS idx_collections_featured_order ON collections (is_featured, featured_order);
