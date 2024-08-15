import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AnimatedTabBarIcon = ({ name, color, size, focused, onPress }) => {
  const animationValue = useRef(new Animated.Value(0)).current;
  const animation = useRef(null);

  useEffect(() => {
    Animated.timing(animationValue, {
      toValue: focused ? 1 : 0,
      duration: 0,
      useNativeDriver: true,
    }).start();
  }, [animationValue, focused]);

  const handlePressIn = () => {
    if (animation.current) {
      animation.current.stop();
    }

    animation.current = Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: focused ? 1 : 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [
      { scale: animationValue.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
      { translateX: animationValue.interpolate({ inputRange: [0, 1], outputRange: [0, 0] }) },
      { translateY: animationValue.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
    ],
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} activeOpacity={1} style={styles.container}>
      <Animated.View style={[styles.iconWrapper, animatedStyle]}>
        <MaterialCommunityIcons name={name} color={color} size={size} style={styles.icon} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    borderRadius: 100,
    backgroundColor: 'white', // Set background color to white
    padding: 5, // Adjust the padding as needed to control the size of the circle
  },
  icon: {
    // No additional styles needed for the icon
  },
});

export default AnimatedTabBarIcon;
