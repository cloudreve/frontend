import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import {
    toggleSnackbar,
} from "../../actions/index"
import axios from 'axios'
import { connect } from 'react-redux'
import {editSuffix} from "../../config"
const styles = theme => ({
    layout: {
        width: 'auto',
        marginTop:'30px',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
          width: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
      },
})
const mapStateToProps = state => {
    return {
        save:state.explorer.fileSave,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        toggleSnackbar:(vertical,horizontal,msg,color)=>{
            dispatch(toggleSnackbar(vertical,horizontal,msg,color))
        },
    }
}
const codeSuffix = {
    "html":"text/html",
    "sql":"text/html",
    "go":"go",
    "py":"python",
    "js":"javascript",
    "json":"text/json",
    "c":"clike",
    "cpp":"clike",
    "css":"css",
    "txt":"text/html"
};
class MarkdownViewerCompoment extends Component {

    state = {
        val:"",
    }

    componentWillReceiveProps = (nextProps)=>{
        if(this.props.save!==nextProps.save){
            this.save();
        }
    }

    save = ()=>{
        axios.post("/File/Edit",{
            item:window.fileInfo.path,
            content:window.document.getElementById("val").value,
        })
        .then( (response)=> {
            if(!response.data.result.success){
                this.props.toggleSnackbar("top","right",response.data.result.error ,"error");
            }else{
                this.props.toggleSnackbar("top","right","文件已保存" ,"success");
            }
            
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
    }

    componentDidMount = ()=>{
        let suffix = window.fileInfo.name.split(".").pop().toLowerCase();
        if(suffix === "md"){
            // eslint-disable-next-line
            var editor = window.editormd("editormd", {
                path : "/static/js/mdeditor/lib/",
                height: 740,
                tex : true,
                toolbarIcons : function() {
                    return  [
                        "undo", "redo", "|", 
                        "bold", "del", "italic", "quote", "|", 
                        "h1", "h2", "h3", "h4", "h5", "h6", "|", 
                        "list-ul", "list-ol", "hr", "|",
                        "link", "reference-link", "image", "code", "preformatted-text", "code-block", "table", "datetime", "html-entities", "pagebreak", "|",
                        "goto-line", "watch", "clear", "search", "|",
                        "help", "info"
                    ]; 
                },
            });
        }else if(editSuffix.indexOf(suffix)!==-1){
            // eslint-disable-next-line
            var editor = window.editormd("editormd", {
                path : "/static/js/mdeditor/lib/",
                height: 740,
                watch            : false,
                toolbar          : false,
                codeFold         : true,
                searchReplace    : true,
                placeholder      : "Enjoy coding!",
                mode:codeSuffix[suffix],
            });
        }

        axios.get(window.fileInfo.url)
        .then( (response)=> {
            if(response.data.result.hasOwnProperty("success")){
                this.props.toggleSnackbar("top","right",response.data.result.error ,"error");
            }else{
                this.setState({
                    val:response.data.result,
                });
            }
            
        })
        .catch((error) =>{
            this.props.toggleSnackbar("top","right",error.message ,"error");
        });
    }



    handleChange(event) {
        this.setState({val: event.target.value});
    }

    render() {
        const { classes } = this.props;
        return (
             <div className={classes.layout}>
                <Paper className={classes.root} elevation={1}>
                <div id="editormd">
                    <textarea 
                    id="val"
                    value={this.state.val}
                    onChange={this.handleChange}
                    ></textarea>
                </div>
                
                </Paper>
             </div>
        );
    }

}

const MarkdownViewer = connect(
    mapStateToProps,
    mapDispatchToProps
)( withStyles(styles)(MarkdownViewerCompoment))
  
export default MarkdownViewer