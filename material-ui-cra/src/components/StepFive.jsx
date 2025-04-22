import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

const industryList = [
	"農業、林業與漁業",
	"礦業與採石業",
	"能源（石油、天然氣、可再生能源）",
	"製造業（特別是食品、化學、紡織等）",
	"房地產與建築業",
];

const sectorList = [
	"初級產業部門",
	"能源部門",
	"工業與製造部門",
	"消費品與零售部門",
	"建築與房地產部門",
	"運輸與物流部門",
	"科技與通訊部門",
	"金融服務部門",
	"公共與政府部門",
];

const StepFive = () => {
	return (
		<Box>
			<Typography variant="h4" color="secondary">
				識別企業在生物多樣性上的依賴、影響、風險及機會
			</Typography>
			<Stack sx={{ mt: 3 }}>
				<Typography color="secondary">- 選擇產業類別與部門</Typography>
				<Autocomplete
					disablePortal
					options={industryList}
					sx={{ width: 300, m: 1 }}
					renderInput={(params) => <TextField {...params} label="產業類別" />}
				/>
				<Autocomplete
					disablePortal
					options={sectorList}
					sx={{ width: 300, m: 1 }}
					renderInput={(params) => <TextField {...params} label="部門" />}
				/>
			</Stack>
		</Box>
	);
};

export default StepFive;
