// import React, { useState, useEffect } from 'react';
// import {
//     Box, Typography, TextField, Button, Autocomplete,
//     Table, TableBody, TableCell, TableContainer, TableHead,
//     TableRow, Paper, IconButton, InputAdornment, Select,
//     MenuItem, FormControl, Menu, ToggleButton, ToggleButtonGroup,
//     InputLabel, OutlinedInput, Snackbar, Alert
// } from '@mui/material';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import AttachFileIcon from '@mui/icons-material/AttachFile';
// import CloseIcon from '@mui/icons-material/Close';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
// import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
// import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
// import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
// import TuneIcon from '@mui/icons-material/Tune';
// import { CustomerDropShowdata, FetchCustomerAddress, GenerateContractReviewDocNo, ImportContractReview, SaveContractReview, SearchContractReviewItems } from '../../ApiService/LoginPageService';

// /* ─── shared style tokens ─── */
// const flatInputSx = {
//     '& .MuiInputBase-root': {
//         borderRadius: '4px', fontSize: '0.85rem', backgroundColor: '#fff',
//     },
//     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
//     '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#6c757d' },
// };

// const multilineSx = {
//     '& .MuiInputBase-root': {
//         borderRadius: '4px', fontSize: '0.8rem', backgroundColor: '#fff', padding: '8px 10px',
//     },
//     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
//     '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#6c757d' },
// };

// const toolbarBtnSx = {
//     minWidth: 0, padding: '6px 14px',
//     fontSize: '0.75rem', fontWeight: 600,
//     textTransform: 'none', borderRadius: 1,
//     backgroundColor: '#002868', color: '#fff',
//     lineHeight: 1.5,
//     '&:hover': { backgroundColor: '#001a47' },
// };

// const disabledBtnSx = {
//     ...toolbarBtnSx,
//     backgroundColor: '#e9ecef',
//     color: '#adb5bd',
//     '&:hover': { backgroundColor: '#e9ecef' },
// };

// const navBtnSx = { ...toolbarBtnSx, padding: '6px 10px' };

// const thSx = {
//     backgroundColor: '#a3c2e0', color: '#1a1a1a',
//     fontSize: '0.75rem', fontWeight: 700,
//     py: 1, px: 1,
//     whiteSpace: 'nowrap',
//     borderRight: '1px solid #fff',
//     borderBottom: '1px solid #8baac9'
// };

// const tdSx = {
//     fontSize: '0.8rem', py: 0.6, px: 1,
//     borderBottom: '1px solid #e9ecef',
// };

// const fieldsetSx = {
//     border: '1px solid #ced4da',
//     borderRadius: '4px',
//     padding: '4px 10px 8px',
//     margin: 0,
//     marginBottom: '8px',
//     backgroundColor: '#fff'
// };

// const legendSx = {
//     fontSize: '0.75rem',
//     color: '#6c757d',
//     padding: '0 4px',
//     fontWeight: 500,
//     width: 'auto',
//     marginBottom: 0
// };

// /* ════════════════════════════════════════════════════════
//    ContractReview Component
// ════════════════════════════════════════════════════════ */
// const ContractReview = () => {

//     /* ── header fields ── */
//     const [crNumber, setCrNumber] = useState('');
//     const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
//     const [docNo, setDocNo] = useState('');
//     const status = 'APPROVED';

//     /* ── customer / address ── */
//     const [customerList, setCustomerList] = useState([]);
//     const [customer, setCustomer] = useState(null);
//     const [selectedCustomerName, setSelectedCustomerName] = useState('');
//     const [billingAddress, setBillingAddress] = useState('');
//     const [shippingAddress, setShippingAddress] = useState('');

//     /* ── right panel ── */
//     const [packingInstruction, setPackingInstruction] = useState('APPROVE');
//     const [statutoryRequirement, setStatutoryRequirement] = useState('APPROVE');
//     const [packingFile, setPackingFile] = useState(null);
//     const [statutoryFile, setStatutoryFile] = useState(null);

//     /* ── toolbar ── */
//     const [searchCR, setSearchCR] = useState('');
//     const [optionsAnchor, setOptionsAnchor] = useState(null);

//     /* ── notification ── */
//     const [notification, setNotification] = useState({ open: false, type: 'success', message: '' });
//     const showNotification = (type, message) => setNotification({ open: true, type, message });
//     const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

//     /* ── line items ── */
//     const [lineItems, setLineItems] = useState([
//         // {
//         //     id: 1,
//         //     itemCode: 'NAA102R1', itemName: 'Caution Lable',
//         //     uom: 'Nos',
//         //     moq: '',
//         //     custPoNo: '1234',
//         //     custPoDate: '2026-05-12',
//         //     custPoLine: '22',
//         //     crQty: 10,
//         //     mstPrice: 55.00,
//         //     mstAmt: 550.00,
//         //     crRate: 55.00,
//         //     crAmt: 550.00,
//         //     revNoFromMs: 'NA',
//         //     revNo: 'NA',
//         //     qtnRef: '',
//         //     deliverySchedule: '2026-05-16',
//         //     penaltyClause: '',
//         //     modeOfShipment: '',
//         // },
//     ]);
//     const [searchItem, setSearchItem] = useState(null);
//     const [searchItemInputValue, setSearchItemInputValue] = useState('');
//     const [itemOptions, setItemOptions] = useState([]);

//     /* ── generate doc number on mount (API: documentnumber/generateDocNo?docType=ContractReview) ── */
//     const refreshDocNumber = () => {
//         GenerateContractReviewDocNo(
//             (res) => {
//                 if (res?.success) {
//                     setCrNumber(res?.digit || '');
//                     setDocNo(res?.uniqueNo || '');
//                 }
//             },
//             (err) => console.error('Doc number generation error', err)
//         );
//     };

//     useEffect(() => { refreshDocNumber(); }, []);

//     /* ── NEW / CLEAR — reset entire form + regenerate doc number ── */
//     const handleClearAll = () => {
//         refreshDocNumber();
//         setDate(new Date().toISOString().split('T')[0]);
//         setCustomer(null);
//         setCustomerList([]);
//         setSelectedCustomerName('');
//         setBillingAddress('');
//         setShippingAddress('');
//         setLineItems([]);
//         setSearchItem(null);
//         setSearchItemInputValue('');
//         setItemOptions([]);
//         setPackingInstruction('APPROVE');
//         setStatutoryRequirement('APPROVE');
//         setPackingFile(null);
//         setStatutoryFile(null);
//         setSearchCR('');
//     };

//     /* ── Step 1: search customers by typing (same API as NewPurchaseOrderEntry.js) ── */
//     // Called from TextField onChange inside the Autocomplete — mirrors handleChangeCustomer in PO Entry
//     const handleChangeCustomer = (e) => {
//         if (!e || !e.target.value) {
//             setCustomerList([]);
//             return;
//         }
//         CustomerDropShowdata(
//             { code: e.target.value },
//             (res) => { setCustomerList(res?.data || []); },
//             () => { setCustomerList([]); }
//         );
//     };

//     // Map API response to Autocomplete options — same as optionsCustList in PO Entry
//     const optionsCustList = Array.isArray(customerList)
//         ? customerList.map(item => ({
//             id: item?.id,
//             cId: item?.cId,
//             label: item?.cCode,
//             cName: item?.cName,
//         }))
//         : [];

//     /* ── Step 2: customer selected — fetch address + clear line items for new customer ── */
//     const handleCustomerChange = (_, val) => {
//         setCustomer(val);
//         setSelectedCustomerName(val?.cName || '');
//         setBillingAddress('');
//         setShippingAddress('');
//         // Clear line items when customer changes — items are customer-specific
//         setLineItems([]);
//         setSearchItem(null);
//         setSearchItemInputValue('');
//         setItemOptions([]);
//         if (!val) return;
//         FetchCustomerAddress(
//             { id: val?.cId },
//             (res) => {
//                 setBillingAddress(res?.data?.[0]?.cAddress || '');
//                 setShippingAddress(res?.data?.[0]?.multiAddress || '');
//             },
//             (err) => { console.error('Customer address fetch error', err); }
//         );
//     };

//     const handleSearchItems = (query) => {
//         if (!query) {
//             setItemOptions([]);
//             return;
//         }
//         SearchContractReviewItems(
//             customer?.id,
//             query,
//             (res) => {
//                 if (res.success && res.message) {
//                     setItemOptions(res.message);
//                 } else {
//                     setItemOptions([]);
//                 }
//             },
//             (err) => {
//                 console.error("Item search error", err);
//                 setItemOptions([]);
//             }
//         );
//     };

//     const handleSelectItem = (val) => {
//         if (!val) return;
//         const newItem = {
//             id: Date.now(),
//             itemCode: val.itemCode || '',
//             itemName: val.itemName || '',
//             uom: val.uom || '',
//             moq: val.moq || '',
//             custPoNo: '',
//             custPoDate: '',
//             custPoLine: '',
//             crQty: 0,
//             mstPrice: val.mstPrice || '0.00',
//             mstAmt: 0,
//             crRate: val.mstPrice || '0.00',
//             crAmt: 0,
//             revNoFromMs: 'NA',
//             revNo: 'NA',
//             qtnRef: '',
//             deliverySchedule: '',
//             penaltyClause: '',
//             modeOfShipment: '',
//         };
//         setLineItems(prev => {
//             if (prev.length === 1 && !prev[0].itemCode) return [newItem];
//             return [...prev, newItem];
//         });
//         // Clear search after selection so user can search for next item immediately
//         setSearchItem(null);
//         setSearchItemInputValue('');
//         setItemOptions([]);
//     };

