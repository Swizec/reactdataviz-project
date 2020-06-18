import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import _ from "lodash";

import "./App.css";
import "./style.css";
import Preloader from "./components/Preloader";
import { loadAllData } from "./DataHandling";
import CountyMap from "./components/CountyMap";
import Histogram from "./components/Histogram";

function App() {
    const [datasets, setDatasets] = useState({
        techSalaries: [],
        medianIncomes: [],
        countyNames: [],
        usTopoJson: null,
        USstateNames: null,
    });

    const {
        techSalaries,
        medianIncomes,
        countyNames,
        usTopoJson,
        USstateNames,
    } = datasets;

    async function loadData() {
        const datasets = await loadAllData();
        setDatasets(datasets);
    }

    function countyValue(county, techSalariesMap) {
        const medianHousehold = medianIncomes[county.id],
            salaries = techSalariesMap[county.name];

        if (!medianHousehold || !salaries) {
            return null;
        }

        const median = d3.median(salaries, (d) => d.base_salary);

        return {
            countyID: county.id,
            value: median - medianHousehold.medianIncome,
        };
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredSalaries = techSalaries,
        filteredSalariesMap = _.groupBy(filteredSalaries, "countyID"),
        countyValues = countyNames
            .map((county) => countyValue(county, filteredSalariesMap))
            .filter((d) => !_.isNull(d));

    let zoom = null;

    if (techSalaries.length < 1) {
        return <Preloader />;
    } else {
        return (
            <div className="App container">
                <h1>Loaded {techSalaries.length} salaries</h1>
                <svg width="1100" height="500">
                    <CountyMap
                        usTopoJson={usTopoJson}
                        USstateNames={USstateNames}
                        values={countyValues}
                        x={0}
                        y={0}
                        width={500}
                        height={500}
                        zoom={zoom}
                    />
                    <Histogram
                        bins={10}
                        width={500}
                        height={500}
                        x="500"
                        y="10"
                        data={filteredSalaries}
                        axisMargin={83}
                        bottomMargin={5}
                        value={(d) => d.base_salary}
                    />
                </svg>
            </div>
        );
    }
}

export default App;
