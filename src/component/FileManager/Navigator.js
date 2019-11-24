import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import {withRouter} from  'react-router-dom'
import RightIcon from '@material-ui/icons/KeyboardArrowRight'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import ViewListIcon from '@material-ui/icons/ViewList'
import ViewModuleIcon from '@material-ui/icons/ViewModule'
import ViewSmallIcon from '@material-ui/icons/ViewComfy'
import TextTotateVerticalIcon from '@material-ui/icons/TextRotateVertical'
import FolderIcon from '@material-ui/icons/Folder'
import ExpandMore from '@material-ui/icons/ExpandMore';
import ShareIcon from '@material-ui/icons/Share'
import NewFolderIcon from '@material-ui/icons/CreateNewFolder'
import RefreshIcon from '@material-ui/icons/Refresh'
import {
    navitateTo,
    navitateUp,
    changeViewMethod,
    changeSortMethod,
    setNavigatorError,
    updateFileList,
    setNavigatorLoadingStatus,
    refreshFileList,
    setSelectedTarget,
    openCreateFolderDialog,
    openShareDialog,
    drawerToggleAction,
} from "../../actions/index"
import API from '../../middleware/Api'
import {setCookie,setGetParameter,fixUrlHash} from "../../untils/index"

import {
    withStyles,
    Divider,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton,
} from '@material-ui/core';

const mapStateToProps = state => {
    return {
      path: state.navigator.path,
      refresh: state.navigator.refresh,
      drawerDesktopOpen:state.viewUpdate.open,
      viewMethod:state.viewUpdate.explorerViewMethod,
      keywords:state.explorer.keywords,
      sortMethod:state.viewUpdate.sortMethod,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        navigateToPath: path => {
            dispatch(navitateTo(path))
        },
        navitateUp:()=>{
            dispatch(navitateUp())
        },
        changeView:method=>{
            dispatch(changeViewMethod(method))
        },
        changeSort:method=>{
            dispatch(changeSortMethod(method))
        },
        setNavigatorError:(status,msg)=>{
            dispatch(setNavigatorError(status,msg))
        },
        updateFileList:list=>{
            dispatch(updateFileList(list))
        },
        setNavigatorLoadingStatus:status=>{
            dispatch(setNavigatorLoadingStatus(status))
        },
        refreshFileList:()=>{
            dispatch(refreshFileList())
        },
        setSelectedTarget:(target)=>{
            dispatch(setSelectedTarget(target))
        },
        openCreateFolderDialog:()=>{
            dispatch(openCreateFolderDialog())
        },
        openShareDialog:()=>{
            dispatch(openShareDialog())
        },
        handleDesktopToggle: open => {
            dispatch(drawerToggleAction(open))
        },
    }
}

const delay = (ms) => new Promise(  
    (resolve) => setTimeout(resolve, ms)  
);

const sortOptions = [
    "文件名称正序",
    "文件名称倒序",
    "上传时间正序",
    "上传时间到序",
    "文件大小正序",
    "文件大小倒序",
];

const styles = theme => ({
    container:{
        [theme.breakpoints.down('xs')]: {
            display:"none",
        },
        height:"48px",
        overflow:"hidden",
        backgroundColor:"#fff",
    },
    navigatorContainer:{
        "display": "flex",
        "justifyContent": "space-between",
    },
    nav:{
        height:"47px",
        padding:"5px 15px",
        display:"flex",
    },
    optionContainer:{
        paddingTop: "6px",
        marginRight:"10px",
    },
    rightIcon:{
        marginTop: "6px",
        verticalAlign: "top",
        color:"#868686",
    },
    expandMore:{
        color:"#8d8d8d",
    },
    sideButton:{
        padding:"8px",
        marginRight:"5px",
    }
})

class NavigatorCompoment extends Component {
    
    keywords = null;

    state = {
        hidden:false,
        hiddenFolders:[],
        folders:[],
        anchorEl: null,
        hiddenMode:false,
        anchorHidden:null,
        anchorSort:null,
        selectedIndex:0,
    }

    constructor(props) {
        super(props);
        this.element = React.createRef();
    }
    

    componentDidMount = ()=>{
        this.renderPath();
        // 如果是在个人文件管理页，首次加载时打开侧边栏
        this.props.handleDesktopToggle(true);
        // 后退操作时重新导航
        window.onpopstate = (event)=>{
            var url = new URL(fixUrlHash(window.location.href));
            var c = url.searchParams.get("path");
            if(c!==null&&c!==this.props.path){
                this.props.navigateToPath(c);
            }
        };
    }

