import React, {useEffect, useState} from 'react';
import {
    MenuItem,
    FormControl,
    Select,
    Card,
    CardContent,
} from '@material-ui/core';
import InfoBox from "./InfoBox";
import './App.css';
import Map from "./Map";
import Table from "./Table";
import {prettyPrintStat, sortData} from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);

    const [mapCenter, setMapCenter] = useState({ lat: 34.90746, lng: -40.4796});
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCaseType] = useState("cases");

    useEffect(() =>{
        fetch("https://disease.sh/v3/covid-19/all")
            .then(reponse => reponse.json())
            .then(data => {
                setCountryInfo(data);
            })
    })

    useEffect(() => {
        const getCountriesData = async () => {
            await fetch("https://disease.sh/v3/covid-19/countries")
                .then((response) => response.json())
                .then((data) => {
                    const countries = data.map((country) => ({
                        name: country.country,
                        value: country.countryInfo.iso2,
                    }));
                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);

                });
        }

        getCountriesData();
    }, [])

    const onCountryChange = async (event) => {
        const countryCode = event.target.value;
        setCountry(countryCode);
        const url = countryCode === 'worldwide'
            ? 'https://disease.sh/v3/covid-19/all':
            `https://disease.sh/v3/covid-19/countries/${countryCode}`;
        await fetch(url)
            .then((response) => response.json())
            .then(data => {
                setCountry(countryCode);
                setCountryInfo(data);
                setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                setMapZoom(4);
            })
    };

    return (
        <div className="app">
            <div className="app__left">
                <div className="app__header">
                    <h1>COVID-19 Tracker</h1>
                    <FormControl class="app__dropdown">
                        <Select
                            variant="outlined"
                            onChange={onCountryChange}
                            value={country}
                        >
                            <MenuItem value="worldwide">Worldwide</MenuItem>
                            {

                                countries.map(country => (
                                    <MenuItem value={country.value}>{country.name}</MenuItem>
                                ))
                            }
                        </Select>

                    </FormControl>
                </div>
                <div className="app__stats">
                    <InfoBox
                        isRed
                        active={casesType === 'cases'}
                        onClick ={e => setCaseType('cases')}
                        title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={numeral(countryInfo.cases).format("0,0")}/>

                    <InfoBox
                        active={casesType === "recovered"}
                        onClick ={e => setCaseType('recovered')}
                        title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format("0,0")}/>

                    <InfoBox
                        isRed
                        active={casesType === "deaths"}
                        onClick ={e => setCaseType('deaths')}
                        title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={numeral(countryInfo.deaths).format("0,0")}/>
                </div>

                {/* Map */}
                <Map
                    casesType={casesType}
                    countries={mapCountries}
                    center={mapCenter}
                    zoom={mapZoom}
                />
            </div>
            <Card className="app__right">
                <CardContent>
                    <h3>Live Cases by cont</h3>
                    <Table countries={tableData} />
                    <h3>Worldwide new {casesType}</h3>
                    {/* Graph */}
                    <LineGraph className="app__graph" casesType={casesType}/>
                </CardContent>

            </Card>



        </div>
    );
}

export default App;
