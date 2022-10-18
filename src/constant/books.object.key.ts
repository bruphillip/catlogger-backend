export const BOOKS_OBJECT_KEY = {
  URL: 'children[0].children[0].attribs.href',
  NAME: 'children[0].children[0].children[0].data',
  PUBLISHER: 'children[1].children[0].data',
  AUTHOR: 'children[9].data',
  VOL_NUMBER: 'children[1].children[0].data',
  VOL_RELEASE_DATE: 'children[3].children[0].data',
  VOL_PRICE: 'children[7].children[0].data',
  COVER: `children[idx].children[1].children[1].children[0].attribs.src`,
} as const
