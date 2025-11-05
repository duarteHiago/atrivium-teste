/**
 * Minimal API Worker com testes de D1 e R2 + CORS e OPTIONS
 */

/** @typedef {{ ART_D1: D1Database, ART_R2: R2Bucket, JWT_SECRET: string, PUBLIC_BASE_URL: string }} Env */

const JSON_HEADERS = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
const CORS_HEADERS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS' };

async function json(data, init = {}) {
	return new Response(JSON.stringify(data), { headers: { ...JSON_HEADERS }, ...init });
}

// Função auxiliar para validar JWT
function validateToken(request, env) {
	const authHeader = request.headers.get('authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null;
	}
	const token = authHeader.substring(7);
	try {
		// JWT simples (header.payload.signature)
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = JSON.parse(atob(parts[1]));
		// Verifica expiração
		if (payload.exp && payload.exp < Date.now()) return null;
		return payload;
	} catch (e) {
		return null;
	}
}

// Hash de senha usando SHA-256
async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Gerar JWT
function generateToken(payload, env) {
	const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const payloadStr = btoa(JSON.stringify(payload));
	const signature = btoa(`${env.JWT_SECRET || 'secret'}-${header}.${payloadStr}`);
	return `${header}.${payloadStr}.${signature}`;
}

export default {
	/** @param {Request} request @param {Env} env */
	async fetch(request, env) {
		const url = new URL(request.url);
		const { pathname } = url;

		// Preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		// Rota para servir arquivos do R2: /assets/<key>
		if (pathname.startsWith('/assets/')) {
			try {
				const key = pathname.replace(/^\/assets\//, '');
				if (!key) return new Response('Key required', { status: 400, headers: CORS_HEADERS });
				const obj = await env.ART_R2.get(key);
				if (!obj) return new Response('Not found', { status: 404, headers: CORS_HEADERS });
				const headers = new Headers({ ...CORS_HEADERS });
				if (obj.httpMetadata?.contentType) headers.set('content-type', obj.httpMetadata.contentType);
				if (obj.httpMetadata?.contentLanguage) headers.set('content-language', obj.httpMetadata.contentLanguage);
				if (obj.httpMetadata?.contentDisposition) headers.set('content-disposition', obj.httpMetadata.contentDisposition);
				if (obj.httpMetadata?.contentEncoding) headers.set('content-encoding', obj.httpMetadata.contentEncoding);
				if (obj.httpMetadata?.cacheControl) headers.set('cache-control', obj.httpMetadata.cacheControl);
				headers.set('etag', obj.httpEtag);
				return new Response(obj.body, { headers });
			} catch (e) {
				return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
			}
		}

		if (pathname === '/api/health') {
			try {
				// D1: criar tabela de controle se não existir
				await env.ART_D1.exec(`CREATE TABLE IF NOT EXISTS _health (k TEXT PRIMARY KEY, v TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
				const rs = await env.ART_D1.prepare('SELECT COUNT(*) AS c FROM _health').first();

				// Seed opcional: garante admin padrão se variáveis ADMIN_* estiverem definidas
				try {
					const adminEmail = env.ADMIN_EMAIL;
					const adminPassword = env.ADMIN_PASSWORD;
					if (adminEmail && adminPassword) {
						const existing = await env.ART_D1.prepare('SELECT user_id, role FROM users WHERE email = ?').bind(adminEmail).first();
						if (!existing) {
							const passwordHash = await hashPassword(adminPassword);
							const userId = crypto.randomUUID();
							await env.ART_D1.prepare(`
								INSERT INTO users (user_id, first_name, last_name, email, password_hash, role)
								VALUES (?, ?, ?, ?, ?, 'admin')
							`).bind(userId, env.ADMIN_FIRST_NAME || 'Admin', env.ADMIN_LAST_NAME || 'User', adminEmail, passwordHash).run();
						} else if (existing.role !== 'admin') {
							await env.ART_D1.prepare('UPDATE users SET role = ? WHERE email = ?').bind('admin', adminEmail).run();
						}
					}
				} catch (seedErr) {
					// Evita quebrar health por seed
					console.warn('Seed admin (Worker) falhou:', seedErr?.message || seedErr);
				}

				// R2: verificar acesso ao bucket (lista até 1 item)
				let r2ok = false;
				try {
					const list = await env.ART_R2.list({ limit: 1 });
					r2ok = Array.isArray(list.objects);
				} catch (e) {
					r2ok = false;
				}

				return json({ ok: true, d1: true, r2: r2ok, rows: rs?.c ?? 0, baseUrl: env.PUBLIC_BASE_URL || null });
			} catch (e) {
				return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
			}
		}

		// Upload simples para R2 (POST binary)
		if (pathname === '/api/upload' && request.method === 'POST') {
			try {
				// Tenta usar nome de arquivo do header; se ausente, infere pela content-type
				const fileName = request.headers.get('x-filename') || '';
				let ext = (fileName.split('.').pop() || '').toLowerCase();
				if (!ext) {
					const ct = (request.headers.get('content-type') || '').toLowerCase();
					ext = ct.includes('image/jpeg') ? 'jpg'
						: ct.includes('image/png') ? 'png'
						: ct.includes('image/webp') ? 'webp'
						: 'bin';
				}
				const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
				const body = await request.arrayBuffer();
				await env.ART_R2.put(key, body, { httpMetadata: { contentType: request.headers.get('content-type') || 'application/octet-stream' } });
				// URL pública via o próprio Worker (recomendado)
				const origin = env.PUBLIC_BASE_URL?.replace(/\/$/, '') || '';
				const workerUrl = origin ? `${origin}/assets/${key}` : `/assets/${key}`;
				return json({ ok: true, key, url: workerUrl });
			} catch (e) {
				return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
			}
		}

		// Registro de usuário
		if (pathname === '/api/auth/register' && request.method === 'POST') {
			try {
				const body = await request.json();
				const { firstName, lastName, cpf, birthDate, email, password, cep, address, gender } = body;

				// Validações básicas
				if (!firstName || !lastName || !email || !password) {
					return json({ ok: false, message: 'Campos obrigatórios faltando' }, { status: 400 });
				}

				// Verifica se email já existe
				const existing = await env.ART_D1.prepare('SELECT user_id FROM users WHERE email = ?').bind(email).first();
				if (existing) {
					return json({ ok: false, message: 'Email já cadastrado' }, { status: 409 });
				}

				// Hash da senha
				const passwordHash = await hashPassword(password);
				const userId = crypto.randomUUID();

				// Insere no D1
				await env.ART_D1.prepare(`
					INSERT INTO users (user_id, first_name, last_name, cpf, birth_date, email, password_hash, cep, address, gender, role)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')
				`).bind(userId, firstName, lastName, cpf || null, birthDate || null, email, passwordHash, cep || null, address || null, gender || null).run();

				return json({ ok: true, message: 'Usuário criado com sucesso', userId });
			} catch (e) {
				console.error('Erro no registro:', e);
				return json({ ok: false, message: 'Erro ao criar usuário', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// Login de usuário
		if (pathname === '/api/auth/login' && request.method === 'POST') {
			try {
				const body = await request.json();
				const { email, password } = body;

				if (!email || !password) {
					return json({ ok: false, message: 'Email e senha são obrigatórios' }, { status: 400 });
				}

				// Hash da senha fornecida
				const passwordHash = await hashPassword(password);

				// Busca usuário
				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url
					FROM users
					WHERE email = ? AND password_hash = ?
				`).bind(email, passwordHash).first();

				if (!user) {
					return json({ ok: false, message: 'Credenciais inválidas' }, { status: 401 });
				}

				// Gera JWT
				const token = generateToken({
					userId: user.user_id,
					email: user.email,
					role: user.role,
					exp: Date.now() + 7 * 24 * 60 * 60 * 1000
				}, env);

				return json({
					ok: true,
					token,
					user: {
						user_id: user.user_id,
						first_name: user.first_name,
						last_name: user.last_name,
						email: user.email,
						role: user.role,
						nickname: user.nickname,
						bio: user.bio,
						avatar_url: user.avatar_url,
						banner_url: user.banner_url
					}
				});
			} catch (e) {
				console.error('Erro no login:', e);
				return json({ ok: false, message: 'Erro ao fazer login', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/auth/me - Retorna dados do usuário autenticado
		if (pathname === '/api/auth/me' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url, cpf, birth_date, cep, address, gender, created_at
					FROM users WHERE user_id = ?
				`).bind(payload.userId).first();

				if (!user) {
					return json({ ok: false, message: 'Usuário não encontrado' }, { status: 404 });
				}

				return json({ ok: true, user });
			} catch (e) {
				console.error('Erro ao buscar usuário:', e);
				return json({ ok: false, message: 'Erro ao buscar usuário', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/me - Retorna dados do usuário autenticado (alias)
		if (pathname === '/api/users/me' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url, cpf, birth_date, cep, address, gender, created_at
					FROM users WHERE user_id = ?
				`).bind(payload.userId).first();

				if (!user) {
					return json({ ok: false, message: 'Usuário não encontrado' }, { status: 404 });
				}

				return json({ ok: true, user });
			} catch (e) {
				console.error('Erro ao buscar usuário:', e);
				return json({ ok: false, message: 'Erro ao buscar usuário', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// PATCH /api/users/me - Atualiza dados do usuário autenticado
		if (pathname === '/api/users/me' && request.method === 'PATCH') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const contentType = request.headers.get('content-type') || '';
				let updates = {};

				if (contentType.includes('application/json')) {
					updates = await request.json();
				} else if (contentType.includes('multipart/form-data')) {
					// Para multipart, esperamos que os campos já sejam URLs (upload feito previamente)
					const formData = await request.formData();
					for (const [key, value] of formData.entries()) {
						if (typeof value === 'string') {
							updates[key] = value;
						}
					}
				}

				// Campos permitidos para atualização
				const allowedFields = ['first_name', 'last_name', 'nickname', 'bio', 'avatar_url', 'banner_url', 'cpf', 'birth_date', 'cep', 'address', 'gender'];
				const setClauses = [];
				const values = [];

				for (const field of allowedFields) {
					if (updates[field] !== undefined) {
						setClauses.push(`${field} = ?`);
						values.push(updates[field]);
					}
				}

				if (setClauses.length === 0) {
					return json({ ok: false, message: 'Nenhum campo para atualizar' }, { status: 400 });
				}

				values.push(payload.userId);
				const sql = `UPDATE users SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`;

				await env.ART_D1.prepare(sql).bind(...values).run();

				// Retorna usuário atualizado
				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url, cpf, birth_date, cep, address, gender, created_at, updated_at
					FROM users WHERE user_id = ?
				`).bind(payload.userId).first();

				return json({ ok: true, user });
			} catch (e) {
				console.error('Erro ao atualizar usuário:', e);
				return json({ ok: false, message: 'Erro ao atualizar usuário', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/me/profile - Retorna perfil completo do usuário
		if (pathname === '/api/users/me/profile' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url, created_at
					FROM users WHERE user_id = ?
				`).bind(payload.userId).first();

				if (!user) {
					return json({ ok: false, message: 'Usuário não encontrado' }, { status: 404 });
				}

				// Conta NFTs do usuário
				const nftCount = await env.ART_D1.prepare(`
					SELECT COUNT(*) as total FROM nfts WHERE owner_id = ? OR creator_id = ?
				`).bind(payload.userId, payload.userId).first();

				return json({
					ok: true,
					profile: {
						...user,
						nftCount: nftCount?.total || 0
					}
				});
			} catch (e) {
				console.error('Erro ao buscar perfil:', e);
				return json({ ok: false, message: 'Erro ao buscar perfil', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/:id/public-profile - Retorna perfil público de um usuário
		if (pathname.match(/^\/api\/users\/[^/]+\/public-profile$/) && request.method === 'GET') {
			try {
				const userId = pathname.split('/')[3];

				const user = await env.ART_D1.prepare(`
					SELECT user_id, first_name, last_name, nickname, bio, avatar_url, banner_url, created_at
					FROM users WHERE user_id = ?
				`).bind(userId).first();

				if (!user) {
					return json({ ok: false, message: 'Usuário não encontrado' }, { status: 404 });
				}

				// Conta NFTs do usuário
				const nftCount = await env.ART_D1.prepare(`
					SELECT COUNT(*) as total FROM nfts WHERE owner_id = ? OR creator_id = ?
				`).bind(userId, userId).first();

				return json({
					ok: true,
					profile: {
						...user,
						nftCount: nftCount?.total || 0
					}
				});
			} catch (e) {
				console.error('Erro ao buscar perfil público:', e);
				return json({ ok: false, message: 'Erro ao buscar perfil público', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/leonardo/list - Lista todos os NFTs
		if (pathname === '/api/leonardo/list' && request.method === 'GET') {
			try {
				const nfts = await env.ART_D1.prepare(`
					SELECT
						n.nft_id, n.title, n.description, n.image_url, n.price, n.status, n.created_at,
						n.creator_id, n.owner_id, n.collection_id,
						u_creator.first_name as creator_first_name, u_creator.last_name as creator_last_name,
						u_creator.avatar_url as creator_avatar,
						u_owner.first_name as owner_first_name, u_owner.last_name as owner_last_name,
						c.name as collection_name
					FROM nfts n
					LEFT JOIN users u_creator ON n.creator_id = u_creator.user_id
					LEFT JOIN users u_owner ON n.owner_id = u_owner.user_id
					LEFT JOIN collections c ON n.collection_id = c.collection_id
					WHERE n.status IN ('active', 'sale')
					ORDER BY n.created_at DESC
				`).all();

				return json({ ok: true, nfts: nfts.results || [] });
			} catch (e) {
				console.error('Erro ao listar NFTs:', e);
				return json({ ok: false, message: 'Erro ao listar NFTs', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/leonardo/:id - Busca um NFT específico
		if (pathname.match(/^\/api\/leonardo\/[^/]+$/) && request.method === 'GET') {
			try {
				const nftId = pathname.split('/')[3];

				const nft = await env.ART_D1.prepare(`
					SELECT
						n.*,
						u_creator.first_name as creator_first_name, u_creator.last_name as creator_last_name,
						u_creator.avatar_url as creator_avatar, u_creator.nickname as creator_nickname,
						u_owner.first_name as owner_first_name, u_owner.last_name as owner_last_name,
						u_owner.avatar_url as owner_avatar, u_owner.nickname as owner_nickname,
						c.name as collection_name, c.slug as collection_slug
					FROM nfts n
					LEFT JOIN users u_creator ON n.creator_id = u_creator.user_id
					LEFT JOIN users u_owner ON n.owner_id = u_owner.user_id
					LEFT JOIN collections c ON n.collection_id = c.collection_id
					WHERE n.nft_id = ?
				`).bind(nftId).first();

				if (!nft) {
					return json({ ok: false, message: 'NFT não encontrado' }, { status: 404 });
				}

				return json({ ok: true, nft });
			} catch (e) {
				console.error('Erro ao buscar NFT:', e);
				return json({ ok: false, message: 'Erro ao buscar NFT', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/me/nfts - Lista NFTs do usuário autenticado
		if (pathname === '/api/users/me/nfts' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const nfts = await env.ART_D1.prepare(`
					SELECT
						n.nft_id, n.title, n.description, n.image_url, n.price, n.status, n.created_at,
						c.name as collection_name
					FROM nfts n
					LEFT JOIN collections c ON n.collection_id = c.collection_id
					WHERE n.owner_id = ? OR n.creator_id = ?
					ORDER BY n.created_at DESC
				`).bind(payload.userId, payload.userId).all();

				return json({ ok: true, nfts: nfts.results || [] });
			} catch (e) {
				console.error('Erro ao listar NFTs do usuário:', e);
				return json({ ok: false, message: 'Erro ao listar NFTs', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/me/gallery - Lista galeria do usuário autenticado
		if (pathname === '/api/users/me/gallery' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const nfts = await env.ART_D1.prepare(`
					SELECT
						n.nft_id, n.title, n.description, n.image_url, n.price, n.status, n.created_at,
						c.name as collection_name, c.collection_id
					FROM nfts n
					LEFT JOIN collections c ON n.collection_id = c.collection_id
					WHERE n.owner_id = ?
					ORDER BY n.created_at DESC
				`).bind(payload.userId).all();

				return json({ ok: true, nfts: nfts.results || [] });
			} catch (e) {
				console.error('Erro ao buscar galeria:', e);
				return json({ ok: false, message: 'Erro ao buscar galeria', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/collections/list - Lista coleções
		if (pathname === '/api/collections/list' && request.method === 'GET') {
			try {
				const url = new URL(request.url);
				const mine = url.searchParams.get('mine');

				let sql = `
					SELECT
						c.collection_id, c.name, c.description, c.banner_image, c.slug, c.created_at,
						c.creator_id, u.first_name as creator_first_name, u.last_name as creator_last_name,
						(SELECT COUNT(*) FROM nfts WHERE collection_id = c.collection_id) as nft_count
					FROM collections c
					LEFT JOIN users u ON c.creator_id = u.user_id
				`;

				if (mine === 'true') {
					const payload = validateToken(request, env);
					if (!payload) {
						return json({ ok: false, message: 'Token inválido' }, { status: 401 });
					}
					sql += ` WHERE c.creator_id = ?`;
					const collections = await env.ART_D1.prepare(sql + ` ORDER BY c.created_at DESC`).bind(payload.userId).all();
					return json({ ok: true, collections: collections.results || [] });
				} else {
					const collections = await env.ART_D1.prepare(sql + ` ORDER BY c.created_at DESC`).all();
					return json({ ok: true, collections: collections.results || [] });
				}
			} catch (e) {
				console.error('Erro ao listar coleções:', e);
				return json({ ok: false, message: 'Erro ao listar coleções', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// POST /api/collections - Cria uma nova coleção
		if (pathname === '/api/collections' && request.method === 'POST') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const body = await request.json();
				const { name, description, banner_image } = body;

				if (!name) {
					return json({ ok: false, message: 'Nome da coleção é obrigatório' }, { status: 400 });
				}

				// Gera slug
				const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
				const collectionId = crypto.randomUUID();

				await env.ART_D1.prepare(`
					INSERT INTO collections (collection_id, name, description, banner_image, slug, creator_id)
					VALUES (?, ?, ?, ?, ?, ?)
				`).bind(collectionId, name, description || null, banner_image || null, slug, payload.userId).run();

				const collection = await env.ART_D1.prepare(`
					SELECT * FROM collections WHERE collection_id = ?
				`).bind(collectionId).first();

				return json({ ok: true, collection });
			} catch (e) {
				console.error('Erro ao criar coleção:', e);
				return json({ ok: false, message: 'Erro ao criar coleção', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/nft/:id/favorites - Busca favoritos de um NFT
		if (pathname.match(/^\/api\/nft\/[^/]+\/favorites$/) && request.method === 'GET') {
			try {
				const nftId = pathname.split('/')[3];

				const favorites = await env.ART_D1.prepare(`
					SELECT COUNT(*) as total,
						   COUNT(CASE WHEN favorited_at >= datetime('now', '-7 days') THEN 1 END) as week_count
					FROM nft_favorites
					WHERE nft_id = ?
				`).bind(nftId).first();

				return json({ ok: true, total: favorites?.total || 0, weekCount: favorites?.week_count || 0 });
			} catch (e) {
				console.error('Erro ao buscar favoritos:', e);
				return json({ ok: false, message: 'Erro ao buscar favoritos', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// POST /api/nft/:id/favorite - Adiciona/remove favorito
		if (pathname.match(/^\/api\/nft\/[^/]+\/favorite$/) && request.method === 'POST') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const nftId = pathname.split('/')[3];

				// Verifica se já existe
				const existing = await env.ART_D1.prepare(`
					SELECT * FROM nft_favorites WHERE nft_id = ? AND user_id = ?
				`).bind(nftId, payload.userId).first();

				if (existing) {
					// Remove favorito
					await env.ART_D1.prepare(`
						DELETE FROM nft_favorites WHERE nft_id = ? AND user_id = ?
					`).bind(nftId, payload.userId).run();
					return json({ ok: true, favorited: false });
				} else {
					// Adiciona favorito
					await env.ART_D1.prepare(`
						INSERT INTO nft_favorites (nft_id, user_id) VALUES (?, ?)
					`).bind(nftId, payload.userId).run();
					return json({ ok: true, favorited: true });
				}
			} catch (e) {
				console.error('Erro ao favoritar:', e);
				return json({ ok: false, message: 'Erro ao favoritar', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/nft/:id/history - Busca histórico de transações de um NFT
		if (pathname.match(/^\/api\/nft\/[^/]+\/history$/) && request.method === 'GET') {
			try {
				const nftId = pathname.split('/')[3];

				const history = await env.ART_D1.prepare(`
					SELECT
						t.transaction_id, t.transaction_type, t.price, t.created_at,
						u_from.first_name as from_first_name, u_from.last_name as from_last_name,
						u_from.avatar_url as from_avatar,
						u_to.first_name as to_first_name, u_to.last_name as to_last_name,
						u_to.avatar_url as to_avatar
					FROM transactions t
					LEFT JOIN users u_from ON t.from_user_id = u_from.user_id
					LEFT JOIN users u_to ON t.to_user_id = u_to.user_id
					WHERE t.nft_id = ?
					ORDER BY t.created_at DESC
				`).bind(nftId).all();

				return json({ ok: true, history: history.results || [] });
			} catch (e) {
				console.error('Erro ao buscar histórico:', e);
				return json({ ok: false, message: 'Erro ao buscar histórico', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// GET /api/users/me/activity - Busca atividades do usuário
		if (pathname === '/api/users/me/activity' && request.method === 'GET') {
			try {
				const payload = validateToken(request, env);
				if (!payload) {
					return json({ ok: false, message: 'Token inválido' }, { status: 401 });
				}

				const url = new URL(request.url);
				const limit = parseInt(url.searchParams.get('limit') || '50');

				const activities = await env.ART_D1.prepare(`
					SELECT
						t.transaction_id, t.transaction_type, t.price, t.created_at,
						t.nft_id, n.title as nft_title, n.image_url as nft_image,
						u_from.first_name as from_first_name, u_from.last_name as from_last_name,
						u_to.first_name as to_first_name, u_to.last_name as to_last_name
					FROM transactions t
					LEFT JOIN nfts n ON t.nft_id = n.nft_id
					LEFT JOIN users u_from ON t.from_user_id = u_from.user_id
					LEFT JOIN users u_to ON t.to_user_id = u_to.user_id
					WHERE t.from_user_id = ? OR t.to_user_id = ?
					ORDER BY t.created_at DESC
					LIMIT ?
				`).bind(payload.userId, payload.userId, limit).all();

				return json({ ok: true, activities: activities.results || [] });
			} catch (e) {
				console.error('Erro ao buscar atividades:', e);
				return json({ ok: false, message: 'Erro ao buscar atividades', error: String(e?.message || e) }, { status: 500 });
			}
		}

		// Fallback
		return new Response('Worker online', { status: 200, headers: CORS_HEADERS });
	}
};
