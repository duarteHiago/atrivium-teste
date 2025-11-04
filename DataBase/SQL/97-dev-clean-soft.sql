-- Soft clean para ambiente de desenvolvimento
-- Mantém usuários; limpa dados de coleções e NFTs
BEGIN;
  -- Desassocia NFTs de coleções primeiro
  UPDATE nfts SET collection_id = NULL;

  -- Limpa histórico de transferências e NFTs
  DELETE FROM nft_transfers;
  DELETE FROM nfts;

  -- Limpa coleções
  DELETE FROM collections;

  -- Reseta campos visuais de perfil (opcional)
  UPDATE users SET nickname = NULL, bio = NULL, avatar_url = NULL, banner_url = NULL;
COMMIT;