//     /* ── SAVE — POST to contractReview ── */
//     const handleSave = () => {
//         if (!customer) { showNotification('error', 'Please select a customer before saving.'); return; }
//         if (lineItems.length === 0) { showNotification('error', 'Please add at least one line item.'); return; }
//         const payload = {
//             docNo: crNumber,
//             crNo: docNo,
//             crDate: date,
//             customerId: customer?.cId || customer?.id,
//             packingIns: packingInstruction === 'APPROVE',
//             statutoryReq: statutoryRequirement === 'APPROVE',
//             file: packingFile?.name || statutoryFile?.name || '',
//             crData: lineItems.map(item => ({
//                 itemId: item.itemId || item.id,
//                 crQty: item.crQty,
//                 crRate: item.crRate,
//                 crAmt: item.crAmt,
//                 custPoNo: item.custPoNo,
//                 custPoDate: item.custPoDate,
//                 custPoLine: item.custPoLine,
//                 moq: item.moq || null,
//                 itemCode: item.itemCode,
//                 itemName: item.itemName,
//                 uom: item.uom,
//                 mstPrice: item.mstPrice,
//                 mstAmt: item.mstAmt,
//             })),
//         };
//         SaveContractReview(
//             payload,
//             (res) => { showNotification('success', res?.message || 'Contract Review saved successfully!'); },
//             (err, msg) => { showNotification('error', msg || 'Failed to save Contract Review.'); }
//         );
//     };

//     /* ── UPLOAD FILE (IMPORT) — POST FormData to contractReview/import ── */
//     const handleImportFile = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         const formData = new FormData();
//         formData.append('file', file);
//         ImportContractReview(
//             formData,
//             (res) => {
//                 if (res?.data && Array.isArray(res.data)) {
//                     setLineItems(res.data.map((item, idx) => ({ ...item, id: item.id || Date.now() + idx })));
//                 }
//                 showNotification('success', res?.message || 'File imported successfully!');
//                 // Reset file input
//                 e.target.value = '';
//             },
//             (err, msg) => {
//                 showNotification('error', msg || 'File import failed.');
//                 e.target.value = '';
//             }
//         );
//     };

//     const handleCellChange = (id, field, value) => {
//         setLineItems(prev => prev.map(item => {
//             if (item.id !== id) return item;
//             const updated = { ...item, [field]: value };
//             if (field === 'crQty' || field === 'crRate' || field === 'mstPrice') {
//                 const qty = parseFloat(updated.crQty) || 0;
//                 updated.crAmt = parseFloat((qty * (parseFloat(updated.crRate) || 0)).toFixed(2));
//                 updated.mstAmt = parseFloat((qty * (parseFloat(updated.mstPrice) || 0)).toFixed(2));
//             }
//             return updated;
//         }));
//     };

//     const handleCopyRow = (item) =>
//         setLineItems(prev => [...prev, { ...item, id: Date.now() }]);

//     const handleRemoveRow = (id) => {
//         if (lineItems.length > 1)
//             setLineItems(prev => prev.filter(i => i.id !== id));
//     };

//     const totalQty = lineItems.reduce((s, i) => s + (parseFloat(i.crQty) || 0), 0);
//     const grossAmt = lineItems.reduce((s, i) => s + (parseFloat(i.crAmt) || 0), 0);

//     /* ════════════════════════ RENDER ════════════════════════ */
//     return (
//         <Box sx={{ backgroundColor: '#eef0f4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

//             {/* ═══ TOP TITLE BAR ═══ */}
//             <Box sx={{
//                 display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                 px: 2, pt: 1.5, pb: 1.5
//             }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1a233a' }}>
//                     Contract Review
//                 </Typography>
//                 <Box display="flex" alignItems="center" gap={2}>
//                     <Typography sx={{ color: '#27ae60', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 0.5 }}>
//                         {status}
//                     </Typography>
//                     <TextField
//                         size="small" placeholder="Search PO" value={searchCR}
//                         onChange={e => setSearchCR(e.target.value)}
//                         sx={{
//                             width: 155, backgroundColor: '#fff', borderRadius: 1,
//                         }}
//                         InputProps={{
//                             endAdornment: <ArrowDropDownIcon sx={{ color: '#888', cursor: 'pointer' }} />
//                         }}
//                     />
//                 </Box>
//             </Box>

//             {/* ═══ MAIN FORM AREA ═══ */}
//             <Box display="flex" justifyContent="space-between" px={2} mb={1} gap={3}>

//                 {/* ── LEFT SIDE (Form Fields) ── */}
//                 <Box display="flex" flexDirection="column" gap={1.5} sx={{ flexGrow: 1, maxWidth: 1200 }}>

//                     {/* Row 1 – CR No / Date / Doc No / Refresh */}
//                     <Box display="flex" alignItems="center" gap={1.5}>
//                         {/* CR No prefix + number */}
//                         <FormControl size="small" sx={{ flex: 1 }}>
//                             <InputLabel sx={{ fontSize: '0.85rem', color: '#6c757d' }}>CR No</InputLabel>
//                             <OutlinedInput
//                                 label="CR No"
//                                 value={crNumber}
//                                 onChange={e => setCrNumber(e.target.value)}
//                                 sx={{ fontSize: '0.85rem', borderRadius: 1, backgroundColor: '#fff' }}
//                             // startAdornment={
//                             //     <InputAdornment position="start">
//                             //         <Select
//                             //             value={crPrefix}
//                             //             onChange={e => setCrPrefix(e.target.value)}
//                             //             sx={{
//                             //                 '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
//                             //                 borderRight: '1px solid #ced4da',
//                             //                 borderRadius: 0,
//                             //                 mr: 1,
//                             //                 '& .MuiSelect-select': { pl: 0, pr: 2, fontSize: '0.85rem', py: 0 }
//                             //             }}
//                             //             IconComponent={ArrowDropDownIcon}
//                             //         >
//                             //             <MenuItem value="R">R</MenuItem>
//                             //             <MenuItem value="CR">CR</MenuItem>
//                             //         </Select>
//                             //     </InputAdornment>
//                             // }
//                             />
//                         </FormControl>

//                         {/* Date */}
//                         <TextField
//                             size="small" type="date" value={date}
//                             onChange={e => setDate(e.target.value)}
//                             sx={{ ...flatInputSx, flex: 1 }}
//                         />

//                         {/* Doc No */}
//                         <TextField
//                             size="small" value={docNo}
//                             onChange={e => setDocNo(e.target.value)}
//                             sx={{ ...flatInputSx, flex: 1 }}
//                         />

//                         {/* Refresh icon – regenerates doc number */}
//                         <IconButton
//                             size="small"
//                             title="Refresh Document Number"
//                             onClick={() =>
//                                 GenerateContractReviewDocNo(
//                                     (res) => {
//                                         if (res?.success) {
//                                             setCrNumber(res?.digit || '');
//                                             setDocNo(res?.uniqueNo || '');
//                                         }
//                                     },
//                                     (err) => console.error('Doc number refresh error', err)
//                                 )
//                             }
//                             sx={{ color: '#6c757d', border: '1px solid #ced4da', borderRadius: 1, p: '7px', backgroundColor: '#fff', '&:hover': { backgroundColor: '#f8f9fa' } }}
//                         >
//                             <RefreshIcon sx={{ fontSize: 20 }} />
//                         </IconButton>
//                     </Box>

//                     {/* Row 2 – Customer (type-to-search, exact pattern from New PO-Sales Order Entry) */}
//                     <Box sx={{ width: '49.5%' }}>
//                         <Autocomplete
//                             disablePortal
//                             options={optionsCustList}
//                             getOptionLabel={o => o.cName || o.label || ''}
//                             value={customer}
//                             onChange={handleCustomerChange}
//                             filterOptions={(x) => x}
//                             size="small"
//                             fullWidth
//                             noOptionsText="Type customer name to search..."
//                             renderInput={params => (
//                                 <TextField
//                                     {...params}
//                                     label="Search Customer"
//                                     onChange={handleChangeCustomer}
//                                     sx={{ ...flatInputSx }}
//                                 />
//                             )}
//                         />
//                     </Box>

//                     {/* Row 3 – Billing / Shipping */}
//                     <Box display="flex" gap={1.5} sx={{ width: '100%' }}>

//                         {/* Billing Address */}
//                         <Box sx={{ flex: 1 }} display="flex" flexDirection="column" alignItems="flex-start">
//                             <TextField
//                                 label="Billing Address"
//                                 size="small" multiline rows={2} fullWidth
//                                 value={billingAddress}
//                                 onChange={e => setBillingAddress(e.target.value)}
//                                 sx={{ ...multilineSx, '& .MuiInputBase-root': { height: 75, alignItems: 'flex-start' } }}
//                             />
//                             <Typography sx={{ fontSize: '0.65rem', color: '#adb5bd', fontWeight: 600, cursor: 'pointer', mt: 0.5, letterSpacing: 0.5 }}>
//                                 CHANGE
//                             </Typography>
//                         </Box>

//                         {/* Shipping Address */}
//                         <Box sx={{ flex: 1 }} display="flex" flexDirection="column" alignItems="flex-start">
//                             <TextField
//                                 label="Shipping Address"
//                                 size="small" multiline rows={2} fullWidth
//                                 value={shippingAddress}
//                                 onChange={e => setShippingAddress(e.target.value)}
//                                 sx={{ ...multilineSx, '& .MuiInputBase-root': { height: 75, alignItems: 'flex-start' } }}
//                             />
//                             <Typography sx={{ fontSize: '0.65rem', color: '#adb5bd', fontWeight: 600, cursor: 'pointer', mt: 0.5, letterSpacing: 0.5 }}>
//                                 CHANGE
//                             </Typography>
//                         </Box>
//                     </Box>
//                 </Box>

