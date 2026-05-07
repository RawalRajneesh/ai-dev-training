/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/RootNavigator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    RootNavigator: () =>
      React.createElement(View, null, React.createElement(Text, null, 'StreamList')),
  };
});

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
