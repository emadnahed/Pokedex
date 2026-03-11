/**
 * Manual mock for react-native-reanimated (v4+).
 *
 * The built-in `react-native-reanimated/mock` crashes in Jest because it
 * bootstraps `react-native-worklets`, which requires native modules that
 * don't exist in a Node test environment.
 *
 * This file replaces the entire package (and any sub-path import such as
 * `react-native-reanimated/mock`) via moduleNameMapper in jest config.
 */
const React = require('react');
const RN = require('react-native');

// Hooks
const useSharedValue = (initial) => ({ value: initial });
const useAnimatedStyle = (_worklet) => ({});
const useAnimatedProps = (_worklet) => ({});
const useDerivedValue = (fn) => ({ value: fn() });
const useAnimatedScrollHandler = () => () => {};
const useAnimatedRef = () => ({ current: null });
const useAnimatedReaction = jest.fn();
const useAnimatedGestureHandler = () => ({});

// Animation builders — return the target value synchronously
const withSpring = (toValue) => toValue;
const withTiming = (toValue) => toValue;
const withRepeat = (toValue) => toValue;
const withSequence = (...animations) => animations[animations.length - 1];
const withDelay = (_delay, animation) => animation;
const withDecay = () => 0;

// Utilities
const cancelAnimation = jest.fn();
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;
const interpolate = (_value, _inputRange, outputRange) => outputRange[0];
const interpolateColor = (_value, _inputRange, outputRange) => outputRange[0];
const measure = jest.fn();
const scrollTo = jest.fn();

const Easing = {
  bezier: () => (t) => t,
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t,
  cubic: (t) => t,
  poly: () => (t) => t,
  sin: (t) => t,
  circle: (t) => t,
  exp: (t) => t,
  elastic: () => (t) => t,
  back: () => (t) => t,
  bounce: (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
};

// createAnimatedComponent just returns the original component untouched
const createAnimatedComponent = (Component) => Component;

// Animated namespace
const Animated = {
  View: RN.View,
  Text: RN.Text,
  Image: RN.Image,
  ScrollView: RN.ScrollView,
  FlatList: RN.FlatList,
  createAnimatedComponent,
};

module.exports = {
  __esModule: true,
  default: Animated,
  // Re-export everything so both default and named imports work
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useDerivedValue,
  useAnimatedScrollHandler,
  useAnimatedRef,
  useAnimatedReaction,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  withDecay,
  cancelAnimation,
  runOnJS,
  runOnUI,
  interpolate,
  interpolateColor,
  measure,
  scrollTo,
  Easing,
  createAnimatedComponent,
};
