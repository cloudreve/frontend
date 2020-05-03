const checkSelectedProps = (state)=>{
    let isMultiple,withFolder,withFile=false;
    isMultiple = (state.selected.length>1);
    state.selected.forEach((value) => {
        if(value.type==="dir"){
            withFolder = true;
        }else if(value.type==="file"){
            withFile = true;
        }
    })
    return [isMultiple,withFolder,withFile];
}

const explorer = (state = [], action) => {
    switch (action.type) {
        case 'UPDATE_FILE_LIST':
            var dirList =  action.list.filter(function (x) {
                return x.type === "dir";
            });
            return Object.assign({}, state, {
                fileList: action.list,
                dirList: dirList,
            });
        case 'ADD_SELECTED_TARGET':
            var newState =  Object.assign({}, state, {
                selected: [...state.selected,action.targets]
            });
            var selectedProps = checkSelectedProps(newState);
            return Object.assign({}, newState, {
                selectProps: {
                    isMultiple:selectedProps[0],
                    withFolder:selectedProps[1],
                    withFile:selectedProps[2],
                }
            });
        case 'SET_SELECTED_TARGET':
            var newSelectedState = Object.assign({}, state, {
                selected: action.targets
            });
            var newSelectedProps = checkSelectedProps(newSelectedState);
            return Object.assign({}, newSelectedState, {
                selectProps: {
                    isMultiple:newSelectedProps[0],
                    withFolder:newSelectedProps[1],
                    withFile:newSelectedProps[2],
                }
            });
        case 'RMOVE_SELECTED_TARGET':
            var oldSelected = state.selected.concat();
            oldSelected.splice(action.id,1);
            var removedSelectedState = Object.assign({}, state, {
                selected: oldSelected,
            });
            var removedSelectedProps = checkSelectedProps(removedSelectedState);
            return Object.assign({}, removedSelectedState, {
                selectProps: {
                    isMultiple:removedSelectedProps[0],
                    withFolder:removedSelectedProps[1],
                    withFile:removedSelectedProps[2],
                }
            });
        default:
            return state
    }
  }
  
  export default explorer