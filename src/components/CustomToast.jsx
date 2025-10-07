import React from 'react';
import { View, Text } from 'react-native';
import Toast from 'react-native-toast-message';

const toastConfig = {
  success: (props) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#333333',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{
        width: 4,
        height: '60%',
        backgroundColor: '#4ade80',
        borderRadius: 2,
        marginRight: 12
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 2
        }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{
            color: '#cccccc',
            fontSize: 14
          }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  ),
  error: (props) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#333333',
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{
        width: 4,
        height: '60%',
        backgroundColor: '#ef4444',
        borderRadius: 2,
        marginRight: 12
      }} />
      <View style={{ flex: 1 }}>
        <Text style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 2
        }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{
            color: '#cccccc',
            fontSize: 14
          }}>
            {props.text2}
          </Text>
        )}
      </View>
    </View>
  )
};

export const CustomToast = () => (
  <Toast 
    position='bottom'
    bottomOffset={60}
    config={toastConfig}
  />
);

// Helper functions for showing toasts
export const showSuccessToast = (title, message) => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message
  });
};

export const showErrorToast = (title, message) => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message
  });
};

export default CustomToast;
