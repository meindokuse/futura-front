import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Finder = ({ findBy, value, onChange, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = React.useRef(null);

  useEffect(() => {
    setLocalValue(value); // Синхронизация с внешним значением
  }, [value]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(localValue);
      onSubmit(localValue);
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, onChange, onSubmit]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onChange(localValue);
      onSubmit(localValue);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onSubmit('');
  };

  return (
    <StyledWrapper isFocused={isFocused}>
      <label className="label">
        <input
          type="text"
          className="input"
          placeholder={'Поиск по ' + findBy}
          autoComplete="off"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {localValue && (
          <span className="icon" onClick={handleClear}>
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </span>
        )}
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .label {
    position: relative;
    display: flex;
    width: 100%;
    max-width: 700px;
    border-radius: 6px;
    border: 2px solid ${({ isFocused }) => (isFocused ? '#c83a0a' : '#373737')};
    padding: 10px 8px 10px 10px;
    text-align: left;
    align-items: center;

    .icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      transition: all 0.3s ease;
      color: #c5c5c5;
      cursor: pointer;

      &:hover {
        color: #c83a0a;
      }
    }

    .input {
      background-color: transparent;
      outline: none;
      border: none;
      color: #c5c5c5;
      font-size: 16px;
      width: 100%;
      height: 100%;
    }
  }
`;

export default Finder;