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
| `img/og-logo.jpg` | Imagem de compartilhamento (1200×630) |
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

## Trocar de domínio

O site usa o endereço `https://silverrhand.pages.dev` nas tags de compartilhamento
(imagem do WhatsApp/Facebook), no link canônico, nos dados estruturados, no
`robots.txt` e no `sitemap.xml`. Quando o domínio final estiver no ar, trocar tudo de uma vez:

```bash
grep -rl 'https://silverrhand.pages.dev' --include='*.html' --include='*.txt' --include='*.xml' . | xargs sed -i 's#https://silverrhand.pages.dev#https://www.exemplo.com#g'
```

Depois, enviar o `sitemap.xml` no Google Search Console.

Para ver como fica o link compartilhado: <https://www.opengraph.xyz/> ou o
depurador do Facebook (<https://developers.facebook.com/tools/debug/>), que
também limpa o cache quando a imagem muda.
