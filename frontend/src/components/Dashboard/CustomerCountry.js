import React, { useRef, useEffect, useState } from "react";
import { select, geoPath, geoMercator, min, max, scaleLinear, zoom, zoomTransform, event } from "d3";
import useResizeObserver from "./useResizeObserver";
import axiosInstance from '../../api/axiosApi';
import { Select, Spin } from 'antd';
import asia from "./GeoChart.asia.geo.json";
import america from "./GeoChart.america.geo.json";
import europe from "./GeoChart.europe.geo.json";
import africa from "./GeoChart.africa.geo.json";
import australia from "./GeoChart.australia.geo.json";
import world from "./GeoChart.world.geo.json";
import { useDispatch, useSelector } from 'react-redux'

const { Option } = Select;
/**
 * Component that renders a map of Germany.
 */

function CustomerCountry({ group }) {
    const svgRef = useRef();
    const wrapperRef = useRef();
    const dimensions = useResizeObserver(wrapperRef);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [data, setData] = useState(asia)
    const [region, setRegion] = useState('Asia')
    const leadCount = useSelector(state => state.api.analytics.country)

    const setContinent = (value) => {
        value === 'Asia' && setData(asia)
        value === 'America' && setData(america)
        value === 'Africa' && setData(africa)
        value === 'Europe' && setData(europe)
        value === 'Australia' && setData(australia)
        value === 'Custom' && setData({ ...data, features: [] })
        setRegion(value)
    }

    const setCountry = (value) => {
        let final = value.map(index => {
            return world.features[index]
        })
        setData({ ...data, features: final })
    }

    useEffect(() => {

        const svg = select(svgRef.current);
        const g = svg.select("g");

        // use resized dimensions
        // but fall back to getBoundingClientRect, if no dimensions yet.
        const { width, height } =
            dimensions || wrapperRef.current.getBoundingClientRect();

        const minProp = 0
        const maxProp = leadCount ? max(leadCount, count => count.count) : null
        const colorScale = scaleLinear()
            .domain([minProp, maxProp])
            .range(["#ccc", "red"]);

        const findLeadCount = (country) => {
            if (leadCount) {
                const leadCountry = leadCount.find(count => count.country === country)
                if (leadCountry) {
                    return colorScale(leadCountry.count)
                }
                else {
                    return '#ccc'
                }
            }
            else {
                return null
            }
        }

        const findLeadText = (country) => {
            if (leadCount) {
                const leadCountry = leadCount.find(count => count.country === country)
                if (leadCountry) {
                    return `${leadCountry.country}: ${leadCountry.count}`
                }
                else {
                    return `${country}: 0`
                }
            }
            else {
                return null
            }
        }

        // projects geo-coordinates on a 2D plane
        const projection = geoMercator()
            .fitSize([width, height], selectedCountry || data)
            .precision(100);

        // takes geojson data,
        // transforms that into the d attribute of a path element
        const pathGenerator = geoPath().projection(projection);

        const zoomed = () => {
            const { transform } = event;
            g.attr("transform", transform);
            g.attr("stroke-width", 1 / transform.k);
        }

        const zoomBehaviour = zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", zoomed)

        // render each country
        g
            .selectAll(".country")
            .data(data.features)
            .join("path")
            .on("click", feature => {
                setSelectedCountry(selectedCountry === feature ? null : feature);
            })
            .attr("class", "country")
            .transition()
            .attr("fill", feature => findLeadCount(feature.properties.iso_a2))
            .attr("d", feature => pathGenerator(feature))

        svg.call(zoomBehaviour)

        // render text
        g
            .selectAll(".label")
            .data([selectedCountry])
            .join("text")
            .attr("class", "label")
            .text(
                feature => feature && findLeadText(feature.properties.name)
            )
            .attr("x", 10)
            .attr("y", 25);
    }, [data, dimensions, selectedCountry, leadCount]);

    return (
        <React.Fragment>
            <Select
                defaultValue="Asia"
                onChange={value => setContinent(value)}
                style={{ width: '50%' }}
            >
                <Option value="Asia">Asia</Option>
                <Option value="America">America</Option>
                <Option value="Australia">Australia</Option>
                <Option value="Europe">Europe</Option>
                <Option value="Africa">Africa</Option>
                <Option value="Custom">Custom</Option>
            </Select>
            {region === 'Custom' &&
                <Select
                    mode="multiple"
                    onChange={value => setCountry(value)}
                    style={{ width: "100%" }}
                >
                    {world.features.map((feature, index) => (
                        <Option value={index}>{feature.properties.name}</Option>
                    ))}
                </Select>
            }
            <div ref={wrapperRef} style={{ height: "100%", width: '100%' }}>
                <svg id="geo-chart" ref={svgRef} style={{ height: "100%", width: '100%' }}><g></g></svg>
            </div>
        </React.Fragment>
    );
}

export default CustomerCountry;