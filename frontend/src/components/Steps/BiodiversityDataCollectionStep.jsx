import React, { useRef, useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const BiodiversityDataCollectionStep = ({ formData, setFormData }) => {
	const fileInputRef = useRef(null);
	const [fileName, setFileName] = useState("");

	const handleButtonClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			setFileName(file.name);
			setFormData((prev) => ({
				...prev,
				biodiversity: {
					...prev.biodiversity,
					fileName: file.name,
				},
			}));
		}
	};

	useEffect(() => {
		setFileName(formData.biodiversity.fileName);
	}, [formData.biodiversity.fileName]);

	const handleDateChange = (field) => (event) => {
		const value = event.target.value;
		setFormData((prev) => ({
			...prev,
			biodiversity: {
				...prev.biodiversity,
				[field]: value,
			},
		}));
	};

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
							value={formData.biodiversity?.startDate || ""}
							onChange={handleDateChange("startDate")}
						/>
						<Typography color="secondary">-</Typography>
						<TextField
							label="結束年月 (YYYY/MM)"
							variant="outlined"
							sx={{ m: 1 }}
							value={formData.biodiversity?.endDate || ""}
							onChange={handleDateChange("endDate")}
						/>
					</Stack>
				</Box>
				<Box>
					<Typography color="secondary">
						- 我們有廠區/下游廠商自行調查的資料
					</Typography>
					<Box sx={{ display: "flex", alignItems: "center" }}>
						<Button
							variant="contained"
							color="primary"
							disableElevation
							sx={{ m: 1 }}
							onClick={handleButtonClick}
						>
							上傳檔案
						</Button>

						<input
							type="file"
							ref={fileInputRef}
							style={{ display: "none" }}
							onChange={handleFileChange}
						/>

						{fileName && (
							<Typography color="text.secondary" variant="body2">
								已選擇檔案：{formData.biodiversity.fileName}
							</Typography>
						)}
					</Box>
				</Box>
			</Stack>
		</Box>
	);
};

export default BiodiversityDataCollectionStep;
