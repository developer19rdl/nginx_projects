import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Box,
  CardContent,
  Card,
} from "@mui/material";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
import { insertMaintenanceSchedule } from "../../../services/LoginServiceNod";
import { useEffect } from "react";

function MaintenanceSchedule() {
  const [activeStep, setActiveStep] = useState(0);

  const [MainId, setMaintId] = useState("mac_44");
  const [age, setAge] = useState("");
  const [selectedRadioValue, setSelectedRadioValue] = useState("");
  const [problem, setproblem] = useState("");
  const [file1, setfile1] = useState("");
  const [file2, setfile2] = useState("");
  const [file3, setfile3] = useState("");
  const [file4, setfile4] = useState("");
  const [rows, setRows] = useState([]);
  const [Machine, setMachine] = useState('');
  const [manhr, setManhr] = useState("");
  const [machinUti, setMachineUti] = useState("");
  const [probcate, setProblemcate] = useState("");
  const [naturecate, setnaturecate] = useState("");




  const [stepThreeValues, setStepThreeValues] = useState({
    Type: "",
    Name: "",
    Partid: "",
    Quantity: "",
    UOM: "",
    Unitprice: "",
    // Add other StepThree values here as needed
  });

  const [affMachine, setaffMachine] = useState([]);
  const [affManHr, setaffManHr] = useState("");
  const [type1, settype1] = useState("");
  const [type2, settype2] = useState("");
  const [fromdate, setfromdate] = useState("");
  const [todate, settodate] = useState("");
  const [fromtime, setfromtime] = useState("");
  const [totime, settotime] = useState("");
  const [users, setUser] = useState([]);

  console.log("stepThreeValues", stepThreeValues);

  const steps = ["Step 1", "Step 2", "Step 3", "Complete"];

  const handleNext = () => {
    if (activeStep === 0 && !Machine) {
      alert("Please select a machine before proceeding to the next step.");
      return;
    }
    if (activeStep === steps.length - 1) {
      // If it's the last step, call handleSubmit to submit the form data
      handleSubmit();
    } else {
      // If it's not the last step, proceed to the next step
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };


  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const handleSubmit = () => {

    insertMaintenanceSchedule(
      {
        machine: Machine,
        MaintId: MainId,
        Maintype: age,
        Severity: selectedRadioValue,
        probcate: probcate,
        naturecate: naturecate,
        ProblemNote: problem,
        BrkImages1: file1,
        BrkImages2: file2,
        BrkImages3: file3,
        BrkImages4: file4,
        AffectedMachine: affMachine,
        AffdManHours: affManHr,
        type1: type1,
        type2: type2,
        fromdate: fromdate,
        todate: todate,
        fromtime: fromtime,
        totime: totime,
        MachineRuntimeDetails: machinUti,
        manHourdetails: manhr,
        affMachine: affMachine,
        users: users,
        valuesToInsert: rows
      },
      insertMaintenanceListSuccess,
      insertMaintenanceListException
    );
    localStorage.clear();
  };

  const insertMaintenanceListSuccess = () => {

  }

  const insertMaintenanceListException = () => {

  }

  return (
    <>
      <Typography variant="h5" marginLeft={2} marginTop={2}>
        Maintenance Schedule
      </Typography>
      <Box
        sx={
          {
            // width: '100%',
            // marginTop: '20px'
            // margin:'25px'
          }
        }
        margin={2}
        className="toolAddCardContainer"
      >
        <Typography
          variant="h7"
          component="div"
          sx={{
            flexGrow: 1,
            backgroundColor: "#f7f7fc",
            padding: 2.5,
            color: "#000000",
            borderRadius: "5px 5px 0 0",
          }}
        >
          Create Maintenance Schedule
        </Typography>
        <Card
          sx={{
            borderRadius: "0 0 5px 5px",
            padding: "0px",
            boxShadow: "none",
            paddingBottom: "15px",
          }}
        >
          <CardContent>
            <div>
              <Stepper activeStep={activeStep} orientation="horizontal">
                {steps.map((label, index) => (
                  <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {activeStep === 0 && <StepOne Machine={Machine} setMachine={setMachine} />}
              {activeStep === 1 && (
                <StepTwo
                  MainId={Machine}
                  setMaintId={setMaintId}
                  setAge={setAge}
                  age={age}
                  selectedRadioValue={selectedRadioValue}
                  problem={problem}
                  probcate={probcate}
                  setProblemcate={setProblemcate}
                  naturecate={naturecate}
                  setnaturecate={setnaturecate}
                  setSelectedRadioValue={setSelectedRadioValue}
                  setproblem={setproblem}
                  file1={file1}
                  setfile1={setfile1}
                  setfile2={setfile2}
                  setfile3={setfile3}
                  setfile4={setfile4}
                />
              )}
              {activeStep === 2 && (
                <StepThree setStepThreeValues={setStepThreeValues} stepThreeValues={stepThreeValues} rows={rows}
                  setRows={setRows} />
              )}
              {activeStep === 3 && (
                <StepFour
                  affMachine={affMachine}
                  affManHr={affManHr}
                  type1={type1}
                  type2={type2}
                  fromdate={fromdate}
                  todate={todate}
                  fromtime={fromtime}
                  totime={totime}
                  setaffMachine={setaffMachine}
                  setaffManHr={setaffManHr}
                  settype1={settype1}
                  settype2={settype2}
                  setfromdate={setfromdate}
                  settodate={settodate}
                  setfromtime={setfromtime}
                  settotime={settotime}
                  handleSubmit={handleSubmit}
                  setManhr={setManhr}
                  setMachineUti={setMachineUti}
                  users={users}
                  setUser={setUser}
                />
              )}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: "15px",
                }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? "Submit" : "Next"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default MaintenanceSchedule;
