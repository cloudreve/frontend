import { useEffect, useRef } from "react";
import { useAppSelector } from "../../../redux/hooks.ts";
import { CaptchaParams } from "./Captcha.tsx";
import { Box } from "@mui/material";

export interface CapProps {
  onStateChange: (state: CaptchaParams) => void;
  generation: number;
}

const CapCaptcha = ({ onStateChange, generation, ...rest }: CapProps) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);
  const onStateChangeRef = useRef(onStateChange);
  const scriptLoadedRef = useRef(false);
  
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
      
      widgetRef.current = widget;
    }
  };

  const refreshCaptcha = () => {
    createWidget();
  };

  useEffect(() => {
    if (generation > 0) {
      refreshCaptcha();
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
      // Clean up widget but keep script for reuse
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
    <Box sx={{ textAlign: "center" }}>
      <div ref={captchaRef} {...rest} />
    </Box>
  );
};

export default CapCaptcha; 