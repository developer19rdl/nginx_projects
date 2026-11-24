import React from 'react'
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const FYBreakdownTable = ({yearBreakdownTrendData}) => {
  return (
       <Table>
      <TableHead>
        <TableRow>
          <TableCell><b></b></TableCell>
        {yearBreakdownTrendData.map((m, i) => (
          <TableCell key={i} align="center">
            <b>{m.financialYear}</b>
          </TableCell>
        ))}
        </TableRow>
      </TableHead>
      <TableBody>
          <TableRow >
            <TableCell><b>Target</b></TableCell>
            {yearBreakdownTrendData.map((row, i) => (
            <TableCell align="center" key={i}>
              {row.target}
            </TableCell>
          ))}
          </TableRow>
          <TableRow>
            <TableCell><b>Actual</b></TableCell>
                   {yearBreakdownTrendData.map((row, i) => (
            <TableCell align="center" key={i}>
              {row.actual}
            </TableCell>
          ))} 
          </TableRow>
      </TableBody>
    </Table>
  )
}

export default FYBreakdownTable
