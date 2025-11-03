-- Hard clean para ambiente de desenvolvimento
-- Mantém a tabela de usuários, mas apaga coleções/NFTs e reinicia IDs
BEGIN;
  TRUNCATE TABLE nft_transfers RESTART IDENTITY CASCADE;
  TRUNCATE TABLE nfts RESTART IDENTITY CASCADE;
  TRUNCATE TABLE collections RESTART IDENTITY CASCADE;
  UPDATE users SET nickname = NULL, bio = NULL, avatar_url = NULL, banner_url = NULL;
COMMIT;
