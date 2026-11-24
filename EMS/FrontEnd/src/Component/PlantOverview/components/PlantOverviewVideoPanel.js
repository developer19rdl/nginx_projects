import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { GetCompanyDetails } from "../../../Services/NodeJsApiServices";
import { buildImageUrl } from "../../ScadaView/utils/markerUtils";

// "Awards & Plant Highlights Videos" panel — sits below the (shrunk) floor
// image on Plant Overview's home screen (see ScadaTabPanel's `belowImage`
// prop). Plays whatever video was uploaded once, company-wide, via
// Configuration → UPLOAD VIDEO (UploadVideo.js) — same GET /companyDetails
// the logo already uses, just reading the new `companyVideo` column.
// Autoplay requires muted (browser policy); a company intro/awards reel is
// meant to loop as ambient/always-showing content, so loop is on too — the
// native controls still let a viewer unmute or pause.
const PlantOverviewVideoPanel = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        GetCompanyDetails(
            (res) => {
                const path = res?.data?.companyVideo;
                setVideoUrl(path ? buildImageUrl(path) : null);
                setLoading(false);
            },
            () => setLoading(false)
        );
    }, []);

    return (
        <Box sx={{
            height: "100%", display: "flex", flexDirection: "column",
            background: "#3a1440", color: "#fff",
        }}>
            <Typography sx={{
                px: 1.5, py: 0.75, fontWeight: 700, fontSize: "0.8rem",
                borderBottom: "1px solid rgba(255,255,255,0.25)",
                textDecoration: "underline", textUnderlineOffset: "3px",
            }}>
                Awards &amp; Plant Highlights Videos :
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", p: videoUrl ? 0 : 1.5 }}>
                {videoUrl ? (
                    <video
                        key={videoUrl}
                        src={videoUrl}
                        autoPlay muted loop playsInline controls
                        style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
                    />
                ) : (
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                        {loading ? "Loading…" : "No video uploaded yet — add one from Configuration → UPLOAD VIDEO."}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default PlantOverviewVideoPanel;
