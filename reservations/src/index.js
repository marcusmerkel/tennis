import App from "./components/App";
import ReactDOM, { render } from "react-dom";
import React from "react";

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app');
    render(<App />, container);
});