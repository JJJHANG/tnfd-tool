import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";

const BusinessActivitiesStep = ({ formData, setFormData }) => {
	const handleChange = (event) => {
		const { value } = event.target;
		setFormData((prev) => ({
			...prev,
			activities: {
				...prev.activities,
				description: value,
			},
		}));
	};

	return (
		<Box>
			<Typography variant="h4" color="secondary">
				確認企業主要的業務活動與規模
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">
					-
					調查企業本身與上下游廠商所生產的主要產品、生產流程與活動內容、所使用的商品等資訊
				</Typography>
			</Stack>
			<FormControl fullWidth sx={{ height: "100%", mt: 1 }} color="secondary">
				<OutlinedInput
					multiline
					minRows="12"
					id="outlined-adornment-amount"
					value={formData.activities.description || ""}
					onChange={handleChange}
					sx={{ height: "100%", alignItems: "start" }}
				/>
			</FormControl>
		</Box>
	);
};

export default BusinessActivitiesStep;
