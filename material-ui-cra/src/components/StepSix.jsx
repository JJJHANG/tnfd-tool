import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

const StepSix = () => {
	return (
		<Box>
			<Typography variant="h4" color="secondary">
				進行影響評估並提出減少影響的策略、措施與對應指標
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					-
					描述為減少對生物多樣性的負面影響而採取的措施/策略類型和已取得/預計取得的成效
				</Typography>
				<Typography color="secondary">
					- 設定可衡量措施進展的量化指標
				</Typography>
			</Stack>
			<FormControl fullWidth sx={{ height: "100%", mt: 1 }} color="secondary">
				<OutlinedInput
					multiline
					minRows="12"
					id="outlined-adornment-amount"
					sx={{ height: "100%", alignItems: "start" }}
				/>
			</FormControl>
		</Box>
	);
};

export default StepSix;
