import React from 'react';
import Slider from './Slider';


const Header = ({onYearChange}) => {

    return (
        <header className='header'>
            <h1>Velkakartta</h1>
            <Slider
                onYearChange={(year) => {console.log(year); onYearChange(year)}}
            />
            <button>Toggle Heatmap</button>
        </header>
    );
};

export default Header;