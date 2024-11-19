import React from 'react'
import DebtChart from './debtChart'

/**
 * Displays detailed information about a selected country, including population, GDP,
 * and public debt data over time, with an embedded debt-to-GDP chart.
 * @param {object} selectedCountry The selected country object, containing the country name and other details.
 * @param {number} populationData The population of the selected country in millions.
 * @param {number} selectedCountryGBDYear The GDP of the selected country in billions of USD for the selected year.
 * @param {string} selectedCountryCode The code for the selected country, used for fetching related data.
 * @param {function} closeInfoBox A function to close the info box when the close button is clicked.
 * @param {string} year The year for which population and GDP data is displayed.
 */
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
