import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useRef } from "react";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { useEffect } from "react";
import ChangeAddress from "../Accounting/GSTSalesInvoice/ChangeAddress";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationBar from "../GlobleFiles/ServiceNotificationBar";
import "../PurchaseOrderGeneration/PurchaseOrder.css";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useModuleLocks } from "../context/ModuleLockContext";
import PackingListPdf from "../Accounting/GSTSalesInvoice/PackingListPdf";
import {
    CustomerDropShowInvoice,
    FetchGSTCustomerAddress,
    PackingListAdd,
    PackingListUpdate,
    PackingListGetItems,
    PackingListSearchEntry,
    PackingListViewing,
    PackingListDelete,
    MstDispatchShowData,
    MstTransporterShowData,
    PackingListGenerateNo,
    PartNoSelectShow,
    PackingListPartNoSelect,
} from "../../ApiService/LoginPageService";
import LoadPendingEXPModal from "./LoadPendingEXPModal";
import DeleteConfirmationDailog from "../../Utility/confirmDeletion";

const ViewPackingList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const poRowId = new URLSearchParams(location.search).get("poRowId");
    const isPackingListAuthorizeView = new URLSearchParams(location.search).get("isPackingListAuthorizeView");
    const [activeButton, setActiveButton] = useState("");
    const [partNoList, setPartNoList] = useState([]);

    const moduleLocks = useModuleLocks();
    const isModuleLocked =
        moduleLocks.find((m) => m.moduleName === "Packing List")?.lockStatus ===
        "locked";

    const getHighlightStyle = (name, baseStyle = {}) => ({
        ...baseStyle,
        backgroundColor: isModuleLocked
            ? "gray"
            : activeButton === name
                ? "#0d6efd"
                : baseStyle.background,
        transition: "0.3s",
        color: "white",
    });

    // ---------------- HEADER STATES ----------------
    const [plCode, setPlCode] = useState("PC");
    const [plAutoCode, setPlAutoCode] = useState(""); // running digit (e.g. 1)
    const [autoCode, setAutoCode] = useState(""); // full code (e.g. 2627/PC/00001)
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [customerSelectList, setCustomerSelectList] = useState([]);
    const [selectedCustomerName, setSelectedCustomerName] = useState("");
    const [cId, setCId] = useState("");
    const [customerSid, setCustomerSid] = useState("");

    const [billingAddress, setBillingAddress] = useState("");
    const [clearAddress, setClearAddress] = useState(false);
    const [manualEntry, setManualEntry] = useState(false);
    const [exportInvoiceNo, setExportInvoiceNo] = useState("");
    const [transporterGSTIN, setTransporterGSTIN] = useState("");
    const [remarks, setRemarks] = useState("");

    const [changeAddressModalOpen, setChangeAddressModalOpen] = useState(false);
    const [selectedChangeAddress, setSelectedChangeAddress] = useState();

    // ---------------- RIGHT PANEL STATES ----------------
    const [invoiceIssueDate, setInvoiceIssueDate] = useState("");
    const [dcNo, setDcNo] = useState("");
    const [dcDate, setDcDate] = useState("");
    const [modeOfDispach, setModeOfDispach] = useState("");
    const [shipDate, setShipDate] = useState("");
    const [vechicleNo, setVechicleNo] = useState("");
    const [consignee, setConsignee] = useState("");
    const [add4, setAdd4] = useState("");
    const [city, setCity] = useState("");
    const [transactionType, setTransactionType] = useState("");
    const [gstNo, setGstNo] = useState("");
    const [panNo, setPanNo] = useState("");
    const [modeOfType, setModeOfType] = useState("");

    // ---------------- LOAD PENDING EXP ----------------
    const [loadPendingModalOpen, setLoadPendingModalOpen] = useState(false);
    const [custAllAddressList, setCustAllAddressList] = useState([]);

    // ---------------- ITEM GRID ----------------
    const [selectedItems, setSelectedItems] = useState([{ id: "RDL1", uniqueFId: "RDL1" }]);
    const [pendingItems, setPendingItems] = useState([]);

    const [totQty, setTotQty] = useState(0);
    const [totPackages, setTotPackages] = useState(0);
    const [totNetWeight, setTotNetWeight] = useState(0);
    const [totGrossWeight, setTotGrossWeight] = useState(0);

    const [packageType, setPackageType] = useState("");
    const [packingMethod, setPackingMethod] = useState("");
    const [transporter, setTransporter] = useState("");
    const [dispatchDate, setDispatchDate] = useState("");

    // ---------------- REMARKS ----------------
    const [remarks1, setRemarks1] = useState("");
    const [remarks2, setRemarks2] = useState("");
    const [remarks3, setRemarks3] = useState("");
    const [remarks4, setRemarks4] = useState("");
    const [remarks5, setRemarks5] = useState("");

    // ---------------- NAV / VIEW / EDIT STATES ----------------
    const [isPLView, setIsPLView] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [mainId, setMainId] = useState("");
    const [isAuth, setIsAuth] = useState(0);
    const [loading, setLoading] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [generatedPlLists, setGeneratedPlLists] = useState([]);

    // ---------------- ERROR VALIDATION ----------------
    const [vehicleNoError, setVehicleNoError] = useState(false);
    const [transactionTypeError, setTransactionTypeError] = useState(false);
    const [modeOfTypeError, setModeOfTypeError] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [printAnchorEl, setPrintAnchorEl] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ---------------- PART NO SEARCH STATES ----------------
    const [partNo, setPartNo] = useState("");
    const [partNoLabel, setPartNoLabel] = useState("");
    const [gridLoading, setGridLoading] = useState(false);
    const [rows, setRows] = useState([]);

    const [tableFilterPartNo, setTableFilterPartNo] = useState("");
    const [tableFilterPartNoObj, setTableFilterPartNoObj] = useState(null);

    // Unique Part Nos from loaded EXP items – used by the Autocomplete filter above the grid
    const uniqueLoadedParts = (() => {
        const seen = new Map();
        selectedItems.forEach((item) => {
            if (item.itemCode && !seen.has(item.itemCode)) {
                seen.set(
                    item.itemCode,
                    `${item.itemCode} - ${item.itemName || item.partName || ""}`
                );
            }
        });
        return Array.from(seen.entries()).map(([code, label]) => ({ id: code, label }));
    })();

    const displayedItems = selectedItems.filter((item) => {
        if (!tableFilterPartNo) return true;
        if (!item.itemCode) return true; // Always show the empty/new row
        return item.itemCode === tableFilterPartNo; // exact match on selected Part No
    });

    const handleViewMore = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const [openNotification, setNotification] = useState({
        status: false,
        type: "error",
        message: "",
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    // =====================================================================
    // INITIAL LOAD
    // =====================================================================
    useEffect(() => {
        if (poRowId) {
            handleForwardReverse("search", poRowId);
        } else {
            handleForwardReverse("last", "");
        }
        MstDispatchShowData(handleDispatchshow, handleDispatchshowException);
        MstTransporterShowData(handleTransportershow, handleTransportershowException);
    }, [poRowId]);

    const handleDispatchshow = () => { };
    const handleDispatchshowException = () => { };
    const handleTransportershow = () => { };
    const handleTransportershowException = () => { };

    // =====================================================================
    // PL NO AUTO GENERATION
    // =====================================================================
    const onPlCodeChange = (e) => {
        setPlCode(e.target.value);
        // PackingListAutoGen(
        //     { po: e.target.value },
        //     handlePLAutoGen,
        //     handlePLAutoGenException
        // );
    };

    const handlePLAutoGen = (dataObject) => {
        setPlAutoCode(dataObject.digit);
        setAutoCode(dataObject.id);
    };

    const handlePLAutoGenException = (errorStatus, errorMessage) => {
        setNotification({ status: true, type: "error", message: errorMessage });
    };

    const handleUniqueCodeChange = (e) => {
        const newUniqueCode = e.target.value;
        const baseCode = autoCode.slice(0, 10);
        const paddedCode = newUniqueCode.toString().padStart(2, "0");
        const finalCode = `${baseCode.slice(
            0,
            baseCode.length - paddedCode.length
        )}${paddedCode}`;
        setAutoCode(finalCode);
        setPlAutoCode(newUniqueCode);
    };

    // =====================================================================
    // CUSTOMER SELECTION
    // =====================================================================
    const optionsCustList = Array.isArray(customerSelectList)
        ? customerSelectList.map((item) => ({
            cId: item?.cId,
            label: item?.cCode,
            cName: item?.cName,
        }))
        : [];

    const handleChangeCustomer = (e) => {
        CustomerDropShowInvoice(
            { code: e.target.value },
            handleCustomerDropshow,
            handleCustomerDropshowException
        );
    };

    const handleCustomerDropshow = (dataObject) => {
        setCustomerSelectList(dataObject?.data || []);
    };
    const handleCustomerDropshowException = () => { };

    function onCustomerSelectChange(selectedValue) {
        setSelectedCustomerName(selectedValue?.cName);
        setCId(selectedValue?.cId);
        setCustomerSid(selectedValue?.cId);
        FetchGSTCustomerAddress(
            { id: selectedValue?.cId },
            handleFetchCustAddressSuccess,
            handleFetchCustAddressException
        );
    }

    const handleFetchCustAddressSuccess = (dataObject) => {
        setBillingAddress(dataObject?.data[0]?.cAddress || "");
        setGstNo(dataObject?.data[0]?.gstNo || "");
        setPanNo(dataObject?.data[0]?.panNo || "");
        setAdd4(dataObject?.data[0]?.country || "");
        setCity(dataObject?.data[0]?.city || "");
        setVechicleNo(dataObject?.data[0]?.vechileNO || "");
    };
    const handleFetchCustAddressException = () => { };

    const handleClearAddress = () => {
        setAdd4("");
        setCity("");
        setGstNo("");
        setPanNo("");
    };

    const onModeDispatchChange = (e) => setModeOfDispach(e.target.value);

    // =====================================================================
    // LOAD PENDING EXP (Export Invoice -> Packing List)
    // =====================================================================
    const handleLoadPendingEXPShow = (dataObject) => {
        setCustAllAddressList(dataObject?.data || []);
    };
    const handleLoadPendingEXPException = () => { };

    // =====================================================================
    // GRID EDIT HANDLER  (PL Qty / Box Dimensions / No of Box etc.)
    // =====================================================================
    const handleEdit = (cellNam, newValue, uniqueFId, rowData) => {
        switch (cellNam) {
            case "plQty": {
                const updated = selectedItems.map((data) => {
                    if (data.uniqueFId === uniqueFId) {
                        if (Number(newValue) > Number(rowData.pendQty)) {
                            setNotification({
                                status: true,
                                type: "error",
                                message: "PL Qty cannot be greater than Pending Qty",
                            });
                            return { ...data, plQty: 0, netWeight: 0, totalQty: 0 };
                        }
                        const netWeight = (
                            Number(newValue) * Number(rowData.perPartWeight || 0)
                        ).toFixed(2);
                        return {
                            ...data,
                            plQty: Number(newValue),
                            netWeight,
                        };
                    }
                    return data;
                });
                setSelectedItems(updated);
                calculateTotals(updated);
                break;
            }
            case "perPartWeight": {
                const updated = selectedItems.map((data) => {
                    if (data.uniqueFId === uniqueFId) {
                        const netWeight = (
                            Number(rowData.plQty || 0) * Number(newValue)
                        ).toFixed(2);
                        return { ...data, perPartWeight: newValue, netWeight };
                    }
                    return data;
                });
                setSelectedItems(updated);
                calculateTotals(updated);
                break;
            }
            case "netWeight":
            case "noOfPackages":
            case "boxDimension":
            case "noOfBox":
            case "descOfPackage":
            case "poLineItem":
            case "poNo":
            default:
                return;
        }
    };

    const handleSelectedItemsDeleteRow = (uniqueFId) => {
        const newArray = selectedItems.filter((item) => item.uniqueFId !== uniqueFId);
        setSelectedItems(newArray);
        calculateTotals(newArray);
    };

    // =====================================================================
    // TOTALS
    // =====================================================================
    const calculateTotals = (data) => {
        if (!data || data.length === 0) {
            setTotQty(0);
            setTotPackages(0);
            setTotNetWeight(0);
            setTotGrossWeight(0);
            return;
        }

        const realItems = data.filter(
            (item) => item && item.id !== "RDL1" && !item.uniqueFId?.toString().startsWith("RDL") && !item.id?.toString().startsWith("RDL")
        );

        const calculatedTotQty = parseFloat(
            realItems
                .reduce((acc, item) => acc + (Number(item.plQty) || 0), 0)
                .toFixed(2)
        );

        const calculatedTotPackages = parseFloat(
            realItems
                .reduce((acc, item) => acc + (Number(item.noOfPackages) || Number(item.noOfBox) || 0), 0)
                .toFixed(2)
        );

        const calculatedTotNetWeight = parseFloat(
            realItems
                .reduce((acc, item) => acc + (Number(item.netWeight) || 0), 0)
                .toFixed(2)
        );

        const calculatedTotGrossWeight = parseFloat(
            realItems
                .reduce((acc, item) => acc + (Number(item.grossWeight) || Number(item.netWeight) || 0), 0)
                .toFixed(2)
        );

        setTotQty(calculatedTotQty);
        setTotPackages(calculatedTotPackages);
        setTotNetWeight(calculatedTotNetWeight);
        setTotGrossWeight(calculatedTotGrossWeight);
    };

    useEffect(() => {
        calculateTotals(selectedItems);
    }, [selectedItems]);

    // =====================================================================
    // SAVE / UPDATE
    // =====================================================================
    const handleSubmit = (e) => {
        e.preventDefault();
        let isValid = true;

        // if (!vechicleNo) {
        //     setVehicleNoError(true);
        //     isValid = false;
        // } else setVehicleNoError(false);

        // if (!transactionType) {
        //     setTransactionTypeError(true);
        //     isValid = false;
        // } else setTransactionTypeError(false);

        // if (!modeOfType) {
        //     setModeOfTypeError(true);
        //     isValid = false;
        // } else setModeOfTypeError(false);

        // if (!isValid) {
        //     setNotification({
        //         status: true,
        //         type: "error",
        //         message: "Please fill the required fields",
        //     });
        //     return;
        // }

        const plOrderData = {
            plCode,
            digit: plAutoCode,
            plNo: autoCode,
            date: selectedDate,
            custId: cId,
            billAdd: billingAddress,
            invoIssuDate: invoiceIssueDate,
            dcNO: dcNo,
            dcDate,
            modelOfDis: modeOfDispach,
            shipDate: shipDate,
            vechileNO: vechicleNo,
            Consignee: consignee,
            add4,
            city,
            trType: transactionType,
            modeOfType,
            remarks: remarks,
            totalQty: totQty,
            totNetWeight: totNetWeight,
            grossWeight: totGrossWeight,
            totGrossWeight: totGrossWeight,
            totPackages: totPackages,
            totalPackages: totPackages,
            transporter,
            traDate: dispatchDate,
            packageType,
            packingMethod,
            TransporterGSTIN: transporterGSTIN,
        };

        const plItemData = selectedItems
            .filter((item) => item.id !== "RDL1")
            .map((obj) => ({ ...obj }));

        const requestData = {
            plOrderData,
            plItemData,
            id: isEdit ? mainId : "",
        };

        setLoading(true);
        if (isEdit) {
            PackingListUpdate(mainId, requestData, handleSuccess, handleException);
        } else {
            PackingListAdd(requestData, handleSuccess, handleException);
        }
    };

    const handleSuccess = (dataObject) => {
        setIsEdit(false);
        setNotification({
            status: true,
            type: "success",
            message: dataObject.message,
        });
        const returnedId = dataObject?.data?.id || dataObject?.id || mainId;
        if (!isEdit) {
            handleForwardReverse("last", "");
        } else {
            handleForwardReverse("search", returnedId);
        }
        setTimeout(() => setLoading(false), 1000);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: "error", message: errorMessage });
        setTimeout(() => setLoading(false), 1500);
    };

    // =====================================================================
    // FORWARD / REVERSE NAVIGATION
    // =====================================================================
    const handleForwardReverse = (type, id) => {
        if (type === "search") {
            PackingListViewing({ id }, handleActionSuccess, handleActionException);
            return;
        }
        PackingListGetItems({ type, id }, handleActionSuccess, handleActionException);
    };

    function convertToISO(dateStr) {
        const [day, month, year] = dateStr.split("-");
        const isoDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        return isoDate.toISOString();
    }

    const handleActionSuccess = (dataObject) => {
        setIsPLView(true);
        const data = dataObject.data.invoice || dataObject.data.packingList;
        setPlCode(data?.plCode);
        const rawDate = data?.date || "";
        setSelectedDate(rawDate ? convertToISO(rawDate) : "");
        setPlAutoCode(data?.digit);
        setAutoCode(data?.plNo || "");
        setSelectedCustomerName(data?.cName || "");
        setBillingAddress(data?.billAdd || "");
        setCId(data?.custId || data?.cId || "");
        setCustomerSid(data?.custId || data?.cId || "");
        setInvoiceIssueDate(data?.invoIssuDate || "");
        setDcNo(data?.dcNO || "");
        setDcDate(data?.dcDate || "");
        setModeOfDispach(data?.modelOfDis);
        setShipDate(data?.shipDate || "");
        setVechicleNo(data?.vechileNO || "");
        setRemarks(data?.remarks || "");
        setConsignee(data?.Consignee || "");
        setAdd4(data?.add4 || "");
        setCity(data?.city || "");
        setTransactionType(data?.trType || "");
        setGstNo(data?.gstNo || "");
        setPanNo(data?.panNo || "");
        setModeOfType(data?.modeOfType || "");
        setTransporter(data?.transporter || "");
        setDispatchDate(data?.traDate || "");
        setPackageType(data?.packageType || "");
        setPackingMethod(data?.packingMethod || "");
        setTotQty(data?.totalQty || 0);
        setTotPackages(data?.totalPackages || data?.totPackages || 0);
        setTotNetWeight(data?.totNetWeight || 0);
        setTotGrossWeight(data?.grossWeight || data?.totGrossWeight || 0);
        setIsAuth(data?.isAuth || 0);
        setTransporterGSTIN(data?.TransporterGSTIN || "");
        const itemsWithFId = (dataObject?.data?.items || []).map((item) => ({
            ...item,
            uniqueFId: item.uniqueFId || item.id || `${Date.now()}-${Math.floor(Math.random() * 1000000)}`
        }));
        setSelectedItems(itemsWithFId);
        if (itemsWithFId.length > 0) {
            setExportInvoiceNo(itemsWithFId[0].expNo || "");
        } else {
            setExportInvoiceNo("");
        }
        setMainId(data?.id || "");
    };

    const handleActionException = () => { };

    // =====================================================================
    // SEARCH EXISTING PACKING LIST
    // =====================================================================
    const handlePLSearchChange = (e) => {
        PackingListSearchEntry(
            { type: "packingList", code: e.target.value },
            handleGeneratedPlSuccessShow,
            handleGeneratedPlExceptionShow
        );
    };
    const handleGeneratedPlSuccessShow = (dataObject) => {
        setGeneratedPlLists(dataObject?.data || []);
    };
    const handleGeneratedPlExceptionShow = () => { };

    const handleGeneratedPlSelect = (selectedValue) => {
        setIsPLView(true);
        if (selectedValue !== null) {
            setMainId(selectedValue.id);
            PackingListViewing(
                { id: selectedValue.id },
                handleActionSuccess,
                handleActionException
            );
        }
    };

    // =====================================================================
    // CLEAR / NEW
    // =====================================================================
    const handleClearPage = () => {
        setIsPLView(false);
        setIsEdit(false);
        setVehicleNoError(false);
        setTransactionTypeError(false);
        setModeOfTypeError(false);
        setMainId("");
        setIsAuth(0);
        setPlCode("PC");
        setPlAutoCode("");
        setAutoCode("");
        setSelectedCustomerName("");
        setCustomerSelectList([]);
        setCId("");
        setCustomerSid("");
        setBillingAddress("");
        setClearAddress(false);
        setManualEntry(false);
        setExportInvoiceNo("");
        setTransporterGSTIN("");
        setInvoiceIssueDate("");
        setRemarks("");
        setDcNo("");
        setDcDate("");
        setModeOfDispach("");
        setShipDate("");
        setVechicleNo("");
        setConsignee("");
        setAdd4("");
        setCity("");
        setTransactionType("");
        setGstNo("");
        setPanNo("");
        setModeOfType("");
        setTransporter("");
        setDispatchDate("");
        setPackageType("");
        setPackingMethod("");
        setRemarks1("");
        setRemarks2("");
        setRemarks3("");
        setRemarks4("");
        setRemarks5("");
        setSelectedItems([{ id: "RDL1", uniqueFId: "RDL1" }]);
        setTotQty(0);
        setTotPackages(0);
        setTotNetWeight(0);
        setTotGrossWeight(0);
        setSelectedDate(new Date());
        PackingListGenerateNo({ po: "PC" }, handlePLAutoGen, handlePLAutoGenException);
        // MstDispatchShowData(handleDispatchshow, handleDispatchshowException);
    };

    // =====================================================================
    // DELETE
    // =====================================================================
    const handleDelete = () => setDeleteDailogOpen(true);

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: "success",
            message: dataObject.message,
        });
        setTimeout(() => setDeleteDailogOpen(false), 1500);
        handleClearPage();
    };

    const handleDeleteException = (errorObject, message) => {
        setNotification({ status: true, type: "error", message });
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNotification({ status: false, type: "", message: "" });
    };
    const handleChange = (e) => {
        PartNoSelectShow(
            {
                code: e.target.value,
                id: cId,
            },
            handlePartNoDropshow,
            handlePartNoDropshowException
        );
    };
    const handlePartNoDropshow = (dataObject) => {
        setPartNoList(dataObject?.data || []);
    };

    const handlePartNoDropshowException = (error, errorMessage) => { };

    const optionsPartNoList = partNoList?.map((item) => ({
        id: item?.id,
        value: item?.id,
        label: `${item?.label}`,
    })) || [];

    const optionsPendingList = pendingItems?.map((item) => ({
        ...item,
        id: item.expInvItemId ? `EXP_${item.expInvId}_${item.expInvItemId}` : `EXP_${item.invNo}_${item.itemCode}`,
        value: item.expInvItemId ? `EXP_${item.expInvId}_${item.expInvItemId}` : `EXP_${item.invNo}_${item.itemCode}`,
        label: `${item.itemCode} - ${item.itemName} (EXP: ${item.invNo})`,
    })) || [];

    function onPartNoSelectChange(selectedValue) {
        if (!selectedValue) return;

        if (manualEntry) {
            setPartNo(selectedValue?.id || "");
            setPartNoLabel(selectedValue?.label || "");

            PackingListPartNoSelect(
                {
                    id: selectedValue?.id,
                },
                handlePartNoShowSuccess,
                handlePartNoSelectException
            );
        } else {
            // Map the selected pending item
            const mapped = {
                id: selectedValue.id,
                uniqueFId: `${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
                partNo: selectedValue.itemCode || "",
                itemCode: selectedValue.itemCode || "",
                partName: selectedValue.itemName || "",
                itemName: selectedValue.itemName || "",
                uom: selectedValue.uom || "",
                expNo: selectedValue.invNo || "",
                expQty: selectedValue.expQty || 0,
                cumQty: selectedValue.cumQty || 0,
                pendQty: selectedValue.pendQty || 0,
                plQty: selectedValue.plQty || 0,
                perPartWeight: selectedValue.perPartWeight || 0,
                netWeight: selectedValue.netWeight || 0,
                noOfPackages: selectedValue.noOfPackages || "",
                boxDimension: selectedValue.boxDimension || "",
                noOfBox: selectedValue.noOfBox || "",
                hsnCode: selectedValue.hsnCode || "",
                schDate: selectedValue.schDate || "",
                itemLedger: selectedValue.itemLedger || "",
                descOfPackage: selectedValue.descOfPackage || "",
                poNo: selectedValue.poNo || "",
                poLineItem: selectedValue.poLineItem || "",
                contractNo: selectedValue.contractNo || "",
                expInvId: selectedValue.expInvId || null,
                expInvItemId: selectedValue.expInvItemId || null,
            };

            setSelectedItems((prev) => {
                // Find all actual items
                const base = prev.filter((i) => i.itemCode);
                // Allow same item to be added multiple times for splitting quantity
                return [...base, mapped, { id: `RDL${base.length + 2}`, uniqueFId: `RDL${base.length + 2}` }];
            });
        }
    }
    const handlePartNoShowSuccess = (dataObject) => {
        setGridLoading(false);

        const data = dataObject?.data || [];
        setRows(data);

        const formattedData = data.map((item) => ({
            id: item?.id || null,
            uniqueFId: `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${Math.random()}`,
            expInvId: item?.expInvId || null,
            expInvItemId: item?.expInvItemId || null,

            itemCode: item?.itemCode || "",
            itemName: item?.itemName || "",
            hsnCode: item?.hsnCode || "",
            uom: item?.uom || "",
            qty: item?.invQty || "",
            cumQty: item?.cumQty || "",
            pendQty: item?.pendQty || "",

            cCode: item?.cCode || "",
            cName: item?.cName || "",

            invNo: item?.invNo || "",
            date: item?.date || "",

            perPartWeight: item?.perPartWeight || "",
            netWeight: item?.netWeight || "",

            remarks: "",
            suppDesc: "",
            amt: "",
            newRate: "",
            preRate: "",
        }));

        if (formattedData.length > 0) {
            const clonedSelectedItems = [...selectedItems];

            const lastObj =
                clonedSelectedItems.length > 0
                    ? clonedSelectedItems.pop()
                    : null;

            const existingCodes = new Set(
                clonedSelectedItems.map((item) => item.itemCode)
            );

            const uniqueNewItems = formattedData.filter(
                (item) => !existingCodes.has(item.itemCode)
            );

            if (uniqueNewItems.length < formattedData.length) {
                setNotification({
                    status: true,
                    type: "error",
                    message: "Some items already exist and were not added!",
                });
            }

            if (lastObj) {
                clonedSelectedItems.push(...uniqueNewItems, lastObj);
            } else {
                clonedSelectedItems.push(...uniqueNewItems);
            }

            setSelectedItems(clonedSelectedItems);
        }
    };


    const handlePartNoSelectException = (errorObject, errorMessage) => {
        setRows([]);
    };
    return (
        <>
            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginLeft: "10px",
                        marginTop: "10px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        {isPackingListAuthorizeView === 'true' ?
                            <Link to='/ExportInvoiceAuthorize' style={{ textDecoration: 'none' }}>
                                <Typography
                                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                                    variant="h5"
                                >
                                    {`Packing List Authorize>>`}
                                </Typography>
                            </Link>
                            :
                            ""
                        }
                        <Typography
                            sx={{ fontFamily: "Roboto Slab", fontWeight: "bold" }}
                            variant="h5"
                        >
                            {isPLView
                                ? "View Packing List"
                                : isEdit
                                    ? "Edit Packing List"
                                    : "New Packing List"}
                        </Typography>
                        {(isPLView || isEdit) && mainId && (
                            <Typography
                                variant="h6"
                                style={{
                                    color: isAuth === 1 ? "green" : "red",
                                    fontWeight: "bold",
                                    border: `2px solid ${isAuth === 1 ? "green" : "red"}`,
                                    padding: "2px 10px",
                                    borderRadius: "5px",
                                    fontSize: "1rem",
                                }}
                            >
                                {isAuth === 1 ? "AUTHORIZED" : "UNAUTHORIZED"}
                            </Typography>
                        )}
                    </div>
                    <div style={{ width: "250px", marginRight: "10px" }}>
                        <Autocomplete
                            disablePortal
                            id="combo-box-search-pl"
                            options={generatedPlLists}
                            fullWidth
                            getOptionLabel={(option) => option.no || ""}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search Packing List"
                                    onChange={handlePLSearchChange}
                                />
                            )}
                            onChange={(event, value) => handleGeneratedPlSelect(value)}
                            size="small"
                            style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                        />
                    </div>
                </div>

                <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
                    <Grid container padding={1}>
                        {/* ============== LEFT SIDE : PL NO / CUSTOMER / ADDRESS ============== */}
                        <Grid item xs={12} sm={12} md={5} lg={7} xl={7}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={12} md={2.2} lg={2.2} xl={2.2}>
                                    <FormControl fullWidth>
                                        <Select
                                            size="small"
                                            disabled={isPLView}
                                            style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                            value={plCode}
                                            onChange={onPlCodeChange}
                                        >
                                            <MenuItem value="PC">PC</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4}>
                                    <TextField
                                        fullWidth
                                        label="PL No."
                                        placeholder="PL No."
                                        value={plAutoCode}
                                        disabled={isPLView}
                                        size="small"
                                        style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                        onChange={handleUniqueCodeChange}
                                        inputProps={{ maxLength: 6 }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={12} md={2.2} lg={2.2} xl={2.2}>
                                    <TextField
                                        fullWidth
                                        label="Date"
                                        variant="outlined"
                                        required
                                        type="date"
                                        size="small"
                                        disabled={isPLView || isEdit}
                                        style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                        value={formatDate(selectedDate)}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        inputProps={{ max: getCurrentDate() }}
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={2.8}
                                    lg={2.8}
                                    xl={2.8}
                                    style={{ display: "flex", alignItems: "center" }}
                                >
                                    <TextField
                                        fullWidth
                                        label="PL Code"
                                        placeholder="2627/PC/00001"
                                        value={autoCode}
                                        size="small"
                                        disabled
                                        style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                    />
                                    <Tooltip title="Refresh Doc Number">
                                        <span>
                                            <IconButton
                                                disabled={isPLView || isEdit}
                                                onClick={() => {
                                                    PackingListGenerateNo({ po: "PC" }, handlePLAutoGen, handlePLAutoGenException);

                                                }}
                                                color="primary"
                                                size="small"
                                                style={{ marginLeft: "5px" }}
                                            >
                                                <RefreshIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Grid>

                                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                    <Autocomplete
                                        fullWidth
                                        disablePortal
                                        id="combo-box-customer"
                                        value={selectedCustomerName}
                                        options={optionsCustList}
                                        disabled={isPLView}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Customer"
                                                onChange={handleChangeCustomer}
                                            />
                                        )}
                                        onChange={(event, value) => onCustomerSelectChange(value)}
                                        size="small"
                                        style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                    />

                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        <div>
                                            {!isPLView && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    disabled={manualEntry}
                                                    style={getHighlightStyle("LoadPendingEXP", {
                                                        marginTop: "8px",
                                                        background: manualEntry ? "#ccc" : "#002D68",
                                                        color: manualEntry ? "#666" : "white",
                                                        borderColor: manualEntry ? "#ccc" : "#002D68",
                                                    })}
                                                    onClick={() => {
                                                        setActiveButton("LoadPendingEXP");
                                                        // Clear any manually added items when loading pending EXP
                                                        setSelectedItems([{ id: "RDL1" }]);
                                                        setLoadPendingModalOpen(true);
                                                    }}
                                                >
                                                    Load Pending EXP
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Grid>

                                <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={3}
                                        lg={3}
                                        xl={3}
                                        style={{ float: "right" }}
                                    >
                                        {!isPLView && (
                                            <Button
                                                variant="text"
                                                disabled={!billingAddress}
                                                onClick={() => {
                                                    setSelectedChangeAddress("billing");
                                                    setChangeAddressModalOpen(true);
                                                }}
                                            >
                                                Change
                                            </Button>
                                        )}
                                    </Grid>

                                    <TextField
                                        fullWidth
                                        id="outlined-multiline-static"
                                        label="Billing Address"
                                        multiline
                                        rows={3}
                                        disabled={isPLView}
                                        value={`${selectedCustomerName ? selectedCustomerName : ""}${selectedCustomerName && "\n"
                                            }${billingAddress}`}
                                        readOnly
                                        size="small"
                                        style={{ backgroundColor: "#ffffff", borderRadius: "5px" }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={manualEntry}
                                                onChange={(e) => {
                                                    setManualEntry(e.target.checked);
                                                    // Clear grid rows, loaded pending items, and Part No filter
                                                    setSelectedItems([{ id: "RDL1" }]);
                                                    setPendingItems([]);
                                                    setTableFilterPartNo("");
                                                    setTableFilterPartNoObj(null);
                                                }}
                                            />
                                        }
                                        label="Manual Entry"
                                    />
                                </Grid>

                            </Grid>
                        </Grid>

                        <Grid item xs={12} sm={12} md={0.5} lg={0.5} xl={0.5}></Grid>

                        {/* ============== RIGHT SIDE : DC / DISPATCH / CONSIGNEE PANEL ============== */}
                        <Grid item xs={12} sm={12} md={6.5} lg={4.5} xl={4.5}>
                            <Card
                                style={{
                                    boxShadow: "0 10px 10px 2px rgba(0, 0, 0, 0.2)",
                                    marginTop: "0px",
                                    borderRadius: "10px",
                                    width: "100%",
                                    overflow: "auto",
                                }}
                            >
                                <CardContent style={{ padding: "1" }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <table style={{ width: "100%", height: "100%", borderCollapse: "collapse" }}>                                        <tbody>
                                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Total Qty</th>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}><TextField fullWidth required disabled value={totQty} size="small" InputProps={{ sx: { height: "24px", "& .MuiInputBase-input": { padding: "0 8px", fontSize: "12px" } } }} /></td>
                                                </tr>
                                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Total Packages</th>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}><TextField fullWidth required disabled value={totPackages} size="small" InputProps={{ sx: { height: "24px", "& .MuiInputBase-input": { padding: "0 8px", fontSize: "12px" } } }} /></td>
                                                </tr>
                                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Total Net Weight (KG)</th>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}><TextField fullWidth required disabled value={totNetWeight} size="small" InputProps={{ sx: { height: "24px", "& .MuiInputBase-input": { padding: "0 8px", fontSize: "12px" } } }} /></td>
                                                </tr>
                                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold", textAlign: "left" }}>Total Gross Weight (KG)</th>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px" }}><TextField fullWidth required disabled value={totGrossWeight} size="small" InputProps={{ sx: { height: "24px", "& .MuiInputBase-input": { padding: "0 8px", fontSize: "12px" } } }} /></td>
                                                </tr>
                                                <tr style={{ borderBottom: "1px solid #ddd" }}>
                                                    <td colSpan="2" style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                                                        <Button variant="contained" size="small" onClick={handleViewMore} style={{ marginLeft: "8px", height: "30px", backgroundColor: isModuleLocked ? "gray" : "#002d68", color: 'white' }} disabled={isModuleLocked}>VIEW MORE</Button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                            </table>

                                            <Dialog
                                                maxWidth="lg"
                                                fullWidth
                                                open={isModalOpen}
                                                onClose={handleCloseModal}
                                            >
                                                <DialogContent>
                                                    <Grid container spacing={2} padding={1}>
                                                        <Grid item xs={12} md={7}>
                                                            <Card style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", height: "100%", borderRadius: "8px", display: "flex", flexDirection: "column" }}>
                                                                <CardContent style={{ flexGrow: 1 }}>
                                                                    <Typography variant="h6" gutterBottom style={{ fontWeight: 600, borderBottom: "1px solid #eaeaea", paddingBottom: "10px", marginBottom: "15px" }}>
                                                                        Transport Details
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        <Grid item xs={12} sm={4}>
                                                                            <FormControl fullWidth>
                                                                                <InputLabel id="mode-of-dispatch-label">
                                                                                    Ship Via
                                                                                </InputLabel>
                                                                                <Select
                                                                                    labelId="mode-of-dispatch-label"
                                                                                    id="mode-of-dispatch-select"
                                                                                    value={modeOfDispach}
                                                                                    size="small"
                                                                                    label="Ship Via"
                                                                                    onChange={(e) => setModeOfDispach(e.target.value)}
                                                                                >
                                                                                    <MenuItem value={"By Road"}>By Road</MenuItem>
                                                                                    <MenuItem value={"By Sea"}>By Sea</MenuItem>
                                                                                    <MenuItem value={"By Air"}>By Air</MenuItem>
                                                                                </Select>
                                                                            </FormControl>
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={4}>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                label="Ship Date"
                                                                                type="date"
                                                                                InputLabelProps={{ shrink: true }}
                                                                                value={shipDate ? new Date(shipDate).toISOString().split('T')[0] : ''}
                                                                                onChange={(e) => setShipDate(e.target.value)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={4}>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                label="Vehicle No"
                                                                                value={vechicleNo}
                                                                                onChange={(e) => setVechicleNo(e.target.value)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                label="Transporter"
                                                                                value={transporter}
                                                                                onChange={(e) => setTransporter(e.target.value)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                label="Transporter GSTIN"
                                                                                value={transporterGSTIN}
                                                                                onChange={(e) => setTransporterGSTIN(e.target.value)}
                                                                            />
                                                                        </Grid>
                                                                        <Grid item xs={12} sm={6}>
                                                                            <TextField
                                                                                fullWidth
                                                                                size="small"
                                                                                label="Remarks"
                                                                                value={remarks}
                                                                                onChange={(e) => setRemarks(e.target.value)}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>

                                                        <Grid item xs={12} md={5}>
                                                            <Card style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px", height: "100%", borderRadius: "8px", display: "flex", flexDirection: "column" }}>
                                                                <CardContent style={{ flexGrow: 1 }}>
                                                                    <Typography variant="h6" gutterBottom style={{ fontWeight: 600, borderBottom: "1px solid #eaeaea", paddingBottom: "10px", marginBottom: "15px" }}>
                                                                        Customer Details
                                                                    </Typography>
                                                                    <Grid container spacing={2}>
                                                                        <Grid item xs={12}>
                                                                            <TextField fullWidth size="small" label="GST No." value={gstNo} disabled />
                                                                        </Grid>
                                                                        <Grid item xs={12}>
                                                                            <TextField fullWidth size="small" label="PAN No." value={panNo} disabled />
                                                                        </Grid>
                                                                    </Grid>
                                                                </CardContent>
                                                            </Card>
                                                        </Grid>
                                                    </Grid>
                                                </DialogContent>
                                                <DialogActions style={{ padding: "15px" }}>
                                                    <Button onClick={handleCloseModal} style={{ backgroundColor: "#002d68", color: 'white' }} variant="contained">
                                                        Close
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid >

                        {/* ============== ITEMS GRID ============== */}
                        < Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={2} >
                            <Card
                                style={{
                                    boxShadow: "0 10px 10px 10px rgba(0, 0, 0, 0.2)",
                                    borderRadius: "10px",
                                    width: "100%",
                                    border: "1px solid black",
                                }}
                            >
                                <CardContent>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            marginBottom: "15px"
                                        }}
                                    >
                                        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", columnGap: "10px", rowGap: "10px" }}>
                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("New", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("New");
                                                    handleClearPage();
                                                }}
                                                disabled={isModuleLocked}
                                            >
                                                New
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Edit", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Edit");
                                                    setIsPLView(false);
                                                    setIsEdit(true);
                                                }}
                                                disabled={isModuleLocked}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Delete", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Delete");
                                                    handleDelete();
                                                }}
                                                disabled={isModuleLocked}
                                            >
                                                Delete
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Clear", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Clear");
                                                    handleClearPage();
                                                }}
                                                disabled={isModuleLocked}
                                            >
                                                Clear
                                            </Button>

                                            <PackingListPdf rowData={mainId} disabled={isModuleLocked || (!isPLView && !isEdit)} />

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("First", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("First");
                                                    handleForwardReverse("first", "");
                                                }}
                                                disabled={isEdit}
                                            >
                                                <FastRewindIcon />
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Previous", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Previous");
                                                    handleForwardReverse("reverse", mainId);
                                                }}
                                                disabled={isEdit}
                                            >
                                                <SkipPreviousIcon />
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Next", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Next");
                                                    handleForwardReverse("forward", mainId);
                                                }}
                                                disabled={isEdit}
                                            >
                                                <SkipNextIcon />
                                            </Button>

                                            <Button
                                                variant="contained"
                                                style={getHighlightStyle("Last", { width: "100%", background: "#002D68", height: "35px" })}
                                                onClick={() => {
                                                    setActiveButton("Last");
                                                    handleForwardReverse("last", "");
                                                }}
                                                disabled={isEdit}
                                            >
                                                <FastForwardIcon />
                                            </Button>
                                        </div>

                                        <div style={{ display: "flex", gap: "5px" }}>
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                style={getHighlightStyle("Save", { height: "35px", background: "#002D68" })}
                                                disabled={loading || isModuleLocked}
                                                onClick={() => setActiveButton("Save")}
                                            >
                                                {loading ? (
                                                    <CircularProgress size={24} style={{ color: "white" }} />
                                                ) : isEdit ? (
                                                    "UPDATE"
                                                ) : (
                                                    "SAVE"
                                                )}
                                            </Button>
                                        </div>
                                    </div>


                                    <div style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto" }}>
                                        <table id="customers">
                                            <thead>
                                                <tr>
                                                    <th>SI No</th>
                                                    <th>Part No</th>
                                                    <th>Part Name</th>
                                                    <th>UOM</th>
                                                    <th>EXPNO</th>
                                                    <th>EXPQTY</th>
                                                    {/* <th>Cum Qty</th>
                                                    <th>Pend Qty</th> */}
                                                    <th>PL Qty</th>
                                                    <th>HSNCode</th>
                                                    <th>Sch. Date</th>
                                                    <th>Item Ledger</th>
                                                    <th>Desc of Package</th>
                                                    <th>Cust PO Line</th>
                                                    <th>PONO</th>
                                                    <th>Per Part Weight</th>
                                                    <th>Net Weight</th>
                                                    <th>No Of Packages</th>
                                                    <th>Box Dimensions</th>
                                                    <th>No of Box</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {displayedItems.map((item, index) => (
                                                    <tr key={item.uniqueFId || index}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {item.itemCode ? (
                                                                <span>{item?.itemCode}</span>
                                                            ) : (
                                                                <Autocomplete
                                                                    fullWidth
                                                                    id={`combo-box-${index}`}
                                                                    size="small"
                                                                    disabled={isPLView}
                                                                    options={manualEntry ? optionsPartNoList : optionsPendingList}
                                                                    getOptionLabel={(option) => option.label || ""}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            label={manualEntry ? "Search Part No" : "Search Pending EXP"}
                                                                            onChange={manualEntry ? handleChange : undefined}
                                                                        />
                                                                    )}
                                                                    onChange={(event, value) =>
                                                                        onPartNoSelectChange(value)
                                                                    }
                                                                    value={null}
                                                                />
                                                            )}
                                                        </td>
                                                        <td>{item.partName || item.itemName}</td>
                                                        <td>{item.uom}</td>
                                                        <td>{item.expNo}</td>
                                                        <td>{item.expQty}</td>
                                                        {/* <td>{item.cumQty}</td>
                                                        <td>{item.pendQty}</td> */}
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("plQty", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.plQty}
                                                        </td>
                                                        <td>{item.hsnCode}</td>
                                                        <td>{item.schDate}</td>
                                                        <td>{item.itemLedger}</td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("descOfPackage", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.descOfPackage}
                                                        </td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("poLineItem", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.poLineItem}
                                                        </td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("poNo", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.poNo}
                                                        </td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("perPartWeight", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.perPartWeight}
                                                        </td>
                                                        <td>{item.netWeight}</td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("noOfPackages", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.noOfPackages}
                                                        </td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("boxDimension", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.boxDimension}
                                                        </td>
                                                        <td
                                                            contentEditable={!isPLView}
                                                            onBlur={(e) =>
                                                                handleEdit("noOfBox", e.target.textContent, item.uniqueFId, item)
                                                            }
                                                        >
                                                            {item.noOfBox}
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {item.uniqueFId !== "RDL1" && !isPLView && (
                                                                <DeleteIcon
                                                                    onClick={() => handleSelectedItemsDeleteRow(item.uniqueFId)}
                                                                    style={{ color: "black", cursor: "pointer" }}
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid >


                    </Grid >
                </form >

                <ChangeAddress
                    changeAddressModalOpen={changeAddressModalOpen}
                    setChangeAddressModalOpen={setChangeAddressModalOpen}
                    customerSid={customerSid}
                    setBillingAddress={setBillingAddress}
                    selectedChangeAddress={selectedChangeAddress}
                />

                <LoadPendingEXPModal
                    open={loadPendingModalOpen}
                    onClose={() => setLoadPendingModalOpen(false)}
                    customerId={cId}
                    onConfirm={(allocatedRows) => {
                        // Map actual API response fields → selectedItems shape
                        const mapped = allocatedRows.map((row) => ({
                            id: row.expInvItemId
                                ? `EXP_${row.expInvId}_${row.expInvItemId}`
                                : `EXP_${row.invNo}_${row.itemCode}`,
                            uniqueFId: `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${Math.random()}`,
                            partNo: row.itemCode || "",
                            itemCode: row.itemCode || "",
                            partName: row.itemName || "",
                            itemName: row.itemName || "",
                            uom: row.uom || "",
                            expNo: row.invNo || "",
                            expQty: row.expQty || 0,
                            cumQty: row.cumQty || 0,
                            pendQty: row.pendQty || 0,
                            plQty: row.plQty || 0,
                            perPartWeight: row.perPartWeight || 0,
                            netWeight: row.netWeight || 0,
                            noOfPackages: row.noOfPackages || "",
                            boxDimension: row.boxDimension || "",
                            noOfBox: row.noOfBox || "",
                            hsnCode: row.hsnCode || "",
                            schDate: row.schDate || "",
                            itemLedger: row.itemLedger || "",
                            descOfPackage: row.descOfPackage || "",
                            poNo: row.poNo || "",
                            poLineItem: row.poLineItem || "",
                            contractNo: row.contractNo || "",
                            expInvId: row.expInvId || null,
                            expInvItemId: row.expInvItemId || null,
                        }));
                        if (allocatedRows && allocatedRows.length > 0) {
                            const firstRow = allocatedRows[0];
                            setExportInvoiceNo(firstRow.invNo || "");
                            setInvoiceIssueDate(firstRow.invoIssuDate || firstRow.date || "");
                            setModeOfDispach(firstRow.modelOfDis || "");
                            setVechicleNo(firstRow.vechileNO || "");
                            setConsignee(firstRow.Consignee || "");
                            setTransporter(firstRow.transporter || "");
                            setTransporterGSTIN(firstRow.TransporterGSTIN || "");
                            if (firstRow.gstNo) setGstNo(firstRow.gstNo);
                            if (firstRow.panNo) setPanNo(firstRow.panNo);
                            if (firstRow.cName) setSelectedCustomerName(firstRow.cName);
                            if (firstRow.custId || firstRow.cId) {
                                setCId(firstRow.custId || firstRow.cId);
                                setCustomerSid(firstRow.custId || firstRow.cId);
                            }
                        }
                        // Store loaded rows into pendingItems so the in-table dropdown can use them
                        setPendingItems(allocatedRows);
                        // Load mapped items and keep a blank row at the end so the
                        // in-table Part No Autocomplete stays visible for selecting split rows
                        setSelectedItems((prev) => {
                            const base = prev.filter((i) => i.id !== "RDL1" && i.uniqueFId !== "RDL1");
                            return [...base, ...mapped, { id: "RDL1", uniqueFId: "RDL1" }];
                        });
                        // Clear the table Part No filter when new data is loaded
                        setTableFilterPartNo("");
                        setTableFilterPartNoObj(null);
                    }}
                />

                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />
            </div >

            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={mainId}
                deleteService={PackingListDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </>
    );
};

export default ViewPackingList;