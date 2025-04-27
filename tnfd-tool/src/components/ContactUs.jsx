import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

const questinOptions = ["報告相關", "帳號相關", "使用相關"];

const ContactUs = () => {
	return (
		<Container sx={{ width: "100%", mt: 3 }}>
			<Box>
				<Typography variant="h4" color="secondary">
					聯絡我們
				</Typography>
				<Stack sx={{ mt: 3 }}>
					<Typography color="secondary">
						如有解析報告、或取得更精細報告內容的需求，歡迎填寫下方表格
					</Typography>
				</Stack>
			</Box>
			<Box sx={{ flexGrow: 1, mt: 3 }}>
				<Grid container spacing={2}>
					<Grid size={4}>
						<Autocomplete
							disablePortal
							options={questinOptions}
							renderInput={(params) => (
								<TextField {...params} label="請選擇問題分類" />
							)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField label="使用者名稱" fullWidth />
					</Grid>
					<Grid size={4}>
						<TextField label="使用者信箱" fullWidth />
					</Grid>
					<Grid size={12}>
						<FormControl fullWidth sx={{ height: "100%" }} color="secondary">
							<InputLabel htmlFor="outlined-question-description">
								問題說明
							</InputLabel>
							<OutlinedInput
								multiline
								minRows="12"
								id="outlined-adornment-amount"
								label="問題說明"
								sx={{ height: "100%", alignItems: "start" }}
							/>
						</FormControl>
					</Grid>
				</Grid>
			</Box>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button color="secondary" variant="contained" sx={{ mt: 3 }}>
					送出
				</Button>
			</Box>
		</Container>
	);
};

export default ContactUs;
