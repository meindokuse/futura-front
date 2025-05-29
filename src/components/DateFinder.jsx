import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DateFinder = ({ value, onChange, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    onChange('');
    onSubmit('')
  };

  return (
    <StyledWrapper 
      isFocused={isFocused}
      hasValue={!!value}
      initial={false}
      animate={{
        width: value ? '220px' : '190px'
      }}
      transition={{ duration: 0.3 }}
    >
      <label className="label">
        <input
          type="date"
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value && (
          <motion.span 
            className="icon"
            onClick={handleClear}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="#ffffff"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.span>
        )}
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled(motion.div)`
  .label {
    position: relative;
    display: flex;
    border-radius: 6px;
    border: 2px solid ${({ isFocused }) => (isFocused ? '#c83a0a' : '#373737')};
    padding: 10px 10px 10px 15px;
    text-align: left;
    align-items: center;
    background-color: transparent;
    min-width: 190px;
    transition: all 0.3s ease;

    .icon {
      position: absolute;
      top: 54%;
      right: 5px;
      transform: translateY(-50%);
      color: #ffffff;
      cursor: pointer;
      z-index: 2;

      &:hover {
        color: #c83a0a;
      }
    }

    .input {
      background-color: transparent;
      outline: none;
      border: none;
      color: #ffffff;
      font-size: 16px;
      width: 100%;
      height: 100%;
      padding-right: ${({ hasValue }) => hasValue ? '25px' : '0'};
      
      &::-webkit-calendar-picker-indicator {
        filter: invert(1);
        position: relative;
        z-index: 1;
        cursor: pointer;
      }
    }
  }

  @media (max-width: 768px) {
    .label {
      min-width: 150px;
    }
  }
`;

export default DateFinder;