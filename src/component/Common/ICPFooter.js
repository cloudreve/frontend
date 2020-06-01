import { Link, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import pageHelper from '../../utils/page';

const useStyles = makeStyles(() => ({
  icp: {
    padding: '8px 24px',
    textAlign: 'center',
    width: '100vw',
    position: 'absolute',
    bottom: 0,
    
  }
}))

export const ICPFooter = () => {
  const siteICPId = useSelector(state => state.siteConfig.siteICPId);
  const classes = useStyles()
  const theme = useTheme()
  const matchMediaQuery = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const [show, setShow] = useState(true)

  useEffect(() => {
    // 只在分享和登录界面显示
    const isSharePage = pageHelper.isSharePage(location.pathname)
    const isLoginPage = pageHelper.isLoginPage(location.pathname)
    setShow(siteICPId && !matchMediaQuery && (isSharePage || isLoginPage))
  }, [siteICPId, matchMediaQuery, location]);

  if (!show) {
    return (<></>)
  }
  return (
    <div className={classes.icp}>
      {`备案号: `}
      <Link 
        href="http://www.beian.gov.cn/portal/registerSystemInfo"
        rel="noopener noreferrer"
        target="_blank"
      >
        {siteICPId}
      </Link>
    </div>
  )
}
