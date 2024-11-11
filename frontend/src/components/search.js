import React from 'react';
import { FaSearch} from "react-icons/fa";
import './search.css';


const Search = () => {
    return (
        <div classname="input-wrapper">
            <FaSearch id="search-icon" />
            <input placeholder="Type to search..." />
        </div>
    )
  

}
export default Search;