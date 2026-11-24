import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Paper,
    Stack
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function PackingInstructionDialog(props) {
    return (
        <Dialog
            open={props.open}
            onClose={() => props.setOpen(false)}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle
                sx={{
                    backgroundColor: "#133c81",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "18px",
                }}
            >
                Packing Instruction Upload
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Upload Excel Mapping File and Packing Instruction Folder.
                </Typography>

                {/* Excel Upload */}

                <Paper
                    elevation={1}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                    >
                        <DescriptionIcon color="primary" />

                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            Excel Mapping File
                        </Typography>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                    >
                        Select Excel

                        <input
                            hidden
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file) {
                                    props.setPackingExcel(file);
                                }
                            }}
                        />
                    </Button>

                    {props.packingExcel && (
                        <Box mt={2}>
                            <Typography
                                color="success.main"
                                fontWeight={600}
                            >
                                ✓ {props.packingExcel.name}
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Folder Upload */}

                <Paper
                    elevation={1}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={2}
                    >
                        <FolderZipIcon color="primary" />

                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            Packing Instruction Files
                        </Typography>
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<FolderZipIcon />}
                    >
                        Select Folder

                        <input
                            hidden
                            multiple
                            type="file"
                            webkitdirectory=""
                            onChange={(e) => {
                                props.setPackingFiles(
                                    Array.from(e.target.files)
                                );
                            }}
                        />
                    </Button>

                    {props.packingFiles?.length > 0 && (
                        <Box mt={2}>
                            <Typography
                                color="success.main"
                                fontWeight={600}
                            >
                                ✓ {props.packingFiles.length} Files Selected
                            </Typography>
                        </Box>
                    )}
                </Paper>

            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    variant="outlined"
                    onClick={() => props.setOpen(false)}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={props.handleUpload}
                    disabled={
                        !props.packingExcel ||
                        props.packingFiles?.length === 0
                    }
                    sx={{
                        minWidth: 220,
                        fontWeight: 600,
                    }}
                >
                    Upload Packing Instructions
                </Button>
            </DialogActions>
        </Dialog>
    );
}