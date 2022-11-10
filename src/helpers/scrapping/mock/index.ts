import * as fs from 'fs'
const PATHS = {
  books: `${__dirname}/books.spec.txt`,
  ['books-duplicated']: `${__dirname}/books-duplicated.spec.txt`,
  volumes: {
    '100morango': `${__dirname}/volumes/100morango.spec.txt`,
    boruto: `${__dirname}/volumes/boruto.spec.txt`,
    shakugan: `${__dirname}/volumes/shakugan.spec.txt`,
    joy2: `${__dirname}/volumes/joy2.spec.txt`,
    ['lobo-solitario']: `${__dirname}/volumes/lobo-solitario.spec.txt`,
    ['abc-do-budismo']: `${__dirname}/volumes/abc-do-budismo-spec.txt`,
    ['a-estrela-do-hentai']: `${__dirname}/volumes/a-estrela-do-hentai.spec.txt`,
    bleach: `${__dirname}/volumes/bleach.spec.txt`,
    ['attack-on-titan-before-fall']: `${__dirname}/volumes/attack-on-titan-before-fall.spec.txt`,
    ['zetsuen-no-tempest']: `${__dirname}/volumes/zetsuen-no-tempest.spec.txt`,
  },
}

const booksHtml = fs.readFileSync(PATHS.books).toString()
const booksDuplicatedHtml = fs
  .readFileSync(PATHS['books-duplicated'])
  .toString()
const morango = fs.readFileSync(PATHS.volumes['100morango']).toString()
const boruto = fs.readFileSync(PATHS.volumes['boruto']).toString()
const shakugan = fs.readFileSync(PATHS.volumes['shakugan']).toString()
const joy2 = fs.readFileSync(PATHS.volumes['joy2']).toString()
const loboSolitario = fs
  .readFileSync(PATHS.volumes['lobo-solitario'])
  .toString()
const abcDoBudismo = fs.readFileSync(PATHS.volumes['abc-do-budismo']).toString()
const aEstrelaDoHentai = fs
  .readFileSync(PATHS.volumes['a-estrela-do-hentai'])
  .toString()

const bleach = fs.readFileSync(PATHS.volumes['bleach']).toString()
const aotBeforeFall = fs
  .readFileSync(PATHS.volumes['attack-on-titan-before-fall'])
  .toString()

const zetsuenNoTempest = fs
  .readFileSync(PATHS.volumes['zetsuen-no-tempest'])
  .toString()

export {
  booksHtml,
  booksDuplicatedHtml,
  morango,
  boruto,
  shakugan,
  joy2,
  loboSolitario,
  abcDoBudismo,
  aEstrelaDoHentai,
  bleach,
  aotBeforeFall,
  zetsuenNoTempest,
}
