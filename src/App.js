import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import _ from "lodash";

import "./App.css";
import Preloader from "./components/Preloader";
import { loadAllData } from "./DataHandling";

function App() {
    const [techSalaries, setTechSalaries] = useState([]);
    const [medianIncomes, setMedianIncomes] = useState([]);
    const [countyNames, setCountyNames] = useState([]);

    async function loadData() {
        const data = await loadAllData();

        const { techSalaries, medianIncomes, countyNames } = data;

        setTechSalaries(techSalaries);
        setMedianIncomes(medianIncomes);
        setCountyNames(countyNames);
    }

    useEffect(() => {
        loadData();
    }, []);

    if (techSalaries.length < 1) {
        return <Preloader />;
    } else {
        return (
            <div className="App container">
                <h1>Loaded {techSalaries.length} salaries</h1>
            </div>
        );
    }
}

export default App;
