import axios from 'axios'

import {
  abcDoBudismo,
  aEstrelaDoHentai,
  bleach,
  booksDuplicatedHtml,
  booksHtml,
  boruto,
  joy2,
  loboSolitario,
  morango,
  shakugan,
} from '../mock'
import { BBM } from './bbm'

const mockedAxios = axios as jest.Mocked<typeof axios>
jest.mock('axios')
describe('BBM', () => {
  let bbm: BBM

  beforeEach(async () => {
    bbm = new BBM()
  })

  afterEach(async () => {
    await jest.restoreAllMocks()
  })

  it('should load books title and publisher', async () => {
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: booksHtml }),
    )
    const scrap = await bbm.scrapBooks()

    expect(scrap.books).toHaveLength(19)
    expect(scrap.books[0].name).toBe(
      '.Hack // A Lenda do Bracelete do Crepúsculo',
    )
    expect(scrap.books[1].name).toBe('07-ghost')
    expect(scrap.books[2].name).toBe('1 litro de lágrimas')
    expect(scrap.publishers).toHaveLength(8)
    expect(scrap.publishers[0].name).toBe('JBC')
    expect(scrap.publishers[1].name).toBe('Panini')
    expect(scrap.publishers[2].name).toBe('NewPOP')
  })

  it('should load books title and publisher and fix duplicated names', async () => {
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: booksDuplicatedHtml }),
    )
    const scrap = await bbm.scrapBooks()

    expect(scrap.books).toHaveLength(20)
    expect(scrap.books[0].name).toBe(
      '.Hack // A Lenda do Bracelete do Crepúsculo',
    )
    expect(scrap.books[1].name).toBe('07-ghost')
    expect(scrap.books[2].name).toBe('1 litro de lágrimas')
    expect(scrap.publishers).toHaveLength(8)
    expect(scrap.publishers[0].name).toBe('JBC')
    expect(scrap.publishers[1].name).toBe('Panini')
    expect(scrap.publishers[2].name).toBe('NewPOP')

    expect(scrap.books[3].name).toBe('100% morango')
    expect(scrap.books[3].dupIndex).toBe(0)
    expect(scrap.books[4].name).toBe('100% morango ultimate')
    expect(scrap.books[4].dupIndex).toBe(1)

    expect(scrap.books).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dupIndex: expect.any(Number),
        }),
      ]),
    )
  })

  it('should load and get information books volume in batch(boruto)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: boruto }),
    )

    const booksVolume = await bbm.getBooksVolume([
      { name: 'Boruto', publisher: 'Panini', url: 'borutoUrl' },
    ])

    expect(booksVolume[0].author).toBe('Masashi Kishimoto; Mikio Ikemoto')
    expect(booksVolume[0].name).toBe('Boruto')
    expect(booksVolume[0].volumes).toHaveLength(16)
    expect(booksVolume[0].volumes[0].number).toBe('# 01')
    expect(booksVolume[0].volumes[0].releaseDate).toBe('08/2018')
    expect(booksVolume[0].volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()
  })

  it('should load and get information books volume in batch(morango)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: morango }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'Teste Url',
    })

    expect(booksVolume.author).toBe('Mizuki Kawashita')
    expect(booksVolume.volumes).toHaveLength(19)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('Maio de 2010')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()
  })

  it('should load and get information books volume in batch(lobo solitario)', async () => {
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: loboSolitario }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'lobo-solitario',
    })

    expect(booksVolume.author).toBe('Kazuo Koike; Goseki Kojima')
    expect(booksVolume.volumes).toHaveLength(28)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('Dezembro de 2004')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
  })

  it('should load and get information books volume(joy2)', async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: joy2 }))

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'joy2',
    })

    expect(booksVolume.author).toBe('Etsuko')
    expect(booksVolume.volumes).toHaveLength(1)
    expect(booksVolume.volumes[0].number).toBe('Único')
    expect(booksVolume.volumes[0].releaseDate).toBe('06/11/2020')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
  })

  it('should load and get information books volume in batch(shakugan)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: shakugan }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'shakugan',
    })

    expect(booksVolume.author).toBe('Ayato Sasakura')
    expect(booksVolume.volumes).toHaveLength(4)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('15/11/2018')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()
  })

  it('should load and get information books volume in batch(a estrela do hentai)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: aEstrelaDoHentai }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'hentai',
    })

    expect(booksVolume.author).toBe('Morihito Kanehira')
    expect(booksVolume.volumes).toHaveLength(2)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('Fevereiro de 2018')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()
  })

  it.skip('should load and get information books volume in batch(abc do budismo)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: abcDoBudismo }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'Book Name',
      publisher: 'Random Publisher',
      url: 'abc',
    })

    expect(booksVolume.author).toBe('Ayato Sasakura')
    expect(booksVolume.volumes).toHaveLength(10)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('15/11/2018')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()
  })

  it('should load and get information books volume in batch(bleach - old volumes)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: bleach }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'bleach(2)',
      publisher: 'Random Publisher',
      url: 'abc',
    })

    expect(booksVolume.author).toBe('Tite Kubo')
    expect(booksVolume.volumes).toHaveLength(74)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('07/2007')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()
    expect(mock).toHaveBeenCalled()

    // URL matching
    expect(booksVolume.volumes[0].coverUrl.includes('01')).toBe(true)

    expect(booksVolume.volumes[73].coverUrl.includes('74')).toBe(true)
  })

  it('should load and get information books volume in batch(bleach remix - new volumes)', async () => {
    const mock = mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: bleach }),
    )

    const booksVolume = await bbm.getBookVolume({
      name: 'bleach (1)',
      publisher: 'Random Publisher',
      url: 'abc',
      dupIndex: 1,
    })

    expect(booksVolume.author).toBe('Tite Kubo')
    expect(booksVolume.volumes).toHaveLength(5)
    expect(booksVolume.volumes[0].number).toBe('# 01')
    expect(booksVolume.volumes[0].releaseDate).toBe('10/06/2022')
    expect(booksVolume.volumes[0].coverUrl).toBeTruthy()

    // URL matching
    expect(booksVolume.volumes[0].coverUrl.includes('Remix')).toBe(true)
    expect(booksVolume.volumes[0].coverUrl.includes('01')).toBe(true)

    expect(booksVolume.volumes[4].coverUrl.includes('Remix')).toBe(true)
    expect(booksVolume.volumes[4].coverUrl.includes('05')).toBe(true)

    expect(mock).toHaveBeenCalled()
  })
})
