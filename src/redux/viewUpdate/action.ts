import { ThunkAction } from 'redux-thunk'

export interface ACTION_CHANGE_SUBTITLE {
  type: "CHANGE_SUB_TITLE",
  title: string,
}

export const changeSubTitle = (title: string):
ThunkAction<ACTION_CHANGE_SUBTITLE, any, any, any> => {
  return (dispatch, getState) => {
    const state = getState()
    document.title = (title === null || title === undefined) ? state.siteConfig.title : (title + " - " +state.siteConfig.title);
    return {
      type: "CHANGE_SUB_TITLE",
      title: title
    }
  }
}
