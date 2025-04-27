import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

const StakeholderIdentificationStep = ({ formData, setFormData }) => {
	const handleChange = (event) => {
		const { value } = event.target;
		setFormData((prev) => ({
			...prev,
			stakeholders: {
				...prev.stakeholders,
				description: value,
			},
		}));
	};

	return (
		<Box>
			<Typography variant="h4" color="secondary">
				識別利害關係人
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					-
					說明如何識別和確定主要利害關係人，如原住民、當地社區和受影響利益相關者，並蒐集其回饋
				</Typography>
			</Stack>
			<FormControl fullWidth sx={{ height: "100%", mt: 1 }} color="secondary">
				<OutlinedInput
					multiline
					minRows="12"
					id="outlined-adornment-amount"
					value={formData.stakeholders.description || ""}
					onChange={handleChange}
					sx={{ height: "100%", alignItems: "start" }}
				/>
			</FormControl>
		</Box>
	);
};

export default StakeholderIdentificationStep;
