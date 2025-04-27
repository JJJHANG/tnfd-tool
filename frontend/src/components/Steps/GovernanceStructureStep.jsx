import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

const GovernanceStructureStep = ({ formData, setFormData }) => {
	const handleChange = (event) => {
		const { value } = event.target;
		setFormData((prev) => ({
			...prev,
			governance: {
				...prev.governance,
				description: value,
			},
		}));
	};

	return (
		<Box>
			<Typography variant="h4" color="secondary">
				確認企業主要的治理結構
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					-
					包括董事會成員、管理層和主要委員會，並說明其中是否有具備自然相關議題能力的成員
				</Typography>
				<Typography color="secondary">
					- 描述企業與永續發展和自然資源管理相關的治理方案
				</Typography>
				<Typography color="secondary">
					- 說明治理層在自然資源和永續發展方面的責任和義務
				</Typography>
			</Stack>
			<FormControl fullWidth sx={{ height: "100%", mt: 1 }} color="secondary">
				<OutlinedInput
					multiline
					minRows="12"
					id="outlined-adornment-amount"
					value={formData.governance.description || ""} 
					onChange={handleChange}
					sx={{ height: "100%", alignItems: "start" }}
				/>
			</FormControl>
		</Box>
	);
};

export default GovernanceStructureStep;
