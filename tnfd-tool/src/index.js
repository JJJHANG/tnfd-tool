import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

import * as React from "react";
import * as ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App";
import theme from "./theme";

import { AuthProvider } from "./context/auth";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
	<ThemeProvider theme={theme}>
		<AuthProvider>
			<CssBaseline />
			<App />
		</AuthProvider>
	</ThemeProvider>
);
