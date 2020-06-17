import React, { useMemo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson";
import _ from "lodash";

const ChoroplethColors = _.reverse([
    "rgb(247,251,255)",
    "rgb(222,235,247)",
    "rgb(198,219,239)",
    "rgb(158,202,225)",
    "rgb(107,174,214)",
    "rgb(66,146,198)",
    "rgb(33,113,181)",
    "rgb(8,81,156)",
    "rgb(8,48,107)",
]);
const BlankColor = "rgb(240,240,240)";

const County = ({ geoPath, feature, zoom, key, quantize, value }) => {
    let color = BlankColor;

    if (value) {
        color = ChoroplethColors[quantize(value)];
    }

    return (
        <path d={geoPath(feature)} style={{ fill: color }} title={feature.id} />
    );
};

function useQuantize(values) {
    return useMemo(() => {
        const scale = d3.scaleQuantize().range(d3.range(9));

        if (values) {
            scale.domain([
                d3.quantile(values, 0.15, (d) => d.value),
                d3.quantile(values, 0.85, (d) => d.value),
            ]);
        }

        return scale;
    }, [values]);
}

function useProjection({ width, height, zoom, usTopoJson, USstateNames }) {
    return useMemo(() => {
        const projection = d3
            .geoAlbersUsa()
            .scale(1280)
            .translate([width / 2, height / 2])
            .scale(width * 1.3);
        const geoPath = d3.geoPath().projection(projection);

        if (zoom && usTopoJson) {
            const us = usTopoJson,
                USstatePaths = topojson.feature(us, us.objects.states).features,
                id = _.find(USstateNames, { code: zoom }).id;

            projection.scale(width * 4.5);

            const centroid = geoPath.centroid(_.find(USstatePaths, { id: id })),
                translate = projection.translate();

            projection.translate([
                translate[0] - centroid[0] + width / 2,
                translate[1] - centroid[1] + height / 2,
            ]);
        }

        return geoPath;
    }, [width, height, zoom, usTopoJson, USstateNames]);
}

const CountyMap = ({
    usTopoJson,
    USstateNames,
    x,
    y,
    width,
    height,
    zoom,
    values,
}) => {
    const geoPath = useProjection({
        width,
        height,
        zoom,
        usTopoJson,
        USstateNames,
    });
    const quantize = useQuantize(values);

    if (!usTopoJson) {
        return null;
    } else {
        const us = usTopoJson,
            USstatesMesh = topojson.mesh(
                us,
                us.objects.states,
                (a, b) => a !== b
            ),
            counties = topojson.feature(us, us.objects.counties).features;

        const countyValueMap = _.fromPairs(
            values.map((d) => [d.countyID, d.value])
        );

        return (
            <g>
                {counties.map((feature) => (
                    <County
                        geoPath={geoPath}
                        feature={feature}
                        zoom={zoom}
                        key={feature.id}
                        quantize={quantize}
                        value={countyValueMap[feature.id]}
                    />
                ))}
                <path
                    d={geoPath(USstatesMesh)}
                    style={{
                        fill: "none",
                        stroke: "#fff",
                        strokeLinejoin: "round",
                    }}
                />
            </g>
        );
    }
};

export default CountyMap;
