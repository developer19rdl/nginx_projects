/* eslint-disable max-len */
const _fetchServiceDownloadFile = (PATH, serviceMethod, data, successCallback, errorCallBack, fileName, reportType, contentType) => {
  const END_POINT = process.env.REACT_APP_NODE_API_URL;
  // const END_POINT = 'http://192.168.1.133:5003';
  console.log(`${END_POINT}${PATH}`)
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
      const message = error?.message || 'Download failed. Please try again.';
      errorCallBack(null, message);
    });
}

// MALLIK ERP CHECKLIST DOWNLOAD
const _fetchMallikErpXlService = (PATH, serviceMethod, data, successCallback, errorCallBack, fileName, reportType, contentType) => {
  const END_POINT = process.env.REACT_APP_MALLIK_API_URL_Down;
  // const END_POINT = 'http://192.168.1.133:5003';
  console.log(`${END_POINT}${PATH}`)
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
      const message = error?.message || 'Download failed. Please try again.';
      errorCallBack(null, message);
    });
};

const getFileExtension = (fileType) => {
  const segments = fileType.split('.');
  if (segments.length > 1) {
    return segments.pop().toLowerCase();
  }
  return null;
};



export const DownloadScheduleTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/AssignShift/template`, 'GET', {}, successCallback, errorCallBack, `Schedule.xlsx`, 'download', `application/xlsx`);
};

// SHIFT MODULE TEMPLATE
export const DownloadShiftTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/template`, 'GET', {}, successCallback, errorCallBack, `ScheduleTemplate.xlsx`, 'download', `application/xlsx`);
};

export const BreakdownDetailsTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/mainReport/BreakdownDetailsTemplate`, 'GET', {}, successCallback, errorCallBack, `Breakdown_Details_Template.xlsx`, 'download', `application/xlsx`);
};

// export const BreakdownDetailsShowData = (successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`/api/mainReport/BreakdownDetailsShowData`, 'GET', {}, successCallback, errorCallBack, `Breakdown_Details_Template.xlsx`, 'download', `application/xlsx`);
// };




export const DownloadRescheduleTemplate = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/reschedule?fromDate=${data.fromDate}&toDate=${data.toDate}`, 'GET', {}, successCallback, errorCallBack, `RescheduleTemplate.xlsx`, 'download', `application/xlsx`);
};

////Shift OT///
export const DownloadOTTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/templateoperator`, 'GET', {}, successCallback, errorCallBack, `ScheduleOTTemplate.xlsx`, 'download', `application/xlsx`);
};

export const DownloadOTRescheduleTemplate = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/shifts/rescheduleoperator?fromDate=${data.fromDate}&toDate=${data.toDate}`, 'GET', {}, successCallback, errorCallBack, `RescheduleTemplate.xlsx`, 'download', `application/xlsx`);
};
// export const DownloadEnergyXl = (data, successCallback, errorCallBack) => {
//   return _fetchServiceDownloadFile(`energyReportExcel`, 'GET', {}, successCallback, errorCallBack, `Energy.xlsx`, 'download', `application/xlsx}`);
// };

export const DownloadEnergyXl = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/report/energyReportExcel?fromDate=${data.fromDate}&toDate=${data.toDate}&meterId=${data.meterId}`, 'GET', {}, successCallback, errorCallBack, `EnergyReport.xlsx`, 'download', `application/xlsx`);
};

export const DownloadProductionImpactAnalysis = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/report/overTimeReportExl?startDate=${data.fromDate}&endDate=${data.toDate}&capacityMeasureType=${data.capacityMeasureType}`, 'GET', {}, successCallback, errorCallBack, `ProductionImpact.xlsx`, 'download', `application/xlsx`);
};

export const DownloadProductionXl = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/report/productionReportExl?startDate=${data.selectDateFrom}&endDate=${data.selectDateTo}&machineId=${data.machineId}&capacityMeasureType=${data.capacityMeasureType}`, 'GET', {}, successCallback, errorCallBack, `ProductionReport.xlsx`, 'download', `application/xlsx`);
};

// ASSET TEMPLATE DOWNLOAD
export const DownloadAssetTemplate = (successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/Asset/downloadTemplate`, 'GET', {}, successCallback, errorCallBack, `Asset.xlsx`, 'download', `application/xlsx`);
};

export const DownloadMachineBreakDownTrendXl = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/mainReport/MachineBreakDownTrendExcel?fromDate=${data.fromDate}&toDate=${data.toDate}`, 'GET', {}, successCallback, errorCallBack, `MachineBreakDownTrend.xlsx`, 'download', `application/xlsx`);
};

// MALLIK CHECKLIST XL
// CHECKLIST TEMPLATE DOWNLOAD
export const ChecklistTemplateDownload = (successCallback, errorCallBack) => {
  return _fetchMallikErpXlService(`checkExl/template`, 'GET', {}, successCallback, errorCallBack, `Checklist_Template.xlsx`, 'download', `application/xlsx}`);
}

// CHECKLIST REPORT DOWNLOAD
export const ChecklistReportDownload = (data, successCallback, errorCallBack) => {
  return _fetchMallikErpXlService(`checkexlreport/export?checkListId=${data.checkListId}&checkname=${data.name}&frequency=${data.frequency}&fromdate=${data.fromdate}&todate=${data.todate}`, 'GET', {}, successCallback, errorCallBack, `Checklist_Report.xlsx`, 'download', `application/xlsx}`);
}

export const DownloadIdleTimeAnalysis = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/report/idleTimeReportExl?startDate=${data.startDate}&endDate=${data.endDate}&capacityMeasureType=${data.capacityMeasureType}`, 'GET', {}, successCallback, errorCallBack, `idleTimeReport.xlsx`, 'download', `application/xlsx`);
};

export const ConsolidateIdleTimeAnalysis = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/report/consolidateIdleTimeExl?startDate=${data.startDate}&endDate=${data.endDate}&capacityMeasureType=${data.capacityMeasureType}`, 'GET', {}, successCallback, errorCallBack, `consolidateIdleTimeExl.xlsx`, 'download', `application/xlsx`);
};

export const MtbfMonitoringExcel = (data, successCallback, errorCallBack) => {
  return _fetchServiceDownloadFile(`/api/meanTime/MtbfMonitoringExcel`, 'GET', {}, successCallback, errorCallBack, `consolidateIdleTimeExl.xlsx`, 'download', `application/xlsx`);
};

