-- Script SQL para inserir um NFT de teste do IPFS
-- Execute este script no banco de dados para testar a interface

INSERT INTO nfts (
    token_id, 
    name, 
    description, 
    prompt, 
    style,
    image_hash, 
    certificate_hash, 
    image_url, 
    ipfs_hash,
    metadata, 
    creator_id, 
    current_owner_id,
    network, 
    status, 
    is_verified, 
    created_at
) VALUES (
    'test-ipfs-nft-' || EXTRACT(EPOCH FROM NOW()),
    'NFT Teste IPFS ' || EXTRACT(EPOCH FROM NOW()),
    'Este é um NFT de teste sincronizado do IPFS/Pinata para verificar se a interface está funcionando corretamente.',
    'Imagem de teste do IPFS',
    'ipfs-sync',
    encode(sha256(('test-hash-' || EXTRACT(EPOCH FROM NOW()))::bytea), 'hex'),
    encode(sha256(('test-cert-' || EXTRACT(EPOCH FROM NOW()))::bytea), 'hex'),
    'https://gateway.pinata.cloud/ipfs/QmTestHashExample123456789',
    'QmTestHashExample123456789',
    '{"name":"NFT Teste IPFS","description":"NFT de teste do IPFS","image":"https://gateway.pinata.cloud/ipfs/QmTestHashExample123456789","attributes":[{"trait_type":"Source","value":"IPFS/Pinata"},{"trait_type":"Test","value":"true"}]}',
    NULL,
    NULL,
    'ipfs',
    'created',
    TRUE,
    NOW()
);

-- Verificar se foi inserido
SELECT 
    nft_id, 
    token_id, 
    name, 
    network, 
    style, 
    created_at 
FROM nfts 
WHERE network = 'ipfs' AND style = 'ipfs-sync'
ORDER BY created_at DESC 
LIMIT 5;