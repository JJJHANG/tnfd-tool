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
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";

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
						sx={{ maxHeight: 400, maxWidth: 350, overflowY: "auto" }}
					>
						<Table
							stickyHeader
							sx={{ minWidth: 350 }}
							aria-label="simple table"
						>
							<TableHead>
								<TableRow>
									<TableCell sx={{ minWidth: 100, width: "70%" }}>
										廠區名稱
									</TableCell>
									<TableCell align="right" sx={{ width: "30%" }}>
										操作
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Object.values(formData.location || {}).map((row) => (
									<TableRow key={row.name}>
										<TableCell component="th" scope="row" sx={{ width: "70%" }}>
											<Box display="flex" alignItems="center">
												<span>{row.name}</span>
												<Tooltip
													title={row.points}
													arrow
													placement="top"
													color="primary"
												>
													<IconButton size="small">
														<InfoIcon fontSize="small" color="primary" />
													</IconButton>
												</Tooltip>
											</Box>
										</TableCell>
										<TableCell align="right" sx={{ width: "30%" }}>
											<Tooltip title="刪除此廠區" arrow placement="top">
												<IconButton size="small">
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
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
