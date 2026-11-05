# Silver Hand — Home & Landscaping

Site estático (HTML, CSS e JS puros, sem build) publicado no **Cloudflare Pages**.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Página principal (todas as seções) |
| `privacy.html` | Política de privacidade (no Cloudflare responde em `/privacy`) |
| `404.html` | Página de erro, servida automaticamente para endereços inexistentes |
| `css/style.css` | Estilos do site |
| `css/legal.css` | Estilos das páginas de texto (privacy e 404) |
| `js/main.js` | Menu, animações, galeria e validação do formulário |
| `img/` | Imagens em WebP, separadas em `desktop/`, `tablet/` e `mobile/` |
| `img/icons/` | Favicon PNG e ícones do Android (`site.webmanifest`) |
| `img/og-image.jpg` | Imagem de compartilhamento (1200×630) |
| `fonts/` | DM Sans e DM Serif Display, servidas pelo próprio site |
| `favicon.ico`, `apple-touch-icon.png` | Ícones da aba e do iPhone (ficam na raiz de propósito) |
| `robots.txt`, `sitemap.xml` | SEO |
| `site.webmanifest` | Nome, cores e ícones quando o site é salvo na tela inicial |
| `_headers` | Cabeçalhos HTTP do Cloudflare Pages (segurança e cache) |

## Para testar localmente

```bash
python3 -m http.server 8000
```

Depois abrir <http://localhost:8000>.

## Quando o domínio estiver definido

Os arquivos usam o marcador `https://DOMINIO` onde é preciso o endereço completo:
`index.html`, `privacy.html`, `robots.txt` e `sitemap.xml`. Para trocar tudo de uma vez:

```bash
grep -rl 'https://DOMINIO' --include='*.html' --include='*.txt' --include='*.xml' . | xargs sed -i 's#https://DOMINIO#https://www.exemplo.com#g'
```

Depois disso:

1. Em `index.html` e `privacy.html`, tirar do comentário as tags `canonical`, `og:url` e `og:image`.
2. Em `robots.txt`, tirar o `#` da linha `Sitemap:`.
3. Enviar o `sitemap.xml` no Google Search Console.
