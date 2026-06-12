import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import industryNatureAppendix from "../../data/industryNatureAppendix.json";

const industryList = industryNatureAppendix.industries.map(
	(item) => item.industry
);

const RisksAndOpportunitiesStep = ({ formData, setFormData }) => {
	const handleIndustryChange = (event, newValue) => {
		setFormData((prev) => ({
			...prev,
			risksAndOpportunities: {
				...prev.risksAndOpportunities,
				industry: newValue || "",
			},
		}));
	};

	return (
		<Box>
			<Typography variant="h4" color="secondary">
				識別企業在生物多樣性上的依賴、影響、風險及機會
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">- 選擇產業別</Typography>
				<Autocomplete
					disablePortal
					options={industryList}
					value={formData.risksAndOpportunities?.industry || ""}
					onChange={handleIndustryChange}
					sx={{ width: 300, m: 1 }}
					renderInput={(params) => <TextField {...params} label="產業別" />}
				/>
			</Stack>
		</Box>
	);
};

export default RisksAndOpportunitiesStep;
