
import React from 'react'
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const FYPreventiveMainTable = ({yearPreventiveTrendData}) => {
  return (
       <Table>
      <TableHead>
        <TableRow>
          <TableCell><b></b></TableCell>
        {yearPreventiveTrendData.map((m, i) => (
          <TableCell key={i} align="center">
            <b>{m.financialYear}</b>
          </TableCell>
        ))}
        </TableRow>
      </TableHead>
      <TableBody>
          <TableRow >
            <TableCell><b>Target</b></TableCell>
            {yearPreventiveTrendData.map((row, i) => (
            <TableCell align="center" key={i}>
              {row.Target}
            </TableCell>
          ))}
          </TableRow>
          <TableRow>
            <TableCell><b>Actual</b></TableCell>
                   {yearPreventiveTrendData.map((row, i) => (
            <TableCell align="center" key={i}>
              {row.Actual}
            </TableCell>
          ))} 
          </TableRow>
      </TableBody>
    </Table>
  )
}

export default FYPreventiveMainTable
