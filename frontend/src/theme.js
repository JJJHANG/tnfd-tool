import { red } from "@mui/material/colors";
import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
	cssVariables: true,
	palette: {
		primary: {
			main: "#DBDBDB",
		},
		secondary: {
			main: "#707070",
		},
		link: {
			main: "#8083ff",
		},
		error: {
			main: red.A400,
		},
	},
});

export default theme;
