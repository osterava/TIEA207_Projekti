import React from 'react';
import Slider from './Slider';


const Header = ({year, setYear, heatmap, setHeatmap}) => {

    const onHeatmapToggle = () => {
        setHeatmap(!heatmap);
    };

    return (
        <header className='header'>
            <h1>Velkakartta</h1>
            <Slider
                year={year}
                setYear={setYear}
            />
            <button onClick={onHeatmapToggle} style={{margin: '10px'}}>Toggle Heatmap</button>
        </header>
    );
};

export default Header;