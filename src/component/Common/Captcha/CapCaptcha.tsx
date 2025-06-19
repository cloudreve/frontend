import React, { useEffect, useRef } from "react";
import { useAppSelector } from "../../../redux/hooks.ts";
import { CaptchaParams } from "./Captcha.tsx";
import { Box, useTheme } from "@mui/material";

export interface CapProps {
  onStateChange: (state: CaptchaParams) => void;
  generation: number;
}

// Standard input height
const STANDARD_INPUT_HEIGHT = "56px";

const CapCaptcha = ({ onStateChange, generation, fullWidth, ...rest }: CapProps & { fullWidth?: boolean }) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const onStateChangeRef = useRef(onStateChange);
  const scriptLoadedRef = useRef(false);
  const theme = useTheme();
  
  const capInstanceURL = useAppSelector(
    (state) => state.siteConfig.basic.config.captcha_cap_instance_url,
  );
  const capKeyID = useAppSelector(
    (state) => state.siteConfig.basic.config.captcha_cap_key_id,
  );
  
  // Keep callback reference up to date
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  // Apply responsive styles for fullWidth mode
  const applyFullWidthStyles = (widget: HTMLElement) => {
    const applyStyles = () => {
      // Style widget container
      widget.style.width = '100%';
      widget.style.display = 'block';
      widget.style.boxSizing = 'border-box';
      
      // Style internal captcha element
      const captchaElement = widget.shadowRoot?.querySelector('.captcha') || widget.querySelector('.captcha');
      if (captchaElement) {
        const captchaEl = captchaElement as HTMLElement;
        captchaEl.style.width = '100%';
        captchaEl.style.maxWidth = 'none';
        captchaEl.style.minWidth = '0';
        captchaEl.style.boxSizing = 'border-box';
        return true;
      }
      return false;
    };

    // Apply immediately or wait for DOM changes
    if (!applyStyles()) {
      const observer = new MutationObserver(() => {
        if (applyStyles()) {
          observer.disconnect();
        }
      });
      
      observer.observe(widget, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Fallback timeout
      setTimeout(() => {
        applyStyles();
        observer.disconnect();
      }, 500);
    }
  };

  const createWidget = () => {
    if (!captchaRef.current || !capInstanceURL || !capKeyID) {
      return;
    }

    // Clean up existing widget
    if (widgetRef.current) {
      widgetRef.current.remove?.();
      widgetRef.current = null;
    }
    
    // Clear container
    captchaRef.current.innerHTML = "";
    
    if (typeof window !== "undefined" && (window as any).Cap) {
      const widget = document.createElement("cap-widget");
      widget.setAttribute("data-cap-api-endpoint", `${capInstanceURL.replace(/\/$/, "")}/${capKeyID}/api/`);
      widget.id = "cap-widget";
      
      captchaRef.current.appendChild(widget);
      
      widget.addEventListener("solve", (e: any) => {
        const token = e.detail.token;
        if (token) {
          onStateChangeRef.current({ ticket: token });
        }
      });
      
      // Apply fullWidth styles if needed
      if (fullWidth) {
        applyFullWidthStyles(widget);
      }
      
      widgetRef.current = widget;
    }
  };

  useEffect(() => {
    if (generation > 0) {
      createWidget();
    }
  }, [generation]);

  useEffect(() => {
    if (!capInstanceURL || !capKeyID) {
      return;
    }

    const scriptId = "cap-widget-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    const initWidget = () => {
      scriptLoadedRef.current = true;
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        createWidget();
      }, 100);
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `${capInstanceURL.replace(/\/$/, "")}/assets/widget.js`;
      script.async = true;
      script.onload = initWidget;
      script.onerror = () => {
        console.error("Failed to load Cap widget script");
      };
      document.head.appendChild(script);
    } else if (scriptLoadedRef.current || (window as any).Cap) {
      // Script already loaded
      initWidget();
    } else {
      // Script exists but not loaded yet
      script.onload = initWidget;
    }

    return () => {
      // Cleanup widget (keep script for reuse)
      if (widgetRef.current) {
        widgetRef.current.remove?.();
        widgetRef.current = null;
      }
      if (captchaRef.current) {
        captchaRef.current.innerHTML = "";
      }
    };
  }, [capInstanceURL, capKeyID]);

  if (!capInstanceURL || !capKeyID) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        // Container full width when needed
        ...(fullWidth && { width: "100%" }),
        
        // CSS variables for Cloudreve theme adaptation
        "& cap-widget": {
          "--cap-border-radius": `${theme.shape.borderRadius}px`,
          "--cap-background": theme.palette.background.paper,
          "--cap-border-color": theme.palette.divider,
          "--cap-color": theme.palette.text.primary,
          "--cap-widget-height": fullWidth ? STANDARD_INPUT_HEIGHT : "auto",
          "--cap-widget-padding": "16px",
          "--cap-gap": "12px",
          "--cap-checkbox-size": "20px",
          "--cap-checkbox-border-radius": "4px",
          "--cap-checkbox-background": theme.palette.action.hover,
          "--cap-checkbox-border": `1px solid ${theme.palette.divider}`,
          "--cap-font": String(theme.typography.fontFamily || "Roboto, sans-serif"),
          "--cap-spinner-color": theme.palette.primary.main,
          "--cap-spinner-background-color": theme.palette.action.hover,
          "--cap-credits-font-size": String(theme.typography.caption.fontSize || "12px"),
          "--cap-opacity-hover": "0.7",
        } as React.CSSProperties,
      }}
    >
      <div ref={captchaRef} {...rest} />
    </Box>
  );
};

export default CapCaptcha;