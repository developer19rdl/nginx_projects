import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  AddToolsMachineView,
  AssetAdd,
  AssetUpdate,
  DepartmentShowdata,
  FetchAssetTypeSec,
  FetchAsstTypeAsset,
  VendorShowdata,
  showmachine,
} from "../../../../Services/NodeJsApiServices";

const AssetModel = ({ open, setOpen, isAddButton, editAsset, setRefreshData, setNotification }) => {
  const [department, setDepartment] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  const [section, setSection] = useState("");
  const [sectionList, setSectionList] = useState([]);
  const [machine, setMachine] = useState("");
  const [financialAssetId, setFinancialAssetId] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [assetTypeList, setAssetTypeList] = useState([]);
  const [manufacturer, setManufacturer] = useState("");
  const [assetModel, setAssetModel] = useState("");
  const [poDetails, setPoDetails] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState("");
  const [warrantyStartDate, setWarrantyStartDate] = useState("");
  const [warrantyEndDate, setWarrantyEndDate] = useState("");
  const [warrantyRunHours, setWarrantyRunHours] = useState("");
  const [warrantyType, setWarrantyType] = useState("");
  const [warrantyTypeList, setWarrantyTypeList] = useState([]);
  const [description, setDescription] = useState("");
  const [assetFile, setAssetFile] = useState("");
  const [warrantySelected, setWarrantySelected] = useState('');
  const [machineslist, setmachinelist] = useState([])

  const handleClose = () => {
    setOpen(false);
    ClearData();
  };

  useEffect(() => {
    DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
    // showmachine(handelmachine,handelexceptionmachine);
    AddToolsMachineView(handelmachine, handelexceptionmachine);
    VendorShowdata(handleVendorshow, handleVendorshowException);
    setDepartment(editAsset?.Department || "");
    setSection(editAsset?.Section || "");
    setMachine(editAsset?.MachineName || "");
    setFinancialAssetId(editAsset?.FinancialAssetId || "");
    setVendor(editAsset?.Vendor || "");
    setAssetType(editAsset?.AssetType || "");
    setManufacturer(editAsset?.Manufacturer || "");
    setAssetModel(editAsset?.AssetModel || "");
    setPoDetails(editAsset?.PODetails || "");
    setInvoiceDetails(editAsset?.InvDetails || "");
    setWarrantyStartDate(editAsset?.WarStartDate || "");
    setWarrantyEndDate(editAsset?.WarEndDate || "");
    setWarrantyRunHours(editAsset?.WarRunHours || "");
    setWarrantySelected(editAsset?.WarType === 1 ? "warranty" : "nowarranty" || '');
    setDescription(editAsset?.Description || "");
    setAssetFile(editAsset?.AssetImage || "");
  }, [editAsset]);

  const handelmachine = (dataObject) => {
    setmachinelist(dataObject?.data);
  };

  const handelexceptionmachine = (error, errorMessage) => {
    console.log(errorMessage);
  };


  const handleVendorshow = (dataObject) => {
    setVendorList(dataObject?.data);
  };

  const handleVendorshowException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const handleDepartmentshow = (dataObject) => {
    setDepartmentList(dataObject?.data);
    if (editAsset?.Department) {
      FetchAssetTypeSec(
        { id: editAsset?.Department },
        handleBranchSuccess,
        handleBranchException
      );
    }
  };

  const handleDepartmentshowException = (error, errorMessage) => {
  };

  const handleBranchSuccess = (dataObject) => {
    setSectionList(dataObject.data);
    if (editAsset?.Department) {
      FetchAsstTypeAsset(
        { id: editAsset?.Section },
        handleAsseTypeSuccess,
        handleAsseTypeException
      );
    }
  };

  const handleBranchException = (errorStaus, errorMessage) => {
  };

  const ClearData = () => {
    setDepartment("");
    setSection("");
    setMachine("");
    setFinancialAssetId("");
    setVendor("");
    setAssetType("");
    setManufacturer("");
    setAssetModel("");
    setPoDetails("");
    setInvoiceDetails("");
    setWarrantyStartDate("");
    setWarrantyEndDate("");
    setWarrantyRunHours("");
    setWarrantyType("");
    setDescription("");
    setAssetFile("");
    setRefreshData((oldValue) => !oldValue);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    isAddButton === true
      ? AssetAdd(
        {
          Department: department,
          Section: section,
          MachineName: machine,
          FinancialAssetId: financialAssetId,
          Vendor: vendor,
          AssetType: assetType,
          Manufacturer: manufacturer,
          AssetModel: assetModel,
          PODetails: poDetails,
          InvDetails: invoiceDetails,
          WarStartDate: warrantyStartDate,
          WarEndDate: warrantyEndDate,
          WarRunHours: warrantyRunHours,
          WarType: warrantySelected === 'warranty' ? true : false,
          Description: description,
          AssetImage: assetFile,
        },
        handleSuccess,
        handleException
      )
      : AssetUpdate(
        {
          id: editAsset.id,
          Department: department,
          Section: section,
          MachineName: machine,
          FinancialAssetId: financialAssetId,
          Vendor: vendor,
          AssetType: assetType,
          Manufacturer: manufacturer,
          AssetModel: assetModel,
          PODetails: poDetails,
          InvDetails: invoiceDetails,
          WarStartDate: warrantyStartDate,
          WarEndDate: warrantyEndDate,
          WarRunHours: warrantyRunHours,
          WarType: warrantySelected === 'warranty' ? true : false,
          Description: description,
          AssetImage: assetFile,
        },
        handleUpdateSuccess,
        handleException
      );
  };

  const handleSuccess = (dataObject) => {
    console.log(dataObject);
    setRefreshData(oldValue => !oldValue);
    setNotification({
      status: true,
      type: "success",
      message: dataObject.message,
    });
    setTimeout(() => {
      setOpen(false);
    }, 2000);
    setRefreshData((oldValue) => !oldValue);
    ClearData();
  };

  const handleUpdateSuccess = (dataObject) => {
    console.log(dataObject);
    setNotification({
      status: true,
      type: "success",
      message: dataObject.message,
    });
    setTimeout(() => {
      setOpen(false);
    }, 2000);
    setRefreshData((oldValue) => !oldValue);
    ClearData();
  };

  const handleException = (errorObject, errorMessage) => {
    console.log(errorMessage);
    setNotification({
      status: true,
      type: "error",
      message: errorMessage,
    });
    ClearData();
  };

  const onDepartmentChange = (e) => {
    setDepartment(e.target.value);
    FetchAssetTypeSec(
      { id: e.target.value },
      handleBranchSuccess,
      handleBranchException
    );
  };

  const onSectionChange = (e) => {
    setSection(e.target.value);
    FetchAsstTypeAsset(
      { id: e.target.value },
      handleAsseTypeSuccess,
      handleAsseTypeException
    );
  };

  const handleAsseTypeSuccess = (dataObject) => {
    console.log("data Branch");
    setAssetTypeList(dataObject.data);
  };

  const handleAsseTypeException = (errorStaus, errorMessage) => {
    console.log(errorMessage);
  };

  const onVendorChange = (e) => {
    setVendor(e.target.value);
  };

  const onAssetTypeChange = (e) => {
    setAssetType(e.target.value);
  };

  const handleWarrantyChange = (e) => {
    // if (e.target.value === "warranty") {
    //   setWarrantySelected(true);
    // } else {
    //   setWarrantySelected(false);
    // }
    setWarrantySelected(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "62%", maxHeight: "100%" } }}
        maxWidth="lg"
        open={open}
      >
        <form onSubmit={onSubmit}>
          <DialogTitle >
            {isAddButton === true ? "Add" : "Update"} Asset
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Department
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Department"
                    placeholder="Department"
                    value={department}
                    required
                    onChange={(e) => onDepartmentChange(e)}
                  >
                    {departmentList?.map((data, index) => {
                      return (
                        <MenuItem value={data.id} key={index}>
                          {data.departmentName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Section</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Section"
                    placeholder="Section"
                    value={section}
                    required
                    onChange={(e) => onSectionChange(e)}
                  >
                    {sectionList.length !== 0 ? (
                      <MenuItem value="" key={0}>
                        <em>Select Section</em>
                      </MenuItem>
                    ) : (
                      <MenuItem value="" key={0}>
                        <em>Select Department </em>
                      </MenuItem>
                    )}
                    {sectionList?.map((data, index) => {
                      return (
                        <MenuItem value={data.id} key={index}>
                          {data.Section}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel>Machine Name</InputLabel>
                  <Select
                    value={machine}
                    onChange={(e) => setMachine(e.target.value)}
                    label="Machine Name"
                  >
                    {machineslist.map((machine) => (
                      <MenuItem key={machine.id} value={machine.id}>
                        {machine.machine_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Financial Asset ID"
                  placeholder="Financial Asset ID"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, ''); // Remove non-alphanumeric characters
                    setFinancialAssetId(filteredValue);
                  }}
                  value={financialAssetId}
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Vendor</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Vendor"
                    placeholder="Vendor"
                    value={vendor}
                    required
                    onChange={(e) => onVendorChange(e)}
                  >
                    {vendorList?.map((data, index) => {
                      return (
                        <MenuItem value={data.id} key={index}>
                          {data.VendorName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    Asset Type
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Asset Type"
                    placeholder="Asset Type"
                    value={assetType}
                    onChange={(e) => onAssetTypeChange(e)}
                  >
                    {assetTypeList.length !== 0 ? (
                      <MenuItem value="" key={0}>
                        <em>Select Asset Type</em>
                      </MenuItem>
                    ) : (
                      <MenuItem value="" key={0}>
                        <em>Select Section </em>
                      </MenuItem>
                    )}
                    {assetTypeList?.map((data, index) => {
                      return (
                        <MenuItem value={data.id} key={index}>
                          {data.AssetTypeView}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Manufacturer"
                  placeholder="Manufacturer"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^a-zA-Z\s]/g, ''); // Remove numeric and special characters, allowing only letters and spaces
                    setManufacturer(filteredValue);
                  }}
                  value={manufacturer}
                />
              </Grid>

              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Asset Model"
                  placeholder="Asset Model"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow alphanumeric characters
                    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
                    setAssetModel(filteredValue);
                  }}
                  value={assetModel}
                />
              </Grid>

              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="PO Details"
                  placeholder="PO Details"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                    setPoDetails(filteredValue);
                  }}
                  value={poDetails}
                />
              </Grid>

              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Invoice Details"
                  placeholder="Invoice Details"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                    setInvoiceDetails(filteredValue);
                  }}
                  value={invoiceDetails}
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Description"
                  placeholder="Description"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                    setDescription(filteredValue);
                  }}
                  value={description}
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.readyState === 2) {
                          setAssetFile(reader.result);
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  type="file"
                />
              </Grid>
              <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
                <TextField
                  fullWidth
                  label="Warranty Run Hours"
                  placeholder="Warranty Run Hours"
                  variant="outlined"
                  required
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numeric characters
                    const filteredValue = value.replace(/[^0-9]/g, "");
                    setWarrantyRunHours(filteredValue);
                  }}
                  value={warrantyRunHours}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                <RadioGroup
                  value={warrantySelected}
                  onChange={handleWarrantyChange}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FormControlLabel
                    value="warranty"
                    control={<Radio />}
                    label="Warranty"
                    sx={{ marginRight: 2 }} // Add some spacing between the labels
                  />
                  <FormControlLabel
                    value="nowarranty"
                    control={<Radio />}
                    label="No Warranty"
                  />
                </RadioGroup>
              </Grid>

              {warrantySelected === 'warranty' && (
                <>
                  <Grid item xs={12} sm={2.5} md={2.5} lg={2.5} xl={2.5}>
                    <TextField
                      fullWidth
                      label="Warranty Start Date "
                      placeholder="Warranty Start Date"
                      variant="outlined"
                      required
                      type="date"
                      value={formatDate(warrantyStartDate)}
                      onChange={(e) => setWarrantyStartDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2.5} md={2.5} lg={2.5} xl={2.5}>
                    <TextField
                      fullWidth
                      label="Warranty End Date "
                      placeholder="Warranty End Date"
                      variant="outlined"
                      required
                      type="date"
                      value={formatDate(warrantyEndDate)}
                      onChange={(e) => setWarrantyEndDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions style={{ justifyContent: "flex-end" }}>
            <Button
              type="submit"

            >
              {isAddButton ? "Add" : "Update"}
            </Button>
            <Button
              onClick={handleClose}

            >
              Cancel
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default AssetModel;