//                 {/* ── RIGHT SIDE (Floating Panel) ── */}
//                 <Box sx={{
//                     width: 500, // Increased width to utilize space better
//                     flexShrink: 0,
//                     border: '1px solid #ced4da',
//                     borderRadius: 2,
//                     backgroundColor: '#fff',
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//                     p: 1.5,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'flex-start'
//                 }}>

//                     {/* Packing Instruction */}
//                     <Box component="fieldset" sx={fieldsetSx}>
//                         <legend style={legendSx}>Packing Instruction</legend>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
//                             <Button
//                                 component="label"
//                                 size="small"
//                                 startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
//                                 sx={{
//                                     fontSize: '0.7rem', fontWeight: 700,
//                                     textTransform: 'uppercase', color: '#002868', p: 0, minWidth: 0,
//                                 }}
//                             >
//                                 File Upload
//                                 <input type="file" hidden onChange={e => e.target.files[0] && setPackingFile(e.target.files[0])} />
//                             </Button>
//                         </Box>

//                         {packingFile && (
//                             <Box display="flex" alignItems="center" gap={0.5} mb={0.5}
//                                 sx={{ py: 0.2, px: 0.8, backgroundColor: '#e9ecef', borderRadius: 0.5 }}>
//                                 <AttachFileIcon sx={{ fontSize: 14, color: '#6c757d' }} />
//                                 <Typography variant="caption" noWrap sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
//                                     {packingFile.name}
//                                 </Typography>
//                                 <IconButton size="small" onClick={() => setPackingFile(null)} sx={{ p: 0.2 }}>
//                                     <CloseIcon sx={{ fontSize: 13 }} />
//                                 </IconButton>
//                             </Box>
//                         )}

//                         <ToggleButtonGroup
//                             value={packingInstruction} exclusive
//                             onChange={(_, v) => v && setPackingInstruction(v)}
//                             fullWidth size="small"
//                         >
//                             {[
//                                 { val: 'APPROVE', active: '#002868' },
//                                 { val: 'REJECT', active: '#fff' },
//                             ].map(({ val, active }) => (
//                                 <ToggleButton
//                                     key={val} value={val}
//                                     sx={{
//                                         fontWeight: 700, fontSize: '0.75rem', borderRadius: 1, py: 0.4,
//                                         color: packingInstruction === val ? (val === 'REJECT' ? '#495057' : '#fff') : '#495057',
//                                         backgroundColor: packingInstruction === val ? active : '#fff',
//                                         border: '1px solid #ced4da !important',
//                                         '&.Mui-selected': {
//                                             backgroundColor: active,
//                                             color: val === 'REJECT' ? '#495057' : '#fff',
//                                             '&:hover': { backgroundColor: active },
//                                         },
//                                         '&:hover': { backgroundColor: '#f8f9fa' },
//                                     }}
//                                 >
//                                     {val}
//                                 </ToggleButton>
//                             ))}
//                         </ToggleButtonGroup>
//                     </Box>

//                     {/* Statutory Requirement */}
//                     <Box component="fieldset" sx={{ ...fieldsetSx, marginBottom: 0 }}>
//                         <legend style={legendSx}>Statutory Requirement</legend>
//                         <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
//                             <Button
//                                 component="label"
//                                 size="small"
//                                 startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
//                                 sx={{
//                                     fontSize: '0.7rem', fontWeight: 700,
//                                     textTransform: 'uppercase', color: '#002868', p: 0, minWidth: 0,
//                                 }}
//                             >
//                                 File Upload
//                                 <input type="file" hidden onChange={e => e.target.files[0] && setStatutoryFile(e.target.files[0])} />
//                             </Button>
//                         </Box>

//                         {statutoryFile && (
//                             <Box display="flex" alignItems="center" gap={0.5} mb={0.5}
//                                 sx={{ py: 0.2, px: 0.8, backgroundColor: '#e9ecef', borderRadius: 0.5 }}>
//                                 <AttachFileIcon sx={{ fontSize: 14, color: '#6c757d' }} />
//                                 <Typography variant="caption" noWrap sx={{ flexGrow: 1, fontSize: '0.7rem' }}>
//                                     {statutoryFile.name}
//                                 </Typography>
//                                 <IconButton size="small" onClick={() => setStatutoryFile(null)} sx={{ p: 0.2 }}>
//                                     <CloseIcon sx={{ fontSize: 13 }} />
//                                 </IconButton>
//                             </Box>
//                         )}

//                         <ToggleButtonGroup
//                             value={statutoryRequirement} exclusive
//                             onChange={(_, v) => v && setStatutoryRequirement(v)}
//                             fullWidth size="small"
//                         >
//                             {[
//                                 { val: 'APPROVE', active: '#002868' },
//                                 { val: 'REJECT', active: '#fff' },
//                             ].map(({ val, active }) => (
//                                 <ToggleButton
//                                     key={val} value={val}
//                                     sx={{
//                                         fontWeight: 700, fontSize: '0.75rem', borderRadius: 1, py: 0.4,
//                                         color: statutoryRequirement === val ? (val === 'REJECT' ? '#495057' : '#fff') : '#495057',
//                                         backgroundColor: statutoryRequirement === val ? active : '#fff',
//                                         border: '1px solid #ced4da !important',
//                                         '&.Mui-selected': {
//                                             backgroundColor: active,
//                                             color: val === 'REJECT' ? '#495057' : '#fff',
//                                             '&:hover': { backgroundColor: active },
//                                         },
//                                         '&:hover': { backgroundColor: '#f8f9fa' },
//                                     }}
//                                 >
//                                     {val}
//                                 </ToggleButton>
//                             ))}
//                         </ToggleButtonGroup>
//                     </Box>
//                 </Box>
//             </Box>

//             {/* ═══ ACTION TOOLBAR ═══ */}
//             <Box sx={{
//                 display: 'flex', alignItems: 'center', gap: 1,
//                 px: 2, py: 1.2,
//                 backgroundColor: '#fff',
//                 borderTop: '1px solid #ced4da',
//                 borderBottom: '1px solid #ced4da',
//                 mx: 1, mt: 1,
//                 borderTopLeftRadius: 8, borderTopRightRadius: 8
//             }}>
//                 <Button sx={toolbarBtnSx} onClick={handleClearAll}>NEW</Button>
//                 <Button sx={disabledBtnSx} disabled>EDIT</Button>
//                 <Button sx={disabledBtnSx} disabled>DELETE</Button>
//                 <Button sx={toolbarBtnSx} onClick={handleClearAll}>CLEAR</Button>
//                 <Button sx={toolbarBtnSx}>PRINT</Button>

//                 <Button sx={navBtnSx}><KeyboardDoubleArrowLeftIcon sx={{ fontSize: 18 }} /></Button>
//                 <Button sx={navBtnSx}><KeyboardArrowLeftIcon sx={{ fontSize: 18 }} /></Button>
//                 <Button sx={navBtnSx}><KeyboardArrowRightIcon sx={{ fontSize: 18 }} /></Button>
//                 <Button sx={navBtnSx}><KeyboardDoubleArrowRightIcon sx={{ fontSize: 18 }} /></Button>

//                 <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
//                     <Button sx={toolbarBtnSx}>TEMPLATE</Button>
//                     <Button sx={toolbarBtnSx} component="label">
//                         LOAD EXCEL
//                         <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleImportFile} />
//                     </Button>
//                     <Button sx={toolbarBtnSx} onClick={handleSave}>SAVE</Button>
//                 </Box>
//             </Box>

//             {/* ═══ DATA TABLE ═══ */}
//             <Box sx={{ backgroundColor: '#fff', flexGrow: 1, mx: 1 }}>
//                 <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0, border: '1px solid #ced4da', borderTop: 'none', overflowX: 'auto' }}>
//                     <Table size="small" sx={{ minWidth: 1600 }}>

//                         {/* Light blue header */}
//                         <TableHead>
//                             <TableRow>
//                                 {[
//                                     'Item Code', 'Item Name', 'UOM', 'MOQ',
//                                     'Cust PO No', 'Cust PO Date', 'Cust PO Line', 'PO Qty',
//                                     'MST Price', 'MST Amt', 'CR Rate', 'CR Amt',
//                                     'REV No From Ms', 'REV NO', 'QTN Ref', 'Delivery Schedule',
//                                     'Penalty Clause', 'Mode of Shipment', 'Actions'
//                                 ].map(col => (
//                                     <TableCell key={col} sx={thSx}>{col}</TableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>

//                         <TableBody>
//                             {lineItems.map(item => (
//                                 <TableRow key={item.id}
//                                     sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>

//                                     {/* Item Code */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.itemCode || item.partNo || ''}</Typography>
//                                     </TableCell>

//                                     {/* Item Name */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef', minWidth: 150 }}>
//                                         <Typography sx={{ fontSize: '0.8rem' }}>{item.itemName || item.partName || ''}</Typography>
//                                     </TableCell>

//                                     {/* UOM */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem' }}>{item.uom}</Typography>
//                                     </TableCell>

//                                     {/* MOQ */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem' }}>{item.moq}</Typography>
//                                     </TableCell>

//                                     {/* Cust PO No */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.custPoNo || ''}
//                                             onChange={e => handleCellChange(item.id, 'custPoNo', e.target.value)}
//                                             sx={{
//                                                 width: 80,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Cust PO Date */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small" type="date"
//                                             value={item.custPoDate || ''}
//                                             onChange={e => handleCellChange(item.id, 'custPoDate', e.target.value)}
//                                             sx={{
//                                                 width: 120,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#fffdf2' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Cust PO Line */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.custPoLine || ''}
//                                             onChange={e => handleCellChange(item.id, 'custPoLine', e.target.value)}
//                                             sx={{
//                                                 width: 60,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px', textAlign: 'center' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* PO Qty (crQty) */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small" type="number"
//                                             value={item.crQty}
//                                             onChange={e => handleCellChange(item.id, 'crQty', e.target.value)}
//                                             sx={{
//                                                 width: 60,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px', textAlign: 'right' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* MST Price */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.mstPrice) || 0).toFixed(2)}</Typography>
//                                     </TableCell>

