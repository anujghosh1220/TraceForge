import { render, screen } from "@testing-library/react";
import App from "./App";
test("renders title", () => { render(<App/>); expect(screen.getAllByText((_, el) => el?.textContent === "TraceForge").length).toBeGreaterThan(0); });
