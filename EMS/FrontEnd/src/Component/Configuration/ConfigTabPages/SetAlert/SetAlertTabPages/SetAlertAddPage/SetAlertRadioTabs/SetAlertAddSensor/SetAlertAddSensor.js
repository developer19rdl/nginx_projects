

//   const [machine, setmachine] = useState("");
//   const [sensorname, setsensorname] = useState("");
//   const [units, setUnitsdata] = useState("");
//   const [alertMess, setAlertMmess] = useState("");
//   const [rows, setrows] = useState([]);
//   const [minValue,setMinValue]=useState('')
//   const [maxValue,setMaxValue] =useState('')


//   const [refreshData, setRefreshData] = useState(false);

//   const handleSelectChange = (event) => {
//     setmachine(event.target.value);
//   };

//   const handleSelectChangesensor = (event) => {
//     setsensorname(event.target.value);
//   };

//   const handleRadioChange = (event) => {
//     setSelectedRadioValue(event.target.value);
//   };

//   useEffect(() => {
//     console.log("selectedTabRadioValue", selectedTabRadioValue);
//     SetalertMachineView(handelSucess, handelException);
//     Setalertsensorname(handelsensorname, handelexception);
//   }, [refreshData]);

//   const handelsensorname = (dataObject) => {
//     console.log("data===", dataObject.data);
//     setsensorNamelist(dataObject.data);
//   };

//   const handelexception = () => {};

//   const handelSucess = (dataObject) => {
//     setmachineNamelist(dataObject.data);
//   };

//   const handelException = (dataObject) => {};


//   const hamdelexceptionData = () => {};
