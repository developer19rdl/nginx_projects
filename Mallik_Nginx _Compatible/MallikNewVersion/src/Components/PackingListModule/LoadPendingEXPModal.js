// import React, { useState, useEffect, useCallback } from "react";
// import {
//     Button,
//     CircularProgress,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     IconButton,
//     Tooltip,
//     Typography,
//     Chip,
//     Box,
//     TextField,
//     InputAdornment,
//     Autocomplete,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import SearchIcon from "@mui/icons-material/Search";
// import ChecklistIcon from "@mui/icons-material/Checklist";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import { PackingListLoadPending } from "../../ApiService/LoginPageService";
// import "../PurchaseOrderGeneration/PurchaseOrder.css";
// import * as XLSX from "xlsx";
// import { saveAs } from "file-saver";

// // ─────────────────────────────────────────────────────────────────────────────
// // Column definitions – keyed to actual API response field names
// // ─────────────────────────────────────────────────────────────────────────────
// const COLUMNS = [
//     { key: "cCode", label: "Cust Code" },
//     { key: "cName", label: "Cust Name" },
//     { key: "invNo", label: "EXP No" },
//     { key: "date", label: "EXP Date" },
//     { key: "itemCode", label: "Item Code" },
//     { key: "itemName", label: "Item Name" },
//     { key: "itemLedger", label: "Item Group" },
//     { key: "uom", label: "UOM" },
//     { key: "expQty", label: "EXP Qty", numeric: true },
//     { key: "cumQty", label: "PL Cum Qty", numeric: true },
//     { key: "pendQty", label: "Pend Qty", numeric: true },
//     { key: "perPartWeight", label: "Conv Fact", numeric: true },
//     { key: "plQty", label: "QOH", numeric: true },
//     { key: "netWeight", label: "Net Weight", numeric: true },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // Stable row key using unique item + invoice identifiers
// // ─────────────────────────────────────────────────────────────────────────────
// const rowKey = (row) =>
//     `${row.expInvId ?? ""}_${row.expInvItemId ?? ""}_${row.id ?? ""}_${row.itemCode ?? ""}`;

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Component
// // ─────────────────────────────────────────────────────────────────────────────
// const LoadPendingEXPModal = ({
//     open,
//     onClose,
//     customerId,
//     onConfirm,
// }) => {
//     const [loading, setLoading] = useState(false);
//     const [pendingRows, setPendingRows] = useState([]);
//     const [selectedKeys, setSelectedKeys] = useState(new Set());
//     const [allocatedRows, setAllocatedRows] = useState([]);
//     const [search, setSearch] = useState("");
//     const [searchPartNo, setSearchPartNo] = useState(null);

//     const uniqueParts = React.useMemo(() => {
//         const partsMap = new Map();
//         pendingRows.forEach(row => {
//             if (row.itemCode && !partsMap.has(row.itemCode)) {
//                 partsMap.set(row.itemCode, `${row.itemCode} - ${row.itemName || ""}`);
//             }
//         });
//         return Array.from(partsMap.entries()).map(([code, label]) => ({ id: code, label }));
//     }, [pendingRows]);

//     // ── Fetch on open ────────────────────────────────────────────────────────
//     useEffect(() => {
//         if (!open) return;
//         setLoading(true);
//         setSelectedKeys(new Set());
//         setAllocatedRows([]);
//         setSearch("");
//         PackingListLoadPending(
//             { id: customerId },
//             (dataObj) => {
//                 setPendingRows(dataObj?.data || []);
//                 setLoading(false);
//             },
//             () => {
//                 setPendingRows([]);
//                 setLoading(false);
//             }
//         );
//     }, [open, customerId]);

//     // ── Search filter ────────────────────────────────────────────────────────
//     const filteredRows = pendingRows.filter((row) => {
//         if (searchPartNo && row.itemCode !== searchPartNo.id) return false;

//         if (!search.trim()) return true;
//         const q = search.toLowerCase();
//         return (
//             String(row.cCode ?? "").toLowerCase().includes(q) ||
//             String(row.cName ?? "").toLowerCase().includes(q) ||
//             String(row.invNo ?? "").toLowerCase().includes(q) ||
//             String(row.itemCode ?? "").toLowerCase().includes(q) ||
//             String(row.itemName ?? "").toLowerCase().includes(q)
//         );
//     });

