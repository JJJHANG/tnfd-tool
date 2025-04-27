import React from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";

const industryList = [
	"農業、林業與漁業",
	"礦業與採石業",
	"能源（石油、天然氣、可再生能源）",
	"製造業（特別是食品、化學、紡織等）",
	"房地產與建築業",
];

const SignUp = () => {
	return (
		<Container sx={{ width: "100%", mt: 3 }}>
			<Typography variant="h4" color="secondary">
				帳號註冊
			</Typography>
			<Stack direction="column" sx={{ mt: 3 }}>
				<Typography color="secondary" sx={{ mt: 1 }}>
					使用者帳號
				</Typography>
				<TextField variant="outlined" />
				<Typography color="secondary" sx={{ mt: 1 }}>
					電子郵件
				</Typography>
				<TextField variant="outlined" />
				<Typography color="secondary" sx={{ mt: 1 }}>
					企業名稱
				</Typography>
				<TextField variant="outlined" />
				<Typography color="secondary" sx={{ mt: 1 }}>
					企業類型
				</Typography>
				<Autocomplete
					disablePortal
					options={industryList}
					renderInput={(params) => <TextField {...params} />}
				/>
				<Typography color="secondary" sx={{ mt: 1 }}>
					密碼
				</Typography>
				<TextField variant="outlined" />
				<Typography color="secondary" sx={{ mt: 1 }}>
					再次輸入密碼
				</Typography>
				<TextField variant="outlined" />
			</Stack>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<Button color="secondary" variant="contained" sx={{ mt: 3 }}>
					送出
				</Button>
			</Box>
		</Container>
	);
};

export default SignUp;
