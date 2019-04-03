const viewUpdate = (state = [], action) => {
    switch (action.type) {
        case 'DRAWER_TOGGLE':
            return Object.assign({}, state, {
                open: action.open
            });
        case 'CHANGE_VIEW_METHOD':
            return Object.assign({}, state, {
                explorerViewMethod: action.method
                
            });
        case 'CHANGE_SORT_METHOD':
            return Object.assign({}, state, {
                sortMethod: action.method
            });
        case 'CHANGE_CONTEXT_MENU':
            if(state.contextOpen && action.open){
                return Object.assign({}, state);
            }
            return Object.assign({}, state, {
                contextType: action.menuType,
                contextOpen: action.open,
            });
        case 'SET_NAVIGATOR_LOADING_STATUE':
            return Object.assign({}, state, {
                navigatorLoading: action.status
            });
        case 'SET_NAVIGATOR_ERROR':
            return Object.assign({}, state, {
                navigatorError: action.status,
                navigatorErrorMsg: action.msg,
            });
        default:
            return state
    }
  }
  
  export default viewUpdate