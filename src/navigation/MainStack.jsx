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
          headerRight: () => (
            <>
            <TouchableOpacity
              // onPress={() => navigation.navigate("Profile")}
              style={{ marginRight: 15 }}
            >
              <Image
                source={{ uri: "https://picsum.photos/200" }}
                style={{ width: 40, height: 40, borderRadius: 25,  }}
              />
            </TouchableOpacity>
              <TouchableOpacity
                onPress={logout} 
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: 'blue', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            </>
          ),
        })}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="BookDetails" component={BookDetails} options={{ title: "Book Details" }} />
      <Stack.Screen name="BookReader" component={BookReader} options={{ title: "Book Reader" }} />
      <Stack.Screen name="AllBooks" component={AllBooksScreen} options={{ title: "All Books" }} />
      <Stack.Screen name="AllAudios" component={AllAudiosScreen} options={{ title: "Audio Books" }} />
    </Stack.Navigator>
  );
}
