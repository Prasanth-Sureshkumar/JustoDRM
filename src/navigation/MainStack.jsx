import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BookDetails from "../screens/IndividualBook";
import BookReader from "../screens/BookReader";
import AllBooksScreen from "../screens/AllBooksScreen";
import AllAudiosScreen from "../screens/AllAudiosScreen";
import { Image, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const { logout } = useAuth();
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          title: "Reading Room",
          headerStyle: {
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
            color: "#ffffff",
          },
          headerShadowVisible: true,
          headerRight: () => (
            <>
            <TouchableOpacity
              // onPress={() => navigation.navigate("Profile")}
              style={{ 
                marginRight: 15,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Image
                source={{ uri: "https://picsum.photos/200" }}
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 18,
                  borderWidth: 2,
                  borderColor: "#e2e8f0",
                }}
              />
            </TouchableOpacity>
              <TouchableOpacity
                onPress={logout} 
                style={{ 
                  marginRight: 15,
                  backgroundColor: "#010f29",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#334155",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={{ 
                  color: '#ffffff', 
                  fontSize: 14,
                  fontWeight: "500",
                }}>Logout</Text>
              </TouchableOpacity>
            </>
          ),
        })}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: "Profile",
          headerStyle: { 
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { 
            fontWeight: "600",
            color: "#ffffff",
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen 
        name="BookDetails" 
        component={BookDetails} 
        options={{
          title: "Book Details",
          headerStyle: { 
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { 
            fontWeight: "600",
            color: "#ffffff",
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen 
        name="BookReader" 
        component={BookReader} 
        options={{
          title: "Book Reader",
          headerStyle: { 
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { 
            fontWeight: "600",
            color: "#ffffff",
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen 
        name="AllBooks" 
        component={AllBooksScreen} 
        options={{
          title: "All Books",
          headerStyle: { 
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { 
            fontWeight: "600",
            color: "#ffffff",
          },
          headerShadowVisible: true,
        }}
      />
      <Stack.Screen 
        name="AllAudios" 
        component={AllAudiosScreen} 
        options={{
          title: "Audio Books",
          headerStyle: { 
            backgroundColor: "#1e293b",
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: { 
            fontWeight: "600",
            color: "#ffffff",
          },
          headerShadowVisible: true,
        }}
      />
    </Stack.Navigator>
  );
}
