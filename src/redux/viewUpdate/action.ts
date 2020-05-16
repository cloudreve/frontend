import { ThunkAction } from 'redux-thunk'

export interface ACTION_SET_SUBTITLE {
  type: "SET_SUBTITLE",
  title: string,
}

export const setSubtitle = (title: string): ACTION_SET_SUBTITLE => {
  return {
    type: 'SET_SUBTITLE',
    title,
  }
}

export const changeSubTitle = (title: string):
ThunkAction<any, any, any, any> => {
  return (dispatch, getState) => {
    const state = getState()
    document.title = (title === null || title === undefined) ? state.siteConfig.title : (title + " - " +state.siteConfig.title);
    dispatch(setSubtitle(title))
  }
}
