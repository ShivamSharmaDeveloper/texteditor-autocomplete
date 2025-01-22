// src/components/Suggestions.js
import React from 'react';
import './Suggestions.css';

const Suggestions = ({ suggestions, activeIndex, onSelect }) => {
    return (
        <ul className="suggestions-list">
            {suggestions.map((item, index) => (
                <li
                    key={item}
                    className={index === activeIndex ? 'active' : ''}
                    onClick={() => onSelect(item)}
                >
                    {item}
                </li>
            ))}
        </ul>
    );
};

export default Suggestions;
