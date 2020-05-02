import { InitSiteConfig } from "../middleware/Init";

const checkSelectedProps = (state)=>{
    let isMultiple,withFolder,withFile=false;
    isMultiple = (state.selected.length>1);
    // eslint-disable-next-line
    state.selected.map((value)=>{
        if(value.type==="dir"){
            withFolder = true;
        }else if(value.type==="file"){
            withFile = true;
        }
    })
    return [isMultiple,withFolder,withFile];
}

const doNavigate = (path,state)=>{
    window.currntPath = path;
    return Object.assign({}, state, {
        navigator:Object.assign({}, state.navigator, {
            path: path
        }),
        viewUpdate:Object.assign({}, state.viewUpdate, {
            contextOpen:false,
            navigatorError:false,
            navigatorLoading:path !== state.navigator.path,
        }),
        explorer:Object.assign({}, state.explorer, {
            selected:[],
            selectProps: {
                isMultiple:false,
                withFolder:false,
                withFile:false,
            },
            keywords:null,
        }),
    });
}

const defaultStatus = InitSiteConfig({
  siteConfig: {
      title: "Cloudreve",
      siteICPId: "",
      loginCaptcha: false,
      regCaptcha: false,
      forgetCaptcha: false,
      emailActive: false,
      QQLogin: false,
      themes:null,
      authn:false,
      theme: {
          palette: {
              common: { black: "#000", white: "#fff" },
              background: { paper: "#fff", default: "#fafafa" },
              primary: {
                  light: "#7986cb",
                  main: "#3f51b5",
                  dark: "#303f9f",
                  contrastText: "#fff"
              },
              secondary: {
                  light: "#ff4081",
                  main: "#f50057",
                  dark: "#c51162",
                  contrastText: "#fff"
              },
              error: {
                  light: "#e57373",
                  main: "#f44336",
                  dark: "#d32f2f",
                  contrastText: "#fff"
              },
              text: {
                  primary: "rgba(0, 0, 0, 0.87)",
                  secondary: "rgba(0, 0, 0, 0.54)",
                  disabled: "rgba(0, 0, 0, 0.38)",
                  hint: "rgba(0, 0, 0, 0.38)"
              },
              explorer: {
                  filename: "#474849",
                  icon: "#8f8f8f",
                  bgSelected: "#D5DAF0",
                  emptyIcon: "#e8e8e8"
              }
          }
      },
      captcha_IsUseReCaptcha: false,
      captcha_ReCaptchaKey: "defaultKey"
  },
  navigator: {
      path: "/",
      refresh: true
  },
  viewUpdate: {
      isLogin:false,
      loadUploader:false,
      open: false,
      explorerViewMethod: "icon",
      sortMethod: "timePos",
      subTitle:null,
      contextType: "none",
      menuOpen: false,
      navigatorLoading: true,
      navigatorError: false,
      navigatorErrorMsg: null,
      modalsLoading: false,
      storageRefresh: false,
      userPopoverAnchorEl: null,
      shareUserPopoverAnchorEl: null,
      modals: {
          createNewFolder: false,
          rename: false,
          move: false,
          remove: false,
          share: false,
          music: false,
          remoteDownload: false,
          torrentDownload: false,
          getSource: false,
          copy:false,
          resave: false,
          compress:false,
          decompress:false,
      },
      snackbar: {
          toggle: false,
          vertical: "top",
          horizontal: "center",
          msg: "",
          color: ""
      }
  },
  explorer: {
    dndSignal:false,
    dndTarget:null,
    dndSource:null,
    fileList: [],
    dirList: [],
    selected: [],
    selectProps: {
        isMultiple: false,
        withFolder: false,
        withFile: false
    },
    lastSelect: {
      file: null,
      index: -1,
    },
    shiftSelectedIds: [],
    imgPreview: {
        first: null,
        other: []
    },
    keywords: null
  }
});

