import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const StepFour = () => {
	return (
		<Box>
			<Typography variant="h4" color="secondary">
				實際蒐集具一定品質的生物多樣性資料
			</Typography>
			<Stack sx={{ mt: 3 }} spacing={3}>
				<Box>
					<Typography color="secondary">
						- 選擇想要撰寫在報告中的年份/月份區間
					</Typography>
					<Stack direction="row" sx={{ alignItems: "center" }}>
						<TextField
							label="開始年月 (YYYY/MM)"
							variant="outlined"
							sx={{ m: 1 }}
						/>
						<Typography color="secondary">-</Typography>
						<TextField
							label="結束年月 (YYYY/MM)"
							variant="outlined"
							sx={{ m: 1 }}
						/>
					</Stack>
				</Box>
				<Box>
					<Typography color="secondary">
						- 我們有廠區/下游廠商自行調查的資料
					</Typography>
					<Button
						variant="contained"
						color="primary"
						disableElevation
						sx={{ m: 1 }}
					>
						上傳檔案
						<input type="file" hidden />
					</Button>
				</Box>
			</Stack>
		</Box>
	);
};

export default StepFour;