//     // ── Row click – toggle selection ─────────────────────────────────────────
//     const handleRowClick = useCallback((row) => {
//         const key = rowKey(row);
//         setSelectedKeys((prev) => {
//             const next = new Set(prev);
//             next.has(key) ? next.delete(key) : next.add(key);
//             return next;
//         });
//     }, []);

//     // ── "Select All in EXP" – selects all rows sharing the same invNo(s) ────
//     const handleSelectAllInEXP = useCallback(() => {
//         const targetInvNos =
//             selectedKeys.size === 0
//                 ? [...new Set(filteredRows.map((r) => r.invNo))]
//                 : [...new Set(
//                     filteredRows
//                         .filter((r) => selectedKeys.has(rowKey(r)))
//                         .map((r) => r.invNo)
//                 )];

//         setSelectedKeys((prev) => {
//             const next = new Set(prev);
//             filteredRows.forEach((r) => {
//                 if (targetInvNos.includes(r.invNo)) next.add(rowKey(r));
//             });
//             return next;
//         });
//     }, [filteredRows, selectedKeys]);

//     // ── Allocate selected to bottom table ────────────────────────────────────
//     const handleAllocate = useCallback(() => {
//         const toAdd = filteredRows.filter(
//             (r) =>
//                 selectedKeys.has(rowKey(r)) &&
//                 !allocatedRows.some((a) => rowKey(a) === rowKey(r))
//         );
//         setAllocatedRows((prev) => [...prev, ...toAdd]);
//         setSelectedKeys(new Set());
//     }, [filteredRows, selectedKeys, allocatedRows]);

//     // ── Remove from bottom table ─────────────────────────────────────────────
//     const handleRemoveAllocated = useCallback((key) => {
//         setAllocatedRows((prev) => prev.filter((r) => rowKey(r) !== key));
//     }, []);

//     // ── Excel export ─────────────────────────────────────────────────────────
//     const handleExcelExport = () => {
//         const exportData = filteredRows.map((row) => {
//             const obj = {};
//             COLUMNS.forEach((col) => { obj[col.label] = row[col.key] ?? ""; });
//             return obj;
//         });
//         const ws = XLSX.utils.json_to_sheet(exportData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Pending EXP");
//         const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//         saveAs(new Blob([buf], { type: "application/octet-stream" }), "PendingEXP.xlsx");
//     };

//     // ── Confirm → pass rows up to parent ────────────────────────────────────
//     const handleConfirm = () => {
//         if (onConfirm) onConfirm(allocatedRows);
//         onClose();
//     };

//     const selectedCount = selectedKeys.size;
//     const allocatedCount = allocatedRows.length;

//     // ─────────────────────────────────────────────────────────────────────────
//     // Render
//     // ─────────────────────────────────────────────────────────────────────────
//     return (
//         <Dialog
//             open={open}
//             onClose={onClose}
//             maxWidth={false}
//             PaperProps={{
//                 style: {
//                     width: "97vw",
//                     maxWidth: "1700px",
//                     borderRadius: "10px",
//                     background: "#f4f6fb",
//                     boxShadow: "0 8px 40px rgba(0,45,104,0.18)",
//                 },
//             }}
//         >
//             {/* ── Header ─────────────────────────────────────────────────── */}
//             <DialogTitle
//                 style={{
//                     background: "#002D68",
//                     color: "#fff",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "space-between",
//                     padding: "10px 18px",
//                     borderRadius: "10px 10px 0 0",
//                     minHeight: 48,
//                 }}
//             >
//                 <Box display="flex" alignItems="center" gap={1}>
//                     <ChecklistIcon style={{ fontSize: 22 }} />
//                     <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: "0.95rem" }}>
//                         Select Pending Export Invoice
//                     </Typography>
//                 </Box>
//                 <IconButton onClick={onClose} size="small" style={{ color: "#fff" }}>
//                     <CloseIcon fontSize="small" />
//                 </IconButton>
//             </DialogTitle>

//             <DialogContent style={{ padding: "12px 16px 8px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>

