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
        This graph shows {selectedCountry ? selectedCountry.name : 'the selected country'}´s public debt as a percentage of GDP for each year, alongside the total public debt as a percentage of GDP over the same period. Both data sets provide insights into the relative size of government debt compared to the country´s economy.
        An increase in debt may indicate the government is borrowing more to finance public services or economic stimulus, while a decrease could reflect economic growth and reduced borrowing needs.
        A rising debt-to-GDP ratio, combined with increases in total debt as a percentage of GDP, could raise concerns about the government´s ability to respond to future economic challenges and maintain fiscal sustainability.
      </p>
    </div>
  )
}

export default InfoBox
