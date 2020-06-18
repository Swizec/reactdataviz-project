import React from "react";
import * as d3 from "d3";

import Axis from "./Axis";

const HistogramBar = ({ percent, x, y, width, height }) => {
    let translate = `translate(${x}, ${y})`,
        label = percent.toFixed(0) + "%";
    if (percent < 1) {
        label = percent.toFixed(2) + "%";
    }
    if (width < 20) {
        label = label.replace("%", "");
    }
    if (width < 10) {
        label = "";
    }
    return (
        <g transform={translate} className="bar">
            <rect
                width={width}
                height={height - 2}
                transform="translate(0, 1)"
            />
            <text textAnchor="end" x={width - 5} y={height / 2 + 3}>
                {label}
            </text>
        </g>
    );
};

const Histogram = ({
    bins,
    width,
    height,
    x,
    y,
    data,
    axisMargin,
    bottomMargin,
    value,
}) => {
    const histogram = d3.histogram().thresholds(bins).value(value);

    const bars = histogram(data),
        counts = bars.map((d) => d.length);

    const widthScale = d3
        .scaleLinear()
        .domain([d3.min(counts), d3.max(counts)])
        .range([0, width - axisMargin]);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(bars, (d) => d.x1)])
        .range([height - y - bottomMargin, 0]);

    return (
        <g className="histogram" transform={`translate(${x}, ${y})`}>
            <g className="bars">
                {bars.map((bar) => (
                    <HistogramBar
                        percent={(bar.length / data.length) * 100}
                        x={axisMargin}
                        y={yScale(bar.x1)}
                        width={widthScale(bar.length)}
                        height={yScale(bar.x0) - yScale(bar.x1)}
                        key={`histogram-bar-${bar.x0}`}
                    />
                ))}
            </g>
            <Axis
                x={axisMargin - 3}
                y={0}
                data={bars}
                scale={yScale}
                type="Left"
            />
        </g>
    );
};

export default Histogram;
