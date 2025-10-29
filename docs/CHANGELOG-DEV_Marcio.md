# Changelog — Branch DEV_Marcio

Date: 2025-10-28

Summary of changes applied in this branch (work done during pairing session):

## Database
- Updated `DataBase/SQL/03-collections.sql` to merge two collection scripts into a single safe migration:
  - Creates `collections` table if not exists with fields: `collection_id`, `creator_id`, `name`, `description`, `slug`, `logo_image_url`, `cover_image_url`, `floor_price`, `total_volume`, `is_featured`, `is_public`, `created_at`, `updated_at`.
  - Adds `collection_id` column to `nfts` table if missing and creates indexes (`idx_nfts_collection`, `idx_collections_creator`, `idx_collections_featured`, `idx_collections_slug`).
  - Adds triggers to update `updated_at` and comments for documentation.

## Docker / Compose
- Restored `Docker/docker-compose.yaml` to its original configuration pointing at the `BackEnd/Dockerfile` and `FrontEnd/Dockerfile` contexts. This reverts a temporary reorganization attempted during the session.
- Removed assistant-created temporary Dockerfiles and replaced them with small placeholder comments to avoid breaking builds. (You may remove the placeholder files later if undesired.)

## Tasks performed
- Ran `docker-compose -f Docker/docker-compose.yaml up -d` to diagnose and fix a PostgreSQL healthcheck error caused by a corrupted local DB volume. Cleared `DataBase/postgres-data/*` and restarted containers successfully.
- Executed the updated `03-collections.sql` against the running Postgres container to apply new columns and indexes.

## Notes & Next Steps
- The placeholders under `Docker/backend/` and `Docker/frontend/` are harmless but can be deleted for cleanliness.
- Consider adding a proper migration tool (e.g., `node-pg-migrate`) so incremental schema changes are tracked reproducibly instead of relying solely on `docker-entrypoint-initdb.d` scripts.
- If you intend to centralize Dockerfiles in `Docker/`, update `docker-compose.yaml` accordingly and ensure paths are correct (we reverted this for stability).

If anything here looks off or you prefer a different commit message / file placement, tell me and I will adjust before pushing.

— Automated summary created during the DEV_Marcio session
