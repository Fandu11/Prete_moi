// Autocomplete.js
import React, { useState } from "react";

const Autocomplete = ({ options, onSelect }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleSelectOption = (option) => {
    onSelect(option);
    setFilteredOptions([]);
  };

  return (
    <div>
      <input
        type="text"
        onChange={handleInputChange}
        placeholder="Rechercher une ville..."
      />
      {filteredOptions.length > 0 && (
        <ul>
          {filteredOptions.map((option, index) => (
            <li key={index} onClick={() => handleSelectOption(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
