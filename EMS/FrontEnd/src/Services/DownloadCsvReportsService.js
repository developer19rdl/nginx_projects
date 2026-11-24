/* eslint-disable max-len */
const _fetchServiceDownloadFile = (PATH, serviceMethod, data, successCallback, errorCallBack, fileName, reportType, contentType) => {
  const END_POINT = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  console.log(`${END_POINT}${PATH}`);
  const headers = {
    'Content-Type': contentType,
    responseType: 'arraybuffer',
  };

  const body = (serviceMethod === 'GET') || (serviceMethod === 'DELETE') ? {} : { body: JSON.stringify(data) };

  const bodyParameters = {
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    headers,
    ...body,
  };

  const bodyObject = {
    method: serviceMethod,
    ...bodyParameters,
  };

  let filename = '';

  return fetch(END_POINT + PATH, bodyObject)
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }

      filename = fileName || 'ReportFile'; // Default filename if not provided

      if (reportType === 'download') {
        return response.blob();
      } else if (reportType === 'email') {
        return response.json();
      }
    })
    .then((dataResponse) => {
      successCallback(dataResponse);
      if (reportType === 'download') {
        if (dataResponse != null) {
          const url = window.URL.createObjectURL(dataResponse);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
        }
      } else if (reportType === 'email') {
        // Handle email response
      }
    })
    .catch((error) => {
      console.error('Download failed:', error);
      errorCallBack(error);
    });
};

const getFileExtension = (fileType) => {
  const segments = fileType.split('.');
  if (segments.length > 1) {
    return segments.pop().toLowerCase();
  }
  return null;
};

// export const BomExlTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`bomExl/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadPDFFile = (data, successCallback, errorCallBack) => {
//   const fileExtension = getFileExtension(data.fileType);
//   return _fetchServiceDownloadFile(`supplier/download/${data.id}`, 'GET', {}, successCallback, errorCallBack, `Report.${fileExtension}`, 'download', `application/${fileExtension}`);
// };

// export const DownloadSupExcelTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`supExcel/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const GetSuppVsItemTemplate = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`suppVsItmExl/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadSuppVsItemList = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`suppVsItmExl/download/${data.id}`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadCslExlExport = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`cslExl/template`, 'GET', {}, successCallback, errorCallBack, `csl.xlsx`, 'download', `application/xlsx}`);
// };


// export const DocDownloadExlExport = (data, successCallback, errorCallBack) => {
//   const fileExtension = getFileExtension(data.fileType);
//   return _fetchServiceDownloadFile(`customer/download/${data.id}`, 'GET', {}, successCallback, errorCallBack, `Report.${fileExtension}`, 'download', `application/${fileExtension}`);
// };


// export const ItemDownloadExlExport = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`item/template`, 'GET', {}, successCallback, errorCallBack, `item.xlsx`, 'download', `application/xlsx`);
// };

// export const CustomerTemplateDownloadExlExport = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`customer/template`, 'GET', {}, successCallback, errorCallBack, `item.xlsx`, 'download', `application/xlsx`);
// };

// // export const DownloadSuppVsItemPriceRevisionExl = (data, successCallback, errorCallBack) => _fetchService('suppVsItmExl/priceRevision/download', 'POST', data, successCallback, errorCallBack);
// export const DownloadSuppVsItemPriceRevisionExl = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile('suppVsItmExl/priceRevision/download', 'GET', data, successCallback, errorCallBack, `item.xlsx`, 'download', `application/xlsx`);
// };


// export const DownloadItemStockTemplateExl = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile('item/stock/template', 'GET', data, successCallback, errorCallBack, `item.xlsx`, 'download', `application/xlsx`);
// };

// export const GetItemVsProcessTemplate = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`itmVsPmExl/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const GetItemVsProcessCopyTemplate = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`itmVsPmExl/copyTemplate`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };


// export const DownloadPOEntryTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`purchase/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const ExportPoEntry = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`purchase/export`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadGSTExcelTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`gstInvoice/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };


// // export const GetSuppVsItemTemplate = (successCallback, errorCallBack) => _fetchService('suppVsItem/template', 'GET', {}, successCallback, errorCallBack)
// export const DownloadSobExlTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`sobExl/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', ``);
// };

// export const DownloadSobExlTemplateProduct = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`sobExl/export?sobMstId=${data?.id}`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', ``);
// };

// //mallik Shop floor
// export const DownloadMeterExcelTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`gstInvoice/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadMachineAllocateExcelTemplate = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`gstInvoice/template`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

// export const DownloadTagExcelTemplate = (data, successCallback, errorCallBack) => {
//   // alert("dghf");
//   return _fetchServiceDownloadFile(`api/csv/tagTemplate`, 'GET', {}, successCallback, errorCallBack, `Report.xlsx`, 'download', `application/xlsx}`);
// };

////////
///////////////
////////////////////////

export const DownloadScheduleTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/AssignShift/template`, 'GET', {}, successCallback, errorCallBack, `Schedule.xlsx`, 'download', `application/xlsx`);
};

// SHIFT MODULE TEMPLATE
export const DownloadShiftTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/template`, 'GET', {}, successCallback, errorCallBack, `ScheduleTemplate.xlsx`, 'download', `application/xlsx`);
};
export const DownloadRescheduleTemplate = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/reschedule?fromDate=${data.fromDate}&toDate=${data.toDate}`, 'GET', {}, successCallback, errorCallBack, `RescheduleTemplate.xlsx`, 'download', `application/xlsx`);
};

////Reports

// export const DownloadEnergyXl = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`energyReportExcel`, 'GET', {}, successCallback, errorCallBack, `Energy.xlsx`, 'download', `application/xlsx}`);
// };

export const DownloadEnergyXl = (data, successCallback, errorCallBack) => {
  const params = new URLSearchParams({
    fromDate: data.fromDate,
    toDate:   data.toDate,
    meterId:  data.meterId,
    ...(data.plantId       && { plantId:       data.plantId }),
    ...(data.incomerId     && { incomerId:     data.incomerId }),
    ...(data.distributerId && { distributerId: data.distributerId }),
    ...(data.feederId      && { feederId:      data.feederId }),
  });
  return _fetchServiceDownloadFile(`/api/report/energyReportExcel?${params.toString()}`, 'GET', {}, successCallback, errorCallBack, `EnergyReport.xlsx`, 'download', `application/xlsx`);
};

// ASSET TEMPLATE DOWNLOAD
export const DownloadAssetTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/Asset/downloadTemplate`, 'GET', {}, successCallback, errorCallBack, `Asset.xlsx`, 'download', `application/xlsx`);
};