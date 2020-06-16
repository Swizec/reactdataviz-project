import React, { useState } from "react";

import "./App.css";
import Preloader from "./components/Preloader";

function App() {
    const [techSalaries, setTechSalaries] = useState([]);

    if (techSalaries.length < 1) {
        return <Preloader />;
    } else {
        return <div className="App"></div>;
    }
}

export default App;