//                 {/* ── Search ──────────────────────────────────────────────── */}
//                 <Box display="flex" gap={2}>
//                     <TextField
//                         size="small"
//                         placeholder="Search by Cust Code / Cust Name / EXP No / Item Code / Item Name …"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         fullWidth
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon style={{ color: "#002D68", fontSize: 18 }} />
//                                 </InputAdornment>
//                             ),
//                             style: { fontSize: 12 },
//                         }}
//                         style={{ background: "#fff", borderRadius: 5, flex: 2 }}
//                     />
//                     <Autocomplete
//                         size="small"
//                         options={uniqueParts}
//                         getOptionLabel={(option) => option.label || ""}
//                         value={searchPartNo}
//                         onChange={(event, newValue) => setSearchPartNo(newValue)}
//                         style={{ background: "#fff", borderRadius: 5, flex: 1 }}
//                         renderInput={(params) => (
//                             <TextField
//                                 {...params}
//                                 placeholder="Filter by Part No"
//                                 InputProps={{ ...params.InputProps, style: { fontSize: 12 } }}
//                             />
//                         )}
//                     />
//                 </Box>

//                 {/* ── TOP TABLE – Pending EXP Items ──────────────────────── */}
//                 <Box>
//                     <Box display="flex" alignItems="center" gap={1} mb={0.5}>
//                         <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: 12, color: "#002D68" }}>
//                             Pending Export Invoice Items
//                         </Typography>
//                         {!loading && (
//                             <Chip
//                                 label={`${filteredRows.length} rows`}
//                                 size="small"
//                                 style={{ background: "#dbe7ff", fontWeight: 600, fontSize: 10, height: 18 }}
//                             />
//                         )}
//                     </Box>

//                     <div style={{ maxHeight: "36vh", overflowY: "auto", overflowX: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
//                         {loading ? (
//                             <Box display="flex" alignItems="center" justifyContent="center" py={5}>
//                                 <CircularProgress size={24} style={{ color: "#002D68" }} />
//                                 <Typography ml={1.5} style={{ fontSize: 12, color: "#002D68", fontWeight: 600 }}>
//                                     Loading pending items…
//                                 </Typography>
//                             </Box>
//                         ) : (
//                             <table id="transactionTable" style={{ margin: 0 }}>
//                                 <thead>
//                                     <tr>
//                                         <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6" }}>#</th>
//                                         {COLUMNS.map((col) => (
//                                             <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", whiteSpace: "nowrap" }}>
//                                                 {col.label}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.length === 0 ? (
//                                         <tr>
//                                             <td colSpan={COLUMNS.length + 1} style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: 12 }}>
//                                                 No pending export invoice items found for this customer.
//                                             </td>
//                                         </tr>
//                                     ) : (
//                                         filteredRows.map((row, index) => {
//                                             const key = rowKey(row);
//                                             const isSelected = selectedKeys.has(key);
//                                             const isAllocated = allocatedRows.some((a) => rowKey(a) === key);
//                                             return (
//                                                 <tr
//                                                     key={key}
//                                                     onClick={() => !isAllocated && handleRowClick(row)}
//                                                     title={isAllocated ? "Already allocated" : "Click to select / deselect"}
//                                                     style={{
//                                                         height: 40,
//                                                         background: isAllocated
//                                                             ? "#e0e0e0"
//                                                             : isSelected
//                                                                 ? "#ffe066"
//                                                                 : undefined,
//                                                         opacity: isAllocated ? 0.55 : 1,
//                                                         cursor: isAllocated ? "default" : "pointer",
//                                                     }}
//                                                 >
//                                                     <td style={{ textAlign: "center", fontWeight: 600, color: "#444" }}>
//                                                         {index + 1}
//                                                     </td>
//                                                     {COLUMNS.map((col) => (
//                                                         <td
//                                                             key={col.key}
//                                                             style={{
//                                                                 textAlign: col.numeric ? "right" : "left",
//                                                                 whiteSpace: "nowrap",
//                                                             }}
//                                                         >
//                                                             {row[col.key] ?? ""}
//                                                         </td>
//                                                     ))}
//                                                 </tr>
//                                             );
//                                         })
//                                     )}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </Box>

//                 {/* ── ACTION BAR ──────────────────────────────────────────── */}
//                 <Box
//                     display="flex"
//                     alignItems="center"
//                     gap={1.2}
//                     flexWrap="wrap"
//                     style={{
//                         background: "#e8eef8",
//                         border: "1px solid #c8d4e8",
//                         borderRadius: 6,
//                         padding: "6px 12px",
//                     }}
//                 >
//                     <Button
//                         variant="contained"
//                         size="small"
//                         onClick={handleSelectAllInEXP}
//                         disabled={loading || filteredRows.length === 0}
//                         style={{
//                             background: "#002D68",
//                             color: "#fff",
//                             fontFamily: "Arial",
//                             fontSize: 11,
//                             fontWeight: 700,
//                             textTransform: "none",
//                             height: 28,
//                             padding: "0 12px",
//                         }}
//                     >
//                         Select All Items in EXP
//                     </Button>

