import React from 'react'
import DebtChart from './debtChart'

const InfoBox = ({ selectedCountry, populationData, selectedCountryGBDYear, selectedCountryCode, closeInfoBox, year }) => {
  return (
    <div id="info-box">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={closeInfoBox}>Close</button>
      </div>
      <h2>{selectedCountry ? selectedCountry.name : ''}</h2>
      <p><strong> Country ID: </strong>{selectedCountryCode}</p>
      <p><strong> Population ({year}): </strong>{populationData} million people</p>
      <p><strong> GDP ({year}): </strong>{selectedCountryGBDYear} billion USD</p>
      <DebtChart countryCode={selectedCountryCode} />
      <p>
        This graph shows {selectedCountry ? selectedCountry.name : 'the selected country'}'s public debt as a percentage of GDP for each year.
        When debt increases, it may mean that the government is taking on more loans to finance public services or economic stimulus.
        Conversely, a decrease in debt may indicate economic growth, where the government is able to reduce its borrowing.
        A high debt-to-GDP ratio may concern those responsible for economic policy, as it can weaken the government's ability to respond to economic crises.
      </p>
    </div>
  )
}

export default InfoBox