// TODO: 将cloureveApp切分成小的reducer
const cloudreveApp = (state = defaultStatus, action) => {
    switch (action.type) {
        case 'DRAWER_TOGGLE':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    open:action.open,
                }),
            });
        case 'CHANGE_VIEW_METHOD':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    explorerViewMethod:action.method,
                }),
            });
        case 'CHANGE_SORT_METHOD':
            let list = [...state.explorer.fileList,...state.explorer.dirList];
            // eslint-disable-next-line
            list.sort((a,b)=>{
                switch (action.method) {
                    case "sizePos":
                        return a.size-b.size;
                    case "sizeRes":
                        return b.size-a.size;
                    case 'namePos':
                        return a.name.localeCompare(b.name);
                    case 'nameRev':
                        return b.name.localeCompare(a.name);
                    case 'timePos':
                        return Date.parse(a.date)-Date.parse(b.date);
                    case 'timeRev':
                        return Date.parse(b.date)-Date.parse(a.date);
                    default:
                        break;
                }
            })
            var dirList =  list.filter(function (x) {
                return x.type === "dir";
            });
            var fileList =  list.filter(function (x) {
                return x.type === "file";
            });

            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    sortMethod:action.method,
                }),
                explorer: Object.assign({}, state.explorer, {
                    fileList: fileList,
                    dirList: dirList,
                }),
            });
        case 'CHANGE_CONTEXT_MENU':
            if(state.viewUpdate.contextOpen && action.open){
                return Object.assign({}, state);
            }
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    contextOpen: action.open,
                    contextType:action.menuType,
                }),
            });
        case 'DRAG_AND_DROP':
            return Object.assign({}, state, {
                explorer: Object.assign({}, state.explorer, {
                    dndSignal: !state.explorer.dndSignal,
                    dndTarget:action.target,
                    dndSource:action.source,
                }),
            });
        case 'SET_NAVIGATOR_LOADING_STATUE':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    navigatorLoading:action.status,
                }),
            });
        case 'SET_NAVIGATOR_ERROR':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    navigatorError: action.status,
                    navigatorErrorMsg: action.msg,
                }),
            });
        case 'UPDATE_FILE_LIST':
            // eslint-disable-next-line
            action.list.sort((a,b)=>{
                switch (state.viewUpdate.sortMethod) {
                    case "sizePos":
                        return a.size-b.size;
                    case "sizeRes":
                        return b.size-a.size;
                    case 'namePos':
                        return a.name.localeCompare(b.name);
                    case 'nameRev':
                        return b.name.localeCompare(a.name);
                    case 'timePos':
                        return Date.parse(a.date)-Date.parse(b.date);
                    case 'timeRev':
                        return Date.parse(b.date)-Date.parse(a.date);
                    default:
                        break;
                }
            })
            // eslint-disable-next-line
            var dirList =  action.list.filter(function (x) {
                return x.type === "dir";
            });
            // eslint-disable-next-line
            var fileList =  action.list.filter(function (x) {
                return x.type === "file";
            });
            return Object.assign({}, state, {
                explorer: Object.assign({}, state.explorer, {
                    fileList: fileList,
                    dirList: dirList,
                }),
            });
        case 'ADD_SELECTED_TARGETS':
            var newState =  Object.assign({}, state, {
                explorer:Object.assign({}, state.explorer, {
                    selected: [...state.explorer.selected,...action.targets]
                }),
            });
            var selectedProps = checkSelectedProps(newState.explorer);
            return Object.assign({}, newState, {
                explorer:Object.assign({}, newState.explorer, {
                    selectProps: {
                        isMultiple:selectedProps[0],
                        withFolder:selectedProps[1],
                        withFile:selectedProps[2],
                    }
                }),
            });
        case 'SET_SELECTED_TARGET':
            // eslint-disable-next-line
            var newState =  Object.assign({}, state, {
                explorer:Object.assign({}, state.explorer, {
                    selected: action.targets
                }),
            });
            // eslint-disable-next-line
            var selectedProps = checkSelectedProps(newState.explorer);
            return Object.assign({}, newState, {
                explorer:Object.assign({}, newState.explorer, {
                    selectProps: {
                        isMultiple:selectedProps[0],
                        withFolder:selectedProps[1],
                        withFile:selectedProps[2],
                    }
                }),
            });
        case 'RMOVE_SELECTED_TARGETS':
            const { fileIds } = action
            const newSelected = state.explorer.selected.filter((file) => {
              return !fileIds.includes(file.id)
            })
            // eslint-disable-next-line
            var newState =  Object.assign({}, state, {
                explorer:Object.assign({}, state.explorer, {
                    selected: newSelected
                }),
            });
            // eslint-disable-next-line
            var selectedProps = checkSelectedProps(newState.explorer);
            return Object.assign({}, newState, {
                explorer:Object.assign({}, newState.explorer, {
                    selectProps: {
                        isMultiple:selectedProps[0],
                        withFolder:selectedProps[1],
                        withFile:selectedProps[2],
                    }
                }),
            });
        case 'NAVIGATOR_TO':
            return doNavigate(action.path,state);
        case 'TOGGLE_DAYLIGHT_MODE':{
            let copy = Object.assign({}, state);
            if (copy.siteConfig.theme.palette.type === undefined || copy.siteConfig.theme.palette.type === "light"){
                return {
                    ...state,
                    siteConfig: {
                        ...state.siteConfig,
                        theme:{
                            ...state.siteConfig.theme,
                            palette:{
                                ...state.siteConfig.theme.palette,
                                type:"dark",
                            }
                        },
                    },
                };
            }
            return {
                ...state,
                siteConfig: {
                    ...state.siteConfig,
                    theme:{
                        ...state.siteConfig.theme,
                        palette:{
                            ...state.siteConfig.theme.palette,
                            type:"light",
                        }
                    },
                },
            };
        }
        case 'APPLY_THEME':
            if (state.siteConfig.themes !== null){
                let themes = JSON.parse(state.siteConfig.themes);
                if (themes[action.theme] === undefined){
                    return state;
                }
                return Object.assign({}, state, {
                    siteConfig: Object.assign({}, state.siteConfig, {
                        theme:themes[action.theme],
                    }),
                });
            }
            break
        case 'NAVIGATOR_UP':
            var pathSplit = state.navigator.path.split("/");
            pathSplit.pop();
            var newPath = pathSplit.length===1?"/":pathSplit.join("/");
            return doNavigate(newPath,state);
        case 'OPEN_CREATE_FOLDER_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        createNewFolder:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_RENAME_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        rename:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_REMOVE_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        remove:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_MOVE_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        move:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_RESAVE_DIALOG':
            window.shareKey = action.key;
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        resave:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'SET_USER_POPOVER':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    userPopoverAnchorEl:action.anchor,
                }),
            });
        case 'SET_SHARE_USER_POPOVER':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    shareUserPopoverAnchorEl:action.anchor,
                }),
            });
        case 'OPEN_SHARE_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        share:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'SET_SITE_CONFIG':
            return Object.assign({}, state, {
                siteConfig: action.config,
            });
        case 'OPEN_MUSIC_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        music:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_REMOTE_DOWNLOAD_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        remoteDownload:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_TORRENT_DOWNLOAD_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        torrentDownload:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_DECOMPRESS_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        decompress:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_COMPRESS_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        compress:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_GET_SOURCE_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        getSource:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_COPY_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        copy:true,
                    }),
                    contextOpen:false,
                }),
            });
        case 'OPEN_LOADING_DIALOG':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        loading:true,
                        loadingText:action.text,
                    }),
                    contextOpen:false,
                }),
            });
        case 'CLOSE_ALL_MODALS':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modals: Object.assign({}, state.viewUpdate.modals, {
                        createNewFolder:false,
                        rename:false,
                        move:false,
                        remove:false,
                        share:false,
                        music:false,
                        remoteDownload:false,
                        torrentDownload:false,
                        getSource:false,
                        resave:false,
                        copy:false,
                        loading:false,
                        compress:false,
                        decompress:false,
                    }),
                }),
            });
        case 'CHANGE_SUB_TITLE':
            document.title = (action.title === null || action.title === undefined) ? state.siteConfig.title : (action.title + " - " +state.siteConfig.title);
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    subTitle: action.title,
                }),
            });
        case 'TOGGLE_SNACKBAR':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    snackbar:{
                        toggle:!state.viewUpdate.snackbar.toggle,
                        vertical:action.vertical,
                        horizontal:action.horizontal,
                        msg:action.msg,
                        color:action.color,
                    },
                }),
            });
        case 'SET_MODALS_LOADING':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    modalsLoading:action.status,
                }),
            });
        case 'SET_SESSION_STATUS':
            return {
                ...state,
                viewUpdate: {
                    ...state.viewUpdate,
                    isLogin:action.status,
                }
            }
        case 'ENABLE_LOAD_UPLOADER':
            return Object.assign({}, state, {
                viewUpdate: Object.assign({}, state.viewUpdate, {
                    loadUploader:true,
                }),
            });
        case 'REFRESH_FILE_LIST':
            return Object.assign({}, state, {
                navigator: Object.assign({}, state.navigator, {
                    refresh:!state.navigator.refresh,
                }),
                explorer:Object.assign({}, state.explorer, {
                    selected:[],
                    selectProps: {
                        isMultiple:false,
                        withFolder:false,
                        withFile:false,
                    }
                }),
            });
        case 'SEARCH_MY_FILE':
            return Object.assign({}, state, {
                navigator: Object.assign({}, state.navigator, {
                    path: "/搜索结果",
                    refresh:state.explorer.keywords === null? state.navigator.refresh:!state.navigator.refresh,
                }),
                viewUpdate:Object.assign({}, state.viewUpdate, {
                    contextOpen:false,
                    navigatorError:false,
                    navigatorLoading:true,
                }),
                explorer:Object.assign({}, state.explorer, {
                    selected:[],
                    selectProps: {
                        isMultiple:false,
                        withFolder:false,
                        withFile:false,
                    },
                    keywords:action.keywords,
                }),
            });
        case 'SHOW_IMG_PREIVEW':
            return Object.assign({}, state, {
                explorer:Object.assign({}, state.explorer, {
                    imgPreview: {
                        first:action.first,
                        other:state.explorer.fileList,
                    },
                }),
            });
        case 'REFRESH_STORAGE':
            return Object.assign({}, state, {
                viewUpdate:Object.assign({}, state.viewUpdate, {
                    storageRefresh:!state.viewUpdate.storageRefresh,
                }),
            });
        case 'SAVE_FILE':
            return Object.assign({}, state, {
                explorer:Object.assign({}, state.explorer, {
                    fileSave:!state.explorer.fileSave,
                }),
            });
        case 'SET_LAST_SELECT':
            const { file, index } = action
            return {
              ...state,
              explorer: {
                ...state.explorer,
                lastSelect: {
                  file,
                  index,
                },
              }
            }
        case 'SET_SHIFT_SELECTED_IDS':
              const { shiftSelectedIds } = action
              return {
                ...state,
                explorer: {
                  ...state.explorer,
                  shiftSelectedIds,
                }
              }
        default:
            return state
    }
}

export default cloudreveApp