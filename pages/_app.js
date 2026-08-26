import "@/styles/globals.css";
import { ThemeProvider } from "../context/ThemeContext";
import { GoeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <GoeyToaster position="top-right" />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