//                     {/* Excel icon button matching existing project icon style */}
//                     <Tooltip title="Export to Excel">
//                         <IconButton
//                             onClick={handleExcelExport}
//                             disabled={loading || filteredRows.length === 0}
//                             size="small"
//                             style={{
//                                 background: "#217346",
//                                 color: "#fff",
//                                 borderRadius: 4,
//                                 width: 28,
//                                 height: 28,
//                                 fontSize: 14,
//                             }}
//                         >
//                             <span style={{ fontWeight: 900, fontSize: 13, lineHeight: 1 }}>X</span>
//                         </IconButton>
//                     </Tooltip>

//                     <Typography style={{ fontFamily: "Arial", fontSize: 11, fontWeight: 600, color: "#002D68", whiteSpace: "nowrap" }}>
//                         No of Items in selected EXP
//                     </Typography>
//                     <Box
//                         style={{
//                             background: "#fff",
//                             border: "1px solid #93bce6",
//                             borderRadius: 4,
//                             padding: "2px 14px",
//                             fontFamily: "Arial",
//                             fontSize: 13,
//                             fontWeight: 700,
//                             color: "#002D68",
//                             minWidth: 36,
//                             textAlign: "center",
//                         }}
//                     >
//                         {selectedCount}
//                     </Box>

//                     <Box flexGrow={1} />

//                     <Button
//                         variant="contained"
//                         size="small"
//                         onClick={handleAllocate}
//                         disabled={selectedCount === 0}
//                         style={{
//                             background: selectedCount > 0 ? "#005f33" : "#aaa",
//                             color: "#fff",
//                             fontFamily: "Arial",
//                             fontSize: 11,
//                             fontWeight: 700,
//                             textTransform: "none",
//                             height: 28,
//                             padding: "0 14px",
//                         }}
//                     >
//                         ↓ Add to Allocate Table ({selectedCount})
//                     </Button>
//                 </Box>

//                 {/* ── BOTTOM TABLE – Allocated Items ──────────────────────── */}
//                 <Box>
//                     <Box display="flex" alignItems="center" gap={1} mb={0.5}>
//                         <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: 12, color: "#005f33" }}>
//                             Allocated Items
//                         </Typography>
//                         <Chip
//                             label={`${allocatedCount} items`}
//                             size="small"
//                             style={{ background: "#d4f5e2", color: "#005f33", fontWeight: 600, fontSize: 10, height: 18 }}
//                         />
//                     </Box>

