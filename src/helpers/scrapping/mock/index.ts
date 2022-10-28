import * as fs from 'fs'
const PATHS = {
  books: `${__dirname}/books.spec.txt`,
  volumes: {
    '100morango': `${__dirname}/volumes/100morango.spec.txt`,
    boruto: `${__dirname}/volumes/boruto.spec.txt`,
    shakugan: `${__dirname}/volumes/shakugan.spec.txt`,
    joy2: `${__dirname}/volumes/joy2.spec.txt`,
    ['lobo-solitario']: `${__dirname}/volumes/lobo-solitario.spec.txt`,
    ['abc-do-budismo']: `${__dirname}/volumes/abc-do-budismo-spec.txt`,
    ['a-estrela-do-hentai']: `${__dirname}/volumes/a-estrela-do-hentai.spec.txt`,
  },
}

const booksHtml = fs.readFileSync(PATHS.books).toString()
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

export {
  booksHtml,
  morango,
  boruto,
  shakugan,
  joy2,
  loboSolitario,
  abcDoBudismo,
  aEstrelaDoHentai,
}
