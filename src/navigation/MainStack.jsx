import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import BookDetails from "../screens/IndividualBook";
import { Image, TouchableOpacity } from "react-native";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={({ navigation }) => ({
          title: "Home",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={{ marginRight: 15 }}
            >
              <Image
                source={{ uri: "https://picsum.photos/200" }}
                style={{ width: 32, height: 32, borderRadius: 16,  }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="BookDetails" component={BookDetails} options={{ title: "Book Details" }} />
    </Stack.Navigator>
  );
}
