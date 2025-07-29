import React, { useState } from 'react';
import styled from 'styled-components';

const WorkTypeFinder = ({ value, onChange, onSubmit }) => {
  const [isFocused, setIsFocused] = useState(false);

  const workTypes = [
    { label: 'Все должности', value: '' },
    { label: 'Кальянный мастер', value: 'кальянный мастер' },
    { label: 'Помощник кальянного мастера', value: 'помощник кальянного мастера' },
    { label: 'Бармен', value: 'бармен' },
    { label: 'Помощник Бармена', value: 'помощник бармена' },
    { label: 'Хостес', value: 'хостес' },
    { label: 'Администратор', value: 'администратор' },
    { label: 'Менеджер', value: 'менеджер' }
  ];

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
    onSubmit(selectedValue); // Автоматический вызов при изменении
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(value);
    }
  };

  const handleClear = () => {
    onChange('');
    onSubmit('');
  };

  return (
    <StyledWrapper isFocused={isFocused}>
      <label className="label">
        <select
          className="select"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {workTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {value && (
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
    max-width: 300px;
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

    .select {
      background-color: transparent;
      outline: none;
      border: none;
      color: #c5c5c5;
      font-size: 16px;
      width: 100%;
      height: 100%;
      appearance: none; /* Убираем стандартную стрелку */
      padding-right: 30px; /* Место для крестика */
    }
  }
`;

export default WorkTypeFinder;