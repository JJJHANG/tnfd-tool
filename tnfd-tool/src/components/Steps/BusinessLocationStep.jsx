import React, { useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import MapPage from "../Map/MapPage";

const BusinessLocationStep = ({ formData, setFormData }) => {
	return (
		<Box>
			<Typography variant="h4" color="secondary">
				確認企業主要業務的地理位置
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					- 框選企業本身或上下游廠商的地理範圍
				</Typography>
			</Stack>
			<Stack
				direction="row"
				spacing={2}
				sx={{
					mt: 1,
					justifyContent: "space-between",
				}}
			>
				<Box>
					<TableContainer
						component={Paper}
						sx={{ maxHeight: 400, overflow: "auto", maxWidth: 350 }}
					>
						<Table
							stickyHeader
							sx={{ minWidth: 350 }}
							aria-label="simple table"
						>
							<TableHead>
								<TableRow>
									<TableCell>廠區名稱</TableCell>
									<TableCell align="right">廠區點位</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.values(formData.location || {}).map((row) => (
									<TableRow
										key={row.name}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell component="th" scope="row">
											{row.name}
										</TableCell>
										<TableCell align="right">{row.points}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				{<MapPage /> ? (
					<MapPage setFormData={setFormData} />
				) : (
					<Skeleton variant="rectangular" width={800} height={400} />
				)}
			</Stack>
		</Box>
	);
};

export default BusinessLocationStep;
