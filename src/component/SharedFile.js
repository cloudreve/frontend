import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'
import FileIcon from "../component/FileManager/FileIcon"
import PreviewIcon from "@material-ui/icons/RemoveRedEye"
import InfoIcon from "@material-ui/icons/Info"
import DownloadIcon from "@material-ui/icons/CloudDownload"
import Button from '@material-ui/core/Button';
import {allowSharePreview,sizeToString} from "../untils/index"
import { toggleSnackbar,}from "../actions/index"
import { isPreviewable,}from "../config"
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Paper from '@material-ui/core/Paper';
import Modals from "./FileManager/Modals"
import axios from 'axios'
const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop:'110px',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
          width: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
      player:{
        borderRadius: "4px", 
      },
      fileCotainer:{
          width:"200px",
          margin:"0 auto",
      },
      buttonCotainer:{
        width:"400px",
        margin:"0 auto",
        textAlign: "center",
        marginTop: "20px",
      },
      button: {
        margin: theme.spacing.unit,
      },
      paper: {
        padding: theme.spacing.unit * 2,
      },
      icon:{
        marginRight: theme.spacing.unit,
      }
})
const mapStateToProps = state => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}

const allowDownload = allowSharePreview();

class SharedFileCompoment extends Component {

    state = {
        anchorEl: null,
        open: false,
      };

    preview = ()=>{
        if(!allowDownload){
            this.props.toggleSnackbar("top","right","未登录用户无法下载","warning");
            return;
        }
        switch(isPreviewable(window.shareInfo.fileName)){
            case 'img':
                window.open(window.apiURL.preview);
                return;
            case 'msDoc':
                window.open(window.apiURL.docPreiview);  
                return;
            case 'audio':
                //this.props.openMusicDialog();
                return;
            case 'open':
                window.open(window.apiURL.preview);  
                return;
            case 'video':
                window.location.href=("/Viewer/Video?single=true&shareKey="+window.shareInfo.shareId+"&path=/"+window.shareInfo.fileName);  
                return ;
            case 'edit':
                window.location.href=("/Viewer/Markdown?single=true&shareKey="+window.shareInfo.shareId+"&path=/"+window.shareInfo.fileName);  
                return;
            default:
            this.props.toggleSnackbar("top","right","此文件无法预览","warning");
                return;
        }
    }

    download = ()=>{
        if(!allowDownload){
            this.props.toggleSnackbar("top","right","未登录用户无法下载","warning");
            return;
        }
        axios.post("/Share/getDownloadUrl",{
            key: window.shareInfo.shareId
        })
        .then( (response)=> {
            if(response.data.error!==0){
                this.props.toggleSnackbar("top","right",response.data.msg ,"warning");
            }else{
                window.location.href=response.data.result;
            }
            
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
    }

    handleOpen = event => {
        const { currentTarget } = event;
        this.setState(state => ({
          anchorEl: currentTarget,
          open: !state.open,
        }));
    };

    render() {
        const { classes } = this.props;
        const file={
            name:window.shareInfo.fileName,
            path:"/",
            type:"file",
            pic:"",
        };
        const id = this.state.open ? 'simple-popper' : null;

        return (
             <div className={classes.layout}>
             <Modals/>
                <div className={classes.fileCotainer}>
                   <FileIcon file={file} share={true}/></div>
                <div className={classes.buttonCotainer}>
                <Button variant="contained" color="secondary" className={classes.button} onClick={this.download}>
                    <DownloadIcon className={classes.icon}/> 下载 ({sizeToString(window.shareInfo.fileSize)})
                </Button> 
                <Button variant="outlined" className={classes.button} onClick={this.preview}>
                    <PreviewIcon className={classes.icon}/> 预览
                </Button>
                <Button variant="outlined" className={classes.button} onClick={this.handleOpen}>
                    <InfoIcon className={classes.icon}/> 信息
                </Button>
               <Popper id={id} open={this.state.open} anchorEl={this.state.anchorEl} transition>
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                    <Paper className={classes.paper}>
                        <Typography >此分享被浏览{window.shareInfo.ViewNum}次，被下载{window.shareInfo.downloadNum}次</Typography>
                    </Paper>
                    </Fade>
                )}
                </Popper>
                </div>
             </div>
        );
    }

}

const SharedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(SharedFileCompoment))
  
export default SharedFile
