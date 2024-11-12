const Slider = ({ year, setYear }) => {

    
    const handleChange = (event) => {
        setYear(parseInt(event.target.value));
    }

    return (
        <div style={{display: 'flex'}}>
            <input
                id="slider"
                type="range"
                min="1990"
                max="2025"
                aria-label={`Year slider from 1990 to 2025`}
                value={year}
                onChange={handleChange}
            />
            <span>{year}</span>
        </div>
    )
}

export default Slider;