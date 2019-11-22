import React, { Component } from 'react'
import { connect } from 'react-redux'
import ImageIcon from '@material-ui/icons/PhotoSizeSelectActual'
import VideoIcon from '@material-ui/icons/Videocam'
import AudioIcon from '@material-ui/icons/Audiotrack'
import PdfIcon from "@material-ui/icons/PictureAsPdf"
import RefreshIcon from "@material-ui/icons/Refresh"
import DeleteIcon from "@material-ui/icons/Delete"
import FileShowIcon from "@material-ui/icons/InsertDriveFile"
import {FileWordBox,FilePowerpointBox,FileExcelBox,ScriptText,MagnetOn,ZipBox,WindowRestore,Android} from 'mdi-material-ui'
import { toggleSnackbar,}from "../actions/index"
import axios from 'axios'
import {sizeToString} from '../untils/index'
import {mediaType} from "../config"

import {
    withStyles,
    Card,
    LinearProgress,
    CardContent,
    Typography,
    Button,
    IconButton,
} from '@material-ui/core';

const styles = theme => ({
    card: {
       marginTop:"20px",
       display: "flex",
       justifyContent: "space-between",
    },
    actions: {
        display: 'flex',
    },
    title:{
        marginTop:"20px",
    },
    layout: {
        width: 'auto',
        marginTop:'30px',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
          width: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
      shareTitle:{
          maxWidth:"200px",
      },
      avatarFile:{
        backgroundColor: theme.palette.primary.light,
      },
      avatarFolder:{
        backgroundColor: theme.palette.secondary.light,
      },
      gird:{
          marginTop:"30px",
      },
      iconContainer:{
          width:"90px",
          height:"90px",
          padding: "29px",
          marginTop: "6px",
          paddingLeft: "35px",
          [theme.breakpoints.down("md")]: {
              display:"none"
          }
      },
      content:{
          width:"100%",
          minWidth: 0,
      },
      contentSide:{
        minWidth: 0,
        paddingTop: "24px",
        paddingRight: "28px",
        [theme.breakpoints.down("md")]: {
            display:"none"
        }
      },
    iconImgBig:{    
        color:"#d32f2f",
        fontSize: "30px",
    },
    iconVideoBig:{    
        color:"#d50000",
        fontSize: "30px",
    },
    iconAudioBig:{    
        color:"#651fff",
        fontSize: "30px",
    },
    iconPdfBig:{    
        color:"#f44336",
        fontSize: "30px",
    },
    iconWordBig:{    
        color:"#538ce5",
        fontSize: "30px",
    },
    iconPptBig:{    
        color:"rgb(239, 99, 63)",
        fontSize: "30px",
    },
    iconExcelBig:{    
        color:"#4caf50",
        fontSize: "30px",
    },
    iconTextBig:{    
        color:"#607d8b",
        fontSize: "30px",
    },
    iconFileBig:{    
        color:"#424242",
        fontSize: "30px",
    },
    iconTorrentBig:{    
        color:"#5c6bc0",
        fontSize: "30px",
    },
    iconZipBig:{    
        color:"#f9a825",
        fontSize: "30px",
    },
    iconAndroidBig:{    
        color:"#8bc34a",
        fontSize: "30px",
    },
    iconExeBig:{    
        color:"#1a237e",
        fontSize: "30px",
    },
    hide:{
        display:"none",
    },
    loadingAnimation:{
        borderRadius: "6px 6px 0 0",
    },
    shareFix:{
        marginLeft: "20px",
    },
    loadMore:{
        textAlign:"center",
        marginTop:"20px",
        marginBottom:"20px",
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

const getIcon = (classes,name)=>{
    let iconBig;
        let fileType =name.split(".").pop().toLowerCase();
        if (mediaType["image"].indexOf(fileType)!==-1){
            iconBig = (<ImageIcon className={classes.iconImgBig}/>);
        }else if(mediaType["video"].indexOf(fileType)!==-1){
            iconBig = (<VideoIcon className={classes.iconVideoBig}/>); 
        }else if(mediaType["audio"].indexOf(fileType)!==-1){
            iconBig = (<AudioIcon className={classes.iconAudioBig}/>); 
        }else if(mediaType["pdf"].indexOf(fileType)!==-1){
            iconBig = (<PdfIcon className={classes.iconPdfBig}/>); 
        }else if(mediaType["word"].indexOf(fileType)!==-1){
            iconBig = (<FileWordBox className={classes.iconWordBig}/>); 
        }else if(mediaType["ppt"].indexOf(fileType)!==-1){
            iconBig = (<FilePowerpointBox className={classes.iconPptBig}/>); 
        }else if(mediaType["excel"].indexOf(fileType)!==-1){
            iconBig = (<FileExcelBox className={classes.iconExcelBig}/>);  
        }else if(mediaType["text"].indexOf(fileType)!==-1){
            iconBig = (<ScriptText className={classes.iconTextBig}/>);  
        }else if(mediaType["torrent"].indexOf(fileType)!==-1){
            iconBig = (<MagnetOn className={classes.iconTorrentBig}/>);  
        }else if(mediaType["zip"].indexOf(fileType)!==-1){
            iconBig = (<ZipBox className={classes.iconZipBig}/>);  
        }else if(mediaType["excute"].indexOf(fileType)!==-1){
            iconBig = (<WindowRestore className={classes.iconExeBig}/>);  
        }else if(mediaType["android"].indexOf(fileType)!==-1){
            iconBig = (<Android className={classes.iconAndroidBig}/>);  
        }else{
            iconBig = (<FileShowIcon className={classes.iconTextBig}/>);  
        }
        return iconBig;
}

class DownloadCompoment extends Component {

    page=0;

    state={
        downloading:[],
        loading:false,
        finishedList:[],
        continue:true,
    }

    componentDidMount = ()=>{
        this.loadDownloading();
    }

    loadDownloading = ()=>{
        this.setState({
            loading:true,
        });
        axios.get('/RemoteDownload/FlushUser').then( (response)=> {
            axios.post('/RemoteDownload/ListDownloading').then((response)=> {
                this.setState({
                    downloading:response.data,
                    loading:false,
                });
                
            })
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right","加载失败","error");
            this.setState({
                loading:false,
            });
        });
    }

    loadMore = ()=>{
        this.setState({
            loading:true,
        });
        axios.get('/RemoteDownload/ListFinished?page='+(++this.page)).then( (response)=> {
                this.setState({
                    finishedList:response.data,
                    loading:false,
                    continue:response.data.length<10?false:true,
                });
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right","加载失败","error");
            this.setState({
                loading:false,
            });
        });
    }

    cancelDownload = id=>{
        axios.post('/RemoteDownload/Cancel',{
            id:id,
        }).then( (response)=> {
            if(response.data.error!==0){
                this.props.toggleSnackbar("top","right",response.message,"error");
            }else{
                this.setState({
                    downloading:this.state.downloading.filter(value=>{
                        return value.id!==id;
                    })
                });
                this.props.toggleSnackbar("top","right","取消成功","success");
            }
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message,"error");
        });
    }

    render() {
        const { classes } = this.props;
      

        return (
             <div className={classes.layout}>
                <Typography color="textSecondary" variant="h4" className={classes.title}>进行中
                    <IconButton disabled={this.state.loading} onClick={this.loadDownloading}><RefreshIcon/></IconButton>
                </Typography>
                {this.state.downloading.map(value=>{
                    value.percent = !value.hasOwnProperty("completedLength")?0:(value.completedLength/value.totalLength)
                    return (
                    <Card className={classes.card} key={value.id}>
                    <div className={classes.iconContainer}>
                        {getIcon(classes,value.fileName)}
                    </div>
                    <CardContent className={classes.content}>
                        <Typography color="primary" variant="h6" noWrap>
                            {value.fileName}
                        </Typography>
                        <LinearProgress color="secondary" variant="determinate" value={value.percent*100} />
                        <Typography variant="subtitle1" color="textSecondary" noWrap >
                            {value.hasOwnProperty("completedLength")&&
                                <span>{(value.percent*100).toFixed(2)}% - {value.completedLength==="0"?"0Bytes":sizeToString(value.completedLength)}/{value.totalLength==="0"?"0Bytes":sizeToString(value.totalLength)} - {value.downloadSpeed==="0"?"0B/s":sizeToString(value.downloadSpeed)+"/s"}</span>
                            }
                            {!value.hasOwnProperty("completedLength")&&
                            <span> - </span>
                            }
                        </Typography>
                    </CardContent>
                    <CardContent className={classes.contentSide} onClick={()=>this.cancelDownload(value.id)}>
                            <IconButton><DeleteIcon/></IconButton>
                    </CardContent>
                    </Card>
                )
                })}
                <Typography color="textSecondary" variant="h4" className={classes.title}>已完成</Typography>
                <div className={classes.loadMore}>
                {this.state.finishedList.map(value=>{

                    return (
                    <Card className={classes.card} key={value.id}>
                    {(JSON.stringify(value.fileName) !== '[]')&&
                    <div className={classes.iconContainer}>
                        {getIcon(classes,value.fileName)}
                    </div>}
                    
                    <CardContent className={classes.content}>
                        <Typography color="primary" variant="h6" style={{    textAlign: "left"}} noWrap>
                            {value.fileName}
                        </Typography>
                        <Typography variant="subtitle1" color="textSecondary" noWrap style={{    textAlign: "left"}}>
                            {(()=>{switch (value.status) {
                                case "canceled":
                                    return (<div>已取消</div>);
                                case "error":
                                    return (<div>错误：{value.msg}</div>);
                                case "success":
                                    return (<div>成功</div>);
                                default:
                                    break;
                            }
                            })()}
                        </Typography>
                    </CardContent>
                    </Card>
                )
                })}
                    <Button size="large" 
                    className={classes.margin} 
                    disabled={!this.state.continue}
                    onClick={this.loadMore}
                    >
                        加载更多
                    </Button>
                    </div>
            </div>
        );
    }

}

const Download = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(DownloadCompoment))

export default Download
