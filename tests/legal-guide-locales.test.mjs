import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { guideIndexes, foreignTrademarkGuides, syncNavbar } from '../scripts/navbar-template.mjs';

const origin = 'https://tbabogados.com.ar/';
const languages = { es: 'es-AR', en: 'en', pt: 'pt-BR' };
const read = route => fs.readFileSync(`${route}index.html`, 'utf8');
const schemas = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

test('guide indexes and articles have reciprocal language annotations and their own canonical', () => {
  for (const routes of [guideIndexes, foreignTrademarkGuides]) {
    for (const [lang, route] of Object.entries(routes)) {
      const html = read(route);
      assert.match(html, new RegExp(`<html lang="${languages[lang]}"`));
      assert.ok(html.includes(`href="${origin + route}" rel="canonical"`));
      assert.ok(!html.includes('noindex'));
      for (const [other, target] of Object.entries(routes)) {
        assert.ok(html.includes(`hreflang="${languages[other]}" href="${origin + target}"`));
      }
      assert.equal(syncNavbar(html, `${route}index.html`), html);
      for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
        if (/^(?:[a-z]+:|#|data:)/i.test(m[1])) continue;
        const target = path.resolve(route, m[1].split(/[?#]/)[0]);
        assert.ok(fs.existsSync(target), `${route}: missing ${m[1]}`);
      }
    }
  }
});

test('each translated index lists only its translated articles, also in structured data', () => {
  for (const lang of ['en', 'pt']) {
    const html = read(guideIndexes[lang]);
    const cards = [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)];
    assert.ok(cards.length > 0);
    const urls = cards.map(card => {
      const links = [...card[0].matchAll(/href="([^"]+)"/g)].map(m => path.posix.normalize(path.posix.join(guideIndexes[lang], m[1])).replace(/\/$/, '') + '/');
      assert.ok(links.length > 0);
      for (const link of links) {
        assert.ok(link.startsWith(guideIndexes[lang]), `${lang}: wrong language ${link}`);
        assert.equal(link, links[0]);
        const article = read(link);
        assert.ok(article.includes(`"inLanguage": "${languages[lang]}"`));
        assert.ok(!article.includes('noindex'));
      }
      return origin + links[0];
    });
    const list = schemas(html).find(s => s['@type'] === 'CollectionPage').mainEntity.itemListElement;
    assert.deepEqual(list.map(x => x.url), urls);
    assert.ok(read(foreignTrademarkGuides[lang]).includes(`"inLanguage": "${languages[lang]}"`));
  }
});

test('old article URLs redirect immediately, and the sitemap lists only the new translations', () => {
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
  for (const lang of ['en', 'pt']) {
    const legacy = `guias-legales/registrar-marca-argentina-siendo-extranjero/${lang}/`;
    const html = read(legacy);
    assert.ok(html.includes(`content="0;url=${origin + foreignTrademarkGuides[lang]}"`));
    assert.ok(html.includes(`rel="canonical" href="${origin + foreignTrademarkGuides[lang]}"`));
    assert.ok(!sitemap.includes(`<loc>${origin + legacy}</loc>`));
    for (const route of [guideIndexes[lang], foreignTrademarkGuides[lang]]) assert.ok(sitemap.includes(`<loc>${origin + route}</loc>`));
  }
});
