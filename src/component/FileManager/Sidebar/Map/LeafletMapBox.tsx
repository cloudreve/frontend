import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Box, useTheme } from "@mui/material";
import { MapLoaderProps } from "./MapLoader.tsx";
import { useMemo } from "react";

/*
   Majority users of Cloudreve in China prefer not to include Ukraine flag. Feel free to remove it if you want to display it.
 */
const includeUkraineFlag = false;
const FlagRemoval = () => {
  const map = useMap();
  if (!includeUkraineFlag) {
    map.attributionControl.setPrefix(
      '<a href="https://leafletjs.com" target="_blank" title="A JavaScript library for interactive maps">Leaflet</a>',
    );
  }
  return null;
};

const LeafletMapBox = ({
  center,
  height,
  mapProvider,
  googleTileType,
  sx,
  ...rest
}: MapLoaderProps) => {
  const theme = useTheme();
  const googleTileUrl = useMemo(() => {
    switch (googleTileType) {
      case "terrain":
        return "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";
      case "satellite":
        return "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}";
      default:
        return "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    }
  }, [googleTileType]);
  return (
    <Box
      sx={{
        width: "100%",
        height: height,
        borderRadius: theme.shape.borderRadius / 8,
        ...sx,
      }}
      {...rest}
    >
      <MapContainer
        key={center[0] + " " + center[1]}
        style={{ height: "100%", borderRadius: theme.shape.borderRadius }}
        center={center}
        zoom={13}
      >
        <FlagRemoval />
        {/* OPEN STREEN MAPS TILES */}
        {mapProvider == "openstreetmap" && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {/* GOOGLE MAPS TILES */}
        {mapProvider == "google" && (
          <TileLayer
            attribution="Google Maps"
            url={googleTileUrl}
            maxZoom={20}
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        )}
        <Marker position={center}></Marker>
      </MapContainer>
    </Box>
  );
};

export default LeafletMapBox;
