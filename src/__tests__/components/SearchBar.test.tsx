import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/SearchBar';

// @expo/vector-icons is mocked via moduleNameMapper in jest config

describe('SearchBar', () => {
  it('renders a TextInput with the supplied value', () => {
    const { getByDisplayValue } = render(
      <SearchBar value="pikachu" onChangeText={jest.fn()} />,
    );
    expect(getByDisplayValue('pikachu')).toBeTruthy();
  });

  it('renders an empty input when value is empty string', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />,
    );
    expect(getByPlaceholderText('Search name or #number...')).toBeTruthy();
  });

  it('calls onChangeText with the new value when the user types', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} />,
    );
    const input = getByPlaceholderText('Search name or #number...');
    fireEvent.changeText(input, 'char');
    expect(onChangeText).toHaveBeenCalledWith('char');
    expect(onChangeText).toHaveBeenCalledTimes(1);
  });

  it('calls onChangeText every time the text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={onChangeText} />,
    );
    const input = getByPlaceholderText('Search name or #number...');
    fireEvent.changeText(input, 'a');
    fireEvent.changeText(input, 'ab');
    fireEvent.changeText(input, 'abc');
    expect(onChangeText).toHaveBeenCalledTimes(3);
    expect(onChangeText).toHaveBeenLastCalledWith('abc');
  });

  it('has autoCorrect disabled', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />,
    );
    const input = getByPlaceholderText('Search name or #number...');
    expect(input.props.autoCorrect).toBe(false);
  });

  it('has autoCapitalize set to none', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />,
    );
    const input = getByPlaceholderText('Search name or #number...');
    expect(input.props.autoCapitalize).toBe('none');
  });
});
