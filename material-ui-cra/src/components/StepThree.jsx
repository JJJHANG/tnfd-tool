import React from "react";
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

const StepThree = () => {
	const item = null;

	function createData(name, calories, fat, carbs, protein) {
		return { name, calories, fat, carbs, protein };
	}

	const rows = [
		{ name: "中央研究院", coordinate: "25.045472, 121.614008" },
		{ name: "中央研究院2", coordinate: "25.758472, 121.992008" },
	];

	return (
		<Box>
			<Typography variant="h4" color="secondary">
				確認企業主要業務的地理位置
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					- 匡選企業本身或上下游廠商的地理範圍
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
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 350 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell>廠區名稱</TableCell>
									<TableCell align="right">廠區點位</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row) => (
									<TableRow
										key={row.name}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell component="th" scope="row">
											{row.name}
										</TableCell>
										<TableCell align="right">{row.coordinate}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>

				{item ? (
					<img
						src={item}
						style={{
							width: 800,
							height: 400,
						}}
						alt="location"
					/>
				) : (
					<Skeleton variant="rectangular" width={800} height={400} />
				)}
			</Stack>
		</Box>
	);
};

export default StepThree;
