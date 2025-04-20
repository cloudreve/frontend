import { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import { Box, BoxProps } from "@mui/material";
import "./artplayer.css";
import artplayerPluginChapter from "artplayer-plugin-chapter";

export interface PlayerProps extends BoxProps {
  option: any;
  getInstance?: (instance: Artplayer) => void;
  chapters?: any;
}

export default function Player({
  option,
  chapters,
  getInstance,
  ...rest
}: PlayerProps) {
  const artRef = useRef<Artplayer>();

  useEffect(() => {
    const opts = {
      ...option,
      plugins: [...option.plugins],
      container: artRef.current,
    };

    if (chapters) {
      opts.plugins.push(artplayerPluginChapter({ chapters }));
    }
    const art = new Artplayer(opts);

    if (getInstance && typeof getInstance === "function") {
      getInstance(art);
    }

    return () => {
      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, []);

  return <Box ref={artRef} {...rest}></Box>;
}