    renderPath = (path=null)=>{
        this.setState({
            folders:path!==null?path.substr(1).split("/"):this.props.path.substr(1).split("/"),
        });
        var newPath = path!==null?path:this.props.path;
        var apiURL = this.keywords===null?'/directory':'/File/SearchFile';
        newPath = this.keywords===null?newPath:this.keywords;
        API.get(apiURL, {
            params: { 
                path: newPath,
            } 
        })
        .then( (response)=> {
            this.props.updateFileList(response.data);
            this.props.setNavigatorLoadingStatus(false);
            let pathTemp = (path!==null?path.substr(1).split("/"):this.props.path.substr(1).split("/")).join(",");
            setCookie("path_tmp",encodeURIComponent(pathTemp),1);
            if(this.keywords===null){
                setGetParameter("path",encodeURIComponent(newPath));
            }
        })
        .catch((error) =>{
            this.props.setNavigatorError(true,error); 
        });
        this.checkOverFlow(); 
    }

    redresh = (path) => {
        this.props.setNavigatorLoadingStatus(true);
        this.props.setNavigatorError(false,"error");
        this.renderPath(path);
    }

    componentWillReceiveProps = (nextProps)=>{
        if(this.props.keywords!==nextProps.keywords){
            this.keywords=nextProps.keywords
        }
        if(this.props.path !== nextProps.path){
            this.renderPath(nextProps.path);
        }
        if(this.props.refresh !== nextProps.refresh){
            this.redresh(nextProps.path); 
        }

    }

    componentDidUpdate = (prevProps,prevStates)=>{
        if(this.state.folders !== prevStates.folders){
            this.checkOverFlow();
        }
        if(this.props.drawerDesktopOpen !== prevProps.drawerDesktopOpen){
            delay(500).then(() => this.checkOverFlow());
            
        }
    }

    checkOverFlow = ()=>{
        const hasOverflowingChildren = this.element.current.offsetHeight < this.element.current.scrollHeight ||
        this.element.current.offsetWidth < this.element.current.scrollWidth;
        if(hasOverflowingChildren && !this.state.hiddenMode){
            this.setState({hiddenMode:true});
        }
        if(!hasOverflowingChildren && this.state.hiddenMode){
            this.setState({hiddenMode:false}); 
        }
    }
    
    navigateTo=(event,id)=> {
        if (id === this.state.folders.length-1){
            //最后一个路径
            this.setState({ anchorEl: event.currentTarget });
            return;
        }else if(id===-1 && this.state.folders.length === 1 && this.state.folders[0] === ""){
            this.props.refreshFileList();
            this.handleClose(); 
            return;
        }else if (id === -1){
            this.props.navigateToPath("/");
            this.handleClose();
            return;
        }else{
            this.props.navigateToPath("/"+this.state.folders.slice(0,id+1).join("/"));
            this.handleClose();
        }
    }

    handleClose = () => {
        this.setState({ anchorEl: null ,anchorHidden:null,anchorSort:null});
    };

    showHiddenPath = (e) => {
        this.setState({ anchorHidden: e.currentTarget });
    }

    showSortOptions = (e) => {
        this.setState({ anchorSort: e.currentTarget });
    }

    performAction = e => {
        this.handleClose();
        if(e==="refresh"){
            this.redresh();
            return;
        }
        let presentPath = this.props.path.split("/");
        let newTarget = [{
            type:"dir",
            name:presentPath.pop(),
            path:presentPath.length===1?"/":presentPath.join("/"),
        }];
        //this.props.navitateUp();
        switch (e) {
            case "share":
                this.props.setSelectedTarget(newTarget);
                this.props.openShareDialog();
                break;
            case "newfolder":
                this.props.openCreateFolderDialog();
                break;
            default:
                break;
        }

    }


    toggleViewMethod = () => {
        this.props.changeView(this.props.viewMethod==="icon"?"list":(this.props.viewMethod==="list"?"smallIcon":"icon"));
    }

