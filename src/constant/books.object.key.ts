export const BOOKS_OBJECT_KEY = {
  AUTHOR: 'Autor',
  VOL: ['Vol', 'VOLUME', 'VOLUMES'],
  BRASIL: 'Brasil',
  URL: 'children[0].children[0].attribs.href',
  NAME: 'children[0].children[0].children[0].data',
  PUBLISHER: 'children[2].children[0].data',
  VOL_NUMBER: 'children[1].children[0].data',
  VOL_RELEASE_DATE_JP: 'children[3].children[0].data',
  VOL_RELEASE_DATE_BR: [
    'children[5].children[0].data',
    'children[5].children[0].children[0].data',
  ],
  VOL_PRICE: 'children[7].children[0].data',
  AMAZON_LINK: 'children[9].children[0].data',
  COVER: `children[1].children[1].children[0].attribs["data-large-file"]`,
  NEXT_SIBLING: 'nextSibling.data',
} as const
