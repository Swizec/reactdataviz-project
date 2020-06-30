import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import _ from "lodash";

import "./App.css";
import "./style.css";
import Preloader from "./components/Preloader";
import { loadAllData } from "./DataHandling";
import CountyMap from "./components/CountyMap";
import Histogram from "./components/Histogram";
import { Title, Description } from "./components/Meta";
import Controls from "./components/Controls";

import MedianLine from "./components/MedianLine";

function App() {
    const [datasets, setDatasets] = useState({
        techSalaries: [],
        medianIncomes: [],
        countyNames: [],
        usTopoJson: null,
        USstateNames: null,
        medianIncomesByUSState: {},
        medianIncomesByCounty: {},
    });
    const [salariesFilter, setSalariesFilter] = useState(() => () => true);
    const [filteredBy, setFilteredBy] = useState({
        USstate: "*",
        year: "*",
        jobTitle: "*",
    });

    const {
        techSalaries,
        medianIncomes,
        countyNames,
        usTopoJson,
        USstateNames,
        medianIncomesByCounty,
        medianIncomesByUSState,
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

    function updateDataFilter(filter, filteredBy) {
        setFilteredBy(filteredBy);
        setSalariesFilter(() => filter);
    }

    useEffect(() => {
        loadData();
    }, []);

    const filteredSalaries = techSalaries.filter(salariesFilter),
        filteredSalariesMap = _.groupBy(filteredSalaries, "countyID"),
        countyValues = countyNames
            .map((county) => countyValue(county, filteredSalariesMap))
            .filter((d) => !_.isNull(d));

    if (filteredSalaries.length < 1) {
        return <Preloader />;
    } else {
        let zoom = null,
            medianHousehold = medianIncomesByUSState["US"][0].medianIncome;

        if (filteredBy.USstate !== "*") {
            zoom = filteredBy.USstate;
            medianHousehold = d3.mean(
                medianIncomesByUSState[zoom],
                (d) => d.medianIncome
            );
        }

        return (
            <div className="App container">
                <Title
                    filteredSalaries={filteredSalaries}
                    filteredBy={filteredBy}
                />
                <Description
                    data={filteredSalaries}
                    allData={techSalaries}
                    filteredBy={filteredBy}
                    medianIncomesByCounty={medianIncomesByCounty}
                />
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
                    <rect
                        x="500"
                        y="0"
                        width="600"
                        height="500"
                        style={{ fill: "white" }}
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
                    <MedianLine
                        data={filteredSalaries}
                        x={500}
                        y={10}
                        width={600}
                        height={500}
                        bottomMargin={5}
                        median={medianHousehold}
                        value={(d) => d.base_salary}
                    />
                </svg>
                <Controls
                    data={techSalaries}
                    updateDataFilter={updateDataFilter}
                />
            </div>
        );
    }
}

export default App;