//                     <div style={{ maxHeight: "22vh", overflowY: "auto", overflowX: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
//                         <table id="transactionTable" style={{ margin: 0 }}>
//                             <thead>
//                                 <tr>
//                                     <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6" }}>#</th>
//                                     {COLUMNS.map((col) => (
//                                         <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", whiteSpace: "nowrap" }}>
//                                             {col.label}
//                                         </th>
//                                     ))}
//                                     <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", textAlign: "center" }}>
//                                         Del
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {allocatedRows.length === 0 ? (
//                                     <tr >
//                                         <td
//                                             colSpan={COLUMNS.length + 2}
//                                             style={{ textAlign: "center", padding: "18px", color: "#888", fontSize: 12 }}
//                                         >
//                                             No items allocated yet — select rows above and click "Add to Allocate Table".
//                                         </td>
//                                     </tr>
//                                 ) : (
//                                     allocatedRows.map((row, index) => {
//                                         const key = rowKey(row);
//                                         return (
//                                             <tr key={key} style={{ height: 40 }}>
//                                                 <td style={{ textAlign: "center", fontWeight: 600, color: "#444", padding: "2px 6px" }}>
//                                                     {index + 1}
//                                                 </td>
//                                                 {COLUMNS.map((col) => (
//                                                     <td
//                                                         key={col.key}
//                                                         style={{
//                                                             textAlign: col.numeric ? "right" : "left",
//                                                             whiteSpace: "nowrap",
//                                                             padding: "2px 6px",
//                                                         }}
//                                                     >
//                                                         {row[col.key] ?? ""}
//                                                     </td>
//                                                 ))}
//                                                 <td style={{ textAlign: "center", padding: "0px 4px" }}>
//                                                     <Tooltip title="Remove">
//                                                         <IconButton
//                                                             size="small"
//                                                             onClick={() => handleRemoveAllocated(key)}
//                                                             style={{ color: "#c00", padding: 1 }}
//                                                         >
//                                                             <DeleteOutlineIcon style={{ fontSize: 15 }} />
//                                                         </IconButton>
//                                                     </Tooltip>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </Box>
//             </DialogContent>

//             {/* ── Footer ─────────────────────────────────────────────────── */}
//             <DialogActions
//                 style={{
//                     padding: "8px 16px",
//                     background: "#f4f6fb",
//                     borderTop: "1px solid #d0d7e2",
//                     gap: 8,
//                 }}
//             >
//                 <Typography style={{ flex: 1, fontFamily: "Arial", fontSize: 11, color: "#555" }}>
//                     {allocatedCount > 0
//                         ? `${allocatedCount} item(s) ready to load into Packing List.`
//                         : "Allocate items from the top table, then click Confirm."}
//                 </Typography>

//                 <Button
//                     onClick={onClose}
//                     variant="outlined"
//                     size="small"
//                     style={{
//                         borderColor: "#002D68",
//                         color: "#002D68",
//                         fontFamily: "Arial",
//                         fontSize: 11,
//                         fontWeight: 700,
//                         textTransform: "none",
//                         height: 30,
//                     }}
//                 >
//                     Cancel
//                 </Button>

//                 <Button
//                     onClick={handleConfirm}
//                     variant="contained"
//                     size="small"
//                     disabled={allocatedCount === 0}
//                     style={{
//                         background: allocatedCount > 0 ? "#002D68" : "#aaa",
//                         color: "#fff",
//                         fontFamily: "Arial",
//                         fontSize: 11,
//                         fontWeight: 700,
//                         textTransform: "none",
//                         height: 30,
//                         minWidth: 130,
//                     }}
//                 >
//                     ✔ Confirm &amp; Load ({allocatedCount})
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// export default LoadPendingEXPModal;


import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography,
    Chip,
    Box,
    TextField,
    InputAdornment,
    Autocomplete,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ChecklistIcon from "@mui/icons-material/Checklist";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PackingListLoadPending } from "../../ApiService/LoginPageService";
import "../PurchaseOrderGeneration/PurchaseOrder.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ─────────────────────────────────────────────────────────────────────────────
// Column definitions – keyed to actual API response field names
// ─────────────────────────────────────────────────────────────────────────────
const COLUMNS = [
    { key: "cCode", label: "Cust Code" },
    { key: "cName", label: "Cust Name" },
    { key: "invNo", label: "EXP No" },
    { key: "date", label: "EXP Date" },
    { key: "itemCode", label: "Item Code" },
    { key: "itemName", label: "Item Name" },
    { key: "itemLedger", label: "Item Group" },
    { key: "uom", label: "UOM" },
    { key: "expQty", label: "EXP Qty", numeric: true },
    { key: "cumQty", label: "PL Cum Qty", numeric: true },
    { key: "pendQty", label: "Pend Qty", numeric: true },
    { key: "perPartWeight", label: "Conv Fact", numeric: true },
    { key: "plQty", label: "QOH", numeric: true },
    { key: "netWeight", label: "Net Weight", numeric: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Stable row key using unique item + invoice identifiers
// ─────────────────────────────────────────────────────────────────────────────
const rowKey = (row) =>
    `${row.expInvId ?? ""}_${row.expInvItemId ?? ""}_${row.id ?? ""}_${row.itemCode ?? ""}`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const LoadPendingEXPModal = ({
    open,
    onClose,
    customerId,
    onConfirm,
}) => {
    const [loading, setLoading] = useState(false);
    const [pendingRows, setPendingRows] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState(new Set());
    const [allocatedRows, setAllocatedRows] = useState([]);
    const [search, setSearch] = useState("");
    const [searchPartNo, setSearchPartNo] = useState(null);

    const uniqueParts = React.useMemo(() => {
        const partsMap = new Map();
        pendingRows.forEach(row => {
            if (row.itemCode && !partsMap.has(row.itemCode)) {
                partsMap.set(row.itemCode, `${row.itemCode} - ${row.itemName || ""}`);
            }
        });
        return Array.from(partsMap.entries()).map(([code, label]) => ({ id: code, label }));
    }, [pendingRows]);

    // ── Fetch on open ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setSelectedKeys(new Set());
        setAllocatedRows([]);
        setSearch("");
        PackingListLoadPending(
            { id: customerId },
            (dataObj) => {
                setPendingRows(dataObj?.data || []);
                setLoading(false);
            },
            () => {
                setPendingRows([]);
                setLoading(false);
            }
        );
    }, [open, customerId]);

    // ── Search filter ────────────────────────────────────────────────────────
    const filteredRows = pendingRows.filter((row) => {
        if (searchPartNo && row.itemCode !== searchPartNo.id) return false;

        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            String(row.cCode ?? "").toLowerCase().includes(q) ||
            String(row.cName ?? "").toLowerCase().includes(q) ||
            String(row.invNo ?? "").toLowerCase().includes(q) ||
            String(row.itemCode ?? "").toLowerCase().includes(q) ||
            String(row.itemName ?? "").toLowerCase().includes(q)
        );
    });

    // ── Row click – toggle selection ─────────────────────────────────────────
    const handleRowClick = useCallback((row) => {
        const key = rowKey(row);
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    // ── Part No filter change – also auto-selects/highlights matching rows ──
    const handlePartNoFilterChange = useCallback((event, newValue) => {
        setSearchPartNo(newValue);

        if (newValue) {
            const matchingRows = pendingRows.filter(
                (r) =>
                    r.itemCode === newValue.id &&
                    !allocatedRows.some((a) => rowKey(a) === rowKey(r))
            );
            setSelectedKeys((prev) => {
                const next = new Set(prev);
                matchingRows.forEach((r) => next.add(rowKey(r)));
                return next;
            });
        }
    }, [pendingRows, allocatedRows]);

    // ── "Select All in EXP" – selects all rows sharing the same invNo(s) ────
    const handleSelectAllInEXP = useCallback(() => {
        const targetInvNos =
            selectedKeys.size === 0
                ? [...new Set(filteredRows.map((r) => r.invNo))]
                : [...new Set(
                    filteredRows
                        .filter((r) => selectedKeys.has(rowKey(r)))
                        .map((r) => r.invNo)
                )];

        setSelectedKeys((prev) => {
            const next = new Set(prev);
            filteredRows.forEach((r) => {
                if (targetInvNos.includes(r.invNo)) next.add(rowKey(r));
            });
            return next;
        });
    }, [filteredRows, selectedKeys]);

    // ── Allocate selected to bottom table ────────────────────────────────────
    const handleAllocate = useCallback(() => {
        const toAdd = filteredRows.filter(
            (r) =>
                selectedKeys.has(rowKey(r)) &&
                !allocatedRows.some((a) => rowKey(a) === rowKey(r))
        );
        setAllocatedRows((prev) => [...prev, ...toAdd]);
        setSelectedKeys(new Set());
    }, [filteredRows, selectedKeys, allocatedRows]);

    // ── Remove from bottom table ─────────────────────────────────────────────
    const handleRemoveAllocated = useCallback((key) => {
        setAllocatedRows((prev) => prev.filter((r) => rowKey(r) !== key));
    }, []);

    // ── Excel export ─────────────────────────────────────────────────────────
    const handleExcelExport = () => {
        const exportData = filteredRows.map((row) => {
            const obj = {};
            COLUMNS.forEach((col) => { obj[col.label] = row[col.key] ?? ""; });
            return obj;
        });
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pending EXP");
        const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buf], { type: "application/octet-stream" }), "PendingEXP.xlsx");
    };

    // ── Confirm → pass rows up to parent ────────────────────────────────────
    const handleConfirm = () => {
        if (onConfirm) onConfirm(allocatedRows);
        onClose();
    };

    const selectedCount = selectedKeys.size;
    const allocatedCount = allocatedRows.length;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                style: {
                    width: "97vw",
                    maxWidth: "1700px",
                    borderRadius: "10px",
                    background: "#f4f6fb",
                    boxShadow: "0 8px 40px rgba(0,45,104,0.18)",
                },
            }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <DialogTitle
                style={{
                    background: "#002D68",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 18px",
                    borderRadius: "10px 10px 0 0",
                    minHeight: 48,
                }}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <ChecklistIcon style={{ fontSize: 22 }} />
                    <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: "0.95rem" }}>
                        Select Pending Export Invoice
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" style={{ color: "#fff" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent style={{ padding: "12px 16px 8px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 8 }}>

                {/* ── Search ──────────────────────────────────────────────── */}
                <Box display="flex" gap={2}>
                    <TextField
                        size="small"
                        placeholder="Search by Cust Code / Cust Name / EXP No / Item Code / Item Name …"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon style={{ color: "#002D68", fontSize: 18 }} />
                                </InputAdornment>
                            ),
                            style: { fontSize: 12 },
                        }}
                        style={{ background: "#fff", borderRadius: 5, flex: 2 }}
                    />
                    <Autocomplete
                        size="small"
                        options={uniqueParts}
                        getOptionLabel={(option) => option.label || ""}
                        value={searchPartNo}
                        onChange={handlePartNoFilterChange}
                        style={{ background: "#fff", borderRadius: 5, flex: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Filter by Part No"
                                InputProps={{ ...params.InputProps, style: { fontSize: 12 } }}
                            />
                        )}
                    />
                </Box>

                {/* ── TOP TABLE – Pending EXP Items ──────────────────────── */}
                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: 12, color: "#002D68" }}>
                            Pending Export Invoice Items
                        </Typography>
                        {!loading && (
                            <Chip
                                label={`${filteredRows.length} rows`}
                                size="small"
                                style={{ background: "#dbe7ff", fontWeight: 600, fontSize: 10, height: 18 }}
                            />
                        )}
                    </Box>

                    <div style={{ maxHeight: "36vh", overflowY: "auto", overflowX: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                        {loading ? (
                            <Box display="flex" alignItems="center" justifyContent="center" py={5}>
                                <CircularProgress size={24} style={{ color: "#002D68" }} />
                                <Typography ml={1.5} style={{ fontSize: 12, color: "#002D68", fontWeight: 600 }}>
                                    Loading pending items…
                                </Typography>
                            </Box>
                        ) : (
                            <table id="transactionTable" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6" }}>#</th>
                                        {COLUMNS.map((col) => (
                                            <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", whiteSpace: "nowrap" }}>
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length + 1} style={{ textAlign: "center", padding: "20px", color: "#888", fontSize: 12 }}>
                                                No pending export invoice items found for this customer.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRows.map((row, index) => {
                                            const key = rowKey(row);
                                            const isSelected = selectedKeys.has(key);
                                            const isAllocated = allocatedRows.some((a) => rowKey(a) === key);
                                            return (
                                                <tr
                                                    key={key}
                                                    onClick={() => !isAllocated && handleRowClick(row)}
                                                    title={isAllocated ? "Already allocated" : "Click to select / deselect"}
                                                    style={{
                                                        height: 40,
                                                        background: isAllocated
                                                            ? "#e0e0e0"
                                                            : isSelected
                                                                ? "#ffe066"
                                                                : undefined,
                                                        opacity: isAllocated ? 0.55 : 1,
                                                        cursor: isAllocated ? "default" : "pointer",
                                                    }}
                                                >
                                                    <td style={{ textAlign: "center", fontWeight: 600, color: "#444" }}>
                                                        {index + 1}
                                                    </td>
                                                    {COLUMNS.map((col) => (
                                                        <td
                                                            key={col.key}
                                                            style={{
                                                                textAlign: col.numeric ? "right" : "left",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {row[col.key] ?? ""}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Box>

                {/* ── ACTION BAR ──────────────────────────────────────────── */}
                <Box
                    display="flex"
                    alignItems="center"
                    gap={1.2}
                    flexWrap="wrap"
                    style={{
                        background: "#e8eef8",
                        border: "1px solid #c8d4e8",
                        borderRadius: 6,
                        padding: "6px 12px",
                    }}
                >
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSelectAllInEXP}
                        disabled={loading || filteredRows.length === 0}
                        style={{
                            background: "#002D68",
                            color: "#fff",
                            fontFamily: "Arial",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "none",
                            height: 28,
                            padding: "0 12px",
                        }}
                    >
                        Select All Items in EXP
                    </Button>

                    {/* Excel icon button matching existing project icon style */}
                    <Tooltip title="Export to Excel">
                        <IconButton
                            onClick={handleExcelExport}
                            disabled={loading || filteredRows.length === 0}
                            size="small"
                            style={{
                                background: "#217346",
                                color: "#fff",
                                borderRadius: 4,
                                width: 28,
                                height: 28,
                                fontSize: 14,
                            }}
                        >
                            <span style={{ fontWeight: 900, fontSize: 13, lineHeight: 1 }}>X</span>
                        </IconButton>
                    </Tooltip>

                    <Typography style={{ fontFamily: "Arial", fontSize: 11, fontWeight: 600, color: "#002D68", whiteSpace: "nowrap" }}>
                        No of Items in selected EXP
                    </Typography>
                    <Box
                        style={{
                            background: "#fff",
                            border: "1px solid #93bce6",
                            borderRadius: 4,
                            padding: "2px 14px",
                            fontFamily: "Arial",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#002D68",
                            minWidth: 36,
                            textAlign: "center",
                        }}
                    >
                        {selectedCount}
                    </Box>

                    <Box flexGrow={1} />

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAllocate}
                        disabled={selectedCount === 0}
                        style={{
                            background: selectedCount > 0 ? "#005f33" : "#aaa",
                            color: "#fff",
                            fontFamily: "Arial",
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "none",
                            height: 28,
                            padding: "0 14px",
                        }}
                    >
                        ↓ Add to Allocate Table ({selectedCount})
                    </Button>
                </Box>

                {/* ── BOTTOM TABLE – Allocated Items ──────────────────────── */}
                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography style={{ fontFamily: "Arial", fontWeight: 700, fontSize: 12, color: "#005f33" }}>
                            Allocated Items
                        </Typography>
                        <Chip
                            label={`${allocatedCount} items`}
                            size="small"
                            style={{ background: "#d4f5e2", color: "#005f33", fontWeight: 600, fontSize: 10, height: 18 }}
                        />
                    </Box>

                    <div style={{ maxHeight: "22vh", overflowY: "auto", overflowX: "auto", border: "1px solid #ddd", borderRadius: 4 }}>
                        <table id="transactionTable" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6" }}>#</th>
                                    {COLUMNS.map((col) => (
                                        <th key={col.key} style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", whiteSpace: "nowrap" }}>
                                            {col.label}
                                        </th>
                                    ))}
                                    <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#93bce6", textAlign: "center" }}>
                                        Del
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocatedRows.length === 0 ? (
                                    <tr >
                                        <td
                                            colSpan={COLUMNS.length + 2}
                                            style={{ textAlign: "center", padding: "18px", color: "#888", fontSize: 12 }}
                                        >
                                            No items allocated yet — select rows above and click "Add to Allocate Table".
                                        </td>
                                    </tr>
                                ) : (
                                    allocatedRows.map((row, index) => {
                                        const key = rowKey(row);
                                        return (
                                            <tr key={key} style={{ height: 40 }}>
                                                <td style={{ textAlign: "center", fontWeight: 600, color: "#444", padding: "2px 6px" }}>
                                                    {index + 1}
                                                </td>
                                                {COLUMNS.map((col) => (
                                                    <td
                                                        key={col.key}
                                                        style={{
                                                            textAlign: col.numeric ? "right" : "left",
                                                            whiteSpace: "nowrap",
                                                            padding: "2px 6px",
                                                        }}
                                                    >
                                                        {row[col.key] ?? ""}
                                                    </td>
                                                ))}
                                                <td style={{ textAlign: "center", padding: "0px 4px" }}>
                                                    <Tooltip title="Remove">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveAllocated(key)}
                                                            style={{ color: "#c00", padding: 1 }}
                                                        >
                                                            <DeleteOutlineIcon style={{ fontSize: 15 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Box>
            </DialogContent>

            {/* ── Footer ─────────────────────────────────────────────────── */}
            <DialogActions
                style={{
                    padding: "8px 16px",
                    background: "#f4f6fb",
                    borderTop: "1px solid #d0d7e2",
                    gap: 8,
                }}
            >
                <Typography style={{ flex: 1, fontFamily: "Arial", fontSize: 11, color: "#555" }}>
                    {allocatedCount > 0
                        ? `${allocatedCount} item(s) ready to load into Packing List.`
                        : "Allocate items from the top table, then click Confirm."}
                </Typography>

                <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    style={{
                        borderColor: "#002D68",
                        color: "#002D68",
                        fontFamily: "Arial",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "none",
                        height: 30,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    size="small"
                    disabled={allocatedCount === 0}
                    style={{
                        background: allocatedCount > 0 ? "#002D68" : "#aaa",
                        color: "#fff",
                        fontFamily: "Arial",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "none",
                        height: 30,
                        minWidth: 130,
                    }}
                >
                    ✔ Confirm &amp; Load ({allocatedCount})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoadPendingEXPModal;