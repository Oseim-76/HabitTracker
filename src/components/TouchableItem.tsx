import React from 'react';
import {TouchableOpacity, type TouchableOpacityProps} from 'react-native';
import type {ReactNode} from 'react';

interface Props extends Omit<TouchableOpacityProps, 'key'> {
  key?: string;
  children: ReactNode;
}

export function TouchableItem({children, ...props}: Props) {
  return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
} 