import React from "react";
import { IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

const WidgetSaveButton = ({ unsaved, onSave }) => {
    if (!unsaved) return null;
    return (
        <IconButton
            onClick={(e) => { e.stopPropagation(); onSave(); }}
            sx={{
                position: "absolute",
                top: -10, right: -10,
                backgroundColor: "#4caf50",
                color: "#fff",
                width: 26, height: 26,
                "&:hover": { backgroundColor: "#388e3c" },
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 100,
            }}
            size="small"
        >
            <UploadIcon sx={{ fontSize: "16px" }} />
        </IconButton>
    );
};

export default WidgetSaveButton;
