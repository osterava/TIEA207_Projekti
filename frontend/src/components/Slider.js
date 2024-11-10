import React, { useState } from 'react';

const Slider = ({ onYearChange }) => {
    const [year, setYear] = useState(1990);

    const handleChange = (event) => {
        const newYear = event.target.value;
        setYear(newYear);
        onYearChange(newYear);
    };

    return (
        <div>
            <input
                type="range"
                min="1990"
                max="2025"
                value={year}
                onChange={handleChange}
            />
            <span>{year}</span>
        </div>
    );
};

export default Slider;