//                                     {/* MST Amt */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.mstAmt) || 0).toFixed(2)}</Typography>
//                                     </TableCell>

//                                     {/* CR Rate */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small" type="number"
//                                             value={item.crRate}
//                                             onChange={e => handleCellChange(item.id, 'crRate', e.target.value)}
//                                             sx={{
//                                                 width: 80,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px', textAlign: 'right' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* CR Amt */}
//                                     <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
//                                         <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.crAmt) || 0).toFixed(2)}</Typography>
//                                     </TableCell>

//                                     {/* REV No From Ms */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.revNoFromMs || ''}
//                                             onChange={e => handleCellChange(item.id, 'revNoFromMs', e.target.value)}
//                                             sx={{
//                                                 width: 80,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* REV NO */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.revNo || ''}
//                                             onChange={e => handleCellChange(item.id, 'revNo', e.target.value)}
//                                             sx={{
//                                                 width: 80,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* QTN Ref */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.qtnRef || ''}
//                                             onChange={e => handleCellChange(item.id, 'qtnRef', e.target.value)}
//                                             sx={{
//                                                 width: 80,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Delivery Schedule (schDate / deliverySchedule) */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small" type="date"
//                                             value={item.deliverySchedule || item.schDate || ''}
//                                             onChange={e => handleCellChange(item.id, 'deliverySchedule', e.target.value)}
//                                             sx={{
//                                                 width: 120,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#fffdf2' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Penalty Clause */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.penaltyClause || ''}
//                                             onChange={e => handleCellChange(item.id, 'penaltyClause', e.target.value)}
//                                             sx={{
//                                                 width: 100,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Mode of Shipment */}
//                                     <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
//                                         <TextField
//                                             variant="outlined" size="small"
//                                             value={item.modeOfShipment || ''}
//                                             onChange={e => handleCellChange(item.id, 'modeOfShipment', e.target.value)}
//                                             sx={{
//                                                 width: 100,
//                                                 '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
//                                                 '& input': { p: '4px 8px' },
//                                             }}
//                                         />
//                                     </TableCell>

//                                     {/* Actions */}
//                                     <TableCell sx={{ ...tdSx, whiteSpace: 'nowrap' }}>
//                                         <IconButton size="small"
//                                             onClick={() => handleCopyRow(item)}
//                                             sx={{ p: 0.3, color: '#6c757d' }}>
//                                             <ContentCopyIcon sx={{ fontSize: 16 }} />
//                                         </IconButton>
//                                         <IconButton size="small"
//                                             onClick={() => handleRemoveRow(item.id)}
//                                             disabled={lineItems.length === 1}
//                                             sx={{ p: 0.3, color: '#6c757d', ml: 0.5 }}>
//                                             <DeleteOutlineIcon sx={{ fontSize: 18 }} />
//                                         </IconButton>
//                                     </TableCell>
//                                 </TableRow>
//                             ))}

//                             {/* Search Items row */}
//                             <TableRow sx={{ backgroundColor: '#fff' }}>
//                                 <TableCell colSpan={19} sx={{ py: 1.5, px: 1.5, borderBottom: 'none' }}>
//                                     <Autocomplete
//                                         options={itemOptions}
//                                         getOptionLabel={o => o.itemCode ? `${o.itemCode} - ${o.itemName}` : ''}
//                                         value={searchItem}
//                                         inputValue={searchItemInputValue}
//                                         onChange={(_, v) => handleSelectItem(v)}
//                                         onInputChange={(_, val) => {
//                                             setSearchItemInputValue(val);
//                                             handleSearchItems(val);
//                                         }}
//                                         filterOptions={(x) => x}
//                                         size="small"
//                                         renderInput={params => (
//                                             <TextField
//                                                 {...params}
//                                                 placeholder="Search Items"
//                                                 sx={{
//                                                     width: 250,
//                                                     '& .MuiInputBase-root': {
//                                                         height: 32, borderRadius: 1, fontSize: '0.85rem', backgroundColor: '#fff'
//                                                     },
//                                                     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
//                                                 }}
//                                             />
//                                         )}
//                                     />
//                                 </TableCell>
//                             </TableRow>
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Box>

//             {/* ── Notification Snackbar ── */}
//             <Snackbar
//                 open={notification.open}
//                 autoHideDuration={4000}
//                 onClose={closeNotification}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//             >
//                 <Alert onClose={closeNotification} severity={notification.type} sx={{ width: '100%', fontWeight: 500 }}>
//                     {notification.message}
//                 </Alert>
//             </Snackbar>
//         </Box>
//     );
// };

// export default ContractReview;

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, IconButton, InputAdornment, Select,
    MenuItem, FormControl, Menu, ToggleButton, ToggleButtonGroup,
    InputLabel, OutlinedInput, Snackbar, Alert, Divider,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TuneIcon from '@mui/icons-material/Tune';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import GavelIcon from '@mui/icons-material/Gavel';
import { CustomerDropShowdata, FetchCustomerAddress, GenerateContractReviewDocNo, ImportContractReview, SaveContractReview, UpdateContractReview, DeleteContractReview, SearchContractReviewItems, PreviewContractReview, SearchContractReview } from '../../ApiService/LoginPageService';
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PackingInstructionModal from './PackingInstructionModal';
import StatutoryRequirementModal from './StatutoryRequirementModal';
import { DownloadContractReviewTemplate } from '../../ApiService/DownloadCsvReportsService';

/* ─── shared style tokens ─── */
const flatInputSx = {
    '& .MuiInputBase-root': {
        borderRadius: '4px', fontSize: '0.85rem', backgroundColor: '#fff',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
    '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#6c757d' },
};

const multilineSx = {
    '& .MuiInputBase-root': {
        borderRadius: '4px', fontSize: '0.8rem', backgroundColor: '#fff', padding: '8px 10px',
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
    '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#6c757d' },
};

const toolbarBtnSx = {
    minWidth: 0, padding: '6px 14px',
    fontSize: '0.75rem', fontWeight: 600,
    textTransform: 'none', borderRadius: 1,
    backgroundColor: '#002868', color: '#fff',
    lineHeight: 1.5,
    '&:hover': { backgroundColor: '#001a47' },
};

const disabledBtnSx = {
    ...toolbarBtnSx,
    backgroundColor: '#e9ecef',
    color: '#adb5bd',
    '&:hover': { backgroundColor: '#e9ecef' },
    '&.Mui-disabled': {
        backgroundColor: '#e9ecef',
        color: '#adb5bd',
    },
};

const disabledTextVisibleSx = {
    ...toolbarBtnSx,
    '&.Mui-disabled': {
        backgroundColor: '#e9ecef',
        color: '#adb5bd',
        pointerEvents: 'none',
    },
};

const navBtnSx = { ...toolbarBtnSx, padding: '6px 10px' };

const thSx = {
    backgroundColor: '#a3c2e0', color: '#1a1a1a',
    fontSize: '0.75rem', fontWeight: 700,
    py: 1, px: 1,
    whiteSpace: 'nowrap',
    borderRight: '1px solid #fff',
    borderBottom: '1px solid #8baac9'
};

const tdSx = {
    fontSize: '0.8rem', py: 0.6, px: 1,
    borderBottom: '1px solid #e9ecef',
};

const fieldsetSx = {
    border: '1px solid #ced4da',
    borderRadius: '4px',
    padding: '4px 10px 8px',
    margin: 0,
    marginBottom: '8px',
    backgroundColor: '#fff'
};

const legendSx = {
    fontSize: '0.75rem',
    color: '#6c757d',
    padding: '0 4px',
    fontWeight: 500,
    width: 'auto',
    marginBottom: 0
};

