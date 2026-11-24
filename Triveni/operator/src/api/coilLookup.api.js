import axiosClient from './axiosClient';

export const lookupCoilInfo = (coilNo) =>
  axiosClient.get(`/coil-lookup/${encodeURIComponent(coilNo)}`).then((r) => r.data.data);
