import React from "react"
import Container from '@material-ui/core/Container'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useSelector } from "react-redux"
import { makeStyles } from "@material-ui/core"
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: 'url("/static/img/index.jpg")',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignContent: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    '& .MuiTypography-root': {
      color: '#ffffff'
    }
  },
  navbar: {
    position: 'fixed',
    top: 0,
    right: 0,
    left: 0,
    padding: theme.spacing(6),
  },
  content: {
    textAlign: 'center',
    '& hr': {
      color: '#ffffff',
      width: '60vw'
    },
    '& .MuiContainer-root': {
      margin: theme.spacing(2),
    }
  },
  linkButton: {
    padding: '.85rem 2.13rem',
    borderRadius: '30px',
    margin: theme.spacing(1)
  }
}))

export default function Home() {
  const classes = useStyles();

  const history = useHistory();

  const title = useSelector(state => state.siteConfig.title);

  const login = () => {
    history.push("/login")
  }

  const signup = () => {
    history.push("/signup")
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <div className={classes.root}>
        <Container className={classes.navbar}>
          <Typography variant="h4" >{title}</Typography>
        </Container>
        <Container className={classes.content}>
          <Typography variant="h2" >开始云上之旅</Typography>
          <hr />
          <Typography variant="h5" >只需十秒钟，注册后即可开始使用免费高速的云存储服务</Typography>
          <Container>
            <Button variant="contained" color="primary" className={classes.linkButton} onClick={login}>
              登录
            </Button>
            <Button variant="contained" color="primary" className={classes.linkButton} onClick={signup}>
              注册
            </Button>
          </Container>

        </Container>
      </div>
    </React.Fragment>
  )
}