/* ════════════════════════════════════════════════════════
   ContractReview Component
════════════════════════════════════════════════════════ */
const ContractReview = () => {

    /* ── header fields ── */
    const [crNumber, setCrNumber] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [docNo, setDocNo] = useState('');
    const [status, setStatus] = useState('UNAUTHORIZED');

    /* ── customer / address ── */
    const [customerList, setCustomerList] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [selectedCustomerName, setSelectedCustomerName] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');

    /* ── right panel ── */
    const [packingInstruction, setPackingInstruction] = useState('APPROVE');
    const [statutoryRequirement, setStatutoryRequirement] = useState('APPROVE');
    const [packingFile, setPackingFile] = useState(null);
    const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
    const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);
    const [selectedPackingItem, setSelectedPackingItem] = useState(null);
    console.log("Selected Packing Item:", selectedPackingItem);
    const [statutoryFile, setStatutoryFile] = useState(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState('');

    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [selectedChildItem, setSelectedChildItem] = useState(null);

    /* ── uploaded CR attachment (toolbar Upload File button) ── */
    const [file, setCrFile] = useState(null);   // File object selected by user
    const [crFileUrl, setCrFileUrl] = useState('');     // URL returned by API after save/load
    const IMAGE_URL = process.env.REACT_APP_IMAGE_URL;    /* ── toolbar ── */
    const [searchCR, setSearchCR] = useState('');
    const [searchCRList, setSearchCRList] = useState([]);
    const [optionsAnchor, setOptionsAnchor] = useState(null);
    const [activeButton, setActiveButton] = useState("");
    const [mainId, setMainId] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    /* ── notification ── */
    const [notification, setNotification] = useState({ open: false, type: 'success', message: '' });
    const showNotification = (type, message) => setNotification({ open: true, type, message });
    const closeNotification = () => setNotification(prev => ({ ...prev, open: false }));

    /* ── line items ── */
    const [lineItems, setLineItems] = useState([
        // {
        //     id: 1,
        //     itemCode: 'NAA102R1', itemName: 'Caution Lable',
        //     uom: 'Nos',
        //     moq: '',
        //     custPoNo: '1234',
        //     custPoDate: '2026-05-12',
        //     custPoLine: '22',
        //     crQty: 10,
        //     mstPrice: 55.00,
        //     mstAmt: 550.00,
        //     crRate: 55.00,
        //     crAmt: 550.00,
        //     revNoFromMs: 'NA',
        //     revNo: 'NA',
        //     qtnRef: '',
        //     deliverySchedule: '2026-05-16',
        //     penaltyClause: '',
        //     modeOfShipment: '',
        // },
    ]);
    const [searchItem, setSearchItem] = useState(null);
    const [searchItemInputValue, setSearchItemInputValue] = useState('');
    const [itemOptions, setItemOptions] = useState([]);

    /* ── generate doc number on mount (API: documentnumber/generateDocNo?docType=ContractReview) ── */
    const refreshDocNumber = () => {
        GenerateContractReviewDocNo(
            (res) => {
                if (res?.success) {
                    setCrNumber(res?.digit || '');
                    setDocNo(res?.uniqueNo || '');
                }
            },
            (err) => console.error('Doc number generation error', err)
        );
    };

    useEffect(() => {
        // refreshDocNumber();

        handleForwardReverse("last", "");

    }, []);

    /* ── NEW / CLEAR — reset entire form + regenerate doc number ── */
    const handleClearAll = () => {
        setMainId('');
        setIsEditMode(true);
        refreshDocNumber();
        setDate(new Date().toISOString().split('T')[0]);
        setCustomer(null);
        setCustomerList([]);
        setSelectedCustomerName('');
        setBillingAddress('');
        setShippingAddress('');
        setLineItems([]);
        setSearchItem(null);
        setSearchItemInputValue('');
        setItemOptions([]);
        setPackingInstruction('APPROVE');
        setStatutoryRequirement('APPROVE');
        setPackingFile(null);
        setStatutoryFile(null);
        setCrFile(null);
        setCrFileUrl('');
        setSearchCR('');
        setStatus('');
    };

    const handleForwardReverse = (type, currentId) => {
        setIsEditMode(false);
        PreviewContractReview({ type, id: currentId },
            (res) => {
                if (res?.success) {
                    const data = res?.data || {};
                    setMainId(data.id || '');
                    setCrNumber(data.docNo || '');
                    setDocNo(data.crNo || '');
                    setDate(data.crDate ? data.crDate.split('T')[0] : '');

                    const custVal = {
                        cId: data.customerId,
                        cName: data.customerName,
                        label: data.customerCode || data.customerName,
                        id: data.customerId
                    };
                    setCustomer(custVal);
                    setSelectedCustomerName(data.customerName || '');

                    FetchCustomerAddress(
                        { id: data.customerId },
                        (addrRes) => {
                            setBillingAddress(addrRes?.data?.[0]?.cAddress || '');
                            setShippingAddress(addrRes?.data?.[0]?.multiAddress || '');
                        },
                        (err) => { console.error('Customer address fetch error', err); }
                    );

                    setPackingInstruction(data.packingIns === 1 ? 'APPROVE' : 'REJECT');
                    setStatutoryRequirement(data.statutoryReq === 1 ? 'APPROVE' : 'REJECT');
                    // Restore attached CR file URL (if backend returns it)
                    setCrFile(null);  // clear local File object on preview
                    setCrFileUrl(data.crFileUrl || data.file || '');
                    setStatus(Number(data.authorized) === 1 ? 'AUTHORIZED' : 'UNAUTHORIZED');

                    if (res?.items && Array.isArray(res.items)) {
                        setLineItems(res.items.map(item => ({
                            id: item.id,
                            itemId: item.itemId,
                            crQty: item.crQty,
                            crRate: item.crRate,
                            crAmt: item.crAmt,
                            custPoNo: item.custPoNo,
                            custPoDate: item.custPoDate ? item.custPoDate.split('T')[0] : '',
                            custPoLine: item.custPoLine,
                            moq: item.moq || '',
                            itemCode: item.itemCode,
                            itemName: item.itemName,
                            uom: item.uom,
                            mstPrice: item.mstPrice,
                            mstAmt: item.mstAmt,
                            revNoFromMs: 'NA',
                            revNo: 'NA',
                            qtnRef: '',
                            deliverySchedule: '',
                            penaltyClause: '',
                            modeOfShipment: '',
                            packingInstruction: item.packingInstruction || '', // ADD THIS

                        })));
                    } else {
                        setLineItems([]);
                    }
                } else {
                    showNotification('error', 'No record found.');
                }
            },
            (err, msg) => {
                showNotification('error', msg || 'Failed to fetch record.');
            }
        );
    };

    /* ── Step 1: search customers by typing (same API as NewPurchaseOrderEntry.js) ── */
    // Called from TextField onChange inside the Autocomplete — mirrors handleChangeCustomer in PO Entry
    const handleChangeCustomer = (e) => {
        if (!e || !e.target.value) {
            setCustomerList([]);
            return;
        }
        CustomerDropShowdata(
            { code: e.target.value },
            (res) => { setCustomerList(res?.data || []); },
            () => { setCustomerList([]); }
        );
    };

    // Map API response to Autocomplete options — same as optionsCustList in PO Entry
    const optionsCustList = Array.isArray(customerList)
        ? customerList.map(item => ({
            id: item?.id,
            cId: item?.cId,
            label: item?.cCode,
            cName: item?.cName,
        }))
        : [];

    /* ── Step 2: customer selected — fetch address + clear line items for new customer ── */
    const handleCustomerChange = (_, val) => {
        setCustomer(val);
        setSelectedCustomerName(val?.cName || '');
        setBillingAddress('');
        setShippingAddress('');
        // Clear line items when customer changes — items are customer-specific
        setLineItems([]);
        setSearchItem(null);
        setSearchItemInputValue('');
        setItemOptions([]);
        if (!val) return;
        FetchCustomerAddress(
            { id: val?.cId },
            (res) => {
                setBillingAddress(res?.data?.[0]?.cAddress || '');
                setShippingAddress(res?.data?.[0]?.multiAddress || '');
            },
            (err) => { console.error('Customer address fetch error', err); }
        );
    };

    const handleSearchItems = (query) => {
        if (!query) {
            setItemOptions([]);
            return;
        }
        SearchContractReviewItems(
            customer?.id,
            query,
            (res) => {
                if (res.success && res.data) {
                    setItemOptions(Array.isArray(res.data) ? res.data : [res.data]);
                } else {
                    setItemOptions([]);
                }
            },
            (err) => {
                console.error("Item search error", err);
                setItemOptions([]);
            }
        );
    };

    const handleSelectItem = (val) => {
        if (!val) return;
        const newItem = {
            id: Date.now(),
            itemCode: val.itemCode || '',
            itemName: val.itemName || '',
            uom: val.uom || '',
            moq: val.moq || '',
            custPoNo: '',
            custPoDate: '',
            custPoLine: '',
            crQty: 0,
            mstPrice: val.mstPrice || '0.00',
            mstAmt: 0,
            crRate: val.mstPrice || '0.00',
            crAmt: 0,
            revNoFromMs: 'NA',
            revNo: 'NA',
            qtnRef: '',
            deliverySchedule: '',
            penaltyClause: '',
            modeOfShipment: '',
        };
        setLineItems(prev => {
            if (prev.length === 1 && !prev[0].itemCode) return [newItem];
            return [...prev, newItem];
        });
        // Clear search after selection so user can search for next item immediately
        setSearchItem(null);
        setSearchItemInputValue('');
        setItemOptions([]);
    };

    /* ── helper: build FormData payload (multer-compatible) ── */
    const buildFormData = () => {
        const fd = new FormData();
        fd.append('docNo', crNumber);
        fd.append('crNo', docNo);
        fd.append('crDate', date);
        fd.append('customerId', customer?.cId || customer?.id || '');
        fd.append('packingIns', packingInstruction === 'APPROVE' ? 'true' : 'false');
        fd.append('statutoryReq', statutoryRequirement === 'APPROVE' ? 'true' : 'false');
        // CR attachment uploaded via toolbar Upload File button
        if (file) fd.append('file', file);
        if (packingFile) fd.append('packingFile', packingFile);
        if (statutoryFile) fd.append('statutoryFile', statutoryFile);
        fd.append('crData', JSON.stringify(lineItems.map(item => ({
            itemId: item.itemId || item.id,
            crQty: item.crQty,
            crRate: item.crRate,
            crAmt: item.crAmt,
            custPoNo: item.custPoNo,
            custPoDate: item.custPoDate,
            custPoLine: item.custPoLine,
            moq: item.moq || null,
            itemCode: item.itemCode,
            itemName: item.itemName,
            uom: item.uom,
            mstPrice: item.mstPrice,
            mstAmt: item.mstAmt,
        }))));
        return fd;
    };

    /* ── SAVE — POST FormData to contractReview (multer) ── */
    const handleSave = () => {
        if (!customer) { showNotification('error', 'Please select a customer before saving.'); return; }
        if (lineItems.length === 0) { showNotification('error', 'Please add at least one line item.'); return; }
        const fd = buildFormData();
        SaveContractReview(
            fd,
            (res) => {
                showNotification('success', res?.message || 'Contract Review saved successfully!');
                if (res?.data?.id) setMainId(res.data.id);
                setIsEditMode(false);
            },
            (err, msg) => { showNotification('error', msg || 'Failed to save Contract Review.'); }
        );
    };

    /* ── UPDATE — PUT FormData to contractReview/:id (multer) ── */
    const handleUpdate = () => {
        if (!mainId) { showNotification('error', 'No record selected to update.'); return; }
        if (!customer) { showNotification('error', 'Please select a customer before updating.'); return; }
        if (lineItems.length === 0) { showNotification('error', 'Please add at least one line item.'); return; }
        const fd = buildFormData();
        UpdateContractReview(
            mainId,
            fd,
            (res) => {
                showNotification('success', res?.message || 'Contract Review updated successfully!');
                setIsEditMode(false);
            },
            (err, msg) => { showNotification('error', msg || 'Failed to update Contract Review.'); }
        );
    };

    /* ── DELETE — DELETE contractReview/:id ── */
    const handleDelete = () => {
        if (!mainId) { showNotification('error', 'No record selected to delete.'); return; }
        if (!window.confirm('Are you sure you want to delete this Contract Review?')) return;
        DeleteContractReview(
            { id: mainId },
            (res) => {
                showNotification('success', res?.message || 'Contract Review deleted successfully!');
                handleClearAll();
                setMainId('');
            },
            (err, msg) => { showNotification('error', msg || 'Failed to delete Contract Review.'); }
        );
    };

    /* ── UPLOAD FILE (IMPORT) — POST FormData to contractReview/import (multer) ── */
    const handleImportFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        // file field — required by multer
        formData.append('file', file);
        // pass header context so backend can link the import to the current CR
        formData.append('docNo', crNumber || '');
        formData.append('crNo', docNo || '');
        formData.append('crDate', date || '');
        formData.append('customerId', customer?.cId || customer?.id || '');
        ImportContractReview(
            formData,
            (res) => {
                if (res?.data && Array.isArray(res.data)) {
                    setLineItems(res.data.map((item, idx) => ({ ...item, id: item.id || Date.now() + idx })));
                }
                showNotification('success', res?.message || 'File imported successfully!');
                e.target.value = '';
            },
            (err, msg) => {
                showNotification('error', msg || 'File import failed.');
                e.target.value = '';
            }
        );
    };

    const handleCellChange = (id, field, value) => {
        if (!isEditMode) return;

        setLineItems(prev =>
            prev.map(item => {
                if (item.id !== id) return item;

                const updated = { ...item, [field]: value };

                if (
                    field === 'crQty' ||
                    field === 'crRate' ||
                    field === 'mstPrice'
                ) {
                    const qty = parseFloat(updated.crQty) || 0;

                    updated.crAmt = parseFloat(
                        (qty * (parseFloat(updated.crRate) || 0)).toFixed(2)
                    );

                    updated.mstAmt = parseFloat(
                        (qty * (parseFloat(updated.mstPrice) || 0)).toFixed(2)
                    );
                }

                return updated;
            })
        );
    };

    const handleCopyRow = (item) =>
        setLineItems(prev => [...prev, { ...item, id: Date.now() }]);

    const handleRemoveRow = (id) => {
        if (lineItems.length > 1)
            setLineItems(prev => prev.filter(i => i.id !== id));
    };

    const totalQty = lineItems.reduce((s, i) => s + (parseFloat(i.crQty) || 0), 0);
    const grossAmt = lineItems.reduce((s, i) => s + (parseFloat(i.crAmt) || 0), 0);

    /* ════════════════════════ RENDER ════════════════════════ */
    return (
        <Box sx={{ backgroundColor: '#eef0f4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* ═══ TOP TITLE BAR ═══ */}
            <Box sx={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                px: 2, pt: 1.5, pb: 1.5
            }}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1a233a' }}>
                        Contract Review
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                    <Typography sx={{ color: status === 'AUTHORIZED' ? '#27ae60' : '#e74c3c', fontWeight: 700, fontSize: '0.85rem', letterSpacing: 0.5 }}>
                        {status}
                    </Typography>
                    <Autocomplete
                        disablePortal
                        options={Array.isArray(searchCRList) ? searchCRList : []}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return option?.crNo || option?.docNo || '';
                        }}
                        value={searchCR ? { crNo: searchCR } : null}
                        isOptionEqualToValue={(option, val) => option?.crNo === val?.crNo || option?.docNo === val?.crNo}
                        onChange={(event, value) => {
                            if (value && typeof value !== 'string') {
                                setSearchCR(value.crNo || value.docNo || '');
                                handleForwardReverse("id", value.id);
                                setIsEditMode(false);
                            } else {
                                setSearchCR('');
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            if (newInputValue) {
                                SearchContractReview(newInputValue,
                                    (res) => {
                                        const fetchedData = res?.data;
                                        setSearchCRList(Array.isArray(fetchedData) ? fetchedData : (fetchedData ? [fetchedData] : []));
                                    },
                                    () => { setSearchCRList([]); }
                                );
                            } else {
                                setSearchCRList([]);
                            }
                        }}
                        size="small"
                        sx={{ width: 225, backgroundColor: '#fff', borderRadius: 1 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Search CR"
                                label="Search CR"
                            />
                        )}
                    />
                </Box>
            </Box>

            {/* ═══ MAIN FORM AREA ═══ */}
            <Box display="flex" justifyContent="space-between" px={2} mb={1} gap={3}>

                {/* ── LEFT SIDE (Form Fields) ── */}
                <Box display="flex" flexDirection="column" gap={1.5} sx={{ flexGrow: 1, maxWidth: 1200 }}>

                    {/* Row 1 – CR No / Date / Doc No / Refresh */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {/* CR No prefix + number */}
                        <FormControl size="small" sx={{ flex: 1 }}>
                            <InputLabel sx={{ fontSize: '0.85rem', color: '#6c757d' }}>Doc No</InputLabel>
                            <OutlinedInput
                                label="Doc No"
                                value={crNumber}
                                disabled={!isEditMode}

                                onChange={e => setCrNumber(e.target.value)}
                                sx={{ fontSize: '0.85rem', borderRadius: 1, backgroundColor: '#fff' }}
                            // startAdornment={
                            //     <InputAdornment position="start">
                            //         <Select
                            //             value={crPrefix}
                            //             onChange={e => setCrPrefix(e.target.value)}
                            //             sx={{
                            //                 '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            //                 borderRight: '1px solid #ced4da',
                            //                 borderRadius: 0,
                            //                 mr: 1,
                            //                 '& .MuiSelect-select': { pl: 0, pr: 2, fontSize: '0.85rem', py: 0 }
                            //             }}
                            //             IconComponent={ArrowDropDownIcon}
                            //         >
                            //             <MenuItem value="R">R</MenuItem>
                            //             <MenuItem value="CR">CR</MenuItem>
                            //         </Select>
                            //     </InputAdornment>
                            // }
                            />
                        </FormControl>

                        {/* Date */}


                        {/* Doc No */}
                        <TextField
                            size="small" value={docNo}
                            onChange={e => setDocNo(e.target.value)}
                            sx={{ ...flatInputSx, flex: 1 }}
                            label="CR No"
                            disabled={!isEditMode}

                        />
                        <TextField
                            size="small" type="date" value={date}
                            onChange={e => setDate(e.target.value)}
                            sx={{ ...flatInputSx, flex: 1 }}
                            disabled={!isEditMode}

                        />
                        {/* Refresh icon – regenerates doc number */}
                        <IconButton
                            size="small"
                            title="Refresh Document Number"
                            onClick={() =>
                                GenerateContractReviewDocNo(
                                    (res) => {
                                        if (res?.success) {
                                            setCrNumber(res?.digit || '');
                                            setDocNo(res?.uniqueNo || '');
                                        }
                                    },
                                    (err) => console.error('Doc number refresh error', err)
                                )
                            }
                            sx={{ color: '#6c757d', border: '1px solid #ced4da', borderRadius: 1, p: '7px', backgroundColor: '#fff', '&:hover': { backgroundColor: '#f8f9fa' } }}
                        >
                            <RefreshIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>

                    {/* Row 2 – Customer (type-to-search, exact pattern from New PO-Sales Order Entry) */}
                    <Box sx={{ width: '49.5%' }}>
                        <Autocomplete
                            disablePortal
                            options={optionsCustList}
                            getOptionLabel={o => o.cName || o.label || ''}
                            value={customer}
                            disabled={!isEditMode}

                            onChange={handleCustomerChange}
                            filterOptions={(x) => x}
                            size="small"
                            fullWidth
                            noOptionsText="Type customer name to search..."
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Search Customer"
                                    onChange={handleChangeCustomer}
                                    sx={{ ...flatInputSx }}
                                />
                            )}
                        />
                    </Box>

                    {/* Row 3 – Billing / Shipping / Statutory */}
                    <Box display="flex" gap={1.5} sx={{ width: '100%' }} alignItems="flex-start">

                        {/* Billing Address */}
                        <Box sx={{ flex: 1 }} display="flex" flexDirection="column" alignItems="flex-start">
                            <TextField
                                label="Billing Address"
                                size="small" multiline rows={2} fullWidth
                                value={billingAddress}
                                onChange={e => setBillingAddress(e.target.value)}
                                sx={{ ...multilineSx, '& .MuiInputBase-root': { height: 75, alignItems: 'flex-start', backgroundColor: '#ffffff' } }}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: '#adb5bd', fontWeight: 600, cursor: 'pointer', mt: 0.5, letterSpacing: 0.5 }}>
                                CHANGE
                            </Typography>
                        </Box>

                        {/* Shipping Address */}
                        <Box sx={{ flex: 1 }} display="flex" flexDirection="column" alignItems="flex-start">
                            <TextField
                                label="Shipping Address"
                                size="small" multiline rows={2} fullWidth
                                value={shippingAddress}
                                onChange={e => setShippingAddress(e.target.value)}
                                sx={{ ...multilineSx, '& .MuiInputBase-root': { height: 75, alignItems: 'flex-start', backgroundColor: '#ffffff' } }}
                            />
                            <Typography sx={{ fontSize: '0.65rem', color: '#adb5bd', fontWeight: 600, cursor: 'pointer', mt: 0.5, letterSpacing: 0.5 }}>
                                CHANGE
                            </Typography>
                        </Box>

                        {/* Statutory Requirement – inline with addresses */}


                    </Box>

                </Box>
                <Box sx={{
                    flexShrink: 0,
                    border: '1px solid #e0e6ef',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 8px rgba(0,40,104,0.06)',
                    px: 1.5,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    minWidth: 230,
                    height: 75,
                }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a233a', lineHeight: 1.3 }}>
                            Statutory Requirement
                        </Typography>
                        <Typography sx={{ fontSize: '0.70rem', color: '#6c757d' }}>
                            Review the statutory requirement document.
                        </Typography>
                    </Box>
                    <IconButton
                        onClick={() => { setIsStatutoryModalOpen(true); }}
                        disabled={!customer}
                        sx={{
                            border: '1px solid #2563eb',
                            color: '#2563eb',
                            borderRadius: '7px',
                            width: 30,
                            height: 30,
                            flexShrink: 0,
                            '&:hover': { backgroundColor: '#eff6ff', borderColor: '#1d4ed8' },
                        }}
                    >
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Box>
            </Box>

            {/* ═══ ACTION TOOLBAR ═══ */}
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 1.2,
                backgroundColor: '#fff',
                borderTop: '1px solid #ced4da',
                borderBottom: '1px solid #ced4da',
                mx: 1, mt: 1,
                borderTopLeftRadius: 8, borderTopRightRadius: 8
            }}>
                <Button sx={toolbarBtnSx} onClick={handleClearAll}>NEW</Button>
                <Button
                    sx={toolbarBtnSx}
                    onClick={() => setIsEditMode(true)}
                >
                    EDIT
                </Button>
                <Button
                    sx={mainId ? toolbarBtnSx : disabledTextVisibleSx}
                    disabled={!mainId}
                    onClick={handleDelete}
                >
                    DELETE
                </Button>
                <Button sx={toolbarBtnSx} onClick={handleClearAll}>CLEAR</Button>
                {/* ── Upload File: stores file in file state; sent as 'file' on SAVE/UPDATE ── */}
                <Button
                    disabled={!isEditMode}
                    sx={!isEditMode ? disabledTextVisibleSx : toolbarBtnSx}
                    component="label"
                >
                    Upload File
                    <input
                        type="file"
                        hidden
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) { setCrFile(f); setCrFileUrl(''); }
                            e.target.value = '';
                        }}
                    />
                </Button>
                {/* ── Show file chip + View button when a file is attached ── */}

                <Button
                    sx={{ ...navBtnSx, backgroundColor: activeButton === 'first' ? '#0d6efd' : '#002868' }}
                    onClick={() => { setActiveButton("first"); handleForwardReverse("first", ""); }}
                ><FastRewindIcon sx={{ fontSize: 18 }} /></Button>
                <Button
                    sx={{ ...navBtnSx, backgroundColor: activeButton === 'prev' ? '#0d6efd' : '#002868' }}
                    onClick={() => { setActiveButton("prev"); handleForwardReverse("reverse", mainId); }}
                ><SkipPreviousIcon sx={{ fontSize: 18 }} /></Button>
                <Button
                    sx={{ ...navBtnSx, backgroundColor: activeButton === 'next' ? '#0d6efd' : '#002868' }}
                    onClick={() => { setActiveButton("next"); handleForwardReverse("forward", mainId); }}
                ><SkipNextIcon sx={{ fontSize: 18 }} /></Button>
                <Button
                    sx={{ ...navBtnSx, backgroundColor: activeButton === 'last' ? '#0d6efd' : '#002868' }}
                    onClick={() => { setActiveButton("last"); handleForwardReverse("last", ""); }}
                ><FastForwardIcon sx={{ fontSize: 18 }} /></Button>

                <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                    {(file || crFileUrl) && (
                        <Box display="flex" alignItems="center" gap={0.5}
                            sx={{ px: 1, py: 0.3, backgroundColor: '#e8f0fb', borderRadius: 1, border: '1px solid #93c5fd' }}
                        >
                            <AttachFileIcon sx={{ fontSize: 14, color: '#2563eb' }} />
                            <Typography variant="caption" noWrap sx={{ maxWidth: 120, fontSize: '0.72rem', color: '#1d4ed8', fontWeight: 600 }}>
                                {file ? file.name : 'Attached File'}
                            </Typography>
                            {/* View button — opens file in a preview dialog */}
                            <IconButton
                                size="small"
                                title="View uploaded file"
                                onClick={() => {
                                    if (crFileUrl) {
                                        setFilePreviewUrl(`${IMAGE_URL}${crFileUrl}`);
                                    } else if (file) {
                                        setFilePreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                                sx={{ p: 0.3, color: '#2563eb' }}
                            >
                                <VisibilityIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                            {/* Remove / clear the file */}
                            {isEditMode && (
                                <IconButton size="small" onClick={() => { setCrFile(null); setCrFileUrl(''); }} sx={{ p: 0.2, color: '#6c757d' }}>
                                    <CloseIcon sx={{ fontSize: 13 }} />
                                </IconButton>
                            )}
                        </Box>
                    )}
                    {/* TEMPLATE — download blank Excel template */}
                    <Button
                        disabled={!isEditMode}
                        sx={!isEditMode ? disabledTextVisibleSx : toolbarBtnSx}
                        onClick={() => {
                            DownloadContractReviewTemplate(
                                {},
                                () => {
                                    showNotification('success', 'Template downloaded successfully');
                                },
                                (err, msg) => {
                                    showNotification('error', msg || 'Failed to download template');
                                }
                            );
                        }}
                    >
                        TEMPLATE
                    </Button>
                    <Button
                        disabled={!isEditMode}
                        sx={!isEditMode ? disabledTextVisibleSx : toolbarBtnSx}
                        component="label"
                    >
                        LOAD EXCEL
                        <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleImportFile} />
                    </Button>
                    {/* Show UPDATE when editing an existing record, SAVE for new records */}
                    {mainId && isEditMode ? (
                        <Button sx={toolbarBtnSx} onClick={handleUpdate}>UPDATE</Button>
                    ) : (
                        <Button disabled={!isEditMode} sx={!isEditMode ? disabledTextVisibleSx : toolbarBtnSx} onClick={handleSave}>SAVE</Button>
                    )}
                </Box>
            </Box>

            {/* ═══ DATA TABLE ═══ */}
            <Box sx={{ backgroundColor: '#fff', flexGrow: 1, mx: 1 }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0, border: '1px solid #ced4da', borderTop: 'none', overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 1600 }}>

                        {/* Light blue header */}
                        <TableHead>
                            <TableRow>
                                {[
                                    'Item Code', 'Item Name', 'UOM', 'MOQ',
                                    'Cust PO No', 'Cust PO Date', 'Cust PO Line', 'PO Qty',
                                    'MST Price', 'MST Amt', 'CR Rate', 'CR Amt',
                                    'REV NO', 'QTN Ref', 'Delivery Schedule',
                                    'Penalty Clause', 'Mode of Shipment', 'Packing Instruction', 'Actions'
                                ].map(col => (
                                    <TableCell key={col} sx={thSx}>{col}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {lineItems.map(item => (
                                <TableRow key={item.id}
                                    sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>

                                    {/* Item Code */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        {item.child && item.child.length > 0 ? (
                                            <Typography
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    color: '#2563eb',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    '&:hover': { color: '#1d4ed8' }
                                                }}
                                                onClick={() => {
                                                    setSelectedChildItem(item);
                                                    setIsChildModalOpen(true);
                                                }}
                                            >
                                                {item.itemCode || item.partNo || ''}
                                            </Typography>
                                        ) : (
                                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                {item.itemCode || item.partNo || ''}
                                            </Typography>
                                        )}
                                    </TableCell>

                                    {/* Item Name */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef', minWidth: 150 }}>
                                        <Typography sx={{ fontSize: '0.8rem' }}>{item.itemName || item.partName || ''}</Typography>
                                    </TableCell>

                                    {/* UOM */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        <Typography sx={{ fontSize: '0.8rem' }}>{item.uom}</Typography>
                                    </TableCell>

                                    {/* MOQ */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        <Typography sx={{ fontSize: '0.8rem' }}>{item.moq}</Typography>
                                    </TableCell>

                                    {/* Cust PO No */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.custPoNo || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'custPoNo', e.target.value)}
                                            sx={{
                                                width: 80,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Cust PO Date */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small" type="date"
                                            value={item.custPoDate || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'custPoDate', e.target.value)}
                                            sx={{
                                                width: 120,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#fffdf2' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Cust PO Line */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.custPoLine || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'custPoLine', e.target.value)}
                                            sx={{
                                                width: 60,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px', textAlign: 'center' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* PO Qty (crQty) */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small" type="number"
                                            value={item.crQty}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'crQty', e.target.value)}
                                            sx={{
                                                width: 60,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px', textAlign: 'right' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* MST Price */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.mstPrice) || 0).toFixed(2)}</Typography>
                                    </TableCell>

                                    {/* MST Amt */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.mstAmt) || 0).toFixed(2)}</Typography>
                                    </TableCell>

                                    {/* CR Rate */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small" type="number"
                                            value={item.crRate}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'crRate', e.target.value)}
                                            sx={{
                                                width: 80,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px', textAlign: 'right' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* CR Amt */}
                                    <TableCell sx={{ ...tdSx, borderRight: '1px solid #e9ecef' }}>
                                        <Typography sx={{ fontSize: '0.8rem', textAlign: 'right' }}>{(parseFloat(item.crAmt) || 0).toFixed(2)}</Typography>
                                    </TableCell>

                                    {/* REV No From Ms */}
                                    {/* <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.revNoFromMs || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'revNoFromMs', e.target.value)}
                                            sx={{
                                                width: 80,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell> */}

                                    {/* REV NO */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.revNo || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'revNo', e.target.value)}
                                            sx={{
                                                width: 80,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* QTN Ref */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.qtnRef || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'qtnRef', e.target.value)}
                                            sx={{
                                                width: 80,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Delivery Schedule (schDate / deliverySchedule) */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small" type="date"
                                            value={item.deliverySchedule || item.schDate || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'deliverySchedule', e.target.value)}
                                            sx={{
                                                width: 120,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem', backgroundColor: '#fffdf2' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Penalty Clause */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.penaltyClause || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'penaltyClause', e.target.value)}
                                            sx={{
                                                width: 100,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Mode of Shipment */}
                                    <TableCell sx={{ ...tdSx, p: 0.5, borderRight: '1px solid #e9ecef' }}>
                                        <TextField
                                            variant="outlined" size="small"
                                            value={item.modeOfShipment || ''}
                                            disabled={!isEditMode}

                                            onChange={e => handleCellChange(item.id, 'modeOfShipment', e.target.value)}
                                            sx={{
                                                width: 100,
                                                '& .MuiInputBase-root': { height: 28, borderRadius: 1, fontSize: '0.8rem' },
                                                '& input': { p: '4px 8px' },
                                            }}
                                        />
                                    </TableCell>

                                    {/* Packing Instruction */}
                                    <TableCell
                                        sx={{
                                            ...tdSx,
                                            borderRight: '1px solid #e9ecef',
                                            textAlign: 'center',
                                            verticalAlign: 'middle',
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            title="View Packing Instruction"
                                            onClick={() => {
                                                setSelectedPackingItem(item);
                                                setIsPackingModalOpen(true);
                                            }}
                                            sx={{
                                                border: '1px solid #2563eb',
                                                color: '#2563eb',
                                                borderRadius: '8px',
                                                width: 28,
                                                height: 28,
                                                '&:hover': {
                                                    backgroundColor: '#eff6ff',
                                                    borderColor: '#1d4ed8',
                                                },
                                            }}
                                        >
                                            <VisibilityIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell sx={{ ...tdSx, whiteSpace: 'nowrap' }}>
                                        <IconButton size="small"
                                            onClick={() => handleCopyRow(item)}
                                            sx={{ p: 0.3, color: '#6c757d' }}>
                                            <ContentCopyIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton size="small"
                                            onClick={() => handleRemoveRow(item.id)}
                                            disabled={lineItems.length === 1}
                                            sx={{ p: 0.3, color: '#6c757d', ml: 0.5 }}>
                                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Search Items row */}
                            <TableRow sx={{ backgroundColor: '#fff' }}>
                                <TableCell colSpan={19} sx={{ py: 1.5, px: 1.5, borderBottom: 'none' }}>
                                    <Autocomplete
                                        options={itemOptions}
                                        getOptionLabel={o => o.itemCode ? `${o.itemCode} - ${o.itemName}` : ''}
                                        value={searchItem}
                                        inputValue={searchItemInputValue}
                                        onChange={(_, v) => handleSelectItem(v)}
                                        onInputChange={(_, val) => {
                                            setSearchItemInputValue(val);
                                            handleSearchItems(val);
                                        }}
                                        filterOptions={(x) => x}
                                        size="small"
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                placeholder="Search Items"
                                                sx={{
                                                    width: 250,
                                                    '& .MuiInputBase-root': {
                                                        height: 32, borderRadius: 1, fontSize: '0.85rem', backgroundColor: '#fff'
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ced4da' },
                                                }}
                                            />
                                        )}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* ── Notification Snackbar ── */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={closeNotification} severity={notification.type} sx={{ width: '100%', fontWeight: 500 }}>
                    {notification.message}
                </Alert>
            </Snackbar>
            {/* <PackingInstructionModal
                open={isPackingModalOpen}
                onClose={() => { setIsPackingModalOpen(false); setSelectedPackingItem(null); }}
                items={selectedPackingItem ? [selectedPackingItem] : []}
                contractNo={docNo}
            /> */}
            <PackingInstructionModal
                open={isPackingModalOpen}
                onClose={() => {
                    setIsPackingModalOpen(false);
                    setSelectedPackingItem(null);
                }}
                packingInstruction={selectedPackingItem?.packingInstruction}
            />
            <StatutoryRequirementModal
                open={isStatutoryModalOpen}
                onClose={() => setIsStatutoryModalOpen(false)}
                customerId={customer?.cId}
                customerName={customer?.cName}
            />

            {/* ── File Preview Dialog ── */}
            <Dialog
                open={Boolean(filePreviewUrl)}
                onClose={() => setFilePreviewUrl('')}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, px: 2, borderBottom: '1px solid #e0e6ef' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a233a' }}>Attached File</Typography>
                    <IconButton size="small" onClick={() => setFilePreviewUrl('')}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, minHeight: 500, backgroundColor: '#f9fbfd' }}>
                    {filePreviewUrl && (() => {
                        const ext = filePreviewUrl.split('.').pop().toLowerCase().split('?')[0];
                        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                            return (
                                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
                                    <img src={filePreviewUrl} alt="Attached" style={{ maxWidth: '100%', maxHeight: 600, objectFit: 'contain', borderRadius: 4 }} />
                                </Box>
                            );
                        } else if (ext === 'pdf') {
                            return (
                                <iframe
                                    src={filePreviewUrl}
                                    width="100%"
                                    height="600px"
                                    title="File Preview"
                                    style={{ border: 'none' }}
                                />
                            );
                        } else {
                            return (
                                <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 500, justifyContent: 'center' }}>
                                    <AttachFileIcon sx={{ fontSize: 56, color: '#6c757d' }} />
                                    <Typography color="textSecondary">Preview not available for this file type.</Typography>
                                    <Button variant="outlined" href={filePreviewUrl} download sx={{ textTransform: 'none' }}>
                                        Download File
                                    </Button>
                                </Box>
                            );
                        }
                    })()}
                </DialogContent>
                <DialogActions sx={{ px: 2, py: 1, borderTop: '1px solid #e0e6ef' }}>
                    <Button href={filePreviewUrl} download variant="outlined" sx={{ textTransform: 'none', fontSize: '0.82rem' }}>Download</Button>
                    <Button onClick={() => setFilePreviewUrl('')} variant="contained" sx={{ textTransform: 'none', fontSize: '0.82rem', backgroundColor: '#002868' }}>Close</Button>
                </DialogActions>
            </Dialog>
            {/* ── Child Items Modal ── */}
            <Dialog
                open={isChildModalOpen}
                onClose={() => setIsChildModalOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ py: 1.5, px: 2, borderBottom: '1px solid #e0e6ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a233a' }}>
                        ITEM NO: {selectedChildItem?.itemCode || selectedChildItem?.partNo || ''}
                    </Typography>
                    <IconButton size="small" onClick={() => setIsChildModalOpen(false)}>
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <TableContainer component={Paper} sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: 2 }}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: '#93bce6' }}>
                                <TableRow>
                                    {['S.No', 'Item Code', 'Item Name', 'UOM', 'Qty', 'Basic Rate', 'Final Rate'].map(col => (
                                        <TableCell key={col} sx={{ fontWeight: 700, color: '#1c1919', fontSize: '0.8rem' }}>{col}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedChildItem?.child?.map((childItem, index) => (
                                    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{index + 1}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{childItem.partNo}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{childItem.itemName}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{childItem.uom}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{childItem.Qty}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: childItem.colorStatus }}>
                                            {childItem.basicRate}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: childItem.colorStatus }}>
                                            {childItem.finalRate}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Packing Details row */}
                    {selectedChildItem?.packingDetails && (
                        <Box display="flex" gap={2} mt={2}>
                            <TextField
                                label="Packing Rate"
                                size="small"
                                value={selectedChildItem.packingDetails.packingRate || ''}
                                InputProps={{ readOnly: true }}
                                sx={{ flex: 1, backgroundColor: '#fff' }}
                            />
                            <TextField
                                label="No Of Packing"
                                size="small"
                                value={selectedChildItem.packingDetails.noOfPacking || ''}
                                InputProps={{ readOnly: true }}
                                sx={{ flex: 1, backgroundColor: '#fff' }}
                            />
                            <TextField
                                label="Total Packing + Total Item Changes"
                                size="small"
                                value={selectedChildItem.packingDetails.totCharge || ''}
                                InputProps={{ readOnly: true }}
                                sx={{ flex: 2, backgroundColor: '#fff' }}
                            />
                            <TextField
                                label="Total Packing Changes"
                                size="small"
                                value={selectedChildItem.packingDetails.packingCharge || ''}
                                InputProps={{ readOnly: true }}
                                sx={{ flex: 1, backgroundColor: '#fff' }}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid #e0e6ef' }}>
                    <Button onClick={() => setIsChildModalOpen(false)} variant="contained" sx={{ backgroundColor: '#002D68', '&:hover': { backgroundColor: '#001b40' } }}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ContractReview;