    handleMenuItemClick = (e,index) => {
        this.setState({ selectedIndex: index, anchorEl: null });
        let optionsTable = {
            0:"namePos",
            1:"nameRev",
            2:"timePos",
            3:"timeRev",
            4:"sizePos",
            5:"sizeRes",
        };
        this.props.changeSort(optionsTable[index]);
        this.handleClose();
        this.props.refreshFileList();
    }
    
    
    render() {

        const { classes} = this.props;

        let presentFolderMenu = (<Menu
            id="presentFolderMenu"
            anchorEl={this.state.anchorEl}
            open={Boolean(this.state.anchorEl)}
            onClose={this.handleClose}
            disableAutoFocusItem={true}
            >
                <MenuItem onClick={()=>this.performAction("refresh")}>
                <ListItemIcon><RefreshIcon/></ListItemIcon>
                    刷新
                </MenuItem>
                {(this.props.keywords===null&&window.isHomePage)&&
                    <div>
                        <Divider/>
                        <MenuItem onClick={()=>this.performAction("share")}>
                            <ListItemIcon><ShareIcon/></ListItemIcon>
                            分享
                        </MenuItem>

                        <MenuItem onClick={()=>this.performAction("newfolder")}>
                            <ListItemIcon><NewFolderIcon/></ListItemIcon>
                            创建文件夹
                        </MenuItem>
                        
                    </div>
                }
                
            </Menu>);

        return (
             <div className={classes.container}>
                <div className={classes.navigatorContainer}>
                    <div className={classes.nav} ref={this.element}>
                        <span>           
                            <Button component="span" onClick={(e)=>this.navigateTo(e,-1)}>
                                /
                            </Button>
                            <RightIcon className={classes.rightIcon}/>
                        </span>
                        {this.state.hiddenMode && 
                            <span>
                                <Button title="显示路径" component="span" onClick={this.showHiddenPath}>
                                    <MoreIcon/>     
                                </Button>
                                <Menu
                                    id="hiddenPathMenu"
                                    anchorEl={this.state.anchorHidden}
                                    open={Boolean(this.state.anchorHidden)}
                                    onClose={this.handleClose}
                                    disableAutoFocusItem={true}
                                >
                                    {this.state.folders.slice(0,-1).map((folder,id)=>(
                                        <MenuItem onClick={(e)=>this.navigateTo(e,id)}>
                                            <ListItemIcon>
                                                <FolderIcon />
                                            </ListItemIcon>
                                            <ListItemText inset primary={folder} />
                                        </MenuItem>
                                    ))}
                                </Menu>
                                <RightIcon className={classes.rightIcon}/>
                                <Button component="span" onClick={(e)=>this.navigateTo(e,this.state.folders.length-1)}>
                                    {this.state.folders.slice(-1)}  
                                    <ExpandMore className={classes.expandMore}/>
                                </Button>
                                {presentFolderMenu}           
                            </span>
                        }
                        {!this.state.hiddenMode && this.state.folders.map((folder,id,folders)=>(
                            <span key={id}> 
                                {folder !=="" &&  
                                <span> 
                                    <Button component="span" onClick={(e)=>this.navigateTo(e,id)}>
                                        {folder === ""?"":folder}
                                        {(id === folders.length-1) &&
                                            <ExpandMore className={classes.expandMore}/>
                                        }
                                    </Button>
                                        {(id === folders.length-1) &&
                                        presentFolderMenu
                                        }
                                    {(id !== folders.length-1) && <RightIcon className={classes.rightIcon}/>}
                                </span> 
                                }          
                            
                            </span>
                        ))}
                    
                    </div>
                    <div className={classes.optionContainer}>
                        {(this.props.viewMethod === "icon")&&
                            <IconButton title="列表展示" className={classes.sideButton} onClick={this.toggleViewMethod}>
                                <ViewListIcon fontSize="small" />
                            </IconButton>
                        }
                        {(this.props.viewMethod === "list")&&
                            <IconButton title="小图标展示" className={classes.sideButton} onClick={this.toggleViewMethod}>
                                <ViewSmallIcon fontSize="small" />
                            </IconButton>
                        }

                        {(this.props.viewMethod === "smallIcon")&&
                            <IconButton title="大图标展示" className={classes.sideButton} onClick={this.toggleViewMethod}>
                                <ViewModuleIcon fontSize="small" />
                            </IconButton>
                        }
                        
                        <IconButton title="排序方式" className={classes.sideButton} onClick={this.showSortOptions}>
                            <TextTotateVerticalIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            id="sort-menu"
                            anchorEl={this.state.anchorSort}
                            open={Boolean(this.state.anchorSort)}
                            onClose={this.handleClose}
                        >
                        {sortOptions.map((option, index) => (
                            <MenuItem
                            key={option}
                            selected={index === this.state.selectedIndex}
                            onClick={event => this.handleMenuItemClick(event, index)}
                            >
                            {option}
                            </MenuItem>
                        ))}
                        </Menu>
                    </div>
                </div>
                <Divider/>
             </div>
        );
    }

}

NavigatorCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
    path:PropTypes.string.isRequired,
};


const Navigator = connect(
    mapStateToProps,
    mapDispatchToProps
  )( withStyles(styles)(withRouter(NavigatorCompoment)))

export default Navigator